execute if score .Initialised bv:dylight matches 2 run execute as @a[tag=!bv:dlighton] at @s run tag @s add bv:dlighton
execute if score .Initialised bv:dylight matches 1 run execute as @a[tag=bv:dlighton] at @s run tag @s remove bv:dlighton
execute if score .Initialised bv:breakleaves matches 2 run function leave_touch
execute if score .Initialised bv:campheal matches 2 run function campfire_heal
execute if score .Initialised bv:nohurtowner matches 2 run execute as @a[tag=!nohurtowner] run tag @s add nohurtowner
execute if score .Initialised bv:nohurtowner matches 1 run execute as @a[tag=nohurtowner] run tag @s remove nohurtowner
execute if score .Initialised bv:nohurt matches 2 run execute as @a[tag=!nohurt] run tag @s add nohurt
execute if score .Initialised bv:nohurt matches 1 run execute as @a[tag=nohurt] run tag @s remove nohurt
execute if score .Initialised bv:auto_totem matches 2 run execute as @a[tag=!autototem] run tag @s add autototem
execute if score .Initialised bv:auto_totem matches 1 run execute as @a[tag=autototem] run tag @s remove autototem
execute if score .Initialised bv:off_hand_torch matches 2 run execute as @a[tag=!bv:offhandtorch] run tag @s add bv:offhandtorch
execute if score .Initialised bv:off_hand_torch matches 1 run execute as @a[tag=bv:offhandtorch] run tag @s remove bv:offhandtorch
execute if score .Initialised bv:view_changer_respawn matches 2 run execute as @a[tag=!bv:viewchanger_respawn] run tag @s add bv:viewchanger_respawn
execute if score .Initialised bv:view_changer_respawn matches 1 run execute as @a[tag=bv:viewchanger_respawn] run tag @s remove bv:viewchanger_respawn
execute if score .Initialised bv:give_guidebook matches 2 run execute as @a[tag=!bv:bv:give_guidebook_respawn] run tag @s add bv:give_guidebook_respawn
execute if score .Initialised bv:give_guidebook matches 1 run execute as @a[tag=bv:bv:give_guidebook_respawn] run tag @s remove bv:give_guidebook_respawn
execute if score .Initialised bv:horse_cam_toggle matches 2 run execute as @a[tag=!bv:horsecam] run tag @s add bv:horsecam
execute if score .Initialised bv:horse_cam_toggle matches 1 run execute as @a[tag=bv:horsecam] run tag @s remove bv:horsecam
execute if score .Initialised bv:bow_cam_toggle matches 2 run execute as @a[tag=!bv:bowcam] run tag @s add bv:bowcam
execute if score .Initialised bv:bow_cam_toggle matches 1 run execute as @a[tag=bv:bowcam] run tag @s remove bv:bowcam
execute if score .Initialised bv:dlight_hotbar_toggle matches 2 run execute as @a[tag=!bv:dlight_hotbar] run tag @s add bv:dlight_hotbar
execute if score .Initialised bv:dlight_hotbar_toggle matches 1 run execute as @a[tag=bv:dlight_hotbar] run tag @s remove bv:dlight_hotbar
execute if score .Initialised bv:java_saturation_toggle matches 2 run execute as @a[tag=!bv:java_saturation_on] run tag @s add bv:java_saturation_on
execute if score .Initialised bv:java_saturation_toggle matches 1 run execute as @a[tag=bv:java_saturation_on] run tag @s remove bv:java_saturation_on
execute if score .Initialised bv:java_saturation_toggle matches 2 run gamerule naturalregeneration true