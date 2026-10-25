#!/usr/bin/env python3
"""Tomos infinitos e receitas de cor do Grimorio (Forsaken Grimoires).

Uso: python ferramentas/tomos.py
Precisa do Pillow. Grava:
  - os itens dos tomos (BP_ForsakenGrimoire/items/tomes), os icones (RP_ForsakenGrimoire/textures/fgr/tomes),
    as entradas em item_texture.json e os nomes em pt_BR/en_US;
  - as receitas de cor: Grimorio de qualquer cor + corante = Grimorio daquela cor; Grimorio + vidro = invisivel.
    Usam a etiqueta fgr:grimoire, entao sao 17 receitas no total (nao uma por par de cores).
Os tomos sao o que a loja de magias do Simple RPG Buffs vende para o Mago (no lugar das magias dele).
"""
import json, os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
BP = os.path.join(PACKS, 'BP_ForsakenGrimoire')
RP = os.path.join(PACKS, 'RP_ForsakenGrimoire')
FO = os.path.join(PACKS, 'RP_fo-rp-v1.19.4')

# tomo: (pergaminho do Forsaken que ele lanca sem gastar, nome pt_BR, nome en_US, magia do RPG que ele substitui)
TOMOS = {
    'fire_blast': ('ntk:scroll_of_fire_blast_2', 'Rajada de Fogo II', 'Fire Blast II', 'fireball'),
    'slowness': ('ntk:scroll_of_slowness_2', 'Lentidão II', 'Slowness II', 'frost'),
    'lightning_bolt': ('ntk:scroll_of_lightning_bolt_3', 'Raio III', 'Lightning Bolt III', 'lightning'),
    'invisibility': ('ntk:scroll_of_invisibility_3', 'Invisibilidade III', 'Invisibility III', 'invisibility'),
    # opcoes extras: ao comprar a magia, o Mago escolhe qual destes tomos (do mesmo nivel) quer levar
    'flame_burst': ('ntk:scroll_of_flame_burst_2', 'Explosão de Chamas II', 'Flame Burst II', 'fireball'),
    'fire_protection': ('ntk:scroll_of_fire_protection_2', 'Proteção contra Fogo II', 'Fire Protection II', 'fireball'),
    'lethargy': ('ntk:scroll_of_lethargy_2', 'Letargia II', 'Lethargy II', 'frost'),
    'converging': ('ntk:scroll_of_converging_2', 'Convergência II', 'Converging II', 'frost'),
    'thunderstorm': ('ntk:scroll_of_thunderstorm', 'Tempestade', 'Thunderstorm', 'lightning'),
    'earthquake': ('ntk:scroll_of_earthquake_3', 'Terremoto III', 'Earthquake III', 'lightning'),
    'displacement': ('ntk:scroll_of_displacement_3', 'Deslocamento III', 'Displacement III', 'invisibility'),
    'acceleration': ('ntk:scroll_of_acceleration_3', 'Aceleração III', 'Acceleration III', 'invisibility'),
}
# o nivel do pergaminho acompanha o preco da magia no RPG (100 e 125 almas: II; 300 e 1000: III)
CORANTES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan',
            'purple', 'blue', 'brown', 'green', 'red', 'black']
OURO = [(255, 221, 85, 255), (214, 158, 46, 255)]


def opcoes_rpg():
    """magia do RPG -> [{tome, name}] na ordem do TOMOS (o primeiro e o padrao)."""
    out = {}
    for n, (perg, pt, en, magia) in TOMOS.items():
        out.setdefault(magia, []).append({'tome': f'fgr:infinite_tome_{n}', 'name': pt})
    return out


def gravar(caminho, obj):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def icone(pergaminho):
    """Icone do pergaminho com moldura dourada (canto e borda), para diferenciar do pergaminho comum."""
    base = Image.open(os.path.join(FO, 'textures', 'items', 'nms', 'ntk_' + pergaminho.split(':')[1] + '.png')).convert('RGBA')
    base = base.resize((16, 16), Image.NEAREST) if base.size != (16, 16) else base
    out = Image.new('RGBA', (16, 16)); out.alpha_composite(base)
    px = base.load(); o = out.load()
    for y in range(16):
        for x in range(16):
            if px[x, y][3]: continue
            viz = [px[a, b][3] for a, b in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)) if 0 <= a < 16 and 0 <= b < 16]
            if any(viz): o[x, y] = OURO[(x + y) % 2]
    for x, y in ((13, 1), (14, 2), (13, 3), (12, 2), (13, 2)): o[x, y] = (255, 255, 200, 255)  # brilho
    return out


def main():
    tex = json.load(open(os.path.join(RP, 'textures', 'item_texture.json'), encoding='utf-8'))
    langs = {l: open(os.path.join(RP, 'texts', f'{l}.lang'), encoding='utf-8').read().rstrip('\n').split('\n') for l in ('pt_BR', 'en_US')}
    for nome, (perg, pt, en, _) in TOMOS.items():
        ident = f'fgr:infinite_tome_{nome}'
        os.makedirs(os.path.join(RP, 'textures', 'fgr', 'tomes'), exist_ok=True)
        icone(perg).save(os.path.join(RP, 'textures', 'fgr', 'tomes', f'{nome}.png'))
        tex['texture_data'][f'fgr_tome_{nome}'] = {'textures': f'textures/fgr/tomes/{nome}'}
        gravar(os.path.join(BP, 'items', 'tomes', f'{nome}.json'), {'format_version': '1.21.90', 'minecraft:item': {
            'description': {'identifier': ident, 'menu_category': {'category': 'equipment'}},
            'components': {'minecraft:icon': {'textures': {'default': f'fgr_tome_{nome}'}},
                           'minecraft:display_name': {'value': f'item.{ident}.name'},
                           'minecraft:max_stack_size': 1, 'minecraft:glint': True, 'minecraft:rarity': 'epic',
                           'minecraft:tags': {'tags': ['fgr:tome']}}}})
        for l, texto in (('pt_BR', f'§6Tomo Infinito: {pt}'), ('en_US', f'§6Infinite Tome: {en}')):
            chave = f'item.{ident}.name='
            langs[l] = [x for x in langs[l] if not x.startswith(chave)] + [chave + texto]
    gravar(os.path.join(RP, 'textures', 'item_texture.json'), tex)
    for l, linhas in langs.items():
        with open(os.path.join(RP, 'texts', f'{l}.lang'), 'w', encoding='utf-8') as f: f.write('\n'.join(linhas) + '\n')
    # receitas de cor: qualquer Grimorio (etiqueta) + corante; + vidro = invisivel
    for cor in CORANTES:
        res = 'fgr:grimoire' if cor == 'purple' else f'fgr:grimoire_{cor}'
        gravar(os.path.join(BP, 'recipes', 'cores', f'{cor}.json'), {'format_version': '1.21.60', 'minecraft:recipe_shapeless': {
            'description': {'identifier': f'fgr:tingir_{cor}'}, 'tags': ['crafting_table'],
            'ingredients': [{'tag': 'fgr:grimoire'}, {'item': f'minecraft:{cor}_dye'}], 'result': {'item': res}}})
    gravar(os.path.join(BP, 'recipes', 'cores', 'invisivel.json'), {'format_version': '1.21.60', 'minecraft:recipe_shapeless': {
        'description': {'identifier': 'fgr:grimorio_invisivel'}, 'tags': ['crafting_table'],
        'ingredients': [{'tag': 'fgr:grimoire'}, {'item': 'minecraft:glass'}], 'result': {'item': 'fgr:grimoire_invisible'}}})
    # mapa para o script do Grimorio
    with open(os.path.join(BP, 'scripts', 'tomos.js'), 'w', encoding='utf-8') as f:
        f.write('// Gerado por ferramentas/tomos.py. Nao edite a mao.\n'
                '// tomo infinito -> pergaminho do Forsaken que ele lanca sem gastar\n'
                'export const TOMES = ' + json.dumps({f'fgr:infinite_tome_{n}': v[0] for n, v in TOMOS.items()}) + ';\n'
                '// magia da loja do Simple RPG Buffs -> tomos que o Mago pode escolher ao comprar\n'
                'export const RPG_SPELL_TOMES = ' + json.dumps(opcoes_rpg(), ensure_ascii=False) + ';\n')
    # a mesma tabela vai para o script do RPG (entre os marcadores)
    rpg = os.path.join(PACKS, 'BP_RPG_Addon_v4_0_5_behavior_pack', 'scripts', 'main.js')
    s = open(rpg, encoding='utf-8').read()
    ini, fim = '// <tomos.py>\n', '// </tomos.py>\n'
    if ini in s and fim in s:
        a, b = s.index(ini) + len(ini), s.index(fim)
        s = s[:a] + 'var SPELL_TOME_OPTIONS = ' + json.dumps(opcoes_rpg(), ensure_ascii=False) + ';\n' + s[b:]
        with open(rpg, 'w', encoding='utf-8') as f: f.write(s)
    print(f'{len(TOMOS)} tomos, {len(CORANTES) + 1} receitas de cor')


if __name__ == '__main__': main()
