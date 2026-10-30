#!/usr/bin/env python3
"""Anexos das armas do Cataclysmical com o esqueleto e as animacoes do Actions & Stuff.

Uso: python ferramentas/anexos_cataclysm.py
Precisa do Pillow e do numpy. Para cada arma do Cataclysmical com etiqueta do A&S (oreville:is_sword, is_axe,
is_mace, is_hoe, is_pickaxe), copia o anexo do item de ferro correspondente do A&S (espada, machado, maca,
enxada ou picareta) e troca so o modelo e a textura, de modo que as animacoes do A&S servem para a arma:
  - armas feitas de bloco (o modelo 3D do Cataclysmical): o modelo e girado para ficar de pe, com o cabo
    na origem e a lamina para cima, como o modelo 3D do A&S, e redimensionado pela animacao ap_escala;
  - armas com icone: o icone vira um modelo de cubos de 1 pixel, na mesma posicao do modo 2D do A&S.
As lancas (Sunflare Glaive, Exodius, Crepusculo) tem tratamento proprio e ficam de fora.
Os anexos so valem com o A&S ativo (campo "item"); sem ele o jogo usa o desenho original.
Grava em packs/RP_AddonPack_Compat (attachables/as_compat/mnra_cata, models/entity/ap_cata.geo.json,
animations/ap_as_escala.animation.json e render_controllers/ap_as_item_animado.render_controllers.json)
e acrescenta as etiquetas que faltam no BP do Cataclysmical. Rode de novo depois de atualizar o A&S ou o Cataclysmical.
"""
import copy, functools, glob, json, math, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
AS = os.path.join(PACKS, 'RP_ActionsAndStuff')
COMPAT = os.path.join(PACKS, 'RP_AddonPack_Compat')
CATA = os.path.join(PACKS, 'RP_Cataclysmical')
CATA_BP = os.path.join(PACKS, 'BP_Cataclysmical')

MOLDES = {'oreville:is_mace': 'minecraft:mace', 'oreville:is_hoe': 'minecraft:iron_hoe',
          'oreville:is_pickaxe': 'minecraft:iron_pickaxe', 'oreville:is_sword': 'minecraft:iron_sword',
          'oreville:is_axe': 'minecraft:iron_axe'}  # em ordem de prioridade
LANCAS = {'sunflare_glaive', 'exodius_spear', 'twilight_spear'}
ETIQUETAS_EXTRA = {'star_sword': 'oreville:is_sword', 'morningstar': 'oreville:is_mace'}
POMO = np.array([0.0, -1.5, 0.0])  # ponta do cabo nos modelos 3D do A&S (o cabo sobe a partir da origem)
# comprimento na mao = comprimento do modelo x escala de terceira pessoa do Cataclysmical x FATOR
FATOR = 0.9
COMPRIMENTO_MIN, COMPRIMENTO_MAX = 22, 40
# cabo no lado oposto ao trecho mais largo (cabeca), em vez do lado da guarda
VIRAR = {'verdant_blade': True}


def ler(caminho): return json.load(open(caminho, encoding='utf-8'))


@functools.lru_cache(None)
def entidades():
    """Identificadores das entidades de cliente dos RPs. Um anexo com o mesmo identificador de uma entidade toma o
    lugar dela no mundo (o Boneco de Treino do Dungeons e os peixes do Aquaculture viravam o icone do item)."""
    ids = set()
    for p in glob.glob(os.path.join(PACKS, 'RP_*', 'entity', '**', '*.json'), recursive=True):
        try: ids.add(json.load(open(p, encoding='utf-8-sig'))['minecraft:client_entity']['description']['identifier'])
        except (ValueError, UnicodeDecodeError, KeyError, TypeError): pass
    return ids


def id_anexo(ident):
    """Identificador do anexo: o do item, ou com '.ap' quando ha entidade com esse nome (o campo "item" liga ao item)."""
    return ident + '.ap' if ident in entidades() else ident


def gravar(caminho, obj):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def rot(r):
    """Matriz de rotacao de um osso/cubo do Bedrock (graus [x, y, z])."""
    x, y, z = [math.radians(a) for a in (-r[0], r[1], -r[2])]
    Rx = np.array([[1, 0, 0], [0, math.cos(x), -math.sin(x)], [0, math.sin(x), math.cos(x)]])
    Ry = np.array([[math.cos(y), 0, math.sin(y)], [0, 1, 0], [-math.sin(y), 0, math.cos(y)]])
    Rz = np.array([[math.cos(z), -math.sin(z), 0], [math.sin(z), math.cos(z), 0], [0, 0, 1]])
    return Rz @ Ry @ Rx


def euler(M):
    """Inverso de rot(): angulos do Bedrock para a matriz M."""
    b = -math.asin(max(-1, min(1, M[2][0])))
    if abs(M[2][0]) > 0.99999: a, c = math.atan2(-M[0][1], M[1][1]), 0.0  # trava do cardan (y = +-90)
    else: a, c = math.atan2(M[1][0], M[0][0]), math.atan2(M[2][1], M[2][2])
    return [round(-math.degrees(c), 4), round(math.degrees(b), 4), round(-math.degrees(a), 4)]


def textura(caminho):
    for ext in ('.png', '.tga'):
        if os.path.exists(os.path.join(CATA, caminho + ext)): return Image.open(os.path.join(CATA, caminho + ext)).convert('RGBA')
    raise SystemExit(f'textura nao encontrada: {caminho}')


def geometrias_cata():
    res = {}
    for arq in glob.glob(os.path.join(CATA, 'models', '**', '*.json'), recursive=True):
        try: j = ler(arq)
        except ValueError: continue
        for g in j.get('minecraft:geometry', []) if isinstance(j, dict) else []: res[g['description']['identifier']] = g
    return res


def visivel_em(img, larg, alt, quadros):
    """Cubo visivel = alguma face com pixel nao transparente em algum quadro da textura
    (o animated_32x32 do Cataclysmical tem um cubo por pixel da grade inteira)."""
    qa = img.height // quadros
    sx, sy = img.width / larg, qa / alt

    def visivel(c):
        for f in c.get('uv', {}).values():
            (u, v), (du, dv) = f['uv'], f['uv_size']
            x0, x1 = sorted([u, u + du]); y0, y1 = sorted([v, v + dv])
            for q in range(quadros):
                reg = img.crop((int(x0 * sx), q * qa + int(y0 * sy), max(int(x0 * sx) + 1, math.ceil(x1 * sx)),
                                q * qa + max(int(y0 * sy) + 1, math.ceil(y1 * sy))))
                if reg.getextrema()[3][1] >= 20: return True
        return False
    return visivel


def pontos(ossos):
    """Cantos dos cubos, ja com as rotacoes dos ossos e dos cubos."""
    por_nome = {b['name']: b for b in ossos}

    def transf(nome, v):
        b = por_nome[nome]; p = np.array(b.get('pivot', [0, 0, 0]), float)
        if b.get('rotation'): v = rot(b['rotation']) @ (v - p) + p
        return transf(b['parent'], v) if b.get('parent') in por_nome else v
    pts = []
    for b in ossos:
        for c in b.get('cubes', []):
            o, s = np.array(c['origin'], float), np.array(c['size'], float)
            for i in (0, 1):
                for j in (0, 1):
                    for k in (0, 1):
                        v = o + s * np.array([i, j, k])
                        if c.get('rotation'):
                            pc = np.array(c.get('pivot', [0, 0, 0]), float); v = rot(c['rotation']) @ (v - pc) + pc
                        pts.append(transf(b['name'], v))
    return np.array(pts)


def alinhar(ossos, cabeca):
    """Acha o eixo da arma (componente principal) e a largura. O cabo fica do lado da guarda (trecho mais
    largo) nas espadas e do lado oposto a cabeca (trecho mais largo) nas outras armas.
    Devolve (matriz que leva o eixo para +y e a largura para x, ponta do cabo, comprimento)."""
    P = pontos(ossos); m = P.mean(0)
    _, _, Vt = np.linalg.svd(P - m, full_matrices=False)
    d, w = Vt[0], Vt[1]
    proj = (P - m) @ d
    fatias = np.linspace(proj.min(), proj.max(), 13)
    larg = [np.ptp((P[(proj >= a) & (proj <= b)] - m) @ w) if ((proj >= a) & (proj <= b)).sum() else 0
            for a, b in zip(fatias[:-1], fatias[1:])]
    i = int(np.argmax(larg)); largo = (fatias[i] + fatias[i + 1]) / 2
    if (largo > (proj.min() + proj.max()) / 2) != cabeca: d = -d
    proj = (P - m) @ d
    lat = P - m - np.outer(proj, d)
    perto = np.abs(proj - proj.min()) < 1.5
    pomo = m + (lat[perto].mean(0) if perto.any() else 0) + d * proj.min()
    M = np.array([w, d, np.cross(w, d)])
    return M, pomo, float(np.ptp(proj))


def esqueleto(geo_molde):
    """Ossos do modelo do A&S sem os cubos (as animacoes do A&S mexem neles); devolve (ossos, osso preso na mao)."""
    ossos = [{k: copy.deepcopy(v) for k, v in b.items() if k not in ('cubes', 'texture_meshes', 'locators')}
             for b in geo_molde['bones']]
    preso = next(b['name'] for b in ossos if 'binding' in b)
    if not any(o['name'] == 'al6e8dgo' for o in ossos):  # osso que o A&S usa no modo 2D (meio da lamina)
        ossos.append({'name': 'al6e8dgo', 'parent': preso, 'pivot': [0, 11.3137, 0]})
    return ossos, preso


def geo_bloco(ident, g0, molde_geo, img, quadros, cabeca):
    larg, alt = g0['description']['texture_width'], g0['description']['texture_height']
    visivel = visivel_em(img, larg, alt, quadros)
    ossos = copy.deepcopy(g0['bones'])
    for b in ossos:
        b.pop('binding', None); b.pop('locators', None)
        b['cubes'] = [c for c in b.get('cubes', []) if visivel(c)]
        if not b['cubes']: b.pop('cubes')
    M, pomo, comp = alinhar(ossos, cabeca)
    pele, preso = esqueleto(molde_geo)
    delta = POMO - pomo
    nomes = {b['name'] for b in ossos}
    novos = pele + [{'name': 'ap_arma', 'parent': preso, 'pivot': [round(x, 4) for x in POMO], 'rotation': euler(M)}]
    for b in ossos:
        b['name'] = 'c_' + b['name']
        b['parent'] = 'c_' + b['parent'] if b.get('parent') in nomes else 'ap_arma'
        b['pivot'] = [round(a + x, 4) for a, x in zip(b.get('pivot', [0, 0, 0]), delta)]
        for c in b.get('cubes', []):
            c['origin'] = [round(a + x, 4) for a, x in zip(c['origin'], delta)]
            if 'pivot' in c: c['pivot'] = [round(a + x, 4) for a, x in zip(c['pivot'], delta)]
        novos.append(b)
    # textura animada: a altura declarada e a da faixa inteira de quadros (os UV continuam no primeiro quadro) e o
    # uv_anim so desloca um quadro por vez; com a altura de um quadro e escala 1/quadros a lamina saia listrada
    return {'description': {'identifier': ident, 'texture_width': larg, 'texture_height': alt * quadros,
                            'visible_bounds_width': 4, 'visible_bounds_height': 4, 'visible_bounds_offset': [0, 1, 0]},
            'bones': novos}, comp


def geo_icone(ident, molde_geo, img):
    """Icone em cubos de 1 pixel (a malha plana texture_meshes nao aparecia na mao). O icone fica na diagonal,
    como no modo 2D do A&S: o canto de baixo a esquerda (cabo) no pomo e a ponta de cima a direita para +y."""
    pele, preso = esqueleto(molde_geo)
    larg, alt = img.size
    px = img.convert('RGBA').load()
    cheios = [(x, y) for y in range(alt) for x in range(larg) if px[x, y][3] >= 20]
    base = min(x + (alt - 1 - y) for x, y in cheios)  # pixel mais perto do cabo (menor u+v)
    deslize = POMO[1] * math.sqrt(2) / 2 - base / 2  # leva esse pixel ao pomo na diagonal
    cubos = []
    for x, y in cheios:
        u, v = x + deslize, alt - 1 - y + deslize
        face = {'uv': [x, y], 'uv_size': [1, 1]}
        cubos.append({'origin': [round(u, 4), round(v, 4), -0.5], 'size': [1, 1, 1],
                      'uv': {f: dict(face) for f in ('north', 'south', 'east', 'west', 'up', 'down')}})
    return {'description': {'identifier': ident, 'texture_width': larg, 'texture_height': alt,
                            'visible_bounds_width': 3, 'visible_bounds_height': 3, 'visible_bounds_offset': [0, 1, 0]},
            'bones': pele + [{'name': 'ap_arma', 'parent': preso, 'pivot': [0, 0, 0], 'rotation': [0, 0, -45],
                              'cubes': cubos}]}


def anexo(molde, ident, geo, tex, escala=None, quadros=None):
    a = copy.deepcopy(molde)
    d = a['minecraft:attachable']['description']
    d['identifier'] = id_anexo(ident)
    d['item'] = {ident: 'c.owning_entity -> v.actions_and_stuff;'}
    d['geometry'] = {'default': geo}
    d['textures'] = {'default': tex, 'enchanted': 'textures/misc/enchanted_item_glint'}
    d['materials'] = {'default': d['materials']['default'], 'enchanted': 'entity_alphatest_glint'}
    d['render_controllers'] = ['controller.render.ap.as_item_animado' if quadros else 'controller.render.ap.as_item']
    init = d['scripts'].setdefault('initialize', [])
    if escala:
        init.append(f'v.ap_escala = {escala};')
        d.setdefault('animations', {})['ap_escala'] = 'animation.ap.as_escala'
        d['scripts'].setdefault('animate', []).append('ap_escala')
    if quadros: init += [f'v.ap_quadros = {quadros[0]};', f'v.ap_ticks = {quadros[1]};']
    return a


def etiquetas():
    """Acrescenta a etiqueta do A&S nas armas que nao tem."""
    for arq in glob.glob(os.path.join(CATA_BP, 'items', '**', '*.json'), recursive=True):
        nome = os.path.basename(arq)[:-5]
        if nome not in ETIQUETAS_EXTRA: continue
        j = ler(arq); tags = j['minecraft:item']['components'].setdefault('minecraft:tags', {}).setdefault('tags', [])
        if ETIQUETAS_EXTRA[nome] not in tags:
            tags.append(ETIQUETAS_EXTRA[nome]); gravar(arq, j)


def main():
    etiquetas()
    geos = geometrias_cata()
    terreno = ler(os.path.join(CATA, 'textures', 'terrain_texture.json'))['texture_data']
    itens_tex = ler(os.path.join(CATA, 'textures', 'item_texture.json'))['texture_data']
    fb = {f['atlas_tile']: f for f in ler(os.path.join(CATA, 'textures', 'flipbook_textures.json'))}
    moldes, novas, feitas, total = {}, [], {}, 0
    for arq in sorted(glob.glob(os.path.join(CATA_BP, 'items', '**', '*.json'), recursive=True)):
        try: it = ler(arq)['minecraft:item']
        except (ValueError, KeyError): continue
        ident = it['description']['identifier']; nome = ident.split(':')[1]
        c = it['components']; tags = c.get('minecraft:tags', {}).get('tags', [])
        tipo = next((t for t in MOLDES if t in tags), None)
        if not tipo or nome in LANCAS: continue
        if MOLDES[tipo] not in moldes:
            m = brarchive.anexo(AS, MOLDES[tipo])
            gd = m['minecraft:attachable']['description']['geometry']
            moldes[MOLDES[tipo]] = (m, brarchive.geometria(AS, gd.get('default') or next(iter(gd.values()))))
        molde, molde_geo = moldes[MOLDES[tipo]]
        cabeca = 'minecraft:is_sword' not in tags or tipo in ('oreville:is_mace', 'oreville:is_hoe', 'oreville:is_pickaxe')
        cabeca = VIRAR.get(nome, cabeca)
        sufixo = MOLDES[tipo].split(':')[1].replace('iron_', '')
        if c.get('minecraft:block_placer'):
            bloco = ler(os.path.join(CATA_BP, 'blocks', 'items', f'{nome}.json'))['minecraft:block']['components']
            gid0 = bloco['minecraft:geometry']; gid0 = gid0 if isinstance(gid0, str) else gid0['identifier']
            tile = bloco['minecraft:material_instances']['*']['texture']
            cam = terreno[tile]['textures']; cam = cam[0] if isinstance(cam, list) else cam
            g0 = geos[gid0]; img = textura(cam)
            quadros = (len(fb[tile]['frames']), fb[tile]['ticks_per_frame']) if tile in fb else None
            # modelos iguais (mesma geometria, mesmos cubos visiveis e mesmo molde) sao gravados uma vez so
            g, comp = geo_bloco(None, g0, molde_geo, img, quadros[0] if quadros else 1, cabeca)
            chave = json.dumps(g['bones'], sort_keys=True)
            if chave not in feitas:
                gid = f'geometry.ap.cata.{nome}'
                g['description']['identifier'] = gid
                novas.append(g); feitas[chave] = gid
            gid = feitas[chave]
            tp = g0.get('item_display_transforms', {}).get('thirdperson_righthand', {}).get('scale', [1])[0]
            alvo = min(COMPRIMENTO_MAX, max(COMPRIMENTO_MIN, comp * tp * FATOR))
            a = anexo(molde, ident, gid, cam, round(alvo / comp, 4), quadros)
        else:
            tile = c.get('minecraft:icon'); tile = tile if isinstance(tile, str) else (tile or {}).get('textures', {}).get('default')
            cam = itens_tex[tile]['textures']; cam = cam[0] if isinstance(cam, list) else cam
            gid = f'geometry.ap.cata.icone.{nome}'
            novas.append(geo_icone(gid, molde_geo, textura(cam)))
            a = anexo(molde, ident, gid, cam)
        gravar(os.path.join(COMPAT, 'attachables', 'as_compat', 'mnra_cata', f'{nome}.json'), a)
        total += 1
    gravar(os.path.join(COMPAT, 'models', 'entity', 'ap_cata.geo.json'), {'format_version': '1.16.0', 'minecraft:geometry': novas})
    gravar(os.path.join(COMPAT, 'animations', 'ap_as_escala.animation.json'), {'format_version': '1.8.0', 'animations': {
        'animation.ap.as_escala': {'loop': True, 'bones': {'ap_arma': {'scale': 'v.ap_escala ?? 1'}}}}})
    rc = {'geometry': 'Geometry.default', 'materials': [{'*': 'variable.is_enchanted ? Material.enchanted : Material.default'}],
          'textures': ['Texture.default', 'Texture.enchanted'],
          'uv_anim': {'offset': [0, 'math.mod(math.floor(q.life_time * 20 / v.ap_ticks), v.ap_quadros) / v.ap_quadros'],
                      'scale': [1, 1]}}
    gravar(os.path.join(COMPAT, 'render_controllers', 'ap_as_item_animado.render_controllers.json'),
           {'format_version': '1.10.0', 'render_controllers': {'controller.render.ap.as_item_animado': rc}})
    print(f'armas do Cataclysmical: {total} anexos, {len(novas)} modelos')


if __name__ == '__main__': main()
