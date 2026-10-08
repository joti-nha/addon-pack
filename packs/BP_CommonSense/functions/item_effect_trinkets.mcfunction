execute as @a[hasitem={item=bv:netherite_skull,location=slot.hotbar}] run tag @s add skullon
execute as @a[hasitem={item=bv:netherite_skull,location=slot.weapon.offhand}] run tag @s add skullon
execute as @a[tag=skullon] run effect @s fire_resistance 3 1 true
execute as @a[hasitem={item=bv:netherite_skull,quantity=0,location=slot.hotbar}] run tag @s remove skullon
execute as @a[hasitem={item=bv:netherite_skull,quantity=0,location=slot.weapon.offhand}] run tag @s remove skullon
execute as @a[hasitem={item=bv:heart_amulet,location=slot.hotbar}] run tag @s add hearton
execute as @a[hasitem={item=bv:heart_amulet,location=slot.weapon.offhand}] run tag @s add hearton
execute as @a[tag=hearton] run effect @s health_boost 3 2 true
execute as @a[hasitem={item=bv:heart_amulet,location=slot.hotbar,quantity=0}] run tag @s remove hearton
execute as @a[hasitem={item=bv:heart_amulet,location=slot.weapon.offhand,quantity=0}] run tag @s remove hearton
execute as @a[hasitem={item=bv:miner_bless,location=slot.hotbar}] run tag @s add minerbless
execute as @a[hasitem={item=bv:miner_bless,location=slot.weapon.offhand}] run tag @s add minerbless
execute as @a[tag=minerbless] run effect @s haste 3 2 true
execute as @a[hasitem={item=bv:miner_bless,location=slot.hotbar,quantity=0}] run tag @s remove minerbless
execute as @a[hasitem={item=bv:miner_bless,location=slot.weapon.offhand,quantity=0}] run tag @s remove minerbless
execute as @a[hasitem={item=bv:balloon,location=slot.weapon.mainhand}] run tag @s add ballon1
execute as @a[hasitem={item=bv:balloon,location=slot.weapon.offhand}] run tag @s add ballon1
execute as @a[tag=ballon1] run effect @s slow_falling 2 1 true
execute as @a[hasitem={item=bv:balloon,location=slot.weapon.mainhand,quantity=0}] run tag @s remove ballon1
execute as @a[hasitem={item=bv:balloon,location=slot.weapon.offhand,quantity=0}] run tag @s remove ballon1