
import { world, system, ItemStack } from "@minecraft/server"


const lores = {
	//"mnra_cata:": [""],

	//trinkets
	"mnra_cata:empty_ring": ["§r§6Trinket Slot:§e Ring", "§r§7Used to craft Trinkets"],
	"mnra_cata:stellar_ring": ["§r§6Trinket Slot:§e Ring", "§r§6Cooldown:§e 10s", "§r§7Chance to deal +5 Astral Bonus Damage"],
	"mnra_cata:floret_ring": ["§r§6Trinket Slot:§e Ring", "§r§6Cooldown:§e 10s", "§r§7Attacks poison mobs"],
	"mnra_cata:solar_ring": ["§r§6Trinket Slot:§e Ring", "§r§6Cooldown:§e 5s", "§r§7Attacks set mobs on fire"],
	"mnra_cata:verdant_ring": ["§r§6Trinket Slot:§e Ring", "§r§7+2 Projectile Damage Reduction"],
	"mnra_cata:twilight_ring": ["§r§6Trinket Slot:§e Ring", "§r§6Cooldown:§e 10s", "§r§7Attacks have a chance to summon a ", "§r§7Phantom Blade"],
	"mnra_cata:phantasma_ring": ["§r§6Trinket Slot:§e Ring", "§r§7deal +1 Terror Bonus Damage"],
	"mnra_cata:terror_ring": ["§r§6Trinket Slot:§e Ring", "§r§7Extra xp for each stage of Terror"],
	"mnra_cata:sun_ring": ["§r§6Trinket Slot:§e Ring", "§r§6Cooldown:§e 15s", "§r§7Attacks have a chance to ", "§r§7create a sun explosion dealing +20 damage"],
	"mnra_cata:ancient_ring": ["§r§6Trinket Slot:§e Ring", "§r§7Used to craft powerful Trinkets"],
	"mnra_cata:exodius_ring": ["§r§6Trinket Slot:§e Ring", "§r§7Chance to summon a elemental projectile", "§r§7+1.5 Elemental mob Damage Reduction"],

	"mnra_cata:starfall_necklace": ["§r§6Trinket Slot:§e Necklace", "§r§6Cooldown:§e 25s", "§r§7Summons stars from the sky when", "§r§7below half health"],
	"mnra_cata:stellar_necklace": ["§r§6Trinket Slot:§e Necklace", "§r§6Cooldown:§e 15s", "§r§7Grants Regneration II for 5s", "§r§7when below half health"],
	"mnra_cata:floret_necklace": ["§r§6Trinket Slot:§e Necklace", "§r§7Grants Immunity to Poison and Fatal Poison"],
	"mnra_cata:solar_necklace": ["§r§6Trinket Slot:§e Necklace", "§r§7Grants Fire Resistance in the Nether"],
	"mnra_cata:verdant_necklace": ["§r§6Trinket Slot:§e Necklace", "§r§7Grants Resistance II and Slowness II"],
	"mnra_cata:twilight_necklace": ["§r§6Trinket Slot:§e Necklace", "§r§7+1 Cosmic Spirit trade", "§6§8(Can stack with more players)"],
	"mnra_cata:phantasma_necklace": ["§r§6Trinket Slot:§e Necklace", "§r§7+1.5 Terror Chance Multiplier"],
	"mnra_cata:terror_necklace": ["§r§6Trinket Slot:§e Necklace", "§r§7Displays your Terror Stage at all times", "§6§8(might break with some items)"],
	"mnra_cata:sun_necklace": ["§r§6Trinket Slot:§e Ring", "§r§7Grants Health Boost During the day", "§r§7or grants Health Boost II and Resistance", "§r§7in the Nether"],

	"mnra_cata:stellar_charm": ["§r§6Trinket Slot:§e Charm", "§r§6Cooldown:§e 5", "§r§7Gain Regeneration for 5s when killing mobs"],
	"mnra_cata:floret_charm": ["§r§6Trinket Slot:§e Charm", "§r§6Cooldown:§e 15", "§r§7Poisons mobs for 8s in a 8x8 area", "§r§7when killing mobs"],
	"mnra_cata:solar_charm": ["§r§6Trinket Slot:§e Charm", "§r§6Cooldown:§e 25", "§r§7Creates a solar explosion when killing mobs"],

	"mnra_cata:sun_engine": ["§r§6Trinket Slot:§e Charm", "§r§7Burns any mob near the player", "§r§7when below 5 hearts"],
	"mnra_cata:astro_jelly_in_a_bottle": ["§r§6Trinket Slot:§e Charm", "§r§7Grants a double jump"],

	"mnra_cata:terror_eye": ["§r§6Trinket Slot:§e Charm", "§r§7Reduces Terror Chance by -0.8"],
	"mnra_cata:calibrated_stellar_core": ["§r§6Trinket Slot:§e Charm", "§r§6Cooldown:§e 5", "§r§7Gain Regeneration II when below 10 Hearts", "§r§7but gain weakness when above 10 hearts"],

	"mnra_cata:verdant_aegis": ["§r§6Trinket Slot:§e Back", "§r§6Cooldown:§e 35", "§r§7+1 Aegis Protection", "§r§7+1.5 Aegis Reflection"],
	"mnra_cata:celestial_aegis": ["§r§6Trinket Slot:§e Back", "§r§6Cooldown:§e 35", "§r§7+2.5 Aegis Protection", "§r§7+3 Aegis Reflection"],


	//items
	"mnra_cata:twinbound_mirror": ["", "§r§7On Interact:", "§r§8 Sneak to bind the mirror to a location, Interact to", "§r§8 teleport to that location, when teleported", "§r§8 the bind changes to your old location", "", "§r§7Requires +5 levels"],
	"mnra_cata:starbound_mirror": ["", "§r§7On Interact:", "§r§8 Sneak to bind the mirror to a location", "§r§8 Interact to Teleport to that location.", "", "§r§7Requires +3 levels"],
	"mnra_cata:cosmic_clock": ["", "§r§7On Interact:", "§r§8 Starts a StarFall event at night"],
	"mnra_cata:recall_mirror": ["", "§r§7On Interact:", "§r§8 Teleport to your set Spawn location", "", "§r§7Requires +1 levels"],
	"mnra_cata:sunflare_pickaxe": ["§r§cChampion Item"],
	"mnra_cata:trinket_bag": ["", "§r§7On Interact:", "§r§8 Opens the Trinket menu"],
	"mnra_cata:terror_guide": ["", "§r§bTerror System Guide", "§r§7 Killing elemental mobs can increase Terror.", "§r§7 Mobs do +1 Damage for each stage. Going Passed", "§r§7 stage 5 will attract unwanted attention and reset.", "§r§a There are ways to remove or control Terror.", "", "§r§cHave Fun!"],

	//spears
	"mnra_cata:twilight_spear": ["", "§r§7On Swing:", "§r§8 Pulls the player backwards", "§r§7On Interact:", "§r§8 Pulls the player forwards"],
	"mnra_cata:exodius_spear": ["", "§r§7On Swing:", "§r§8 Summons Elemental projectiles", "§r§7On Interact:", "§r§8 Pulls the player backwards"],
	"mnra_cata:sunflare_glaive": ["", "§r§7On Interact:", "§r§8 Summons Solar Pillars from the ground"],

	//blaster
	"mnra_cata:terror_skull_launcher": ["", "§r§9+25 Projectile Damage"],
	"mnra_cata:ray_gun": ["", "§r§9+10 Projectile Damage", "", "§r§7On Interact:", "§r§8 Chance to overload when shooting"],
	"mnra_cata:spore_thrower": ["", "§r§9+14 Projectile Damage"],

	//blocks
	"mnra_cata:sealed_heart": ["§r§8Place in the center of a Ancient Alter", "§r§8Right Click to summon the Sun God"],

	//weapons
	"mnra_cata:star_fallen": ["", "§r§7On Interact:", "§r§8 Star Dash for 1 seconds, creates a explosion", "§r§8 when dashing into blocks with a Elytra"],
	"mnra_cata:moonsickle": ["", "§r§7On Hurt Mob:", "§r§8 Pull Mobs to the player"],
	"mnra_cata:star_sword": ["", "§r§7On Hurt Mob:", "§r§8 Rains Starfall"],
	"mnra_cata:sun_striker_claymore": ["", "§r§7On Hurt Mob:", "§r§8 Deal a solar burst dealing +15 Damage"],
	"mnra_cata:twilight_edge": ["", "§r§7On Hurt Mob:", "§r§8 Summons 3 Twilight Edge Phantoms"],
	"mnra_cata:morningstar": ["", "§r§7On Hurt Mob:", "§r§8 Deal a solar burst dealing +10 Damage"],
	"mnra_cata:floret_hatchet": ["", "§r§7On Hurt Mob:", "§r§8 Stun mobs and deal poison aoe Damage "],
	"mnra_cata:everbloom": ["", "§r§7On Hurt Mob:", "§r§8 Summons Feral Fangs on mobs", "§r§7On Hit Block:", "§r§8 Summons Feral Fangs from the ground", "§r§8 when sneaking"],
	"mnra_cata:phoenix_blade": ["", "§r§7On Swing:", "§r§8 Summons a Phantom Blade", "§r§7On Interact:", "§r§8 Summons 3 Phantom Blades", "§r§cChampion Item"],
	"mnra_cata:moonlight": ["", "§r§7On Interact:", "§r§8 Summon a Phantom Blade ", "", "§r§7Sneak + Interact to summon §eSunlight"],
	"mnra_cata:sunlight": ["", "§r§7On Interact:", "§r§8 Summons a Sun Orb. Breaking the orb will deal", "§r§8 Area Damage to all mobs", "", "§r§7Sneak + Interact to summon §bMoonlight"],
	"mnra_cata:verdant_blade": ["", "§r§7On Hurt Mob:", "§r§8 Deals extra Damage, slowness and weakness", "§r§cChampion Item"],
	"mnra_cata:stellar_mace": ["", "§r§7On Hurt Mob:", "§r§8 Attacking when on cooldown gives Weakness"],
	"mnra_cata:blazing_excalibur": ["", "§r§7On Interact:", "§r§8 Set your heart ablaze, Deal +14 Damage", "§r§8 while being scorched"],
	"mnra_cata:platinum_halberd": ["§r§9+4 Attack Damage to Elemental Mobs"],
	"mnra_cata:platinum_sword": ["§r§9+4 Attack Damage to Elemental Mobs"],
	"mnra_cata:star_fracture": ["§7A blade forged from fallen stars", "", "§r§7Star Rage:", "§r§8 Gain +1 Star Rage every 4 seconds when held", "§r§8 -1 Star Rage when hurt", "§r§8 +2 Star Rage when killing a mob ", "§r§7On Interact With Full Meter:", "§r§8 Activates a Stage Rage, attacks", "§r§8 deal +8 damage for 10 seconds"],

	//greatsword
	"mnra_cata:wooden_greatsword": ["§r§9+2 Bonus Damage",],
	"mnra_cata:stone_greatsword": ["§r§9+2 Bonus Damage",],
	"mnra_cata:iron_greatsword": ["§r§9+2 Bonus Damage",],
	"mnra_cata:diamond_greatsword": ["§r§9+2 Bonus Damage",],
	"mnra_cata:netherite_greatsword": ["§r§9+2 Bonus Damage",],
	"mnra_cata:gold_greatsword": ["§r§9+2 Bonus Damage",],
	"mnra_cata:copper_greatsword": ["§r§9+2 Bonus Damage",],
	"mnra_cata:platinum_greatsword": ["§r§9+2 Bonus Damage", "§r§9+4 Attack Damage to Elemental Mobs"],
	"mnra_cata:phantasma_greatsword": ["", "§r§7On Hurt Mob:", "§r§8 Scales Damage for each stage of Terror", "",],
	"mnra_cata:stellar_greatsword": ["§r§9+4 Astral Bonus Damage"],
	"mnra_cata:exodius_greatsword": ["", "§r§7On Swing:", "§r§8 Summons 3 Elemental projectiles"],
	"mnra_cata:ecliptic_greatsword": ["", "§r§7On Kill Mob:", "§r§8 Life Steals 4 hearts", "§r§7On Interact:", "§r§8 Life steal half health from yourself", "§r§8 to deal +8 Damage for 10 seconds"],

	//armor
	"mnra_cata:stellar_helmet": ["§r§9+1 Armor Toughness", "", "§r§7Full Set Bonus:", "§r§8 Grants 2 extra Hearts "],
	"mnra_cata:stellar_chestplate": ["§r§9+1 Armor Toughness", "", "§r§7Full Set Bonus:", "§r§8 Grants 2 extra Hearts "],
	"mnra_cata:stellar_leggings": ["§r§9+1 Armor Toughness", "", "§r§7Full Set Bonus:", "§r§8 Grants 2 extra Hearts "],
	"mnra_cata:stellar_boots": ["§r§9+1 Armor Toughness", "", "§r§7Full Set Bonus:", "§r§8 Grants 2 extra Hearts "],

	"mnra_cata:terrabloom_helmet": ["§r§9+3 Armor Toughness", "§r§9+1 Knockback Resistance", "§r§9+1 Debuff Immunity", "§r§7Full Set Bonus:", "§r§8 Built-in Thorns that stun mobs", "§r§8 Grants Regen to nearby Players"],
	"mnra_cata:terrabloom_chestplate": ["§r§9+3 Armor Toughness", "§r§9+1 Knockback Resistance", "§r§9+1 Debuff Immunity", "§r§7Full Set Bonus:", "§r§8 Built-in Thorns that stun mobs", "§r§8 Grants Regen to nearby Players"],
	"mnra_cata:terrabloom_leggings": ["§r§9+3 Armor Toughness", "§r§9+1 Knockback Resistance", "§r§9+1 Debuff Immunity", "§r§7Full Set Bonus:", "§r§8 Built-in Thorns that stun mobs", "§r§8 Grants Regen to nearby Players"],
	"mnra_cata:terrabloom_boots": ["§r§9+3 Armor Toughness", "§r§9+1 Knockback Resistance", "§r§9+1 Debuff Immunity", "§r§7Full Set Bonus:", "§r§8 Built-in Thorns that stun mobs", "§r§8 Grants Regen to nearby Players"],

	"mnra_cata:infernum_helmet": ["§r§9+5 Armor Toughness", "§r§9+1 Knockback Resistance", "§r§9+1 Solar Ignition", "", "§r§7Full Set Bonus:", "§r§8 Grants Strength, Fire Resistance and burns", "§r§8 nearby mobs when below 10 hearts"],
	"mnra_cata:infernum_chestplate": ["§r§9+5 Armor Toughness", "§r§9+1 Knockback Resistance", "§r§9+1 Solar Ignition", "", "§r§7Full Set Bonus:", "§r§8 Grants Strength, Fire Resistance and burns", "§r§8 nearby mobs when below 10 hearts"],
	"mnra_cata:infernum_leggings": ["§r§9+5 Armor Toughness", "§r§9+1 Knockback Resistance", "§r§9+1 Solar Ignition", "", "§r§7Full Set Bonus:", "§r§8 Grants Strength, Fire Resistance and burns", "§r§8 nearby mobs when below 10 hearts"],
	"mnra_cata:infernum_boots": ["§r§9+5 Armor Toughness", "§r§9+1 Knockback Resistance", "§r§9+1 Solar Ignition", "", "§r§7Full Set Bonus:", "§r§8 Grants Strength, Fire Resistance and burns", "§r§8 nearby mobs when below 10 hearts"],

	"mnra_cata:exodius_helmet": ["§r§9+3 Armor Toughness", "§r§9+1 Knockback Resistance", "", "§r§7Full Set Bonus:", "§r§8 Summons a burst of Elements ", "§r§8 when below 10 Health"],
	"mnra_cata:exodius_chestplate": ["§r§9+3 Armor Toughness", "§r§9+1 Knockback Resistance", "", "§r§7Full Set Bonus:", "§r§8 Summons a burst of Elements ", "§r§8 when below 10 Health"],
	"mnra_cata:exodius_leggings": ["§r§9+3 Armor Toughness", "§r§9+1 Knockback Resistance", "", "§r§7Full Set Bonus:", "§r§8 Summons a burst of Elements ", "§r§8 when below 10 Health"],
	"mnra_cata:exodius_boots": ["§r§9+3 Armor Toughness", "§r§9+1 Knockback Resistance", "", "§r§7Full Set Bonus:", "§r§8 Summons a burst of Elements ", "§r§8 when below 10 Health"],

	"mnra_cata:verdant_helmet": ["", "§r§7Set Bonus:", "§r§8 Removes all poisonous effects"],

	//flawless weapons
	"mnra_cata:verdant_greatsword": ["§r§7Holds the soul of the Verdant Sentinel", "", "§r§7On Hurt Mob:", "§r§8 Summons a max of 2 Verdant Sentinel fist", "§r§cFlawless Item"],
	"mnra_cata:divine_scythe_of_heaven": ["§r§eScythe from the Heavens", "", "§r§7On Interact:", "§r§8 Summons a Sun Totem burning every", "§r§8 mob in a 8x8 area", "§r§cFlawless Item"],

	//Community and Dev weapons
	"mnra_cata:anchor": ["§r§7Shroomy's Pride and Joy", "", "§r§7On Hurt Mob:", "§r§8 Pulls mobs to the player", "§r§eCommunity Item"],
	"mnra_cata:meowclysm": ["§r§7Greatest weapon of all time", "", "§r§7On Swing:", "§r§8 Makes cat noises!", "§r§7On Kill Mob:", "§r§8 Turns the mob into a cat", "§r§dDeveloper Item"],
};

system.runInterval(() => {
	for (const player of world.getPlayers()) {
		const playerInv = player.getComponent("inventory").container;
		const items = Array.from({ length: playerInv.size })
			.map((_, i) => playerInv.getItem(i));
		items.forEach((item, slot) => {
			if (item?.typeId in lores) {
				if (item.getLore() == "") {
					const lore = lores[item.typeId]
						.map(line => typeof line === 'function' ? line(player) : line);
					item.setLore(lore);
					playerInv.setItem(slot, item);
				}
			}
		})
	}
}, 1);

world.afterEvents.playerSpawn.subscribe((event => {
	const player = event.player
	if (!player.hasTag('Spawn_item')) {
		const inventory = player.getComponent("minecraft:inventory")

		let TerrorDetector = new ItemStack("mnra_cata:terror_detector")
		TerrorDetector.keepOnDeath = true

		let Meowclysm = new ItemStack("mnra_cata:meowclysm")
		Meowclysm.keepOnDeath = true

		let Anchor = new ItemStack("mnra_cata:anchor")

		let GoldBlock = new ItemStack("minecraft:gold_block")

		//spawn items
		inventory.container.addItem(TerrorDetector)

		if (player.nameTag === ('HappyDreamXD')) {
			inventory.container.addItem(Meowclysm,)
		}
		if (player.nameTag === ('vantizx')) {
			inventory.container.addItem(Anchor)
		}
		if (player.nameTag === ('Nightrider4387')) {
			inventory.container.addItem(GoldBlock)
		}
		player.addTag('Spawn_item')
	}
}))
