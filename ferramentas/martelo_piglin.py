#!/usr/bin/env python3
"""Martelo de Guerra Piglin (Forsaken Odyssey) com as animacoes da maca do Actions & Stuff (pedido do João, 2026-10-31).

Uso: python ferramentas/martelo_piglin.py
Copia o anexo da maca do A&S e troca so o modelo e a textura, como as armas de bloco do Cataclysmical
(anexos_cataclysm.py): o modelo do martelo fica de pe, com o cabo na mao e a cabeca para cima. Grava
packs/RP_AddonPack_Compat/attachables/as_compat/ntk/piglin_war_hammer.json e models/entity/ap_ntk_martelo.geo.json
e poe a etiqueta oreville:is_mace no item (BP_ForsakenOdyssey), que liga o golpe da maca no braco do A&S.
Rode de novo depois de atualizar o A&S ou o Forsaken Odyssey.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402
import anexos_cataclysm as cata  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FO = os.path.join(RAIZ, 'packs', 'RP_ForsakenOdyssey')
ITEM = os.path.join(RAIZ, 'packs', 'BP_ForsakenOdyssey', 'items', 'nmd', 'ntk_piglin_war_hammer.json')
IDENT = 'ntk:piglin_war_hammer'
GEO = 'geometry.ap.ntk.martelo_piglin'
TEX = 'textures/models/nmd/ntk_piglin_war_hammer'
COMPRIMENTO = 30  # na mao, em pixels do modelo (a maca do A&S tem ~26; o martelo piglin e maior)


def uv_por_face(uv, tam):
    """UV de caixa (box UV) para UV por face, no mesmo arranjo do Blockbench (geo_bloco le UV por face)."""
    u, v = uv; w, h, d = tam
    f = lambda a, b, c, e: {'uv': [a, b], 'uv_size': [c, e]}
    return {'east': f(u, v + d, d, h), 'north': f(u + d, v + d, w, h), 'west': f(u + d + w, v + d, d, h),
            'south': f(u + 2 * d + w, v + d, w, h), 'up': f(u + d + w, v + d, -w, -d), 'down': f(u + d + 2 * w, v, -w, d)}


def main():
    molde = brarchive.anexo(cata.AS, 'minecraft:mace')
    gd = molde['minecraft:attachable']['description']['geometry']
    molde_geo = brarchive.geometria(cata.AS, gd.get('default') or next(iter(gd.values())))
    g0 = json.load(open(os.path.join(FO, 'models', 'entity', 'item', 'geometry.item.ntk_piglin_war_hammer.json'),
                        encoding='utf-8-sig'))['minecraft:geometry'][0]
    # so os ossos do martelo (o rightItem do modelo original e so o ponto de encaixe)
    g0 = {'description': g0['description'], 'bones': [b for b in g0['bones'] if b['name'] != 'rightItem']}
    for b in g0['bones']:
        if b.get('parent') == 'rightItem': b.pop('parent')
        for c in b.get('cubes', []):
            if isinstance(c.get('uv'), list): c['uv'] = uv_por_face(c['uv'], c['size'])
    from PIL import Image
    img = Image.open(os.path.join(FO, TEX + '.png')).convert('RGBA')
    g, comp = cata.geo_bloco(GEO, g0, molde_geo, img, 1, True)  # True: a cabeca (trecho mais largo) vai para cima
    cata.gravar(os.path.join(cata.COMPAT, 'models', 'entity', 'ap_ntk_martelo.geo.json'),
                {'format_version': '1.16.0', 'minecraft:geometry': [g]})
    a = cata.anexo(molde, IDENT, GEO, TEX, round(COMPRIMENTO / comp, 4))
    cata.gravar(os.path.join(cata.COMPAT, 'attachables', 'as_compat', 'ntk', 'piglin_war_hammer.json'), a)
    # etiqueta da maca do A&S no item
    t = open(ITEM, encoding='utf-8').read()
    if '"oreville:is_mace"' not in t:
        t = t.replace('"ntk:hammer",', '"ntk:hammer","oreville:is_mace",', 1)
        json.loads(t)
        open(ITEM, 'w', encoding='utf-8').write(t)
    print(f'martelo piglin: anexo da maca do A&S (comprimento do modelo {comp:.1f}, escala {COMPRIMENTO / comp:.3f})')


if __name__ == '__main__': main()
