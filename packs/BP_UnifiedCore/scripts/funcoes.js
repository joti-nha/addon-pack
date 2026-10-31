// Addon Pack - Unified Core: funcoes de comando que rodavam todo tick (otimizacao pedida pelo João em 2026-10-31).
// Antes, o functions/tick.json unido (com todas as funcoes abaixo) estava em 6 packs, e cada pack com tick.json
// pode rodar a lista dele: as funcoes rodavam ate 6 vezes por tick. Agora so o Dungeons tem tick.json (stun_cd, que
// conta tempo por tick) e o resto roda daqui, espacado. Os efeitos dessas funcoes duram 1 s ou mais, entao renovar
// a cada 0,5 s nao muda nada no jogo.
import { world, system } from "@minecraft/server";

// [periodo em ticks, deslocamento, comando]; os deslocamentos espalham as funcoes por ticks diferentes
const TAREFAS = [
  [40, 0, "function events/worlds/on_initialise"], // Common Sense: placares e etiqueta "mount" dos cavalos
  [40, 20, "function disable_command_stuff"], // Better on Bedrock: regras de comando para jogador novo
  [10, 1, "function events/players/on_death"], // Common Sense: itens de volta ao renascer
  [10, 1, "function events/players/on_first_join"], // Common Sense
  [10, 3, "function settings/config"], // Common Sense: opcoes (fogueira, totem, tocha na mao secundaria...)
  [10, 5, "function item_effect"], // Common Sense: lanterna e tocha de alma, capacete de mergulho
  [10, 7, "function armor_effects"], // Dark Age: efeitos dos conjuntos de armadura
  // Common Sense: montaria quebrando folhas; precisa ser frequente para o cavalo correndo nao pular folhas
  [2, 0, "execute if score .Initialised bv:breakleaves matches 2 run function leave_touch"],
];

let t = 0;
system.runInterval(() => {
  const dim = world.getDimension("overworld");
  for (const [periodo, desloc, cmd] of TAREFAS) {
    if (t % periodo !== desloc % periodo) continue;
    try { dim.runCommand(cmd); } catch (e) { }
  }
  t = (t + 1) % 40;
}, 1);
