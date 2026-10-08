import { system } from "@minecraft/server";
import { damageItemDurability, shootProjectile } from "../ntk_functions.js";

const ItemShootProjectileOnUseComponent = {
  onUse({ source, itemStack }, { params }) {
    for (const child of params) {
      const eventChance = child.event_chance ?? 100.0;
      const itemName = child.item_name;
      const itemSlot = child.item_slot ?? "Mainhand";
      
      const failOnSneaking = child.fail_on_sneaking ?? false;
      
      const itemCooldownCategory = child.item_cooldown_category ?? false;
      const itemCooldownDuration = child.item_cooldown_duration;
      
      const durabilityDamage = child.durability_damage ?? false;
      const durabilityDamageChance = child.durability_damage_chance ?? 100.0;
      
      const projectileTypeNormal = child.projectile_type_normal ?? false;
      const projectileTypeEnhanced = child.projectile_type_enhanced;
      const shootSoundEffect = child.shoot_sound_effect;
      const shootSoundPitchMin = child.shoot_sound_pitch_min ?? 1.0;
      const shootSoundPitchMax = child.shoot_sound_pitch_max ?? 1.0;
      const shootSoundVolume = child.shoot_sound_volume ?? 1.0;
      
      const enhancerItem = child.enhancer_item ?? false;
      const enhancerSlot = child.enhancer_slot ?? "Offhand";
      const enhanceChance = child.enhance_chance ?? 100.0;
      const enhanceValue = child.enhance_value ?? 0;
      const damageEnhancerDurability = child.damage_enhancer_durability ?? false;
      const enhancerDurabilityDamage = child.enhancer_durability_damage ?? 1;
      
      if (Math.random() * 100 <= eventChance) {
        if (itemStack.typeId === itemName) {
          const sourceEquippable = source.getComponent("equippable");
          const shootSoundPitch = Math.random() * (shootSoundPitchMax - shootSoundPitchMin) + shootSoundPitchMin;
          // Enhancer item:
          let enhanceBaseValue = 0;
          let enhanceAmount = 0;
          if (enhancerItem !== false) {
            if (sourceEquippable) {
              const enhancerItemSlot = sourceEquippable.getEquipmentSlot(enhancerSlot);
              const enhancerItemStack = enhancerItemSlot.getItem();
              if (enhancerItemStack === undefined || !enhancerItemStack.hasTag(enhancerItem)) {
                enhanceBaseValue = 0;
                enhanceAmount = 0;
              }
              else if (enhancerItemStack.hasTag(enhancerItem)) {
                if (Math.random() * 100 <= enhanceChance) {
                  enhanceAmount = enhanceBaseValue + enhanceValue;
                  if (damageEnhancerDurability === true) {
                    damageItemDurability(source, enhancerItemStack, enhancerDurabilityDamage, enhancerSlot, false);
                  }
                }
              }
            }
          }
          // Enhancer calculation:
          const totalDurabilityDamage = durabilityDamage - enhanceAmount;
          
          if (failOnSneaking === false) {
            if (itemCooldownCategory !== false) {
              const cooldown = itemStack.getComponent("cooldown").getCooldownTicksRemaining(source);
              const cooldownDuration = (itemCooldownDuration * 20) - 1;
              if (cooldown == cooldownDuration) {
                // Shoot projectile:
                if (projectileTypeNormal !== false) {
                  if (enhanceAmount === 0) {
                    shootProjectile(projectileTypeNormal, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                  }
                  else {
                    shootProjectile(projectileTypeEnhanced, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                  }
                }
                // Durability Damage with enhancement:
                if (durabilityDamage !== false) {
                  if (Math.random() * 100 <= durabilityDamageChance) {
                    damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
                  }
                }
              }
            }
            else {
              // Shoot projectile:
              if (projectileTypeNormal !== false) {
                if (enhanceAmount === 0) {
                  shootProjectile(projectileTypeNormal, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                }
                else {
                  shootProjectile(projectileTypeEnhanced, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                }
              }
              // Durability Damage with enhancement:
              if (durabilityDamage !== false) {
                if (Math.random() * 100 <= durabilityDamageChance) {
                  damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
                }
              }
            }
          }
          else if (failOnSneaking === true) {
            if (itemCooldownCategory !== false) {
              const cooldown = itemStack.getComponent("cooldown").getCooldownTicksRemaining(source);
              const cooldownDuration = (itemCooldownDuration * 20) - 1;
              if (!source.isSneaking) {
                if (cooldown == cooldownDuration) {
                  // Shoot projectile:
                  if (projectileTypeNormal !== false) {
                    if (enhanceAmount === 0) {
                      shootProjectile(projectileTypeNormal, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                    }
                    else {
                      shootProjectile(projectileTypeEnhanced, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                    }
                  }
                  // Durability Damage with enhancement:
                  if (durabilityDamage !== false) {
                    if (Math.random() * 100 <= durabilityDamageChance) {
                      damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
                    }
                  }
                }
              }
              else {
                // Cancel the cooldown when used while sneaking:
                if (cooldown == cooldownDuration) {
                  system.runTimeout(() => {
                    source.startItemCooldown(itemCooldownCategory, 0 );
                    return;
                  }, 5);
                }
              }
            }
            else {
              if (!source.isSneaking) {
                // Shoot projectile:
                if (projectileTypeNormal !== false) {
                  if (enhanceAmount === 0) {
                    shootProjectile(projectileTypeNormal, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                  }
                  else {
                    shootProjectile(projectileTypeEnhanced, source, shootSoundEffect, shootSoundPitch, shootSoundVolume);
                  }
                }
                // Durability Damage with enhancement:
                if (durabilityDamage !== false) {
                  if (Math.random() * 100 <= durabilityDamageChance) {
                    damageItemDurability(source, itemStack, totalDurabilityDamage, itemSlot, false);
                  }
                }
              }
            }
          }
        }
      }
    }
  },
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "ntk:shoot_projectile_on_use", ItemShootProjectileOnUseComponent
  );
});
/*Used in:
NIE:
- Arcane Staff
- Blazing Staff
- Teleportation Staff
NMD:
- Curserer Staff
- Piglin Fire Staff
*/
