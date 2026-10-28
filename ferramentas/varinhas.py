"""Varinhas do Forsaken (as 4 comuns e as 4 Tecedoras): giram só durante a conjuração e param no último estado.

Antes o item tinha use_duration igual ao tempo de conjuração; segurando o botão, o uso terminava, o feitiço saía
e o uso recomeçava sozinho, então a varinha voltava ao primeiro quadro e girava sem parar.
Agora:
  - o item tem um uso longo (USO_LONGO s), que não termina enquanto o botão estiver apertado; o cajados.js
    conjura pelo próprio timer depois de CAST_TICKS e só uma vez por toque;
  - o anexo de compatibilidade conta o tempo segurando (q.life_time desde o início do uso). Enquanto não dá o
    tempo, mostra os quadros de carga e a animação de giro; depois mostra o quadro mais brilhante (carregado) parado
    até soltar o botão (controle controller.animation.ap.varinha).
Rodar de novo não muda nada.
"""
import json, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BP = os.path.join(RAIZ, 'packs', 'BP_fo-bp-v1.19.4')
COMPAT = os.path.join(RAIZ, 'packs', 'RP_AddonPack_Compat')
USO_LONGO = 3600

dados = open(os.path.join(BP, 'scripts', 'nms', 'cajados_dados.js'), encoding='utf-8').read()
bloco = dados[dados.index('export const CAST_TICKS'):]
CAST = {k: int(v) for k, v in re.findall(r'"(ntk:\w+_wand)":\s*(\d+)', bloco[:bloco.index('};')])}


def gravar(caminho, obj):
    novo = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    if open(caminho, encoding='utf-8-sig').read() != novo:
        open(caminho, 'w', encoding='utf-8').write(novo)
        print('gravado', os.path.relpath(caminho, RAIZ))


# Controle de animação: parada, girando (carga) e pronta (carregada, parada)
estados = {
    'parada': ('3rd_person_wield', '!v.usando'),
    'girando': ('3rd_person_wield_charging', 'v.usando && !v.pronta'),
    'pronta': ('3rd_person_wield_charged', 'v.pronta'),
}
ctrl = {'format_version': '1.10.0', 'animation_controllers': {'controller.animation.ap.varinha': {
    'initial_state': 'parada',
    'states': {nome: {'animations': [anim], 'blend_transition': 0.1,
                      'transitions': [{outro: cond} for outro, (_, cond) in estados.items() if outro != nome]}
               for nome, (anim, _) in estados.items()}}}}
os.makedirs(os.path.join(COMPAT, 'animation_controllers'), exist_ok=True)
caminho = os.path.join(COMPAT, 'animation_controllers', 'ap_varinha.animation_controllers.json')
if not os.path.exists(caminho): open(caminho, 'w').write('')
gravar(caminho, ctrl)

for pasta in ('wands', 'spellweaver_wands'):
    for arq in sorted(os.listdir(os.path.join(BP, 'items', 'nms', pasta))):
        f = os.path.join(BP, 'items', 'nms', pasta, arq)
        item = json.load(open(f, encoding='utf-8-sig'))
        ident = item['minecraft:item']['description']['identifier']
        item['minecraft:item']['components']['minecraft:use_modifiers']['use_duration'] = USO_LONGO
        gravar(f, item)

        segundos = CAST[ident] / 20
        anexo = os.path.join(COMPAT, 'attachables', 'as_compat', 'ntk', ident.split(':')[1] + '.json')
        d = json.load(open(anexo, encoding='utf-8-sig'))
        desc = d['minecraft:attachable']['description']
        desc['animations']['controller_wield'] = 'controller.animation.ap.varinha'
        desc['scripts']['pre_animation'] = [
            'v.usando = q.main_hand_item_use_duration > 0.0;',
            'v.usando && !(v.usava ?? 0) ? { v.inicio = q.life_time; };',
            'v.usava = v.usando;',
            'v.carga = v.usando ? q.life_time - (v.inicio ?? q.life_time) : 0.0;',
            f'v.pronta = v.usando && v.carga >= {segundos:g};',
            f'v.charge_amount = !v.usando ? 0 : (v.pronta ? 4 : math.clamp(math.floor(v.carga * 3 / {segundos:g}) + 1, 1, 3));',
        ]
        gravar(anexo, d)
