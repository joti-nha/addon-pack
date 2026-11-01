#!/usr/bin/env python3
"""Gera o client_entity do zumbi com as animações do Actions & Stuff e as variantes do Better on Bedrock.

Uso: python ferramentas/mesclar_zumbi.py

Os dois resource packs definem minecraft:zombie. Como o pack de maior prioridade substitui a definição
inteira, o Addon Pack Compat precisa reunir as animações do A&S e os recursos de clima/encantamento do BOB.
Rode novamente depois de atualizar qualquer um desses addons.
"""
import copy, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AS = os.path.join(RAIZ, 'packs', 'RP_ActionsAndStuff')
BOB = os.path.join(RAIZ, 'packs', 'RP_BetterOnBedrock')
DESTINO = os.path.join(RAIZ, 'packs', 'RP_AddonPack_Compat', 'entity', 'zombie.entity.json')


def zombie_as():
    for j in brarchive.jsons(AS, 'entity').values():
        if j.get('minecraft:client_entity', {}).get('description', {}).get('identifier') == 'minecraft:zombie':
            return j
    raise SystemExit('client_entity minecraft:zombie do A&S nao encontrado')


def nome_rc(rc): return next(iter(rc)) if isinstance(rc, dict) else rc


def mesclar(a, b):
    j = copy.deepcopy(a)
    d = j['minecraft:client_entity']['description']
    outro = b['minecraft:client_entity']['description']
    scripts, scripts_outro = d.setdefault('scripts', {}), outro.get('scripts', {})

    for key in ('textures', 'geometry', 'materials', 'animations'):
        destino = d.setdefault(key, {})
        for alias, valor in outro.get(key, {}).items():
            if alias in destino and destino[alias] != valor:
                raise ValueError(f'alias {key}.{alias} diverge entre A&S e Better on Bedrock')
            destino[alias] = copy.deepcopy(valor)

    for key in ('animate', 'initialize', 'pre_animation'):
        destino = scripts.setdefault(key, [])
        for linha in scripts_outro.get(key, []):
            if linha not in destino: destino.append(copy.deepcopy(linha))

    variaveis = scripts.setdefault('variables', {})
    for nome, valor in scripts_outro.get('variables', {}).items():
        if nome in variaveis and variaveis[nome] != valor:
            raise ValueError(f'variavel {nome} diverge entre A&S e Better on Bedrock')
        variaveis[nome] = copy.deepcopy(valor)

    scripts['scale'] = scripts_outro.get('scale', scripts.get('scale', '1.0'))
    if 'should_update_bones_and_effects_offscreen' in scripts_outro:
        scripts['should_update_bones_and_effects_offscreen'] = scripts_outro['should_update_bones_and_effects_offscreen']

    controladores = d.setdefault('render_controllers', [])
    for indice, rc in enumerate(controladores):
        nome = nome_rc(rc)
        if nome == 'controller.render.oreville_ans.bkmptz':
            condicao = next(iter(rc.values())) if isinstance(rc, dict) else '1'
            controladores[indice] = {nome: f'({condicao})&&v.index==0'}
    nomes = {nome_rc(rc): rc for rc in controladores}
    for rc in outro.get('render_controllers', []):
        nome = nome_rc(rc)
        if nome == 'controller.render.zombie': rc = {nome: 'v.index!=0'}
        if nome in nomes and nomes[nome] != rc:
            raise ValueError(f'render controller {nome} diverge entre A&S e Better on Bedrock')
        if nome not in nomes:
            controladores.append(copy.deepcopy(rc)); nomes[nome] = rc

    j['format_version'] = b.get('format_version', j.get('format_version'))
    return j


def main():
    caminho_bob = os.path.join(BOB, 'entity', 'vanilla', 'zombie.entity.json')
    with open(caminho_bob, encoding='utf-8-sig') as f: bob = json.load(f)
    resultado = mesclar(zombie_as(), bob)
    os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
    with open(DESTINO, 'w', encoding='utf-8') as f:
        f.write(json.dumps(resultado, ensure_ascii=False, separators=(',', ':')))
    d = resultado['minecraft:client_entity']['description']
    print(f'zumbi mesclado: {len(d["animations"])} animacoes, {len(d["render_controllers"])} controles de render, gravado em RP_AddonPack_Compat')


if __name__ == '__main__': main()