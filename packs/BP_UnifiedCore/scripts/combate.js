// Addon Pack - Unified Core: combate (pedido do João em 2026-10-31, quando o Java Combat saiu do pack).
// Tudo roda so nos eventos de golpe e de dano; o unico laco por tick guarda a altura do jogador (para a queda das marretas).
//  - Espadas: golpe em area (sweep) no 1o golpe de uma sequencia do A&S: metade do dano do golpe nos mobs a ate 2,1
//    blocos de um ponto 2,5 blocos a frente (area do Java Combat), parado ou correndo, sem exigir recarga do ataque.
//  - Machados: o critico (golpe caindo) da o dobro do dano, em vez de 1,5x.
//  - Marretas: dano extra pela altura da queda, como a maca do jogo, e o jogador nao toma o dano da queda.
import { world, system, Player, EntityDamageCause, EquipmentSlot } from "@minecraft/server";

// ---------- classe da arma (mesma ordem do A&S: machado vem antes de marreta e espada) ----------
const tem = (it, ...tags) => tags.some((t) => it.hasTag(t));
function classe(it) {
  if (!it || it.typeId === "minecraft:mace") return null; // a maca do jogo ja tem tudo isso
  if (tem(it, "oreville:is_mace", "minecraft:is_mace", "ntk:hammer")) return "marreta";
  if (tem(it, "minecraft:is_axe", "oreville:is_axe")) return "machado";
  if (tem(it, "minecraft:is_pickaxe", "oreville:is_pickaxe", "minecraft:is_shovel", "oreville:is_shovel",
    "minecraft:is_hoe", "oreville:is_hoe", "minecraft:is_trident", "oreville:is_trident", "minecraft:is_spear",
    "oreville:is_spear")) return null;
  if (tem(it, "minecraft:is_sword", "oreville:is_sword")) return "espada";
  return null;
}
function naMao(p) {
  try { return p.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand); } catch (e) { return undefined; }
}

// ---------- sequencia de golpes da espada no A&S ----------
// O A&S (controle de ataque da espada) toca 3 animacoes em sequencia. Um golpe entre 0,25 s e 0,6 s depois do anterior
// passa para a proxima; depois de 0,6 s (ou do fim da animacao) volta para a 1a; da 3a, qualquer golpe apos 0,25 s volta
// para a 1a; golpes antes de 0,25 s nao mudam nada. Duracao das animacoes: 1,125 s, 1,2125 s e 1,3125 s.
const T = 20;
const FIM = { 1: 1.125 * T, 2: 1.2125 * T, 3: 1.3125 * T };
const combo = new Map(); // id do jogador -> { estado, desde (tick) }

function avancar(p, agora) {
  const c = combo.get(p.id);
  const dt = c ? agora - c.desde : Infinity;
  let novo = 0;
  if (!c || dt >= FIM[c.estado]) novo = 1;
  else if (c.estado === 3) novo = dt >= 0.25 * T ? 1 : 0;
  else if (dt > 0.6 * T) novo = 1;
  else if (dt > 0.25 * T) novo = c.estado + 1;
  if (novo) combo.set(p.id, { estado: novo, desde: agora });
}

// o balanco do braco conta mesmo sem acertar nada (como no A&S)
const temBalanco = !!world.afterEvents.playerSwingStart;
if (temBalanco) {
  world.afterEvents.playerSwingStart.subscribe(({ player, heldItemStack }) => {
    if (classe(heldItemStack) !== "espada") { combo.delete(player.id); return; }
    avancar(player, system.currentTick);
  });
}

// ---------- golpe em area ----------
const SEM_AREA_TIPOS = new Set(["minecraft:item", "minecraft:xp_orb", "minecraft:armor_stand", "minecraft:wolf"]);
const SEM_AREA_FAMILIAS = ["inanimate", "dummy"];

function varrer(p, alvoId, dano) {
  const d = p.getViewDirection();
  const l = p.location;
  const centro = { x: l.x + d.x * 2.5, y: l.y + d.y * 2.5, z: l.z + d.z * 2.5 };
  const dim = p.dimension;
  let vitimas = [];
  try { vitimas = dim.getEntities({ location: centro, maxDistance: 2.1, excludeFamilies: SEM_AREA_FAMILIAS }); } catch (e) { return; }
  for (const e of vitimas) {
    try {
      if (e.id === p.id || e.id === alvoId || e instanceof Player || SEM_AREA_TIPOS.has(e.typeId)) continue;
      if (!e.getComponent("minecraft:health") || e.getComponent("minecraft:is_tamed")) continue;
      e.applyDamage(dano, { cause: EntityDamageCause.thorns, damagingEntity: p });
    } catch (err) { }
  }
  const h = Math.hypot(d.x, d.z) || 1;
  const fx = d.x / h, fz = d.z / h;
  try {
    // mesmo ponto do Java Combat: 0,3 a esquerda, 0,8 acima e 2,1 a frente
    dim.spawnParticle("unified:sweep", { x: l.x + fx * 2.1 + fz * 0.3, y: l.y + 0.8, z: l.z + fz * 2.1 - fx * 0.3 });
    dim.playSound("attack.sweep", l, { volume: 0.8, pitch: 1 });
  } catch (e) { }
}

const golpe = new Map(); // id do jogador -> { alvo, dano, tick } do ultimo golpe de espada que causou dano

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity: p, hitEntity: alvo }) => {
  if (!(p instanceof Player) || classe(naMao(p)) !== "espada") return;
  if (!temBalanco) avancar(p, system.currentTick);
  const alvoId = alvo.id;
  // espera o fim do tick: o evento do balanco pode chegar depois do acerto
  system.run(() => {
    try {
      const c = combo.get(p.id);
      if (!c || c.estado !== 1 || system.currentTick - c.desde > 3) return;
      const g = golpe.get(p.id); // dano do golpe original (evento de dano do mesmo tick)
      if (!g || g.alvo !== alvoId || system.currentTick - g.tick > 3) return;
      varrer(p, alvoId, g.dano / 2);
    } catch (e) { }
  });
});

// ---------- altura da queda (para as marretas) ----------
const topo = new Map(); // id do jogador -> maior altura desde que saiu do chao
system.runInterval(() => {
  for (const p of world.getAllPlayers()) {
    const y = p.location.y;
    if (p.isOnGround || p.isInWater || p.isFlying || p.isGliding || p.isClimbing) topo.set(p.id, y);
    else topo.set(p.id, Math.max(topo.get(p.id) ?? y, y));
  }
}, 1);
world.beforeEvents.playerLeave.subscribe(({ player }) => { combo.delete(player.id); topo.delete(player.id); golpe.delete(player.id); });

// dano da maca do jogo pela queda: 4 por bloco nos 3 primeiros, 2 por bloco nos 5 seguintes, 1 por bloco depois
function bonusQueda(q) {
  if (q <= 1.5) return 0;
  return 4 * Math.min(q, 3) + 2 * Math.min(Math.max(q - 3, 0), 5) + Math.max(q - 8, 0);
}

// ---------- dano extra (critico do machado e queda da marreta) ----------
const finalizando = new Set(); // alvos que levaram o golpe fatal daqui (o evento de dano dele chega no fim do tick)
function somarDano(alvo, p, extra) {
  const h = alvo.getComponent("minecraft:health");
  if (!h || extra <= 0) return;
  if (h.currentValue - extra > 0) { h.setCurrentValue(h.currentValue - extra); return; }
  // golpe fatal: o dano entra pelo jogo para o jogador ficar com a morte (saque e experiencia)
  finalizando.add(alvo.id);
  system.runTimeout(() => finalizando.delete(alvo.id), 2);
  try { alvo.applyDamage(100000, { cause: EntityDamageCause.entityAttack, damagingEntity: p }); } catch (e) { }
}

function critico(p) {
  return !p.isOnGround && p.isFalling && !p.isInWater && !p.isClimbing && !p.isGliding && !p.getComponent("minecraft:riding");
}

world.afterEvents.entityHurt.subscribe(({ hurtEntity: alvo, damage, damageSource }) => {
  if (finalizando.has(alvo.id)) return;
  const p = damageSource.damagingEntity;
  if (!(p instanceof Player) || damageSource.cause !== EntityDamageCause.entityAttack || damage <= 0) return;
  try {
    const tipo = classe(naMao(p));
    if (tipo === "espada") { golpe.set(p.id, { alvo: alvo.id, dano: damage, tick: system.currentTick }); return; }
    if (!alvo.isValid || !(alvo.getComponent("minecraft:health")?.currentValue > 0)) return;
    if (tipo === "machado") {
      if (critico(p)) somarDano(alvo, p, damage / 3); // o jogo ja deu 1,5x; +1/3 do dano chega a 2x
    } else if (tipo === "marreta") {
      const queda = (topo.get(p.id) ?? p.location.y) - p.location.y;
      const extra = bonusQueda(queda);
      if (extra > 0 && !p.isOnGround) {
        topo.set(p.id, p.location.y);
        // como a maca, o golpe zera a queda do jogador: a queda lenta curta tira o dano do pouso
        p.addEffect("slow_falling", 10, { amplifier: 0, showParticles: false });
        p.dimension.playSound(queda > 5 ? "mace.heavy_smash_ground" : "mace.smash_ground", alvo.location);
        somarDano(alvo, p, extra);
      }
    }
  } catch (e) { }
});
