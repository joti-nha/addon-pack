import { ActionFormData } from "@minecraft/server-ui";

const credits = [
    {
        discipline: "Contributors",
        titles: [
            {
                title: "Code",
                names: [
                    "Poggy",
                    "xKingDark"
                ]
            },
            {
                title: "Music",
                names: [
                    "J. Rivers",
                    "da_sleepyfox (PatchytheFox)"
                ]
            },
            {
                title: "Textures & Models",
                names: [
                    "Zifix",
                    "Lulu",
                    "ToilsomeGotat",
                    "Izagam1",
                    "PenguinThold",
                    "Grimm",
                    "Yannasakanna",
                    "Poggy",
                    "Creepager15",
                    "Hachuden"
                ]
            },
            {
                title: "SFX & Animations",
                names: [
                    "da_sleepyfox (PatchytheFox)"
                ]
            },
            {
                title: "UI",
                names: [
                    "LeGend077",
                    "xKingDark",
                    "Dingsel"
                ]
            },
            {
                title: "World Generation",
                names: [
                    "Xorkent",
                    "Elektrika",
                    "Ciosciaa",
                    "Poggy"
                ]
            },
            {
                title: "Structures",
                names: [
                    "Cude",
                    "JacktheWolf",
                    "Poggy",
                    "Creepager15",
                    "Lulu",
                    "da_sleepyfox (PatchytheFox)",
                    "Pan",
                    "exsilit",
                    "BugTonyMC [YT]",
                    "KingZee [YT]",
                    "Mechitecy [YT]",
                    "KoalaBuilds [YT]",
                    "Nanaroid [YT]"
                ]
            }
        ]
    },
    {
        discipline: "Special Thanks",
        titles: [
            {
                title: "Criaturas Encantadas",
                names: [
                    "Xorkent"
                ]
            },
            {
                title: "Translators",
                names: [
                    "PottedPropagule (es_MX)",
                    "AnotherSeawhite (ko_KR)",
                    "unihumi (de_DE)",
                    "JaylyDev (zh_TW, zh_CN)",
                    "m0lc14kk (pl_PL)"
                ]
            },
            {
                title: "Testers",
                names: [
                    "HeyIt'sBugs",
                    "ExulantBen",
                    "xKingDark",
                    "Poggy",
                    "da_sleepyfox (PatchytheFox)",
                    "Zifix",
                    "Cude",
                    "Lulu",
                    "Elektrika",
                    "Creepager"
                ]
            }
        ]
    }
];

/** @param { import("@minecraft/server").Player } player */
export function creditScreen(player) {
    let body = "Better on Bedrock is proudly owned by Poggy.\n";
    for (let i = 0; i < credits.length; i++) {
        const credit = credits[i];
        body = body.concat("\n§e§l", credit.discipline, "§r\n");
        for (let j = 0; j < credit.titles.length; j++) {
            const title = credit.titles[j];
            body = body.concat("\n§7§l", title.title, "§r\n");
            for (let k = 0; k < title.names.length; k++) {
                const name = title.names[k];
                body = body.concat(" §8-§r ", name, "§r\n");
            };
        };
    };

    new ActionFormData()
        .title("Credits")
        .body(body)
        //.button("§c< %gui.goBack§r")
        .show(player);//.then(() => lostJournal(player));
};

/** @param { import("@minecraft/server").Player } player */
function toolProgression(player) {
    let body =
        "%bob.info.toolProgression";

    new ActionFormData()
        .title("Progressão de Ferramentas")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};
function oreDistribution(player) {
    let body =
        "%bob.info.ores";

    new ActionFormData()
        .title("Distribuição de Minérios")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};
function stardustUpgrade(player) {
    let body =
        "%bob.info.stardustUpgrade\n\n"
        + "- %bob.info.stardustStepOne\n"
        + "- %bob.info.stardustStepTwo\n"
        + "- %bob.info.stardustStepThree\n"
        + "- %bob.info.stardustStepFour\n";

    new ActionFormData()
        .title("Melhoria de Poeira Estelar")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};
function armorSets(player) {
    let body =
        "%bob.info.armorSets";

    new ActionFormData()
        .title("Conjuntos de Armadura")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};
function enchantments(player) {
    let body =
        "%bob.info.enchantments\n"
        + "%bob.info.veinMiner\n"
        + "%bob.info.treeCapitator\n"
        + "%bob.info.leafyLiberator\n"
        + "%bob.info.harvestTouch\n"
        + "%bob.info.oreSmelt\n\n"
        + "%bob.info.enchantmentsObtain"
        ;

    new ActionFormData()
        .title("Enchantments")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};
function endProgression(player) {
    let body =
        "%bob.info.endProgression";

    new ActionFormData()
        .title("Progressão do End")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};
function trophies(player) {
    let body =
        "%bob.info.trophies";

    new ActionFormData()
        .title("Trophies")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};
function quests(player) {
    let body =
        "%bob.info.quests";

    new ActionFormData()
        .title("Quests")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};
function bounty(player) {
    let body =
        "%bob.info.bounty";

    new ActionFormData()
        .title("Bounties")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
}
function enchantedMobs(player) {
    let body =
        "%bob.info.enchantedMobs";

    new ActionFormData()
        .title("Criaturas Encantadas")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
}
function waystone(player) {
    let body =
        "%bob.info.waystone";

    new ActionFormData()
        .title("Waystone")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
}
function magicStaffs(player) {
    let body =
        "%bob.info.magicStaffs\n\n"
        + "%bob.info.runeLocations";

    new ActionFormData()
        .title("Cajados Mágicos")
        .body(body)
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
}

/** @param { import("@minecraft/server").Player } player */
export function lostJournal(player) {
    new ActionFormData()
        .title("Info")
        .body("Bem-vindo ao livro de informações!\nAqui você encontra informações importantes sobre o Better on Bedrock")
        .button("Contributions", "textures/items/misc/poggy_boss/the_ardent_crystal")
        .button("Bem-vindo!", "textures/items/diamond")
        .button("Progressão de Ferramentas", "textures/items/stone_pickaxe")
        .button("Distribuição de Minérios", "textures/items/coal")
        .button("Melhoria de Poeira Estelar", "textures/items/tool_progression/stardust_upgrade")
        .button("Conjuntos de Armadura", "textures/items/diamond_chestplate")
        .button("Enchantments", "textures/items/book_normal")
        .button("Progressão do End", "textures/items/ender_eye")
        .button("Trophies", "textures/items/trophies/fixed_ghost_necklace")
        .button("Quests", "textures/items/bounty_system/bounty_paper_open")
        .button("Bounties", "textures/items/bounty_system/bounty_scroll_open")
        .button("Criaturas Encantadas", "textures/items/spawn_egg")
        .button("Waystone", "textures/items/waystone/waystone")
        .button("Cajados Mágicos", "textures/items/staffs/ice_staff")
        .show(player).then((response) => {
            if (response.canceled)
                return;

            switch (response.selection) {
                case 0: creditScreen(player); break;
                case 1: beginnerPage(player); break;
                case 2: toolProgression(player); break;
                case 3: oreDistribution(player); break;
                case 4: stardustUpgrade(player); break;
                case 5: armorSets(player); break;
                case 6: enchantments(player); break;
                case 7: endProgression(player); break;
                case 8: trophies(player); break;
                case 9: quests(player); break;
                case 10: bounty(player); break;
                case 11: enchantedMobs(player); break;
                case 12: waystone(player); break;
                case 13: magicStaffs(player); break;
            };
        });
};

/** @param { import("@minecraft/server").Player } player */
export function beginnerPage(player) {
    new ActionFormData()
        .title("Bem-vindo!")
        .body("bob.welcomePage")
        .button("§c< %gui.goBack§r")
        .show(player).then(() => lostJournal(player));
};