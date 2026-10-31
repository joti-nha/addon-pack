#!/usr/bin/env python3
"""Martelo de Guerra Piglin (Forsaken Odyssey) com as animacoes da maca do Actions & Stuff (pedido do João, 2026-10-31).

Uso: python ferramentas/martelo_piglin.py
Copia o anexo da maca do A&S e troca so o modelo e a textura, como as armas de bloco do Cataclysmical
(anexos_cataclysm.py): o modelo do martelo fica de pe, com o cabo na mao e a cabeca para cima. Grava
packs/RP_AddonPack_Compat/attachables/as_compat/ntk/piglin_war_hammer.json e models/entity/ap_ntk_martelo.geo.json
e poe a etiqueta oreville:is_mace no item (BP_ForsakenOdyssey), que liga o golpe da maca no braco do A&S.

Golpe unico (pedido do João, 2026-10-31): o martelo toca so o 1o golpe da maca do A&S, sem a sequencia.
  - O item perde o minecraft:swing_duration de 4 s: o A&S passa de um golpe para o seguinte enquanto
    v.attack_time nao zera, entao um so toque emendava golpes por 4 s.
  - O item ganha a etiqueta ap:golpe_unico, e os dois controles da maca do A&S (braco: camimd; posicao do item:
    pwqhcf) ganham, so para essa etiqueta, a volta para o 1o golpe a cada toque (por um estado gemeo, ja que um
    estado nao pode ir para ele mesmo) e ficam sem as poses de queda, de pouso e da sequencia rapida.
  - A mesma correcao vale para as outras marretas do A&S com swing_duration longo (OUTROS_GOLPE_UNICO: ancoras e
    clavas de osso do Dungeons, pedido do João no mesmo dia).
Rode de novo depois de atualizar o A&S (e depois do enxugar_ans.py), o Forsaken Odyssey ou o Dungeons.
"""
import copy, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402
import anexos_cataclysm as cata  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FO = os.path.join(RAIZ, 'packs', 'RP_ForsakenOdyssey')
ITEM = os.path.join(RAIZ, 'packs', 'BP_ForsakenOdyssey', 'items', 'nmd', 'ntk_piglin_war_hammer.json')
IDENT = 'ntk:piglin_war_hammer'
GEO = 'geometry.ap.ntk.martelo_piglin'
TEX = 'textures/models/nmd/ntk_piglin_war_hammer'
DG = os.path.join(RAIZ, 'packs', 'BP_AlylicasDungeons', 'items', 'melee')
OUTROS_GOLPE_UNICO = [os.path.join(DG, a) for a in ('anchor/anchor.json', 'anchor/anchor_encrusted.json',
                                                     'boneclub/bone_club.json', 'boneclub/bone_cudgel.json')]
COMPRIMENTO = 30  # na mao, em pixels do modelo (a maca do A&S tem ~26; o martelo piglin e maior)


def uv_por_face(uv, tam):
    """UV de caixa (box UV) para UV por face, no mesmo arranjo do Blockbench (geo_bloco le UV por face)."""
    u, v = uv; w, h, d = tam
    f = lambda a, b, c, e: {'uv': [a, b], 'uv_size': [c, e]}
    return {'east': f(u, v + d, d, h), 'north': f(u + d, v + d, w, h), 'west': f(u + d + w, v + d, d, h),
            'south': f(u + 2 * d + w, v + d, w, h), 'up': f(u + d + w, v + d, -w, -d), 'down': f(u + d + 2 * w, v, -w, d)}


UNICO = "q.equipped_item_any_tag('slot.weapon.mainhand','ap:golpe_unico')"
GEMEO = 'ap_golpe_unico'


def _mudar(trans, destino, extra, so_primeiro=False):
    """Acrescenta '&&extra' as transicoes para 'destino' (lista de {estado: condicao})."""
    for t in trans:
        if destino in t:
            t[destino] = f'({t[destino]})&&{extra}'
            if so_primeiro: return


def _antes(trans, destino, novo):
    """Poe a transicao 'novo' antes da primeira transicao para 'destino' (ou no fim)."""
    i = next((k for k, t in enumerate(trans) if destino in t), len(trans))
    trans.insert(i, novo)


def marcar_golpe_unico(arq):
    """Etiqueta ap:golpe_unico (logo depois de oreville:is_mace) e sem o minecraft:swing_duration."""
    t = open(arq, encoding='utf-8').read()
    if '"ap:golpe_unico"' not in t:
        assert '"oreville:is_mace"' in t, arq
        t = t.replace('"oreville:is_mace"', '"oreville:is_mace","ap:golpe_unico"', 1)
    t = re.sub(r'"minecraft:swing_duration":\{"value":[0-9.]+\},?', '', t)
    json.loads(t)
    open(arq, 'w', encoding='utf-8').write(t)


def golpe_unico():
    arq = os.path.join(cata.AS, '__brarchive', 'animation_controllers.brarchive')
    itens = brarchive.ler(arq)
    nome = next(n for n, d in itens.items() if d and b'controller.animation.oreville_ans.camimd' in d)
    j = json.loads(itens[nome])
    acs = j['animation_controllers']
    braco = acs['controller.animation.oreville_ans.camimd']['states']
    item = acs['controller.animation.oreville_ans.pwqhcf']['states']
    if GEMEO in braco:
        print('golpe unico: o A&S ja tem o estado', GEMEO)
        return
    nao = f'!{UNICO}'
    # braco: maca parada -> 1o golpe (aqfcvc) a cada toque, no chao ou no ar; sem pulo alto, queda e 2o golpe
    t = braco['mace']['transitions']
    for d in ('bcyrdi', 'aqfcvc', 'hjmytu', 'azdvph'): _mudar(t, d, nao)
    t.insert(1, {'aqfcvc': f'{UNICO}&&v.attack_time'})
    g = copy.deepcopy(braco['aqfcvc'])
    t = braco['aqfcvc']['transitions']
    for d in ('hjmytu', 'bcyrdi'): _mudar(t, d, nao)
    _antes(t, 'hjmytu', {GEMEO: f'{UNICO}&&q.state_time>=0.3&&v.attack_time'})
    g['transitions'] = [x for x in t if 'default' in x or 'mace' in x]
    _antes(g['transitions'], 'mace', {'aqfcvc': 'q.state_time>=0.3&&v.attack_time'})
    braco[GEMEO] = g
    # posicao do item: sem a pose de queda, o pouso e a sequencia rapida; fpenke <-> opctuq ja e o mesmo golpe
    _mudar(item['hpajvt']['transitions'], 'azdvph', nao)
    for est, outro in (('fpenke', 'opctuq'), ('opctuq', 'fpenke')):
        t = item[est]['transitions']
        for x in t:
            if 'hpajvt' in x: x['hpajvt'] = f"q.all_animations_finished&&(q.is_on_ground||{UNICO})"
        for d in ('qbiqbl', 'psitzj', outro): _mudar(t, d, nao)
        _antes(t, outro, {outro: f'{UNICO}&&q.state_time>=0.3&&v.attack_time'})
    itens[nome] = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode()
    brarchive.escrever(arq, itens)
    print('golpe unico: controles camimd e pwqhcf do A&S ajustados')


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
    for arq in [ITEM] + OUTROS_GOLPE_UNICO: marcar_golpe_unico(arq)
    golpe_unico()
    print(f'martelo piglin: anexo da maca do A&S (comprimento do modelo {comp:.1f}, escala {COMPRIMENTO / comp:.3f})')


if __name__ == '__main__': main()
