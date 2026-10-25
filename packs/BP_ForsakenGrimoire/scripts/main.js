// Forsaken Grimoires (Addon Pack)
// Grimorio guarda ate 9 feiticos (pergaminhos do Forsaken Odyssey) em ordem escolhida.
// Atril Arcano (bloco): tocar no livro em cima abre uma vitrine (tela de bau propria, ui/fgr_atril.json): 9 espacos
// de feitico em 3x3 e o espaco do Grimorio. Pondo o Grimorio, os pergaminhos dele aparecem nos 9 espacos; o que voce
// mexer ali e gravado nele; ao tirar o Grimorio, os espacos esvaziam (tudo vai dentro dele).
// Tomo Infinito num espaco: o feitico daquele espaco nao acaba. Os tomos sao vendidos pela loja do Mago (RPG Addon).
// O tomo tambem funciona sozinho: na mao secundaria com uma varinha na mao, ele lanca o feitico sem gastar.
// Cada tomo tem dono (o primeiro jogador que o tiver): com outro jogador ele nao funciona e volta para o dono.
// Cor e invisibilidade: na mesa de trabalho (Grimorio + corante, ou + vidro); os feiticos passam para o Grimorio novo.
// Segurando uma varinha (tag ntk:wand) com o Grimorio na mao secundaria, o feitico escolhido vai sozinho para a mao
// secundaria (onde a varinha busca a municao) e o Grimorio volta ao soltar a varinha.
// Agachar 2x rapido abre a barra de feiticos por 5 s: os 9 slots da hotbar viram "cartas" e girar/clicar escolhe.
import { world, system, ItemStack, ItemLockMode, EquipmentSlot } from "@minecraft/server";
import { TOMES } from "./tomos.js";

const GRIMOIRE = "fgr:grimoire";
const GRIMOIRE_TAG = "fgr:grimoire";
const INVISIBLE = "fgr:grimoire_invisible";
const LECTERN = "fgr:arcane_lectern";
const P_SLOTS = "fgr:slots";   // no item: JSON [{id,n,tome?}|null] x9 (tome: Tomo Infinito no espaco)
const P_UID = "fgr:uid";       // no item: identificador do grimorio
const P_SEL = "fgr:sel";       // no item: espaco escolhido por ultimo (usado ao pegar a varinha)
const P_COLOR = "fgr:color";   // no item: cor que o grimorio invisivel volta a ter
const P_ACTIVE = "fgr:active"; // no jogador: {uid, idx, id, free, auto}
const P_STASH = "fgr:stash";   // no jogador: id da entidade que guarda a hotbar real
const P_OWNER = "fgr:owner";   // no tomo: id do dono
const P_OWNER_NAME = "fgr:owner_name"; // no tomo: nome do dono (para o texto)
const P_SOLO = "fgr:solo_tome"; // no jogador: tomo tirado da mao secundaria enquanto ele lanca sozinho
const W_TOME_RETURN = "fgr:tome_return"; // no mundo: {idDoDono: [tomos]} a devolver quando o dono entrar
const CARD_EMPTY = "fgr:card_empty";
const MAX_SLOTS = 9;
const MAX_STACK = 64;          // pergaminhos por espaco do Grimorio
const ITEM_STACK = 64;         // tamanho real da pilha de pergaminhos no inventario
const TAP_WINDOW = 12;         // ticks entre os dois agachamentos (0,6 s)
const BAR_TICKS = 100;         // 5 s
const FREE_MARK = "§8Feitiço do Tomo Infinito"; // lore do pergaminho lancado sem gastar (espaco com tomo)
const OLD_FREE_MARK = "§8Feitiço do Grimório (Mago)"; // versao anterior (bonus do Mago, removido)

const colorOfId = (id) => (id === GRIMOIRE ? "purple" : id.startsWith("fgr:grimoire_") ? id.slice(13) : null);

const log = (...a) => console.warn("[Grimoire]", ...a);

// ---------- utilidades ----------
const invOf = (p) => p.getComponent("inventory").container;
const offhandOf = (p) => p.getComponent("equippable").getEquipmentSlot(EquipmentSlot.Offhand);
const isGrimoire = (it) => !!it && (it.typeId === GRIMOIRE || it.hasTag(GRIMOIRE_TAG));
const isScroll = (it) => !!it && it.hasTag("ntk:scroll") && !it.typeId.includes("empty_scroll");
const isWand = (it) => !!it && it.hasTag("ntk:wand");
const isFreeCopy = (it) => { if (!it) return false; const l = it.getLore(); return l.includes(FREE_MARK) || l.includes(OLD_FREE_MARK); };
const isTome = (it) => !!it && TOMES[it.typeId] !== undefined;
const tr = (id) => ({ translate: `item.${id.split(":")[0]}.${id.split(":")[1]}.name` });
const iconOf = (id) => `textures/items/nms/ntk_${id.split(":")[1]}`;
const ROMAN = { 1: "I", 2: "II", 3: "III" };
const heldItem = (p) => invOf(p).getItem(p.selectedSlotIndex);

function pretty(id) {
  let n = id.split(":")[1].replace(/^summoning_scroll_of_/, "summon_").replace(/^scroll_of_/, "");
  const m = n.match(/_(\d)$/);
  if (m) n = n.slice(0, -2);
  n = n.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return n + (m ? " " + (ROMAN[m[1]] ?? m[1]) : "");
}

function readSlots(item) {
  let a = [];
  try { a = JSON.parse(item.getDynamicProperty(P_SLOTS) ?? "[]"); } catch { a = []; }
  const out = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const e = a[i];
    if (!e || typeof e.id !== "string") { out.push(null); continue; }
    const tome = typeof e.tome === "string" && TOMES[e.tome] ? e.tome : undefined;
    out.push(tome ? withOwner({ id: TOMES[tome], n: 0, tome }, e.owner, e.ownerName) : { id: e.id, n: Math.max(0, e.n | 0) });
  }
  return out;
}
function writeSlots(item, slots) {
  item.setDynamicProperty(P_SLOTS, JSON.stringify(slots));
  const lore = ["§5Grimório de feitiços"];
  slots.forEach((e, i) => {
    if (e) lore.push(`§7${i + 1}. §f${pretty(e.id)} ${e.tome ? "§6∞" : `§8x${e.n}`}`);
  });
  if (lore.length === 1) lore.push("§8(vazio) use o Atril Arcano");
  item.setLore(lore);
  return item;
}
const uidOf = (item) => item.getDynamicProperty(P_UID);
function withOwner(e, owner, name) {
  if (typeof owner === "string") { e.owner = owner; if (typeof name === "string") e.ownerName = name; }
  return e;
}
const ownerOf = (it) => { const o = it.getDynamicProperty(P_OWNER); return typeof o === "string" ? o : undefined; };
const canUseTome = (p, e) => !!e && !!e.tome && (!e.owner || e.owner === p.id);
function stampOwner(it, id, name) {
  it.setDynamicProperty(P_OWNER, id);
  if (name) it.setDynamicProperty(P_OWNER_NAME, name);
  it.setLore([`§7Dono: §f${name ?? "?"}`, "§8Mão secundária + varinha: lança sem gastar", "§8Ou guarde no Atril Arcano / RPG Guide"]);
  return it;
}
function tomeItem(e) {
  const it = new ItemStack(e.tome, 1);
  if (e.owner) stampOwner(it, e.owner, e.ownerName);
  return it;
}
const newUid = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

// Local de um item: {t:"off"} ou {t:"inv", i}
function slotAt(p, loc) { return loc.t === "off" ? offhandOf(p) : invOf(p).getSlot(loc.i); }

function allGrimoires(p) {
  const res = [];
  const oh = offhandOf(p);
  if (oh.hasItem() && isGrimoire(oh.getItem())) res.push({ loc: { t: "off" }, item: oh.getItem() });
  const c = invOf(p);
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (isGrimoire(it)) res.push({ loc: { t: "inv", i }, item: it });
  }
  return res;
}
function ensureUid(p, g) {
  if (uidOf(g.item)) return g;
  g.item.setDynamicProperty(P_UID, newUid());
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
    if (!it || it.typeId !== id || isFreeCopy(it)) continue;
    const take = Math.min(it.amount, n);
    n -= take;
    if (it.amount - take <= 0) c.setItem(i, undefined);
    else { it.amount -= take; c.setItem(i, it); }
  }
  return n; // quanto faltou
}
function countInInventory(p, pred) {
  const map = new Map();
  const c = invOf(p);
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (it && pred(it) && !isFreeCopy(it)) map.set(it.typeId, (map.get(it.typeId) ?? 0) + it.amount);
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

function scrollFor(id, free) {
  const it = new ItemStack(id, 1);
  if (free) { it.setLore([FREE_MARK]); it.keepOnDeath = true; }
  return it;
}

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
  if (st.solo) { unequipSolo(p, st); return; }
  setState(p, null);
  const oh = offhandOf(p);
  const g = findGrimoire(p, st.uid);
  if (oh.hasItem() && oh.typeId === st.id) {
    if (!st.free && !isFreeCopy(oh.getItem())) {
      if (g) {
        const slots = readSlots(g.item);
        if (slots[st.idx] && slots[st.idx].id === st.id) slots[st.idx].n = Math.min(MAX_STACK, slots[st.idx].n + 1);
        else giveItems(p, st.id, 1);
        commit(p, g, slots);
      } else giveItems(p, st.id, 1);
    }
    oh.setItem(undefined);
  }
  const g2 = g ? findGrimoire(p, st.uid) : null;
  if (g2 && g2.loc.t === "inv") returnGrimoire(p, g2);
  if (!silent) say(p, "§7Feitiço guardado no Grimório");
}

const fullWarn = new Map();
function equip(p, uid, idx, auto = false) {
  const st = getState(p);
  const g = findGrimoire(p, uid);
  if (!g) { setState(p, null); return false; }
  const slots = readSlots(g.item);
  const e = slots[idx];
  if (!e) { say(p, `§7Espaço ${idx + 1} do Grimório vazio`); return false; }
  if (st && st.uid === uid && st.idx === idx && !auto) { unequip(p); return false; }
  if (e.tome && !canUseTome(p, e)) { say(p, `§cO Tomo Infinito do espaço ${idx + 1} é de ${e.ownerName ?? "outro jogador"}`); return false; }
  const free = !!e.tome;
  if (!free && e.n <= 0) { say(p, `§cSem pergaminhos no espaço ${idx + 1}`); return false; }
  const oh = offhandOf(p);
  let dest = g;
  if (st) {
    // devolve o pergaminho que estava na mao secundaria
    if (oh.hasItem() && oh.typeId === st.id && !st.free && !isFreeCopy(oh.getItem()) && slots[st.idx] && slots[st.idx].id === st.id) {
      slots[st.idx].n = Math.min(MAX_STACK, slots[st.idx].n + 1);
    }
  } else if (g.loc.t === "off") {
    const free_i = firstEmpty(p);
    if (free_i < 0) {
      const t = system.currentTick;
      if (t - (fullWarn.get(p.id) ?? -999) > 100) { fullWarn.set(p.id, t); say(p, "§cInventário cheio: libere um espaço para o Grimório"); }
      return false;
    }
    invOf(p).setItem(free_i, g.item);
    dest = { loc: { t: "inv", i: free_i }, item: g.item };
  }
  if (!free) e.n -= 1;
  dest.item.setDynamicProperty(P_SEL, idx);
  commit(p, dest, slots);
  oh.setItem(scrollFor(e.id, free));
  setState(p, { uid, idx, id: e.id, free, auto });
  say(p, { rawtext: [{ text: `§dFeitiço §f${idx + 1}: §d` }, tr(e.id), { text: free ? " §6(∞ Tomo)" : ` §8(x${e.n} restantes)` }] });
  p.playSound("random.orb", { volume: 0.6, pitch: 1.4 });
  return true;
}

// Recarrega o proximo pergaminho quando o da mao secundaria foi consumido pela varinha.
function maintain(p) {
  const st = getState(p);
  if (!st) return;
  const oh = offhandOf(p);
  if (st.solo) { // tomo sozinho: repoe a copia gratis
    if (oh.hasItem()) { if (oh.typeId !== st.id) unequipSolo(p, st); return; }
    oh.setItem(scrollFor(st.id, true));
    return;
  }
  if (oh.hasItem()) {
    if (oh.typeId !== st.id) setState(p, null); // o jogador trocou o item da mao: abandona
    return;
  }
  const g = findGrimoire(p, st.uid);
  if (!g) { setState(p, null); return; }
  const slots = readSlots(g.item);
  const e = slots[st.idx];
  if (e && e.id === st.id && st.free && canUseTome(p, e)) { // tomo infinito: o feitico nao acaba
    oh.setItem(scrollFor(st.id, true));
    return;
  }
  if (e && e.id === st.id && e.n > 0) {
    e.n -= 1;
    commit(p, g, slots);
    oh.setItem(new ItemStack(st.id, 1));
    if (st.free) setState(p, { ...st, free: false }); // o tomo saiu do espaco: passa a gastar
  } else {
    if (e && e.id === st.id && e.n <= 0) { slots[st.idx] = null; commit(p, g, slots); } // espaco esgotado: libera
    setState(p, null);
    returnGrimoire(p, g);
    say(p, "§eSem pergaminhos desse feitiço: Grimório de volta à mão");
  }
}

// Copias do tomo nunca saem da mao secundaria: se aparecerem no inventario (arrastadas, sobras), somem.
function purgeFreeCopies(p) {
  const c = invOf(p);
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (it && isScroll(it) && isFreeCopy(it)) c.setItem(i, undefined);
  }
  const st = getState(p);
  const oh = offhandOf(p);
  if (oh.hasItem() && isFreeCopy(oh.getItem()) && (!st || !st.free || oh.typeId !== st.id)) oh.setItem(undefined);
}

// ---------- tomo sozinho (sem Grimorio) ----------
// Varinha na mao + tomo na mao secundaria: o tomo vai para o jogador (propriedade P_SOLO) e a copia gratis do
// pergaminho fica na mao secundaria; ao soltar a varinha (ou trocar o item da mao), o tomo volta.
function equipSolo(p, oh) {
  const tome = oh.getItem();
  const owner = ownerOf(tome);
  if (owner && owner !== p.id) return false; // claimTomes devolve ao dono
  const id = TOMES[tome.typeId];
  p.setDynamicProperty(P_SOLO, JSON.stringify({ tome: tome.typeId, owner: owner ?? p.id, ownerName: tome.getDynamicProperty(P_OWNER_NAME) ?? p.name }));
  oh.setItem(scrollFor(id, true));
  setState(p, { uid: null, idx: -1, id, free: true, auto: true, solo: true });
  say(p, { rawtext: [{ text: "§dTomo Infinito: §f" }, tr(id), { text: " §6(∞)" }] });
  p.playSound("random.orb", { volume: 0.6, pitch: 1.4 });
  return true;
}
function restoreSoloTome(p) {
  const raw = p.getDynamicProperty(P_SOLO);
  if (!raw) return;
  p.setDynamicProperty(P_SOLO, undefined);
  let d; try { d = JSON.parse(raw); } catch { return; }
  if (!d || !TOMES[d.tome]) return;
  const it = tomeItem({ tome: d.tome, owner: d.owner, ownerName: d.ownerName });
  const oh = offhandOf(p);
  if (!oh.hasItem()) { oh.setItem(it); return; }
  const left = invOf(p).addItem(it);
  if (left) p.dimension.spawnItem(left, p.location);
}
function unequipSolo(p, st) {
  setState(p, null);
  const oh = offhandOf(p);
  if (oh.hasItem() && oh.typeId === st.id && isFreeCopy(oh.getItem())) oh.setItem(undefined);
  restoreSoloTome(p);
}

// Varinha na mao + Grimorio na mao secundaria: equipa o feitico escolhido sozinho; ao soltar a varinha, desfaz.
function autoWand(p) {
  const wand = isWand(heldItem(p));
  const st = getState(p);
  if (wand && !st) {
    const oh = offhandOf(p);
    if (oh.hasItem() && isTome(oh.getItem())) { equipSolo(p, oh); return; }
    if (!oh.hasItem() || !isGrimoire(oh.getItem())) return;
    const g = ensureUid(p, { loc: { t: "off" }, item: oh.getItem() });
    const slots = readSlots(g.item);
    const usable = (e) => e && (e.n > 0 || canUseTome(p, e));
    let sel = g.item.getDynamicProperty(P_SEL);
    if (typeof sel !== "number" || !usable(slots[sel])) sel = slots.findIndex(usable);
    if (sel < 0) {
      const t = system.currentTick;
      if (t - (fullWarn.get(p.id + "v") ?? -999) > 100) { fullWarn.set(p.id + "v", t); say(p, "§7Grimório sem feitiços: use o Atril Arcano"); }
      return;
    }
    equip(p, uidOf(g.item), sel, true);
  } else if (!wand && st && st.auto) unequip(p, true);
}

// ---------- barra de feiticos (duplo agachar) ----------
const bars = new Map(); // playerId -> {until, base, uid}
const sneakPrev = new Map();
const lastTap = new Map();
const cardOf = (id) => "fgr:card_" + id.split(":")[1];

function makeCard(p, e, active) {
  let c;
  try { c = new ItemStack(e ? cardOf(e.id) : CARD_EMPTY, e ? Math.max(1, Math.min(ITEM_STACK, e.tome ? 1 : e.n)) : 1); }
  catch { c = new ItemStack(CARD_EMPTY, 1); e = null; }
  c.lockMode = ItemLockMode.slot;
  if (e) {
    const stock = e.tome ? "§6∞ (Tomo Infinito)" : e.n > 0 ? `§7Estoque: §f${e.n}` : "§cEsgotado";
    c.setLore([stock, active ? "§aEquipado" : "§8Gire a hotbar ou clique para equipar"]);
  }
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
    if (oh.hasItem() && isGrimoire(oh.getItem())) g = ensureUid(p, { loc: { t: "off" }, item: oh.getItem() });
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
  const wasWand = isWand(heldItem(p));
  for (let i = 0; i < 9; i++) if (pc.getItem(i)) pc.moveItem(i, i, sc);
  for (let i = 0; i < 9; i++) {
    if (pc.getItem(i)) { // nao saiu: aborta e restaura
      restoreHotbar(p);
      say(p, "§cNão foi possível abrir a barra");
      return;
    }
  }
  for (let i = 0; i < 9; i++) pc.setItem(i, makeCard(p, slots[i], !!(st && st.uid === uid && st.idx === i)));
  const bar = { until: system.currentTick + BAR_TICKS, base: p.selectedSlotIndex, uid, stashId: stash.id, wand: wasWand };
  bars.set(p.id, bar);
  say(p, renderBar(p, bar));
  p.playSound("random.pop", { volume: 0.5, pitch: 1.2 });
}

function choose(p, bar, sel) {
  p.selectedSlotIndex = bar.base; // a posicao da hotbar nao muda
  closeBar(p);
  if (!equip(p, bar.uid, sel, bar.wand)) return;
  const g = findGrimoire(p, bar.uid);
  if (g) { g.item.setDynamicProperty(P_SEL, sel); slotAt(p, g.loc).setItem(g.item); }
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
      if (getState(p) || (oh.hasItem() && isGrimoire(oh.getItem()))) openBar(p);
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
      if (tick % 2 === 0 && !bars.has(p.id) && !p.getDynamicProperty(P_STASH)) { autoWand(p); maintain(p); }
      if (tick % 20 === 0 && !bars.has(p.id)) purgeFreeCopies(p);
    } catch (e) { log("erro", e); }
  }
}, 1);

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  bars.delete(playerId); sneakPrev.delete(playerId); lastTap.delete(playerId);
});
world.afterEvents.playerSpawn.subscribe(({ player }) => {
  bars.delete(player.id);
  system.runTimeout(() => {
    try { restoreHotbar(player); } catch (e) { log("restore", e); }
    try { const st = getState(player); if (st?.solo) unequipSolo(player, st); else restoreSoloTome(player); } catch (e) { log("tomo", e); }
  }, 20);
});
// clicar (botao direito) numa carta tambem escolhe o feitico
world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (!itemStack || !itemStack.typeId.startsWith("fgr:card_")) return;
  const bar = bars.get(source.id);
  if (bar) choose(source, bar, source.selectedSlotIndex);
});

// ---------- Atril Arcano (vitrine) ----------
// Sobre o bloco fica uma entidade invisivel (fgr:atril_vitrine) com 10 espacos. Tocar no livro em cima abre a tela
// dela, desenhada em RP_ForsakenGrimoire/ui/fgr_atril.json (escolhida pelo nome "§5Atril Arcano"):
//   espacos 0-8 = os 9 feiticos em 3x3, na ordem;  espaco 9 = o Grimorio.
// Grimorio no espaco 9: os pergaminhos e tomos dele aparecem nos 9 espacos; tudo o que voce mexer ali e gravado nele
// a cada tick; ao tirar o Grimorio, os espacos esvaziam (o conteudo ja esta dentro dele).
const VITRINE = "fgr:atril_vitrine";
const V_TITLE = "§5Atril Arcano"; // a tela propria e escolhida por este nome (ui/fgr_atril.json)
const V_BOOK = 9;
const V_LOADED = "fgr:loaded"; // na entidade: uid do Grimorio cujos feiticos estao nos 9 espacos
const V_SNAP = "fgr:snap";     // na entidade: os 9 espacos como foram gravados no Grimorio pela ultima vez
const vitrinePos = (b) => ({ x: b.location.x + 0.5, y: b.location.y + 0.75, z: b.location.z + 0.5 });

// Correcoes pendentes (uid -> espacos): quando o Grimorio sai do atril no mesmo tick em que o jogador tirou algo dos
// espacos, o que ficou e gravado nele assim que ele aparecer num inventario ou atril. Evita duplicar pergaminhos.
const W_PENDING = "fgr:pending";
// Grimorios aposentados: o conteudo foi para um Grimorio novo (tingido na mesa de trabalho). Se uma copia antiga
// aparecer (guardada num bau, por exemplo), ela e esvaziada.
const W_RETIRED = "fgr:retired";
function worldJson(key, def) {
  try { return JSON.parse(world.getDynamicProperty(key) ?? "null") ?? def; } catch { return def; }
}
const setWorldJson = (key, v) => world.setDynamicProperty(key, JSON.stringify(v));
function addPending(uid, slots) { const m = worldJson(W_PENDING, {}); m[uid] = slots; setWorldJson(W_PENDING, m); }
function retire(uid) {
  const a = worldJson(W_RETIRED, []);
  if (!a.includes(uid)) { a.push(uid); setWorldJson(W_RETIRED, a.slice(-300)); }
}
// Aplica correcao pendente ou esvaziamento num Grimorio. Retorna true se mudou o item.
function settle(item) {
  const uid = uidOf(item);
  if (!uid) return false;
  if (worldJson(W_RETIRED, []).includes(uid)) {
    item.setDynamicProperty(P_UID, newUid());
    item.setDynamicProperty(P_SEL, undefined);
    writeSlots(item, readSlots(item).map(() => null));
    return true;
  }
  const m = worldJson(W_PENDING, {});
  if (!m[uid]) return false;
  writeSlots(item, m[uid]);
  delete m[uid];
  setWorldJson(W_PENDING, m);
  return true;
}
function settlePlayer(p) {
  for (const g of allGrimoires(p)) if (settle(g.item)) slotAt(p, g.loc).setItem(g.item);
}

function vitrineAt(block) {
  return block.dimension.getEntities({ type: VITRINE, location: vitrinePos(block), maxDistance: 0.6 })[0];
}
function ensureVitrine(block) {
  let e = vitrineAt(block);
  if (!e) {
    try { e = block.dimension.spawnEntity(VITRINE, vitrinePos(block)); } catch (err) { log("atril", err); return undefined; }
  }
  if (e.nameTag !== V_TITLE) e.nameTag = V_TITLE;
  return e;
}
function eject(ent, item) {
  try { ent.dimension.spawnItem(item, { x: ent.location.x, y: ent.location.y + 0.4, z: ent.location.z }); } catch (e) { log("eject", e); }
}
// Le os 9 espacos da vitrine; devolve o que nao for pergaminho nem tomo.
function readVitrine(ent, c) {
  const now = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    const it = c.getItem(i);
    if (!it) { now.push(null); continue; }
    if (isTome(it)) { now.push(withOwner({ id: TOMES[it.typeId], n: 0, tome: it.typeId }, ownerOf(it), it.getDynamicProperty(P_OWNER_NAME))); continue; }
    if (isScroll(it) && isFreeCopy(it)) { c.setItem(i, undefined); now.push(null); continue; } // copia do tomo: some
    if (!isScroll(it)) { c.setItem(i, undefined); eject(ent, it); now.push(null); continue; }
    now.push({ id: it.typeId, n: it.amount });
  }
  return now;
}
function showSlots(c, slots) {
  slots.forEach((e, i) => {
    c.setItem(i, undefined);
    if (!e) return;
    try {
      if (e.tome) c.setItem(i, tomeItem(e));
      else if (e.n > 0) c.setItem(i, new ItemStack(e.id, Math.min(ITEM_STACK, e.n)));
    } catch { /* pergaminho de addon ausente */ }
  });
}
// O Grimorio que estava carregado saiu: se os espacos mudaram depois da ultima gravacao, guarda a correcao.
function unload(ent, c) {
  const loaded = ent.getDynamicProperty(V_LOADED);
  if (!loaded) return;
  const now = readVitrine(ent, c);
  if (JSON.stringify(now) !== (ent.getDynamicProperty(V_SNAP) ?? "")) addPending(loaded, now);
  for (let i = 0; i < MAX_SLOTS; i++) c.setItem(i, undefined);
  ent.setDynamicProperty(V_LOADED, undefined);
  ent.setDynamicProperty(V_SNAP, undefined);
}

function tickVitrine(ent) {
  const c = ent.getComponent("inventory")?.container;
  if (!c) return;
  let block;
  try { block = ent.dimension.getBlock({ x: Math.floor(ent.location.x), y: Math.floor(ent.location.y), z: Math.floor(ent.location.z) }); } catch { return; }
  if (!block) return; // chunk nao carregado
  if (ent.nameTag !== V_TITLE) ent.nameTag = V_TITLE;
  const g = c.getItem(V_BOOK);
  const isGrim = isGrimoire(g);
  const loaded = ent.getDynamicProperty(V_LOADED);
  // bloco sumiu (quebrado, explodido, empurrado): o Grimorio cai com o conteudo atual e a entidade some
  if (block.typeId !== LECTERN) {
    if (isGrim && loaded && uidOf(g) === loaded) writeSlots(g, readVitrine(ent, c));
    for (let i = 0; i < c.size; i++) {
      const it = c.getItem(i);
      if (!it) continue;
      c.setItem(i, undefined);
      if (i < MAX_SLOTS && loaded) continue; // ja estao no Grimorio
      if (i < MAX_SLOTS && isFreeCopy(it)) continue;
      eject(ent, i === V_BOOK && isGrim ? g : it);
    }
    ent.remove();
    return;
  }
  if (g && !isGrim) { c.setItem(V_BOOK, undefined); eject(ent, g); }
  if (!isGrim) {
    if (loaded) unload(ent, c);
    else { // sem Grimorio os espacos nao guardam nada: devolve o que for colocado
      for (let i = 0; i < MAX_SLOTS; i++) {
        const it = c.getItem(i);
        if (!it) continue;
        c.setItem(i, undefined);
        if (!isFreeCopy(it)) eject(ent, it);
      }
    }
    return;
  }
  let changed = settle(g);
  let uid = uidOf(g);
  if (!uid) { uid = newUid(); g.setDynamicProperty(P_UID, uid); changed = true; }
  if (changed) c.setItem(V_BOOK, g);
  if (loaded !== uid) { // Grimorio novo no atril
    if (loaded) unload(ent, c);
    else for (let i = 0; i < MAX_SLOTS; i++) { const it = c.getItem(i); if (it) { c.setItem(i, undefined); if (!isFreeCopy(it)) eject(ent, it); } }
    const slots = readSlots(g);
    showSlots(c, slots);
    ent.setDynamicProperty(V_LOADED, uid);
    ent.setDynamicProperty(V_SNAP, JSON.stringify(readVitrine(ent, c)));
    clearCraftWatch(uid);
    return;
  }
  // mesmo Grimorio: grava o estado atual dos 9 espacos
  const now = readVitrine(ent, c);
  const snap = JSON.stringify(now);
  if (snap !== ent.getDynamicProperty(V_SNAP)) {
    writeSlots(g, now);
    c.setItem(V_BOOK, g);
    ent.setDynamicProperty(V_SNAP, snap);
  }
}
system.runInterval(() => {
  const seen = new Set();
  for (const p of world.getPlayers()) {
    let list;
    try { list = p.dimension.getEntities({ type: VITRINE, location: p.location, maxDistance: 12 }); } catch { continue; }
    for (const ent of list) {
      if (seen.has(ent.id)) continue;
      seen.add(ent.id);
      try { tickVitrine(ent); } catch (e) { log("atril", e); }
    }
  }
}, 1);

world.afterEvents.playerPlaceBlock.subscribe(({ block }) => {
  if (block.typeId === LECTERN) system.run(() => { try { ensureVitrine(block); } catch (e) { log("atril", e); } });
});

// Abrir a vitrine: o feitico da mao secundaria volta para o Grimorio e, se o espaco do livro estiver vazio, o
// Grimorio da mao secundaria vai sozinho para ele (a tela de bau nao mostra a mao secundaria). Ao sair, ele volta.
const backToOffhand = new Map(); // uid -> id do jogador
world.afterEvents.playerInteractWithEntity.subscribe(({ player, target }) => {
  if (target?.typeId !== VITRINE) return;
  system.run(() => {
    try {
      if (getState(player)) unequip(player, true);
      const c = target.getComponent("inventory")?.container;
      const oh = offhandOf(player);
      if (!c || c.getItem(V_BOOK) || !oh.hasItem() || !isGrimoire(oh.getItem())) return;
      const g = ensureUid(player, { loc: { t: "off" }, item: oh.getItem() });
      oh.setItem(undefined);
      c.setItem(V_BOOK, g.item);
      backToOffhand.set(uidOf(g.item), player.id);
    } catch (e) { log("atril", e); }
  });
});

// Tocar na madeira do bloco: garante a entidade e avisa onde tocar.
const lastHint = new Map();
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("fgr:atril", {
    onPlayerInteract({ block, player }) {
      if (!player) return;
      system.run(() => {
        try {
          ensureVitrine(block);
          const t = system.currentTick;
          if (t - (lastHint.get(player.id) ?? -99) < 20) return;
          lastHint.set(player.id, t);
          say(player, "§dAtril Arcano§7: toque no §flivro§7 em cima para abrir");
        } catch (e) { log("atril", e); }
      });
    },
  });
});

// ---------- cor e invisibilidade na mesa de trabalho ----------
// A receita cria um Grimorio novo, sem os dados do antigo. Quando um Grimorio sai do inventario (foi para a mesa) e,
// pouco depois, aparece um Grimorio de outro tipo sem identificador, os feiticos passam para ele e o antigo e
// aposentado (se uma copia dele voltar, ela vem vazia).
const CRAFT_TICKS = 1200; // 60 s
const craftWatch = new Map(); // id do jogador -> {uid, typeId, slots, sel, color, name, tick}
function clearCraftWatch(uid) {
  for (const [pid, w] of craftWatch) if (w.uid === uid) craftWatch.delete(pid);
}
world.afterEvents.playerInventoryItemChange.subscribe(({ player, beforeItemStack, itemStack, slot }) => {
  const before = isGrimoire(beforeItemStack) ? beforeItemStack : null;
  const after = isGrimoire(itemStack) ? itemStack : null;
  if (before && uidOf(before) && (!after || uidOf(after) !== uidOf(before))) {
    const old = player.getDynamicProperty(P_STASH) ? null : before; // barra de feiticos aberta: nao e a mesa
    if (old) craftWatch.set(player.id, {
      uid: uidOf(old), typeId: old.typeId, slots: old.getDynamicProperty(P_SLOTS), sel: old.getDynamicProperty(P_SEL),
      color: old.getDynamicProperty(P_COLOR), name: old.nameTag, tick: system.currentTick,
    });
  }
  if (!after) return;
  const uid = uidOf(after);
  system.run(() => {
    try {
      const inv = invOf(player);
      const item = inv.getItem(slot);
      if (!item || item.typeId !== after.typeId) return;
      if (uid) {
        clearCraftWatch(uid); // voltou para o inventario: nao foi tingido
        if (settle(item)) inv.setItem(slot, item);
        if (backToOffhand.get(uid) === player.id) {
          backToOffhand.delete(uid);
          const oh = offhandOf(player);
          if (!oh.hasItem()) { inv.setItem(slot, undefined); oh.setItem(item); }
        }
        return;
      }
      const w = craftWatch.get(player.id);
      if (!w || system.currentTick - w.tick > CRAFT_TICKS || w.typeId === item.typeId) return;
      if (findGrimoire(player, w.uid)) { craftWatch.delete(player.id); return; }
      craftWatch.delete(player.id);
      if (typeof w.slots === "string") item.setDynamicProperty(P_SLOTS, w.slots);
      if (typeof w.sel === "number") item.setDynamicProperty(P_SEL, w.sel);
      if (item.typeId === INVISIBLE) item.setDynamicProperty(P_COLOR, colorOfId(w.typeId) ?? (typeof w.color === "string" ? w.color : "purple"));
      item.setDynamicProperty(P_UID, newUid());
      if (w.name) item.nameTag = w.name;
      writeSlots(item, readSlots(item));
      inv.setItem(slot, item);
      retire(w.uid);
      say(player, "§dGrimório: §7os feitiços passaram para o novo Grimório");
    } catch (e) { log("mesa", e); }
  });
});
// ---------- dono dos tomos ----------
// Tomo sem dono ganha o primeiro jogador que o tiver. Tomo de outro jogador sai do inventario e volta para o dono
// (na hora, se ele estiver online; senao quando ele entrar).
function giveToOwner(ownerId, it) {
  const owner = world.getPlayers().find((x) => x.id === ownerId);
  if (owner) {
    const left = invOf(owner).addItem(it);
    if (left) owner.dimension.spawnItem(left, owner.location);
    say(owner, "§dUm Tomo Infinito seu voltou para você");
    return;
  }
  const m = worldJson(W_TOME_RETURN, {});
  (m[ownerId] ??= []).push({ tome: it.typeId, ownerName: it.getDynamicProperty(P_OWNER_NAME) });
  setWorldJson(W_TOME_RETURN, m);
}
function claimTomes(p) {
  const fix = (it, put) => {
    if (!isTome(it)) return;
    const owner = ownerOf(it);
    if (!owner) { put(stampOwner(it, p.id, p.name)); return; }
    if (owner === p.id) return;
    put(undefined);
    giveToOwner(owner, it);
    say(p, `§cEsse Tomo Infinito é de ${it.getDynamicProperty(P_OWNER_NAME) ?? "outro jogador"}: ele voltou para o dono`);
  };
  const c = invOf(p);
  for (let i = 0; i < c.size; i++) fix(c.getItem(i), (v) => c.setItem(i, v));
  const oh = offhandOf(p);
  if (oh.hasItem()) fix(oh.getItem(), (v) => oh.setItem(v));
  const m = worldJson(W_TOME_RETURN, {});
  if (m[p.id]) {
    for (const d of m[p.id]) {
      if (!TOMES[d.tome]) continue;
      const left = c.addItem(tomeItem({ tome: d.tome, owner: p.id, ownerName: d.ownerName ?? p.name }));
      if (left) p.dimension.spawnItem(left, p.location);
    }
    delete m[p.id];
    setWorldJson(W_TOME_RETURN, m);
    say(p, "§dSeus Tomos Infinitos voltaram para você");
  }
}
system.runInterval(() => {
  for (const p of world.getPlayers()) {
    try { settlePlayer(p); } catch (e) { log("settle", e); }
    try { claimTomes(p); } catch (e) { log("tomos", e); }
  }
}, 40);

// ---------- atris antigos (entidade fgr:lectern com inventario) ----------
// Versoes anteriores punham uma entidade com 18 espacos sobre o bloco. Ela e desfeita: o que estiver dentro cai no
// chao (os pergaminhos da linha de cima de um Grimorio carregado ja estao gravados nele, entao nao sao duplicados).
const LECTERN_ENT = "fgr:lectern";
function retireOldLectern(ent) {
  const c = ent.getComponent("inventory")?.container;
  const loaded = ent.getDynamicProperty("fgr:loaded");
  if (c) {
    for (let i = 0; i < c.size; i++) {
      const it = c.getItem(i);
      if (!it) continue;
      c.setItem(i, undefined);
      if (i < MAX_SLOTS && loaded) continue;
      try { ent.dimension.spawnItem(it, { x: ent.location.x, y: ent.location.y + 0.4, z: ent.location.z }); } catch (e) { log("atril antigo", e); }
    }
  }
  ent.remove();
}
system.runInterval(() => {
  for (const p of world.getPlayers()) {
    let list;
    try { list = p.dimension.getEntities({ type: LECTERN_ENT, location: p.location, maxDistance: 32 }); } catch { continue; }
    for (const ent of list) { try { retireOldLectern(ent); } catch (e) { log("atril antigo", e); } }
  }
}, 40);
