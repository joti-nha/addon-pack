// [Addon Pack] Passivas de flecha da classe Patrulheiro (Simple RPG) nas armas do Improvised Guns (pedido do João, 2026-10-31).
// O Simple RPG só dá essas passivas às flechas do Arco do Patrulheiro. Aqui os tiros das armas (e as flechas das bestas de
// repetição) fazem o mesmo, lendo as etiquetas que a Loja de Almas põe no jogador:
//   Flechas de Fogo (shop_ranger_firearrow): incendeia o alvo por 12 s e causa 6 de dano de fogo
//   Flechas Envenenadas (shop_ranger_poisonarrow): Veneno por 6 s
//   Flechas Explosivas (shop_ranger_explosion): explosão no ponto do impacto, como a da flecha (força 3, 10 de dano até
//   4 blocos e fogo por 6 s; só quebra blocos com a etiqueta destroy_blocks). Os morteiros já explodem e ficam de fora.
// As escopetas soltam vários chumbos e a Metralhadora atira rápido, então fogo e veneno valem uma vez por alvo a cada meio
// segundo e a explosão uma vez por jogador a cada meio segundo. Puxada Pesada (arco carregado) e Emplumação (munição que
// volta sozinha) não entram. Fôlego do Caçador com arma na mão fica no script do Simple RPG.
// Este arquivo é importado antes do vgGunHandle.js, para ler a bala antes de o Improvised Guns apagá-la.
import { world, system, EntityDamageCause } from "@minecraft/server";

const TIROS = new Set([
    "rev:flintlock_bullet", "rev:musket_bullet", "rev:shotgun_normal_bullet", "rev:shotgun_s_bullet",
    "rev:mortar_bullet", "rev:crooked_mortar_bullet", "rev:auto_gun_bullet", "rev:mauler_bullet",
    "rev:musket_bullet_hunting", "rev:despoiler_bullet", "rev:fake_arrow"
]);
const SEM_EXPLOSAO = new Set(["rev:mortar_bullet", "rev:crooked_mortar_bullet"]);
const INTERVALO = 10; // ticks
const ultimos = new Map(); // chave -> tick do último efeito

function ativa(p, etiqueta) {
    return p.hasTag(etiqueta) && !p.hasTag(etiqueta + "_off");
}

function livre(chave) {
    const agora = system.currentTick;
    const antes = ultimos.get(chave);
    if (antes !== undefined && agora - antes < INTERVALO) return false;
    ultimos.set(chave, agora);
    return true;
}

system.runInterval(() => {
    if (ultimos.size === 0) return;
    const agora = system.currentTick;
    for (const [chave, tick] of ultimos) if (agora - tick >= INTERVALO) ultimos.delete(chave);
}, 100);

// com o Arco do Patrulheiro na mão o próprio Simple RPG já aplica as passivas a tudo que o jogador dispara
function arcoDoPatrulheiro(item) {
    return item?.typeId === "minecraft:bow" && (item.nameTag ?? "").replace(/§./g, "").trim() === "Ranger Bow";
}

function atirador(ev) {
    let tipo;
    try { tipo = ev.projectile.typeId; } catch (e) { return; }
    if (!TIROS.has(tipo)) return;
    const p = ev.source;
    if (p?.typeId !== "minecraft:player" || !p.isValid) return;
    const eq = p.getComponent("minecraft:equippable");
    if (arcoDoPatrulheiro(eq?.getEquipment("Mainhand")) || arcoDoPatrulheiro(eq?.getEquipment("Offhand"))) return;
    return { p, tipo };
}

function explodir(p, tipo, local) {
    if (SEM_EXPLOSAO.has(tipo) || !ativa(p, "shop_ranger_explosion") || !livre(p.id + ":explosao")) return;
    const quebra = p.hasTag("destroy_blocks");
    p.dimension.createExplosion(local, 3, { breaksBlocks: quebra, causesFire: quebra, source: p });
    for (const e of p.dimension.getEntities({ location: local, maxDistance: 4 })) {
        if (e.id === p.id) continue;
        try {
            e.applyDamage(10, { cause: EntityDamageCause.entityExplosion, damagingEntity: p });
            e.setOnFire(6, true);
        } catch (err) { }
    }
}

world.afterEvents.projectileHitEntity.subscribe((ev) => {
    try {
        const t = atirador(ev);
        if (!t) return;
        const alvo = ev.getEntityHit()?.entity;
        if (!alvo?.isValid || alvo.id === t.p.id) return;
        const local = ev.location;
        // no tick seguinte, depois do dano da bala (o fogo antes dela tomaria o lugar do dano dos tiros fracos)
        system.run(() => {
            if (!t.p.isValid) return;
            if (alvo.isValid && livre(t.p.id + ":" + alvo.id)) {
                if (ativa(t.p, "shop_ranger_firearrow")) {
                    try {
                        alvo.setOnFire(12, true);
                        alvo.applyDamage(6, { cause: EntityDamageCause.fire, damagingEntity: t.p });
                    } catch (err) { }
                }
                if (ativa(t.p, "shop_ranger_poisonarrow")) {
                    try { alvo.addEffect("minecraft:poison", 120, { amplifier: 0 }); } catch (err) { }
                }
            }
            try { explodir(t.p, t.tipo, local); } catch (err) { }
        });
    } catch (err) { }
});

world.afterEvents.projectileHitBlock.subscribe((ev) => {
    try {
        const t = atirador(ev);
        if (!t) return;
        const local = ev.location;
        system.run(() => { if (t.p.isValid) explodir(t.p, t.tipo, local); });
    } catch (err) { }
});
