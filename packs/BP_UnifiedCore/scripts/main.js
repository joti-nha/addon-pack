// Addon Pack - Unified Core (BP)
// Reliquia da Videncia (Eternal Caves): botao secundario (segurar) = zoom de lupa.
// O botao de ataque (revelar detalhes do alvo) esta em Eternal Caves/scripts/load-*.js (ver CHANGELOG).
import { world, system, GameMode, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { FERRAMENTAS, POR_DURABILIDADE, MINERIOS, NOME_NIVEL, QUEBRA_TUDO } from "./niveis.js";
import "./armaduras.js";

const RELIC = "panascais_caves:seers_relic";
const ZOOM_FOV = 25;          // campo de visao com zoom (o normal e ~70)
const zooming = new Set();    // ids de jogadores em zoom

function setZoom(player, on) {
  // 1) API de camera; 2) comando /camera fov_set (alternativa se a API nao existir nesta versao)
  try {
    if (on) player.camera.setFov({ fov: ZOOM_FOV, easeOptions: { easeTime: 0.15, easeType: "Linear" } });
    else player.camera.setFov({ easeOptions: { easeTime: 0.1, easeType: "Linear" } });
    return true;
  } catch (e) { }
  try {
    player.runCommand(on ? `camera @s fov_set ${ZOOM_FOV} 0.15 linear` : "camera @s fov_clear 0.1 linear");
    return true;
  } catch (e) { }
  return false;
}
function zoomOn(player) {
  if (zooming.has(player.id)) return;
  zooming.add(player.id);
  setZoom(player, true);
  try { player.playSound("item.spyglass.use"); } catch (e) { }
}
function zoomOff(player, sound = true) {
  if (!zooming.delete(player.id)) return;
  setZoom(player, false);
  if (sound) { try { player.playSound("item.spyglass.stop_using"); } catch (e) { } }
}

world.afterEvents.itemStartUse.subscribe(({ source, itemStack }) => {
  if (itemStack?.typeId === RELIC) zoomOn(source);
});
world.afterEvents.itemStopUse.subscribe(({ source, itemStack }) => {
  if (itemStack?.typeId === RELIC) zoomOff(source);
});
world.afterEvents.itemReleaseUse.subscribe(({ source, itemStack }) => {
  if (itemStack?.typeId === RELIC) zoomOff(source);
});
world.beforeEvents.playerLeave.subscribe(({ player }) => { zooming.delete(player.id); });

// Luneta da Videncia: todo jogador comeca com ela (uma vez; nao cai na morte).
function darReliquia(player) {
  try {
    if (player.hasTag("unified:relic_given")) return;
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return;
    for (let i = 0; i < inv.size; i++) if (inv.getItem(i)?.typeId === RELIC) { player.addTag("unified:relic_given"); return; }
    const it = new ItemStack(RELIC, 1);
    it.keepOnDeath = true;
    if (inv.emptySlotsCount > 0) inv.addItem(it);
    else player.dimension.spawnItem(it, player.location);
    player.addTag("unified:relic_given");
  } catch (e) { }
}
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (initialSpawn) system.runTimeout(() => darReliquia(player), 100);
});
system.runTimeout(() => { for (const p of world.getAllPlayers()) darReliquia(p); }, 200);

// Rede de seguranca: se o jogador trocar de item/slot sem soltar o botao, o zoom nao pode ficar preso.
system.runInterval(() => {
  if (zooming.size === 0) return;
  for (const player of world.getAllPlayers()) {
    if (!zooming.has(player.id)) continue;
    const eq = player.getComponent("minecraft:equippable");
    const main = eq?.getEquipment("Mainhand")?.typeId;
    const off = eq?.getEquipment("Offhand")?.typeId;
    if (main !== RELIC && off !== RELIC) zoomOff(player, false);
  }
}, 10);

// ---------------------------------------------------------------------------
// Escada de picaretas x minerios (tabela em niveis.js)
// ---------------------------------------------------------------------------
const REQUISITO = (id) => {
  if (MINERIOS[id] !== undefined) return MINERIOS[id];
  const base = id.replace(":deepslate_", ":").replace(":lit_deepslate_", ":lit_");
  return MINERIOS[base];
};

function nivelFerramenta(item) {
  if (!item) return 0;
  const id = item.typeId;
  if (FERRAMENTAS[id] !== undefined) return FERRAMENTAS[id];
  if (!(id.includes("pickaxe") || item.hasTag("minecraft:is_pickaxe"))) return 0; // nao e picareta
  const dur = item.getComponent("minecraft:durability")?.maxDurability ?? 0;
  for (const [lim, niv] of POR_DURABILIDADE) if (dur <= lim) return niv;
  return 1;
}

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
  const need = REQUISITO(ev.block.typeId);
  if (need === undefined) return;
  const player = ev.player;
  if (player.getGameMode() === GameMode.Creative) return;
  const have = nivelFerramenta(ev.itemStack);
  if (have >= need) return;
  ev.cancel = true;
  const nome = NOME_NIVEL[need] ?? `nivel ${need}`;
  system.run(() => {
    try { player.onScreenDisplay.setActionBar(`§cFerramenta fraca demais: precisa de nivel ${need} (${nome}) ou maior.`); } catch (e) { }
  });
});

// ---------------------------------------------------------------------------
// Livros: Livro de Progresso RPG (so dados de upgrade do jogador) e Livro do Viajante.
// Nao sao entregues no inicio nem ficam travados no inventario (so o RPG Guide do RPG Addon e fixo). Ambos sao craftaveis.
// ---------------------------------------------------------------------------
const RPG_BOOK = "addonpack:rpg_book";
const TRAVELER_BOOK = "addonpack:traveler_book";
const CLASSES = ["Sem classe", "Guerreiro", "Arqueiro", "Mago", "Assassino", "Sobrevivente"];
const CAMINHOS = { left: "Caminho da esquerda", middle: "Caminho do meio", right: "Caminho da direita" };

function placar(player, nome, padrao = 0) {
  try { return world.scoreboard.getObjective(nome)?.getScore(player) ?? padrao; } catch (e) { return padrao; }
}
function nivelCaminho(player, path) {
  let max = 0;
  for (const t of player.getTags()) if (t.startsWith(`path_${path}_`)) max = Math.max(max, parseInt(t.split("_").pop(), 10) || 0);
  return max;
}
function bonito(tag) {
  return tag.replace(/^shop_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function abrirLivroRPG(player) {
  const classe = placar(player, "class");
  const tags = new Set(player.getTags());
  const habilidades = [...tags].filter((t) => t.startsWith("shop_") && !t.endsWith("_off"))
    .map((t) => `${tags.has(t + "_off") ? "§7[desligada] " : "§a[ativa] "}§r${bonito(t)}`);
  let txt = `§lClasse:§r ${CLASSES[classe] ?? classe}\n§lNivel:§r ${placar(player, "level", 1)}\n§lAlmas:§r ${placar(player, "souls")}\n\n§lCaminhos de habilidade§r\n`;
  for (const [k, nome] of Object.entries(CAMINHOS)) txt += `- ${nome}: nivel ${nivelCaminho(player, k)}\n`;
  txt += `\n§lMelhorias desbloqueadas§r\n${habilidades.length ? habilidades.join("\n") : "§7Nenhuma ainda."}`;
  const f = new ActionFormData().title("Livro de Progresso RPG").body(txt).button("Fechar");
  f.show(player).catch(() => { });
}

const CAPITULOS = [
  { id: "tiers", titulo: "Escada de ferramentas", sempre: true, texto:
    "Uma picareta so quebra um minerio se o nivel dela for igual ou maior que o do minerio.\n\n" +
    "1 madeira/ouro | 2 pedra, cobre, estanho, zinco, bronze, laton | 3 ferro, quitina, mumia, olivina, ametista, afiada\n" +
    "4 diamante, netunio, titanio | 5 netherite, enderite (BoB), criorita | 6 verdita | 7 nocturita | 8 pironita, sunflare\n" +
    "9 aetherium | 10 corruptium | 11 runebreaker | 12 Eternal End (maior nivel)\n\n" +
    "A picareta de Stardust quebra qualquer bloco. A tabela completa fica em niveis.js." },
  { id: "caves", titulo: "Eternal Caves", ns: ["panascais_caves"], texto: "Minerios em sequencia: titanio, criorita, verdita, nocturita, pironita, aetherium e corruptium. Cada minerio exige a picareta do anterior. Runas e gemas podem ser forjadas em itens compativeis." },
  { id: "end", titulo: "Eternal End", ns: ["panascais_end"], dim: "minecraft:the_end", texto: "Ferramentas de enderite e ametrina sao as de maior nivel. Os detritos eternos so cedem a elas." },
  { id: "nether", titulo: "Nether+ (ntk)", ns: ["ntk"], texto: "Ligas de estanho, zinco, bronze e laton; olivina no Nether; varinhas e cajados." },
  { id: "cata", titulo: "Cataclysmical", ns: ["mnra_cata", "cata"], texto: "Montantes e armas de boss. Minerios de platina ate exodius; a picareta sunflare e o topo desta linha." },
  { id: "dungeons", titulo: "Dungeons", ns: ["dungeons"], texto: "Armas de dungeon, projetos (blueprints) e armaduras de aventura." },
  { id: "mowzie", titulo: "Mowzie's Mobs", ns: ["hf_mzs"], texto: "Chefes e criaturas com mascaras, lancas e machados cerimoniais." },
  { id: "aqua", titulo: "Aquaculture", ns: ["tm_aqc"], texto: "Pesca, facas de filetar e ferramentas de netunio (nivel 4)." },
  { id: "bob", titulo: "Better on Bedrock", ns: ["better_on_bedrock"], texto: "Estardust, ametista e enderite. A picareta de estardust quebra qualquer bloco." },
  { id: "dark", titulo: "Dark Age", ns: ["dk"], texto: "Sentinelas, gargulas e alabardas. A alabarda da gargula agora causa metade do dano original." },
  { id: "grimorio", titulo: "Grimorio Esquecido", ns: ["fgr"], texto: "Pergaminhos de feitico organizados no grimorio e no tomo arcano." },
  { id: "rpg", titulo: "RPG", ns: ["rpg", "test"], classe: true, texto: "Escolha uma classe e abra o Livro de Progresso RPG para ver nivel, almas e melhorias." },
];

function descobrir(player) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return;
  const vistos = new Set();
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (it) vistos.add(it.typeId.split(":")[0]);
  }
  for (const c of CAPITULOS) {
    const tag = `ap_cap_${c.id}`;
    if (c.sempre || player.hasTag(tag)) continue;
    const achou = c.ns?.some((n) => vistos.has(n)) || (c.dim && player.dimension.id === c.dim) || (c.classe && placar(player, "class") > 0);
    if (achou) {
      player.addTag(tag);
      player.sendMessage(`§b[Livro do Viajante]§r Novo capitulo: ${c.titulo}`);
    }
  }
}

function abrirLivroViajante(player) {
  descobrir(player);
  const abertos = CAPITULOS.filter((c) => c.sempre || player.hasTag(`ap_cap_${c.id}`));
  const f = new ActionFormData().title("Livro do Viajante")
    .body(`Capitulos liberados: ${abertos.length}/${CAPITULOS.length}\n§7Descubra mais carregando itens ou visitando lugares.`);
  for (const c of abertos) f.button(c.titulo);
  f.show(player).then((r) => {
    if (r.canceled) return;
    const c = abertos[r.selection];
    new ActionFormData().title(c.titulo).body(c.texto).button("Voltar").show(player)
      .then((r2) => { if (!r2.canceled) system.run(() => abrirLivroViajante(player)); }).catch(() => { });
  }).catch(() => { });
}

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (itemStack?.typeId === RPG_BOOK) system.run(() => abrirLivroRPG(source));
  else if (itemStack?.typeId === TRAVELER_BOOK) system.run(() => abrirLivroViajante(source));
});
world.afterEvents.playerDimensionChange.subscribe(({ player }) => descobrir(player));
system.runInterval(() => { for (const p of world.getAllPlayers()) descobrir(p); }, 100);
