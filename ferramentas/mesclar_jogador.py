#!/usr/bin/env python3
"""Monta o player.entity.json unico do modpack: o jogador do Actions & Stuff com o que os outros addons acrescentam.

Uso: python ferramentas/mesclar_jogador.py

Tres packs (RnR, RPG e OTG) trazem o mesmo player.entity.json, mesclado so a partir do jogador do jogo base.
Como eles ficam acima do A&S na ordem, o jogador do A&S (todas as animacoes de braco, item e corpo) era
substituido e nunca rodava. Este script parte do jogador do A&S e acrescenta so o que e de outros addons:
racas e lobisomem/morcego do RnR (escala, modelos, controles), mochila do OTG e espada nas costas do RPG,
alem do golpe das armas pesadas em terceira pessoa (ferramentas/armas_pesadas.py).
Entradas do jogo base que o A&S trocou pelas dele nao voltam. O resultado e gravado nos tres packs.
Rode de novo depois de atualizar o A&S ou um desses addons.
"""
import copy, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AS = os.path.join(RAIZ, 'packs', 'RP_ActionsAndStuff_RP')
DESTINOS = ['RP_RnR_Accursed', 'RP_RPG_Addon_v4_0_5_resource_pack', 'RP_OTG_Backpack_v1.0.8_-_Patreon_RP']
# animacoes do jogo base (o A&S ja substitui as que usa)
BASE = re.compile(r'^(controller\.)?animation\.(player|humanoid|skeleton|persona)\.')
SEM_LOBO_MORCEGO = '&&q.skin_id!=9&&q.skin_id!=13'
SEM_MORCEGO = '&&q.skin_id!=13'
# golpe das armas pesadas em terceira pessoa (ferramentas/armas_pesadas.py, no Compat)
PROPRIAS = {'ap_pesada_tp': 'controller.animation.ap.pesada_tp', 'ap_pesada_tp_golpe': 'animation.ap.pesada.tp_golpe'}


def jogador_as():
    for j in brarchive.jsons(AS, 'entity').values():
        if j.get('minecraft:client_entity', {}).get('description', {}).get('identifier') == 'minecraft:player':
            return j
    raise SystemExit('jogador do A&S nao encontrado')


def nome_rc(r): return next(iter(r)) if isinstance(r, dict) else r


def mesclar(a, outro):
    j = copy.deepcopy(a)
    d, o = j['minecraft:client_entity']['description'], outro['minecraft:client_entity']['description']
    for k in ('textures', 'geometry', 'materials'):
        for kk, vv in o.get(k, {}).items(): d[k].setdefault(kk, vv)
    extras = {k: v for k, v in o['animations'].items() if k not in d['animations'] and not BASE.match(v)}
    d['animations'].update(extras)
    s, so = d['scripts'], o['scripts']
    # animacoes extras (mochila, cauda do lobisomem, voo do morcego); o 'root' do jogo base nao volta
    for e in so.get('animate', []):
        chave = nome_rc(e)
        if chave in extras and e not in s['animate']: s['animate'].append(e)
    # escala das racas (RnR) por cima da escala do A&S
    if 'race_scale' not in s.get('scale', ''):
        s['scale'] = f"({s.get('scale', '0.9375')})*(v.race_scale??1)"
    for linha in so.get('initialize', []):
        if 'race_scale' in linha and linha not in s['initialize']: s['initialize'].append(linha)
    for linha in so.get('pre_animation', []):
        if 'v.race_scale' in linha.replace('variable.', 'v.') and 'skin_id' in linha and linha not in s['pre_animation']:
            s['pre_animation'].append(linha)
    oculta = "q.skin_id==9||q.skin_id==13?{v.helmet_layer_visible=0;v.leg_layer_visible=0;v.boot_layer_visible=0;v.chest_layer_visible=0;};"
    if oculta not in s['pre_animation']: s['pre_animation'].append(oculta)  # lobisomem/morcego sem armadura por cima
    s.setdefault('variables', {}).update({k: v for k, v in so.get('variables', {}).items() if k not in s['variables']})
    # controles de render: os do A&S, com as condicoes de forma do RnR, mais os dos outros addons
    rcs = []
    for r in d['render_controllers']:
        if isinstance(r, dict):
            n, cond = next(iter(r.items()))
            if 'skin_id' not in cond:
                if cond.startswith('!v.is_first_person') or n == 'controller.render.player.third_person_spectator': cond += SEM_LOBO_MORCEGO
                elif cond.startswith('v.is_first_person'): cond += SEM_MORCEGO
            r = {n: cond}
        rcs.append(r)
    nomes = {nome_rc(r) for r in rcs}
    for r in o.get('render_controllers', []):
        if nome_rc(r) not in nomes and not nome_rc(r).startswith('controller.render.player.'): rcs.append(r)
    d['render_controllers'] = rcs
    d['animations'].update(PROPRIAS)
    if 'ap_pesada_tp' not in s['animate']: s['animate'].append('ap_pesada_tp')
    return j


def main():
    a = jogador_as()
    outro = json.load(open(os.path.join(RAIZ, 'packs', DESTINOS[0], 'entity', 'player.entity.json'), encoding='utf-8'))
    j = mesclar(a, outro)
    texto = json.dumps(j, ensure_ascii=False, separators=(',', ':'))
    for p in DESTINOS:
        with open(os.path.join(RAIZ, 'packs', p, 'entity', 'player.entity.json'), 'w', encoding='utf-8') as f: f.write(texto)
    d = j['minecraft:client_entity']['description']
    print(f"jogador mesclado: {len(d['animations'])} animacoes, {len(d['render_controllers'])} controles de render, gravado em {len(DESTINOS)} packs")


if __name__ == '__main__': main()
