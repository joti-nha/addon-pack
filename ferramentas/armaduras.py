#!/usr/bin/env python3
"""Bonus de conjunto do Dungeons e espacos de gema do Eternal Caves nas armaduras dos outros addons.

Uso: python ferramentas/armaduras.py

- Bonus do Dungeons: cada conjunto de outro addon recebe a etiqueta de um conjunto do Dungeons
  (ex.: dungeons:heros_armour). Os scripts do Dungeons conferem so a etiqueta nas quatro pecas, entao
  vestir o conjunto completo ativa o bonus.
- Gemas do Eternal Caves: o Ferreiro Anao da espacos de gema conforme a etiqueta de nivel do item
  (minecraft:<nivel>_tier: ferro 2, ouro 3, diamante 4, netherite 5). Pecas sem nivel reconhecido ganham
  um, escolhido pela durabilidade.
- Grava BP_UnifiedCore/scripts/armaduras_dados.js, que o script armaduras.js usa para escrever o texto
  do bonus e dos espacos de gema na descricao (lore) de cada peca, como o Eternal Caves faz nas dele.
O Eternal Caves fica de fora (as armaduras dele ja tem efeitos e gemas) e o Dungeons tambem.
"""
import json, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
DADOS = os.path.join(PACKS, 'BP_UnifiedCore', 'scripts', 'armaduras_dados.js')

# conjunto do addon -> conjunto do Dungeons (etiqueta sem "dungeons:" e "_armour")
CONJUNTOS = {
    # DarkAge
    'dk:sentinel_soldier': 'champions', 'dk:elemental_soldier': 'ember', 'dk:oath_armor': 'heros',
    'dk:unbound': 'titans_shroud',
    # Forsaken Odyssey
    'ntk:tin': 'wolf', 'ntk:zinc': 'mercenary', 'ntk:bronze': 'guard', 'ntk:brass': 'emerald',
    'ntk:olivine': 'turtle',
    # Mowzie's Mobs (contas, manto, cinto e sandalias do geomante)
    'hf_mzs:geomancer': 'rugged_climbing',
    # Aquaculture
    'tm_aqc:neptunium': 'glow_squid', 'tm_aqc:scale': 'squid',
    # Better on Bedrock
    'better_on_bedrock:amethyst': 'evocation', 'better_on_bedrock:corstinite': 'full_metal',
    'better_on_bedrock:stardust': 'souldancer', 'better_on_bedrock:shulker': 'sturdy_shulker',
    # Cataclysmical
    'mnra_cata:infernum': 'ghost_kindler', 'mnra_cata:stellar': 'phantom', 'mnra_cata:terrabloom': 'living_vines',
    'mnra_cata:exodius': 'wither',
    # Eternal End
    'panascais_end:enderite': 'ender', 'panascais_end:shulker': 'shulker', 'panascais_end:ametrine': 'troubadour',
}
# texto do bonus no Dungeons quando o nome da chave difere do da etiqueta
DESCRICAO = {'entertainers': 'entertainer'}
GEOMANTE = {'hf_mzs:geomancer_beads', 'hf_mzs:geomancer_robe', 'hf_mzs:geomancer_belt',
            'hf_mzs:geomancer_belt_boost', 'hf_mzs:geomancer_sandals'}

# niveis que o Eternal Caves reconhece (main.js do EC) e quantos espacos de gema cada um da
ESPACOS = {'wood': 0, 'wooden': 0, 'stone': 1, 'copper': 2, 'chainmail': 2, 'iron': 2, 'gold': 3, 'golden': 3,
           'quartz': 3, 'diamond': 4, 'netherite': 5}
NIVEIS_EC = set(ESPACOS) | {'salt', 'bone', 'chitin', 'mummy', 'ametrine', 'rose_quartz', 'crystal_opal', 'emerald',
                            'sphalerite', 'ruby', 'sapphire', 'onyx', 'titanium', 'cryorite', 'verdite', 'enderite',
                            'nocturite', 'pyronite', 'aetherium', 'corruptium'}
PESO = {'head': 11 / 16, 'chest': 1, 'legs': 15 / 16, 'feet': 13 / 16}  # durabilidade relativa por peca no vanilla
VANILLA = {'leather': None, 'chainmail': 2, 'copper': 2, 'iron': 2, 'golden': 3, 'diamond': 4, 'netherite': 5}
PECAS = ('helmet', 'chestplate', 'leggings', 'boots')


def nivel_por_durabilidade(dur, slot):
    d = dur / PESO[slot]
    return 'stone' if d < 150 else 'iron' if d < 400 else 'diamond' if d < 560 else 'netherite'


def conjunto(ident):
    if ident in GEOMANTE: return 'hf_mzs:geomancer'
    return re.sub(r'_(helmet|chestplate|leggings|boots)$', '', ident)


def espacos(tags):
    """Mesma regra do Eternal Caves: vale o nivel mais alto entre as etiquetas (aqui so os do vanilla)."""
    n = [ESPACOS[m.group(2)] for t in tags for m in [re.match(r'(minecraft|panascais_common):(\w+)_tier$', t)]
         if m and m.group(2) in ESPACOS]
    return max(n) if n else None


def pecas():
    for pack in sorted(os.listdir(PACKS)):
        if not pack.startswith('BP_') or pack in ('BP_EternalCaves', 'BP_AlylicasDungeons'): continue
        for raiz, _, arqs in os.walk(os.path.join(PACKS, pack, 'items')):
            for a in arqs:
                cam = os.path.join(raiz, a)
                try: j = json.load(open(cam, encoding='utf-8-sig'))
                except (ValueError, UnicodeDecodeError): continue
                item = j.get('minecraft:item', {}); c = item.get('components', {})
                w = c.get('minecraft:wearable', {}); slot = w.get('slot', '').split('.')[-1]
                if slot not in PESO or 'minecraft:is_armor' not in c.get('minecraft:tags', {}).get('tags', []): continue
                dur = c.get('minecraft:durability', {}).get('max_durability')
                if not dur: continue  # mascaras e enfeites sem durabilidade
                yield cam, j, item['description']['identifier'], c, slot, dur


def main():
    dados, mudados = {}, 0
    # o nivel vale para o conjunto inteiro: media da durabilidade relativa das pecas
    soma = {}
    for _, _, ident, _, slot, dur in pecas():
        s, n = soma.get(conjunto(ident), (0, 0)); soma[conjunto(ident)] = (s + dur / PESO[slot], n + 1)
    for cam, j, ident, c, slot, dur in pecas():
        tags = c['minecraft:tags']['tags']; antes = list(tags)
        cj = CONJUNTOS.get(conjunto(ident))
        if cj and f'dungeons:{cj}_armour' not in tags: tags.append(f'dungeons:{cj}_armour')
        reconhecido = any(m and m.group(2) in NIVEIS_EC for t in tags
                          for m in [re.match(r'(minecraft|panascais_common):(\w+)_tier$', t)])
        if not reconhecido:
            s, n = soma[conjunto(ident)]
            tags.append(f'minecraft:{nivel_por_durabilidade(s / n, "chest")}_tier')
        if tags != antes:
            with open(cam, 'w', encoding='utf-8') as f: json.dump(j, f, ensure_ascii=False, separators=(',', ':'))
            mudados += 1
        n = espacos(tags)
        if n is None:  # nivel proprio do EE (enderite, ametrine): o EC conta como o vanilla anterior
            n = 5 if any('enderite' in t for t in tags) else 3
        dados[ident] = [DESCRICAO.get(cj, cj) if cj else '', n]
    for mat, n in VANILLA.items():
        if n: dados.update({f'minecraft:{mat}_{p}': ['', n] for p in PECAS})
    texto = ('// Gerado por ferramentas/armaduras.py. Nao edite a mao.\n'
             '// item: [bonus de conjunto do Dungeons (chave dungeons.desc.armour.*), espacos de gema do Eternal Caves]\n'
             'export const ARMADURAS = ' + json.dumps(dados, ensure_ascii=False, separators=(',', ':')) + ';\n')
    with open(DADOS, 'w', encoding='utf-8') as f: f.write(texto)
    print(f'{mudados} pecas alteradas, {len(dados)} pecas com descricao')


if __name__ == '__main__': main()
