# Addon Pack

Modpack para Minecraft Bedrock que junta 37 addons de vários criadores e 5 packs próprios (Unified Core, Addon Pack Compat e Forsaken Grimoires) em um único `.mcaddon`. Créditos e licenças em [docs/CREDITS.md](docs/CREDITS.md).

**Repositório privado, para uso pessoal.** Ele contém os addons originais de terceiros. Não torne o repositório público nem compartilhe o pacote gerado.

## Estrutura

| Pasta | O que tem |
|---|---|
| `packs/` | Os 42 packs prontos: os originais com as alterações do modpack já aplicadas, mais os packs próprios. É aqui que se edita. |
| `ferramentas/empacotar.py` | Gera o `.mcaddon` a partir de `packs/` (comando). |
| `Empacotador Addon Pack.exe` | O empacotador com janela para Windows, pronto para usar. |
| `ferramentas/empacotador_janela.py` | O código da janela do Windows (vira o `.exe`). Se mudar, troque o `.exe` da raiz pelo da Release nova. |
| `ferramentas/menu_celular.py` | O menu para o celular (Termux). |
| `ferramentas/otimizar.py` | Compacta JSON e PNG sem perder nada (ver abaixo). |
| `ferramentas/mesclar_jogador.py` | Monta o jogador único (A&S + RnR, RPG e OTG). Rode depois de atualizar um deles. |
| `ferramentas/gerar_anexos.py`, `armas_pesadas.py`, `armaduras.py` | Geram os modelos na mão (varas, grimórios, armas pesadas) e as etiquetas e descrições das armaduras. Rode de novo depois de atualizar os addons envolvidos. |
| `ferramentas/tomos.py` | Gera os Tomos Infinitos (itens, ícones, nomes), as receitas de cor do Grimório e a lista que o script do Grimório usa. A loja do RPG tem a mesma lista em `SPELL_TOMES`. |
| `docs/` | CHANGELOG, créditos, roteiro de pedidos e levantamentos. |

O histórico do Git mostra o que o modpack muda em cada addon: o commit "Packs originais extraídos" tem os addons como vieram, e o commit seguinte aplica as alterações.

## Baixar o pacote pronto

A cada envio para a branch `main`, o GitHub monta o pacote sozinho. Vá em **Releases > Addon Pack (última montagem)** e baixe o `Addon_Pack_Completo.mcaddon`. Funciona pelo celular, com a conta do GitHub conectada.

## Montar você mesmo

Há três jeitos, e todos geram o mesmo arquivo. Primeiro baixe o repositório (no GitHub: **Code > Download ZIP**) e extraia.

**Windows, com janela:** na pasta extraída, dê dois cliques em `Empacotador Addon Pack.exe` (ele já fica na raiz do repositório, ao lado de `packs/`). Toque em **Montar .mcaddon**, acompanhe a barra e, no fim, use **Abrir no Minecraft**. Se o Windows avisar que o programa é desconhecido, clique em "Mais informações" e "Executar assim mesmo": o .exe não tem assinatura digital paga.

**Celular (Termux), com menu:**
```
pkg install -y python
termux-setup-storage
cd ~/storage/downloads/addon-pack-main
python ferramentas/menu_celular.py
```
Escolha **3** para montar e abrir direto no Minecraft. O arquivo fica na pasta Download.

**Comando (qualquer aparelho com Python 3):**
```
python ferramentas/empacotar.py
```
Mostra uma barra de progresso colorida e termina com **Pronto**. O `Addon_Pack_Completo.mcaddon` só aparece quando termina; antes disso existe só um `.mcaddon.parcial`, que não deve ser aberto. Use `--simples` para uma linha por pack, sem cores.

Cada montagem sai com versão maior que a anterior (o número é a quantidade de minutos desde 01/10/2026), então o jogo aceita como atualização, seja ela feita no GitHub ou no seu aparelho.

## Instalar

1. No Minecraft, em Configurações > Armazenamento, apague todos os packs do Addon Pack (de comportamento e de recursos). Não apague mundos.
2. Feche o Minecraft por completo.
3. Abra o `Addon_Pack_Completo.mcaddon` com o Minecraft e espere a importação dos 42 packs terminar.
4. Num mundo (de preferência novo), ative todos os packs. Se o jogo pedir, ligue as APIs beta em Experimentos.

Ordem dos packs de recursos (topo = maior prioridade): Bare Bones & Stuff, Bare Bones, Unified Core, Addon Pack Compat, Forsaken Grimoires, os demais, e Actions & Stuff por último. Nos de comportamento, deixe Unified Core e Forsaken Grimoires no topo.


## Otimização

`python ferramentas/otimizar.py` faz três coisas, todas sem mudar o que o jogo lê:

- **JSON:** tira espaços, quebras de linha e comentários fora de textos. Cada arquivo é conferido depois: se o conteúdo lido não for idêntico ao original, ele fica como estava. `manifest.json` não é mexido.
- **PNG:** recompressão sem perda (oxipng). Os pixels, o tipo de cor e os metadados não mudam.
- **Lixo:** remove `desktop.ini`, `Thumbs.db` e `.DS_Store`.

Para rodar, instale antes o `pyoxipng` (`python -m pip install pyoxipng`).
