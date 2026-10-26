#!/usr/bin/env python3
"""Monta o player.entity.json unico do modpack: o jogador do Actions & Stuff com o que os outros addons acrescentam.

Uso: python ferramentas/mesclar_jogador.py

RnR, RPG e OTG trazem cada um o proprio player.entity.json (feito a partir do jogador do jogo base). Como eles
ficam acima do A&S na ordem, o jogador do A&S (todas as animacoes de braco, item e corpo) era substituido e nunca
rodava. Este script parte do jogador do A&S e acrescenta so o que e de outros addons: racas e lobisomem/morcego do
RnR (escala, modelos, controles), mochila do OTG e espada nas costas do RPG. Entradas do jogo base que o A&S trocou
pelas dele nao voltam.
O resultado vai so para o Addon Pack Compat, que fica acima dos tres e so e usado junto com o A&S. Os tres packs
ficam com o jogador original de cada um (o do RnR com a raca em skin_id, como no BP), para funcionarem sozinhos:
um jogador que cita modelos do A&S ou de outro addon ausente fica invisivel.
Rode de novo depois de atualizar o A&S ou um desses addons.
"""
import copy, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AS = os.path.join(RAIZ, 'packs', 'RP_ActionsAndStuff_RP')
ORIGINAIS = '91bb9dc23'  # commit 'Packs originais extraidos (sem alteracoes do modpack)'
FONTES = ['RP_RnR_Accursed', 'RP_OTG_Backpack_v1.0.8_-_Patreon_RP', 'RP_RPG_Addon_v4_0_5_resource_pack']
DESTINO = 'RP_AddonPack_Compat'
# raca do RnR: o BP usa minecraft:skin_id (o variant e da mochila do OTG); o RP original lia query.variant
VARIANT = re.compile(r'\b(query|q)\.variant\b')
# animacoes do jogo base (o A&S ja substitui as que usa)
BASE = re.compile(r'^(controller\.)?animation\.(player|humanoid|skeleton|persona)\.')
SEM_LOBO_MORCEGO = '&&q.skin_id!=9&&q.skin_id!=13'
SEM_MORCEGO = '&&q.skin_id!=13'


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
    return j


def jogador_original(pack):
    """player.entity.json original do pack (do commit dos packs originais), com a raca do RnR em skin_id."""
    caminho = f'packs/{pack}/entity/player.entity.json'
    texto = subprocess.run(['git', 'show', f'{ORIGINAIS}:{caminho}'], cwd=RAIZ, capture_output=True, text=True, encoding='utf-8', check=True).stdout
    if pack == 'RP_RnR_Accursed': texto = VARIANT.sub(lambda m: m.group(1) + '.skin_id', texto)
    return json.loads(texto)


def liberar_skins(j):
    """Versao minima 1.8.0 no jogador: com outra versao (ou sem ela) o jogo troca as skins do Criador de Personagem e
    as importadas pela do Steve e esconde as capas; as skins classicas continuam (bug MCPE-74493)."""
    d = j['minecraft:client_entity']['description']
    d.pop('min_engine_version', None)
    novo = {'identifier': d.pop('identifier'), 'min_engine_version': '1.8.0'}
    novo.update(d)
    j['minecraft:client_entity']['description'] = novo
    return j


def gravar(pack, j):
    liberar_skins(j)
    os.makedirs(os.path.join(RAIZ, 'packs', pack, 'entity'), exist_ok=True)
    with open(os.path.join(RAIZ, 'packs', pack, 'entity', 'player.entity.json'), 'w', encoding='utf-8') as f:
        f.write(json.dumps(j, ensure_ascii=False, separators=(',', ':')))


def main():
    j = jogador_as()
    for p in FONTES:
        o = jogador_original(p)
        gravar(p, o)
        j = mesclar(j, o)
    gravar(DESTINO, j)
    d = j['minecraft:client_entity']['description']
    print(f"jogador mesclado: {len(d['animations'])} animacoes, {len(d['render_controllers'])} controles de render, gravado em {DESTINO}; "
          f"{len(FONTES)} packs com o jogador original")


if __name__ == '__main__': main()
