execute as @a unless entity @a[tag=!soulvisionl] run effect @s clear night_vision
execute as @a run tag @s remove soulvisionl
execute as @a[hasitem={item=soul_lantern,location=slot.weapon.mainhand}] run tag @s add soulvisionl
execute as @a[hasitem={item=soul_lantern,location=slot.weapon.offhand}] run tag @s add soulvisionl
execute as @a[tag=soulvisionl] run function item_effect_schedule
execute as @a unless entity @a[tag=!soulvisiont] run effect @s clear night_vision
execute as @a run tag @s remove soulvisiont
execute as @a[hasitem={item=soul_torch,location=slot.weapon.mainhand}] run tag @s add soulvisiont
execute as @a[hasitem={item=soul_torch,location=slot.weapon.offhand}] run tag @s add soulvisiont
execute as @a[tag=soulvisiont] run function item_effect_schedule
execute as @a at @s if block ~ ~ ~ water run tag @s add onwater
execute as @a at @s if block ~ ~ ~ seagrass run tag @s add onwater
execute as @a at @s if block ~ ~ ~ minecraft:kelp run tag @s add onwater
execute as @a unless entity @a[tag=!scubaon] run effect @s clear conduit_power
execute as @a run tag @s remove scubaon
execute as @a[tag=onwater,hasitem={item=bv:scuba_helmet,location=slot.armor.head}] run tag @s add scubaon
execute as @a[tag=scubaon] run function item_effect_schedule
execute as @a run tag @s remove onwater