
import { world, system, ItemStack } from "@minecraft/server"


const lores = {
	//"mnra_cata:": [""],

	//trinkets
	"mnra_cata:empty_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§7Usado para fabricar Bugigangas"],
	"mnra_cata:stellar_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§6Recarga:§e 10 s", "§r§7Chance de causar +5 de Dano Astral Bônus"],
	"mnra_cata:floret_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§6Recarga:§e 10 s", "§r§7Ataques envenenam as criaturas"],
	"mnra_cata:solar_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§6Recarga:§e 5 s", "§r§7Ataques incendeiam as criaturas"],
	"mnra_cata:verdant_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§7+2 de Redução de Dano de Projéteis"],
	"mnra_cata:twilight_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§6Recarga:§e 10 s", "§r§7Ataques têm chance de invocar uma ", "§r§7Lâmina Fantasma"],
	"mnra_cata:phantasma_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§7causa +1 de Dano de Terror Bônus"],
	"mnra_cata:terror_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§7XP extra para cada estágio de Terror"],
	"mnra_cata:sun_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§6Recarga:§e 15 s", "§r§7Ataques têm chance de ", "§r§7criar uma explosão solar que causa +20 de dano"],
	"mnra_cata:ancient_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§7Usado para fabricar Bugigangas poderosas"],
	"mnra_cata:exodius_ring": ["§r§6Espaço de Bugiganga:§e Anel", "§r§7Chance de invocar um projétil elemental", "§r§7+1,5 de Redução de Dano de criaturas elementais"],

	"mnra_cata:starfall_necklace": ["§r§6Espaço de Bugiganga:§e Colar", "§r§6Recarga:§e 25 s", "§r§7Invoca estrelas do céu quando está", "§r§7abaixo da metade da vida"],
	"mnra_cata:stellar_necklace": ["§r§6Espaço de Bugiganga:§e Colar", "§r§6Recarga:§e 15 s", "§r§7Concede Regeneração II por 5 s", "§r§7quando abaixo da metade da vida"],
	"mnra_cata:floret_necklace": ["§r§6Espaço de Bugiganga:§e Colar", "§r§7Concede imunidade a Veneno e Veneno Fatal"],
	"mnra_cata:solar_necklace": ["§r§6Espaço de Bugiganga:§e Colar", "§r§7Concede Resistência ao Fogo no Nether"],
	"mnra_cata:verdant_necklace": ["§r§6Espaço de Bugiganga:§e Colar", "§r§7Concede Resistência II e Lentidão II"],
	"mnra_cata:twilight_necklace": ["§r§6Espaço de Bugiganga:§e Colar", "§r§7+1 troca com o Espírito Cósmico", "§6§8(Acumula com mais jogadores)"],
	"mnra_cata:phantasma_necklace": ["§r§6Espaço de Bugiganga:§e Colar", "§r§7+1,5 no Multiplicador de Chance de Terror"],
	"mnra_cata:terror_necklace": ["§r§6Espaço de Bugiganga:§e Colar", "§r§7Mostra seu Estágio de Terror o tempo todo", "§6§8(pode falhar com alguns itens)"],
	"mnra_cata:sun_necklace": ["§r§6Espaço de Bugiganga:§e Anel", "§r§7Concede Vida Extra durante o dia", "§r§7ou concede Vida Extra II e Resistência", "§r§7no Nether"],

	"mnra_cata:stellar_charm": ["§r§6Espaço de Bugiganga:§e Amuleto", "§r§6Recarga:§e 5", "§r§7Ganha Regeneração por 5 s ao matar criaturas"],
	"mnra_cata:floret_charm": ["§r§6Espaço de Bugiganga:§e Amuleto", "§r§6Recarga:§e 15", "§r§7Envenena criaturas por 8 s numa área de 8x8", "§r§7ao matar criaturas"],
	"mnra_cata:solar_charm": ["§r§6Espaço de Bugiganga:§e Amuleto", "§r§6Recarga:§e 25", "§r§7Cria uma explosão solar ao matar criaturas"],

	"mnra_cata:sun_engine": ["§r§6Espaço de Bugiganga:§e Amuleto", "§r§7Queima qualquer criatura perto do jogador", "§r§7quando abaixo de 5 corações"],
	"mnra_cata:astro_jelly_in_a_bottle": ["§r§6Espaço de Bugiganga:§e Amuleto", "§r§7Concede um pulo duplo"],

	"mnra_cata:terror_eye": ["§r§6Espaço de Bugiganga:§e Amuleto", "§r§7Reduz a Chance de Terror em 0,8"],
	"mnra_cata:calibrated_stellar_core": ["§r§6Espaço de Bugiganga:§e Amuleto", "§r§6Recarga:§e 5", "§r§7Ganha Regeneração II abaixo de 10 corações,", "§r§7mas ganha Fraqueza acima de 10 corações"],

	"mnra_cata:verdant_aegis": ["§r§6Espaço de Bugiganga:§e Costas", "§r§6Recarga:§e 35", "§r§7+1,5 de Proteção da Égide", "§r§7+1,5 de Reflexão da Égide"],
	"mnra_cata:celestial_aegis": ["§r§6Espaço de Bugiganga:§e Costas", "§r§6Recarga:§e 35", "§r§7+2,5 de Proteção da Égide", "§r§7+3 de Reflexão da Égide"],


	//items
	"mnra_cata:twinbound_mirror": ["", "§r§7Ao Interagir:", "§r§8 Agache para vincular o espelho a um local; interaja para", "§r§8 se teletransportar até lá. Ao se teletransportar,", "§r§8 o vínculo passa para o local onde você estava", "", "§r§7Exige 5 níveis"],
	"mnra_cata:starbound_mirror": ["", "§r§7Ao Interagir:", "§r§8 Agache para vincular o espelho a um local", "§r§8 Interaja para se teletransportar até lá.", "", "§r§7Exige 3 níveis"],
	"mnra_cata:cosmic_clock": ["", "§r§7Ao Interagir:", "§r§8 Inicia uma Chuva de Estrelas à noite"],
	"mnra_cata:recall_mirror": ["", "§r§7Ao Interagir:", "§r§8 Teletransporta até seu ponto de renascimento", "", "§r§7Exige 1 nível"],
	"mnra_cata:sunflare_pickaxe": ["§r§cItem de Campeão"],
	"mnra_cata:trinket_bag": ["", "§r§7Ao Interagir:", "§r§8 Abre o menu de Bugigangas"],
	"mnra_cata:terror_guide": ["", "§r§bGuia do Sistema de Terror", "§r§7 Matar criaturas elementais pode aumentar o Terror.", "§r§7 As criaturas causam +1 de dano por estágio. Passar do", "§r§7 estágio 5 atrai atenção indesejada e zera o Terror.", "§r§a Existem formas de remover ou controlar o Terror.", "", "§r§cDivirta-se!"],

	//spears
	"mnra_cata:twilight_spear": ["", "§r§7Ao Golpear:", "§r§8 Puxa o jogador para trás", "§r§7Ao Interagir:", "§r§8 Puxa o jogador para a frente"],
	"mnra_cata:exodius_spear": ["", "§r§7Ao Golpear:", "§r§8 Invoca projéteis elementais", "§r§7Ao Interagir:", "§r§8 Puxa o jogador para trás"],
	"mnra_cata:sunflare_glaive": ["", "§r§7Ao Interagir:", "§r§8 Invoca Pilares Solares do chão"],

	//blaster
	"mnra_cata:terror_skull_launcher": ["", "§r§9+25 de Dano de Projétil"],
	"mnra_cata:ray_gun": ["", "§r§9+10 de Dano de Projétil", "", "§r§7Ao Interagir:", "§r§8 Chance de sobrecarregar ao atirar"],
	"mnra_cata:spore_thrower": ["", "§r§9+14 de Dano de Projétil"],

	//blocks
	"mnra_cata:sealed_heart": ["§r§8Coloque no centro de um Altar Ancestral", "§r§8Use para invocar o Deus Sol"],

	//weapons
	"mnra_cata:star_fallen": ["", "§r§7Ao Interagir:", "§r§8 Investida Estelar por 1 segundo; cria uma explosão", "§r§8 ao colidir com blocos usando Élitros"],
	"mnra_cata:moonsickle": ["", "§r§7Ao Ferir Criatura:", "§r§8 Puxa as criaturas até o jogador"],
	"mnra_cata:star_sword": ["", "§r§7Ao Ferir Criatura:", "§r§8 Faz chover estrelas"],
	"mnra_cata:sun_striker_claymore": ["", "§r§7Ao Ferir Criatura:", "§r§8 Solta uma rajada solar que causa +15 de dano"],
	"mnra_cata:twilight_edge": ["", "§r§7Ao Ferir Criatura:", "§r§8 Invoca 3 Fantasmas do Gume do Crepúsculo"],
	"mnra_cata:morningstar": ["", "§r§7Ao Ferir Criatura:", "§r§8 Solta uma rajada solar que causa +10 de dano"],
	"mnra_cata:floret_hatchet": ["", "§r§7Ao Ferir Criatura:", "§r§8 Atordoa as criaturas e causa dano de veneno em área "],
	"mnra_cata:everbloom": ["", "§r§7Ao Ferir Criatura:", "§r§8 Invoca Presas Selvagens nas criaturas", "§r§7Ao Acertar Bloco:", "§r§8 Invoca Presas Selvagens do chão", "§r§8 quando agachado"],
	"mnra_cata:phoenix_blade": ["", "§r§7Ao Golpear:", "§r§8 Invoca uma Lâmina Fantasma", "§r§7Ao Interagir:", "§r§8 Invoca 3 Lâminas Fantasmas", "§r§cItem de Campeão"],
	"mnra_cata:moonlight": ["", "§r§7Ao Interagir:", "§r§8 Invoca uma Lâmina Fantasma ", "", "§r§7Agachar + Interagir invoca a §eLuz do Sol"],
	"mnra_cata:sunlight": ["", "§r§7Ao Interagir:", "§r§8 Invoca um Orbe Solar. Quebrar o orbe causa", "§r§8 dano em área a todas as criaturas", "", "§r§7Agachar + Interagir invoca a §bLuz da Lua"],
	"mnra_cata:verdant_blade": ["", "§r§7Ao Ferir Criatura:", "§r§8 Causa dano extra, Lentidão e Fraqueza", "§r§cItem de Campeão"],
	"mnra_cata:stellar_mace": ["", "§r§7Ao Ferir Criatura:", "§r§8 Atacar durante a recarga dá Fraqueza"],
	"mnra_cata:blazing_excalibur": ["", "§r§7Ao Interagir:", "§r§8 Incendeia seu coração: causa +14 de dano", "§r§8 enquanto você queima"],
	"mnra_cata:platinum_halberd": ["§r§9+4 de Dano de Ataque contra Criaturas Elementais"],
	"mnra_cata:platinum_sword": ["§r§9+4 de Dano de Ataque contra Criaturas Elementais"],
	"mnra_cata:star_fracture": ["§7Uma lâmina forjada com estrelas cadentes", "", "§r§7Fúria Estelar:", "§r§8 Ganha +1 de Fúria Estelar a cada 4 segundos na mão", "§r§8 -1 de Fúria Estelar ao sofrer dano", "§r§8 +2 de Fúria Estelar ao matar uma criatura ", "§r§7Ao Interagir com o Medidor Cheio:", "§r§8 Ativa a Fúria Estelar: os ataques", "§r§8 causam +8 de dano por 10 segundos"],

	//greatsword
	"mnra_cata:wooden_greatsword": ["§r§9+2 de Dano Bônus",],
	"mnra_cata:stone_greatsword": ["§r§9+2 de Dano Bônus",],
	"mnra_cata:iron_greatsword": ["§r§9+2 de Dano Bônus",],
	"mnra_cata:diamond_greatsword": ["§r§9+2 de Dano Bônus",],
	"mnra_cata:netherite_greatsword": ["§r§9+2 de Dano Bônus",],
	"mnra_cata:gold_greatsword": ["§r§9+2 de Dano Bônus",],
	"mnra_cata:copper_greatsword": ["§r§9+2 de Dano Bônus",],
	"mnra_cata:platinum_greatsword": ["§r§9+2 de Dano Bônus", "§r§9+4 de Dano de Ataque contra Criaturas Elementais"],
	"mnra_cata:phantasma_greatsword": ["", "§r§7Ao Ferir Criatura:", "§r§8 O dano aumenta com cada estágio de Terror", "",],
	"mnra_cata:stellar_greatsword": ["§r§9+4 de Dano Astral Bônus"],
	"mnra_cata:exodius_greatsword": ["", "§r§7Ao Golpear:", "§r§8 Invoca 3 projéteis elementais"],
	"mnra_cata:ecliptic_greatsword": ["", "§r§7Ao Matar Criatura:", "§r§8 Rouba 4 corações de vida", "§r§7Ao Interagir:", "§r§8 Drena metade da sua própria vida", "§r§8 para causar +8 de dano por 10 segundos"],

	//armor
	"mnra_cata:stellar_helmet": ["§r§9+1 de Resistência da Armadura", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Concede 2 corações extras "],
	"mnra_cata:stellar_chestplate": ["§r§9+1 de Resistência da Armadura", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Concede 2 corações extras "],
	"mnra_cata:stellar_leggings": ["§r§9+1 de Resistência da Armadura", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Concede 2 corações extras "],
	"mnra_cata:stellar_boots": ["§r§9+1 de Resistência da Armadura", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Concede 2 corações extras "],

	"mnra_cata:terrabloom_helmet": ["§r§9+3 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "§r§9+1 de Imunidade a Efeitos Negativos", "§r§7Bônus do Conjunto Completo:", "§r§8 Espinhos embutidos que atordoam as criaturas", "§r§8 Concede Regeneração a jogadores próximos"],
	"mnra_cata:terrabloom_chestplate": ["§r§9+3 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "§r§9+1 de Imunidade a Efeitos Negativos", "§r§7Bônus do Conjunto Completo:", "§r§8 Espinhos embutidos que atordoam as criaturas", "§r§8 Concede Regeneração a jogadores próximos"],
	"mnra_cata:terrabloom_leggings": ["§r§9+3 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "§r§9+1 de Imunidade a Efeitos Negativos", "§r§7Bônus do Conjunto Completo:", "§r§8 Espinhos embutidos que atordoam as criaturas", "§r§8 Concede Regeneração a jogadores próximos"],
	"mnra_cata:terrabloom_boots": ["§r§9+3 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "§r§9+1 de Imunidade a Efeitos Negativos", "§r§7Bônus do Conjunto Completo:", "§r§8 Espinhos embutidos que atordoam as criaturas", "§r§8 Concede Regeneração a jogadores próximos"],

	"mnra_cata:infernum_helmet": ["§r§9+5 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "§r§9+1 de Ignição Solar", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Concede Força e Resistência ao Fogo e queima", "§r§8 criaturas próximas abaixo de 10 corações"],
	"mnra_cata:infernum_chestplate": ["§r§9+5 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "§r§9+1 de Ignição Solar", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Concede Força e Resistência ao Fogo e queima", "§r§8 criaturas próximas abaixo de 10 corações"],
	"mnra_cata:infernum_leggings": ["§r§9+5 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "§r§9+1 de Ignição Solar", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Concede Força e Resistência ao Fogo e queima", "§r§8 criaturas próximas abaixo de 10 corações"],
	"mnra_cata:infernum_boots": ["§r§9+5 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "§r§9+1 de Ignição Solar", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Concede Força e Resistência ao Fogo e queima", "§r§8 criaturas próximas abaixo de 10 corações"],

	"mnra_cata:exodius_helmet": ["§r§9+3 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Invoca uma explosão de Elementos ", "§r§8 abaixo de 10 de vida"],
	"mnra_cata:exodius_chestplate": ["§r§9+3 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Invoca uma explosão de Elementos ", "§r§8 abaixo de 10 de vida"],
	"mnra_cata:exodius_leggings": ["§r§9+3 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Invoca uma explosão de Elementos ", "§r§8 abaixo de 10 de vida"],
	"mnra_cata:exodius_boots": ["§r§9+3 de Resistência da Armadura", "§r§9+1 de Resistência a Repulsão", "", "§r§7Bônus do Conjunto Completo:", "§r§8 Invoca uma explosão de Elementos ", "§r§8 abaixo de 10 de vida"],

	"mnra_cata:verdant_helmet": ["", "§r§7Bônus do Conjunto:", "§r§8 Remove todos os efeitos de veneno"],

	//flawless weapons
	"mnra_cata:verdant_greatsword": ["§r§7Guarda a alma da Sentinela Verdejante", "", "§r§7Ao Ferir Criatura:", "§r§8 Invoca até 2 punhos da Sentinela Verdejante", "§r§cItem Impecável"],
	"mnra_cata:divine_scythe_of_heaven": ["§r§eFoice dos Céus", "", "§r§7Ao Interagir:", "§r§8 Invoca um Totem Solar que queima todas as", "§r§8 criaturas numa área de 8x8", "§r§cItem Impecável"],

	//Community and Dev weapons
	"mnra_cata:anchor": ["§r§7O orgulho e a alegria do Shroomy", "", "§r§7Ao Ferir Criatura:", "§r§8 Puxa as criaturas até o jogador", "§r§eItem da Comunidade"],
	"mnra_cata:meowclysm": ["§r§7A maior arma de todos os tempos", "", "§r§7Ao Golpear:", "§r§8 Faz barulhos de gato!", "§r§7Ao Matar Criatura:", "§r§8 Transforma a criatura em gato", "§r§dItem do Desenvolvedor"],
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
		// [Addon Pack] Detector de Terror nao e mais entregue no 1o acesso (continua craftavel)

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
