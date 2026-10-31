#!/usr/bin/env python3
"""Espadas de tema sagrado, solar ou estelar de outros addons valem como a Espada Sagrada do Dark Age (pedido do João, 2026-10-31).

Uso: python ferramentas/armas_sagradas.py   (rode de novo depois de atualizar o Dark Age ou os addons das espadas)

No Dark Age Bizarre a Espada Sagrada (dk:holy_sword) não tem script: os próprios mobs conferem, no damage_sensor, se quem
bateu tem a espada na mão:
  - Cão da Praga e Pato Abominação levam 3,5x o dano, e o Pária Corrompido 5,5x;
  - o Pária morto pela espada não volta como Pária Corrompido.
Este script põe a etiqueta ap:arma_sagrada nas espadas de ESPADAS e, em cada um desses testes do Dark Age, aceita também
quem tem na mão principal um item com essa etiqueta (filtro has_equipment_tag). A Alabarda Sagrada fica como está.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from armas_niveis import sem_comentarios  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
DK_BP = os.path.join(PACKS, 'BP_DarkAgeBizarreRemake')
ETIQUETA = 'ap:arma_sagrada'
ESPADA = 'dk:holy_sword'
ESPADAS = [  # sol, estrelas, céu e luz; ficam de fora as de noite, crepúsculo e abismo
    'dungeons:suns_grace',                  # Graça do Sol
    'better_on_bedrock:stardust_sword',     # Espada Poeira Estelar
    'mnra_cata:star_sword',                 # Espada Estelar
    'mnra_cata:star_fracture',              # Fratura Estelar
    'mnra_cata:star_fallen',                # Estrela Caída
    'mnra_cata:stellar_greatsword',         # Montante Estelar
    'mnra_cata:sunlight',                   # Luz do Sol
    'mnra_cata:sun_striker_claymore',       # Golpeador Solar
    'mnra_cata:moonlight',                  # Luz da Lua
    'mnra_cata:divine_scythe_of_heaven',    # Foice Divina do Céu
]
ENTIDADES = ['plague/plague_dog.json', 'duck/abomination_duck.json', 'outcast/outcast.json', 'outcast/outcast corrupted.json']


def gravar(caminho, obj):
    with open(caminho, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def etiquetas():
    faltam, feitos = set(ESPADAS), 0
    for pack in sorted(os.listdir(PACKS)):
        if not pack.startswith('BP_'): continue
        for raiz, _, arqs in os.walk(os.path.join(PACKS, pack, 'items')):
            for a in arqs:
                if not a.endswith('.json'): continue
                cam = os.path.join(raiz, a)
                try: j = json.loads(sem_comentarios(open(cam, encoding='utf-8-sig').read()))
                except (ValueError, UnicodeDecodeError): continue
                it = j.get('minecraft:item', {})
                ident = it.get('description', {}).get('identifier')
                if ident not in faltam: continue
                faltam.discard(ident)
                tags = it.setdefault('components', {}).setdefault('minecraft:tags', {}).setdefault('tags', [])
                if ETIQUETA in tags: continue
                tags.append(ETIQUETA)
                gravar(cam, j)
                feitos += 1
    if faltam: sys.exit(f'espadas não encontradas: {", ".join(sorted(faltam))}')
    return feitos


def teste_espada(f):
    return isinstance(f, dict) and f.get('test') == 'has_equipment' and f.get('value') == ESPADA


def teste_etiqueta(negado):
    t = {'test': 'has_equipment_tag', 'subject': 'other', 'domain': 'main_hand', 'value': ETIQUETA}
    if negado: t['operator'] = '!='
    return t


def ajustar(filtro):
    """Devolve (filtro novo, trocas). Um teste da espada vira 'espada ou etiqueta'; dentro de all_of, o teste negado
    ('não tem a espada') ganha ao lado 'não tem a etiqueta'."""
    if teste_espada(filtro):
        return {'any_of': [filtro, teste_etiqueta(False)]}, 1
    if not isinstance(filtro, dict): return filtro, 0
    n = 0
    for chave in ('all_of', 'any_of', 'none_of'):
        lista = filtro.get(chave)
        if not isinstance(lista, list): continue
        nova = []
        for f in lista:
            if teste_espada(f) and f.get('operator') in ('!=', 'not'):
                nova.append(f)
                if teste_etiqueta(True) not in lista: nova.append(teste_etiqueta(True)); n += 1
            elif teste_espada(f) and chave == 'any_of':
                nova.append(f)
                if teste_etiqueta(False) not in lista: nova.append(teste_etiqueta(False)); n += 1
            else:
                f2, k = ajustar(f)
                nova.append(f2); n += k
        filtro[chave] = nova
    return filtro, n


def sensores(no):
    if isinstance(no, dict):
        for k, v in no.items():
            if k == 'minecraft:damage_sensor': yield v
            else: yield from sensores(v)
    elif isinstance(no, list):
        for v in no: yield from sensores(v)


def entidades():
    trocas = 0
    for rel in ENTIDADES:
        cam = os.path.join(DK_BP, 'entities', rel)
        j = json.loads(sem_comentarios(open(cam, encoding='utf-8-sig').read()))
        n = 0
        for sensor in sensores(j):
            gatilhos = sensor.get('triggers', [])
            for g in gatilhos if isinstance(gatilhos, list) else [gatilhos]:
                dano = g.get('on_damage')
                if isinstance(dano, dict) and 'filters' in dano:
                    dano['filters'], k = ajustar(dano['filters'])
                    n += k
        if n: gravar(cam, j)
        trocas += n
    return trocas


def main():
    print(f'armas sagradas: {etiquetas()} espadas ganharam {ETIQUETA}; {entidades()} testes do Dark Age passam a aceitar a etiqueta')


if __name__ == '__main__': main()
