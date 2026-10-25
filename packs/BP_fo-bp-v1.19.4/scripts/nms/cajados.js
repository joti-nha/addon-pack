// [Addon Pack] Cajados de todos os addons funcionam como as varinhas:
// - botao de usar com um pergaminho magico na mao secundaria: lanca o pergaminho (gasta 1, como a varinha; a
//   copia gratis do Grimorio/Tomo Infinito e reposta pelo Forsaken Grimoires);
// - botao de ataque: lanca o feitico proprio do cajado. Os do Forsaken rodam aqui; os de outros addons recebem
//   "scriptevent fgr:cajado_ataque <item>" (cada addon tem o seu ouvinte) ou o "dungeons:force_artefact" do Dungeons.
import { world, system, EquipmentSlot } from "@minecraft/server";
import { STAFFS, SCROLL_PROJECTILES } from "./cajados_dados.js";
import { ItemShootProjectileOnUseComponent } from "../item_component/shoot_projectile_on_use.js";
import { ItemReleaseEffectOnUseComponent } from "../item_component/release_effect_on_use.js";
import { damageItemDurability, decreaseItemStack } from "../ntk_functions.js";
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

const POWER = 2.0;      // velocidade do projetil do pergaminho (varinha bem carregada)
const CAST_GAP = 20;    // ticks entre dois pergaminhos lancados por cajado
const lastCast = new Map();

export function scrollInOffhand(entity) {
  try {
    const it = entity.getComponent("equippable")?.getEquipment(EquipmentSlot.Offhand);
    return it?.hasTag("ntk:magic_scroll") ? it : undefined;
  } catch (e) { return undefined; }
}

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

function castScroll(player, staff, st, scroll) {
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
    player.dimension.playSound("block.enchanting_table.use", player.location, { pitch: 1.3, volume: 1.0 });
  }
  if (spent) {
    decreaseItemStack(player, scroll, 1, EquipmentSlot.Offhand);
    damageItemDurability(player, staff, 1, EquipmentSlot.Mainhand, false);
  }
}

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
  if (source?.typeId !== "minecraft:player" || !itemStack) return;
  const st = STAFFS[itemStack.typeId];
  if (!st) return;
  const scroll = scrollInOffhand(source);
  if (!scroll) return;
  try { castScroll(source, itemStack, st, scroll); } catch (e) { console.warn("[Addon Pack] cajado", e); }
});

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
