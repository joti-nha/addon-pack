import { world, system } from "@minecraft/server";

// ===================== CONFIGURAÇÕES =====================
const OBJECTIVE_ID = "bv:pet_armor";
const MAX_DISTANCE = 8;                             // alcance máximo para detectar o olhar
const MAX_ANGLE_COS = Math.cos(10 * Math.PI / 180); // ~10° de tolerância na mira
const MAX_ARMOR = 30;                               // durabilidade máxima da armadura
const BAR_SEGMENTS = 10;                            // quantidade de blocos na barrinha
// =========================================================

// Monta a barrinha de progresso: "█████░░░░░ 17/30"
function buildArmorBar(score) {
	// Quantos segmentos preenchidos (arredondado)
	const filled = Math.max(0, Math.min(BAR_SEGMENTS, Math.round((score / MAX_ARMOR) * BAR_SEGMENTS)));
	const empty = BAR_SEGMENTS - filled;

	// Cor dos segmentos preenchidos conforme a durabilidade
	let color = "§a"; // Verde (Saudável)
	if (score <= 5) {
		color = "§c"; // Vermelho (Crítico)
	} else if (score <= 10) {
		color = "§e"; // Amarelo (Metade)
	}

	const bar = color + "█".repeat(filled) + "§7" + "░".repeat(empty);
	return `${bar} §f${score}/${MAX_ARMOR}`;
}

system.runInterval(() => {
	const scoreboard = world.scoreboard;
	const objective = scoreboard.getObjective(OBJECTIVE_ID);

	// Se o objetivo do placar não existir no mundo, interrompe o ciclo
	if (!objective) return;

	for (const player of world.getPlayers()) {
		if (!player.isValid) continue;

		const dim = player.dimension;
		const eyeLoc = player.getHeadLocation();
		const viewDir = player.getViewDirection();

		// Raposas próximas do player (mais próxima primeiro)
		const foxes = dim.getEntities({
			type: "minecraft:fox",
			location: eyeLoc,
			maxDistance: MAX_DISTANCE,
			closest: 3
		});

		let targetFox = null;
		let bestDot = MAX_ANGLE_COS;

		for (const fox of foxes) {
			if (!fox.isValid) continue;

			try {
				// Vetor do olho do player até a cabeça da raposa
				const head = fox.getHeadLocation();
				const dx = head.x - eyeLoc.x;
				const dy = head.y - eyeLoc.y;
				const dz = head.z - eyeLoc.z;
				const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
				if (dist < 0.1) continue;

				// Produto escalar: 1 = olhando exatamente pra ela
				const dot = (dx * viewDir.x + dy * viewDir.y + dz * viewDir.z) / dist;

				if (dot > bestDot) {
					bestDot = dot;
					targetFox = fox;
				}
			} catch { /* ignora raposas inválidas neste ciclo */ }
		}

		// Se não está olhando pra nenhuma raposa, só passa pro próximo player.
		// Não precisa limpar a actionbar: ela some sozinha em ~3s.
		if (!targetFox) continue;

		try {
			const score = objective.getScore(targetFox);

			// Sem armadura (ou score inválido) -> não mostra nada
			if (score === undefined || score <= 0) continue;

			// Exibe a barrinha na actionbar (acima da hotbar) do player que está olhando
			player.onScreenDisplay.setActionBar(buildArmorBar(score));
		} catch { /* scoreboard indisponível neste ciclo */ }
	}
}, 10);