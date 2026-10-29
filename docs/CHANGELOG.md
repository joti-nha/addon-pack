# Changelog – Addon Pack

## 0.6 (esta versão)

Nada desta versão foi testado no jogo.

### Corrigido
- **Tela do Atril Arcano**: o OTG Backpack e o Better on Bedrock redefinem a tela de baú inteira e apagavam a vitrine do Grimório. Os dois agora reconhecem o título "§5Atril Arcano" e mostram a vitrine.
- **Itens do A&S fora da mão ou invisíveis**: 651 anexos de Dungeons, DarkAge, OTG, Forsaken, Eternal Caves/End, BoB, ImprovisedGuns, Aquaculture, Mowzie, Cataclysmical, CommonSense e Grimório ganharam a linha `parent_setup` do A&S (o A&S só mostra e posiciona o item com ela).
- **Lanças, cajados e martelos** (Forsaken, Mowzie, Dungeons, Cataclysmical): saíram as tags de lança/maça/vara que o modpack tinha posto em itens com anexo próprio; elas trocavam a animação do braço e desalinhavam o modelo.
- **Montantes**: voltaram aos anexos originais (o sistema `armas_pesadas` saiu). Ganharam só a tag de machado do A&S (`oreville:is_axe`), mantendo `minecraft:is_sword` para o JavaCombat.
- **Tomos Infinitos na mão secundária**: os itens dos tomos não tinham `minecraft:allow_off_hand`, então não entravam na mão secundária. Agora entram (o tomo sozinho com varinha ou cajado depende disso).
- **Steve com a skin do Bare Bones**: o Bare Bones e o Bare Bones & Stuff trocavam as skins padrão do jogador (Steve, Alex e as outras 7 do jogo). Essas texturas saíram dos dois packs, então quem usa uma skin padrão volta a aparecer com a do jogo.
- **Boneco de treino do Dungeons**: a textura do Bare Bones com o mesmo caminho cobria a dele. A do Dungeons foi renomeada.
- **"Java" na descrição das armas**: o JavaCombat só remove as linhas com "Java" e não reescreve a descrição a cada tick.
- **Scripts com API removida no Script API 2.x**: `runCommandAsync` (câmeras do CommonSense, OTG), `isValid()` (CommonSense, Cataclysmical) e o `applyKnockback` antigo (Better on Bedrock).
- **Jogador invisível com um addon sozinho** (Simple RPG, RnR ou OTG): os três packs traziam o jogador mesclado com o A&S, que cita modelos e controles do A&S e dos outros dois; sem eles, o jogador não era desenhado. Agora cada um volta ao próprio jogador original (o do RnR lê a raça em `skin_id`, como o BP), e o jogador mesclado fica só no Addon Pack Compat, que vem acima deles e só é usado com o A&S (`ferramentas/mesclar_jogador.py`).
- **Espaço do Grimório no Atril**: o espaço da esquerda mostrava e recebia o 1º espaço de feitiço (o painel dele não indicava a lista de itens da vitrine), então o Grimório ia parar no lugar errado e era devolvido. Agora o espaço fica num `collection_panel` e é mesmo o espaço do Grimório.
- **Lanças do Better on Bedrock**: o anexo de compatibilidade usava um modelo (`geometry.spear`) e texturas (`textures/entity/spears/*`) que não existem no BoB, então a lança não aparecia na mão. Agora usa o modelo e as texturas do próprio BoB, com a posição de terceira pessoa nas duas vistas.
- **Atril Arcano como bloco**: a vitrine invisível agora cobre o bloco inteiro, então tocar em qualquer parte do atril abre a tela, e bater nele (6 golpes seguidos) quebra o atril como um bloco, devolvendo o atril e o que estava dentro. A tela ganhou um botão **X** para fechar. Pôr um Tomo Infinito no espaço do Grimório, ou feitiços sem Grimório, mostra um aviso dizendo onde ele vai.
- **Cajados do Forsaken em primeira pessoa** (levitação, teleporte, arcano, chamas, maldição, pólvora, mar, fogo piglin e martelo piglin): em primeira pessoa usam a mesma posição da terceira pessoa, porque o A&S desenha o item no braço nas duas vistas.
- **Claymore de Obsidiana e Noite sem Estrelas**: saíram a recarga de ataque de 2 s e a animação própria de 2 s que se repetia; o golpe agora é o do machado do A&S e só o JavaCombat limita o ritmo. Em primeira pessoa o montante usa a posição da terceira pessoa. A linha "2.0s Attack Cooldown" saiu da descrição.
- **Lança do Crepúsculo Invertido e Lança Exodius** (Cataclysmical): o botão de função mantém o puxão, mas o giro da lança e a pose de carga saíram; agora toca só um golpe normal do braço (`animation.ap.lanca_golpe`).
- **Varinhas do Forsaken não lançavam feitiço** (as 4 varinhas e as 4 Varinhas Tecedoras): os itens, pergaminhos e projéteis estão iguais aos originais, então o problema vinha do disparo nativo (`minecraft:shooter`, que não usa o pergaminho no modo criativo). O disparo agora é feito pelo script dos cajados, mas a varinha voltou a ter as animações e o tempo de conjuração originais: segure o botão de usar (dourada 1,5 s, diamante 1,8 s, ametista 2,5 s, quartzo 3 s): a varinha gira durante a carga e só para quando o feitiço sai, gastando 1 pergaminho da mão secundária (a Varinha Tecedora também busca no inventário). Soltar antes cancela, e o feitiço nunca sai no toque. O projétil é o do próprio pergaminho, com o efeito e a área originais; se o impacto dele não rodar, o script dispara o evento de impacto (ou o do fim do tempo, após ~4 s). O Grimório e o Tomo Infinito continuam repondo o pergaminho.
- **Skin do Criador de Personagem e skin importada viravam Steve, e as capas sumiam**: é um comportamento conhecido do jogo (MCPE-74493). Um pack que troca o `player.entity.json` sem `"min_engine_version": "1.8.0"` desliga essas skins e as capas delas; as skins clássicas continuam. O jogador do Addon Pack Compat (vinha do A&S com 1.13.0), o do OTG e o do Simple RPG (sem versão) agora têm 1.8.0, como o do RnR (`ferramentas/mesclar_jogador.py`).
- **Sunflare Glaive** (Cataclysmical): o botão de função só conjura os pilares solares, sem a pose de carga nem outra animação.
- **Claymore, Broadsword, Great Axeblade e Heartstealer** (Dungeons): ficaram como a Claymore de Obsidiana, sem a animação própria e com a posição de terceira pessoa também em primeira pessoa (estavam enormes e tortas na tela).
- **Mochilas do OTG na mão** (as 24 variações): em primeira pessoa usam a posição da terceira pessoa, porque o A&S desenha o item no braço nas duas vistas e a posição própria de primeira pessoa deixava a mochila enorme no canto da tela.

- **Armas do Cataclysmical sem animação em primeira pessoa**: 41 armas (espadas, montantes, machados, maças, a foice, a picareta e as de ícone) agora usam o anexo da espada, machado, maça, enxada ou picareta de ferro do A&S, com as animações dele. As armas que eram blocos (Twilight Edge, Exodius, montantes etc.) apareciam enormes e tortas: o modelo foi posto de pé com o cabo na mão, no tamanho da 3ª pessoa do Cataclysmical, e as texturas animadas continuam animadas (`ferramentas/anexos_cataclysm.py`). A Star Sword e a Morningstar ganharam a tag do A&S que faltava. As lanças e a Sunflare Glaive ficaram como estavam.
- **Cajados com pergaminho** (Forsaken, Dungeons, DarkAge, BoB e Mowzie): lançavam o pergaminho como uma bola arremessada, na hora do toque. Agora conjuram como as varinhas: segure 1,5 s e o feitiço sai com o efeito e a área originais do pergaminho, numa velocidade menor.
- **Vibrânio** (Simple RPG) não servia para nada: o minério só caía com Toque Suave e 50% de chance, e o lingote só fazia uma espada. Agora o minério sempre cai (com picareta de nível nocturita), o lingote substitui a nocturita no equipamento do Eternal Caves e cai de 14 chefes de outros addons (Mowzie, BoB, Eternal Caves e Cataclysmical) (`ferramentas/materiais.py`).
- **Darkalita** (DarkAge) não caía de lugar nenhum: agora cai do Elemental Desatado, do Cavaleiro Elemental e (raramente) dos Unboned, e substitui a criorita no equipamento do Eternal Caves. O estanho e o alumínio do BoB trocam 1:1 pelo estanho e o zinco do Forsaken.
- **Minérios e blocos do Cataclysmical sem drop**: 56 tabelas (Cataclysmical e o vibrânio) só davam drop com picaretas do jogo base ou a Sunflare, então picaretas de outros addons quebravam sem ganhar nada. Agora qualquer picareta serve, e o nível continua cobrado pelo Unified Core (pedra abissal e bloco eclíptico pedem nível 8, pedra do luto nível 4) (`ferramentas/drops_picaretas.py`).
- **Arpões do Aquaculture** fora do lugar em primeira pessoa e depois sem textura na mão: agora usam o esqueleto e as animações do tridente do A&S com o modelo 3D original do arpão, posto de pé com o cabo na mão (a malha plana do ícone não aparecia). Disparado, a ponta some como no original.
- **Vara de pesca do Aquaculture**: em primeira pessoa a linha saía do meio da vara. A vara fica menor nessa vista (60%) para a linha sair da ponta.
- **Armas de ícone do Cataclysmical invisíveis na mão** (Plasm Dagger, varinhas e outras): a malha plana do A&S não mostrava a textura. Agora o desenho do ícone vira cubos de 1 pixel, como nos arpões (`ferramentas/anexos_cataclysm.py`).
- **Ícones trocados entre packs**: o Better on Bedrock e o Cataclysmical usavam as mesmas páginas de glifos (E3 e E4) do Dungeons e do Forsaken, e só valia a do pack mais alto. O BoB passou para E5/E6 e o Cataclysmical para E7/E9 (`ferramentas/glifos.py`).
- **Troncos finos descascados do BoB** (cerejeira, mangue e carvalho-pálido) apareciam roxos e pretos: as texturas nunca vieram no pack e agora existem (`ferramentas/troncos_finos.py`).
- **Recompensas do BoB em português**: o pt-BR original trazia o número fixo ("Cace 3 vacas") no lugar da quantidade real, e "%1" estava quebrado na mensagem de meta atingida.
- **Texturas do Dungeons em JPEG com nome .png** (brilho carregado, brilho 2 e ominoso) foram regravadas como PNG de verdade.
- **Varinhas giravam sem parar**: segurando o botão, o uso terminava, o feitiço saía e o uso recomeçava sozinho, então a varinha voltava à primeira animação. Agora as varinhas (comuns e Tecedoras) têm uso longo: o feitiço sai uma vez no tempo de conjuração e a varinha para no último estado, o mais brilhante, até você soltar o botão (`ferramentas/varinhas.py`).
### Alterado
- **Modpack inteiro em português (pt-BR)**: os 28 packs com textos têm `pt_BR.lang` com 9.088 das 9.255 chaves traduzidas (as 167 restantes são nomes próprios, links e textos de depuração). Menus, mensagens, títulos e descrições (lore) dos scripts também foram traduzidos (~540 textos no OTG, RnR, Dungeons, Cataclysmical, Mowzie, BoB, Eternal Caves, Simple RPG e Forsaken), além de nomes fixos (adagas rituais do RnR, vibrânio do RPG, espaços de bugiganga, poções e espelhos do Cataclysmical). As notas de versão dos próprios addons e as mensagens de administração ficaram em inglês. Para refazer depois de atualizar um addon: `python ferramentas/traduzir_ptbr.py` (o dicionário fica em `ferramentas/recursos/traducao_ptbr.json`).
- **Pergaminhos soltos voltam para o Grimório**: o pergaminho que o Grimório põe na mão secundária leva a linha "Pergaminho do Grimório". Se você tirar ele da mão secundária e ele ficar no inventário, ao segurar o Grimório na mão principal ele volta para dentro (no espaço do mesmo feitiço ou num espaço vazio, até 64 por espaço). Pergaminhos comuns não são puxados.
- **Simple RPG em português**: menus, descrições, mensagens, HUD e nomes de itens. Nomes que o script usa para reconhecer itens ("RPG Guide", arcos de classe, "Volley Focus") ficaram em inglês para não quebrar itens já existentes.
- **Trocar de classe**: botão em Configurações (ou `/scriptevent rpg:trocar_classe`). Devolve todas as almas e pontos gastos, mantém o nível e volta para a escolha de classe.
- **RPG Guide do Mago = Tomos Infinitos**: cada compra de magia com almas (até 3 por magia) dá +3 vagas e abre a lista dos tomos daquela magia para escolher; as vagas que sobrarem se escolhem em seguida. O tomo escolhido vai para o inventário, não pode ser descartado (se cair, volta ao dono) e pode ir para um Grimório. Tocar num tomo conhecido no livro abre a troca por outro tomo das magias compradas, quantas vezes quiser; uma vaga livre também se escolhe por ali. A tela **Escolher Tomos Infinitos** troca vários de uma vez com marcadores. O Grimório só deixa infinito o tomo conhecido (o RPG manda a lista por `scriptevent fgr:tomos_conhecidos`). Trocar de classe devolve as almas das compras e esquece os tomos.
- **Todo pergaminho do Forsaken tem Tomo Infinito**: 87 tomos (cada nível I, II e III, os de clima, Retorno ao Lar, Tecer Teias e as 16 invocações), divididos entre as 4 magias do Mago por tema. A 1ª compra da magia libera os tomos de nível I, a 2ª os de nível II e a 3ª os de nível III. Só o Pergaminho Desconhecido ficou de fora, porque o feitiço dele é aleatório. Os 12 tomos antigos continuam valendo.
- **Tomos Infinitos têm dono**: o primeiro jogador que pega fica dono; com outro jogador, o tomo volta para o dono. Um tomo na mão secundária com uma varinha funciona sozinho, sem Grimório. Na troca rápida o Grimório vai para um espaço livre da barra, porque a varinha só lê o pergaminho da mão secundária; dois agachamentos trocam de novo.
- **Cajados como varinhas** (Forsaken, Better on Bedrock, Mowzie, DarkAge, Dungeons; 21 itens com a tag `fgr:cajado`): com um pergaminho na mão secundária, o botão de usar lança o pergaminho e gasta 1, como a varinha. O botão de ataque lança o feitiço próprio do cajado, respeitando a recarga dele. O Cajado de Pólvora e os bastões de batalha do Dungeons não têm feitiço próprio e só lançam pergaminhos.
- **Grimórios e Tomos Infinitos na mão em pixel art**: voltaram a aparecer na mão como o desenho do ícone, igual ao addon original, sem o livro 3D do A&S. O Grimório Invisível continua sem nada na mão.
- **Grupo "Grimórios e Tomos" no criativo** (aba Equipamentos): os 17 Grimórios e os 87 Tomos Infinitos ficam juntos (`BP_ForsakenGrimoire/item_catalog`, gerado por `ferramentas/tomos.py`).
- **Estante de Tomos** (outras classes): o mesmo inventário, sem compra nem vagas.
- **Atril Arcano com o formato do atril comum**, madeira escura e tampo roxo com moldura dourada; vira para o jogador ao ser posto. A textura foi refeita em pixel art (base com pé dourado, coluna com capitel, tampo com moldura e um livro aberto em cima; `ferramentas/atril_textura.py`).
- **Mochila de couro para todo jogador**: na primeira entrada no mundo, cada jogador ganha a mochila básica do OTG Backpack (uma vez, como a Luneta da Vidência).
- **Zoom da Luneta da Vidência com borda**: ao dar zoom aparece a moldura da luneta comum (`textures/ui/spyglass_scope`, a do A&S/Bare Bones & Stuff), com o resto da tela na cor da borda. O script manda um título invisível (`!unified:luneta`) e o `hud_screen` unificado mostra a moldura enquanto ele está ativo.
- **Luneta da Vidência**: textura refeita sobre a distribuição pintada pelo João (corpo preto, lente branca), com os tons de sombra e brilho do A&S. A textura anterior seguia outro mapa de UV e não casava com o modelo da luneta do A&S.

### Removido
- **Realistic Biomes** saiu do pack (pedido do João, 2026-10-28): era quase só visual (447 partículas, 25 MB de sons) e repetia o que o Better on Bedrock e o Forsaken já fazem com biomas. Os blocos e itens dele somem dos mundos existentes, e as entradas dele saíram dos catálogos de criação dos outros packs.
- **Bare Bones** e **Bare Bones & Stuff** saíram do pack (pedido do João, 2026-10-28): os itens, blocos e mobs voltam às texturas do jogo. O ícone base dos grimórios ficou guardado em `ferramentas/recursos/livro_base.png`.
- **Actions & Stuff** enxugado (`ferramentas/enxugar_ans.py`): saíram os móveis e construções que apareciam ao dar um item a um suporte de armadura com a etiqueta "§§" (125 render controllers, 417 modelos e 123 texturas sem uso) e as 881 texturas de itens do subpack Full Experience, que voltam às do jogo. As texturas de blocos, entidades, céu e água do Full Experience ficam, assim como as animações e os modelos 3D dos itens na mão.
- **Actions & Stuff**: correção do João, ficou só o subpack Vanilla Experience (texturas do jogo, animações e efeitos do A&S). Saíram o Full Experience (texturas de blocos, itens e mundo) e o Custom; quem já usava outro subpack cai no Vanilla. As laterais dos troncos descascados que o `troncos_finos.py` usa foram guardadas em `ferramentas/recursos/troncos`.
- **Sem "editar pacote"** (`ferramentas/sem_opcoes.py`): os subpacks e as configurações saíram dos manifests. Cada pack ficou com o conteúdo do subpack padrão: A&S com o Vanilla Experience (sem as texturas de itens do Full Experience, que o João testou e preferiu tirar), Forsaken com a quantidade normal de estruturas, CommonSense com os trinkets ligados. As configurações do A&S, do Dungeons e do Cataclysmical ficaram fixas no padrão. No CommonSense, os subpacks traziam um `_global_variables` vazio que escondia o unificado; agora vale o unificado.
- **Forsaken Grimoires** mais leve: as vitrines do Atril são procuradas a cada 20 ticks e atualizadas a cada 4 (antes a cada tick); limpeza de cópias a cada 40 ticks, dono dos tomos a cada 100, atris antigos a cada 200; itens que caem no chão só são examinados quando são tomos.
- **Relíquia dos Videntes**: modelo 3D refeito (`ferramentas/reliquia.py`). O antigo era a luneta do A&S com UV em caixa e um cubo de 6,2 px, e as faces saíam desalinhadas; o novo usa UV por face, medidas inteiras e laterais simétricas, com os mesmos ossos (fica na mesma posição na mão).
- **Animações do A&S para itens de addons** (`ferramentas/anexos_2d.py`): 2063 itens e blocos de addons que não tinham anexo ganharam um, copiado de um item do jogo no A&S: blocos de cubo seguram como terra (539), arremessáveis como bola de neve (52), comidas e bebidas como maçã (344), espadas com o ícone na diagonal (3) e o resto como pena (1125). O ícone vira faixas de 1 pixel; ícones HD usam uma grade de 16x16. Ficam de fora armaduras, arcos, escudos e itens com animação própria, blocos escondidos e 1040 blocos com modelo próprio (não cubo). Custo: cerca de 16 MB de JSON a mais no Compat (8,5 MB de anexos e 7,9 MB de modelos).

### Desempenho (2026-10-28)
- **Cataclysmical**: 4 laços (impulso e ações de mobs, projéteis e trinkets) varriam todas as entidades das 3 dimensões a cada tick; agora consultam só os tipos configurados. A limpeza dos itens de interface caídos roda a cada 10 ticks.
- **Improvised Guns**: o dano em cadeia lia uma propriedade de todas as entidades do mundo a cada tick; agora acompanha só os alvos atingidos há pouco.
- **Mowzie's Mobs**: a busca pelo Sculptor e o `/stopsound` por jogador passam de cada tick para cada 20 ticks.
- Livro de Progresso RPG e Livro do Viajante (Unified Core).
- Itens de configuração, papel de missão e diário perdido que o Better on Bedrock dava nos primeiros passos.

### Correções do teste do João (2026-10-28)
- **Armaduras pretas e piscando** (todas as que usam o material `armor`; as do Mowzie, com `entity_alphatest`, estavam certas): o `materials/entity.material` unificado (igual em 9 packs) definia `armor` duas vezes, como `entity_alphatest_change_color` (do A&S) e como `entity_alphatest` (cópia antiga do jogo, do DarkAge). Ficou só `armor:entity_alphatest`, o mesmo das armaduras do Mowzie. As outras definições repetidas (`boat`, `chicken`, `rabbit`) ficaram só com a versão `entity_alphatest` do A&S.
- **Boneco de treino do Dungeons virava o ícone do item**, e o mesmo com outros 97 itens com entidade de mesmo nome (peixes do Aquaculture, flechas, totens do Dungeons): um anexo com o mesmo identificador de uma entidade toma o lugar dela no mundo. Os anexos gerados (`anexos_2d.py`, `anexos_cataclysm.py`) usam `<item>.ap` quando há entidade com esse nome; o campo `item` continua ligando ao item.
- **Excalibur e as outras 5 armas animadas do Cataclysmical** com a textura bugada: o modelo declarava a altura de um quadro só, e o `uv_anim` passava do quadro. Agora a altura é a da tira inteira e o deslocamento é quadro/total.
- **Mochilas do OTG na mão**: voltaram à animação original de primeira pessoa do OTG (de pé, no canto da tela).
- **Manopla do Better on Bedrock** (amuletos do Nether, 10 variações) fora da mão: usa a posição de terceira pessoa.
- **Relíquia dos Videntes**: a textura estava espelhada na horizontal (o fundo do retângulo trocado com a lente).
- **Moldura do zoom da Relíquia não aparecia**: o JavaCombat troca o título da tela a cada tick (barra de recarga) e apagava a marca que mostra a moldura. Durante o zoom o jogador ganha a etiqueta `unified:luneta` e o JavaCombat não mexe no título.
- **Recarga de ataque menor** (pedido do João): no Cataclysmical, adaga 8 → 6 ticks, espadas 12 → 9, espadas grandes 16 → 12, montantes 24/26/29 → 16/18/20 (Sun Striker 24 → 16). As 6 claymores do Dungeons (Claymore, Broadsword, Great Axeblade, Heartstealer, Claymore de Obsidiana, Noite sem Estrelas) caíam no valor da espada (12) e agora têm 10.

### Ajustes depois do teste (2026-10-29)
- **Pântano do DarkAge quase impossível** (pedido do João): o único "bioma" do DarkAge é o pântano com colunas, árvores mutantes e ruínas que ele cria dentro dos oceanos, sorteado por células de 256 blocos (1 em cada 3 células de oceano). Agora sai em 1 de cada 100 (`features/wetland/*_determinant.json`).
- **Moldura do zoom da Relíquia** não cobria a tela: a lente tinha altura `100%y` (a própria altura, ou seja zero) e as bordas, imagem de 1 pixel, mantinham a proporção 1:1 e viravam quadrados no meio da altura. A lente agora tem a altura da tela e as bordas esticam (`keep_ratio` falso).
- **Mochilas do OTG em primeira pessoa** ainda fora do lugar: com qualquer item na mão o A&S gira o braço para a pose de segurar dele, diferente da do jogo base para a qual o OTG acertou a mochila. `ferramentas/mochila_1p.py` calcula a pose que compensa o braço do A&S e grava as 4 animações de primeira pessoa (mochila, creeper, enderman, raposa-do-ártico) com os mesmos nomes no Compat; sem o Compat o OTG usa as dele.

### Common Sense 1.8.1 (2026-10-29)
- **Common Sense 1.7.1 → 1.8.1** (pedido do João: a versão nova funciona com o Actions & Stuff). Os UUIDs continuam os da 1.7.1, para a importação atualizar o pack nos mundos que já existem (a 1.8.1 trocou os UUIDs). Trinkets ligados, como antes.
- O que veio da 1.8.1: guia, receitas, recursos e configurações na tela nova do `@minecraft/server-ui` 2.2.0; Bola de Fogo (carga de fogo na mesa de trabalho); coelho domável (osso); chifre de cabra chamado "Pet Horn" chama os pets; assistência de mira na câmera de ombro; opção de saturação do Java; a Bola de Fogo já vem com anexo do A&S. O item de configurações (`bv:config`) saiu: as configurações abrem pelo guia, só para o OP (o primeiro jogador do mundo vira OP sozinho). As receitas de armadura de cobre e a poção de retorno saíram, e o Espelho Mágico não aparece mais em portais em ruínas.
- Reaplicado do modpack: tabelas de saque unidas com o Better on Bedrock (mina abandonada, bastião, pirâmide do deserto, masmorra, escambo dos piglins; o portal em ruínas do BoB volta ao original), padrões das configurações (cura da fogueira, não ferir pets do dono e mão secundária melhor ligados), jogador e `tick.json` unidos, primeira entrada sem guia e sem Editor de Visão, anexos com `parent_setup` do A&S, `inventory_screen` na base (a 1.8.1 só tem nos subpacks, que saem pelo `sem_opcoes.py`) e as correções de API dos scripts que a 1.8.1 não mudou.
- Menus novos traduzidos (guia, receitas, recursos, configurações, gerenciar OPs, câmera, Chifre dos Pets) e nomes novos no `pt_BR.lang`. A Bola de Fogo usa a chave de tradução no nome.
- Anexos 2D do A&S refeitos (`anexos_2d.py`): saíram os do item de configurações e do bloco de luz (agora invisível).
- Fica pendente: o coelho novo do Common Sense também é redefinido pelo Better on Bedrock (como o urso-polar), e só o pack mais alto vale.

## 0.5

Nada desta versão foi testado no jogo.

### Alterado
- **Tomos Infinitos no lugar das magias do Mago (RPG Addon).** A loja de magias do grimório do Mago vende agora um Tomo Infinito, pelo mesmo preço em almas e com o mesmo requisito na árvore de habilidades: Fireball → Rajada de Fogo II, Frost Wave → Lentidão II, Lightning Blast → Raio III, Arcane Dissolution → Invisibilidade III. Dá para comprar de novo se perder. Quem já tinha a magia comprada recebe o tomo uma vez (ao entrar no mundo ou abrir a loja) e a magia antiga sai do cajado.
- **Tomo no Grimório**: um tomo posto num dos 9 espaços deixa aquele feitiço infinito (o pergaminho lançado não é gasto). Gerado por `ferramentas/tomos.py`.
- **Sem usos ilimitados por nível**: a regra do Mago (feitiços de graça conforme o nível da classe) foi removida. Só os tomos dão uso infinito.
- **Atril Arcano virou vitrine**: tocar no livro em cima do bloco abre uma tela própria com 9 espaços em 3x3 e o espaço do Grimório ao lado. Ponha o Grimório e os feitiços dele aparecem nos 9 espaços; o que você mexer ali fica gravado; ao tirar o Grimório, tudo vai junto com ele. Se o Grimório estiver na mão secundária, ele entra sozinho no espaço do livro e volta para a mão secundária quando você o tira. O menu de formulários saiu.
- **Grimórios com cara de livro comum**: ícone e modelo na mão iguais aos do livro normal (ícone do Bare Bones, modelo do livro do A&S), com a capa na cor do Grimório e um desenho próprio de cada cor (olho no roxo, floco no branco, chama no laranja, flor no magenta, gota no azul-claro, sol no amarelo, folha no verde-limão, coração no rosa, engrenagem no cinza, lua no cinza-claro, cristal no ciano, estrela no azul, árvore no marrom, trevo no verde, espada no vermelho, caveira no preto). O ornamento com gema saiu. Gerado por `ferramentas/gerar_anexos.py`.
- **Vitrine do Atril com tema próprio**: o espaço do Grimório fica à esquerda, com moldura dourada, e a tela tem fundo roxo escuro com borda dourada e textos dourado e lilás. Os espaços continuam com o visual do jogo.
- **Cor e invisibilidade na mesa de trabalho**: Grimório + corante = Grimório daquela cor; Grimório + vidro = invisível; invisível + corante = visível de novo. Os feitiços passam para o Grimório novo. São 17 receitas (com a etiqueta `fgr:grimoire`), não uma por par de cores. A mesa de ferraria não foi usada porque o jogo só aceita nela materiais de acabamento de armadura, e os corantes não são.

## 0.4

Nada desta versão foi testado no jogo.

### Corrigido
- **Animações do Actions & Stuff no jogador.** RnR, RPG e OTG traziam um `player.entity.json` próprio, montado a partir do jogador do jogo base. Como ficam acima do A&S, ele substituía o jogador do A&S e nenhuma animação de corpo, braço ou item do A&S rodava. Agora os três packs levam o jogador do A&S com os acréscimos de cada addon (raças, lobisomem e morcego do RnR, mochila do OTG, espada nas costas do RPG). Gerado por `ferramentas/mesclar_jogador.py`.
- **"Bedrock" no lugar de "Dano de Ataque"** na descrição das armas: o JavaCombat trocava o nome do atributo em todos os idiomas. Voltou a ser "Dano de Ataque" (pt_BR) e "Attack Damage".
- **Varinhas do Forsaken** fora da mão e longe da câmera: os anexos 3D das 8 varinhas foram removidos e elas usam o desenho normal, posicionado pelo A&S (o brilho de carga se perde). Os avisos de "sem pergaminho na mão secundária" saíram do chat e vão para a barra de ação, sem aparecer quando o grimório está na mão secundária.
- **Varas do Aquaculture** invisíveis: agora usam a vara 3D do A&S, pintada conforme o ícone de cada vara (`ferramentas/gerar_anexos.py`).

### Alterado
- **Relíquia da Vidência**: o modelo da luneta do A&S ficou preto na parte de baixo (onde era marrom e cobre).
- **Grimório**: modelo de livro do A&S (esqueleto do livro do Minecraft), 16 cores e o grimório invisível (some na mão, aparece no inventário).
- **Atril Arcano**: virou um bloco com menu próprio (Script API). Coloca o grimório, mostra os 9 espaços de feitiço, enche com os pergaminhos do inventário, esvazia, tinge com corante e deixa invisível com 1 vidro (ou visível de novo). Os atris antigos (entidade) devolvem o que tinham e somem.
- **Mago (RPG Addon, classe 3)**: feitiços do grimório ilimitados. O pergaminho equipado não é gasto. Nível 1 libera pergaminhos de nível 1, nível 8 os de nível 2 e nível 15 os de nível 3. Com o grimório na mão secundária, segurar uma varinha equipa o feitiço escolhido sozinho.
- **Armas pesadas** (6 montantes do Dungeons e 14 espadas grandes do Cataclysmical): seguram e golpeiam com o esqueleto e as animações do Machado Wroughtnaut (Mowzie's Mobs), mais rápidas. A mão some durante o golpe em primeira pessoa; em terceira pessoa o jogador faz o golpe de duas mãos do machado. O próprio machado também esconde a mão no golpe. Gerado por `ferramentas/armas_pesadas.py`.
- **Ritual Dagger (RnR) e Star Sword (Cataclysmical)**: animações de espada do A&S.
- **Armaduras dos outros addons** (DarkAge, Forsaken, Mowzie's, Aquaculture, Better on Bedrock, Cataclysmical e Eternal End): cada conjunto ganhou o bônus de conjunto completo de um conjunto do Dungeons e todas aceitam gemas do Ferreiro Anão do Eternal Caves (as que não tinham nível ganharam um pela durabilidade). A descrição de cada peça mostra o bônus e os espaços de gema, no estilo do Eternal Caves; as armaduras do jogo base mostram os espaços de gema. Gerado por `ferramentas/armaduras.py`.

| Conjunto | Bônus do Dungeons |
|---|---|
| DarkAge: Sentinel Soldier / Elemental Soldier / Oath / Unbound | Champion's / Ember / Hero's / Titan's Shroud |
| Forsaken: Estanho / Zinco / Bronze / Latão / Olivina | Wolf / Mercenary / Guard / Emerald / Turtle |
| Mowzie's: Geomante | Rugged Climbing Gear |
| Aquaculture: Netúnio / Escamas | Glow Squid / Squid |
| Better on Bedrock: Ametista / Corstinite / Stardust / Shulker | Evocation / Full Metal / Souldancer / Sturdy Shulker |
| Cataclysmical: Infernum / Stellar / Terrabloom / Exodius | Ghost Kindler / Phantom / Living Vines / Wither |
| Eternal End: Enderite / Shulker / Ametrina | Ender / Shulker / Troubadour |

### Não feito
- **Actions & Stuff 1.12**: o pack enviado tem só materiais, sons, textos e texturas (estas cifradas), sem anexos, animações, entidades nem modelos. Continua o 1.11.

## 0.3

### Atualizado
- **Alylica's Dungeons 2.0.3 → 2.1.0** (BP + RP, mesmos UUIDs: substitui a versão antiga). 671 itens (eram 472); nenhum removido. A 2.1.0 já traz tags do A&S nos arcos/bestas (`oreville:is_bow`/`is_crossbow`), 11 maças e 2 foices.
- **A&S Compatibility 1.2 → 1.3**: a parte do Dungeons foi regenerada a partir da 2.1.0. As 52 cópias antigas (que desfariam as mudanças da 2.1.0) foram trocadas por: 29 itens que só ganham a tag de classe do A&S (o resto do item é o da 2.1.0), 125 attachables nativos copiados com a linha `parent_setup` do A&S e 83 attachables de sprite para os artefatos (itens de uso/conjuração). Corrigido o erro de digitação `overille:is_,mace` do claymore.
- **Lanças/glaives da 2.1.0** já usam `minecraft:is_spear`, que o A&S reconhece; ficam sem cópia no compat.

### Adicionado
- **Script de montagem** (`montar_addon_pack.py`): monta o pack completo a partir dos originais do usuário + 6 alterações de arquivo + 3 packs próprios.
- **Gesto de conjuração dos artefatos do Dungeons** (animação no Unified Core, 83 attachables). Não testado no jogo.
- **Cataclysmical: tempo de resfriamento do golpe por tamanho** (no JavaCombat, ver tabela abaixo). 43 armas, de adaga (8 ticks) a maça (33 ticks), seguindo 20 ÷ velocidade de ataque do Java.

### Arquivos de terceiros alterados (novos nesta versão)
| Addon | Arquivo | Alteração |
|---|---|---|
| JavaCombat | `scripts/constants/cooldownTicks.js` | +43 entradas `mnra_cata:*` em `FIXED_TICKS` (bloco marcado `[Addon Pack]`). Sem isso, armas do Cataclysmical com slot `elytra` ou tag `is_tool` caíam no padrão de 5 ticks |

Resfriamento (ticks): adaga 8 · espadas 12 · espadas grandes 16 · machados 22 · morning star 25 · lanças 19/21 · glaive 23 · alabarda/foice 26 · montantes de madeira/pedra/cobre 29, de ferro/platina 26, de ouro a verdant 24 · maças 33 · Calamity/Meowclysm 24 (provisório). Verificado rodando o código do JavaCombat fora do jogo: as 43 armas devolvem o valor da tabela com qualquer combinação de tags/slot. Efeito no jogo ainda não testado.

### Limites conhecidos
- Os artefatos do Dungeons (90 itens) usam o item na hora (sem tempo de carga); as animações de varinha do Forsaken foram feitas para o modelo 3D deles e dependem do tempo de carga, então ainda não foram aplicadas. Ver roteiro.
- Itens novos da 2.1.0 que não são espada/arco/maça (luvas, cajados, serras) ainda não têm classe própria no A&S.

## 0.2

### Adicionado
- **Unified Core RP 0.1.0**: pack próprio com os nomes de biomas (en_US e pt_BR) usados pela Bússola da Natureza. Não altera nenhum addon.
- **Nature's Compass 2.3** (BP + RP), de DustVeyn Studio.
- **A&S Compatibility 1.2** (já entregue antes): itens de outros addons marcados para as animações do Actions & Stuff.
- DarkAge Bizarre Remake (BP + RP) e JavaCombat (BP + RP) completos, com as dependências originais.

### Arquivos de terceiros alterados (exceções à regra "originais intocados")
Cada alteração é mínima e está marcada no código com `[Addon Pack]` quando possível.

| Addon | Arquivo | Alteração |
|---|---|---|
| RPG Addon | `scripts/main.js` | HUD do RPG desativado por padrão no 1º acesso (tag `hide_rpg_hud`; liga em Settings > HUD) |
| RPG Addon | `scripts/main.js` | removidas as 6 mensagens de boas-vindas/Discord do 1º acesso |
| Eternal Caves | `scripts/load-BQiM7yPx.js` | valor inicial de `spawnQuantity` de 1 para 0,5 (mobs das cavernas em 50%; vale para configurações novas) |
| Mowzie's Mobs | `functions/hf/mzs/start.mcfunction` | removida a entrega automática do guia (continua craftável com 1 graveto) |
| Realistic Biomes | `scripts/oreville_rb/tk.js` | removida a entrega automática do handbook (continua craftável: 3 papéis + 1 terra) |
| Nature's Compass | `scripts/DustVeyn_.Nature_Compass/main.js` | nomes legíveis de biomas (lista, busca sem acento, barra de ação e dica do item); ID técnico guardado em propriedade do item; correção de `return` dentro do laço que impedia a bússola de atualizar para os demais jogadores; checagem de dados da dica ajustada (`< 4`) |

### Notas
- As alterações de scripts não foram testadas no jogo.
- Atualizar um addon original apaga a alteração correspondente; reaplicar a partir desta lista.

## 0.3 (Unified Core 0.1.1 / Compat 1.0.0)

### Adicionado
- **Unified Core BP** (novo): item `Relíquia da Vidência` com função de lupa/luneta (segurar o botão de uso = zoom FOV 25, com sons da luneta); Unified Core RP: modelo 3D da lupa (dourado/creme/bronze), anexo e textos.
- **CommonSense 1.7.1 (Trinkets ON)** e **Improvised Guns 3.0.5** no pacote.
- **Addon Pack Compat** separado do A&S Compatibility avulso (UUIDs próprios).
- Montagem por **diferenças (hunks)**: o script não carrega mais arquivos inteiros de terceiros.

### Pré-configuração e itens iniciais (nada além da Relíquia aparece no 1º acesso)
| Addon | O que mudou | Onde obter depois |
|---|---|---|
| CommonSense | sem guia/visão iniciais; padrões: fogueira, não ferir pets (dono), tocha na mão secundária ligados; luz dinâmica, cavalos, auto-totem, lanterna na hotbar desligados | menu do próprio CommonSense |
| Eternal Caves | sem livro; Relíquia com `keepOnDeath`; ataque com a Relíquia escaneia (janela de 3 s), sem escaneamento parado; cores §p/§n | livro craftável |
| Eternal End | sem livro inicial | craft |
| Aquaculture | sem guia | craft |
| Better on Bedrock | sem WAILA/guia inicial (a Relíquia substitui) | config item/craft |
| Farmers Delight | sem popup/livro (gamerules mantidas) | craft |
| Cataclysmical | sem Detector de Terror | craft |

### Improvised Guns / Dungeons
- Off-Shot: superfície peso 12 (antes 23, sem subterrâneo); subterrâneo peso 40 (luz 0–7, bioma monstro).
- Dungeons `ancientHuntMobs.js`: para cada entrada de esqueleto, um Off-Shot com ~40% do peso (mín. 1), exceto esqueletos aquáticos.

### Notas
- Sem teste no jogo. A lupa 3D pode sair espelhada (mapeamento de texture mesh não verificado).
- Eternal Caves: o código tem aviso "todos os direitos reservados"; uso pessoal apenas.

## 0.4

### Adicionado
- **Forsaken Grimoires** (BP+RP, pack próprio, 0.1.0):
  - **Grimório** (`fgr:grimoire`): craft = Livro e Pena + 2 Pérolas Encantadas (Forsaken) + 2 Fragmentos de Ametista. Aparência de livro encantado, com brilho. Guarda até 9 pergaminhos do Forsaken (cada slot até 64), em ordem escolhida.
  - **Tomo Arcano** (`fgr:arcane_tome`): craft = Livro + 4 Lingotes de Titânio (Eternal Caves) + 4 Lingotes de Ametrino (Eternal End). Usar o item abre a interface: slot do Grimório (mão secundária ou inventário), 9 slots de feitiço (colocar/trocar, retirar, mover para cima/baixo).
  - **Barra de feitiços**: com o Grimório na mão secundária, agachar 2x rápido (0,6 s) abre a barra por 5 s na barra de ação. Girar a hotbar/tecla de número equipa o feitiço correspondente na mão secundária, onde as varinhas do Forsaken buscam a munição. A hotbar real nunca é alterada. Repetir o mesmo número guarda o feitiço. A varinha consome 1 pergaminho; o próximo é recarregado automaticamente; sem estoque, o Grimório volta à mão secundária.
- **RnR v1.4 The Accursed** (BP+RP), sem alterações. Mexe em `minecraft:player` (BP e RP), aldeões, golem de ferro e mercador.

### Notas
- Sem teste no jogo. A lógica de equipar/recarregar/guardar foi testada fora do jogo com a API simulada (estoque, recarga, troca, devolução, expiração).
- A interface do Tomo usa formulários, não slots de inventário reais (a API de scripts não cria contêineres).
- `entities/player.json` agora tem 5 packs de comportamento (CommonSense, JavaCombat, OTG, RPG, RnR) e 3 de recursos (OTG, RPG, RnR): só o último vale. Merge é pendência de maior prioridade.

## 0.5 (Forsaken Grimoires 0.2.0)

### Alterado
- **Barra de feitiços agora troca a hotbar de verdade**: ao agachar 2x rápido com o Grimório na mão secundária, os 9 slots da hotbar viram "cartas" de feitiço (itens `fgr:card_*`, bloqueados no slot, com o ícone do pergaminho e o estoque como quantidade). Girar a hotbar ou clicar numa carta equipa o feitiço; a hotbar volta ao normal. Slots sem feitiço mostram uma carta vazia. Não é preciso preencher os 9.
- Os itens reais da hotbar ficam guardados numa entidade invisível (`fgr:stash`, inventário de 9 slots, persistente, invulnerável) que acompanha o jogador, e voltam por `moveItem` (sem perda de dados do item). Recuperação automática ao reaparecer/entrar e a cada 5 s se algo ficar pendente. Item que o jogador colocar nesses slots durante a janela é devolvido ao inventário.
- **Tela personalizada do Tomo Arcano**: livro aberto (arte própria) com o slot do Grimório à esquerda, grade 3x3 de feitiços à direita (ícones dos pergaminhos, nome curto e estoque), texto de ajuda e botão Fechar. Implementada como ramo do `ui/server_form.json` do RPG Addon, ativado quando o título do formulário começa com `fgr_tome`; sem o ramo, o mesmo formulário aparece como lista comum. Alterações no arquivo do RPG: 2 trechos (ramo novo + condição do formulário padrão).

### Notas
- Sem teste no jogo (UI e entidade). A lógica de hotbar/estoque/recuperação foi testada com a API simulada, incluindo item estranho na hotbar, queda do script com a barra aberta e expiração.
- Se o jogador morrer com a barra aberta, a hotbar real volta ao reaparecer (as cartas não soltam itens de valor).

## 0.6

### Adicionado
- **Merge do jogador** (`unificar_player.py`, executado pelo script de montagem a partir dos SEUS originais): `entities/player.json` (CommonSense, JavaCombat, OTG, RPG, RnR) e `entity/player.entity.json` (OTG, RPG, RnR) deixam de se sobrescrever. O resultado é gravado em todos os packs envolvidos (a ordem da pilha deixa de importar).
  - BP: união de component_groups (56), events (62), propriedades, animações e scripts; componentes iguais mantidos, `environment_sensor` e `hurt_on_condition` unidos; conflitos restantes (valores numéricos equivalentes; `apply_knockback_rules` OTG x RPG) vencem pelo OTG.
  - RP: união de materiais, texturas, geometrias, animações e scripts; lista de render controllers ordenada (RnR primeiro, depois OTG/RPG); escala por raça do RnR.
- **Colisão OTG x RnR corrigida**: ambos usavam `minecraft:variant` (mochila do OTG; raça do RnR). A raça do RnR passa a usar `minecraft:skin_id` / `query.skin_id` (também em `rnr.werewolf.json`, 4 trechos).
- Script confere CRC dos originais e do resultado; se algo não bater, avisa e não aplica.

### Alterado
- JavaCombat: `getMaxCooldownTicks` escolhe a primeira tag presente na tabela (antes usava a primeira tag do item).
- Dungeons: classe de varas inclui `reeling_rod` e `rare_reeling_rod`.
- Cataclysmical sem textura (#12): falso positivo (armas em modelo de bloco); nada alterado.

### Notas
- Sem teste no jogo. Pendente verificar: seleção de raça do RnR junto do RPG, CommonSense em skeleton/drowned/goat/copper_golem, `chest_screen`/`hud_screen`.
- Necessário na pasta de originais: `rnr-v1.4-the-accursed.mcaddon`.

## 0.7

### Adicionado
- **Capas ilustradas** nos 6 packs próprios: Forsaken Grimoires (Grimório e Tomo Arcano), Unified Core (núcleo ligado aos addons) e Compat A&S (peças A e S encaixadas). Packs de terceiros mantêm a capa original.
- **Texturas mínimas** 16x16 para o **Grimório** (livro roxo com ornamento dourado) e o **Tomo Arcano** (livro azul com gema), em `textures/fgr/`. Substituem os ícones de livro do jogo base.

## 0.8

### Adicionado (feito pelo script de montagem, a partir dos seus originais)
- **Merge de UI** (`unificar_ui.py`): `_ui_defs` (união das listas), `hud_screen` (Better on Bedrock + CommonSense + JavaCombat + Dungeons, com as regras da action bar e da barra de chefe), `chat_screen` (esconde os dois tipos de toast), `inventory_screen` (CommonSense: mesa de lenha/flechas + Farmers Delight: panela), `_global_variables`; `chest_screen`: o do OTG vence.
- **Tabelas de saque e trocas** (`unificar_dados.py`): 13 tabelas de saque e 4 de trocas de aldeões (Better on Bedrock, CommonSense, Dungeons, Forsaken) unidas sem repetir itens.
- **Entidades vanilla unidas** (`unificar_player.py` reaproveitado): `evocation_illager` (Dungeons + BoB), `villager_v2` (RnR + BoB), `drowned` e `pillager` do cliente (Dungeons + BoB).
- **Dados** (`unificar_recursos.py`): `materials/entity.material` (10 packs), sons (`sound_definitions.json`, `sounds.json`), `blocks.json`, catálogo do criativo, `functions/tick.json`. Causa provável dos modelos invisíveis do Eternal End (materiais próprios sobrescritos): a confirmar.
- **Arquivos com o mesmo caminho e itens diferentes**: no Eternal End (livro, configurações, `player_utility`, bloco `scorched_grass`, armaduras de shulker; BP e RP) prefixo `end_`; no Mowzie (`nothing`, guia, receita do guia) prefixo `mzs_`.
- **Modelos do Better on Bedrock × Dungeons**: geometrias `baby_ghast`, `enchanter`, `frozen_zombie`, `illusioner`, `wraith`, `projectile` e animações de `illusioner`, `wraith`, `projectile` do BoB com prefixo `bob_` (arquivo, identificadores e referências nas entidades do BoB).
- **Forja do anão (Eternal Caves)**: 166 itens de outros addons (lanças, glaives, adagas, facas, armaduras...) receberam a tag que a forja exige (`minecraft:is_tool` / `minecraft:is_armor`). Fora: mochilas do OTG, pergaminhos, itens de depuração/teste.
- **Biomas do Forsaken**: tags `swamp, forest` (mossy_forest), `mesa, forest` (corrupted_forest), `jungle` (overgrown_jungle) para estruturas de outros addons.

### Notas
- A receita guarda CRC dos originais e do resultado de cada merge; se o seu arquivo for diferente, o script avisa e **não** aplica aquele merge.
- O pacote Actions & Stuff real nunca foi enviado: o RP dele (materiais/sons) não entra nos merges. Mande o `.mcpack` para incluir.
- Em aberto: `models/blocks/slab.geo.json` (4 addons), escada de tiers (#15), consolidação de texturas (#28), livros (#16/#26): ver `Levantamentos.md`.
- Sem teste no jogo.


## 0.9
- Escada de tiers por script (Unified Core, `niveis.js` editável); End = nível 12, Stardust quebra tudo; tags de tier nas picaretas do End e do Stardust.
- Consolidação: 5 lanças do BoB + `dungeons:diamond_sword` escondidas, receitas/loot redirecionados ao vanilla.
- Danos recalculados (ntk, enderite/stardust BoB, End); alabarda da gárgula `dk:halberd` 20→10.
- Livro de Progresso RPG e Livro do Viajante (Unified Core): craftáveis, sem entrega inicial e sem trava no inventário (só o RPG Guide fica fixo). Dependência nova: `@minecraft/server-ui` 2.0.0.
- `geometry.slab` do BoB renomeada (`bob_slab`); forja estendida ao vibranium do RPG.
- A&S real integrado aos merges (materiais, sons, partículas). #24 (animações em mobs do Caves) não aplicado: ver `Levantamentos.md`.
- Corrigido o nome gravado na receita para packs com nome localizado. Teste: montagem a partir dos originais = pacote de trabalho, arquivo a arquivo. Sem teste no jogo.
- Correção: as varas de pescar do Aquaculture usavam a pose de espada/graveto do A&S (tag `oreville:is_rod`); agora usam `oreville:is_fishing_rod`, a tag da animação de vara do A&S. Sem teste no jogo.
- Correção: picareta Sunflare (Cataclysmical) aparecia quebrada na mão: o compat usava a folha animada inteira (32x160, 5 quadros) como sprite. Agora usa o 1º quadro (`textures/as_compat/sunflare_pickaxe_f0.png`); a animação continua no ícone do inventário. Sem teste no jogo.
- Script de montagem: com várias cópias/versões do mesmo pack na pasta (o DarkAge repete a versão 1.0.0 no manifest), agora escolhe a cópia cujos arquivos batem com a receita (CRC) em vez de uma qualquer. Corrige o aviso "halberd.json diferente do esperado". Arquivos esperados do DarkAge: DarkAge_Bizarre_Remake_v0_7_76_BP_1_.mcpack e ..._RP_1_.mcpack.

## 0.10
### Corrigido / alterado
- **Atril Arcano** (`fgr:arcane_lectern`, bloco craftável: 4 lingotes de titânio do Caves + 4 de ametrina do End + livro): botão direito abre a interface do Grimório. Substitui o item "Tomo Arcano", que foi removido. A interface agora é um formulário comum (sem UI JSON própria): o patch em `ui/server_form.json` do RPG foi **desfeito** (o arquivo volta a ser o original), para não interferir nos menus do RPG.
- **Grimório**: um pergaminho por espaço (constante `MAX_STACK` em `BP_ForsakenGrimoire/scripts/main.js`); espaço esgotado é liberado sozinho; o evento `itemUseOn` (removido em versões novas da API e capaz de derrubar o script inteiro) deixou de ser usado.
- **Texturas do Grimório e do Atril**: os RPs próprios (Forsaken e Compat) listavam o BP como dependência, o que um resource pack não deve fazer e pode impedi-lo de carregar; dependência removida.
- **Itens iniciais removidos**: configurações do Eternal Caves e do Eternal End, guia da mochila (OTG) e item do Realistic Biomes. Fica só o RPG Guide.
- **Luneta da Vidência (Relic)**: passa a ser dada uma vez ao entrar (não cai na morte); o ajuste do item foi aplicado direto no item do Caves (e não por override em outro pack); zoom com plano B por comando (`camera fov_set`).
- **CommonSense**: mira/bolinha invisível em todas as opções de visual (opacidade 0).
- **RPG Addon**: menus (Guide, árvore de habilidades, loja) tentam de novo quando o jogo responde "UserBusy". Cajado do mago (`rpg:mage_staff`) também funciona como varinha do Forsaken (pergaminho na mão secundária).
- **Vida extra**: o limite de vida por raça (RnR) cortava o Health Boost do RPG; agora soma o bônus (+4 por nível).
- **Seleção de raça (RnR)**: tela obrigatória, reabre sozinha até escolher (também para mundos antigos).
- Módulos dos packs próprios: `@minecraft/server` 2.10.0 e `server-ui` 2.2.0, `min_engine_version` 1.26.50 (Unified Core e Forsaken).
- Sem teste no jogo.

## 0.10.1
- Montantes (Cataclysmical `*_greatsword`, `sun_striker_claymore`, `star_sword`; Dungeons `claymore`, `broadsword`, `great_axeblade`, `obsidian_claymore`, `starless_night`, `heartstealer`): removidas as equivalências/tags do Compat A&S. Fica só o resfriamento do JavaCombat.
- Esclarecido: o item de engrenagem (configurações) inicial era o do Eternal End; a remoção continua valendo para o do End (o do Caves também segue removido).

## 0.10.2
- Módulos dos packs próprios voltam às versões conservadoras (`@minecraft/server` 2.5.0, `server-ui` 2.0.0; `min_engine_version` anterior): as da 0.10 (2.10.0/2.2.0, 1.26.50) podiam impedir o pack de carregar.
- Menu personalizado do Atril Arcano de volta (UI JSON no `server_form.json` do RPG, aplicada por patch).
- Grimório: 1 grimório por espaço do inventário (item não empilha); as magias dentro voltam a acumular (até 64).
- Luneta da Vidência: removidos modelo 3D e attachable próprios; usa o sprite plano original do Caves.
- Porcos: o `pig.entity.json` do Better on Bedrock agora é a definição completa (textura, geometria, animações) + brilho de encantado, porque a versão original só trazia o brilho.

## 0.10.3
- **Farmer's Delight removido** do pacote (packs, merges de UI/sons/blocos/catálogo, equivalências A&S das facas e créditos). O script ignora o arquivo dele se estiver na sua pasta.
- **Lupa 3D refeita** com o mesmo método do A&S para itens planos (`texture_meshes` na mesma posição/rotação do `geometry.sprite`), em 3 camadas de espessura: mesmo alinhamento de qualquer item do A&S, sem cálculo manual de coordenadas.

## 0.10.4 (montagem 104)
### Causa raiz de "continua igual"
- **Versões dos packs**: todos saíam com o mesmo UUID e a mesma versão dos originais (e os próprios nunca mudaram de versão). O jogo recusa isso como duplicado e mantém o pack antigo, então correções anteriores provavelmente nunca chegaram ao jogo. O script agora carimba versão nova em todos os manifests (e nas dependências entre eles). Ver "Atualizando" no `LEIA-ME.md`.

### Corrigido
- **Forsaken Odyssey 1.19.4**: erro de sintaxe no original (`scripts/block_component/door.js`, `beforeOnPlayerPlace(event, params) => {`) que impede o carregamento de todos os scripts do addon (varinhas, pergaminhos, componentes). Corrigido por patch de 1 linha.
- **Menus em branco / tela que trava**: a UI própria do Atril (camada no `ui/server_form.json` do RPG) foi removida de vez; o arquivo do RPG volta a ser o original. Hipótese: a camada ficava visível por cima de todo formulário (raças, RPG Guide), sem textura. A tela de raças agora tem válvula de segurança (3 fechamentos seguidos = pausa de 1 min).
- **Atril Arcano**: agora é uma bancada com inventário real (tela de baú do jogo): toque no livro em cima do bloco; espaço do meio da linha de baixo = Grimório; linha de cima = os 9 feitiços. Tudo é gravado no Grimório a cada tick.
- **Grimório**: item reescrito no mesmo formato dos itens do Eternal Caves (ícone, nome, pilha 1, mão secundária).
- **Luneta da Vidência**: usa o anexo 3D da luneta do Actions & Stuff (mesmo modelo, animações e alinhamento), gerado na montagem a partir do seu A&S.
- **CommonSense**: a mira extra ficava no `hud_screen` unificado (o ajuste anterior era sobrescrito pelo merge) e os subpacks trocavam a tela unificada por uma reduzida. Agora a mira tem opacidade 0 no merge e os 5 subpacks recebem a mesma tela unificada.
- **Better on Bedrock**: diário perdido e papel de missão não são mais entregues (função `join`).
- **Compat (limpeza grande)**:
  - BP Compat removido: as tags do A&S passaram a ser aplicadas direto nos 189 itens originais (patch), em vez de redefinir o item em outro pack.
  - 23 definições antigas (Dungeons 2.0.3) que sobrescreviam armas do Dungeons 2.1.0 e 48 itens-fantasma de addons que não estão no pack foram removidos.
  - RP Compat: 385 anexos de itens inexistentes, 98 duplicados antigos e os anexos/animações de montantes removidos (ficam só os do próprio addon + JavaCombat).
  - Anexos "sprite" com textura diferente de 16x16 removidos (ficavam gigantes/desalinhados; um deles tinha textura de 1240x1269, pesado): cajado do mago, espadas de teste do RPG, verdant blade, picareta Sunflare, âncora, titanium rod.
  - Varas e arpões do Aquaculture: passam a usar o método de sprite do A&S (mesmo alinhamento dos demais itens), com troca de textura lançada/recolhida.
- **Geometrias com o mesmo nome em addons diferentes** (só uma valia): `geometry.anchor` (Cataclysmical x Dungeons), `geometry.geomancer` (BoB x Dungeons), `geometry.unknown` (BoB x chefe do RPG) e os `slab.geo.json` do Dungeons e do Mowzie (mesmo caminho do Cataclysmical) foram separados.
- **Arquivos de dados unidos**: `local_lighting`, `loading_messages`, `splashes` (antes só um addon valia).
- `ui/inventory_screen.json` do CommonSense volta ao original (o merge era só por causa do Farmer's Delight).

### Verificação feita aqui (não é teste no jogo)
- 857 scripts: sintaxe e imports entre arquivos conferidos em todos os packs.
- Montagem a partir dos originais = pacote de trabalho, arquivo a arquivo.
