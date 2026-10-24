// Forsaken Grimoires (Addon Pack)
// Grimorio guarda ate 9 feiticos (pergaminhos do Forsaken Odyssey) em ordem escolhida.
// Atril Arcano (bloco): tocar nele abre um menu (formularios do proprio jogo, sem UI JSON) com os 9 espacos do
// Grimorio: colocar/trocar/retirar pergaminhos, encher com os do inventario, tingir com corante, deixar invisivel.
// Segurando uma varinha (tag ntk:wand) com o Grimorio na mao secundaria, o feitico escolhido vai sozinho para a mao
// secundaria (onde a varinha busca a municao) e o Grimorio volta ao soltar a varinha.
// Agachar 2x rapido abre a barra de feiticos por 5 s: os 9 slots da hotbar viram "cartas" e girar/clicar escolhe.
// Classe Mago (RPG Addon): o feitico equipado nao e gasto, ate o nivel de pergaminho que o nivel do mago permite.
import { world, system, ItemStack, ItemLockMode, EquipmentSlot } from "@minecraft/server";
import { ActionFormData, ModalFormData, FormCancelationReason } from "@minecraft/server-ui";

const GRIMOIRE = "fgr:grimoire";
const GRIMOIRE_TAG = "fgr:grimoire";
const INVISIBLE = "fgr:grimoire_invisible";
const LECTERN = "fgr:arcane_lectern";
const P_SLOTS = "fgr:slots";   // no item: JSON [{id,n}|null] x9
const P_UID = "fgr:uid";       // no item: identificador do grimorio
const P_SEL = "fgr:sel";       // no item: espaco escolhido por ultimo (usado ao pegar a varinha)
const P_COLOR = "fgr:color";   // no item: cor que o grimorio invisivel volta a ter
const P_ACTIVE = "fgr:active"; // no jogador: {uid, idx, id, free, auto}
const P_STASH = "fgr:stash";   // no jogador: id da entidade que guarda a hotbar real
const CARD_EMPTY = "fgr:card_empty";
const MAX_SLOTS = 9;
const MAX_STACK = 64;          // pergaminhos por espaco do Grimorio
const ITEM_STACK = 64;         // tamanho real da pilha de pergaminhos no inventario
const TAP_WINDOW = 12;         // ticks entre os dois agachamentos (0,6 s)
const BAR_TICKS = 100;         // 5 s
const FREE_MARK = "§8Feitiço do Grimório (Mago)"; // lore do pergaminho que o mago usa sem gastar

// Mago (RPG Addon: placar "class" = 3, nivel no placar "level"). Nivel minimo para cada nivel de pergaminho;
// pergaminhos sem numero (invocacoes, teias) contam como nivel II.
const MAGE_CLASS = 3;
const MAGE_TIER_LEVEL = { 1: 1, 2: 8, 3: 15 };

const DYES = {
  white: ["minecraft:white_dye", "minecraft:bone_meal"], orange: ["minecraft:orange_dye"],
  magenta: ["minecraft:magenta_dye"], light_blue: ["minecraft:light_blue_dye"], yellow: ["minecraft:yellow_dye"],
  lime: ["minecraft:lime_dye"], pink: ["minecraft:pink_dye"], gray: ["minecraft:gray_dye"],
  light_gray: ["minecraft:light_gray_dye"], cyan: ["minecraft:cyan_dye"], purple: ["minecraft:purple_dye"],
  blue: ["minecraft:blue_dye", "minecraft:lapis_lazuli"], brown: ["minecraft:brown_dye", "minecraft:cocoa_beans"],
  green: ["minecraft:green_dye"], red: ["minecraft:red_dye"], black: ["minecraft:black_dye", "minecraft:ink_sac"],
};
const COLOR_NAMES = {
  white: "Branco", orange: "Laranja", magenta: "Magenta", light_blue: "Azul-claro", yellow: "Amarelo", lime: "Verde-limão",
  pink: "Rosa", gray: "Cinza", light_gray: "Cinza-claro", cyan: "Ciano", purple: "Roxo", blue: "Azul", brown: "Marrom",
  green: "Verde", red: "Vermelho", black: "Preto",
};
const idOfColor = (c) => (c === "purple" ? GRIMOIRE : `fgr:grimoire_${c}`);
const colorOfId = (id) => (id === GRIMOIRE ? "purple" : id.startsWith("fgr:grimoire_") ? id.slice(13) : null);
const isGlass = (it) => !!it && (it.typeId === "minecraft:glass" || it.typeId === "minecraft:tinted_glass" || /^minecraft:[a-z_]+_stained_glass$/.test(it.typeId));

const log = (...a) => console.warn("[Grimoire]", ...a);

// ---------- utilidades ----------
const invOf = (p) => p.getComponent("inventory").container;
const offhandOf = (p) => p.getComponent("equippable").getEquipmentSlot(EquipmentSlot.Offhand);
const isGrimoire = (it) => !!it && (it.typeId === GRIMOIRE || it.hasTag(GRIMOIRE_TAG));
const isScroll = (it) => !!it && it.hasTag("ntk:scroll") && !it.typeId.includes("empty_scroll");
const isWand = (it) => !!it && it.hasTag("ntk:wand");
const isFreeCopy = (it) => !!it && it.getLore().includes(FREE_MARK);
const tr = (id) => ({ translate: `item.${id.split(":")[0]}.${id.split(":")[1]}.name` });
const iconOf = (id) => `textures/items/nms/ntk_${id.split(":")[1]}`;
const ROMAN = { 1: "I", 2: "II", 3: "III" };
const tierOf = (id) => { const m = id.match(/_(\d)$/); return m ? Number(m[1]) : 2; };
const heldItem = (p) => invOf(p).getItem(p.selectedSlotIndex);

function pretty(id) {
  let n = id.split(":")[1].replace(/^summoning_scroll_of_/, "summon_").replace(/^scroll_of_/, "");
  const m = n.match(/_(\d)$/);
  if (m) n = n.slice(0, -2);
  n = n.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return n + (m ? " " + (ROMAN[m[1]] ?? m[1]) : "");
}

function score(p, name) {
  try { return world.scoreboard.getObjective(name)?.getScore(p) ?? 0; } catch { return 0; }
}
const isMage = (p) => score(p, "class") === MAGE_CLASS;
function mageMaxTier(p) {
  if (!isMage(p)) return 0;
  const lvl = Math.max(1, score(p, "level"));
  let t = 0;
  for (const [tier, need] of Object.entries(MAGE_TIER_LEVEL)) if (lvl >= need) t = Math.max(t, Number(tier));
  return t;
}
const mageFree = (p, id) => tierOf(id) <= mageMaxTier(p);

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
const uidOf = (item) => item.getDynamicProperty(P_UID);
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
  const free = mageFree(p, e.id);
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
  say(p, { rawtext: [{ text: `§dFeitiço §f${idx + 1}: §d` }, tr(e.id), { text: free ? " §b(∞ Mago)" : ` §8(x${e.n} restantes)` }] });
  p.playSound("random.orb", { volume: 0.6, pitch: 1.4 });
  return true;
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
  if (e && e.id === st.id && st.free && mageFree(p, e.id)) { // mago: o feitico nao acaba
    oh.setItem(scrollFor(st.id, true));
    return;
  }
  if (e && e.id === st.id && e.n > 0) {
    e.n -= 1;
    commit(p, g, slots);
    oh.setItem(new ItemStack(st.id, 1));
    if (st.free) setState(p, { ...st, free: false }); // perdeu o nivel/classe: passa a gastar
  } else {
    if (e && e.id === st.id && e.n <= 0) { slots[st.idx] = null; commit(p, g, slots); } // espaco esgotado: libera
    setState(p, null);
    returnGrimoire(p, g);
    say(p, "§eSem pergaminhos desse feitiço: Grimório de volta à mão");
  }
}

// Copias "de mago" nunca saem da mao secundaria: se aparecerem no inventario (arrastadas, sobras), somem.
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

// Varinha na mao + Grimorio na mao secundaria: equipa o feitico escolhido sozinho; ao soltar a varinha, desfaz.
function autoWand(p) {
  const wand = isWand(heldItem(p));
  const st = getState(p);
  if (wand && !st) {
    const oh = offhandOf(p);
    if (!oh.hasItem() || !isGrimoire(oh.getItem())) return;
    const g = ensureUid(p, { loc: { t: "off" }, item: oh.getItem() });
    const slots = readSlots(g.item);
    const usable = (e) => e && (e.n > 0 || mageFree(p, e.id));
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
  try { c = new ItemStack(e ? cardOf(e.id) : CARD_EMPTY, e ? Math.max(1, Math.min(ITEM_STACK, e.n)) : 1); }
  catch { c = new ItemStack(CARD_EMPTY, 1); e = null; }
  c.lockMode = ItemLockMode.slot;
  if (e) {
    const stock = mageFree(p, e.id) ? "§b∞ (Mago)" : e.n > 0 ? `§7Estoque: §f${e.n}` : "§cEsgotado";
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
  system.runTimeout(() => { try { restoreHotbar(player); } catch (e) { log("restore", e); } }, 20);
});
// clicar (botao direito) numa carta tambem escolhe o feitico
world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (!itemStack || !itemStack.typeId.startsWith("fgr:card_")) return;
  const bar = bars.get(source.id);
  if (bar) choose(source, bar, source.selectedSlotIndex);
});

// ---------- Atril Arcano (menu) ----------
const busy = new Set(); // jogadores com o menu aberto

async function show(p, form) {
  for (let i = 0; i < 20; i++) {
    const r = await form.show(p);
    if (r.canceled && r.cancelationReason === FormCancelationReason.UserBusy) {
      await new Promise((ok) => system.runTimeout(ok, 5));
      continue;
    }
    return r;
  }
  return { canceled: true };
}

// O Grimorio que o atril usa: o da mao, o da mao secundaria ou o primeiro do inventario.
function lecternGrimoire(p) {
  const held = heldItem(p);
  if (isGrimoire(held)) return ensureUid(p, { loc: { t: "inv", i: p.selectedSlotIndex }, item: held });
  const list = allGrimoires(p);
  return list.length ? ensureUid(p, list[0]) : null;
}

function swapGrimoire(p, g, newId) {
  const old = g.item;
  const it = new ItemStack(newId, 1);
  for (const k of [P_SLOTS, P_UID, P_SEL, P_COLOR]) {
    const v = old.getDynamicProperty(k);
    if (v !== undefined) it.setDynamicProperty(k, v);
  }
  it.setLore(old.getLore());
  if (old.nameTag) it.nameTag = old.nameTag;
  slotAt(p, g.loc).setItem(it);
}

function slotLabel(e, i, p) {
  if (!e) return { rawtext: [{ text: `§8${i + 1}. Espaço vazio` }] };
  const stock = mageFree(p, e.id) ? " §b∞" : ` §8x${e.n}`;
  return { rawtext: [{ text: `§0${i + 1}. ` }, tr(e.id), { text: stock }] };
}

async function lecternMenu(p) {
  if (busy.has(p.id)) return;
  busy.add(p.id);
  try {
    if (getState(p)) unequip(p, true); // pergaminho na mao secundaria volta para o Grimorio antes de mexer
    for (let guard = 0; guard < 200; guard++) {
      const g = lecternGrimoire(p);
      if (!g) { say(p, "§dAtril Arcano§7: traga um §fGrimório§7 no inventário"); return; }
      const uid = uidOf(g.item);
      const slots = readSlots(g.item);
      const invisible = g.item.typeId === INVISIBLE;
      const tier = mageMaxTier(p);
      const info = tier > 0
        ? `§bMago: feitiços até o nível ${ROMAN[tier]} não são gastos (basta 1 pergaminho no espaço).`
        : "§7Cada lançamento gasta 1 pergaminho do espaço.";
      const form = new ActionFormData()
        .title("§5Atril Arcano")
        .body({ rawtext: [{ text: "§7Grimório: §f" }, { translate: `item.${g.item.typeId}.name` }, { text: `\n${info}\n§7Toque num espaço para colocar, trocar ou retirar pergaminhos.` }] });
      const actions = [];
      slots.forEach((e, i) => {
        form.button(slotLabel(e, i, p), e ? iconOf(e.id) : "textures/fgr/card_empty");
        actions.push(() => slotMenu(p, uid, i));
      });
      form.button("§2Encher com os pergaminhos do inventário", "textures/items/book_writable");
      actions.push(async () => fillAll(p, uid));
      if (slots.some((e) => e)) { form.button("§cEsvaziar o Grimório", "textures/ui/cancel"); actions.push(async () => emptyAll(p, uid)); }
      form.button("§6Tingir (usa 1 corante)", "textures/items/dye_powder_purple_new");
      actions.push(() => dyeMenu(p, uid));
      if (invisible) { form.button("§3Tornar visível", "textures/fgr/grimoire"); actions.push(async () => makeVisible(p, uid)); }
      else { form.button("§3Tornar invisível na mão (usa 1 vidro)", "textures/blocks/glass"); actions.push(async () => makeInvisible(p, uid)); }
      form.button("Fechar");
      const r = await show(p, form);
      if (r.canceled || r.selection === undefined || r.selection >= actions.length) return;
      await actions[r.selection]();
      p.playSound("item.book.page_turn", { volume: 0.8 });
    }
  } catch (e) { log("atril", e); } finally { busy.delete(p.id); }
}

async function slotMenu(p, uid, idx) {
  const g = findGrimoire(p, uid);
  if (!g) return;
  const slots = readSlots(g.item);
  const cur = slots[idx];
  const have = [...countInInventory(p, isScroll).entries()].sort((a, b) => pretty(a[0]).localeCompare(pretty(b[0])));
  const form = new ActionFormData().title(`§5Espaço ${idx + 1}`);
  form.body(cur
    ? { rawtext: [{ text: "§7Agora: §f" }, tr(cur.id), { text: ` §8x${cur.n}\n§7Escolha um pergaminho do inventário para colocar aqui.` }] }
    : "§7Escolha um pergaminho do inventário para colocar aqui.");
  const actions = [];
  for (const [id, n] of have) {
    form.button({ rawtext: [tr(id), { text: ` §8(você tem ${n})` }] }, iconOf(id));
    actions.push(() => putScroll(p, uid, idx, id, n));
  }
  if (cur) { form.button("§cRetirar daqui", "textures/ui/cancel"); actions.push(async () => takeOut(p, uid, idx)); }
  if (!have.length && !cur) form.body("§7Você não tem pergaminhos do Forsaken no inventário.");
  form.button("Voltar");
  const r = await show(p, form);
  if (r.canceled || r.selection === undefined || r.selection >= actions.length) return;
  await actions[r.selection]();
}

async function putScroll(p, uid, idx, id, have) {
  let g = findGrimoire(p, uid);
  if (!g) return;
  let slots = readSlots(g.item);
  const same = slots[idx] && slots[idx].id === id;
  const room = MAX_STACK - (same ? slots[idx].n : 0);
  let amount = Math.min(have, room);
  if (amount <= 0) { say(p, "§7Esse espaço já está cheio"); return; }
  if (amount > 1) {
    const free = mageFree(p, id);
    const m = new ModalFormData().title(`§5Espaço ${idx + 1}`)
      .slider({ rawtext: [{ text: free ? "§bMago: 1 já basta. §7Quantos colocar de " : "§7Quantos colocar de " }, tr(id), { text: "?" }] },
        1, amount, { valueStep: 1, defaultValue: free ? 1 : amount });
    const r = await show(p, m);
    if (r.canceled || !r.formValues) return;
    amount = Math.max(1, Math.min(amount, Number(r.formValues[0]) | 0));
  }
  g = findGrimoire(p, uid);
  if (!g) return;
  slots = readSlots(g.item);
  const missing = removeFromInventory(p, id, amount);
  amount -= missing;
  if (amount <= 0) return;
  if (slots[idx] && slots[idx].id !== id) giveItems(p, slots[idx].id, slots[idx].n); // troca: devolve os antigos
  if (slots[idx] && slots[idx].id === id) slots[idx].n += amount;
  else slots[idx] = { id, n: amount };
  g = findGrimoire(p, uid); // o inventario mudou: acha de novo
  if (!g) { giveItems(p, id, amount); return; }
  commit(p, g, slots);
}

function takeOut(p, uid, idx) {
  const g = findGrimoire(p, uid);
  if (!g) return;
  const slots = readSlots(g.item);
  const e = slots[idx];
  if (!e) return;
  slots[idx] = null;
  commit(p, g, slots);
  giveItems(p, e.id, e.n);
}

function fillAll(p, uid) {
  let g = findGrimoire(p, uid);
  if (!g) return;
  const slots = readSlots(g.item);
  const have = countInInventory(p, isScroll);
  let added = 0;
  // primeiro completa os espacos que ja tem o mesmo pergaminho, depois ocupa os vazios
  for (const e of slots) {
    if (!e || !have.has(e.id)) continue;
    const k = Math.min(have.get(e.id), MAX_STACK - e.n);
    if (k <= 0) continue;
    const got = k - removeFromInventory(p, e.id, k);
    e.n += got; added += got; have.delete(e.id);
  }
  for (const [id, n] of have) {
    const i = slots.findIndex((e) => !e);
    if (i < 0) break;
    const k = Math.min(n, MAX_STACK);
    const got = k - removeFromInventory(p, id, k);
    if (got > 0) { slots[i] = { id, n: got }; added += got; }
  }
  g = findGrimoire(p, uid);
  if (!g) return;
  commit(p, g, slots);
  say(p, added ? `§dGrimório: §f${added} pergaminho(s) guardado(s)` : "§7Nenhum pergaminho novo para guardar");
}

function emptyAll(p, uid) {
  const g = findGrimoire(p, uid);
  if (!g) return;
  const slots = readSlots(g.item);
  commit(p, g, slots.map(() => null));
  for (const e of slots) if (e && e.n > 0) giveItems(p, e.id, e.n);
}

async function dyeMenu(p, uid) {
  const c = invOf(p);
  const owned = [];
  for (const [color, ids] of Object.entries(DYES)) {
    for (let i = 0; i < c.size; i++) {
      const it = c.getItem(i);
      if (it && ids.includes(it.typeId)) { owned.push({ color, id: it.typeId }); break; }
    }
  }
  if (!owned.length) { say(p, "§7Tenha um corante no inventário para tingir o Grimório"); return; }
  const form = new ActionFormData().title("§5Tingir o Grimório").body("§7Escolha a cor. Gasta 1 corante; os feitiços continuam dentro.");
  for (const o of owned) form.button(`§0${COLOR_NAMES[o.color]}`, `textures/fgr/${o.color === "purple" ? "grimoire" : "grimoire_" + o.color}`);
  form.button("Voltar");
  const r = await show(p, form);
  if (r.canceled || r.selection === undefined || r.selection >= owned.length) return;
  const o = owned[r.selection];
  const g = findGrimoire(p, uid);
  if (!g) return;
  if (removeFromInventory(p, o.id, 1) > 0) return;
  const g2 = findGrimoire(p, uid);
  if (!g2) return;
  g2.item.setDynamicProperty(P_COLOR, o.color);
  swapGrimoire(p, g2, idOfColor(o.color));
  say(p, `§dGrimório agora é ${COLOR_NAMES[o.color]}`);
}

function makeInvisible(p, uid) {
  const g = findGrimoire(p, uid);
  if (!g) return;
  const c = invOf(p);
  let glass = null;
  for (let i = 0; i < c.size; i++) if (isGlass(c.getItem(i))) { glass = c.getItem(i).typeId; break; }
  if (!glass) { say(p, "§7Tenha 1 bloco de vidro no inventário"); return; }
  removeFromInventory(p, glass, 1);
  const g2 = findGrimoire(p, uid);
  if (!g2) return;
  g2.item.setDynamicProperty(P_COLOR, colorOfId(g2.item.typeId) ?? "purple");
  swapGrimoire(p, g2, INVISIBLE);
  say(p, "§dGrimório invisível na mão §8(o ícone continua no inventário)");
}

function makeVisible(p, uid) {
  const g = findGrimoire(p, uid);
  if (!g) return;
  const color = g.item.getDynamicProperty(P_COLOR);
  swapGrimoire(p, g, idOfColor(typeof color === "string" && DYES[color] ? color : "purple"));
  say(p, "§dGrimório visível de novo");
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("fgr:atril", {
    onPlayerInteract({ player }) {
      if (!player) return;
      system.run(() => { lecternMenu(player); });
    },
  });
});

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
