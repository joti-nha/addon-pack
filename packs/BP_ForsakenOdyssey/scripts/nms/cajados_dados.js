// [Addon Pack] Gerado: cajados de todos os addons (lancam pergaminhos com o botao de usar; o ataque lanca o
// feitico proprio do cajado) e o projetil de cada pergaminho do Forsaken.
export const STAFFS = {
 "ntk:arcane_staff": {
  "cd": "arcane_staff",
  "dur": 1.2,
  "attack": "fo",
  "comp": "shoot",
  "params": [
   {
    "event_chance": 100.0,
    "item_name": "ntk:arcane_staff",
    "item_slot": "Mainhand",
    "item_cooldown_category": "arcane_staff",
    "item_cooldown_duration": 1.2,
    "durability_damage": 1,
    "durability_damage_chance": 100.0,
    "projectile_type_normal": "ntk:projectile_arcane_magic_missile",
    "projectile_type_enhanced": "ntk:projectile_arcane_magic_missile",
    "shoot_sound_effect": "ominous_item_spawner.spawn_item_begin",
    "shoot_sound_pitch_min": 0.9,
    "shoot_sound_pitch_max": 1.1,
    "shoot_sound_volume": 1.0
   }
  ]
 },
 "ntk:blazing_staff": {
  "cd": "blazing_staff",
  "dur": 1.3,
  "attack": "fo",
  "comp": "shoot",
  "params": [
   {
    "event_chance": 100.0,
    "item_name": "ntk:blazing_staff",
    "item_slot": "Mainhand",
    "item_cooldown_category": "blazing_staff",
    "item_cooldown_duration": 1.3,
    "durability_damage": 1,
    "durability_damage_chance": 100.0,
    "projectile_type_normal": "ntk:projectile_blazing_magic_missile",
    "projectile_type_enhanced": "ntk:projectile_blazing_magic_missile",
    "shoot_sound_effect": "mob.ghast.fireball",
    "shoot_sound_pitch_min": 1.8,
    "shoot_sound_pitch_max": 2.0,
    "shoot_sound_volume": 1.5
   }
  ]
 },
 "ntk:teleportation_staff": {
  "cd": "teleportation_staff",
  "dur": 2.0,
  "attack": "fo",
  "comp": "shoot",
  "params": [
   {
    "event_chance": 100.0,
    "item_name": "ntk:teleportation_staff",
    "item_slot": "Mainhand",
    "item_cooldown_category": "teleportation_staff",
    "item_cooldown_duration": 2.0,
    "durability_damage": 1,
    "durability_damage_chance": 100.0,
    "projectile_type_normal": "ntk:projectile_teleportation_magic_missile",
    "projectile_type_enhanced": "ntk:projectile_teleportation_magic_missile",
    "shoot_sound_effect": "ominous_item_spawner.spawn_item_begin",
    "shoot_sound_pitch_min": 0.9,
    "shoot_sound_pitch_max": 1.1,
    "shoot_sound_volume": 1.0
   }
  ]
 },
 "ntk:levitation_staff": {
  "cd": "levitation_staff",
  "dur": 4.0,
  "attack": "fo",
  "comp": "release",
  "params": [
   {
    "event_chance": 100.0,
    "item_name": "ntk:levitation_staff",
    "item_slot": "Mainhand",
    "item_cooldown_category": "levitation_staff",
    "item_cooldown_duration": 4.0,
    "durability_damage": 1,
    "durability_damage_chance": 100.0,
    "release_effect": "levitation",
    "release_effect_duration": 400,
    "release_effect_amplifier": 0,
    "release_effect_particles": true,
    "release_effect_range_min": 0,
    "release_effect_range_max": 6,
    "release_particle_effect": "ntk:levitation_staff_particle",
    "release_particle_offset_x": 0.0,
    "release_particle_offset_y": 0.5,
    "release_particle_offset_z": 0.0,
    "release_sound_effect": "ominous_item_spawner.spawn_item_begin",
    "release_sound_pitch_min": 0.9,
    "release_sound_pitch_max": 1.1,
    "release_sound_volume": 1.2
   },
   {
    "event_chance": 100.0,
    "item_name": "ntk:levitation_staff",
    "item_slot": "Mainhand",
    "item_cooldown_category": "levitation_staff",
    "item_cooldown_duration": 4.0,
    "release_effect": "slow_falling",
    "release_effect_duration": 1200,
    "release_effect_amplifier": 0,
    "release_effect_particles": true,
    "release_effect_range_min": 0,
    "release_effect_range_max": 6
   }
  ]
 },
 "ntk:staff_of_the_sea": {
  "cd": "staff_of_the_sea",
  "dur": 40.0,
  "attack": "fo",
  "comp": "release",
  "params": [
   {
    "event_chance": 100.0,
    "item_name": "ntk:staff_of_the_sea",
    "item_slot": "Mainhand",
    "item_cooldown_category": "staff_of_the_sea",
    "item_cooldown_duration": 40.0,
    "durability_damage": 1,
    "durability_damage_chance": 100.0,
    "release_effect": "conduit_power",
    "release_valid_blocks": "water_type",
    "release_fail_guide": "§eVocê precisa estar na água para ativar o efeito do cajado.§r",
    "release_effect_duration": 1800,
    "release_effect_amplifier": 0,
    "release_effect_particles": true,
    "release_effect_range_min": 0,
    "release_effect_range_max": 4,
    "release_particle_effect": "ntk:staff_of_the_sea_activation_particle",
    "release_particle_offset_x": 0.0,
    "release_particle_offset_y": 0.5,
    "release_particle_offset_z": 0.0,
    "release_sound_effect": "conduit.activate",
    "release_sound_pitch_min": 0.9,
    "release_sound_pitch_max": 1.1,
    "release_sound_volume": 1.0
   }
  ]
 },
 "ntk:powder_staff": {},
 "ntk:curserer_staff": {
  "cd": "curserer_staff",
  "dur": 1.2,
  "attack": "fo",
  "comp": "shoot",
  "params": [
   {
    "event_chance": 100.0,
    "item_name": "ntk:curserer_staff",
    "item_slot": "Mainhand",
    "item_cooldown_category": "curserer_staff",
    "item_cooldown_duration": 1.2,
    "durability_damage": 1,
    "durability_damage_chance": 100.0,
    "projectile_type_normal": "ntk:projectile_curse_magic_missile",
    "projectile_type_enhanced": "ntk:projectile_curse_magic_missile_2",
    "shoot_sound_effect": "ominous_item_spawner.spawn_item_begin",
    "shoot_sound_pitch_min": 0.9,
    "shoot_sound_pitch_max": 1.1,
    "shoot_sound_volume": 1.5,
    "enhancer_item": "ntk:book_of_curses",
    "enhancer_slot": "Offhand",
    "enhance_chance": 100.0,
    "enhance_value": 1,
    "damage_enhancer_durability": true,
    "enhancer_durability_damage": 1
   }
  ]
 },
 "ntk:piglin_fire_staff": {
  "cd": "piglin_fire_staff",
  "dur": 0.8,
  "attack": "fo",
  "comp": "shoot",
  "params": [
   {
    "event_chance": 100.0,
    "item_name": "ntk:piglin_fire_staff",
    "item_slot": "Mainhand",
    "item_cooldown_category": "piglin_fire_staff",
    "item_cooldown_duration": 0.8,
    "durability_damage": 1,
    "durability_damage_chance": 100.0,
    "projectile_type_normal": "ntk:projectile_fire_spike_magic_missile",
    "projectile_type_enhanced": "ntk:projectile_fire_spike_magic_missile",
    "shoot_sound_effect": "mob.ghast.fireball",
    "shoot_sound_pitch_min": 1.8,
    "shoot_sound_pitch_max": 2.0,
    "shoot_sound_volume": 1.5
   }
  ]
 },
 "better_on_bedrock:staff": {
  "cd": "better_on_bedrock:staff",
  "dur": 10,
  "attack": "event"
 },
 "better_on_bedrock:flame_staff": {
  "cd": "better_on_bedrock:staff",
  "dur": 10,
  "attack": "event"
 },
 "better_on_bedrock:flender_staff": {
  "cd": "better_on_bedrock:staff",
  "dur": 10,
  "attack": "event"
 },
 "better_on_bedrock:ice_staff": {
  "cd": "better_on_bedrock:staff",
  "dur": 10,
  "attack": "event"
 },
 "hf_mzs:sculptor_staff": {
  "cd": "hf_mzs.sculptor_staff",
  "dur": 2.0,
  "attack": "event"
 },
 "dk:sinners_rod": {
  "cd": "sinners_rod",
  "dur": 120,
  "attack": "event"
 },
 "dungeons:ice_wand": {
  "cd": "ice_wand_common",
  "dur": 15,
  "attack": "dungeons"
 },
 "dungeons:rare_ice_wand": {
  "cd": "ice_wand_rare",
  "dur": 10,
  "attack": "dungeons"
 },
 "dungeons:lightning_rod": {
  "cd": "lightning_rod_common",
  "dur": 5,
  "attack": "dungeons"
 },
 "dungeons:rare_lightning_rod": {
  "cd": "lightning_rod_rare",
  "dur": 5,
  "attack": "dungeons"
 },
 "dungeons:battlestaff": {},
 "dungeons:battlestaff_of_terror": {},
 "dungeons:growing_staff": {}
};
export const SCROLL_PROJECTILES = {
"ntk:scroll_of_acceleration_1": "ntk:projectile_acceleration_magic_spell_missile_1",
"ntk:scroll_of_acceleration_2": "ntk:projectile_acceleration_magic_spell_missile_2",
"ntk:scroll_of_acceleration_3": "ntk:projectile_acceleration_magic_spell_missile_3",
"ntk:scroll_of_berserk_1": "ntk:projectile_berserk_magic_spell_missile_1",
"ntk:scroll_of_berserk_2": "ntk:projectile_berserk_magic_spell_missile_2",
"ntk:scroll_of_berserk_3": "ntk:projectile_berserk_magic_spell_missile_3",
"ntk:scroll_of_cleansing_1": "ntk:projectile_cleansing_magic_spell_missile_1",
"ntk:scroll_of_cleansing_2": "ntk:projectile_cleansing_magic_spell_missile_2",
"ntk:scroll_of_cleansing_3": "ntk:projectile_cleansing_magic_spell_missile_3",
"ntk:scroll_of_converging_1": "ntk:projectile_converging_magic_spell_missile_1",
"ntk:scroll_of_converging_2": "ntk:projectile_converging_magic_spell_missile_2",
"ntk:scroll_of_converging_3": "ntk:projectile_converging_magic_spell_missile_3",
"ntk:scroll_of_displacement_1": "ntk:projectile_displacement_magic_spell_missile_1",
"ntk:scroll_of_displacement_2": "ntk:projectile_displacement_magic_spell_missile_2",
"ntk:scroll_of_displacement_3": "ntk:projectile_displacement_magic_spell_missile_3",
"ntk:scroll_of_earthquake_1": "ntk:projectile_earthquake_magic_spell_missile_1",
"ntk:scroll_of_earthquake_2": "ntk:projectile_earthquake_magic_spell_missile_2",
"ntk:scroll_of_earthquake_3": "ntk:projectile_earthquake_magic_spell_missile_3",
"ntk:scroll_of_field_levitation_1": "ntk:projectile_field_levitation_magic_spell_missile_1",
"ntk:scroll_of_field_levitation_2": "ntk:projectile_field_levitation_magic_spell_missile_2",
"ntk:scroll_of_field_levitation_3": "ntk:projectile_field_levitation_magic_spell_missile_3",
"ntk:scroll_of_fire_blast_1": "ntk:projectile_fire_blast_magic_spell_missile_1",
"ntk:scroll_of_fire_blast_2": "ntk:projectile_fire_blast_magic_spell_missile_2",
"ntk:scroll_of_fire_blast_3": "ntk:projectile_fire_blast_magic_spell_missile_3",
"ntk:scroll_of_fire_protection_1": "ntk:projectile_fire_protection_magic_spell_missile_1",
"ntk:scroll_of_fire_protection_2": "ntk:projectile_fire_protection_magic_spell_missile_2",
"ntk:scroll_of_fire_protection_3": "ntk:projectile_fire_protection_magic_spell_missile_3",
"ntk:scroll_of_flame_burst_1": "ntk:projectile_flame_burst_magic_spell_missile_1",
"ntk:scroll_of_flame_burst_2": "ntk:projectile_flame_burst_magic_spell_missile_2",
"ntk:scroll_of_flame_burst_3": "ntk:projectile_flame_burst_magic_spell_missile_3",
"ntk:scroll_of_flourishing_1": "ntk:projectile_flourishing_magic_spell_missile_1",
"ntk:scroll_of_flourishing_2": "ntk:projectile_flourishing_magic_spell_missile_2",
"ntk:scroll_of_flourishing_3": "ntk:projectile_flourishing_magic_spell_missile_3",
"ntk:scroll_of_invisibility_1": "ntk:projectile_invisibility_magic_spell_missile_1",
"ntk:scroll_of_invisibility_2": "ntk:projectile_invisibility_magic_spell_missile_2",
"ntk:scroll_of_invisibility_3": "ntk:projectile_invisibility_magic_spell_missile_3",
"ntk:scroll_of_lethargy_1": "ntk:projectile_lethargy_magic_spell_missile_1",
"ntk:scroll_of_lethargy_2": "ntk:projectile_lethargy_magic_spell_missile_2",
"ntk:scroll_of_lethargy_3": "ntk:projectile_lethargy_magic_spell_missile_3",
"ntk:scroll_of_lightning_bolt_1": "ntk:projectile_lightning_bolt_magic_spell_missile_1",
"ntk:scroll_of_lightning_bolt_2": "ntk:projectile_lightning_bolt_magic_spell_missile_2",
"ntk:scroll_of_lightning_bolt_3": "ntk:projectile_lightning_bolt_magic_spell_missile_3",
"ntk:scroll_of_poison_cloud_1": "ntk:projectile_poison_cloud_magic_spell_missile_1",
"ntk:scroll_of_poison_cloud_2": "ntk:projectile_poison_cloud_magic_spell_missile_2",
"ntk:scroll_of_poison_cloud_3": "ntk:projectile_poison_cloud_magic_spell_missile_3",
"ntk:scroll_of_protection_1": "ntk:projectile_protection_magic_spell_missile_1",
"ntk:scroll_of_protection_2": "ntk:projectile_protection_magic_spell_missile_2",
"ntk:scroll_of_protection_3": "ntk:projectile_protection_magic_spell_missile_3",
"ntk:scroll_of_purification_1": "ntk:projectile_purification_magic_spell_missile_1",
"ntk:scroll_of_purification_2": "ntk:projectile_purification_magic_spell_missile_2",
"ntk:scroll_of_purification_3": "ntk:projectile_purification_magic_spell_missile_3",
"ntk:scroll_of_regeneration_1": "ntk:projectile_regeneration_magic_spell_missile_1",
"ntk:scroll_of_regeneration_2": "ntk:projectile_regeneration_magic_spell_missile_2",
"ntk:scroll_of_regeneration_3": "ntk:projectile_regeneration_magic_spell_missile_3",
"ntk:scroll_of_resurgence_1": "ntk:projectile_resurgence_magic_spell_missile_1",
"ntk:scroll_of_resurgence_2": "ntk:projectile_resurgence_magic_spell_missile_2",
"ntk:scroll_of_resurgence_3": "ntk:projectile_resurgence_magic_spell_missile_3",
"ntk:scroll_of_slowness_1": "ntk:projectile_slowness_magic_spell_missile_1",
"ntk:scroll_of_slowness_2": "ntk:projectile_slowness_magic_spell_missile_2",
"ntk:scroll_of_slowness_3": "ntk:projectile_slowness_magic_spell_missile_3",
"ntk:scroll_of_strength_1": "ntk:projectile_strength_magic_spell_missile_1",
"ntk:scroll_of_strength_2": "ntk:projectile_strength_magic_spell_missile_2",
"ntk:scroll_of_strength_3": "ntk:projectile_strength_magic_spell_missile_3",
"ntk:scroll_of_weaving_webs": "ntk:projectile_weaving_webs_magic_spell_missile",
"ntk:summoning_scroll_of_bogged": "ntk:projectile_bogged_summoning_spell_missile",
"ntk:summoning_scroll_of_cobbled_deepslate_golem": "ntk:projectile_cobbled_deepslate_golem_summoning_spell_missile",
"ntk:summoning_scroll_of_cobblestone_golem": "ntk:projectile_cobblestone_golem_summoning_spell_missile",
"ntk:summoning_scroll_of_deepslate_golem": "ntk:projectile_deepslate_golem_summoning_spell_missile",
"ntk:summoning_scroll_of_iron_golem": "ntk:projectile_iron_golem_summoning_spell_missile",
"ntk:summoning_scroll_of_magma_cube": "ntk:projectile_magma_cube_summoning_spell_missile",
"ntk:summoning_scroll_of_magma_golem": "ntk:projectile_magma_golem_summoning_spell_missile",
"ntk:summoning_scroll_of_mossy_cobblestone_golem": "ntk:projectile_mossy_cobblestone_golem_summoning_spell_missile",
"ntk:summoning_scroll_of_mossy_skeleton": "ntk:projectile_mossy_skeleton_summoning_spell_missile",
"ntk:summoning_scroll_of_parched": "ntk:projectile_parched_summoning_spell_missile",
"ntk:summoning_scroll_of_skeleton": "ntk:projectile_skeleton_summoning_spell_missile",
"ntk:summoning_scroll_of_slime": "ntk:projectile_slime_summoning_spell_missile",
"ntk:summoning_scroll_of_snow_golem": "ntk:projectile_snow_golem_summoning_spell_missile",
"ntk:summoning_scroll_of_stray": "ntk:projectile_stray_summoning_spell_missile",
"ntk:summoning_scroll_of_sulfur_cube": "ntk:projectile_sulfur_cube_summoning_spell_missile",
"ntk:summoning_scroll_of_wither_skeleton": "ntk:projectile_wither_skeleton_summoning_spell_missile"
};

// Ticks de conjuração (nos cajados, igual ao use_duration do item; as varinhas têm uso longo, ver ferramentas/varinhas.py). Cajados sem entrada usam STAFF_CAST_TICKS.
export const STAFF_CAST_TICKS = 30;
export const CAST_TICKS = {
  "ntk:golden_wand": 30, "ntk:golden_spellweaver_wand": 30,
  "ntk:diamond_wand": 36, "ntk:diamond_spellweaver_wand": 36,
  "ntk:amethyst_wand": 50, "ntk:amethyst_spellweaver_wand": 50,
  "ntk:quartz_wand": 60, "ntk:quartz_spellweaver_wand": 60,
};
