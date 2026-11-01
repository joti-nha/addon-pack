"""Varinhas do Forsaken (as 4 comuns e as 4 Tecedoras): uso longo, para o feitiço sair uma vez por toque.

Antes o item tinha use_duration igual ao tempo de conjuração; segurando o botão, o uso terminava, o feitiço saía
e o uso recomeçava sozinho. Agora o item tem um uso longo (USO_LONGO s), que não termina enquanto o botão estiver
apertado; o cajados.js conjura pelo próprio timer depois de CAST_TICKS e só uma vez por toque.

O anexo das varinhas é o original do Forsaken, com as animações dele (pedido do João, 2026-10-31: itens com
animação própria ficam como no addon): a varinha gira enquanto o botão está apertado e para ao soltar.
Rodar de novo não muda nada.
"""
import json, os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BP = os.path.join(RAIZ, 'packs', 'BP_ForsakenOdyssey')
USO_LONGO = 3600


def gravar(caminho, obj):
    novo = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    if open(caminho, encoding='utf-8-sig').read() != novo:
        open(caminho, 'w', encoding='utf-8').write(novo)
        print('gravado', os.path.relpath(caminho, RAIZ))


for pasta in ('wands', 'spellweaver_wands'):
    for arq in sorted(os.listdir(os.path.join(BP, 'items', 'nms', pasta))):
        f = os.path.join(BP, 'items', 'nms', pasta, arq)
        item = json.load(open(f, encoding='utf-8-sig'))
        item['minecraft:item']['components']['minecraft:use_modifiers']['use_duration'] = USO_LONGO
        gravar(f, item)
