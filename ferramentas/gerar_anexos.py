#!/usr/bin/env python3
"""Gera os icones dos Grimorios e o render controller com brilho dos anexos do Compat.

Uso: python ferramentas/gerar_anexos.py
Precisa do Pillow. Grava:
  - icones dos Grimorios (todas as cores e o invisivel); na mao eles e os Tomos Infinitos ficam em pixel art, sem modelo 3D
    (packs/RP_ForsakenGrimoire/textures/fgr; o invisivel tem um anexo vazio)
As varas e os arpoes do Aquaculture ficam com o anexo original do addon (pedidos do João, 2026-10-31): itens com
animacao propria ficam como no addon (ver ferramentas/animacao_propria.py).
"""
import colorsys, json, os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMPAT = os.path.join(RAIZ, 'packs', 'RP_AddonPack_Compat')
FGR = os.path.join(RAIZ, 'packs', 'RP_ForsakenGrimoire')


def gravar_json(caminho, obj):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def luz(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def controlador():
    """Render controller com brilho de encantamento, usado pelos anexos gerados do Compat (armas do Cataclysmical)."""
    gravar_json(os.path.join(COMPAT, 'render_controllers', 'ap_as_item.render_controllers.json'), {
        'format_version': '1.10.0', 'render_controllers': {'controller.render.ap.as_item': {
            'geometry': 'Geometry.default',
            'materials': [{'*': 'variable.is_enchanted ? Material.enchanted : Material.default'}],
            'textures': ['Texture.default', 'Texture.enchanted']}}})




# ------------------------------------------------------------------ Grimorios

# Cores dos corantes do jogo. O Grimorio comum (fgr:grimoire) e o roxo.
CORANTES = {
    'white': (249, 255, 254), 'orange': (249, 128, 29), 'magenta': (199, 78, 189), 'light_blue': (58, 179, 218),
    'yellow': (254, 216, 61), 'lime': (128, 199, 31), 'pink': (243, 139, 170), 'gray': (71, 79, 82),
    'light_gray': (157, 157, 151), 'cyan': (22, 156, 156), 'purple': (137, 50, 184), 'blue': (60, 68, 170),
    'brown': (131, 84, 50), 'green': (94, 124, 22), 'red': (176, 46, 38), 'black': (45, 45, 52),
}
GEO_VAZIA = 'geometry.fgr_vazio'


def ident(cor): return 'fgr:grimoire' if cor == 'purple' else f'fgr:grimoire_{cor}'


def tom(c, f): return tuple(max(0, min(255, int(v * f))) for v in c)


ICONE_REF = (101, 75, 23)  # marrom principal do icone do livro (copia do Bare Bones, removido do pack em 0.6)
ICONE_LIVRO = os.path.join(RAIZ, 'ferramentas', 'recursos', 'livro_base.png')


def tingir(im, cor, ref, capa):
    """Troca os pixels da capa (marrons) pela cor do corante, mantendo o sombreado; paginas ficam."""
    alvo, r = CORANTES[cor], luz(ref)
    out = im.copy()
    out.putdata([(*tom(alvo, luz(c) / r), c[3]) if c[3] and capa(c) else c for c in im.getdata()])
    return out


def capa_icone(c):  # paginas do icone sao cinza (sem saturacao)
    return colorsys.rgb_to_hls(*(v / 255 for v in c[:3]))[2] > 0.3


# Detalhe de cada Grimorio: desenho 5x5 na capa ('#' = cor 1, 'o' = cor 2), no icone e no livro da mao.
EMBLEMAS = {
    'white': ('floco', ['#.#.#', '.#o#.', '#ooo#', '.#o#.', '#.#.#'], (150, 210, 255), (255, 255, 255)),
    'orange': ('chama', ['..#..', '.##..', '.#o#.', '#ooo#', '.###.'], (255, 214, 64), (255, 250, 200)),
    'magenta': ('flor', ['.#.#.', '##o##', '.#.#.', '..o..', '..o..'], (255, 190, 240), (70, 150, 40)),
    'light_blue': ('gota', ['..#..', '.###.', '#o###', '#####', '.###.'], (30, 80, 200), (220, 245, 255)),
    'yellow': ('sol', ['#.#.#', '.ooo.', '#ooo#', '.ooo.', '#.#.#'], (200, 90, 20), (255, 150, 30)),
    'lime': ('folha', ['...##', '..#o#', '.#o#.', '#o#..', 'o....'], (40, 110, 20), (200, 255, 120)),
    'pink': ('coração', ['##.##', '#o###', '#####', '.###.', '..#..'], (200, 30, 60), (255, 200, 210)),
    'gray': ('engrenagem', ['.#.#.', '#####', '##o##', '#####', '.#.#.'], (190, 190, 200), (60, 60, 66)),
    'light_gray': ('lua', ['.##..', '##...', '#o...', '##...', '.##..'], (250, 250, 230), (255, 255, 255)),
    'cyan': ('cristal', ['..#..', '.#o#.', '#ooo#', '.#o#.', '..#..'], (200, 255, 250), (60, 220, 220)),
    'purple': ('olho', ['.....', '.###.', '##o##', '.###.', '.....'], (244, 196, 72), (40, 10, 50)),
    'blue': ('estrela', ['..#..', '..#..', '##o##', '.###.', '.#.#.'], (244, 196, 72), (255, 245, 200)),
    'brown': ('árvore', ['.###.', '##o##', '.###.', '..o..', '..o..'], (80, 150, 40), (60, 35, 15)),
    'green': ('trevo', ['##.##', '#o.o#', '..o..', '##o##', '##.##'], (140, 230, 80), (40, 90, 20)),
    'red': ('espada', ['....#', '...#.', 'o.#..', '.o...', 'o.o..'], (230, 230, 240), (244, 196, 72)),
    'black': ('caveira', ['.###.', '#####', '#o#o#', '#####', '.#.#.'], (235, 235, 225), (20, 20, 24)),
}


def emblema(im, cor, x0, y0):
    _, desenho, c1, c2 = EMBLEMAS[cor]
    out = im.copy()
    px = out.load()
    for y, linha in enumerate(desenho):
        for x, ch in enumerate(linha):
            if ch != '.': px[x0 + x, y0 + y] = (*(c1 if ch == '#' else c2), 255)
    return out


def icone_invisivel(original):
    """Icone do Grimorio invisivel: o mesmo desenho, transparente como vidro, com contorno claro."""
    out = original.copy()
    out.putdata([(min(255, c[0] + 60), min(255, c[1] + 70), min(255, c[2] + 90), 110) if c[3] else c for c in original.getdata()])
    px = out.load()
    for y in range(16):
        for x in range(16):
            if original.getpixel((x, y))[3] and any(not (0 <= x + dx < 16 and 0 <= y + dy < 16) or not original.getpixel((x + dx, y + dy))[3]
                                                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                px[x, y] = (220, 240, 255, 230)
    return out


def grimorios():
    # versoes anteriores davam aos Grimorios e aos Tomos Infinitos o livro 3D do A&S; o Joao preferiu o desenho plano
    import shutil
    for velho in ('attachables/tomes', 'textures/fgr/livro'):
        shutil.rmtree(os.path.join(FGR, velho), ignore_errors=True)
    for velho in ('models/entity/fgr_grimorio_livro.geo.json', 'render_controllers/fgr_livro.render_controllers.json'):
        if os.path.exists(os.path.join(FGR, velho)): os.remove(os.path.join(FGR, velho))
    gravar_json(os.path.join(FGR, 'models', 'entity', 'fgr_vazio.geo.json'), {'format_version': '1.16.0', 'minecraft:geometry': [
        {'description': {'identifier': GEO_VAZIA, 'texture_width': 16, 'texture_height': 16},
         'bones': [{'name': 'root', 'pivot': [0, 0, 0]}]}]})
    livro = Image.open(ICONE_LIVRO).convert('RGBA')
    itens = json.load(open(os.path.join(FGR, 'textures', 'item_texture.json'), encoding='utf-8'))
    # Grimorios coloridos: so o desenho em pixel art (o icone), como no addon original; sem anexo 3D na mao.
    for cor in CORANTES:
        emblema(tingir(livro, cor, ICONE_REF, capa_icone), cor, 6, 3).save(os.path.join(FGR, 'textures', 'fgr', 'grimoire.png' if cor == 'purple' else f'grimoire_{cor}.png'))
        if cor != 'purple':
            itens['texture_data'][f'fgr_grimoire_{cor}'] = {'textures': f'textures/fgr/grimoire_{cor}'}
        anexo = os.path.join(FGR, 'attachables', ('grimoire' if cor == 'purple' else f'grimoire_{cor}') + '.json')
        if os.path.exists(anexo): os.remove(anexo)
    icone_invisivel(emblema(tingir(livro, 'purple', ICONE_REF, capa_icone), 'purple', 6, 3)).save(os.path.join(FGR, 'textures', 'fgr', 'grimoire_invisible.png'))
    itens['texture_data']['fgr_grimoire_invisible'] = {'textures': 'textures/fgr/grimoire_invisible'}
    gravar_json(os.path.join(FGR, 'textures', 'item_texture.json'), itens)
    # invisivel: anexo sem nada para desenhar (a mao fica vazia; o icone continua no inventario)
    gravar_json(os.path.join(FGR, 'attachables', 'grimoire_invisible.json'), {'format_version': '1.10.0', 'minecraft:attachable': {'description': {
        'identifier': 'fgr:grimoire_invisible', 'materials': {'default': 'entity_alphatest'},
        'textures': {'default': 'textures/fgr/blank'}, 'geometry': {'default': GEO_VAZIA},
        'render_controllers': ['controller.render.default'],
        'scripts': {'parent_setup': "c.item_slot == 'main_hand' ? { v.oreville_mainhand_visible = 1; v.oreville_mainhand_custom_pos = 1; } : c.item_slot == 'off_hand' ? { v.oreville_offhand_visible = 1; } : 0;"}}}})
    print(f'grimorios: {len(CORANTES)} cores + invisivel')


NOMES = {  # pt_BR, en_US
    'white': ('Branco', 'White'), 'orange': ('Laranja', 'Orange'), 'magenta': ('Magenta', 'Magenta'),
    'light_blue': ('Azul-Claro', 'Light Blue'), 'yellow': ('Amarelo', 'Yellow'), 'lime': ('Verde-Limão', 'Lime'),
    'pink': ('Rosa', 'Pink'), 'gray': ('Cinza', 'Gray'), 'light_gray': ('Cinza-Claro', 'Light Gray'),
    'cyan': ('Ciano', 'Cyan'), 'purple': ('Roxo', 'Purple'), 'blue': ('Azul', 'Blue'), 'brown': ('Marrom', 'Brown'),
    'green': ('Verde', 'Green'), 'red': ('Vermelho', 'Red'), 'black': ('Preto', 'Black'),
}
BP_FGR = os.path.join(RAIZ, 'packs', 'BP_ForsakenGrimoire')


def item_grimorio(identificador, icone_nome):
    return {'format_version': '1.21.90', 'minecraft:item': {
        'description': {'identifier': identificador, 'menu_category': {'category': 'equipment', 'group': 'fgr:itemGroup.name.grimorios'}},
        'components': {'minecraft:icon': {'textures': {'default': icone_nome}},
                       'minecraft:display_name': {'value': f'item.{identificador}.name'},
                       'minecraft:max_stack_size': 1, 'minecraft:allow_off_hand': True, 'minecraft:hand_equipped': False,
                       'minecraft:glint': True, 'minecraft:rarity': 'rare', 'minecraft:tags': {'tags': ['fgr:grimoire']}}}}


def itens_grimorio():
    """Itens (BP) e nomes (RP) das variantes do Grimorio."""
    linhas = {'pt_BR': [], 'en_US': []}
    for cor, (pt, en) in NOMES.items():
        i = ident(cor)
        gravar_json(os.path.join(BP_FGR, 'items', 'grimoire.json' if cor == 'purple' else f'grimoire_{cor}.json'),
                    item_grimorio(i, 'fgr_grimoire' if cor == 'purple' else f'fgr_grimoire_{cor}'))
        if cor != 'purple':
            linhas['pt_BR'].append(f'item.{i}.name=Grimório {pt}')
            linhas['en_US'].append(f'item.{i}.name={en} Grimoire')
    gravar_json(os.path.join(BP_FGR, 'items', 'grimoire_invisible.json'), item_grimorio('fgr:grimoire_invisible', 'fgr_grimoire_invisible'))
    linhas['pt_BR'].append('item.fgr:grimoire_invisible.name=Grimório Invisível')
    linhas['en_US'].append('item.fgr:grimoire_invisible.name=Invisible Grimoire')
    for lingua, novas in linhas.items():
        arq = os.path.join(FGR, 'texts', f'{lingua}.lang')
        atuais = [l for l in open(arq, encoding='utf-8').read().splitlines() if l and not l.startswith('item.fgr:grimoire_')]
        with open(arq, 'w', encoding='utf-8', newline='\n') as f: f.write('\n'.join(atuais + novas) + '\n')
    print('itens do Grimorio: 17')


if __name__ == '__main__':
    controlador()
    grimorios()
    itens_grimorio()
