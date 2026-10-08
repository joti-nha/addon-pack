# Roteiro de execução – Addon Pack (do mais simples ao mais complexo)

Versão 0.4 · complementa o `Plano_Unificacao_Modpack.md`. Nada foi testado no jogo; "a confirmar" marca o que só o teste resolve.
Legenda: ✅ feito · 🟡 feito em parte · ⬜ pendente

## Todos os pedidos, em ordem de execução

### Nível 1 – Trivial
| # | Pedido | Estado | Observação |
|---|---|---|---|
| 1 | Créditos aos criadores originais, CHANGELOG | ✅ | `CREDITS.md`, `CHANGELOG.md` dentro do pack |
| 2 | Reformular os livros iniciais (fim da "epifania inicial") – RPG Addon | ✅ | 6 mensagens de boas-vindas removidas |
| 3 | Idem – Mowzie's Mobs e Realistic Biomes | ✅ | entrega automática do guia/handbook removida (continuam craftáveis) |
| 4 | Bússola da Natureza com nomes reais de biomas | ✅ | 87 biomas, pt_BR e en_US, busca sem acento |
| 5 | Layout de classe do RPG sempre desligado por padrão | ✅ | HUD desligado (tag `hide_rpg_hud`); o menu da árvore de habilidades não muda |
| 6 | Mobs do subterrâneo (Eternal Caves) começam em 50% | ✅ | só para configurações novas |
| 7 | Armas grandes do Cataclysmical com resfriamento maior pelo tamanho (mecânica do Java) | ✅ | 43 armas, 8 a 33 ticks, no JavaCombat. Layout do combate não incluído, como pedido |
| 8 | Alylica's Dungeons 2.1.0 | ✅ | substitui a 2.0.3; compat regenerado (ver abaixo) |

### Nível 2 – Simples
| # | Pedido | Estado | Observação |
|---|---|---|---|
| 9 | Incluir os extras: Nature's Compass, Improvised Guns v3.0.5, CommonSense 1.7.1 (Trinkets ON), A Magic Way v1.9 | 🟡 | Nature's Compass feito. Improvised Guns, CommonSense e A Magic Way **ainda não entraram no bundle**: checar UUIDs/dependências primeiro |
| 10 | Corrigir erro de digitação `overille:is_,mace` do claymore | ✅ | corrigido na regeneração |
| 11 | **Correção do JavaCombat para ferramentas de outros addons:** a escolha do resfriamento usa a **primeira** tag `minecraft:is*` (quase sempre `is_tool`), então picaretas/pás/machados de outros addons caem no padrão de 5 ticks | ⬜ | troca de 1 predicado no `loading.js` (ofuscado): procurar a primeira tag que exista na tabela. Isso responde ao pedido "combate funcional em ferramentas que se assemelham às comuns" |
| 12 | Armas do Cataclysmical sem textura | ⬜ | listar quais itens não têm textura e decidir: reaproveitar item semelhante ou desenhar |
| 13 | Armas novas da 2.1.0 do Dungeons sem classe no A&S (luvas, cajados, serras) | ⬜ | 20 itens aproximadamente; classificar por componente |

### Nível 3 – Médio (decisões de design + scripts de ponte)
| # | Pedido | Estado | Observação |
|---|---|---|---|
| 14 | Itens do Dungeons que **conjuram em vez de golpear**: animações de varinha do Forsaken; se não der, A Magic Way | 🟡 | **Decidido: gesto curto ao usar.** 83 artefatos têm attachable de sprite com um gesto de 0,45 s (levanta o item) disparado quando o jogador usa o item, em 1ª e 3ª pessoa (animação no Unified Core). **A confirmar no jogo:** o gatilho é a variável de golpe do jogador; se o uso do artefato não a ativar, o gesto não aparece e o item só fica na mão. Não usei as animações do Forsaken (calibradas para o modelo 3D deles e para tempo de carga) nem as do A Magic Way (dependem dos scripts dele). 7 artefatos que já tinham attachable próprio ficaram sem gesto |
| 15 | **Sincronizar minérios / níveis de picareta entre os addons** | ⬜ | 29 tags de tier diferentes; Forsaken usa sistema próprio (`ntk:*_diggable`). Plano: tabela única de tiers (madeira, pedra, cobre, ferro, ouro, diamante, netherite + tiers dos addons), tabela bloco → tier mínimo, ponte para o Forsaken. Começa pelo levantamento (lista de todas as picaretas e dos minérios com seu tier) |
| 16 | Livro do Viajante (capítulos liberados por descoberta) | ⬜ | reaproveitar o padrão do RPG Addon (`lockMode = inventory`, `keepOnDeath`) |
| 17 | Lupa do Eternal Caves no lugar do "look" do Better on Bedrock | ⬜ | ainda não localizei o recurso no BoB nem examinei a lupa do Caves |
| 18 | Armas grandes classificadas por tamanho (montante = animação de espada com velocidade muito reduzida) | 🟡 | resfriamento feito (#7). Falta a animação: classe própria no A&S (candidato: `oreville:is_mace`, já aplicado aos claymores do Dungeons) |
| 19 | Fazer os addons conversarem entre si | ⬜ | depende de #15, #16, #20; sem lista fechada ainda |

### Nível 4 – Médio-alto (merges)
| # | Pedido | Estado | Observação |
|---|---|---|---|
| 20 | Layout do combate funcionando com o OTG Backpack (OTG é o único prioritário) | ⬜ | risco real: `entities/player.json` triplo (JavaCombat × OTG × RPG) e `ui/hud_screen.json` (JavaCombat × Dungeons) |
| 21 | Outros merges de UI: `chest_screen` (OTG vence), `server_form` (RPG), `inventory_screen` | ⬜ | ver tabela do plano |
| 22 | Merges de mobs vanilla, loot, trocas, receitas | ⬜ | Better on Bedrock × Dungeons × Forsaken |
| 23 | **Modelos do Eternal End invisíveis** | ⬜ | reproduzir com o End sozinho e ir somando packs; hipóteses: ordem de packs, material/geometria |
| 24 | Animações do A&S nos mobs do Eternal Caves (zumbis → zumbi, esqueletos → esqueleto, mossback → vaca, seers_relic → luneta, "muitos outros") | ⬜ | levantar a lista de mobs do Caves e mapear para o rig vanilla mais próximo |

### Nível 5 – Complexo
| # | Pedido | Estado | Observação |
|---|---|---|---|
| 25 | Estruturas geradas em biomas personalizados | ⬜ | só o Forsaken tem biomas próprios (`ntk:mossy_forest`, `ntk:corrupted_forest`, `ntk:overgrown_jungle`); regras de geração dos outros precisam incluí-los |
| 26 | Progresso do RPG dentro do livro, impossível de tirar do inventário | ⬜ | com cópia de segurança no jogador e reemissão automática |
| 27 | Forja de runas utilizável nos itens de todos os mods | ⬜ | **Confirmado:** é a forja do anão NPC (Eternal Caves), que forja runas com efeitos novos em armas e equipamentos. Primeiro passo: descobrir como o anão decide quais itens aceitam runa (lista de IDs, tags ou slot); depois liberar por tag de classe |
| 28 | "Fechar" texturas por classe (ou trocar por item semelhante com propriedades certas) | ⬜ | **Decidido: consolidar.** Cada classe (espada, picareta…) tem um conjunto canônico; duplicatas viram equivalentes e saem do criativo; itens já no inventário continuam funcionando. Primeiro passo: inventário de todos os itens por classe e proposta de conjunto canônico para você aprovar antes de mexer em qualquer item |
| 29 | Balanceamento global e licenças | ⬜ | OTG: sem reenvio; Farmers Delight (MIT) e Bare Bones & Stuff com condições próprias |

## Mudanças desta rodada
- **Cataclysmical**: 43 armas na tabela de resfriamento do JavaCombat. Verificado rodando o código do JavaCombat fora do jogo (3 combinações de tag/slot por arma, 0 divergências).
- **Dungeons 2.1.0**: 671 itens (eram 472). Correção de uma afirmação minha anterior: **nenhum item foi removido**; os "50 arcos e bestas removidos" eram erro de leitura dos arquivos (comentários dentro do JSON). A 2.1.0 já marca arcos e bestas para o A&S.
- **A&S Compatibility 1.3**: no lugar das 52 cópias antigas, 29 itens só com a tag de classe, 125 attachables nativos com `parent_setup` e 83 attachables de sprite para artefatos.
- **Unified Core 0.1.1**: CHANGELOG novo.

## Decisões já tomadas
1. Artefatos do Dungeons: gesto curto ao usar (feito, a confirmar no jogo).
2. Texturas: consolidar (pendente de execução, ver #28).
3. Forja de runas: a do anão NPC do Eternal Caves (ver #27).
4. Entrega: script de montagem (`Addon_Pack_Montagem.zip`, ver LEIA-ME).

## Próximas decisões que vou precisar
Nenhuma agora. O próximo passo natural é o #11 (correção do resfriamento para ferramentas de outros addons) e o levantamento de tiers (#15); sigo pela ordem do roteiro.

## Riscos
- Edições diretas em scripts originais (RPG, Eternal Caves, JavaCombat, Nature's Compass) somem se o autor atualizar o addon: reaplicar pela lista do CHANGELOG.
- Os attachables copiados do Dungeons ficam desatualizados quando o Dungeons atualizar: regenerar com o script do compat.
- Tudo acima está sem teste no jogo.


## v0.5 – pendências novas
- Mesclar `entities/player.json` (CommonSense, JavaCombat, OTG, RPG: o último pack vence).
- CommonSense também sobrescreve skeleton, drowned, goat, copper_golem: conferir conflito com Dungeons/IG.
- Incluir A Magic Way (BP+RP v1.9) no pacote.
- Livro do Viajante consolidado (um livro único no lugar dos guias removidos).
- Corrigir TAG_TICKS do JavaCombat (primeira tag costuma ser `is_tool`).
- Testar no jogo: lupa (espelhamento, zoom, ataque), Off-Shot (frequência), padrões CommonSense.
- Textos da Relíquia nos demais idiomas ainda são os antigos.

## v0.6
- ✅ Magic Way descartado a pedido.
- ✅ Pack **Forsaken Grimoires** (grimório, tomo, barra de feitiços) – testar no jogo.
- ✅ RnR v1.4 incluído – **conflito crítico em `entities/player.json` (5 packs)** e `entity/player.entity.json` (3 packs): fazer merge no script de montagem.
- ⬜ #11 correção do resfriamento JavaCombat · ⬜ #12 Cataclysmical sem textura · ⬜ #13 itens novos do Dungeons sem classe (parte simples, seguem pendentes).
- ⬜ Opcional: HUD real da barra de feitiços (ícones) e slots reais no Tomo, via JSON UI (como o OTG Backpack).
- ⬜ RnR: verificar se a seleção de raça no 1º acesso conflita com o RPG Addon.

## v0.7
- ✅ Hotbar real trocada por cartas de feitiço (estoque em entidade `fgr:stash`) – testar no jogo.
- ✅ Tela personalizada do Tomo (ramo `fgr_tome` no `server_form.json` do RPG) – testar no jogo; ajustar offsets se necessário (constantes em `build_tome_ui.py`).
- ⬜ Seletor de pergaminhos ainda usa a lista padrão (pode virar grade com paginação).
- ⬜ Merge de `server_form` com outros addons que o usem (hoje só o RPG).

## v0.8
- #11 JavaCombat tag: feito. #12 Cataclysmical sem textura: falso positivo. #13 Dungeons: varas (reeling_rod) incluídas.
- Merge de `minecraft:player` (BP+RP) feito no script; colisão `variant` OTG x RnR resolvida com `skin_id`.
- Pendente: teste em jogo de tudo; UIs conflitantes (`chest_screen`, `hud_screen`); overrides do CommonSense em outros mobs.

## v0.9
- ✅ #20/#21 merges de UI (hud, chat, inventory, chest, _ui_defs). ✅ #22 loot, trocas, entidades vanilla, sons/materiais/blocos/catálogo/tick. ✅ #23 causa provável do End invisível (materiais) corrigida. ✅ #25 tags dos biomas do Forsaken. ✅ #27 forja: tags nos itens de outros addons.
- ⬜ #15 escada de tiers (precisa da sua aprovação). ⬜ #24 precisa do A&S real. ⬜ #28 inventário feito, aguarda aprovação do conjunto canônico. ⬜ #16/#26 livros: precisam de decisão de conteúdo. ⬜ `slab.geo.json`.
- Detalhes em `Levantamentos.md`.

## v0.10
- ✅ #15 escada de tiers (script). ✅ #26 livro de progresso RPG. ✅ #16 livro do Viajante. ✅ #28 consolidação. ✅ #29 danos + alabarda. ✅ slab. ✅ A&S real nos merges. ✅ forja do vibranium.
- ⛔ #24 animações A&S em mobs do Caves: não aplicado (ver Levantamentos).
- ⬜ Tudo precisa de teste no jogo. ⬜ Confirmar End visível, UIs, escada de tiers (mensagem ao quebrar), abertura dos livros.

## Rodada 0.10 (pedido de 03/10)
| # | Pedido | Estado | Observação |
|---|---|---|---|
| 33 | Tomo → Atril Arcano (bloco), Grimório com textura, 1 pergaminho por espaço | 🟡 | feito; a confirmar no jogo (textura dependia de dependência RP→BP removida) |
| 34 | Sem itens iniciais (Eternal, OTG, Realistic Biomes); Luneta dada ao entrar e funcionando | 🟡 | feito; zoom a confirmar |
| 35 | CommonSense: mira sempre oculta | ✅ | opacidade 0 em todas as opções |
| 36 | RPG Guide, vida extra, cajado-varinha, tela de raças | 🟡 | feito; a confirmar |
| 37 | Compatível com 26.53 | 🟡 | módulos/min_engine dos packs próprios atualizados; os packs de terceiros não foram alterados quanto a isso |

## Rodada 0.10.4
| # | Pedido | Estado | Observação |
|---|---|---|---|
| 38 | Packs novos realmente substituírem os antigos | ✅ | versão carimbada em todos os manifests; apagar os antigos antes de importar |
| 39 | Lupa com o modelo 3D do A&S | 🟡 | anexo gerado do seu A&S; a confirmar no jogo |
| 40 | Atril abrir / Grimório visível e sem empilhar | 🟡 | bancada com inventário real; a confirmar |
| 41 | Tela sem textura que trava | 🟡 | UI própria removida + válvula na tela de raças; a confirmar |
| 42 | Itens iniciais (Aquaculture, BoB) | ✅ | já estavam removidos no código (pack antigo no jogo); BoB: diário/papel removidos agora |
| 43 | Mira do CommonSense | ✅ | opacidade 0 no hud unificado e nos subpacks |
| 44 | Auditoria/otimização | ✅ | ver CHANGELOG 0.10.4 |
