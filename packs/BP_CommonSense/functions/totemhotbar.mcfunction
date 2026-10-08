execute as @a[hasitem={item=totem_of_undying,location=slot.hotbar}] run tag @s add hastotem
execute as @a[tag=rabbit1] run function item_effect_schedule
execute as @a[hasitem={item=rabbit_foot,location=slot.hotbar,quantity=0}] run tag @s remove rabbit1