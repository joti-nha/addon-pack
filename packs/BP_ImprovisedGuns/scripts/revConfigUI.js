import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { WEAPON_TYPES_FOR_UI, achievements, raritiesColor } from "./vgConstants";
import { world } from "@minecraft/server";
/**
 * Main entrance for the configuration UI
 * @param {import("@minecraft/server").Player} player 
 */
export function showConfigUI(player) {
    const hub = new ActionFormData();

    hub.title({ translate: "rev.ui.hub.title" });
    hub.divider();

    hub.label({ translate: "rev.ui.hub.desc" });
    hub.divider();
    hub.button({ translate: "rev.ui.hub.config" });
    hub.button({ translate: "rev.ui.hub.colors" });
    hub.button({ translate: "rev.ui.hub.advancements" });

    hub.show(player).then((response) => {
        if (response.canceled) return;

        switch (response.selection) {
            case 0:
                showGeneralConfigUI(player);
                break;
            case 1:
                showColorUI(player);
                break;
            case 2:
                showAdvancementsUI(player);
                break;
        }
    }).catch((err) => {
        console.error("Failed to show config hub: " + err);
    });
}

/**
 * Original configuration UI logic
 * @param {import("@minecraft/server").Player} player 
 */
function showGeneralConfigUI(player) {
    const form = new ModalFormData();

    form.title({ translate: "rev.ui.config.title" });
    form.divider();
    form.toggle({ translate: "rev.ui.do_holding_animations.improvised" }, { defaultValue: player.getDynamicProperty("rev:do_holding_animations") ?? true });
    form.divider();
    form.toggle({ translate: "rev.ui.do_disable_camerashake" }, { defaultValue: player.getDynamicProperty("rev:do_disable_camerashake") ?? true });
    form.divider();
    form.toggle({ translate: "rev.ui.do_hit_sound" }, { defaultValue: player.getDynamicProperty("rev:do_hit_sound") ?? true });
    form.divider();
    form.toggle({ translate: "rev.ui.do_fast_particles" }, { defaultValue: player.getDynamicProperty("rev:do_fast_particles") ?? true });
    form.divider();
    form.toggle({ translate: "rev.ui.do_offhand_sneak_restriction" }, { defaultValue: player.getDynamicProperty("rev:do_offhand_sneak_restriction") ?? true });
    form.divider();
    form.toggle({ translate: "rev.ui.do_offhand_item_restriction" }, { defaultValue: player.getDynamicProperty("rev:do_offhand_item_restriction") ?? true });
    form.divider();

    if (player.playerPermissionLevel == 2)
    {
        form.toggle({ translate: "rev.ui.do_pseudo_infinity" }, { defaultValue: world.getDynamicProperty("rev:do_pseudo_infinity") ?? true });
        form.divider();
        form.toggle({ translate: "rev.ui.remove_offshoot" }, { defaultValue: world.getDynamicProperty("rev:enable_offshoot") ?? true });
        form.divider();
    }

    form.submitButton({ translate: "rev.ui.accept_and_back" });

    form.show(player).then((response) => {
        if (response.canceled) {
            showConfigUI(player);
            return;
        }

        const [bl1, doHoldingAnims, bl2, doDisableCameraShake, bl3, doDisableSound, bl4, doFancy, bl5, doOffhandSneak, bl6, doOffhandItem, bl7, doPseudoInfinity, bl8, doRemoveOffshoot] = response.formValues;

        player.setDynamicProperty("rev:do_holding_animations", doHoldingAnims);
        player.setDynamicProperty("rev:do_disable_camerashake", doDisableCameraShake);
        player.setDynamicProperty("rev:do_hit_sound", doDisableSound);
        player.setDynamicProperty("rev:do_fast_particles", doFancy);
        player.setDynamicProperty("rev:do_offhand_sneak_restriction", doOffhandSneak);
        player.setDynamicProperty("rev:do_offhand_item_restriction", doOffhandItem);
        if (player.playerPermissionLevel == 2) 
        {
            world.setDynamicProperty("rev:do_pseudo_infinity", doPseudoInfinity);
            world.setDynamicProperty("rev:enable_offshoot", doRemoveOffshoot);
        }
        if (doHoldingAnims) {
            player.removeTag("rev:disable_holding_animations");
        } else {
            player.addTag("rev:disable_holding_animations");
        }

        player.sendMessage({ translate: "rev.ui.config.saved" });
        showConfigUI(player);

    }).catch((err) => {
        console.error("Failed to show general config UI: " + err);
    });
}

/**
 * New Color Picker UI
 * @param {import("@minecraft/server").Player} player 
 */
function showColorUI(player) {
    const selector = new ActionFormData();
    selector.title({ translate: "rev.ui.hub.colors" });

    for (const weapon of WEAPON_TYPES_FOR_UI) {
        selector.button({ rawtext: [{ text: "§r§l" }, { translate: weapon.label }] });
    }

    selector.show(player).then((response) => {
        if (response.canceled) {
            showConfigUI(player);
            return;
        }

        const selectedWeapon = WEAPON_TYPES_FOR_UI[response.selection];
        showWeaponColorPicker(player, selectedWeapon);

    })
}

/**
 * Specific RGB picker for a weapon
 * @param {import("@minecraft/server").Player} player 
 * @param {object} weapon 
 */
function showWeaponColorPicker(player, weapon) {
    const form = new ModalFormData();
    form.title({ translate: weapon.label });

    const r = player.getDynamicProperty(`rev:color_${weapon.id}_r`) ?? 255;
    const g = player.getDynamicProperty(`rev:color_${weapon.id}_g`) ?? 255;
    const b = player.getDynamicProperty(`rev:color_${weapon.id}_b`) ?? 255;

    form.slider({ translate: "rev.ui.color.r" }, 0, 255, { defaultValue: r });
    form.slider({ translate: "rev.ui.color.g" }, 0, 255, { defaultValue: g });
    form.slider({ translate: "rev.ui.color.b" }, 0, 255, { defaultValue: b });
    form.toggle({ translate: "rev.ui.reset_color" })
    form.submitButton({ translate: "rev.ui.accept_and_back" });

    form.show(player).then((response) => {
        if (response.canceled) {
            showColorUI(player);
            return;
        }

        const [newR, newG, newB, doRes] = response.formValues;
        if (doRes == true) {
            player.setDynamicProperty(`rev:color_${weapon.id}_r`, undefined);
            player.setDynamicProperty(`rev:color_${weapon.id}_g`, undefined);
            player.setDynamicProperty(`rev:color_${weapon.id}_b`, undefined);
            player.sendMessage({ rawtext: [{ translate: 'rev.ui.color_reset' }, { translate: weapon.label }] });
            return;
        }

        player.setDynamicProperty(`rev:color_${weapon.id}_r`, newR);
        player.setDynamicProperty(`rev:color_${weapon.id}_g`, newG);
        player.setDynamicProperty(`rev:color_${weapon.id}_b`, newB);

        player.sendMessage({ rawtext: [{ translate: 'rev.ui.color_changed' }, { translate: weapon.label }] });
        showColorUI(player);

    }).catch((err) => {
        console.error("Failed to show weapon color picker: " + err);
    });
}

/**
 * NEW: Advancements Status UI
 * @param {import("@minecraft/server").Player} player 
 */
function showAdvancementsUI(player) {
    const adv = new ActionFormData();
    adv.title({ translate: "rev.ui.hub.advancements" });

    let rawtext = [];
    achievements.forEach((ach, index) => {
        const isCompleted = player.getDynamicProperty(ach.id) === true;

        rawtext.push({ text: `§r§l§${raritiesColor[ach.rarity][0]}` });
        rawtext.push({ translate: ach.name });
        rawtext.push({ text: "§r\n" });
        rawtext.push({ translate: ach.description });
        rawtext.push({ text: "\n---> " + (isCompleted ? "§a" : "§c") });
        rawtext.push({ translate: isCompleted ? "rev.ui.advancement.status.completed" : "rev.ui.advancement.status.not_completed" });
        
        if (index < achievements.length - 1) {
            rawtext.push({ text: "\n\n" });
        }
    });

    adv.label({ rawtext: rawtext });
    adv.button({ translate: "rev.ui.accept_and_back" });

    adv.show(player).then((response) => {
        showConfigUI(player);
    }).catch((err) => {
        console.error("Failed to show advancements UI: " + err);
    });
}
