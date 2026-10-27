import { EntityInventoryComponent, ItemStack, world, PlatformType } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

/**
 * @param { import("@minecraft/server").ItemStack } itemStack
 * @param { import("@minecraft/server").Player } player
 */
export function configScreen(itemStack, player) {
    if (itemStack.typeId !== "better_on_bedrock:config")
        return;

    const form = new ModalFormData()
    .title("Configurações do Mundo")
    if (!world.gameRules.keepInventory)
        form.toggle("Corpo ao Morrer - Ativa o corpo do jogador", { defaultValue: player.hasTag("allow_corpse") });
    form.toggle("O Que É Este Bloco? [UI] - Ativa a interface 'WAILA'", { defaultValue: player.hasTag("toolTip") })
    .toggle("Sons Ambientes", { defaultValue: player.hasTag("pog:ambientSounds") })
    .toggle("Névoa dos Biomas do End - Ativa a névoa nos biomas do End", { defaultValue: player.hasTag("endFog") })
    .show(player).then((response) => {
        if (response.canceled)
            return;

        const responses = [];
        if (world.gameRules.keepInventory)
            responses.push(null);
        responses.push(...response.formValues);
        const [
            isPlayerCorpseEnabled,
            isWailaEnabled,
            isAmbientSoundsEnabled,
            isEndBiomeFogEnabled,
        ] = responses;

        player.sendMessage([
            { text: "§a[!] §r" },
            { translate: "bob.message.configUpdated" }
        ]);

        const enabled = "§a%addServer.resourcePack.enabled§r";
        const disabled = "§c%addServer.resourcePack.disabled§r";

        // Player Corpse
        if (!world.gameRules.keepInventory) {
            if (true == isPlayerCorpseEnabled)
                player.addTag("allow_corpse");
            else
                player.removeTag("allow_corpse");
            player.sendMessage(" §8- §7Corpo do Jogador: ".concat(isPlayerCorpseEnabled ? enabled : disabled));
        };

        // Waila
        if (true == isWailaEnabled)
            player.addTag("toolTip");
        else
            player.removeTag("toolTip");
        player.sendMessage(" §8- §7Interface O Que É Isso: ".concat(isWailaEnabled ? enabled : disabled));
        
        // Ambient Sounds
        if (true == isAmbientSoundsEnabled)
            player.addTag("pog:ambientSounds");
        else {
            player.removeTag("pog:ambientSounds");
            player.stopMusic();
        }
        player.sendMessage(" §8- §7Sons Ambientes: ".concat(isAmbientSoundsEnabled ? enabled : disabled));

        // End Biome Fog
        if (true == isEndBiomeFogEnabled)
            player.addTag("endFog");
        else {
            player.removeTag("endFog");
            player.removeTag("abyssal");
            player.removeTag("vacant");
            player.removeTag("shroom");
            player.removeTag("void");
            player.removeTag("chorus");
            player.runCommand("fog @s remove test");
        };
        player.sendMessage(" §8- §7Névoa dos Biomas do End: ".concat(isEndBiomeFogEnabled ? enabled : disabled));
    });
};

/** @param { import("@minecraft/server").Player } player */
export function configItem(player) {
    const systemInfo = player.clientSystemInfo;
    const switchCheck = (
        systemInfo.maxRenderDistance <= 12
        && systemInfo.platformType == PlatformType.Console
    );

    if (!player.hasTag("gotConfig")) {
        player.addTag("allow_corpse");
        // [Addon Pack] "What's That UI" (toolTip) desligado por padrao: a Reliquia da Videncia (Eternal Caves) o substitui
        player.addTag("gotConfig");
        player.addTag("pog:ambientSounds");

        // [Addon Pack] guia nao e mais entregue no 1o acesso (continua craftavel)
    };
};