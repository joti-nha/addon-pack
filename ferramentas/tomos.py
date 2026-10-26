#!/usr/bin/env python3
"""Tomos infinitos e receitas de cor do Grimorio (Forsaken Grimoires).

Uso: python ferramentas/tomos.py
Precisa do Pillow. Grava:
  - os itens dos tomos (BP_ForsakenGrimoire/items/tomes), os icones (RP_ForsakenGrimoire/textures/fgr/tomes),
    as entradas em item_texture.json e os nomes em pt_BR/en_US;
  - o grupo "Grimorios e Tomos" do criativo (BP_ForsakenGrimoire/item_catalog);
  - as receitas de cor: Grimorio de qualquer cor + corante = Grimorio daquela cor; Grimorio + vidro = invisivel.
    Usam a etiqueta fgr:grimoire, entao sao 17 receitas no total (nao uma por par de cores).
Os tomos sao o que a loja de magias do Simple RPG Buffs vende para o Mago (no lugar das magias dele): cada compra
da magia da vagas de tomo, e o tomo de nivel N pede N compras.
"""
import json, os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
BP = os.path.join(PACKS, 'BP_ForsakenGrimoire')
RP = os.path.join(PACKS, 'RP_ForsakenGrimoire')
FO = os.path.join(PACKS, 'RP_fo-rp-v1.19.4')

# Todo pergaminho magico do Forsaken (menos o Pergaminho Desconhecido, que e aleatorio) tem um Tomo Infinito.
# familia: (nome pt_BR, nome en_US, magia do RPG que libera, niveis). Nivel N pede N compras da magia no RPG.
FAMILIAS = {
    # fireball: fogo e forca
    'fire_blast': ('Rajada de Fogo', 'Fire Blast', 'fireball', 3),
    'flame_burst': ('Explosão de Chamas', 'Flame Burst', 'fireball', 3),
    'fire_protection': ('Proteção contra Fogo', 'Fire Protection', 'fireball', 3),
    'berserk': ('Fúria', 'Berserk', 'fireball', 3),
    'strength': ('Força', 'Strength', 'fireball', 3),
    # frost: controle, agua e veneno
    'slowness': ('Lentidão', 'Slowness', 'frost', 3),
    'lethargy': ('Letargia', 'Lethargy', 'frost', 3),
    'converging': ('Convergência', 'Converging', 'frost', 3),
    'poison_cloud': ('Nuvem Venenosa', 'Poison Cloud', 'frost', 3),
    'cleansing': ('Limpeza', 'Cleansing', 'frost', 3),
    'purification': ('Purificação', 'Purification', 'frost', 3),
    'rain': ('Chuva', 'Rain', 'frost', 0),
    'clear_sky': ('Céu Limpo', 'Clear Sky', 'frost', 0),
    'weaving_webs': ('Tecer Teias', 'Weaving Webs', 'frost', 0),
    # lightning: tempestade e terra
    'lightning_bolt': ('Raio', 'Lightning Bolt', 'lightning', 3),
    'earthquake': ('Terremoto', 'Earthquake', 'lightning', 3),
    'field_levitation': ('Levitação em Área', 'Field Levitation', 'lightning', 3),
    'thunderstorm': ('Tempestade', 'Thunderstorm', 'lightning', 0),
    # invisibility: movimento e suporte
    'invisibility': ('Invisibilidade', 'Invisibility', 'invisibility', 3),
    'displacement': ('Deslocamento', 'Displacement', 'invisibility', 3),
    'acceleration': ('Aceleração', 'Acceleration', 'invisibility', 3),
    'protection': ('Proteção', 'Protection', 'invisibility', 3),
    'regeneration': ('Regeneração', 'Regeneration', 'invisibility', 3),
    'resurgence': ('Ressurgimento', 'Resurgence', 'invisibility', 3),
    'flourishing': ('Florescimento', 'Flourishing', 'invisibility', 3),
    'hoarding': ('Acúmulo', 'Hoarding', 'invisibility', 3),
    'homeward_bound': ('Retorno ao Lar', 'Homeward Bound', 'invisibility', 0),
}
# invocacoes: (nome pt_BR, nome en_US, magia)
INVOCACOES = {
    'magma_cube': ('Cubo de Magma', 'Magma Cube', 'fireball'),
    'magma_golem': ('Golem de Magma', 'Magma Golem', 'fireball'),
    'sulfur_cube': ('Cubo de Enxofre', 'Sulfur Cube', 'fireball'),
    'wither_skeleton': ('Esqueleto Wither', 'Wither Skeleton', 'fireball'),
    'snow_golem': ('Golem de Neve', 'Snow Golem', 'frost'),
    'stray': ('Errante', 'Stray', 'frost'),
    'slime': ('Slime', 'Slime', 'frost'),
    'bogged': ('Pantanoso', 'Bogged', 'frost'),
    'iron_golem': ('Golem de Ferro', 'Iron Golem', 'lightning'),
    'cobblestone_golem': ('Golem de Pedregulho', 'Cobblestone Golem', 'lightning'),
    'mossy_cobblestone_golem': ('Golem de Pedregulho Musgoso', 'Mossy Cobblestone Golem', 'lightning'),
    'deepslate_golem': ('Golem de Ardósia', 'Deepslate Golem', 'lightning'),
    'cobbled_deepslate_golem': ('Golem de Pedregulho de Ardósia', 'Cobbled Deepslate Golem', 'lightning'),
    'skeleton': ('Esqueleto', 'Skeleton', 'invisibility'),
    'mossy_skeleton': ('Esqueleto Musgoso', 'Mossy Skeleton', 'invisibility'),
    'parched': ('Ressecado', 'Parched', 'invisibility'),
}
# tomos das versoes anteriores (um por familia) mantem o identificador sem o numero do nivel
ANTIGOS = {'fire_blast': 2, 'slowness': 2, 'lightning_bolt': 3, 'invisibility': 3, 'flame_burst': 2, 'fire_protection': 2,
           'lethargy': 2, 'converging': 2, 'earthquake': 3, 'displacement': 3, 'acceleration': 3}
ROMANO = {1: 'I', 2: 'II', 3: 'III'}


def montar_tomos():
    """nome do tomo -> (pergaminho, nome pt_BR, nome en_US, magia do RPG, nivel)."""
    out = {}
    for fam, (pt, en, magia, niveis) in FAMILIAS.items():
        if not niveis:
            out[fam] = (f'ntk:scroll_of_{fam}', pt, en, magia, 1)
            continue
        for n in range(1, niveis + 1):
            nome = fam if ANTIGOS.get(fam) == n else f'{fam}_{n}'
            out[nome] = (f'ntk:scroll_of_{fam}_{n}', f'{pt} {ROMANO[n]}', f'{en} {ROMANO[n]}', magia, n)
    for mob, (pt, en, magia) in INVOCACOES.items():
        out[f'summon_{mob}'] = (f'ntk:summoning_scroll_of_{mob}', f'Invocar {pt}', f'Summon {en}', magia, 1)
    return out


TOMOS = montar_tomos()
CORANTES = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan',
            'purple', 'blue', 'brown', 'green', 'red', 'black']
# grupo proprio no inventario do criativo (aba Equipamentos), com os Grimorios e os tomos
GRUPO = 'fgr:itemGroup.name.grimorios'
OURO = [(255, 221, 85, 255), (214, 158, 46, 255)]


def opcoes_rpg():
    """magia do RPG -> [{tome, name, lvl}] por nivel (o primeiro e o padrao). lvl = compras da magia que o tomo pede."""
    out = {}
    for n, (perg, pt, en, magia, nivel) in sorted(TOMOS.items(), key=lambda kv: kv[1][4]):
        out.setdefault(magia, []).append({'tome': f'fgr:infinite_tome_{n}', 'name': pt, 'lvl': nivel})
    return out


def gravar(caminho, obj):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def icone(pergaminho):
    """Icone do pergaminho com moldura dourada (canto e borda), para diferenciar do pergaminho comum."""
    base = Image.open(os.path.join(FO, TEXTURAS_FO['ntk_' + pergaminho.split(':')[1]]['textures'] + '.png')).convert('RGBA')
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


TEXTURAS_FO = json.load(open(os.path.join(FO, 'textures', 'item_texture.json'), encoding='utf-8'))['texture_data']


def main():
    tex = json.load(open(os.path.join(RP, 'textures', 'item_texture.json'), encoding='utf-8'))
    langs = {l: open(os.path.join(RP, 'texts', f'{l}.lang'), encoding='utf-8').read().rstrip('\n').split('\n') for l in ('pt_BR', 'en_US')}
    for nome, (perg, pt, en, _, _n) in TOMOS.items():
        ident = f'fgr:infinite_tome_{nome}'
        os.makedirs(os.path.join(RP, 'textures', 'fgr', 'tomes'), exist_ok=True)
        icone(perg).save(os.path.join(RP, 'textures', 'fgr', 'tomes', f'{nome}.png'))
        tex['texture_data'][f'fgr_tome_{nome}'] = {'textures': f'textures/fgr/tomes/{nome}'}
        gravar(os.path.join(BP, 'items', 'tomes', f'{nome}.json'), {'format_version': '1.21.90', 'minecraft:item': {
            'description': {'identifier': ident, 'menu_category': {'category': 'equipment', 'group': GRUPO}},
            'components': {'minecraft:icon': {'textures': {'default': f'fgr_tome_{nome}'}},
                           'minecraft:display_name': {'value': f'item.{ident}.name'},
                           'minecraft:max_stack_size': 1, 'minecraft:allow_off_hand': True, 'minecraft:glint': True, 'minecraft:rarity': 'epic',
                           'minecraft:tags': {'tags': ['fgr:tome']}}}})
        for l, texto in (('pt_BR', f'§6Tomo Infinito: {pt}'), ('en_US', f'§6Infinite Tome: {en}')):
            chave = f'item.{ident}.name='
            langs[l] = [x for x in langs[l] if not x.startswith(chave)] + [chave + texto]
    gravar(os.path.join(RP, 'textures', 'item_texture.json'), tex)
    for l, texto in (('pt_BR', 'Grimórios e Tomos'), ('en_US', 'Grimoires and Tomes')):
        langs[l] = [x for x in langs[l] if not x.startswith(GRUPO + '=')] + [f'{GRUPO}={texto}']
    grimorios = ['fgr:grimoire'] + [f'fgr:grimoire_{c}' for c in CORANTES if c != 'purple'] + ['fgr:grimoire_invisible']
    gravar(os.path.join(BP, 'item_catalog', 'crafting_item_catalog.json'), {'format_version': '1.21.60', 'minecraft:crafting_items_catalog': {
        'categories': [{'category_name': 'equipment', 'groups': [{'group_identifier': {'icon': 'fgr:grimoire', 'name': GRUPO},
                                                                  'items': grimorios + [f'fgr:infinite_tome_{n}' for n in TOMOS]}]}]}})
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
