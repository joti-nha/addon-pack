// Addon Pack - Unified Core (BP)
// Reliquia da Videncia (Eternal Caves): botao secundario (segurar) = zoom de lupa.
// O botao de ataque (revelar detalhes do alvo) esta em Eternal Caves/scripts/load-*.js (ver CHANGELOG).
import { world, system, GameMode, ItemStack } from "@minecraft/server";
import { FERRAMENTAS, POR_DURABILIDADE, MINERIOS, NOME_NIVEL, QUEBRA_TUDO } from "./niveis.js";
import "./armaduras.js";
import "./combate.js";

const RELIC = "panascais_caves:seers_relic";
const ZOOM_FOV = 25;          // campo de visao com zoom (o normal e ~70)
const zooming = new Set();    // ids de jogadores em zoom
// Borda da luneta: o hud_screen unificado mostra a moldura (textures/ui/spyglass_scope) enquanto o titulo e esta marca;
// titulos que comecam com "!" nao aparecem na tela. A etiqueta SCOPE_TAG marca o jogador enquanto dura o zoom
// (servia para o JavaCombat, que saiu do pack em 2026-10-31, nao trocar o titulo).
const SCOPE_MARK = "!unified:luneta";
const SCOPE_TAG = "unified:luneta";

function setScope(player, on) {
  try {
    if (on) {
      player.addTag(SCOPE_TAG);
      player.onScreenDisplay.setTitle(SCOPE_MARK, { fadeInDuration: 0, stayDuration: 72000, fadeOutDuration: 0 });
    } else {
      player.removeTag(SCOPE_TAG);
      player.onScreenDisplay.setTitle("!", { fadeInDuration: 0, stayDuration: 1, fadeOutDuration: 0 });
      player.onScreenDisplay.clearTitle();
    }
  } catch (e) { }
}

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
  setScope(player, true);
  try { player.playSound("item.spyglass.use"); } catch (e) { }
}
function zoomOff(player, sound = true) {
  if (!zooming.delete(player.id)) return;
  setZoom(player, false);
  setScope(player, false);
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

// Itens iniciais, uma vez por jogador: a Luneta da Videncia (nao cai na morte) e a mochila de couro do OTG.
const MOCHILA = "otg:backpack";
function darUmaVez(player, tipo, etiqueta, manter) {
  try {
    if (player.hasTag(etiqueta)) return;
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return;
    for (let i = 0; i < inv.size; i++) if (inv.getItem(i)?.typeId === tipo) { player.addTag(etiqueta); return; }
    const it = new ItemStack(tipo, 1); // sem o addon do item, isto falha e o jogador fica sem a etiqueta
    if (manter) it.keepOnDeath = true;
    if (inv.emptySlotsCount > 0) inv.addItem(it);
    else player.dimension.spawnItem(it, player.location);
    player.addTag(etiqueta);
  } catch (e) { }
}
function darItensIniciais(player) {
  darUmaVez(player, RELIC, "unified:relic_given", true);
  darUmaVez(player, MOCHILA, "unified:mochila_dada", false);
}
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!zooming.has(player.id)) try { player.removeTag(SCOPE_TAG); } catch (e) { } // saiu do mundo com o zoom ligado
  if (initialSpawn) system.runTimeout(() => darItensIniciais(player), 100);
});
system.runTimeout(() => { for (const p of world.getAllPlayers()) darItensIniciais(p); }, 200);

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

// [Addon Pack] O Livro de Progresso RPG e o Livro do Viajante foram removidos (2026-10-25): o RPG Guide ja mostra o
// progresso e os capitulos do Viajante so geravam mensagens. Sem a definicao do item, exemplares antigos somem.

