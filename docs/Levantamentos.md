# Levantamentos – Addon Pack (rodada 0.8)

Sem teste no jogo. Tudo abaixo foi levantado lendo os arquivos dos addons.

## #15 Tiers de ferramentas e minérios

Como cada addon decide "quem quebra o quê":

| Addon | Itens (ferramentas) | Blocos |
|---|---|---|
| Vanilla / Aquaculture / Mowzie / Eternal End / Dungeons | tags `minecraft:<material>_tier` | tags `minecraft:<wooden/stone/iron/golden/diamond/netherite>_tier` ou `*_tier_destructible` |
| Better on Bedrock | + `better_on_bedrock:amethyst_tier`, `stardust_tier`; tags `*_pick_diggable` | `*_pick_diggable` e tiers vanilla |
| Cataclysmical | só `wood/stone/iron/gold/diamond_pick_diggable` | tiers vanilla |
| Eternal Caves | 11 materiais próprios (`titanium, chitin, mummy, corruptium, aetherium, nocturite, pyronite, cryorite, verdite, bone, chainmail`) em dois prefixos (`minecraft:` e `panascais_common:`) | `*_tier_destructible` nos dois prefixos |
| Eternal End | `panascais_common:ametrine/enderite/shulker/cloud_tier` | `panascais_common:ametrine/enderite_tier` |
| Forsaken Odyssey | tags próprias `ntk:pickaxe_diggable`, `axe_`, `shovel_`, `hoe_`, `sword_`, `shears_`, `any_tool_`, `instant_`, `no_tool_` + tiers vanilla | idem (`ntk:*_diggable`) |

**O que já funciona:** o Compat A&S carrega tiers do Caves nas ferramentas que ele cobre e `ntk:*_diggable` em 27 itens, então ferramentas do Forsaken e do Caves quebram os próprios blocos.
**O que falta (precisa da sua decisão):** uma tabela de equivalência. Exemplo de pergunta que a tabela responde: "picareta de titânio (Caves) quebra minério de tungstênio (Forsaken)?". Proposta: ordenar tudo numa escada única (madeira < pedra < cobre < ferro < ouro < diamante < titânio/ametrina < netherite < enderite) e dar a cada bloco o tier mínimo. Só implemento depois de você aprovar a escada, porque muda o progresso de todos os addons.

## #23 Modelos do Eternal End invisíveis – causa provável (corrigida)

O Eternal End define 4 materiais próprios em `materials/entity.material` (`panascais_end_jellyfish_head`, `panascais_end_portal`, `panascais_end_companion_outline_base`, `panascais_end_companion_outline`). Dez packs trazem esse mesmo arquivo; só um sobrevivia na pilha, e os modelos do End ficavam sem material (invisíveis). O script agora une os materiais de todos os packs num só arquivo. **A confirmar no jogo.**

## #22 Outros conflitos tratados nesta rodada

- **UI**: `_ui_defs` (união), `hud_screen` (Better on Bedrock + CommonSense + JavaCombat + Dungeons), `chat_screen`, `inventory_screen` (CommonSense + Farmers Delight), `chest_screen` (OTG vence), `_global_variables`.
- **Tabelas de saque** (13) e **trocas de aldeões** (4): união sem repetir itens (Better on Bedrock × CommonSense × Dungeons × Forsaken).
- **Entidades vanilla**: `evocation_illager`, `villager_v2` (BoB × RnR), `drowned`/`pillager` (cliente, BoB × Dungeons).
- **Dados**: sons, `blocks.json`, materiais, catálogo do criativo, `tick.json`.
- **Caminhos iguais, itens diferentes** (19 arquivos entre Eternal Caves/End, Mowzie, Better on Bedrock, CommonSense): arquivos do End e do Mowzie renomeados (`end_`, `mzs_`) para ninguém perder livro, configurações, `player_utility`, armaduras de shulker, etc.
- **Modelos com o mesmo nome** (Better on Bedrock × Dungeons): `baby_ghast`, `enchanter`, `frozen_zombie`, `illusioner`, `wraith` (geometria, e animações de `illusioner` e `wraith`) e `projectile` (BoB × Mowzie): os arquivos e identificadores do Better on Bedrock passam a ter prefixo `bob_` (modelo, animação e referências nas entidades dele). Sem isso uma das duas versões dos mobs ficava com o modelo/animação do outro.
- **Em aberto:** `models/blocks/slab.geo.json` (BoB, Cataclysmical, Mowzie, Dungeons; BoB e Cataclysmical usam o mesmo identificador `geometry.slab`).

## #24 Animações do A&S nos mobs do Eternal Caves – NÃO aplicado (decisão técnica)

Com o A&S real em mãos: as definições de entidade dele são ofuscadas (dentro de `.brarchive`) e usam geometrias e animações próprias (`geometry.oreville_ans.*`) amarradas aos ossos dos mobs vanilla. Os 71 mobs do Caves têm geometria e conjunto de animações próprios, com ossos diferentes; ligar as animações do A&S a eles sem ver o resultado no jogo deforma ou quebra o modelo (membros girando no lugar errado), e o erro não aparece em nenhuma verificação offline. Por isso **não apliquei**. Se você quiser tentar mesmo assim, o caminho conservador é um mob de cada vez (começando por zumbis/esqueletos do Caves, que seguem o rig vanilla) e você me diz o que viu no jogo.

## #25 Estruturas em biomas personalizados – feito (tags)

Os biomas do Forsaken substituem biomas vanilla (`mossy_forest` → pântano, `corrupted_forest` → planalto de mesa, `overgrown_jungle` → selva) mas não carregavam as tags vanilla, então regras de geração de outros addons que filtram por `swamp`, `forest`, `jungle`, `mesa` os ignoravam. Acrescentei: `mossy_forest` += `swamp, forest`; `corrupted_forest` += `mesa, forest`; `overgrown_jungle` += `jungle`. Efeito colateral possível: elementos de floresta/pântano vanilla também nascem nesses biomas. Estruturas vanilla com tags `has_structure_*` não foram alteradas.

## #27 Forja de runas (ferreiro anão do Eternal Caves) – feito (tags)

O ferreiro funde **gemas** (ônix, rubi, esmeralda, safira, opala…) em equipamento; o código aceita itens com a tag `minecraft:is_tool` ou `minecraft:is_sword` (ferramentas e armas) e `minecraft:is_armor` (armaduras). 166 itens de outros addons não tinham essas tags (lanças, glaives, adagas, facas, armaduras do Cataclysmical, DarkAge, Mowzie, Better on Bedrock, Forsaken, Aquaculture…). Acrescentei a tag que faltava (edição mínima de cada arquivo de item, como diferença na receita). Fora: mochilas do OTG, pergaminhos, itens de depuração, planador, cabeças e itens de teste. **A confirmar no jogo:** se os efeitos das gemas funcionam em itens de outros addons (alguns efeitos dependem do tipo de dano/acerto).

## #28 Consolidar texturas por classe – inventário (aguardando sua aprovação)

Itens por classe (tags de classe), todos os addons:

| Classe | Itens | Onde |
|---|---|---|
| Armadura | 598 | Dungeons 300, Forsaken 115, OTG 48 (mochilas), Eternal Caves 38, BoB 21, DarkAge 20, Cataclysmical 18, End 14, Mowzie 13, Aquaculture 10 |
| Arco/arremesso | 144 | Dungeons 68, Forsaken 61, BoB 4, Caves 3, … |
| Espada | 136 | Dungeons 76, Cataclysmical 31, Caves 11, Aquaculture 6, BoB 5, Forsaken 5, End 2 |
| Machado | 28 | Caves 10, Cataclysmical 6, Forsaken 6, BoB 3, End 2, Aquaculture 1 |
| Picareta | 25 | Caves 10, Forsaken 5, BoB 3, Dungeons 3, End 2, Aquaculture 1, Cataclysmical 1 |
| Enxada | 21 | Caves 10, Forsaken 5, Dungeons 2, End 2, BoB 1, Aquaculture 1 |
| Pá | 19 | Caves 10, Forsaken 5, End 2, BoB 1, Aquaculture 1 |
| Lança | 18 | Dungeons 9, Forsaken 5, Cataclysmical 4 |
| Montante | 11 | Dungeons 11 |

Proposta (não executei): conjunto canônico por classe e material (madeira, pedra, ferro, ouro, diamante, netherite) vindo do vanilla/Bare Bones; as ferramentas de material comum de outros addons (por exemplo as de Aquaculture e BoB, 12 itens entre pá/picareta/enxada/machado) virariam equivalentes dos canônicos; ferramentas de material próprio (titânio, ametrina…) ficam. Preciso da sua confirmação do que entra no conjunto canônico antes de remover qualquer item.

## #16 Livro do Viajante e #26 progresso do RPG no livro – próximo passo

Ambos usam o mesmo padrão (item travado no inventário, `keepOnDeath`, reemissão automática). Antes de escrever, preciso decidir com você o conteúdo: quais capítulos o Livro do Viajante terá e que dados do RPG ficam no livro de progresso (nível, classe, habilidades). Ver perguntas no fim da resposta.


## Rodada 0.9 – o que foi feito

**#15/#27 Escada de tiers (script, tabela editável).** `BP_UnifiedCore/scripts/niveis.js` define o nível de cada picareta e de cada minério (69 minérios, 31 picaretas; picaretas de outros addons caem num nível por durabilidade). O script `main.js` cancela a quebra de um minério se a picareta for de nível menor e mostra a mensagem na barra de ação (criativo ignora). Escada: 1 madeira/ouro, 2 pedra/cobre/estanho/zinco/bronze/latão, 3 ferro/quitina/múmia/olivina/ametista/afiada, 4 diamante/netúnio/titânio, 5 netherite/enderite BoB/criorita, 6 verdita, 7 nocturita, 8 pironita/sunflare, 9 aetherium, 10 corruptium, 11 runebreaker, **12 Eternal End (maior)**; **Stardust quebra qualquer bloco** (nível 99). As picaretas do End e do Stardust também ganharam as tags de tier do Caves/vanilla, para que os minérios que o motor gateia por tag (Caves, BoB) cedam a elas. Os minérios do Realistic Biomes (`oreville_rb:*`) são blocos decorativos, não minérios: não entram. Claymore e Star Sword do Cataclysmical (que não têm animação) ficam de fora de qualquer equivalência e não foram alteradas.

**#28 Consolidação.** As 5 lanças duplicadas do BoB (madeira, pedra, ferro, ouro, diamante) e a `dungeons:diamond_sword` ficaram escondidas do menu criativo; receitas e baús/loot agora entregam o item vanilla. Os itens continuam existindo (nada quebra em mundos antigos).

**#29 Danos.** Recalculados por família de material, na escala da escada (espada/machado): estanho, zinco, bronze, latão 5; olivina 6; enderite BoB 12→8; stardust 11→10; netúnio 7; End enderite 11 e ametrina 10 (maiores). Armas únicas (Dungeons, chefes) não mudaram. **Alabarda da gárgula (`dk:halberd`) 20→10.** Valores fora da curva que deixei como estão (se quiser, ajusto): `meowclysm` 1000, `calamity` 400, `debugging_tool` 50, `piglin_war_hammer` 20 (nicothekid), `eternity_edge` 25.

**#26/#16 Livros** (no Unified Core): **Livro de Progresso RPG** (só dados do jogador: classe, nível, almas, nível dos 3 caminhos e melhorias ativas/desligadas) e **Livro do Viajante** (capítulos por descoberta: carregar itens do addon, visitar o End, ter classe; o capítulo da escada de tiers é sempre visível). **Não são entregues no início nem ficam travados** (só o RPG Guide do RPG Addon continua fixo); ambos são craftáveis: Livro + Redstone (Progresso) e Livro + Bússola (Viajante). Os dados do jogador ficam em placar e tags do RPG, então perder o livro não perde nada.

**Slab.** `geometry.slab` do BoB virou `geometry.bob_slab` (arquivo `bob_slab.geo.json`, 20 blocos atualizados), então BoB e Cataclysmical convivem sem trocar os modelos.

**Runas/forja.** Estendi as tags de forja ao `test:vibranium_sword` (RPG), o único item viável que ainda ficava de fora; os outros 166 já estavam.

## Sugestões (rodada 0.10)
1. Conferir no jogo, nesta ordem: abrir o mundo com o log de scripts (Configurações > Criador > "Mostrar erros de script") ligado; erro de um script derruba só aquele pack.
2. Se um menu do RPG ainda não abrir, testar com o book fora de mãos duplas (UserBusy) e olhar o log.
3. `MAX_STACK` (Grimório) é 1 por pedido; se quiser pilhas, basta mudar a constante em `BP_ForsakenGrimoire/scripts/main.js`.
4. Mesmo item em dois packs (override) é frágil; prefira alterar o item no pack dono (como feito com a Luneta).
5. Resource pack nunca deve depender de behavior pack (removido nos dois RPs próprios).
6. Lista de packs: manter Unified Core e Compat acima dos originais na ordem de ativação.
