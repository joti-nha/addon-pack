// [Addon Pack] Cajados de todos os addons funcionam como as varinhas:
// - botao de usar com um pergaminho magico na mao secundaria: lanca o pergaminho (gasta 1, como a varinha; a
//   copia gratis do Grimorio/Tomo Infinito e reposta pelo Forsaken Grimoires);
// - varinhas (tag ntk:wand) e cajados conjuram: segurar o botao de usar pelo tempo de cast (CAST_TICKS) e o
//   pergaminho sai so no fim da animacao (nunca no toque); soltar antes cancela. A Varinha Tecedora busca o pergaminho tambem no
//   inventario. O projetil e o do proprio pergaminho; se o impacto dele nao rodar, o script dispara o evento;
// - botao de ataque: lanca o feitico proprio do cajado. Os do Forsaken rodam aqui; os de outros addons recebem
//   "scriptevent fgr:cajado_ataque <item>" (cada addon tem o seu ouvinte) ou o "dungeons:force_artefact" do Dungeons.
import { world, system, EquipmentSlot } from "@minecraft/server";
import { STAFFS, SCROLL_PROJECTILES, CAST_TICKS, STAFF_CAST_TICKS } from "./cajados_dados.js";
import { ItemShootProjectileOnUseComponent } from "../item_component/shoot_projectile_on_use.js";
import { ItemReleaseEffectOnUseComponent } from "../item_component/release_effect_on_use.js";
import { damageItemDurability, decreaseItemStack, decreaseItemStackInventory } from "../ntk_functions.js";
import {
  clearSkyMagicSpell,
  rainMagicSpell,
  thunderstormMagicSpell,
  hoardingMagicSpell1,
  hoardingMagicSpell2,
  hoardingMagicSpell3,
  homewardBoundMagicSpell
} from "./magic_scroll_spells.js";
import { unknownMagicSpell } from "./unknown_scroll_spells.js";

const POWER = 1.5;      // velocidade do projetil do pergaminho
const CAST_GAP = 20;    // ticks entre dois pergaminhos lancados por cajado
const lastCast = new Map();

export function scrollInOffhand(entity) {
  try {
    const it = entity.getComponent("equippable")?.getEquipment(EquipmentSlot.Offhand);
    return it?.hasTag("ntk:magic_scroll") ? it : undefined;
  } catch (e) { return undefined; }
}

// Varinha Tecedora: mao secundaria primeiro, depois o primeiro pergaminho do inventario
function scrollInInventory(player) {
  const off = scrollInOffhand(player);
  if (off) return { item: off };
  const inv = player.getComponent("inventory")?.container;
  if (!inv) return undefined;
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (it?.hasTag("ntk:magic_scroll")) return { item: it, slot: i };
  }
  return undefined;
}

const WAND = {}; // varinha: so lanca pergaminhos (sem feitico proprio nem recarga)

const INSTANT = {
  "ntk:scroll_of_clear_sky": clearSkyMagicSpell,
  "ntk:scroll_of_rain": rainMagicSpell,
  "ntk:scroll_of_thunderstorm": thunderstormMagicSpell,
  "ntk:scroll_of_hoarding_1": hoardingMagicSpell1,
  "ntk:scroll_of_hoarding_2": hoardingMagicSpell2,
  "ntk:scroll_of_hoarding_3": hoardingMagicSpell3,
  "ntk:scroll_of_homeward_bound": (p) => { homewardBoundMagicSpell(p); return p.getSpawnPoint() !== undefined; },
  "ntk:unknown_scroll": unknownMagicSpell,
};

// projeteis lancados aqui: se o evento de impacto da entidade nao rodar, o script dispara ele (efeito e area originais)
const launched = new Map(); // id -> entidade

function castScroll(player, staff, st, scroll, slot) {
  const t = system.currentTick;
  if (t - (lastCast.get(player.id) ?? -999) < CAST_GAP) return;
  lastCast.set(player.id, t);
  // a recarga propria do cajado (que o botao de usar dispara) nao vale para o pergaminho
  if (st.cd) system.run(() => { try { player.startItemCooldown(st.cd, 0); } catch (e) {} });
  let spent = true;
  const instant = INSTANT[scroll.typeId];
  if (instant) spent = instant(player) !== false;
  else {
    const proj = SCROLL_PROJECTILES[scroll.typeId];
    if (!proj) return;
    const v = player.getViewDirection();
    const h = player.getHeadLocation();
    const ent = player.dimension.spawnEntity(proj, { x: h.x + v.x, y: h.y + v.y - 0.1, z: h.z + v.z });
    const pc = ent.getComponent("minecraft:projectile");
    if (pc) { pc.owner = player; pc.shoot({ x: v.x * POWER, y: v.y * POWER, z: v.z * POWER }); }
    launched.set(ent.id, ent);
    // o timer da entidade estoura o feitico em 4 s; se ele nao rodar, estoura aqui
    system.runTimeout(() => fire(ent, "event:on_timer_down"), 85);
    player.dimension.playSound("block.enchanting_table.use", player.location, { pitch: 1.3, volume: 1.0 });
  }
  if (spent) {
    if (slot === undefined) decreaseItemStack(player, scroll, 1, EquipmentSlot.Offhand);
    else decreaseItemStackInventory(player, scroll, 1, slot);
    damageItemDurability(player, staff, 1, EquipmentSlot.Mainhand, false);
  }
}

function fire(ent, event) {
  if (!launched.has(ent.id)) return;
  launched.delete(ent.id);
  try { if (ent.isValid) ent.triggerEvent(event); } catch (e) {}
}
const onProjectileHit = ({ projectile }) => {
  if (!projectile || !launched.has(projectile.id)) return;
  // o proprio impacto da entidade some com ela no tick seguinte; se ela continuar ali, o impacto nao rodou
  system.runTimeout(() => fire(projectile, "event:on_hit"), 2);
};
world.afterEvents.projectileHitBlock.subscribe(onProjectileHit);
world.afterEvents.projectileHitEntity.subscribe(onProjectileHit);

function scrollFor(player, item) {
  return item.hasTag("ntk:spellweaver_wand") ? scrollInInventory(player) : { item: scrollInOffhand(player) };
}
function castWith(player, item, st) {
  const found = scrollFor(player, item);
  if (!found?.item) return;
  try { castScroll(player, item, st, found.item, found.slot); } catch (e) { console.warn("[Addon Pack] cajado", e); }
}

// Conjuracao: a varinha gira enquanto o botao de usar fica apertado e so para quando conjura (CAST_TICKS).
// As varinhas tem uso longo (ferramentas/varinhas.py): o uso nao recomeca sozinho, o timer conjura uma vez por toque
// e o anexo fica no quadro carregado ate soltar. Os cajados terminam o uso no tempo de cast. Soltar antes cancela.
const castInfo = (it) => {
  if (!it) return undefined;
  const st = STAFFS[it.typeId];
  if (st) return { st, ticks: CAST_TICKS[it.typeId] ?? STAFF_CAST_TICKS };
  if (it.hasTag("ntk:wand")) return { st: WAND, ticks: CAST_TICKS[it.typeId] ?? 30 };
  return undefined;
};
const charging = new Map(); // jogador -> conjuracao em andamento

function finishCast(player, item, info, c) {
  if (charging.get(player.id) !== c || c.done) return;
  c.done = true;
  charging.delete(player.id);
  if (player.isValid) castWith(player, item, info.st);
}
// itemUse e itemStartUse chegam juntos no inicio do uso; o primeiro comeca a conjuracao
function startCharging({ source, itemStack }) {
  if (source?.typeId !== "minecraft:player") return;
  const info = castInfo(itemStack);
  if (!info) return;
  const old = charging.get(source.id);
  if (old && !old.done && system.currentTick - old.start < 3) return;
  const c = { start: system.currentTick, ticks: info.ticks, done: false };
  charging.set(source.id, c);
  // o timer conjura no tempo de cast; nos cajados o fim do uso (itemCompleteUse) chega junto e conjura antes
  system.runTimeout(() => finishCast(source, itemStack, info, c), info.ticks + 1);
}
world.afterEvents.itemUse.subscribe(startCharging);
world.afterEvents.itemStartUse.subscribe(startCharging);
world.afterEvents.itemCompleteUse.subscribe(({ source, itemStack }) => {
  if (source?.typeId !== "minecraft:player") return;
  const info = castInfo(itemStack);
  const c = charging.get(source.id);
  if (info && c) finishCast(source, itemStack, info, c);
});
const stopCharging = ({ source, itemStack }) => {
  if (source?.typeId !== "minecraft:player" || !castInfo(itemStack)) return;
  const c = charging.get(source.id);
  // soltou antes do fim da conjuracao: cancela (o fim natural do uso tambem dispara este evento)
  if (c && !c.done && system.currentTick < c.start + c.ticks - 2) charging.delete(source.id);
};
world.afterEvents.itemReleaseUse.subscribe(stopCharging);
world.afterEvents.itemStopUse.subscribe(stopCharging);

function attack(player, item, st) {
  if (st.attack === "fo") {
    if (st.cd) {
      if (player.getItemCooldown(st.cd) > 0) return;
      // o componente do Forsaken so dispara no tick em que a recarga comeca
      player.startItemCooldown(st.cd, Math.round(st.dur * 20) - 1);
    }
    const comp = st.comp === "shoot" ? ItemShootProjectileOnUseComponent : ItemReleaseEffectOnUseComponent;
    comp.onUse({ source: player, itemStack: item }, { params: st.params, fgrAttack: true });
  } else if (st.attack === "dungeons") {
    if (st.cd && player.getItemCooldown(st.cd) > 0) return;
    if (st.cd) player.startItemCooldown(st.cd, Math.round(st.dur * 20));
    player.runCommand(`scriptevent dungeons:force_artefact ${item.typeId}`);
  } else if (st.attack === "event") {
    player.runCommand(`scriptevent fgr:cajado_ataque ${item.typeId}`);
  }
}

world.afterEvents.playerSwingStart.subscribe((ev) => {
  const player = ev.player;
  if (ev.swingSource !== undefined && ev.swingSource !== "Attack") return;
  const item = ev.heldItemStack ?? player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
  const st = item && STAFFS[item.typeId];
  if (!st || !st.attack) return;
  system.run(() => { try { attack(player, item, st); } catch (e) { console.warn("[Addon Pack] cajado (ataque)", e); } });
});
