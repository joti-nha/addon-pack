#!/usr/bin/env python3
"""Anexos das armas pesadas com o esqueleto e as animacoes do Machado Wroughtnaut (Mowzie's Mobs).

Uso: python ferramentas/armas_pesadas.py
Precisa do Pillow e do numpy. Para cada arma pesada (claymores do Dungeons e espadas grandes do
Cataclysmical), monta um modelo com os ossos base > rot2 > rot do machado e o modelo da arma
deitado ao longo do cabo, de modo que as animacoes de segurar e de golpe do machado servem para ela.
Durante o golpe em primeira pessoa a mao some (o mesmo vale para o proprio machado).
Grava em packs/RP_AddonPack_Compat (attachables/as_compat, models/entity/ap_pesadas,
animations, animation_controllers e render_controllers). Rode de novo depois de atualizar um desses addons
e, em seguida, ferramentas/mesclar_jogador.py (o golpe em terceira pessoa fica no jogador).
"""
import copy, json, math, os, sys
import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
COMPAT = os.path.join(PACKS, 'RP_AddonPack_Compat')
DNG = os.path.join(PACKS, 'RP_dungeons_RP')
CATA = os.path.join(PACKS, 'RP_Cataclysmical_RP')
MZS = os.path.join(PACKS, 'RP_Mowzie_s_Mobs_Add-On_1.1_RP')

# ponto do cabo do machado onde fica o pomo (os tres ossos do machado giram em torno dele)
PIVO = [0.14064, -0.43409, 0.11225]
POMO = [0.14064, -0.5, 0.11225]
COMPRIMENTO = 48  # comprimento da arma no modelo; o cabo do machado com a lamina tem ~58
VELOCIDADE = 2.6  # o golpe do machado dura 1,625 s; nas armas pesadas fica ~0,6 s

DUNGEONS = {  # identificador: fator de tamanho
    'claymore': 1, 'broadsword': 1.05, 'heartstealer': 1, 'great_axeblade': 1.05,
    'obsidian_claymore': 1.15, 'starless_night': 1.15,
}
CATACLYSMICAL = {
    'wooden_greatsword': 1, 'stone_greatsword': 1, 'copper_greatsword': 1, 'iron_greatsword': 1,
    'gold_greatsword': 1, 'diamond_greatsword': 1, 'netherite_greatsword': 1, 'platinum_greatsword': 1,
    'stellar_greatsword': 1.1, 'verdant_greatsword': 1.1, 'phantasma_greatsword': 1.1,
    'exodius_greatsword': 1.15, 'ecliptic_greatsword': 1.15, 'sun_striker_claymore': 1.15,
}
MACHADO = 'hf_mzs:wroughtnaut_axe'


def ler(caminho): return json.load(open(caminho, encoding='utf-8'))


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
    a = math.atan2(M[1][0], M[0][0]); c = math.atan2(M[2][1], M[2][2])
    return [round(-math.degrees(c), 4), round(math.degrees(b), 4), round(-math.degrees(a), 4)]


def textura(pack, caminho):
    for ext in ('.png', '.tga'):
        if os.path.exists(os.path.join(pack, caminho + ext)): return Image.open(os.path.join(pack, caminho + ext)).convert('RGBA')
    raise SystemExit(f'textura nao encontrada: {caminho}')


# ---------------------------------------------------------------- modelos de origem

def voxelizar(img):
    """Sprite -> cubos de 1 pixel de espessura (uma fileira por cubo), deitado no plano y-z.
    Pixel (u, v) vai para y = -v, z = -u. Devolve os ossos e a ponta do cabo (canto inferior esquerdo)."""
    w, h = img.size; px = img.load(); cubos = []
    for v in range(h):
        u = 0
        while u < w:
            if px[u, v][3] < 20: u += 1; continue
            u0 = u
            while u < w and px[u, v][3] >= 20: u += 1
            n = u - u0
            cubos.append({'origin': [-0.5, -v - 1, -u0 - n], 'size': [1, 1, n], 'uv': {
                'east': {'uv': [u0, v], 'uv_size': [n, 1]},
                'west': {'uv': [u0 + n, v], 'uv_size': [-n, 1]},
                'up': {'uv': [u0, v], 'uv_size': [n, 1]},
                'down': {'uv': [u0, v], 'uv_size': [n, 1]},
                'north': {'uv': [u0 + n - 1, v], 'uv_size': [1, 1]},
                'south': {'uv': [u0, v], 'uv_size': [1, 1]}}})
    return [{'name': 'arma', 'pivot': [0, 0, 0], 'cubes': cubos}], np.array([0.0, -h, 0.0])


def geometria_cata(ident):
    for raiz, _, arqs in os.walk(os.path.join(CATA, 'models')):
        for a in arqs:
            if not a.endswith('.json'): continue
            for g in ler(os.path.join(raiz, a)).get('minecraft:geometry', []):
                if g['description']['identifier'] == ident: return g
    raise SystemExit(f'geometria nao encontrada: {ident}')


def pontos(ossos, visivel=lambda c: True):
    """Cantos dos cubos visiveis, ja com as rotacoes dos ossos e dos cubos."""
    por_nome = {b['name']: b for b in ossos}

    def transf(nome, v):
        b = por_nome[nome]; p = np.array(b.get('pivot', [0, 0, 0]), float)
        if b.get('rotation'): v = rot(b['rotation']) @ (v - p) + p
        return transf(b['parent'], v) if b.get('parent') in por_nome else v
    pts = []
    for b in ossos:
        for c in b.get('cubes', []):
            if not visivel(c): continue
            o, s = np.array(c['origin'], float), np.array(c['size'], float)
            for i in (0, 1):
                for j in (0, 1):
                    for k in (0, 1):
                        v = o + s * np.array([i, j, k])
                        if c.get('rotation'):
                            pc = np.array(c.get('pivot', [0, 0, 0]), float); v = rot(c['rotation']) @ (v - pc) + pc
                        pts.append(transf(b['name'], v))
    return np.array(pts)


# ---------------------------------------------------------------- alinhamento no cabo do machado

def opaco(img, larg, alt):
    """Cubo visivel = alguma face com pixel nao transparente no primeiro quadro da textura
    (o animated_32x32 do Cataclysmical tem um cubo por pixel da grade inteira)."""
    quadro = img.crop((0, 0, img.width, img.width * alt // larg)) if img.height * larg > img.width * alt else img
    sx, sy = quadro.width / larg, quadro.height / alt

    def visivel(c):
        for f in c.get('uv', {}).values():
            (u, v), (du, dv) = f['uv'], f['uv_size']
            x0, x1 = sorted([u, u + du]); y0, y1 = sorted([v, v + dv])
            reg = quadro.crop((int(x0 * sx), int(y0 * sy), max(int(x0 * sx) + 1, math.ceil(x1 * sx)), max(int(y0 * sy) + 1, math.ceil(y1 * sy))))
            if reg.getextrema()[3][1] >= 20: return True
        return False
    return visivel


def alinhar(ossos, ponta_cabo=None, visivel=lambda c: True):
    """Acha o eixo da arma (componente principal) e a largura da lamina. O lado do cabo e o mais perto
    de ponta_cabo; sem ela, e o lado mais perto do trecho mais largo (a guarda).
    Devolve (rotacao do osso ap_arma, deslocamento dos cubos, comprimento)."""
    P = pontos(ossos, visivel); m = P.mean(0)
    _, _, Vt = np.linalg.svd(P - m, full_matrices=False)
    d, w = Vt[0], Vt[1]
    proj = (P - m) @ d
    if ponta_cabo is not None:
        if (ponta_cabo - m) @ d > 0: d = -d
    else:
        fatias = np.linspace(proj.min(), proj.max(), 13)
        larg = [np.ptp((P[(proj >= a) & (proj <= b)] - m) @ w) if ((proj >= a) & (proj <= b)).sum() else 0
                for a, b in zip(fatias[:-1], fatias[1:])]
        guarda = (fatias[int(np.argmax(larg))] + fatias[int(np.argmax(larg)) + 1]) / 2
        if guarda > (proj.min() + proj.max()) / 2: d = -d
    proj = (P - m) @ d
    lat = P - m - np.outer(proj, d)
    centro = m + lat[np.abs(proj - proj.min()) < 1.5].mean(0) if (np.abs(proj - proj.min()) < 1.5).any() else m
    pomo = centro + d * proj.min()
    n = np.cross(d, w)
    M = np.array([n, d, w])  # leva d para +y e a largura para z (lamina de pe no plano y-z, como a do machado)
    return euler(M), np.array(POMO) - pomo, float(np.ptp(proj))


def montar_geometria(ident, ossos, larg, alt, ponta_cabo=None, img=None):
    visivel = opaco(img, larg, alt) if img is not None else (lambda c: True)
    rotacao, delta, comp = alinhar(ossos, ponta_cabo, visivel)
    novos = [{'name': 'base', 'pivot': PIVO, 'binding': 'q.item_slot_to_bone_name(c.item_slot)'},
             {'name': 'rot2', 'parent': 'base', 'pivot': PIVO},
             {'name': 'rot', 'parent': 'rot2', 'pivot': PIVO},
             {'name': 'ap_arma', 'parent': 'rot', 'pivot': POMO, 'rotation': rotacao}]
    for b in copy.deepcopy(ossos):
        b.pop('binding', None)
        if not b.get('parent') or b['parent'] not in {o['name'] for o in ossos}: b['parent'] = 'ap_arma'
        if b['name'] in ('base', 'rot2', 'rot', 'ap_arma'): b['name'] = 'ap_' + b['name']
        b['pivot'] = [round(a + x, 4) for a, x in zip(b.get('pivot', [0, 0, 0]), delta)]
        for c in b.get('cubes', []):
            c['origin'] = [round(a + x, 4) for a, x in zip(c['origin'], delta)]
            if 'pivot' in c: c['pivot'] = [round(a + x, 4) for a, x in zip(c['pivot'], delta)]
        novos.append(b)
    geo = {'description': {'identifier': ident, 'texture_width': larg, 'texture_height': alt,
                           'visible_bounds_width': 8, 'visible_bounds_height': 8, 'visible_bounds_offset': [0, 2, 0]},
           'bones': novos}
    return geo, comp


# ---------------------------------------------------------------- arquivos do Compat

ARQ_ANIM = os.path.join(COMPAT, 'animations', 'ap_armas_pesadas.animation.json')
ARQ_CTRL = os.path.join(COMPAT, 'animation_controllers', 'ap_armas_pesadas.animation_controllers.json')
ARQ_RC = os.path.join(COMPAT, 'render_controllers', 'ap_armas_pesadas.render_controllers.json')


def animacoes():
    machado = ler(os.path.join(MZS, 'animations', 'player', 'wroughtnaut_axe.animation.json'))['animations']
    tp = ler(os.path.join(MZS, 'animations', 'player', 'wroughtnaut_axe_tp.animation.json'))['animations']
    golpe = copy.deepcopy(machado['animation.hf_mzs.wroughtnaut_axe.fp_swing'])
    golpe['anim_time_update'] = f'q.anim_time + q.delta_time * {VELOCIDADE}'
    golpe_tp = copy.deepcopy(tp['animation.hf_mzs.wroughtnaut_axe.tp_swing'])
    golpe_tp.pop('start_delay', None)
    golpe_tp['anim_time_update'] = f'q.anim_time + q.delta_time * {VELOCIDADE}'
    gravar(ARQ_ANIM, {'format_version': '1.8.0', 'animations': {
        'animation.ap.pesada.escala': {'loop': True, 'bones': {'ap_arma': {'scale': 'v.ap_escala ?? 1'}}},
        'animation.ap.pesada.fp_idle': machado['animation.hf_mzs.wroughtnaut_axe.fp_idle'],
        'animation.ap.pesada.fp_golpe': golpe,
        'animation.ap.pesada.tp_idle': {'loop': True, 'bones': {'base': {
            'rotation': [90, 0, 0], 'position': [0, 22, 6], 'scale': 0.6}}},
        'animation.ap.pesada.tp_golpe': golpe_tp}})


def controladores(idents):
    lista = ','.join(f"'{i}'" for i in idents)
    gravar(ARQ_CTRL, {'format_version': '1.10.0', 'animation_controllers': {
        # no item: segura como o machado e golpeia quando o jogador ataca (primeira pessoa)
        'controller.animation.ap.pesada': {'initial_state': 'padrao', 'states': {
            'padrao': {'animations': [{'fp_idle': 'c.is_first_person'}, {'tp_idle': '!c.is_first_person'}],
                       'transitions': [{'golpe': 'c.is_first_person && (c.owning_entity->v.attack_time ?? 0) > 0'}]},
            'golpe': {'animations': ['fp_golpe'],
                      'transitions': [{'padrao': 'q.any_animation_finished || !c.is_first_person'}]}}},
        # no jogador: golpe de duas maos do machado em terceira pessoa
        'controller.animation.ap.pesada_tp': {'initial_state': 'padrao', 'states': {
            'padrao': {'transitions': [{'golpe': f"!v.is_first_person && v.attack_time > 0 && q.is_item_name_any('slot.weapon.mainhand', 0, {lista})"}]},
            'golpe': {'animations': ['ap_pesada_tp_golpe'], 'blend_transition': 0.1,
                      'transitions': [{'padrao': 'q.any_animation_finished || v.is_first_person'}]}}}}})


def render_controllers():
    rc = {'geometry': 'Geometry.default', 'materials': [{'*': 'v.is_enchanted ? Material.enchanted : Material.default'}],
          'textures': ['Texture.default', 'Texture.enchanted']}
    anim = dict(rc, uv_anim={'offset': [0, 'math.mod(math.floor(q.life_time * 20 / v.ap_ticks), v.ap_quadros) / v.ap_quadros'],
                             'scale': [1, '1 / v.ap_quadros']})
    gravar(ARQ_RC, {'format_version': '1.10.0', 'render_controllers': {
        'controller.render.ap.pesada': rc, 'controller.render.ap.pesada_animada': anim}})


# a mao some enquanto o golpe roda (0,6 s depois do clique)
FIM_GOLPE = round(1.625 / VELOCIDADE, 3)
PARENT_SETUP = ("c.item_slot == 'main_hand' ? { v.attack_time > 0 && (v.ap_pesada_fim ?? 0) < q.life_time ? "
                f"{{ v.ap_pesada_fim = q.life_time + {FIM_GOLPE}; }}; v.oreville_mainhand_custom_pos = 1; "
                "v.oreville_mainhand_visible = q.life_time >= (v.ap_pesada_fim ?? 0); } : "
                "c.item_slot == 'off_hand' ? { v.oreville_offhand_visible = 1; } : 0;")


def anexo(ident, textura_caminho, geo_ident, escala, quadros=None):
    init = [f'v.ap_escala = {escala};']
    if quadros: init += [f'v.ap_quadros = {quadros[0]};', f'v.ap_ticks = {quadros[1]};']
    return {'format_version': '1.10.0', 'minecraft:attachable': {'description': {
        'identifier': ident,
        'materials': {'default': 'entity_alphatest', 'enchanted': 'entity_alphatest_glint'},
        'textures': {'default': textura_caminho, 'enchanted': 'textures/misc/enchanted_item_glint'},
        'geometry': {'default': geo_ident},
        'animations': {'segurar': 'controller.animation.ap.pesada', 'escala': 'animation.ap.pesada.escala',
                       'fp_idle': 'animation.ap.pesada.fp_idle', 'tp_idle': 'animation.ap.pesada.tp_idle',
                       'fp_golpe': 'animation.ap.pesada.fp_golpe'},
        'scripts': {'initialize': init, 'animate': ['escala', 'segurar'], 'parent_setup': PARENT_SETUP},
        'render_controllers': ['controller.render.ap.pesada_animada' if quadros else 'controller.render.ap.pesada']}}}


def flipbooks():
    return {f['atlas_tile']: f for f in ler(os.path.join(CATA, 'textures', 'flipbook_textures.json'))}


def main():
    geos, idents = [], []
    for nome, fator in DUNGEONS.items():
        cam = f'textures/items/weapon/{nome}'  # a mesma textura do anexo original (sprite inclinado)
        img = textura(DNG, cam)
        ossos, ponta = voxelizar(img)
        g, comp = montar_geometria(f'geometry.ap.pesada.dungeons.{nome}', ossos, img.width, img.height, ponta)
        geos.append(g)
        gravar(os.path.join(COMPAT, 'attachables', 'as_compat', 'dungeons', f'{nome}.json'),
               anexo(f'dungeons:{nome}', cam, g['description']['identifier'], round(COMPRIMENTO * fator / comp, 4)))
        idents.append(f'dungeons:{nome}')
    terreno = ler(os.path.join(CATA, 'textures', 'terrain_texture.json'))['texture_data']
    fb = flipbooks(); feitas = {}
    for nome, fator in CATACLYSMICAL.items():
        bloco = ler(os.path.join(PACKS, 'BP_Cataclysmical_BP', 'blocks', 'items', f'{nome}.json'))['minecraft:block']['components']
        geo_orig, tile = bloco['minecraft:geometry'], bloco['minecraft:material_instances']['*']['texture']
        cam = terreno[tile]['textures']; cam = cam[0] if isinstance(cam, list) else cam
        if geo_orig not in feitas:
            g0 = geometria_cata(geo_orig)
            g, comp = montar_geometria('geometry.ap.pesada.cata.' + geo_orig.split('.', 1)[1], g0['bones'],
                                       g0['description']['texture_width'], g0['description']['texture_height'],
                                       img=textura(CATA, cam))
            geos.append(g); feitas[geo_orig] = (g['description']['identifier'], comp)
        gid, comp = feitas[geo_orig]
        quadros = (len(fb[tile]['frames']), fb[tile]['ticks_per_frame']) if tile in fb else None
        gravar(os.path.join(COMPAT, 'attachables', 'as_compat', 'mnra_cata', f'{nome}.json'),
               anexo(f'mnra_cata:{nome}', cam, gid, round(COMPRIMENTO * fator / comp, 4), quadros))
        idents.append(f'mnra_cata:{nome}')
    gravar(os.path.join(COMPAT, 'models', 'entity', 'ap_pesadas.geo.json'),
           {'format_version': '1.12.0', 'minecraft:geometry': geos})
    # o proprio machado: a mao some durante o golpe e a pancada (recarga de 3 s)
    cam = os.path.join(COMPAT, 'attachables', 'as_compat', 'hf_mzs', 'wroughtnaut_axe.json')
    m = ler(cam)
    m['minecraft:attachable']['description']['scripts']['parent_setup'] = (
        "c.item_slot == 'main_hand' ? { v.oreville_mainhand_custom_pos = 1; v.oreville_mainhand_visible = "
        "q.cooldown_time_remaining('slot.weapon.mainhand') < (q.is_sneaking ? 0.3 : 1.35); } : "
        "c.item_slot == 'off_hand' ? { v.oreville_offhand_visible = 1; } : 0;")
    gravar(cam, m)
    idents.append(MACHADO)
    animacoes(); controladores(idents); render_controllers()
    print(f'{len(idents) - 1} armas pesadas, {len(geos)} modelos')


if __name__ == '__main__': main()
