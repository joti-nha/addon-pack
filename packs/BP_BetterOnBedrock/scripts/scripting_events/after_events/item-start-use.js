import { world } from "@minecraft/server";

import { startUseAmulet } from "../../functionality/items/nether-amulet";
import { staffs, offhandScroll } from "../../functionality/items/staffs";

world.afterEvents.itemStartUse.subscribe(
    ({ itemStack, source }) => {
        startUseAmulet(itemStack, source);
        // fgr: com pergaminho na mão secundária o cajado conjura o pergaminho
        if (!offhandScroll(source))
            staffs(itemStack, source);
    },
);