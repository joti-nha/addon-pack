scoreboard objectives add bv:world dummy
scoreboard objectives add bv:joined dummy
scoreboard objectives add bv:dylight dummy
scoreboard objectives add bv:breakleaves dummy
scoreboard objectives add bv:campheal dummy
scoreboard objectives add bv:nohurtowner dummy
scoreboard objectives add bv:nohurt dummy
scoreboard objectives add bv:auto_totem dummy
scoreboard objectives add bv:off_hand_torch dummy
scoreboard objectives add bv:pet_armor dummy
scoreboard objectives add bv:alive dummy
scoreboard objectives add bv:view_changer_respawn dummy
scoreboard objectives add bv:horse_cam_toggle dummy
scoreboard objectives add bv:bow_cam_toggle dummy
scoreboard objectives add bv:dlight_hotbar_toggle dummy
scoreboard objectives add bv:give_guidebook dummy
scoreboard players add .Initialised bv:world 0
scoreboard players add .Initialised bv:dylight 0
scoreboard players add .Initialised bv:breakleaves 0
scoreboard players add .Initialised bv:campheal 0
scoreboard players add .Initialised bv:nohurtowner 0
scoreboard players add .Initialised bv:nohurt 0
scoreboard players add .Initialised bv:auto_totem 0
scoreboard players add .Initialised bv:off_hand_torch 0
scoreboard players add .Initialised bv:view_changer_respawn 0
scoreboard players add .Initialised bv:horse_cam_toggle 0
scoreboard players add .Initialised bv:bow_cam_toggle 0
scoreboard players add .Initialised bv:dlight_hotbar_toggle 0
scoreboard players add .Initialised bv:give_guidebook 0
execute as @e[type=horse] run tag @s add mount
execute as @e[type=donkey] run tag @s add mount
execute as @e[type=mule] run tag @s add mount
execute as @e[type=camel] run tag @s add mount
execute as @e[type=skeleton_horse] run tag @s add mount
execute as @e[type=zombie_horse] run tag @s add mount
execute as @e[type=camel_husk] run tag @s add mount
execute if score .Initialised bv:world matches 0 run say World initialised! Pack loaded for the first time.
scoreboard players set .Initialised bv:world 1