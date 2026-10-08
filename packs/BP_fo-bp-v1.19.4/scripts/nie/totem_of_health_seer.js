import { world, system } from "@minecraft/server";
import { damageItemDurability } from "../ntk_functions.js";

function isValidTarget(entity, player) {
  if (entity === player) return false;
  if (entity.typeId === "item" || entity.typeId === "armor_stand") return false;
  const dx = entity.location.x - player.location.x;
  const dy = entity.location.y - player.location.y;
  const dz = entity.location.z - player.location.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz) <= 12;
}

function getEntityName(entity) {
  const raw = entity.nameTag?.split("\n")[0] || entity.typeId.split(":")[1];
  return raw
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const damageCooldowns = new Map();

system.runInterval(() => {
  const currentTime = Date.now();
  for (const player of world.getPlayers()) {
    const equippable = player.getComponent("equippable");
    const mainhand = equippable?.getEquipment("Mainhand");
    const offhand = equippable?.getEquipment("Offhand");
    const hasTotem =
      (mainhand && mainhand.typeId === "ntk:totem_of_health_seer") ||
      (offhand && offhand.typeId === "ntk:totem_of_health_seer");
    if (!hasTotem) continue;
    const viewEntities = player.getEntitiesFromViewDirection();
    const target = viewEntities?.[0]?.entity;
    if (!target || !isValidTarget(target, player)) continue;
    const healthComponent = target.getComponent("minecraft:health");
    if (!healthComponent) continue;
    const currentHealth = Math.floor(healthComponent.currentValue);
    const maxHealth = healthComponent.defaultValue;
    const healthPercentage = Math.round((currentHealth / maxHealth) * 100);
    let color = "§a";
    if (healthPercentage < 33) color = "§c";
    else if (healthPercentage < 66) color = "§e";
    const healthText =
      target.typeId === "minecraft:player"
        ? `${color}${currentHealth} §r`
        : `${color}${currentHealth} / ${maxHealth} §r`;
    player.onScreenDisplay.setActionBar(`§7${getEntityName(target)}: ${healthText}`);
    const lastDamage = damageCooldowns.get(player.id) || 0;
    if (currentTime - lastDamage >= 1500) {
      if (mainhand?.typeId === "ntk:totem_of_health_seer") {
        damageItemDurability(player, mainhand, 1, "Mainhand");
      } else if (offhand?.typeId === "ntk:totem_of_health_seer") {
        damageItemDurability(player, offhand, 1, "Offhand");
      }
      damageCooldowns.set(player.id, currentTime);
    }
  }
});
