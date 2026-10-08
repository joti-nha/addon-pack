scoreboard players set @a[scores={bv:alive=!2}] bv:alive 0
scoreboard players set @e[type=player] bv:alive 1
execute as @a[tag=bv:viewchanger_respawn,scores={bv:alive=0}] run give @s bv:view
execute as @a[tag=bv:give_guidebook_respawn,scores={bv:alive=0}] run give @s bv:guidebook
scoreboard players set @a[scores={bv:alive=0}] bv:alive 2