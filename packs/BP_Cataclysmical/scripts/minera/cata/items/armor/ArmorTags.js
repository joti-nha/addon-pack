import { world, Player, EquipmentSlot, system } from "@minecraft/server";

const Toughness_Tag = "mnra_cata:Armor_Toughness-";
const Knockback_Resistance_Tag = "mnra_cata:Knockback_Resistance-";
const Debug = false;

function debug(msg) {
  if (!Debug) return;
  world.sendMessage(`§7[§bCombate§7] §f${msg}`);
}

function getLevelFromItem(item, prefix) {
  if (!item || typeof item.getTags !== "function") return 0;
  for (const tag of item.getTags()) {
    if (tag.startsWith(prefix)) {
      const n = parseInt(tag.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > 0) return n;
    }
  }
  return 0;
}

function sumArmorLevels(player, prefix) {
  const eq = player.getComponent("equippable");
  if (!eq) return 0;

  let total = 0;
  for (const slot of [
    EquipmentSlot.Head,
    EquipmentSlot.Chest,
    EquipmentSlot.Legs,
    EquipmentSlot.Feet
  ]) {
    total += getLevelFromItem(eq.getEquipment(slot), prefix);
  }
  return total;
}

function getDefensePoints(player) {
  const eq = player.getComponent("equippable");
  if (!eq) return 0;
  return typeof eq.totalArmor === "number" ? eq.totalArmor : 0;
}

function calculateFinalDamage(damage, defense, toughness) {
  if (defense <= 0) return damage;

  const effective = Math.max(
    defense / 5,
    defense - damage / (2 + toughness / 4)
  );

  const capped = Math.min(20, effective);
  const reduction = capped / 25;

  return Math.max(0, damage * (1 - reduction));
}


world.afterEvents.entityHurt.subscribe((event) => {
  const player = event.hurtEntity;
  if (!(player instanceof Player)) return;

  const rawDamage = event.damage;
  if (rawDamage <= 0) return;

  const toughness = sumArmorLevels(player, Toughness_Tag);
  const kbResLevel = sumArmorLevels(player, Knockback_Resistance_Tag);
  const defense = getDefensePoints(player);

  debug(`HIT raw=${rawDamage.toFixed(2)} def=${defense} tough=${toughness} kbLvl=${kbResLevel}`);

  //damage
  if (toughness > 0) {
    const expected = calculateFinalDamage(rawDamage, defense, toughness);
    const heal = rawDamage - expected;

    if (heal > 0) {
      system.run(() => {
        player.applyDamage(-heal);
        debug(`Damage healed ${heal.toFixed(2)}`);
      });
    }
  }

  //knockback
  if (kbResLevel > 0) {
    const source = event.hurtEntity;
    if (!source) return;

    const resistance = Math.min(1, kbResLevel * 0.1);
    debug(`KB reduced ${(resistance * 100).toFixed(0)}%`);

    const dx = player.location.x - source.location.x;
    const dz = player.location.z - source.location.z;
    const length = Math.sqrt(dx * dx + dz * dz) || 1;

    const strength = 1.1 * (1 - resistance);
    const vertical = 0.4 * (1 - resistance);

    system.runTimeout(() => {
      player.applyKnockback(
        {
          x: (dx / length) * strength,
          z: (dz / length) * strength
        },
        vertical
      );
    });
  }

});
