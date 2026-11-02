#!/usr/bin/env python3
"""Gera client entities mescladas de mobs para o Addon Pack Compat.

Uso: python ferramentas/mesclar_mobs.py
"""
import copy, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
AS = os.path.join(PACKS, 'RP_ActionsAndStuff')
BOB_PIG = os.path.join(PACKS, 'RP_BetterOnBedrock', 'entity', 'vanilla', 'pig.entity.json')
COMPAT_ENTITY = os.path.join(PACKS, 'RP_AddonPack_Compat', 'entity')
COMPAT_ANIMATIONS = os.path.join(PACKS, 'RP_AddonPack_Compat', 'animations', 'ap_mob_motion.animation.json')
OSSOS_MOVIMENTO = {'waist', 'body', 'head', 'rightarm', 'leftarm', 'rightleg', 'leftleg'}
VARIAVEL_CHAO = 'ap_mob_ground'
VARIAVEL_FASE = 'ap_mob_move_phase'
ANIMACOES_COMPATIVEIS = {}
MOBS_CUSTOM = (
    ('RP_AlylicasDungeons', 'entity/new/sunken_skeleton.entity.json',
     'dungeons:sunken_skeleton', 'minecraft:skeleton'),
    ('RP_AlylicasDungeons', 'entity/variant/wretched_frozen_zombie.entity.json.json',
     'dungeons:wretched_frozen_zombie', 'minecraft:zombie'),
    ('RP_AlylicasDungeons', 'entity/enchanted/new/enchanted_sunken_skeleton.json',
     'dungeons:enchanted_sunken_skeleton', 'minecraft:skeleton'),
    ('RP_AlylicasDungeons', 'entity/new/zombie_fungus_thrower.json',
     'dungeons:zombified_piglin_fungus_thrower', 'minecraft:zombie'),
    ('RP_EternalCaves', 'entity/smoldering_zombie.json',
     'panascais_caves:smoldering_zombie', 'minecraft:zombie'),
    ('RP_EternalCaves', 'entity/brood_zombie.json',
     'panascais_caves:brood_zombie', 'minecraft:zombie'),
    ('RP_EternalCaves', 'entity/weaver_skeleton.json',
     'panascais_caves:weaver_skeleton', 'minecraft:skeleton'),
    ('RP_EternalCaves', 'entity/gloom_skeleton.json',
     'panascais_caves:gloom_skeleton', 'minecraft:skeleton'),
)
ENTIDADES_VANILLA_ANTERIORES = (
    'skeleton.entity.json', 'evocation_illager.entity.json',
    'husk.entity.json', 'pillager.entity.json',
)


def entidade_as(identificador):
    for j in brarchive.jsons(AS, 'entity').values():
        if j.get('minecraft:client_entity', {}).get('description', {}).get('identifier') == identificador:
            return copy.deepcopy(j)
    raise SystemExit(f'client_entity {identificador} do A&S nao encontrado')


def entidade_bob_porco():
    with open(BOB_PIG, encoding='utf-8-sig') as f:
        j = json.load(f)
    if j.get('minecraft:client_entity', {}).get('description', {}).get('identifier') != 'minecraft:pig':
        raise ValueError('o client_entity do porco do BOB mudou')
    return j


def redirecionar_texturas(desc, aliases, texture):
    textures = desc.setdefault('textures', {})
    for alias in aliases:
        if alias not in textures:
            raise ValueError(f'alias de textura ausente: {alias}')
        textures[alias] = texture


def mesclar_pig():
    j = entidade_as('minecraft:pig')
    d = j['minecraft:client_entity']['description']
    bob = entidade_bob_porco()['minecraft:client_entity']['description']
    redirecionar_texturas(
        d, ('ptvzqj', 'qmgfyz', 'kajvqx'), 'textures/oreville/ans/czb'
    )

    materials = d.setdefault('materials', {})
    textures = d.setdefault('textures', {})
    for campo, destino, origem in (
        ('materials', materials, bob.get('materials', {})),
        ('textures', textures, bob.get('textures', {})),
    ):
        for alias in ('enchanted',):
            valor = origem.get(alias)
            if valor is None:
                raise ValueError(f'alias {campo}.{alias} ausente no BOB')
            if alias in destino and destino[alias] != valor:
                raise ValueError(f'alias {campo}.{alias} diverge entre A&S e BOB')
            destino[alias] = copy.deepcopy(valor)

    rc_enchant = next(
        (rc for rc in bob.get('render_controllers', [])
         if (next(iter(rc)) if isinstance(rc, dict) else rc) == 'controller.render.enchanted'),
        None,
    )
    if rc_enchant is None:
        raise ValueError('render controller de encantamento do porco ausente no BOB')
    controllers = d.setdefault('render_controllers', [])
    if rc_enchant not in controllers:
        controllers.append(copy.deepcopy(rc_enchant))
    return j


def mesclar_montaria(identificador, aliases, texture):
    j = entidade_as(identificador)
    redirecionar_texturas(j['minecraft:client_entity']['description'], aliases, texture)
    return j


def entidade_addon(pack, caminho_relativo, identificador):
    caminho = os.path.join(PACKS, pack, caminho_relativo)
    with open(caminho, encoding='utf-8-sig') as f:
        j = json.load(f)
    if j.get('minecraft:client_entity', {}).get('description', {}).get('identifier') != identificador:
        raise ValueError(f'client_entity {identificador} inesperado em {caminho}')
    return j


def animacao_as(identificador):
    for j in brarchive.jsons(AS, 'animations').values():
        if identificador in j.get('animations', {}):
            return copy.deepcopy(j['animations'][identificador])
    raise KeyError(f'animacao do A&S nao encontrada: {identificador}')


def carregar_geometrias(pack):
    pasta = os.path.join(PACKS, pack, 'models')
    geometrias = {}
    for raiz, _, arquivos in os.walk(pasta):
        for arquivo in arquivos:
            if not arquivo.endswith('.json'):
                continue
            caminho = os.path.join(raiz, arquivo)
            try:
                with open(caminho, encoding='utf-8-sig') as f:
                    j = json.load(f)
            except (UnicodeError, json.JSONDecodeError):
                continue
            listas = j.get('minecraft:geometry', []) if isinstance(j, dict) else []
            if isinstance(listas, dict):
                listas = [listas]
            for geometria in listas:
                if not isinstance(geometria, dict):
                    continue
                ident = geometria.get('description', {}).get('identifier')
                ossos = {b.get('name') for b in geometria.get('bones', []) if isinstance(b, dict)}
                if ident and ossos:
                    if ident in geometrias and geometrias[ident] != ossos:
                        raise ValueError(f'geometria ambigua {ident} em {pack}')
                    geometrias[ident] = ossos
            for ident, geometria in j.items() if isinstance(j, dict) else ():
                if not (isinstance(ident, str) and ident.startswith('geometry.')
                        and isinstance(geometria, dict)):
                    continue
                ossos = {b.get('name') for b in geometria.get('bones', []) if isinstance(b, dict)}
                if ossos:
                    if ident in geometrias and geometrias[ident] != ossos:
                        raise ValueError(f'geometria ambigua {ident} em {pack}')
                    geometrias[ident] = ossos
    return geometrias


def ossos_do_rig(desc, geometrias, identificador):
    slots = desc.get('geometry', {})
    if not isinstance(slots, dict) or not slots:
        raise ValueError(f'geometria ausente em {identificador}')
    mapas = []
    for slot, geo_id in slots.items():
        nomes = geometrias.get(geo_id)
        if nomes is None:
            raise ValueError(f'geometria {geo_id} de {identificador} nao encontrada')
        mapa = {str(nome).lower(): nome for nome in nomes}
        if not OSSOS_MOVIMENTO <= mapa.keys():
            raise ValueError(f'rig {geo_id} de {identificador} nao e humanoide compativel')
        mapas.append((slot, mapa))
    primeiro = mapas[0][1]
    for slot, mapa in mapas[1:]:
        if any(mapa[osso] != primeiro[osso] for osso in OSSOS_MOVIMENTO):
            raise ValueError(f'geometrias de {identificador} divergem no rig humanoide ({slot})')
    return primeiro


def adicionar_movimento_custom(pack, caminho_relativo, identificador, tipo_as, geometrias_cache):
    j = entidade_addon(pack, caminho_relativo, identificador)
    d = j['minecraft:client_entity']['description']
    if pack not in geometrias_cache:
        geometrias_cache[pack] = carregar_geometrias(pack)
    ossos_rig = ossos_do_rig(d, geometrias_cache[pack], identificador)
    as_desc = entidade_as(tipo_as)['minecraft:client_entity']['description']
    fonte = as_desc.get('animations', {}).get('move')
    if not isinstance(fonte, str) or not fonte.startswith('animation.'):
        raise ValueError(f'animacao de movimento do A&S para {tipo_as} nao e direta')

    animacao = animacao_as(fonte)
    ossos = animacao.get('bones', {})
    compativeis = {
        ossos_rig[nome.lower()]: valor
        for nome, valor in ossos.items()
        if nome.lower() in OSSOS_MOVIMENTO
    }
    if not OSSOS_MOVIMENTO <= {nome.lower() for nome in compativeis}:
        raise ValueError(f'animacao {fonte} nao cobre todos os ossos do rig humanoide')
    animacao['bones'] = compativeis

    texto = json.dumps(animacao, ensure_ascii=False)
    texto = (texto
             .replace('v.cprttl', f'v.{VARIAVEL_CHAO}')
             .replace('v.cdrzno', 'q.is_baby')
             .replace('v.lzghwo', f'v.{VARIAVEL_FASE}'))
    animacao = json.loads(texto)
    variaveis = set(re.findall(r'(?<![A-Za-z0-9_])v\.([A-Za-z0-9_]+)', json.dumps(animacao)))
    if variaveis - {VARIAVEL_CHAO, VARIAVEL_FASE}:
        raise ValueError(f'animacao {fonte} depende de variaveis A&S nao migradas: {sorted(variaveis)}')

    alias_destino = 'move'
    animacoes = d.setdefault('animations', {})
    if alias_destino not in animacoes:
        raise ValueError(f'alias move ausente em {identificador}')
    nome = identificador.replace(':', '_').replace('.', '_')
    novo_id = f'animation.ap_addon_pack.mob_motion.{nome}'
    animacoes[alias_destino] = novo_id
    if novo_id in ANIMACOES_COMPATIVEIS and ANIMACOES_COMPATIVEIS[novo_id] != animacao:
        raise ValueError(f'id de animacao duplicado: {novo_id}')
    ANIMACOES_COMPATIVEIS[novo_id] = animacao

    scripts = d.setdefault('scripts', {})
    inicializacao = scripts.setdefault('initialize', [])
    pre_animacao = scripts.setdefault('pre_animation', [])
    if not isinstance(inicializacao, list) or not isinstance(pre_animacao, list):
        raise ValueError(f'scripts de {identificador} nao usam listas para initialize/pre_animation')
    linha_inicializacao = f'v.{VARIAVEL_CHAO}=0;'
    linha_inicializacao_fase = f'v.{VARIAVEL_FASE}=0;'
    linha_pre_animacao = f'v.{VARIAVEL_CHAO}=Math.lerp(v.{VARIAVEL_CHAO},q.is_on_ground,0.2);'
    if linha_inicializacao not in inicializacao:
        inicializacao.append(linha_inicializacao)
    if linha_inicializacao_fase not in inicializacao:
        inicializacao.append(linha_inicializacao_fase)
    if linha_pre_animacao not in pre_animacao:
        pre_animacao.append(linha_pre_animacao)
    return j


def salvar(nome, j):
    caminho = os.path.join(COMPAT_ENTITY, nome + '.entity.json')
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f:
        f.write(json.dumps(j, ensure_ascii=False, separators=(',', ':')))


def main():
    ANIMACOES_COMPATIVEIS.clear()
    creeper = entidade_as('minecraft:creeper')
    pig = mesclar_pig()
    mule = mesclar_montaria(
        'minecraft:mule', ('default', 'vqwcqf'), 'textures/oreville/ans/bto'
    )
    donkey = mesclar_montaria(
        'minecraft:donkey', ('default', 'shazdg'), 'textures/oreville/ans/bul'
    )
    for nome, j in (
        ('creeper', creeper),
        ('pig', pig),
        ('mule', mule),
        ('donkey', donkey),
    ):
        salvar(nome, j)
        d = j['minecraft:client_entity']['description']
        print(f'{nome}: {len(d.get("animations", {}))} animacoes, {len(d.get("textures", {}))} texturas')

    geometrias_cache = {}
    for pack, caminho, identificador, tipo_as in MOBS_CUSTOM:
        j = adicionar_movimento_custom(
            pack, caminho, identificador, tipo_as, geometrias_cache
        )
        nome = identificador.replace(':', '_').replace('.', '_')
        salvar(nome, j)
        print(f'{identificador}: movimento A&S compatível')

    for nome in ENTIDADES_VANILLA_ANTERIORES:
        caminho = os.path.join(COMPAT_ENTITY, nome)
        if os.path.isfile(caminho):
            os.remove(caminho)

    os.makedirs(os.path.dirname(COMPAT_ANIMATIONS), exist_ok=True)
    with open(COMPAT_ANIMATIONS, 'w', encoding='utf-8') as f:
        f.write(json.dumps({'format_version': '1.8.0', 'animations': ANIMACOES_COMPATIVEIS},
                           ensure_ascii=False, separators=(',', ':')))
    print(f'{len(ANIMACOES_COMPATIVEIS)} animacoes de movimento compativeis gravadas no Compat')


if __name__ == '__main__':
    main()
