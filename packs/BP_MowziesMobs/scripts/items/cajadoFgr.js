import * as mc from "@minecraft/server";
import * as staff from "./sculptorStaff";

// fgr: botão de ataque conjura o feitiço padrão do cajado (chamado pelo pack FO)
mc.system.afterEvents.scriptEventReceive.subscribe((e) => {
    const p = e.sourceEntity;
    if (e.id !== "fgr:cajado_ataque" || e.message !== "hf_mzs:sculptor_staff" || p?.typeId !== "minecraft:player") return;
    if (p.getItemCooldown("hf_mzs.sculptor_staff") > 0) return;
    const itemStack = p.getComponent("minecraft:equippable")?.getEquipment(mc.EquipmentSlot.Mainhand);
    if (itemStack?.typeId !== "hf_mzs:sculptor_staff") return;
    p.startItemCooldown("hf_mzs.sculptor_staff", 40);
    staff.using({ itemStack, source: p }, true);
});
