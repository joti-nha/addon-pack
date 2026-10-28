#!/usr/bin/env python3
"""Gera anexos (modelos 3D na mao) derivados do Actions & Stuff para itens de outros addons.

Uso: python ferramentas/gerar_anexos.py
Precisa do Pillow. Le o A&S de packs/RP_ActionsAndStuff_RP e grava:
  - varas de pescar do Aquaculture com a vara 3D do A&S, pintada conforme o icone de cada vara
    (packs/RP_AddonPack_Compat/attachables/as_compat/tm_aqc, models/entity/ap_aqc_rod.geo.json,
     textures/ap/aqc_rod_*.png)
  - arpoes do Aquaculture com o esqueleto e as animacoes do tridente do A&S e o icone plano
    (attachables/as_compat/tm_aqc, models/entity/ap_aqc_arpao.geo.json)
  - icones dos Grimorios (todas as cores e o invisivel); na mao eles e os Tomos Infinitos ficam em pixel art, sem modelo 3D
    (packs/RP_ForsakenGrimoire/textures/fgr; o invisivel tem um anexo vazio)
Rode de novo depois de atualizar o A&S.
"""
import colorsys, copy, json, math, os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AS = os.path.join(RAIZ, 'packs', 'RP_ActionsAndStuff_RP')
COMPAT = os.path.join(RAIZ, 'packs', 'RP_AddonPack_Compat')
FGR = os.path.join(RAIZ, 'packs', 'RP_ForsakenGrimoire')
AQC = os.path.join(RAIZ, 'packs', 'RP_Aquaculture_Add-On_RP')


def gravar_json(caminho, obj):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def textura_as(nome):
    return Image.open(os.path.join(AS, 'textures', 'oreville', 'ans', nome + '.png')).convert('RGBA')


def reempacotar(geo, atlas):
    """Copia so os pedacos do atlas (1024x1024) usados pela geometria para uma textura pequena e
    reescreve os UV. Devolve (geometria nova, imagem)."""
    geo = copy.deepcopy(geo)
    faces = [u for b in geo['bones'] for c in b.get('cubes', []) for u in c.get('uv', {}).values()]
    retang = {}
    for u in faces:
        (x, y), (w, h) = u['uv'], u['uv_size']
        r = (math.floor(min(x, x + w)), math.floor(min(y, y + h)), math.ceil(max(x, x + w)), math.ceil(max(y, y + h)))
        retang.setdefault(r, []).append(u)
    # empacotamento em prateleiras, do mais alto para o mais baixo, com 1 px de folga
    larg = 64
    lugar, cx, cy, alt = {}, 0, 0, 0
    for r in sorted(retang, key=lambda r: -(r[3] - r[1])):
        w, h = r[2] - r[0], r[3] - r[1]
        if cx + w > larg: cx, cy, alt = 0, cy + alt + 1, 0
        lugar[r] = (cx, cy); cx += w + 1; alt = max(alt, h)
    altura = 1
    while altura < cy + alt + 1: altura *= 2
    img = Image.new('RGBA', (larg, altura))
    for r, (nx, ny) in lugar.items():
        img.paste(atlas.crop(r), (nx, ny))
        for u in retang[r]: u['uv'] = [u['uv'][0] - r[0] + nx, u['uv'][1] - r[1] + ny]
    geo['description']['texture_width'], geo['description']['texture_height'] = larg, altura
    return geo, img


def luz(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def mapear_quantis(cores, paleta):
    """Cada cor (ordenada por brilho) recebe a cor da paleta na mesma posicao relativa."""
    cores = sorted(set(cores), key=luz)
    paleta = sorted(paleta, key=luz)
    return {c: paleta[min(len(paleta) - 1, int(i * len(paleta) / len(cores)))] for i, c in enumerate(cores)}


# ------------------------------------------------------------------ varas do Aquaculture

# Paletas tiradas dos icones de cada vara (escuro -> claro): corpo da vara e partes de metal.
VARAS = {
    'iron': ([(40, 30, 11), (73, 54, 21), (104, 78, 30), (137, 103, 39)], [(68, 68, 68), (100, 100, 100), (150, 150, 150), (216, 216, 216)]),
    'gold': ([(63, 46, 14), (130, 93, 22), (152, 104, 14), (185, 139, 17), (233, 177, 21), (238, 192, 72)],
             [(130, 93, 22), (185, 139, 17), (238, 192, 72), (253, 255, 118)]),
    'diamond': ([(9, 45, 47), (14, 63, 54), (21, 99, 85), (5, 135, 99), (17, 179, 150)],
                [(21, 99, 85), (17, 179, 150), (51, 235, 203), (164, 253, 240)]),
    'netherite': ([(35, 16, 18), (47, 33, 34), (50, 39, 39), (74, 41, 64), (96, 52, 50), (115, 69, 67)],
                  [(81, 68, 78), (93, 86, 93), (112, 103, 112), (134, 123, 134)]),
    'neptunium': ([(1, 12, 33), (0, 25, 57), (3, 62, 80), (19, 72, 103), (65, 107, 142)],
                  [(7, 163, 160), (9, 208, 178), (27, 245, 193), (140, 251, 220)]),
}
GEO_VARA = 'geometry.ap_aqc_rod'
ESCALA_VARA_FP = 0.6
COMPRIMENTO_ARPAO = 28  # comprimento na mao; o tridente do A&S tem ~32


def tipo_pixel(c):
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in c[:3]))
    if s < 0.22 or (0.45 < h < 0.65 and s < 0.4): return 'metal' if l < 0.8 else 'linha'
    if 0.04 < h < 0.13 and l < 0.85: return 'madeira'
    return 'outro'


def varas():
    anexo = brarchive.anexo(AS, 'minecraft:carrot_on_a_stick')
    d = anexo['minecraft:attachable']['description']
    geo = copy.deepcopy(brarchive.geometria(AS, d['geometry']['default']))
    # tira a cenoura (filhos de g3b64l) e pendura um anzol de metal no fim da linha
    pai = {b['name']: b.get('parent') for b in geo['bones']}
    def sob(nome, alvo):
        while nome:
            if nome == alvo: return True
            nome = pai.get(nome)
        return False
    ponta = next(b for b in geo['bones'] if b['name'] == 'g3b64l')
    geo['bones'] = [b for b in geo['bones'] if b['name'] == 'g3b64l' or not sob(b['name'], 'g3b64l')]
    geo, img = reempacotar(geo, textura_as('czc'))
    # um pixel de metal do proprio modelo para o anzol
    metal = next((x, y) for y in range(img.height) for x in range(img.width)
                 if img.getpixel((x, y))[3] and tipo_pixel(img.getpixel((x, y))) == 'metal')
    uv = {f: {'uv': list(metal), 'uv_size': [1, 1]} for f in ('north', 'south', 'east', 'west', 'up', 'down')}
    px, py, pz = ponta['pivot']
    geo['bones'].append({'name': 'anzol', 'parent': 'g3b64l', 'pivot': [px, py, pz], 'cubes': [
        {'origin': [px - 0.25, py - 0.25, pz - 2.5], 'size': [0.5, 0.5, 2.5], 'uv': uv},
        {'origin': [px - 0.25, py - 1.25, pz - 2.5], 'size': [0.5, 1, 0.5], 'uv': uv}]})
    geo['description']['identifier'] = GEO_VARA
    gravar_json(os.path.join(COMPAT, 'models', 'entity', 'ap_aqc_rod.geo.json'),
                {'format_version': '1.16.0', 'minecraft:geometry': [geo]})

    # pixels da linha de pesca (ossos gh2im6fg72f4q*): no A&S tem cor de barbante; numa vara de pesca, linha clara
    linha = set()
    for b in geo['bones']:
        if not b['name'].startswith('gh2im6fg72f4q'): continue
        for c in b.get('cubes', []):
            for u in c['uv'].values():
                (x, y), (w, h) = u['uv'], u['uv_size']
                for yy in range(math.floor(min(y, y + h)), math.ceil(max(y, y + h))):
                    for xx in range(math.floor(min(x, x + w)), math.ceil(max(x, x + w))): linha.add((xx, yy))
    px = img.load()
    for (x, y) in linha:
        if px[x, y][3]: px[x, y] = (*tom((236, 236, 236), luz(px[x, y]) / 230), px[x, y][3])
    usadas = [img.getpixel((x, y)) for y in range(img.height) for x in range(img.width)
              if img.getpixel((x, y))[3] and (x, y) not in linha]
    for nome, (corpo, metal_pal) in VARAS.items():
        troca = {}
        troca.update(mapear_quantis([c[:3] for c in usadas if tipo_pixel(c) == 'madeira'], corpo))
        troca.update(mapear_quantis([c[:3] for c in usadas if tipo_pixel(c) == 'metal'], metal_pal))
        nova = img.copy()
        npx = nova.load()
        for y in range(img.height):
            for x in range(img.width):
                c = npx[x, y]
                if c[3] and (x, y) not in linha and c[:3] in troca: npx[x, y] = (*troca[c[:3]], c[3])
        tex = f'textures/ap/aqc_rod_{nome}'
        os.makedirs(os.path.join(COMPAT, 'textures', 'ap'), exist_ok=True)
        nova.save(os.path.join(COMPAT, tex + '.png'))
        a = copy.deepcopy(anexo)
        da = a['minecraft:attachable']['description']
        da['identifier'] = f'tm_aqc:{nome}_fishing_rod'
        da['geometry'] = {'default': GEO_VARA}
        da['textures'] = {'default': tex, 'enchanted': 'textures/misc/enchanted_item_glint'}
        da['materials'] = {'default': da['materials']['default'], 'enchanted': 'entity_alphatest_glint'}
        da['render_controllers'] = ['controller.render.ap.as_item']
        # em primeira pessoa a linha de pesca do jogo sai de um ponto fixo, perto do meio da vara do A&S:
        # a vara encolhe ali para a linha sair da ponta
        da['animations']['ap_vara_fp'] = 'animation.ap.vara_primeira_pessoa'
        da['scripts']['animate'].append({'ap_vara_fp': 'c.is_first_person'})
        gravar_json(os.path.join(COMPAT, 'attachables', 'as_compat', 'tm_aqc', f'{nome}_fishing_rod.json'), a)
    gravar_json(os.path.join(COMPAT, 'animations', 'ap_aqc_vara.animation.json'), {'format_version': '1.8.0', 'animations': {
        'animation.ap.vara_primeira_pessoa': {'loop': True, 'bones': {'7ak9af8jg5': {'scale': ESCALA_VARA_FP}}}}})
    print('varas do Aquaculture: 5 anexos')


def arpoes():
    """Arpoes do Aquaculture (etiqueta oreville:is_trident) com o esqueleto e as animacoes do tridente do A&S e o
    modelo 3D original do arpao (cubos), posto de pe com o cabo na mao como as armas do Cataclysmical. A malha
    plana (texture_meshes) do modo 2D do A&S deixava o arpao sem textura na mao. Disparado, a textura 'cast'
    (sem a ponta) apaga os cubos da ponta, como no anexo original."""
    from anexos_cataclysm import geo_bloco
    molde = brarchive.anexo(AS, 'minecraft:trident')
    molde_geo = brarchive.geometria(AS, molde['minecraft:attachable']['description']['geometry']['default'])
    orig = json.load(open(os.path.join(AQC, 'models', 'entity', 'tools', 'harpoon.json'), encoding='utf-8-sig'))['minecraft:geometry'][0]
    vara = {k: copy.deepcopy(v) for k, v in next(b for b in orig['bones'] if b['name'] == 'rod').items() if k != 'parent'}
    img = Image.open(os.path.join(AQC, 'textures', 'tm', 'aqc', 'items', 'tools', 'iron_harpoon.png')).convert('RGBA')
    geo, comp = geo_bloco('geometry.ap.aqc.arpao', {'description': orig['description'], 'bones': [vara]}, molde_geo, img, 1, False)  # False: o trecho mais largo deste modelo e o do cabo
    gravar_json(os.path.join(COMPAT, 'models', 'entity', 'ap_aqc_arpao.geo.json'), {'format_version': '1.16.0', 'minecraft:geometry': [geo]})
    escala = round(COMPRIMENTO_ARPAO / comp, 4)
    for metal in ('iron', 'gold', 'diamond', 'netherite', 'neptunium'):
        ident = f'tm_aqc:{metal}_harpoon'
        a = copy.deepcopy(molde)
        d = a['minecraft:attachable']['description']
        d['identifier'] = ident
        d['item'] = {ident: 'c.owning_entity -> v.actions_and_stuff;'}
        d['geometry'] = {'default': 'geometry.ap.aqc.arpao', 'cast': 'geometry.ap.aqc.arpao'}
        d['textures'] = {'default': f'textures/tm/aqc/items/tools/{metal}_harpoon',
                         'cast': f'textures/tm/aqc/items/tools/{metal}_harpoon_cast', 'enchanted': 'textures/misc/enchanted_item_glint'}
        d['materials'] = {'default': 'entity_alphatest', 'enchanted': 'entity_alphatest_glint'}
        d['render_controllers'] = ['controller.render.ap.sprite_cast']
        d['scripts']['parent_setup'] = 't.cast = (v.cast ?? 0); ' + d['scripts']['parent_setup']
        d['scripts'].setdefault('initialize', []).append(f'v.ap_escala = {escala};')
        d.setdefault('animations', {})['ap_escala'] = 'animation.ap.as_escala'
        d['scripts'].setdefault('animate', []).append('ap_escala')
        gravar_json(os.path.join(COMPAT, 'attachables', 'as_compat', 'tm_aqc', f'{metal}_harpoon.json'), a)
    print(f'arpoes do Aquaculture: 5 anexos (modelo 3D, escala {escala})')


def controlador():
    """Render controller com brilho de encantamento, para os anexos gerados aqui."""
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
    varas()
    arpoes()
    grimorios()
    itens_grimorio()
