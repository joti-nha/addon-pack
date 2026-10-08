import
{
	ItemStack, MolangVariableMap
}
from "@minecraft/server";

import * as server from "@minecraft/server"

import
{
	weaponStats, DEFAULT_PARTICLE_COLORS, damageChainValues, achievements,
	raritiesColor
}
from "./vgConstants";

export function damageItem(player, damage, slot)
{
	const fakeSwing = Math.floor(Math.random() * 100)
	const equipment = player.getComponent('equippable');
	const item = equipment.getEquipment(slot);
	const durability = item.getComponent('durability')
	const enchant = item?.getComponent("minecraft:enchantable");
	const air = new ItemStack('minecraft:air', 1)
	const level = enchant?.getEnchantment("unbreaking")?.level ?? 0;
	if (item && durability)
	{
		item.setDynamicProperty('rev:swing', fakeSwing)

		if ((durability.maxDurability - durability.damage - damage) <= 0)
		{
			equipment.setEquipment(slot,air);
			player.playSound('random.break')
		}

		if (item && level == 0)
		{
			durability.damage += damage;
			equipment.setEquipment(slot, item);
		}

		if (item && level > 0)
		{
			const rng = Math.floor(Math.random() * 5)
			durability.damage += rng <= level ? 0 : 1;
			equipment.setEquipment(slot, item);
		}
	}

}

export function sendTip(player, message, tag)
{
	if (!player.hasTag(tag))
	{	
		player.addTag(tag);
		const delay = 40 + Math.floor(Math.random() * 40);
		server.system.runTimeout(() =>
		{
			player.playSound('random.orb',{pitch:0.7});
			player.sendMessage({translate: message});
		}, delay);
		
	}
}

function isDualWielding(player)
{
	const equippable = player.getComponent('minecraft:equippable');
	const mainhand = equippable.getEquipment('Mainhand');
	const offhand = equippable.getEquipment('Offhand');

	if (offhand == undefined || mainhand == undefined) return false;
	if (offhand.hasTag('rev:improvised_gun') && mainhand.hasTag('rev:improvised_gun')) return true;
}

let isPar = 0;

export function spParCol(location, dimension, player = null, projectileId = "rev:auto_gun_bullet") {
    try {
		
        const varMap = new MolangVariableMap();
        
        const defaultColor = DEFAULT_PARTICLE_COLORS[projectileId] || { red: 255, green: 255, blue: 255 };
        
        let r = defaultColor.red;
        let g = defaultColor.green;
        let b = defaultColor.blue;

		let hasCustomColors = false;

        if (player) {
            r = player.getDynamicProperty(`rev:color_${projectileId}_r`) ?? r;
            g = player.getDynamicProperty(`rev:color_${projectileId}_g`) ?? g;
            b = player.getDynamicProperty(`rev:color_${projectileId}_b`) ?? b;
			
			hasCustomColors = (
				player.getDynamicProperty(`rev:color_${projectileId}_r`) != undefined &&
				player.getDynamicProperty(`rev:color_${projectileId}_g`) != undefined &&
				player.getDynamicProperty(`rev:color_${projectileId}_b`) != undefined
			)
        }
        varMap.setColorRGB("variable.guncolor", {
            red: r / 255,
            green: g / 255,
            blue: b / 255
        });

		const fancy = player.getDynamicProperty('rev:do_fast_particles')??true;
		
        const chainData = damageChainValues.find(d => d.id === projectileId);
        let particleId = "rev:custom_gun";
		if (!hasCustomColors) particleId = chainData.particle;
		if (!fancy)
		dimension.spawnParticle(particleId+'_fast', location, varMap);
		else
		dimension.spawnParticle(particleId, location, varMap);
        

    } catch (ex) {
        
    }
}

export function completeAchievement(player, id)
{	
	const current = player.getDynamicProperty(id);
	const achData = achievements.find(ach => ach.id == id);
	if (current == undefined)
	{
		player.setDynamicProperty(id,true);
		if (achData.rarity == 'epic')
			player.playSound('random.levelup',{pitch:0.7});
		else
			player.playSound('random.levelup',{pitch:0.9});
		
		server.world.sendMessage({ rawtext: [{ text:player.nameTag}, {translate:'rev.ui.achievement.hasma.name'},{text:'§'},{text:raritiesColor[achData.rarity][0]},{text:' ['},{translate:achData.name},{text:']'}]})
		player.sendMessage({rawtext:[{text:'§7 - '},{translate:achData.description}]});
		player.addLevels(raritiesColor[achData.rarity][1])
	}
}


export function shootProjectile(playerData, item, multishotBonus = 0, potionEffect = [null, 0, 0])
{
	let gunStats = weaponStats.find(e => e.id == item.typeId);
	if (gunStats == undefined)
	{
		gunStats = weaponStats.find(e => e.id == (item.typeId).replace("rev:shadow_", "rev:"));
		if (gunStats == undefined) return;
	}

	const power = gunStats.power;
	const projectile = gunStats.projectile;
	let bloom = gunStats.bloom * (isDualWielding(playerData) ? 2 : 1);
	if (playerData.isJumping) bloom += 0.1;
	if (playerData.isGliding) bloom += 0.1;
	if (!playerData.isSprinting) bloom *= 0.7;
	if ((Math.abs(playerData.getVelocity().x) + Math.abs(playerData.getVelocity().z)) < 0.04) bloom *= 0.6;
	const sound = gunStats.sound;
	const shake = gunStats.shake * (isDualWielding(playerData) ? 1.5 : 1);
	const burst = gunStats.burst;
	const burstSpeed = gunStats.burst_speed;
	const enchanting = item.getComponent('minecraft:enchantable');

	const ePower = getEnchantment(enchanting, "power");
	const eFlame = getEnchantment(enchanting, "flame");
	const ePunch = getEnchantment(enchanting, "punch");
	const levelPiercing = getEnchantment(enchanting, "piercing");

	if (playerData.getDynamicProperty("rev:do_disable_camerashake") !== false)
	{
		playerData.runCommand(`camerashake add @s ${shake} ${shake}`);
	}

	const isArrow = (projectile === "rev:fake_arrow");
	if (gunStats.projectile != "rev:auto_gun_bullet" && gunStats.projectile != "rev:despoiler_bullet" && !isArrow) playSoundAt(playerData, sound);
	let bCount = 1;
	do
	{
		server.system.runTimeout(() =>
		{
			const projectileToShoot = playerData.dimension.spawnEntity(projectile,
			{
				x: playerData.location.x + (playerData.getViewDirection().x * (isArrow ? 2 : 1)),
				y: playerData.location.y + 1.5 + (playerData.getViewDirection().y * (isArrow ? 2 : 1)),
				z: playerData.location.z + (playerData.getViewDirection().z * (isArrow ? 2 : 1))
			})

			if (isDualWielding(playerData)) projectileToShoot.setDynamicProperty('rev:from_dual', true);
			const projectileComp = projectileToShoot.getComponent("minecraft:projectile");
			projectileComp.owner = playerData;

			projectileToShoot.setDynamicProperty('rev:vg_power', ePower);
			projectileToShoot.setDynamicProperty('rev:vg_flame', eFlame);
			projectileToShoot.setDynamicProperty('rev:vg_punch', ePunch);

			if (isArrow)
			{
				projectileToShoot.setDynamicProperty('rev:piercing', levelPiercing || multishotBonus);
				projectileToShoot.setDynamicProperty('rev:arrow_counter', 0);
				projectileToShoot.setDynamicProperty('rev:potion_effect', potionEffect[0]);
				projectileToShoot.setDynamicProperty('rev:potion_duration', potionEffect[1]);
				projectileToShoot.setDynamicProperty('rev:potion_amplifier', potionEffect[2]);
			}

			if (gunStats.projectile == "rev:auto_gun_bullet" || gunStats.projectile == "rev:despoiler_bullet" || gunStats.projectile == "rev:fake_arrow") playSoundAt(playerData, sound);
			
			const viewDir = playerData.getViewDirection();
			let shootDir = { x: viewDir.x, y: viewDir.y, z: viewDir.z };

			if (multishotBonus !== 0)
			{
				if ((viewDir.x > 0 && viewDir.z > 0) || (viewDir.x < 0 && viewDir.z < 0))
				{
					shootDir.x -= multishotBonus;
					shootDir.z += multishotBonus;
				}
				else
				{
					shootDir.x += multishotBonus;
					shootDir.z += multishotBonus;
				}
			}
			spParCol(projectileToShoot.location, playerData.dimension, playerData, projectileToShoot.typeId)
			projectileComp.shoot(
			{
				x: shootDir.x * power,
				y: shootDir.y * power,
				z: shootDir.z * power
			},
			{
				uncertainty: bloom
			});


		}, (bCount - 1) * burstSpeed);

		bCount++;
	}
	while (bCount <= burst);
}

function playSoundAt(player, sound)
{
	player.dimension.playSound(sound, player.location,
	{
		pitch: 0.9 + (Math.random() / 2)
	})
}

export function getEnchantment(comp, enchant)
{
	if (comp == undefined) return 0;
	const val = comp.getEnchantment(enchant);
	if (val == undefined) return 0;
	else return val.level;
}



export function enchantRemover(playerData, heldItem, enchantment)
{
	const inventory = playerData?.getComponent('inventory').container
	if (heldItem === undefined) return;
	if (heldItem.getComponent('enchantable') === undefined) return;
	if (heldItem.getComponent("enchantable").hasEnchantment(enchantment))
	{
		heldItem.getComponent("enchantable").removeEnchantment(enchantment);
		inventory.setItem(playerData.selectedSlotIndex, heldItem);
		playerData.sendMessage("§eThis item cannot be enchanted with " + (formatString(enchantment)))
	}

}

export function formatString(input)
{
	let parts = input.split(":");
	if (parts.length > 1)
	{
		input = parts[1];
	}
	input = input.replace(/_/g, " ");
	let words = input.split(" ").filter(word => !/\d/.test(word));
	input = words.map(word =>
	{
		return word.charAt(0).toUpperCase() + word.slice(1);
	}).join(" ");
	return input;
}

export function itemReplace(playerData, heldItem, targetItem, slot)
{	

	try
	{
		if (heldItem.typeId == targetItem) return;
		const equippable = playerData.getComponent('equippable');
		const enchantArray = heldItem.getComponent("enchantable").getEnchantments();
		const itemReplacement = new ItemStack(targetItem)
		const dynamicProperties = heldItem.getDynamicPropertyIds()
		itemReplacement.getComponent("enchantable").addEnchantments(enchantArray);
		itemReplacement.getComponent('durability').damage = heldItem.getComponent("durability").damage;
		itemReplacement.nameTag = heldItem.nameTag
		itemReplacement.setLore(heldItem.getLore())
		for (let i = 0; i < dynamicProperties.length; i++)
		{
			const currentPropertyValue = heldItem.getDynamicProperty(dynamicProperties[i])
			itemReplacement.setDynamicProperty(dynamicProperties[i], currentPropertyValue)
		}
		equippable.setEquipment(slot,itemReplacement)
	}
	catch (ex)
	{}
}