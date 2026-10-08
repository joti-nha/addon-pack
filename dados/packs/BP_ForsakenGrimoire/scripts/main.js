// Forsaken Grimoires (Addon Pack)
// Grimorio guarda ate 9 feiticos (pergaminhos do Forsaken Odyssey) em ordem escolhida.
// Atril Arcano (bloco) = bancada com inventario de verdade (tela de bau do proprio jogo) para montar o Grimorio.
// Com o Grimorio na mao secundaria, agachar 2x rapido abre a barra de feiticos por 5 s:
// girar/escolher um slot da hotbar equipa o feitico (a hotbar real nunca e alterada).
// A barra de feiticos troca de verdade os 9 slots da hotbar por "cartas" (itens bloqueados) e devolve os itens
// reais ao fechar; os itens reais ficam guardados numa entidade invisivel (fgr:stash), nunca soltos.
// O feitico equipado vai para a mao secundaria, onde as varinhas do Forsaken buscam a municao.
import { world, system, ItemStack, ItemLockMode, EquipmentSlot } from "@minecraft/server";

const GRIMOIRE = "fgr:grimoire";
const LECTERN = "fgr:arcane_lectern";
const P_SLOTS = "fgr:slots";   // no item: JSON [{id,n}|null] x9
const P_UID = "fgr:uid";       // no item: identificador do grimorio
const P_ACTIVE = "fgr:active"; // no jogador: {uid, idx, id}
const P_STASH = "fgr:stash";   // no jogador: id da entidade que guarda a hotbar real
const CARD_EMPTY = "fgr:card_empty";
const MAX_SLOTS = 9;
const MAX_STACK = 64;          // pergaminhos por espaco do Grimorio
const ITEM_STACK = 64;         // tamanho real da pilha de pergaminhos no inventario
const TAP_WINDOW = 12;         // ticks entre os dois agachamentos (0,6 s)
const BAR_TICKS = 100;         // 5 s

const log = (...a) => console.warn("[Grimoire]", ...a);

// ---------- utilidades ----------
const invOf = (p) => p.getComponent("inventory").container;
const offhandOf = (p) => p.getComponent("equippable").getEquipmentSlot(EquipmentSlot.Offhand);
const isScroll = (it) => !!it && it.hasTag("ntk:scroll") && !it.typeId.includes("empty_scroll");
const tr = (id) => ({ translate: `item.${id.split(":")[0]}.${id.split(":")[1]}.name` });
const sleep = (t) => new Promise((r) => system.runTimeout(r, t));
const ROMAN = { 1: "I", 2: "II", 3: "III" };

function pretty(id) {
  let n = id.split(":")[1].replace(/^summoning_scroll_of_/, "summon_").replace(/^scroll_of_/, "");
  const m = n.match(/_(\d)$/);
  if (m) n = n.slice(0, -2);
  n = n.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return n + (m ? " " + (ROMAN[m[1]] ?? m[1]) : "");
}
function short(id) {
  let n = id.split(":")[1].replace(/^summoning_scroll_of_/, "summon_").replace(/^scroll_of_/, "");
  const m = n.match(/_(\d)$/);
  if (m) n = n.slice(0, -2);
  const w = n.split("_");
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  const base = w.length === 1 ? cap(w[0].slice(0, 7)) : cap(w[0].slice(0, 4)) + cap(w[1].slice(0, 3));
  return base + (m ? m[1] : "");
}

function readSlots(item) {
  let a = [];
  try { a = JSON.parse(item.getDynamicProperty(P_SLOTS) ?? "[]"); } catch { a = []; }
  const out = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const e = a[i];
    out.push(e && typeof e.id === "string" ? { id: e.id, n: Math.max(0, e.n | 0) } : null);
  }
  return out;
}
function writeSlots(item, slots) {
  item.setDynamicProperty(P_SLOTS, JSON.stringify(slots));
  const lore = ["§5Grimório de feitiços"];
  slots.forEach((e, i) => {
    if (e) lore.push(`§7${i + 1}. §f${pretty(e.id)} §8x${e.n}`);
  });
  if (lore.length === 1) lore.push("§8(vazio) use o Atril Arcano");
  item.setLore(lore);
  return item;
}
function uidOf(item) { return item.getDynamicProperty(P_UID); }

// Local de um item: {t:"off"} ou {t:"inv", i}
function slotAt(p, loc) { return loc.t === "off" ? offhandOf(p) : invOf(p).getSlot(loc.i); }

function allGrimoires(p) {
  const res = [];
  const oh = offhandOf(p);
  if (oh.hasItem() && oh.typeId === GRIMOIRE) res.push({ loc: { t: "off" }, item: oh.getItem() });
  const c = invOf(p);
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (it && it.typeId === GRIMOIRE) res.push({ loc: { t: "inv", i }, item: it });
  }
  return res;
}
function ensureUid(p, g) {
  if (uidOf(g.item)) return g;
  g.item.setDynamicProperty(P_UID, `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`);
  slotAt(p, g.loc).setItem(g.item);
  return g;
}
function findGrimoire(p, uid) {
  return allGrimoires(p).find((g) => uidOf(g.item) === uid) ?? null;
}
function commit(p, g, slots) {
  writeSlots(g.item, slots);
  slotAt(p, g.loc).setItem(g.item);
}
function firstEmpty(p) {
  const c = invOf(p);
  for (let i = 9; i < c.size; i++) if (!c.getItem(i)) return i;
  for (let i = 0; i < 9; i++) if (!c.getItem(i)) return i;
  return -1;
}
function giveItems(p, id, n) {
  const c = invOf(p);
  while (n > 0) {
    const k = Math.min(n, ITEM_STACK);
    n -= k;
    let left;
    try { left = c.addItem(new ItemStack(id, k)); } catch { return; }
    if (left) p.dimension.spawnItem(left, p.location);
  }
}
function removeFromInventory(p, id, n) {
  const c = invOf(p);
  for (let i = 0; i < c.size && n > 0; i++) {
    const it = c.getItem(i);
    if (!it || it.typeId !== id) continue;
    const take = Math.min(it.amount, n);
    n -= take;
    if (it.amount - take <= 0) c.setItem(i, undefined);
    else { it.amount -= take; c.setItem(i, it); }
  }
}
function scrollsInInventory(p) {
  const map = new Map();
  const c = invOf(p);
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (isScroll(it)) map.set(it.typeId, (map.get(it.typeId) ?? 0) + it.amount);
  }
  return map;
}
const say = (p, text) => p.onScreenDisplay.setActionBar(text);

// ---------- feitico equipado (mao secundaria) ----------
const getState = (p) => {
  const raw = p.getDynamicProperty(P_ACTIVE);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
const setState = (p, st) => p.setDynamicProperty(P_ACTIVE, st ? JSON.stringify(st) : undefined);

// Move o grimorio de volta para a mao secundaria, se ela estiver livre.
function returnGrimoire(p, g) {
  const oh = offhandOf(p);
  if (oh.hasItem()) return;
  const item = g.item;
  slotAt(p, g.loc).setItem(undefined);
  oh.setItem(item);
}

function unequip(p, silent = false) {
  const st = getState(p);
  if (!st) return;
  setState(p, null);
  const oh = offhandOf(p);
  const g = findGrimoire(p, st.uid);
  if (oh.hasItem() && oh.typeId === st.id) {
    if (g) {
      const slots = readSlots(g.item);
      if (slots[st.idx] && slots[st.idx].id === st.id) slots[st.idx].n = Math.min(MAX_STACK, slots[st.idx].n + 1);
      else giveItems(p, st.id, 1);
      commit(p, g, slots);
    } else giveItems(p, st.id, 1);
    oh.setItem(undefined);
  }
  const g2 = g ? findGrimoire(p, st.uid) : null;
  if (g2 && g2.loc.t === "inv") returnGrimoire(p, g2);
  if (!silent) say(p, "§7Feitiço guardado no Grimório");
}

function equip(p, uid, idx) {
  const st = getState(p);
  const g = findGrimoire(p, uid);
  if (!g) { setState(p, null); return; }
  const slots = readSlots(g.item);
  const e = slots[idx];
  if (!e) { say(p, `§7Slot ${idx + 1} vazio`); return; }
  if (st && st.uid === uid && st.idx === idx) { unequip(p); return; }
  if (e.n <= 0) { say(p, `§cSem pergaminhos no slot ${idx + 1}`); return; }
  const oh = offhandOf(p);
  let dest = g;
  if (st) {
    // devolve o pergaminho que estava na mao secundaria
    if (oh.hasItem() && oh.typeId === st.id && slots[st.idx] && slots[st.idx].id === st.id) {
      slots[st.idx].n = Math.min(MAX_STACK, slots[st.idx].n + 1);
    }
  } else if (g.loc.t === "off") {
    const free = firstEmpty(p);
    if (free < 0) { say(p, "§cInventário cheio: libere um espaço"); return; }
    invOf(p).setItem(free, g.item);
    dest = { loc: { t: "inv", i: free }, item: g.item };
  }
  e.n -= 1;
  commit(p, dest, slots);
  oh.setItem(new ItemStack(e.id, 1));
  setState(p, { uid, idx, id: e.id });
  say(p, { rawtext: [{ text: `§dEquipado §f${idx + 1}: §d` }, tr(e.id), { text: ` §8(x${e.n} restantes)` }] });
  p.playSound("random.orb", { volume: 0.6, pitch: 1.4 });
}

// Recarrega o proximo pergaminho quando o da mao secundaria foi consumido pela varinha.
function maintain(p) {
  const st = getState(p);
  if (!st) return;
  const oh = offhandOf(p);
  if (oh.hasItem()) {
    if (oh.typeId !== st.id) setState(p, null); // o jogador trocou o item da mao: abandona
    return;
  }
  const g = findGrimoire(p, st.uid);
  if (!g) { setState(p, null); return; }
  const slots = readSlots(g.item);
  const e = slots[st.idx];
  if (e && e.id === st.id && e.n > 0) {
    e.n -= 1;
    commit(p, g, slots);
    oh.setItem(new ItemStack(st.id, 1));
  } else {
    if (e && e.id === st.id && e.n <= 0) { slots[st.idx] = null; commit(p, g, slots); } // espaco esgotado: libera
    setState(p, null);
    returnGrimoire(p, g);
    say(p, "§eSem pergaminhos desse feitiço: Grimório de volta à mão");
  }
}

// ---------- barra de feiticos (duplo agachar) ----------
const bars = new Map(); // playerId -> {until, base, uid}
const sneakPrev = new Map();
const lastTap = new Map();
const cardOf = (id) => "fgr:card_" + id.split(":")[1];

function makeCard(e, active) {
  let c;
  try { c = new ItemStack(e ? cardOf(e.id) : CARD_EMPTY, e ? Math.max(1, Math.min(ITEM_STACK, e.n)) : 1); }
  catch { c = new ItemStack(CARD_EMPTY, 1); e = null; }
  c.lockMode = ItemLockMode.slot;
  if (e) c.setLore([e.n > 0 ? `§7Estoque: §f${e.n}` : "§cEsgotado", active ? "§aEquipado" : "§8Gire a hotbar ou clique para equipar"]);
  return c;
}

// Devolve a hotbar real (da entidade-estoque) e remove as cartas. Retorna false se ainda nao deu (tenta de novo depois).
function restoreHotbar(p) {
  const sid = p.getDynamicProperty(P_STASH);
  if (!sid) return true;
  const stash = world.getEntity(sid);
  if (!stash) return false;
  const sc = stash.getComponent("inventory").container;
  const pc = invOf(p);
  const strays = [];
  for (let i = 0; i < 9; i++) { // 1) tira cartas e itens que o jogador tenha colocado nesses slots
    const cur = pc.getItem(i);
    if (!cur) continue;
    if (!cur.typeId.startsWith("fgr:card_")) strays.push(cur);
    pc.setItem(i, undefined);
  }
  for (let i = 0; i < 9; i++) { // 2) devolve os itens reais para os mesmos slots
    if (sc.getItem(i)) sc.moveItem(i, i, pc);
  }
  for (const it of strays) { // 3) itens perdidos vao para qualquer espaco livre (ou caem aos pes)
    const left = pc.addItem(it);
    if (left) p.dimension.spawnItem(left, p.location);
  }
  for (let i = 0; i < 9; i++) if (sc.getItem(i)) return false; // algo nao voltou: nao apaga a entidade
  stash.remove();
  p.setDynamicProperty(P_STASH, undefined);
  return true;
}

function closeBar(p) {
  bars.delete(p.id);
  if (!restoreHotbar(p)) log("hotbar ainda nao restaurada para", p.name);
}

function renderBar(p, bar) {
  const left = Math.max(0, Math.ceil((bar.until - system.currentTick) / 20));
  return `§5Feitiços§r: gire a hotbar ou clique num slot §8(${left}s)`;
}

function openBar(p) {
  if (p.getDynamicProperty(P_STASH)) return; // ja aberta / recuperacao pendente
  const st = getState(p);
  let g = st ? findGrimoire(p, st.uid) : null;
  if (!g) {
    const oh = offhandOf(p);
    if (oh.hasItem() && oh.typeId === GRIMOIRE) g = ensureUid(p, { loc: { t: "off" }, item: oh.getItem() });
  }
  if (!g) return;
  const slots = readSlots(g.item);
  if (!slots.some((e) => e)) { say(p, "§7Grimório vazio: use o Atril Arcano"); return; }
  const uid = uidOf(g.item);
  // guarda a hotbar real
  let stash;
  try { stash = p.dimension.spawnEntity("fgr:stash", p.location); } catch (e) { log("stash", e); say(p, "§cNão foi possível abrir a barra"); return; }
  const sc = stash.getComponent("inventory").container;
  const pc = invOf(p);
  p.setDynamicProperty(P_STASH, stash.id);
  for (let i = 0; i < 9; i++) if (pc.getItem(i)) pc.moveItem(i, i, sc);
  for (let i = 0; i < 9; i++) {
    if (pc.getItem(i)) { // nao saiu: aborta e restaura
      restoreHotbar(p);
      say(p, "§cNão foi possível abrir a barra");
      return;
    }
  }
  for (let i = 0; i < 9; i++) pc.setItem(i, makeCard(slots[i], !!(st && st.uid === uid && st.idx === i)));
  const bar = { until: system.currentTick + BAR_TICKS, base: p.selectedSlotIndex, uid, stashId: stash.id };
  bars.set(p.id, bar);
  say(p, renderBar(p, bar));
  p.playSound("random.pop", { volume: 0.5, pitch: 1.2 });
}

function choose(p, bar, sel) {
  p.selectedSlotIndex = bar.base; // a posicao da hotbar nao muda
  closeBar(p);
  equip(p, bar.uid, sel);
}

function tickPlayer(p, tick) {
  // detecta duplo agachar
  const sn = p.isSneaking;
  const prev = sneakPrev.get(p.id) ?? false;
  sneakPrev.set(p.id, sn);
  if (sn && !prev) {
    const last = lastTap.get(p.id) ?? -999;
    if (tick - last <= TAP_WINDOW && !bars.has(p.id)) {
      lastTap.delete(p.id);
      const oh = offhandOf(p);
      if (getState(p) || (oh.hasItem() && oh.typeId === GRIMOIRE)) openBar(p);
    } else lastTap.set(p.id, tick);
  }
  // barra aberta
  const bar = bars.get(p.id);
  if (!bar) {
    if (tick % 100 === 0 && p.getDynamicProperty(P_STASH)) restoreHotbar(p); // recuperacao (queda, recarga de scripts)
    return;
  }
  const stash = world.getEntity(bar.stashId);
  if (stash && tick % 5 === 0) { try { stash.teleport(p.location, { dimension: p.dimension }); } catch { /* ignore */ } }
  const sel = p.selectedSlotIndex;
  if (sel !== bar.base) choose(p, bar, sel);
  else if (tick >= bar.until) { closeBar(p); say(p, ""); }
  else if (tick % 10 === 0) say(p, renderBar(p, bar));
}

system.runInterval(() => {
  const tick = system.currentTick;
  for (const p of world.getPlayers()) {
    try {
      tickPlayer(p, tick);
      if (tick % 2 === 0) maintain(p);
    } catch (e) { log("erro", e); }
  }
}, 1);

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  bars.delete(playerId); sneakPrev.delete(playerId); lastTap.delete(playerId);
});
world.afterEvents.playerSpawn.subscribe(({ player }) => {
  bars.delete(player.id);
  system.runTimeout(() => { try { restoreHotbar(player); } catch (e) { log("restore", e); } }, 20);
});
// clicar (botao direito) numa carta tambem escolhe o feitico
world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (!itemStack || !itemStack.typeId.startsWith("fgr:card_")) return;
  const bar = bars.get(source.id);
  if (bar) choose(source, bar, source.selectedSlotIndex);
});

// ---------- Atril Arcano (bancada com inventario real) ----------
// O bloco tem, em cima, uma entidade invisivel (fgr:lectern) com 18 espacos. Tocar no livro abre a tela de bau do jogo:
//   linha de cima (espacos 0-8) = os 9 feiticos, na ordem;  linha de baixo, espaco do meio (13) = o Grimorio.
// Ao colocar o Grimorio, os pergaminhos guardados nele aparecem na linha de cima; tudo o que voce mexer ali e
// gravado no Grimorio a cada tick; ao tirar o Grimorio, a linha de cima esvazia (os pergaminhos vao dentro dele).
// Nenhuma tela propria (JSON UI) e usada, para nao interferir nos menus dos outros addons.
const LECTERN_ENT = "fgr:lectern";
const L_GSLOT = 13;
const L_LOADED = "fgr:loaded"; // na entidade: uid do Grimorio cujos pergaminhos estao materializados
const lecternPos = (b) => ({ x: b.location.x + 0.5, y: b.location.y + 0.8125, z: b.location.z + 0.5 });

function lecternAt(block) {
  const c = lecternPos(block);
  return block.dimension.getEntities({ type: LECTERN_ENT, location: c, maxDistance: 0.8 })[0];
}
function ensureLectern(block) {
  let e = lecternAt(block);
  if (!e) { try { e = block.dimension.spawnEntity(LECTERN_ENT, lecternPos(block)); } catch (err) { log("atril", err); } }
  return e;
}
function eject(ent, item) {
  try { ent.dimension.spawnItem(item, { x: ent.location.x, y: ent.location.y + 0.4, z: ent.location.z }); } catch (e) { log("eject", e); }
}
function tickLectern(ent) {
  const c = ent.getComponent("inventory")?.container;
  if (!c) return;
  // bloco sumiu (quebrado, explodido, empurrado): devolve o conteudo e remove a entidade
  let block;
  try { block = ent.dimension.getBlock({ x: Math.floor(ent.location.x), y: Math.floor(ent.location.y), z: Math.floor(ent.location.z) }); } catch { return; }
  if (!block) return; // chunk nao carregado
  const g = c.getItem(L_GSLOT);
  const isGrim = !!g && g.typeId === GRIMOIRE;
  let loaded = ent.getDynamicProperty(L_LOADED);
  if (block.typeId !== LECTERN) {
    for (let i = 0; i < c.size; i++) {
      const it = c.getItem(i);
      if (!it) continue;
      if (i < MAX_SLOTS && loaded) { c.setItem(i, undefined); continue; } // ja estao gravados no Grimorio
      eject(ent, it); c.setItem(i, undefined);
    }
    ent.remove();
    return;
  }
  // espacos que nao sao usados: devolve o que for colocado
  for (let i = MAX_SLOTS; i < c.size; i++) {
    if (i === L_GSLOT) continue;
    const it = c.getItem(i);
    if (it) { c.setItem(i, undefined); eject(ent, it); }
  }
  if (g && !isGrim) { c.setItem(L_GSLOT, undefined); eject(ent, g); }
  if (!isGrim) {
    if (loaded) { // o Grimorio saiu: os pergaminhos da linha de cima ja estao dentro dele
      for (let i = 0; i < MAX_SLOTS; i++) c.setItem(i, undefined);
      ent.setDynamicProperty(L_LOADED, undefined);
    }
    return;
  }
  let uid = uidOf(g);
  if (!uid) {
    uid = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
    g.setDynamicProperty(P_UID, uid);
    c.setItem(L_GSLOT, g);
  }
  if (loaded !== uid) { // Grimorio novo no atril: mostra os pergaminhos dele
    for (let i = 0; i < MAX_SLOTS; i++) {
      const it = c.getItem(i);
      if (!it) continue;
      c.setItem(i, undefined);
      if (!loaded) eject(ent, it); // soltos, colocados antes do Grimorio: devolve
    }
    const slots = readSlots(g);
    slots.forEach((e, i) => {
      if (!e || e.n <= 0) return;
      try { c.setItem(i, new ItemStack(e.id, Math.min(ITEM_STACK, e.n))); } catch { /* pergaminho de addon ausente */ }
    });
    ent.setDynamicProperty(L_LOADED, uid);
    return;
  }
  // mesmo Grimorio: grava o estado atual da linha de cima
  const now = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const it = c.getItem(i);
    if (!it) { now.push(null); continue; }
    if (!isScroll(it)) { c.setItem(i, undefined); eject(ent, it); now.push(null); continue; }
    now.push({ id: it.typeId, n: it.amount });
  }
  if (JSON.stringify(now) !== JSON.stringify(readSlots(g))) {
    writeSlots(g, now);
    c.setItem(L_GSLOT, g);
  }
}
system.runInterval(() => {
  const seen = new Set();
  for (const p of world.getPlayers()) {
    let list;
    try { list = p.dimension.getEntities({ type: LECTERN_ENT, location: p.location, maxDistance: 10 }); } catch { continue; }
    for (const ent of list) {
      if (seen.has(ent.id)) continue;
      seen.add(ent.id);
      try { tickLectern(ent); } catch (e) { log("atril", e); }
    }
  }
}, 1);

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  if (block.typeId === LECTERN) ensureLectern(block);
});
// Tocar na madeira do bloco: garante a entidade (atris antigos) e avisa onde tocar.
const lastHint = new Map();
world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
  if (ev.block.typeId !== LECTERN) return;
  const { block, player } = ev;
  system.run(() => {
    try {
      ensureLectern(block);
      const t = system.currentTick;
      if (t - (lastHint.get(player.id) ?? -99) < 20) return;
      lastHint.set(player.id, t);
      say(player, "§dAtril Arcano§7: toque no §flivro§7 em cima para abrir");
    } catch (e) { log("atril", e); }
  });
});
