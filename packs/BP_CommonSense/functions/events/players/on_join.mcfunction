scoreboard players add @a bv:joined 0
execute as @a[scores={bv:joined=0}] run camera @s clear
scoreboard players reset * bv:joined
scoreboard players set @a bv:joined 1