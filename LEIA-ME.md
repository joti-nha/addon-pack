# Addon Pack

Modpack para Minecraft Bedrock que junta 37 addons de vários criadores e 5 packs próprios (Unified Core, Addon Pack Compat e Forsaken Grimoires) em um único `.mcaddon`. Créditos e licenças em [docs/CREDITS.md](docs/CREDITS.md).

**Repositório privado, para uso pessoal.** Ele contém os addons originais de terceiros. Não torne o repositório público nem compartilhe o pacote gerado.

## Estrutura

| Pasta | O que tem |
|---|---|
| `packs/` | Os 42 packs prontos: os originais com as alterações do modpack já aplicadas, mais os packs próprios. É aqui que se edita. |
| `ferramentas/empacotar.py` | Gera o `.mcaddon` a partir de `packs/`. |
| `ferramentas/otimizar.py` | Compacta JSON e PNG sem perder nada (ver abaixo). |
| `docs/` | CHANGELOG, créditos, roteiro de pedidos e levantamentos. |

O histórico do Git mostra o que o modpack muda em cada addon: o commit "Packs originais extraídos" tem os addons como vieram, e o commit seguinte aplica as alterações.

## Baixar o pacote pronto

A cada envio para a branch `main`, o GitHub monta o pacote sozinho. Vá em **Releases**, abra **Addon Pack (última montagem)** e baixe o `Addon_Pack_Completo.mcaddon`. Funciona pelo celular, com a conta do GitHub conectada.

## Montar no seu aparelho

Precisa só do Python 3, sem os arquivos originais:

```
python ferramentas/empacotar.py
```

O `Addon_Pack_Completo.mcaddon` aparece na raiz do repositório.

## Instalar

1. No Minecraft, em Configurações > Armazenamento, apague todos os packs do Addon Pack (de comportamento e de recursos). Não apague mundos.
2. Feche o Minecraft por completo.
3. Abra o `Addon_Pack_Completo.mcaddon` com o Minecraft e espere a importação dos 42 packs terminar.
4. Num mundo (de preferência novo), ative todos os packs. Se o jogo pedir, ligue as APIs beta em Experimentos.

Ordem dos packs de recursos (topo = maior prioridade): Bare Bones & Stuff, Bare Bones, Unified Core, Addon Pack Compat, Forsaken Grimoires, os demais, e Actions & Stuff por último. Nos de comportamento, deixe Unified Core e Forsaken Grimoires no topo.

Cada montagem sai com versão maior que a anterior (200 + número de commits), então o jogo aceita como atualização.

## Otimização

`python ferramentas/otimizar.py` faz três coisas, todas sem mudar o que o jogo lê:

- **JSON:** tira espaços, quebras de linha e comentários fora de textos. Cada arquivo é conferido depois: se o conteúdo lido não for idêntico ao original, ele fica como estava. `manifest.json` não é mexido.
- **PNG:** recompressão sem perda (oxipng). Os pixels, o tipo de cor e os metadados não mudam.
- **Lixo:** remove `desktop.ini`, `Thumbs.db` e `.DS_Store`.

Para rodar, instale antes o `pyoxipng` (`python -m pip install pyoxipng`).
