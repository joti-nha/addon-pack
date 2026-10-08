// FORSAKEN ODYSSEY
import { shootProjectile } from "../ntk_functions.js";
import {
  clearSkyMagicSpell,
  rainMagicSpell,
  thunderstormMagicSpell,
  hoardingMagicSpell1,
  hoardingMagicSpell2,
  hoardingMagicSpell3,
  homewardBoundMagicSpell
} from "./magic_scroll_spells.js";

export function unknownMagicSpell(source) {
  let rarityChance = Math.floor(Math.random() * 100.0) + 1.0;
  if (rarityChance <= 80) {
    let randomCommonScroll = Math.floor(Math.random() * 83.0) + 1.0;
    if (randomCommonScroll == 1) {
      shootProjectile("ntk:projectile_cleansing_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Cleansing I
    if (randomCommonScroll == 2) {
      shootProjectile("ntk:projectile_cleansing_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Cleansing II
    if (randomCommonScroll == 3) {
      shootProjectile("ntk:projectile_cleansing_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Cleansing III
    if (randomCommonScroll == 4) {
      shootProjectile("ntk:projectile_purification_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Purification I
    if (randomCommonScroll == 5) {
      shootProjectile("ntk:projectile_purification_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Purification II
    if (randomCommonScroll == 6) {
      shootProjectile("ntk:projectile_purification_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Purification III
    if (randomCommonScroll == 7) {
      shootProjectile("ntk:projectile_regeneration_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Regeneration I
    if (randomCommonScroll == 8) {
      shootProjectile("ntk:projectile_regeneration_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Regeneration II
    if (randomCommonScroll == 9) {
      shootProjectile("ntk:projectile_regeneration_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Regeneration III
    if (randomCommonScroll == 10) {
      shootProjectile("ntk:projectile_protection_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Protection I
    if (randomCommonScroll == 11) {
      shootProjectile("ntk:projectile_protection_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Protection II
    if (randomCommonScroll == 12) {
      shootProjectile("ntk:projectile_protection_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Protection III
    if (randomCommonScroll == 13) {
      shootProjectile("ntk:projectile_fire_protection_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Fire Protection I
    if (randomCommonScroll == 14) {
      shootProjectile("ntk:projectile_fire_protection_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Fire Protection II
    if (randomCommonScroll == 15) {
      shootProjectile("ntk:projectile_fire_protection_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Fire Protection III
    if (randomCommonScroll == 16) {
      shootProjectile("ntk:projectile_invisibility_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Invisibility I
    if (randomCommonScroll == 17) {
      shootProjectile("ntk:projectile_invisibility_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Invisibility II
    if (randomCommonScroll == 18) {
      shootProjectile("ntk:projectile_invisibility_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Invisibility III
    if (randomCommonScroll == 19) {
      shootProjectile("ntk:projectile_acceleration_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Acceleration I
    if (randomCommonScroll == 20) {
      shootProjectile("ntk:projectile_acceleration_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Acceleration II
    if (randomCommonScroll == 21) {
      shootProjectile("ntk:projectile_acceleration_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Acceleration III
    if (randomCommonScroll == 22) {
      shootProjectile("ntk:projectile_strength_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Strength I
    if (randomCommonScroll == 23) {
      shootProjectile("ntk:projectile_strength_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Strength II
    if (randomCommonScroll == 24) {
      shootProjectile("ntk:projectile_strength_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Strength III
    if (randomCommonScroll == 25) {
      shootProjectile("ntk:projectile_slowness_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Slowness I
    if (randomCommonScroll == 26) {
      shootProjectile("ntk:projectile_slowness_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Slowness II
    if (randomCommonScroll == 27) {
      shootProjectile("ntk:projectile_slowness_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Slowness III
    if (randomCommonScroll == 28) {
      shootProjectile("ntk:projectile_poison_cloud_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Poison Cloud I
    if (randomCommonScroll == 29) {
      shootProjectile("ntk:projectile_poison_cloud_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Poison Cloud II
    if (randomCommonScroll == 30) {
      shootProjectile("ntk:projectile_poison_cloud_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Poison Cloud III
    if (randomCommonScroll == 31) {
      shootProjectile("ntk:projectile_field_levitation_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Field Levitation I
    if (randomCommonScroll == 32) {
      shootProjectile("ntk:projectile_field_levitation_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Field Levitation II
    if (randomCommonScroll == 33) {
      shootProjectile("ntk:projectile_field_levitation_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Field Levitation III
    if (randomCommonScroll == 34) {
      shootProjectile("ntk:projectile_resurgence_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Resurgence I
    if (randomCommonScroll == 35) {
      shootProjectile("ntk:projectile_resurgence_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Resurgence II
    if (randomCommonScroll == 36) {
      shootProjectile("ntk:projectile_resurgence_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Resurgence III
    if (randomCommonScroll == 37) {
      shootProjectile("ntk:projectile_berserk_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Berserk I
    if (randomCommonScroll == 38) {
      shootProjectile("ntk:projectile_berserk_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Berserk II
    if (randomCommonScroll == 39) {
      shootProjectile("ntk:projectile_berserk_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Berserk III
    if (randomCommonScroll == 40) {
      shootProjectile("ntk:projectile_lethargy_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Lethargy I
    if (randomCommonScroll == 41) {
      shootProjectile("ntk:projectile_lethargy_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Lethargy II
    if (randomCommonScroll == 42) {
      shootProjectile("ntk:projectile_lethargy_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Lethargy III
    if (randomCommonScroll == 43) {
      shootProjectile("ntk:projectile_displacement_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Displacement I
    if (randomCommonScroll == 44) {
      shootProjectile("ntk:projectile_displacement_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Displacement II
    if (randomCommonScroll == 45) {
      shootProjectile("ntk:projectile_displacement_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Displacement III
    if (randomCommonScroll == 46) {
      shootProjectile("ntk:projectile_converging_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Converging I
    if (randomCommonScroll == 47) {
      shootProjectile("ntk:projectile_converging_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Converging II
    if (randomCommonScroll == 48) {
      shootProjectile("ntk:projectile_converging_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Converging III
    if (randomCommonScroll == 49) {
      hoardingMagicSpell1(source);
    } // Hoarding I
    if (randomCommonScroll == 50) {
      hoardingMagicSpell2(source);
    } // Hoarding II
    if (randomCommonScroll == 51) {
      hoardingMagicSpell3(source);
    } // Hoarding III
    if (randomCommonScroll == 52) {
      shootProjectile("ntk:projectile_flame_burst_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Flame Burst I
    if (randomCommonScroll == 53) {
      shootProjectile("ntk:projectile_flame_burst_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Flame Burst II
    if (randomCommonScroll == 54) {
      shootProjectile("ntk:projectile_flame_burst_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Flame Burst III
    if (randomCommonScroll == 55) {
      shootProjectile("ntk:projectile_fire_blast_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Fire Blast I
    if (randomCommonScroll == 56) {
      shootProjectile("ntk:projectile_fire_blast_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Fire Blast II
    if (randomCommonScroll == 57) {
      shootProjectile("ntk:projectile_fire_blast_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Fire Blast III
    if (randomCommonScroll == 58) {
      shootProjectile("ntk:projectile_flourishing_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Flourishing I
    if (randomCommonScroll == 59) {
      shootProjectile("ntk:projectile_flourishing_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Flourishing II
    if (randomCommonScroll == 60) {
      shootProjectile("ntk:projectile_flourishing_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Flourishing III
    if (randomCommonScroll == 61) {
      shootProjectile("ntk:projectile_weaving_webs_magic_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Weaving Webs
    if (randomCommonScroll == 62) {
      shootProjectile("ntk:projectile_iron_golem_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Iron Golem Summoning Spell
    if (randomCommonScroll == 63) {
      shootProjectile("ntk:projectile_snow_golem_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Snow Golem Summoning Spell
    if (randomCommonScroll == 64) {
      shootProjectile("ntk:projectile_cobblestone_golem_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Cobblestone Golem Summoning Spell
    if (randomCommonScroll == 65) {
      shootProjectile("ntk:projectile_mossy_cobblestone_golem_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Mossy Cobblestone Golem Summoning Spell
    if (randomCommonScroll == 66) {
      shootProjectile("ntk:projectile_cobbled_deepslate_golem_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Cobbled Deepslate Golem Summoning Spell
    if (randomCommonScroll == 67) {
      shootProjectile("ntk:projectile_deepslate_golem_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Deepslate Golem Summoning Spell
    if (randomCommonScroll == 68) {
      shootProjectile("ntk:projectile_magma_golem_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Magma Golem Summoning Spell
    if (randomCommonScroll == 69) {
      shootProjectile("ntk:projectile_slime_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Slime Summoning Spell
    if (randomCommonScroll == 70) {
      shootProjectile("ntk:projectile_skeleton_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Skeleton Summoning Spell
    if (randomCommonScroll == 71) {
      shootProjectile("ntk:projectile_wither_skeleton_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Wither Skeleton Summoning Spell
    if (randomCommonScroll == 72) {
      shootProjectile("ntk:projectile_mossy_skeleton_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Mossy Skeleton Summoning Spell
    if (randomCommonScroll == 73) {
      shootProjectile("ntk:projectile_lightning_bolt_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Lightning Bolt I
    if (randomCommonScroll == 74) {
      shootProjectile("ntk:projectile_lightning_bolt_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Lightning Bolt II
    if (randomCommonScroll == 75) {
      shootProjectile("ntk:projectile_lightning_bolt_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Lightning Bolt III
    if (randomCommonScroll == 76) {
      shootProjectile("ntk:projectile_earthquake_magic_spell_missile_1", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Earthquake I
    if (randomCommonScroll == 77) {
      shootProjectile("ntk:projectile_earthquake_magic_spell_missile_2", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Earthquake II
    if (randomCommonScroll == 78) {
      shootProjectile("ntk:projectile_earthquake_magic_spell_missile_3", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Earthquake III
    if (randomCommonScroll == 79) {
      shootProjectile("ntk:projectile_bogged_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Bogged Summoning Spell
    if (randomCommonScroll == 80) {
      shootProjectile("ntk:projectile_magma_cube_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Magma Cube Summoning Spell
    if (randomCommonScroll == 81) {
      shootProjectile("ntk:projectile_parched_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Parched Summoning Spell
    if (randomCommonScroll == 82) {
      shootProjectile("ntk:projectile_stray_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Stray Summoning Spell
    if (randomCommonScroll == 83) {
      shootProjectile("ntk:projectile_sulfur_cube_summoning_spell_missile", source, "ominous_item_spawner.spawn_item_begin", 1.0);
    } // Sulfur Cube Summoning Spell
    source.playAnimation("attack");
  }
  else if (rarityChance <= 100) {
    let randomUncommonScroll = Math.floor(Math.random() * 4.0) + 1.0;
    if (randomUncommonScroll == 1) {
      clearSkyMagicSpell(source);
    } // Clear Sky
    if (randomUncommonScroll == 2) {
      rainMagicSpell(source);
    } // Rain
    if (randomUncommonScroll == 3) {
      thunderstormMagicSpell(source);
    } // Thunderstorm
    if (randomUncommonScroll == 4) {
      homewardBoundMagicSpell(source);
    }// Homeward Bound
  };
}
