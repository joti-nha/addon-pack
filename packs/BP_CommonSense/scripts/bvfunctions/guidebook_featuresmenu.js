import { showMainMenu, pagesound, createPage, openPage, goTo } from "./guidebook.js";

//=====================================================================
// COMO ADICIONAR COISAS NOVAS
//---------------------------------------------------------------------
// 1) Novo PET:        adicione um pet({ ... }) na lista PETS.
// 2) Nova FEATURE:    adicione um objeto na lista FEATURES:
//                     { name: "Nome do botão", title: "Título (opcional)", text: join(...) }
// 3) Novo SUBMENU:    em vez de "text", use "children: [ ...itens... ]"
//                     (itens podem ter text ou outros children)
//=====================================================================

//=========================
// HELPERS DE FORMATAÇÃO
//=========================
// Cores: §a verde (títulos) | §f branco (texto) | §c vermelho (avisos)

/** Junta blocos separados por uma linha em branco */
const join = (...blocks) => blocks.filter(Boolean).join("\n\n");

/** Aviso vermelho de feature configurável. Ex: toggle() ou toggle("on/off") */
const toggle = (text = "Liga e desliga nas Configurações") => `§c(${text})§r`;

/** "Label: valor" com label verde e valor branco, sempre na mesma linha */
const field = (label, value) => `§a${label}:§f ${value}`;

/** Título verde + linhas de texto branco */
const section = (title, ...lines) => `§a${title}:§f\n${lines.join("\n")}`;

/** Várias linhas "Label: valor" coladas, uma por linha */
const stats = (...pairs) => pairs.filter(Boolean).map(([label, value]) => field(label, value)).join("\n");

//=========================
// PETS
//=========================
/**
 * Campos:
 *  name      -> nome do botão e título da página
 *  behavior  -> descrição do comportamento
 *  tamedWith -> como domesticar
 *  food      -> comida / alimentação (opcional)
 *  health    -> vida (opcional)
 *  damage    -> dano (opcional)
 *  extra     -> lista de [label, valor] com informações extras (opcional)
 */
const pet = ({ name, behavior, tamedWith, food, health, damage, extra = [] }) => ({
	name,
	text: join(
		behavior,
		stats(
			["Domado com", tamedWith],
			food && ["Comida", food],
			health && ["Vida", health],
			damage && ["Dano", damage],
		),
		...extra.map(([label, value]) => field(label, value)),
	),
});

const PETS = [
	pet({
		name: "Raposa",
		behavior: "Segue e senta como o lobo, defende o dono com ataques e saltos, e pode usar armadura para raposa",
		tamedWith: "osso (pode mudar no futuro)",
		food: "carnes em geral",
		health: 20,
		damage: 4,
	}),
	pet({
		name: "Sapo",
		behavior: "Segue e senta como o lobo e defende o dono com ataques",
		tamedWith: "osso (pode mudar no futuro)",
		food: "carnes em geral",
		health: 20,
		damage: 4,
	}),
	pet({
		name: "Axolote",
		behavior: "Segue e senta como o lobo, e dá Regeneração ao jogador quando encosta nele (recarga de 15 segundos)",
		tamedWith: "osso (pode mudar)",
		food: "peixes",
		health: 20,
		extra: [
			["Limitação", "depois de 8 min o axolote começa a secar e se machucar. Leve água com você (garrafa de água, baldes de água...)"],
		],
	}),
	pet({
		name: "Urso-polar",
		behavior: "Segue como o lobo. Pode ser §amontaria§f ou pet quando ninguém está montado. Ataca os alvos do jogador como os lobos e também usa a pisada do urso vanilla",
		tamedWith: "osso (pode mudar) / domar montado (como cavalos)",
		food: "carnes em geral",
		health: 30,
		damage: 6,
	}),
	pet({
		name: "Coelho",
		behavior: "Segue e senta como o lobo. Não ataca criaturas, só segue você",
		tamedWith: "osso (só coelhos adultos)",
		food: "cenoura, cenoura dourada, dente-de-leão (reprodução)",
		health: 10,
	}),
];

//=========================
// DADOS DAS FEATURES
//=========================
const LIGHT_LEVELS = [
	[1, "chaves, tinta brilhante, líquen brilhante, magma, tocha de redstone, bagas brilhantes, moldura brilhante, maçã dourada encantada"],
	[2, "tocha das almas, pepino-do-mar, pó de pedra luminosa, pó de blaze"],
	[3, "tocha, lanterna das almas, balde de lava, vara de blaze, barra do End, cogumelo luminoso"],
	[4, "lanterna, tocha de cobre, lanternas de cobre oxidado/desgastado, fogueira, lanterna do mar, pedra luminosa, luzes de sapo"],
	[5, "Estrela do Nether"],
];

const CHEST_SLOTS = [
	["Ghast Feliz", 15],
	["Cavalos", 9],
	["Burro", 18],
	["Mulas e camelos", 24],
];

//=========================
// FEATURES
//=========================
const FEATURES = [
	{
		name: "Luz Dinâmica",
		text: join(
			toggle(),
			field("Recurso 1", "\nItens que emitem luz iluminam ao seu redor quando estão na mão, com níveis de luz diferentes"),
			field("Recurso 2", "\nAs lanternas também iluminam na barra rápida, como se estivessem no seu 'cinto' (dá para desligar nas configurações)"),
			section("Níveis de luz", ...LIGHT_LEVELS.map(([lvl, items]) => `§a nív.${lvl} §f- ${items}`)),
		),
	},
	{
		name: "Câmera Melhor",
		text: join(
			"Câmeras novas por cima do ombro, configuráveis",
			field("Item", "\nEditor de Visão"),
			field("Receita", "\n§8[§8§eS§8][§r§eP§r§8][§r§eS§r§8] = §r§e1x§r§8 §rEditor de Visão\n §r§eS§r - Graveto \n §r§eP§r - Qualquer tábua "),
			field("Configurações:", "\nagachado, interaja com o Editor de Visão para abrir o menu, mude as suas configurações (pessoais) e salve"),
			section("Ativar", "para ativar as câmeras, use o Editor de Visão sem agachar")
		),
	},
	{
		name: "Mão Secundária Melhor",
		title: "Mão Secundária",
		text: join(
			toggle(),
			"1. Você pode usar fogos de artifício na mão secundária para impulsionar a élitra, SE a mão principal tiver outro item\n\n2. Agache duas vezes para trocar de mão com itens compatíveis",
			section("Itens compatíveis", "Todas as tochas e lanternas, escudos, fogos de artifício, Totem da Imortalidade"),
		),
	},
	{
		name: "Não Ferir Pets",
		text: join(
			toggle(),
			"1. Seus pets e montarias não levam dano de jogadores\n§c(SÓ CRIATURAS VANILLA)§r",
			field("Modo 1", "os pets e montarias não levam dano de nenhum jogador"),
			field("Modo 2", "os pets e montarias não levam dano só do próprio dono"),
		),
	},
	{
		name: "Montarias Melhores",
		title: "Montarias Melhores",
		text: join(
			section("Ghast Feliz", "Modos de velocidade: em cima da cabeça do ghast feliz, interaja com um graveto para alternar entre a velocidade vanilla e a acelerada"),
			section("Montarias com baú", "Todas as montarias podem levar baú", ...CHEST_SLOTS.map(([mount, slots]) => `${mount}: ${slots} espaços`)),
			section("Quebrar folhas (liga/desliga)", "As montarias quebram as folhas por onde passam correndo"),
			section("Cavalos ficam parados", "Cavalos domados e selados ficam parados quando nenhum jogador está montado"),
			section("2 cavaleiros", "Cavalos, mulas e burros também levam 2 cavaleiros"),
		),
	},
	{
		// Submenu: um botão para cada pet da lista PETS
		name: "Pets Novos ❤",
		title: "Pets Novos",
		children: PETS,
	},
	{
		name: "Pets Passeando",
		text: join(
			"Seus pets podem ficar no modo passeio e andar livres quando você não está por perto",
			field("Pets compatíveis no momento", "\nLobos"),
			field("Como ativar:", "\n agachado, interaja com o pet segurando um osso;\n o pet alterna entre os modos 'passeando' e 'seguindo'"),
		),
	},
	{
		name: "Recursos Menores",
		text: join(
			section("Saturação do Java", "(liga e desliga nas configurações)\nComo no Minecraft Java Edition: ferido, o jogador troca pontos de saturação por vida"),
			section("Tosar galinhas", "acerte a galinha com uma tesoura para ganhar penas (recarga de 1 min)"),
			section("Ataque com tocha", "acertar qualquer criatura com uma tocha na mão a põe em chamas por 2 segundos"),
			section("Consertar bigorna", "agora você conserta bigornas usando um lingote de ferro nelas"),
			section("Visão das almas", "lanterna e tocha das almas na mão dão Visão Noturna"),
			section("Totem automático (liga/desliga)", "com um Totem da Imortalidade na barra rápida e a vida perigosamente baixa, o sistema põe o totem na mão secundária"),
			section("Nomes de aldeões", "agora todos os aldeões nascem com nomes próprios"),
			section("Cura da fogueira (liga/desliga)", "perto de uma fogueira acesa, o jogador recebe Regeneração"),
			section("Bola de Fogo", "Cargas de fogo viram um arremessável novo, a Bola de Fogo, só na mesa de trabalho"),
		),
	},
];

//=========================
// MENUS (não precisa mexer aqui para adicionar conteúdo)
//=========================
export function showFeaturesMenu(player) {
	showMenu(player, "Recursos", FEATURES, () => showMainMenu(player), "Voltar ao Menu");
}

/** Menu com botões. Itens com "children" abrem um submenu, itens com "text" abrem uma página. */
function showMenu(player, title, items, onBack, backLabel = "Voltar") {
	const form = createPage(player, title);

	form.label("Escolha:");
	form.divider();

	for (const item of items) {
		form.button(item.name, () => {
			pagesound(player);
			const backHere = () => showMenu(player, title, items, onBack, backLabel);
			goTo(form, () =>
				item.children
					? showMenu(player, item.title ?? item.name, item.children, backHere)
					: showPage(player, item, backHere)
			);
		});
	}

	form.divider();
	form.button(backLabel, () => {
		pagesound(player);
		goTo(form, onBack);
	});

	openPage(form);
}

function showPage(player, item, onBack) {
	const form = createPage(player, item.title ?? item.name);

	form.label(item.text);
	form.divider();

	form.button("Voltar", () => {
		pagesound(player);
		goTo(form, onBack);
	});

	openPage(form);
}
