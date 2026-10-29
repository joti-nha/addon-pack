import { showMainMenu, pagesound, createPage, openPage, goTo } from "./guidebook.js";

//=====================================================================
// COMO ADICIONAR COISAS NOVAS
//---------------------------------------------------------------------
// Adicione um objeto na lista RECIPES:
//   { name: "Nome do botão", title: "Título (opcional)", text: ... }
//
// "text" pode ser:
//   - uma string                      -> uma página simples
//   - uma lista de strings            -> várias seções separadas por divider
// Em vez de "text" você pode usar "children: [ ... ]" para criar um submenu.
//
// Para receitas de craft use os helpers:
//   crafting(grade, resultado, ...legenda)
//   grade   = lista de linhas, cada linha é uma lista de células ("" = vazio)
//   legenda = ["1", "Iron Ingot"], ["2", "Stick"] ...
//=====================================================================

//=========================
// HELPERS DE FORMATAÇÃO
//=========================
// Cores: §a verde (títulos/bordas) | §f branco (texto) | §e amarelo (destaques)

/** Junta blocos separados por uma linha em branco */
const join = (...blocks) => blocks.filter(Boolean).join("\n\n");

/** Título verde + linhas de texto branco */
const section = (title, ...lines) => `§a${title}§f\n${lines.join("\n")}`;

/** Desenha a grade de craft. Ex: grid([["1",""],["1","1"]], "4x Stairs") */
function grid(rows, result) {
	const mid = Math.floor(rows.length / 2); // o resultado aparece na linha do meio
	return rows
		.map((row, i) => {
			const cells = row.map((c) => `§a[§f${c || " "}§a]`).join("");
			return i === mid && result ? `${cells}§f = ${result}` : `${cells}§f`;
		})
		.join("\n");
}

/** Legenda: "1 = Iron Ingot" */
const legend = (...pairs) => pairs.map(([key, value]) => `${key} = ${value}`).join("\n");

/** Bloco completo de craft: título + grade + legenda */
const crafting = (rows, result, ...pairs) =>
	`§aReceita:§f\n${grid(rows, result)}` + (pairs.length ? `\n${legend(...pairs)}` : "");

//=========================
// RECEITAS
//=========================
const RECIPES = [
	{
		name: "Receitas Gerais",
		title: "Gerais",
		text: [
			section("'Serraria'", "colocando toras e blocos de madeira no CORTADOR DE PEDRAS você faz todas as receitas de madeira mais rápido"),
			section("Desmontar itens", "No Cortador de Pedras vanilla você 'desmonta' itens como ferramentas, armaduras, escadas, portas, lajes, botões, cercas, placas de pressão, alçapões etc. e recebe parte do material usado"),
			section("Carne podre em couro", "Você transforma Carne Podre em Couro na fornalha!\nÉ só pôr a carne podre na fornalha com carvão e esperar"),
			section("Blocos brutos no alto-forno", "você funde Blocos de Minério Bruto no Alto-Forno, mais rápido"),
			section("Bloco de carvão", "Você faz bloco de carvão com Carvão Vegetal"),
			section("Carvão de bambu", "blocos de bambu viram carvão vegetal, como as outras toras"),
			section("Linha fácil", "Você faz linha com uma trepadeira"),
			section("Discos de música", "Todos os discos de música podem ser feitos com Ardósia Profunda Polida e Corantes.\nMenos o disco 'Relic', que usa Netherrack"),
			section("Pólvora", "Você faz pólvora com carvão vegetal e Espinho de Enxofre na mesa de trabalho"),
		],
	},
	{
		name: "Armaduras para Cavalo",
		title: "Armadura para Cavalo",
		text: join(
			"Você faz armaduras para cavalo de ferro, cobre, ouro e diamante\n(ainda dá para melhorar para netherite na mesa de ferraria)\ne pode desmontá-las no cortador de pedras",
			crafting(
				[["", "", "1"], ["1", "2", "1"], ["1", "", "1"]],
				"",
				["1", "Metal (ferro, cobre...)"],
				["2", "Couro"],
			),
		),
	},
	{
		name: "Armaduras para Náutilo",
		title: "Armadura para Náutilo",
		text: join(
			"Você faz armaduras para náutilo de ferro, cobre, ouro e diamante\n(ainda dá para melhorar para netherite na mesa de ferraria)\ne pode desmontá-las no cortador de pedras",
			crafting(
				[["1", "1", "1"], ["1", "", "1"], ["", "1", "1"]],
				"",
				["1", "Metal (ferro, cobre...)"],
			),
		),
	},
	{
		// Submenu: um botão para cada receita de cobre
		name: "Receitas de Cobre",
		children: [
			{
				name: "Etiqueta",
				text: join(
					"Você faz etiquetas com cobre no lugar de ferro",
					crafting([["C"], ["P"], ["P"]], "1x Etiqueta", ["C", "Lingote de Cobre"], ["P", "Papel"]),
				),
			},
			{
				name: "Trilho Elétrico",
				text: join(
					"Você faz trilhos com lingotes de cobre no lugar de lingotes de ouro",
					crafting(
						[["1", "", "1"], ["1", "2", "1"], ["1", "3", "1"]],
						"6x Trilho Elétrico",
						["1", "Lingote de Cobre"], ["2", "Graveto"], ["3", "Redstone"],
					),
				),
			},
			{
				name: "Trilho Ativador",
				text: join(
					"Você faz trilhos com lingotes de cobre no lugar de lingotes de ferro",
					crafting(
						[["1", "2", "1"], ["1", "3", "1"], ["1", "2", "1"]],
						"6x Trilho Ativador",
						["1", "Lingote de Cobre"], ["2", "Graveto"], ["3", "Tocha de Redstone"],
					),
				),
			},
			{
				name: "Trilho Detector",
				text: join(
					"Você faz trilhos com lingotes de cobre no lugar de lingotes de ferro",
					crafting(
						[["1", "", "1"], ["1", "3", "1"], ["1", "2", "1"]],
						"6x Trilho Detector",
						["1", "Lingote de Cobre"], ["2", "Redstone"], ["3", "Placa de Pressão de Pedra"],
					),
				),
			},
		],
	},
	{
		name: "Escadas Melhores",
		text: join(
			"Todas as escadas vanilla ficam mais baratas e podem ser desmontadas",
			crafting([["1", ""], ["1", "1"]], "4x Escadas", ["1", "Qualquer bloco"]),
			`§aDesmontar:§f\n${grid([["1", "1"], ["1", "1"]], "3x Blocos")}\n${legend(["1", "Qualquer escada"])}`,
		),
	},
	{
		name: "Flecha de 'Ferro'",
		text: join(
			"Você faz o dobro de flechas usando lingote de ferro no lugar de sílex",
			crafting(
				[["1"], ["2"], ["3"]],
				"8x Flecha",
				["1", "Lingote de Ferro"], ["2", "Graveto"], ["3", "Pena"],
			),
		),
	},
	{
		name: "Élitra",
		// Lista = várias seções com divider entre elas
		text: [
			"§eÉlitra:§r\nVocê pode fazer élitras, mas a receita é de fim de jogo: ainda é preciso ir ao End para fazer uma",
			join(
				"§e1.§f Primeiro você precisa de 2 Asas de Phantom",
				crafting(
					[["M", "C", ""], ["M", "M", "C"], ["", "M", "C"]],
					"1x Asas de Phantom",
					["M", "Membrana de Phantom"], ["C", "Fruta do Coro Estourada"],
				),
			),
			join(
				"§e2.§f Depois você precisa de 1 Creme de Magma",
				crafting(
					[["", "M", ""], ["P", "", "P"]],
					"1x Élitra",
					["M", "Creme de Magma"], ["P", "Membrana de Phantom"],
				),
			),
		],
	},
];

//=========================
// MENUS (não precisa mexer aqui para adicionar conteúdo)
//=========================
export function showRecipesMenu(player) {
	showMenu(player, "Receitas", RECIPES, () => showMainMenu(player), "Voltar ao Menu");
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

	const sections = Array.isArray(item.text) ? item.text : [item.text];
	sections.forEach((section, i) => {
		form.label(section);
		if (i < sections.length - 1) form.divider();
	});

	form.divider();
	form.button("Voltar", () => {
		pagesound(player);
		goTo(form, onBack);
	});

	openPage(form);
}
