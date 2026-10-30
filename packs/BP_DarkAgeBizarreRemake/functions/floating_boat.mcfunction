execute as @a[rxm=-90,rx=-25] run effect @e[type=dk:floating_boat,r=1,tag=has_rider] levitation 1 8 true
execute as @a[rxm=-25,rx=-15] run effect @e[type=dk:floating_boat,r=1,tag=has_rider] levitation 1 3 true
execute as @a[rxm=-15,rx=-5] run effect @e[type=dk:floating_boat,r=1,tag=has_rider] levitation 1 2 true
execute as @a[rxm=-5,rx=20] run effect @e[type=dk:floating_boat,r=1,tag=has_rider] levitation 1 1 true
execute as @a[rxm=20,rx=35] run effect @e[type=dk:floating_boat,r=1,tag=has_rider] slow_falling 1 1 true
execute as @a[rxm=35,rx=90] run effect @e[type=dk:floating_boat,r=1,tag=has_rider] clear
execute if block ~~-1~ water run execute as @a[rxm=-15,rx=-5] run tp @e[type=dk:floating_boat,r=1,tag=has_rider]  ~ ~0.75 ~
execute if block ~~-1~ water run execute as @a[rxm=-5,rx=20] run tp @e[type=dk:floating_boat,r=1,tag=has_rider] ~ ~0.5 ~
execute if block ~~-1~ flowing_water run execute as @a[rxm=-15,rx=-5] run tp @e[type=dk:floating_boat,r=1,tag=has_rider]  ~ ~0.75 ~
execute if block ~~-1~ flowing_water run execute as @a[rxm=-5,rx=20] run tp @e[type=dk:floating_boat,r=1,tag=has_rider] ~ ~0.5 ~