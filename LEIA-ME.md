# Montagem do Addon Pack

## O que é
Um script (Python 3, sem instalar nada extra) que cria **um único `.mcaddon`** com os 42 packs do modpack (37 de terceiros + 5 próprios). Eu não distribuo os addons de terceiros: você coloca os **seus arquivos originais** numa pasta, o script lê esses arquivos, aplica as pequenas alterações do modpack e grava o resultado.

## Como usar
1. Crie uma pasta (ex.: `originais`) e coloque nela todos os arquivos que você me enviou (`.mcaddon` e `.mcpack`): Actions & Stuff 1.11.1, Bare Bones, Bare Bones & Stuff, Better on Bedrock, Cataclysmical, DarkAge, Eternal Caves, Eternal End, Forsaken Odyssey, JavaCombat (BP e RP), Mowzie's Mobs, OTG Backpack, Realistic Biomes, RPG Addon, Aquaculture, **Alylica's Dungeons 2.1.0**, Nature's Compass (BP e RP), **CommonSense 1.7.1 (Trinkets ON)** **Improvised Guns 3.0.5** e **RnR v1.4 The Accursed** (`rnr-v1.4-the-accursed.mcaddon`).
   Pode deixar versões antigas e arquivos a mais na pasta: o script usa só o que a receita pede e, se houver duas versões do mesmo pack, a mais nova.
2. Extraia este zip em outra pasta e rode:
   `python montar_addon_pack.py caminho/da/pasta/originais -o Addon_Pack_Completo.mcaddon`
3. Importe o `.mcaddon` gerado no Minecraft (cerca de 260 MiB; o script leva uns 20 segundos).

## O que o script faz, passo a passo
1. **Lê os seus arquivos**, inclusive pacotes dentro de pacotes, e identifica cada pack pelo UUID do manifest (não pelo nome do arquivo).
2. **Confere a lista** em `dados/receita.json` (37 packs). Se faltar algum, mostra o nome e para, sem gerar nada pela metade.
3. **Copia cada pack** para o arquivo de saída. Em 415 arquivos aplica a alteração do modpack, guardada **só como pequenos trechos (diferenças)**, nunca como arquivo inteiro de terceiros,, **só se o arquivo original for idêntico ao esperado** (conferido por CRC32). Se você tem outra versão do addon, a alteração não é aplicada e o script avisa.
4. **Acrescenta os 5 packs próprios** (`dados/packs`): Unified Core (BP e RP), Addon Pack Compat (só RP) e Forsaken Grimoires (BP e RP). O anexo 3D da Luneta é gerado na hora a partir do SEU Actions & Stuff (o arquivo dele não vem neste pacote).
5. **Carimba uma versão nova em todos os packs** (o 3º número da versão ganha o número da montagem). Sem isso o jogo recusa a importação como "pack duplicado" e continua usando o pack antigo.
6. Seus originais **não são alterados**.

Alterações em addons de terceiros: lista completa em `CHANGELOG.md`.

## Atualizando (IMPORTANTE)
Até a montagem 0.10.3 os packs saíam com a mesma versão dos originais. O Minecraft trata pack com mesmo UUID e mesma versão como duplicado: a importação é recusada e **o pack antigo continua valendo**. Para a troca acontecer de verdade:
1. No jogo: Configurações > Armazenamento > abra "Pacotes de comportamento" e "Pacotes de recursos" e **apague todos os packs do Addon Pack** (os dos addons e os próprios; o "Addon Pack Compat BP" não existe mais e precisa sair). Não apague mundos.
2. Feche o Minecraft por completo e abra de novo.
3. Importe o `.mcaddon` novo e espere as mensagens de importação terminarem.
4. No mundo: Editar > Pacotes de comportamento e Pacotes de recursos. Remova o que estiver marcado como ausente/desatualizado e ative de novo os packs (ordem em `Roteiro_Execucao.md`).
Daqui para frente cada montagem tem versão maior que a anterior; mesmo assim, apagar os antigos antes de importar é o caminho mais seguro.

## Avisos
- Ordem sugerida dos resource packs (topo = maior prioridade): BB&S > Bare Bones > Unified Core > A&S Compatibility RP > demais > Actions & Stuff.
- Uso pessoal e privado. O OTG Backpack não permite reenvio sem autorização do autor; ver `CREDITS.md`.
- Tudo está sem teste no jogo. Testei o script contra os seus arquivos: 76.500 arquivos, resultado idêntico ao meu pacote de trabalho.
- Eternal Caves traz aviso de direitos reservados no código: por isso o script nunca inclui o arquivo dele, só as diferenças aplicadas ao SEU arquivo, para uso pessoal.

## Sobre o Addon Pack Compat
É um pack próprio do modpack (UUIDs novos), separado do "A&S Compatibility" avulso. Os dois não devem ficar ativos juntos no mesmo mundo: eles trocam os mesmos itens. No mundo do modpack, desative/remova o A&S Compatibility avulso.


## Merges feitos pelo script (0.8)
Além das diferenças pontuais nos arquivos dos addons, o script **combina** arquivos que vários addons trazem no mesmo caminho (jogador, UI, tabelas de saque e trocas, materiais, sons...). Tudo é calculado a partir dos seus originais e conferido por CRC; nada de terceiros é distribuído. Detalhes: `CHANGELOG.md` e `Levantamentos.md`.


## Novidades 0.9
Escada de ferramentas por script (edite `niveis.js` no Unified Core se quiser mudar níveis), dois livros (Progresso RPG e Viajante), consolidação de armas duplicadas, danos recalculados, alabarda da gárgula com metade do dano. Detalhes em `Levantamentos.md`.
