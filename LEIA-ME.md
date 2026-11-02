# Addon Pack

Modpack para Minecraft Bedrock que junta 34 addons de vários criadores e 5 packs próprios (Unified Core, Addon Pack Compat e Forsaken Grimoires) em um único `.mcaddon`. Créditos e licenças em [docs/CREDITS.md](docs/CREDITS.md).

**Repositório privado, para uso pessoal.** Ele contém os addons originais de terceiros. Não torne o repositório público nem compartilhe o pacote gerado.

## Estrutura

| Pasta | O que tem |
|---|---|
| `packs/` | Os 38 packs prontos: os originais com as alterações do modpack já aplicadas, mais os packs próprios. É aqui que se edita. |
| `ferramentas/empacotar.py` | Gera o `.mcaddon` a partir de `packs/` (comando), ou um por pack com `--por-pack`. |
| `Empacotador Addon Pack.bat` | Abre o empacotador com janela no Windows (precisa do Python instalado). |
| `ferramentas/empacotador_janela.py` | O código da janela do Windows. |
| `ferramentas/menu_celular.py` | O menu para o celular (Termux). |
| `ferramentas/otimizar.py` | Compacta JSON e PNG sem perder nada (ver abaixo). |
| `ferramentas/mesclar_jogador.py` | Monta o jogador único (A&S + RnR, RPG e OTG). Rode depois de atualizar um deles. |
| `ferramentas/mesclar_zumbi.py`, `mesclar_mobs.py` | Mantêm recursos e animações compatíveis do A&S nos mobs substituídos e em mobs custom de addon com rig compatível. O gerador conserva os modelos/renderizadores originais e só adapta animações de rig humanoide verificado. Rode de novo depois de atualizar os addons envolvidos. |
| `ferramentas/gerar_anexos.py`, `armas_pesadas.py`, `armaduras.py` | Geram os modelos na mão (varas, grimórios, armas pesadas) e as etiquetas e descrições das armaduras. Rode de novo depois de atualizar os addons envolvidos. |
| `ferramentas/armas_niveis.py` | Dá nível (`*_tier`) às armas e ferramentas de addons para terem espaço de gema no Eternal Caves. Rode de novo depois de atualizar um addon. |
| `ferramentas/tomos.py` | Gera os Tomos Infinitos (itens, ícones, nomes), as receitas de cor do Grimório e a lista que o script do Grimório usa. A loja do RPG tem a mesma lista em `SPELL_TOMES`. |
| `docs/` | CHANGELOG, créditos, roteiro de pedidos e levantamentos. |

O histórico do Git mostra o que o modpack muda em cada addon: o commit "Packs originais extraídos" tem os addons como vieram, e o commit seguinte aplica as alterações.

## Baixar o pacote pronto

A cada envio para a branch `main`, o GitHub monta o pacote sozinho. Vá em **Releases > Addon Pack (última montagem)** e baixe o `Addon_Pack_Completo.mcaddon`. Funciona pelo celular, com a conta do GitHub conectada.

## Montar você mesmo

Há três jeitos, e todos geram o mesmo arquivo. Primeiro baixe o repositório (no GitHub: **Code > Download ZIP**) e extraia.

**Windows, com janela:** instale o Python 3 uma vez (python.org ou Microsoft Store, marcando "Add python.exe to PATH"). Depois, na pasta extraída, dê dois cliques em `Empacotador Addon Pack.bat`, que fica na raiz ao lado de `packs/`. Ele abre a janela do empacotador. Se o Python faltar, o próprio `.bat` avisa e abre a página de download. Toque em **Montar .mcaddon**, acompanhe a barra e, no fim, use **Abrir no Minecraft**.

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

Para gerar um `.mcaddon` separado para cada pasta de `packs/`, use `python ferramentas/empacotar.py --por-pack`. Os arquivos são salvos em `Addon_Pack_Por_Pack/`; na janela, marque **Baixar pack por pack** e escolha a pasta de destino.

Cada montagem sai com versão maior que a anterior (o número é a quantidade de minutos desde 01/10/2026), então o jogo aceita como atualização, seja ela feita no GitHub ou no seu aparelho.

## Instalar

1. No Minecraft, em Configurações > Armazenamento, apague todos os packs do Addon Pack (de comportamento e de recursos). Não apague mundos.
2. Feche o Minecraft por completo.
3. Abra o `Addon_Pack_Completo.mcaddon` com o Minecraft e espere a importação dos 38 packs terminar.
4. Num mundo (de preferência novo), ative todos os packs. Se o jogo pedir, ligue as APIs beta em Experimentos.

Ordem dos packs de recursos (topo = maior prioridade): Addon Pack Unified Core, Addon Pack Compat, Addon Pack Forsaken Grimoires, os demais, e Actions & Stuff por último. Nos de comportamento, deixe Addon Pack Unified Core e Addon Pack Forsaken Grimoires no topo.

No jogo, cada pack aparece como "Nome original Versão (BP)" ou "(RP)", por exemplo "Simple RPG 4.1.3 (BP)". As pastas em `packs/` têm o nome do addon sem a versão (ex.: `BP_SimpleRPG`).


## Otimização

`python ferramentas/otimizar.py` faz três coisas, todas sem mudar o que o jogo lê:

- **JSON:** tira espaços, quebras de linha e comentários fora de textos. Cada arquivo é conferido depois: se o conteúdo lido não for idêntico ao original, ele fica como estava. `manifest.json` não é mexido.
- **PNG:** recompressão sem perda (oxipng). Os pixels, o tipo de cor e os metadados não mudam.
- **Lixo:** remove `desktop.ini`, `Thumbs.db` e `.DS_Store`.

Para rodar, instale antes o `pyoxipng` (`python -m pip install pyoxipng`).
