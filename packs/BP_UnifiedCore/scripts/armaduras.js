// Addon Pack - Unified Core (BP)
// Descricao das armaduras de outros addons: bonus de conjunto do Dungeons e espacos de gema do Eternal Caves.
// As etiquetas que ativam os dois sistemas ficam nos itens (ferramentas/armaduras.py); aqui so o texto,
// escrito na descricao (lore) da peca quando ela entra no inventario. O bloco de gemas que o Ferreiro Anao
// escreve fica separado e nao e mexido.
import { world, system } from "@minecraft/server";
import { ARMADURAS } from "./armaduras_dados.js";

const MARCA = "§r§A§P§A§R§M§r"; // invisivel; identifica o texto deste script

function temMarca(item) {
  try {
    return item.getRawLore().some((l) => l.rawtext?.some((p) => p.text?.includes(MARCA)));
  } catch (e) {
    return item.getLore().some((l) => l.includes(MARCA));
  }
}

function descricao(bonus, gemas) {
  const linhas = [];
  if (bonus) {
    linhas.push({ rawtext: [{ text: MARCA }, { translate: "dungeons.desc.armour.full_set" }] });
    linhas.push({ rawtext: [{ translate: `dungeons.desc.armour.${bonus}` }] });
  }
  const g = { rawtext: [{ translate: "unified.armadura.gemas", with: [String(gemas)] }] };
  if (!bonus) g.rawtext.unshift({ text: MARCA });
  linhas.push(g);
  return linhas;
}

world.afterEvents.playerInventoryItemChange.subscribe(({ player, itemStack, slot }) => {
  if (!itemStack) return;
  const info = ARMADURAS[itemStack.typeId];
  if (!info || temMarca(itemStack)) return;
  system.run(() => {
    const inv = player.getComponent("minecraft:inventory")?.container;
    const item = inv?.getItem(slot);
    if (!item || item.typeId !== itemStack.typeId || temMarca(item)) return;
    let atual = [];
    try { atual = item.getRawLore(); } catch (e) { atual = item.getLore(); }
    item.setLore([...descricao(info[0], info[1]), ...atual]);
    inv.setItem(slot, item);
  });
});
