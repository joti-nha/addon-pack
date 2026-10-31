#!/usr/bin/env python3
"""Espacos de gema do Eternal Caves nas armas e ferramentas dos outros addons.

Uso: python ferramentas/armas_niveis.py [--simular]

O Ferreiro Anao do Eternal Caves da espacos de gema conforme a etiqueta de nivel do item
(minecraft:<nivel>_tier: ferro 2, ouro 3, diamante 4, netherite 5), igual nas armaduras (ver armaduras.py).
A maioria das armas e ferramentas de addons nao tem etiqueta de nivel e ficava sem espaco nenhum.
Este script da um nivel a cada arma/ferramenta sem nivel reconhecido, pela durabilidade (comparada com as do
jogo base) ou, sem durabilidade, pelo dano. O Eternal Caves fica de fora (as dele ja tem nivel).
A etiqueta tambem liga o Minerador de Veios do BoB nas picaretas de addons (ele confere a mesma etiqueta).
Rode de novo depois de atualizar um addon.
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from armaduras import NIVEIS_EC  # noqa: E402

TIPOS = ('sword', 'axe', 'pickaxe', 'shovel', 'hoe', 'trident', 'spear', 'mace')
ETIQUETAS = {f'{ns}:is_{t}' for ns in ('minecraft', 'oreville') for t in TIPOS}
FORA = ('BP_EternalCaves',)


def sem_comentarios(texto):
    # tira comentarios // fora de textos (alguns itens do Dungeons tem)
    saida, dentro, i = [], False, 0
    while i < len(texto):
        c = texto[i]
        if dentro:
            saida.append(c)
            if c == '\\': saida.append(texto[i + 1]); i += 1
            elif c == '"': dentro = False
        elif c == '"': dentro = True; saida.append(c)
        elif texto.startswith('//', i):
            while i < len(texto) and texto[i] != '\n': i += 1
            continue
        else: saida.append(c)
        i += 1
    return ''.join(saida)


def nivel_por_durabilidade(d):
    # jogo base: madeira 59, pedra 131, ferro 250, diamante 1561, netherite 2031
    return 'stone' if d < 200 else 'iron' if d < 1000 else 'diamond' if d < 1800 else 'netherite'


def nivel_por_dano(d):
    # dano de espada no jogo base (Bedrock): pedra 6, ferro 7, diamante 8, netherite 9
    return 'stone' if d <= 5 else 'iron' if d <= 7 else 'diamond' if d <= 8 else 'netherite'


def main():
    simular = '--simular' in sys.argv
    mudados, contagem = 0, {}
    for pack in sorted(os.listdir(PACKS)):
        if not pack.startswith('BP_') or pack in FORA: continue
        for raiz, _, arqs in os.walk(os.path.join(PACKS, pack, 'items')):
            for a in sorted(arqs):
                if not a.endswith('.json'): continue
                cam = os.path.join(raiz, a)
                try: j = json.loads(sem_comentarios(open(cam, encoding='utf-8-sig').read()))
                except (ValueError, UnicodeDecodeError): continue
                item = j.get('minecraft:item', {}); c = item.get('components', {})
                tags = c.get('minecraft:tags', {}).get('tags')
                if not tags or not ETIQUETAS.intersection(tags): continue
                if any(m and m.group(2) in NIVEIS_EC for t in tags
                       for m in [re.match(r'(minecraft|panascais_common):(\w+)_tier$', t)]):
                    continue
                dur = c.get('minecraft:durability', {}).get('max_durability')
                dano = c.get('minecraft:damage')
                if isinstance(dano, dict): dano = dano.get('value')
                if isinstance(dur, (int, float)): nivel = nivel_por_durabilidade(dur)
                elif isinstance(dano, (int, float)): nivel = nivel_por_dano(dano)
                else: nivel = 'iron'
                tags.append(f'minecraft:{nivel}_tier')
                contagem[nivel] = contagem.get(nivel, 0) + 1
                mudados += 1
                if not simular:
                    with open(cam, 'w', encoding='utf-8') as f:
                        json.dump(j, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{mudados} armas/ferramentas ganharam nivel: {contagem}' + (' (simulado)' if simular else ''))


if __name__ == '__main__': main()
