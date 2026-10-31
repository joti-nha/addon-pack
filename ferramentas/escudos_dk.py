#!/usr/bin/env python3
"""Escudos do Dark Age (Escudo da Sentinela e Escudo do Desossado) como escudos do A&S (pedido do João, 2026-10-31).

Uso: python ferramentas/escudos_dk.py   (depois do enxugar_ans.py ao atualizar o A&S, e depois do mesclar_jogador.py)

O Dark Age desenha os escudos com as animações de escudo do jogo base, que não combinam com o braço do A&S: na mão
principal o escudo ficava cortado na borda direita da tela. E como escudo de addon não liga o q.blocking (só o
escudo do jogo base liga), o Dark Age defendia ao agachar e tocava pelo script, a cada tick, três animações no mesmo
controle "shield", uma trocando a outra: era isso que fazia o braço piscar ao defender.

Este script:
  - copia o anexo do escudo do A&S (minecraft:shield) para os dois escudos, com o modelo e a textura do Dark Age,
    no Addon Pack Compat (attachables/as_compat/dk). O modelo do Dark Age já segue o do escudo do jogo base; aqui o
    pivô e a placa vão para o mesmo lugar do escudo do jogo base (geometry.ap.dk.* em models/entity/ap_dk_escudos.geo.json);
  - põe nos itens as etiquetas oreville:is_shield (o A&S trata como escudo ao segurar e trocar de item) e
    ap:escudo_agachar (escudo que defende ao agachar, pelo script do Dark Age);
  - troca q.blocking nos controles, animações e no jogador do A&S (e no jogador mesclado do Compat) por
    "q.blocking ou agachado com um escudo ap:escudo_agachar", para o A&S tocar as próprias poses de defesa.
O script do Dark Age (BP_DarkAgeBizarreRemake/scripts/main.js) não toca mais as animações de defesa.
"""
import glob, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402
from anexos_cataclysm import AS, COMPAT, PACKS, gravar, id_anexo  # noqa: E402

DK_RP = os.path.join(PACKS, 'RP_DarkAgeBizarreRemake')
DK_BP = os.path.join(PACKS, 'BP_DarkAgeBizarreRemake')
ESCUDOS = {  # item -> (modelo do Dark Age, textura do Dark Age)
    'dk:sentinel_shield': ('geometry.sentinel_shield', 'textures/entity/mobs/sentinel/sentinel_soldier'),
    'dk:unboned_shield': ('geometry.unboned_shield', 'textures/entity/mobs/unbound_elemental/unboned'),
}
ETIQUETAS = ['oreville:is_shield', 'ap:escudo_agachar']
# escudo do jogo base (geometry.shield): pivô [1, 15.5, 3], placa 12x22 com o meio em x 1, y 28 e o verso em z 0
PIVO = [1, 15.5, 3]
MEIO_PLACA = (1, 28, 0)
AGACHAR = "q.equipped_item_any_tag('slot.weapon.{}','ap:escudo_agachar')"
BLOQ = f"(q.blocking||q.is_sneaking&&({AGACHAR.format('mainhand')}||{AGACHAR.format('offhand')}))"
Q_BLOQ = re.compile(r'\b(?:q|query)\.blocking\b')


def geometrias_dk():
    res = {}
    for arq in glob.glob(os.path.join(DK_RP, 'models', '**', '*.json'), recursive=True):
        try: j = json.load(open(arq, encoding='utf-8-sig'))
        except ValueError: continue
        for g in j.get('minecraft:geometry', []) if isinstance(j, dict) else []: res[g['description']['identifier']] = g
    return res


def geometria(g, ident):
    """Modelo do Dark Age com o pivô e a placa no lugar dos do escudo do jogo base (as animações do A&S contam com eles)."""
    g = json.loads(json.dumps(g))
    g['description']['identifier'] = ident
    (osso,) = g['bones']
    placa = [c for c in osso['cubes'] if not c.get('rotation') and c['size'][2] <= 2]
    x0 = min(c['origin'][0] for c in placa); x1 = max(c['origin'][0] + c['size'][0] for c in placa)
    y0 = min(c['origin'][1] for c in placa); y1 = max(c['origin'][1] + c['size'][1] for c in placa)
    z1 = max(c['origin'][2] + c['size'][2] for c in placa)
    d = (MEIO_PLACA[0] - (x0 + x1) / 2, MEIO_PLACA[1] - (y0 + y1) / 2, MEIO_PLACA[2] - z1)
    for c in osso['cubes']:
        c['origin'] = [a + b for a, b in zip(c['origin'], d)]
        if 'pivot' in c: c['pivot'] = [a + b for a, b in zip(c['pivot'], d)]
    osso['pivot'] = PIVO
    return g


def anexo(molde, item, geo, tex):
    a = json.loads(json.dumps(molde))
    d = a['minecraft:attachable']['description']
    d['identifier'] = id_anexo(item)
    d['item'] = {item: 'c.owning_entity -> v.actions_and_stuff;'}
    d['geometry'] = {'default': geo}
    d['textures'] = {'default': tex, 'enchanted': 'textures/misc/enchanted_item_glint'}
    d['materials'] = {'default': 'entity_alphatest', 'enchanted': 'entity_alphatest_glint'}
    d['render_controllers'] = ['controller.render.item_default']
    return a


def etiquetas():
    feitos = 0
    for arq in glob.glob(os.path.join(DK_BP, 'items', '**', '*.json'), recursive=True):
        texto = open(arq, encoding='utf-8').read()
        j = json.loads(texto)
        if j['minecraft:item']['description']['identifier'] not in ESCUDOS: continue
        tags = j['minecraft:item']['components'].setdefault('minecraft:tags', {}).setdefault('tags', [])
        falta = [t for t in ETIQUETAS if t not in tags]
        if falta:
            tags += falta
            with open(arq, 'w', encoding='utf-8') as f: f.write(json.dumps(j, ensure_ascii=False, separators=(',', ':')))
            feitos += 1
    return feitos


def bloqueio_ans():
    """Agachar com um escudo ap:escudo_agachar conta como defender para o A&S."""
    trocas = 0
    for pasta in ('animation_controllers', 'animations', 'entity'):
        arq = os.path.join(AS, '__brarchive', pasta + '.brarchive')
        itens, mudou = brarchive.ler(arq), False
        for nome, dados in itens.items():
            if not dados: continue
            s = dados.decode('utf-8')
            if 'ap:escudo_agachar' in s or not Q_BLOQ.search(s): continue
            s, n = Q_BLOQ.subn(BLOQ, s)
            json.loads(s)
            itens[nome], mudou, trocas = s.encode('utf-8'), True, trocas + n
        if mudou: brarchive.escrever(arq, itens)
    jog = os.path.join(COMPAT, 'entity', 'player.entity.json')
    s = open(jog, encoding='utf-8').read()
    if 'ap:escudo_agachar' not in s and Q_BLOQ.search(s):
        s, n = Q_BLOQ.subn(BLOQ, s)
        json.loads(s)
        with open(jog, 'w', encoding='utf-8') as f: f.write(s)
        trocas += n
    return trocas


def main():
    molde = brarchive.anexo(AS, 'minecraft:shield')
    geos, novas = geometrias_dk(), []
    for item, (geo, tex) in ESCUDOS.items():
        nome = item.split(':')[1]
        ident = 'geometry.ap.dk.' + nome
        novas.append(geometria(geos[geo], ident))
        gravar(os.path.join(COMPAT, 'attachables', 'as_compat', 'dk', nome + '.json'), anexo(molde, item, ident, tex))
    gravar(os.path.join(COMPAT, 'models', 'entity', 'ap_dk_escudos.geo.json'),
           {'format_version': '1.16.0', 'minecraft:geometry': novas})
    print(f'escudos: {len(ESCUDOS)} anexos do A&S, {etiquetas()} itens com etiquetas novas, '
          f'{bloqueio_ans()} trocas de q.blocking no A&S e no jogador mesclado')


if __name__ == '__main__': main()
