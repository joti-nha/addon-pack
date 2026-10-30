summon panascais_end:void_dragon_marker ~0 ~0 ~0 0 0
summon panascais_end:void_dragon ~-1 ~-1 ~0 0 0 panascais_end:add.statue_mode
structure load panascais_end:shadow.arena.1 ~-29 ~-30 ~-29
execute at @p run summon panascais_end:enderman_statue ~ ~-10 ~
tp @e[type=panascais_end:enderman_statue,c=1,tag=!tagged] ~28 ~4 ~0 facing ~ ~ ~
tag @e[type=panascais_end:enderman_statue,c=1,tag=!tagged] add tagged
execute at @p run summon panascais_end:winged_enderman_statue ~ ~-10 ~
tp @e[type=panascais_end:winged_enderman_statue,c=1,tag=!tagged] ~15 ~4 ~24 facing ~ ~ ~
tag @e[type=panascais_end:winged_enderman_statue,c=1,tag=!tagged] add tagged
execute at @p run summon panascais_end:pale_enderman_statue ~ ~-10 ~
tp @e[type=panascais_end:pale_enderman_statue,c=1,tag=!tagged] ~-15 ~4 ~24 facing ~ ~ ~
tag @e[type=panascais_end:pale_enderman_statue,c=1,tag=!tagged] add tagged
execute at @p run summon panascais_end:mossy_enderman_statue ~ ~-10 ~
tp @e[type=panascais_end:mossy_enderman_statue,c=1,tag=!tagged] ~-28 ~4 ~0 facing ~ ~ ~
tag @e[type=panascais_end:mossy_enderman_statue,c=1,tag=!tagged] add tagged
execute at @p run summon panascais_end:gilded_enderman_statue ~ ~-10 ~
tp @e[type=panascais_end:gilded_enderman_statue,c=1,tag=!tagged] ~-15 ~4 ~-24 facing ~ ~ ~
tag @e[type=panascais_end:gilded_enderman_statue,c=1,tag=!tagged] add tagged
execute at @p run summon panascais_end:mycotic_enderman_statue ~ ~-10 ~
tp @e[type=panascais_end:mycotic_enderman_statue,c=1,tag=!tagged] ~15 ~4 ~-24 facing ~ ~ ~
tag @e[type=panascais_end:mycotic_enderman_statue,c=1,tag=!tagged] add tagged