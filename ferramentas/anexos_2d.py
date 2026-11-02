#!/usr/bin/env python3
"""Anexos e animacoes do Actions & Stuff para itens e blocos de addons.

Sem anexo, o A&S desenha o item com a pose generica. Para itens sem anexo, este script copia o anexo do A&S do molde
certo e troca so o modelo e a textura:
  - bloco de cubo inteiro: molde minecraft:dirt (segurar bloco); o modelo e um cubo com as texturas do bloco;
  - item arremessavel (minecraft:throwable): molde minecraft:snowball;
  - comida e bebida: molde minecraft:apple (comer);
  - espada, machado, picareta, pa, enxada (etiquetas minecraft:is_* ou oreville:is_*): molde do item de ferro, com o
    icone na diagonal como no modo 2D do A&S (mesmo jeito das armas do Cataclysmical);
  - o resto: molde minecraft:feather (pose comum, item de pe).
O icone vira um modelo de faixas de 1 pixel (uma por trecho continuo de cada linha), que aparece na mao; a malha plana
texture_meshes nao aparece (ver modpack-armas-anexos). Anexos existentes de comidas e itens arremessaveis recebem
apenas as animacoes de uso do A&S, mantendo geometria, texturas, scripts e renderizadores originais.
Quando a geometria nao tem o osso `item` usado pelo A&S, o Compat adiciona um osso-pai neutro sem alterar a pose.
Ficam de fora da geracao 2D: armaduras e itens vestiveis, arcos/bestas/escudos e o que tem animacao de uso propria,
blocos escondidos do inventario e blocos com modelo proprio (nao cubo).
Os anexos so valem com o A&S ativo (campo "item"), como os do Cataclysmical. Item com o mesmo nome de uma entidade
(peixes, flechas, Boneco de Treino) ganha '.ap' no identificador do anexo: com o nome igual, o anexo toma o lugar da
entidade no mundo.

Grava em packs/RP_AddonPack_Compat: attachables/as_2d/<namespace>/, models/entity/ap_2d_*.geo.json e
textures/ap/blocos/ (texturas de blocos com faces diferentes). Rode de novo depois de atualizar um addon ou o A&S.
"""
import copy, glob, json, math, os, re, shutil, sys
from collections import Counter, defaultdict
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402
import anexos_cataclysm as cata  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
AS = os.path.join(PACKS, 'RP_ActionsAndStuff')
COMPAT = os.path.join(PACKS, 'RP_AddonPack_Compat')
SAIDA = os.path.join(COMPAT, 'attachables', 'as_2d')
TEX_BLOCOS = os.path.join(COMPAT, 'textures', 'ap', 'blocos')

FERRAMENTAS = [  # etiqueta -> molde (em ordem de prioridade)
    (('minecraft:is_sword', 'oreville:is_sword'), 'minecraft:iron_sword'),
    (('minecraft:is_axe', 'oreville:is_axe'), 'minecraft:iron_axe'),
    (('minecraft:is_pickaxe', 'oreville:is_pickaxe'), 'minecraft:iron_pickaxe'),
    (('minecraft:is_shovel', 'oreville:is_shovel'), 'minecraft:iron_shovel'),
    (('minecraft:is_hoe', 'oreville:is_hoe'), 'minecraft:iron_hoe'),
]
MOLDE = {'bloco': 'minecraft:dirt', 'arremesso': 'minecraft:snowball', 'comida': 'minecraft:apple', 'item': 'minecraft:feather'}
ALTURA = {'arremesso': 8, 'comida': 9, 'item': 12}  # altura do icone na mao, em pixels do modelo
FORA = ('minecraft:wearable', 'minecraft:armor', 'minecraft:shooter', 'minecraft:chargeable', 'minecraft:record',
        'minecraft:dyeable', 'minecraft:enchantable_slot_armor')
ANIM_FORA = {'bow', 'crossbow', 'spear', 'block', 'brush', 'spyglass', 'toot_horn', 'camera'}
FACES = ('north', 'south', 'east', 'west', 'up', 'down')


def ler(p):
    t = open(p, encoding='utf-8-sig').read()
    try: return json.loads(t)
    except ValueError:
        t = re.sub(r'(?<!:)//[^\n]*', '', t)
        t = re.sub(r',\s*([}\]])', r'\1', t)
        return json.loads(t)


def gravar(p, obj):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def tentar(p):
    try: return ler(p)
    except (ValueError, UnicodeDecodeError): return None


# ---------- o que ja existe ----------

def anexos_existentes():
    anexos = {}
    for p in sorted(glob.glob(os.path.join(PACKS, 'RP_*', 'attachables', '**', '*.json'), recursive=True)):
        if p.startswith(SAIDA): continue
        j = tentar(p)
        try: d = j['minecraft:attachable']['description']
        except (TypeError, KeyError): continue
        anexos.setdefault(d['identifier'], j)
        itens = d.get('item') or {}
        if not isinstance(itens, dict):
            raise ValueError(f'{p}: description.item nao e um objeto')
        for ident in itens:
            anexos.setdefault(ident, j)
    return anexos


def indice_texturas(arquivo):
    """Nome do atlas -> caminho, juntando todos os RPs (item_texture.json ou terrain_texture.json)."""
    res = {}
    for p in sorted(glob.glob(os.path.join(PACKS, 'RP_*', 'textures', arquivo))):
        j = tentar(p)
        if not j: continue
        for k, v in j.get('texture_data', {}).items():
            t = v.get('textures') if isinstance(v, dict) else v
            if isinstance(t, list): t = t[0] if t else None
            if isinstance(t, dict): t = t.get('path')
            if isinstance(t, str): res.setdefault(k, t)
    return res


def blocks_json():
    res = {}
    for p in glob.glob(os.path.join(PACKS, 'RP_*', 'blocks.json')):
        j = tentar(p) or {}
        for k, v in j.items():
            if isinstance(v, dict) and 'textures' in v: res.setdefault(k, v['textures'])
    return res


_imgs = {}


def imagem(caminho):
    """Abre a textura (png ou tga) procurando em todos os RPs."""
    if caminho in _imgs: return _imgs[caminho]
    img = None
    for rp in sorted(glob.glob(os.path.join(PACKS, 'RP_*'))):
        for ext in ('.png', '.tga'):
            p = os.path.join(rp, caminho + ext)
            if os.path.exists(p):
                try: img = Image.open(p).convert('RGBA')
                except OSError: img = None
                break
        if img: break
    _imgs[caminho] = img
    return img


# ---------- modelos ----------

def faixas(img, quadro_alt):
    """Trechos continuos de pixels visiveis em cada linha do primeiro quadro: (x0, y, largura), numa grade de no
    maximo 16x16 (icones HD viram blocos de k x k pixels, para o modelo nao ter milhares de cubos)."""
    k = max(1, img.width // 16)
    px, res = img.load(), []
    lin, col = quadro_alt // k, img.width // k

    def cheio(cx, cy):
        return any(px[cx * k + i, cy * k + j][3] >= 20 for i in range(k) for j in range(k))
    for y in range(lin):
        x = 0
        while x < col:
            if not cheio(x, y): x += 1; continue
            x0 = x
            while x < col and cheio(x, y): x += 1
            res.append((x0 * k, y * k, (x - x0) * k))
    return res, k


def cubo_faixa(x0, y, w, ox, oy, s, z0, k=1):
    """Faixa de pixels como cubo (frente e costas com o trecho, laterais com o pixel da ponta). x0, y e w em pixels
    da textura; s = tamanho de um pixel no modelo; k = altura da faixa em pixels."""
    def f(u, v, du, dv): return {'uv': [u, v], 'uv_size': [du, dv]}
    return {'origin': [round(ox, 4), round(oy, 4), round(z0, 4)], 'size': [round(w * s, 4), round(k * s, 4), round(k * s, 4)],
            'uv': {'north': f(x0 + w, y, -w, k), 'south': f(x0, y, w, k), 'up': f(x0, y, w, k), 'down': f(x0, y, w, k),
                   'east': f(x0 + w - k, y, k, k), 'west': f(x0, y, k, k)}}


def esqueleto_molde(geo):
    """Ossos do molde sem cubos e o osso que recebe o modelo (o que tinha mais cubos)."""
    alvo = max(geo['bones'], key=lambda b: len(b.get('cubes', [])))
    cubos = [c for b in geo['bones'] for c in b.get('cubes', [])]
    mn = [min(c['origin'][k] for c in cubos) for k in range(3)] if cubos else [-4, 0, -4]
    mx = [max(c['origin'][k] + c['size'][k] for c in cubos) for k in range(3)] if cubos else [4, 8, 4]
    ossos = [{k: copy.deepcopy(v) for k, v in b.items() if k not in ('cubes', 'texture_meshes', 'locators', 'poly_mesh')}
             for b in geo['bones']]
    return ossos, alvo['name'], mn, mx


def geo_icone_de_pe(ident, molde_geo, img, quadro_alt, altura):
    ossos, alvo, mn, mx = esqueleto_molde(molde_geo)
    s = altura / quadro_alt
    cx = (mn[0] + mx[0]) / 2
    fx, k = faixas(img, quadro_alt)
    cubos = [cubo_faixa(x0, y, w, cx - img.width * s / 2 + x0 * s, mn[1] + (quadro_alt - k - y) * s, s, -k * s / 2, k)
             for x0, y, w in fx]
    for b in ossos:
        if b['name'] == alvo: b['cubes'] = cubos
    return {'description': {'identifier': ident, 'texture_width': img.width, 'texture_height': img.height,
                            'visible_bounds_width': 3, 'visible_bounds_height': 3, 'visible_bounds_offset': [0, 1, 0]},
            'bones': ossos}


def geo_icone_diagonal(ident, molde_geo, img, quadro_alt):
    """Ferramentas: icone na diagonal, com o canto do cabo (baixo a esquerda) no pomo, como cata.geo_icone."""
    pele, preso = cata.esqueleto(molde_geo)
    s = 16 / img.width
    fx, k = faixas(img, quadro_alt)
    base = min((x0 + (quadro_alt - k - y)) * s for x0, y, _ in fx)
    desl = cata.POMO[1] * math.sqrt(2) / 2 - base / 2
    cubos = [cubo_faixa(x0, y, w, x0 * s + desl, (quadro_alt - k - y) * s + desl, s, -k * s / 2, k) for x0, y, w in fx]
    return {'description': {'identifier': ident, 'texture_width': img.width, 'texture_height': img.height,
                            'visible_bounds_width': 3, 'visible_bounds_height': 3, 'visible_bounds_offset': [0, 1, 0]},
            'bones': pele + [{'name': 'ap_arma', 'parent': preso, 'pivot': [0, 0, 0], 'rotation': [0, 0, -45], 'cubes': cubos}]}


def geo_cubo(ident, molde_geo, colunas, quadros):
    """Cubo de bloco; com 1 coluna todas as faces usam a mesma textura, com 6 colunas cada face usa a sua."""
    ossos, alvo, mn, mx = esqueleto_molde(molde_geo)
    uv = {f: {'uv': [16 * (i if colunas == 6 else 0), 0], 'uv_size': [16, 16]} for i, f in enumerate(FACES)}
    for b in ossos:
        if b['name'] == alvo: b['cubes'] = [{'origin': mn, 'size': [mx[k] - mn[k] for k in range(3)], 'uv': uv}]
    return {'description': {'identifier': ident, 'texture_width': 16 * colunas, 'texture_height': 16 * quadros,
                            'visible_bounds_width': 2, 'visible_bounds_height': 2, 'visible_bounds_offset': [0, 0.5, 0]},
            'bones': ossos}


def so_na_mao(lista):
    """Tira do molde as linhas que so valem fora da mao (bioma do item solto: o anexo so aparece na mao) e as que
    so zeram variaveis (no Molang variavel nao definida ja vale 0)."""
    return [x for x in lista if not (isinstance(x, str) and ('entity_biome_has_any_identifier' in x or re.fullmatch(r'v\.[\w.]+=0;', x)))]


def anexo(molde, ident, geo, tex):
    a = copy.deepcopy(molde)
    d = a['minecraft:attachable']['description']
    for k in ('initialize', 'pre_animation'):
        if k in d['scripts']: d['scripts'][k] = so_na_mao(d['scripts'][k])
    d['identifier'] = cata.id_anexo(ident)
    d['item'] = {ident: 'c.owning_entity -> v.actions_and_stuff;'}
    d['geometry'] = {'default': geo}
    d['textures'] = {'default': tex, 'enchanted': 'textures/misc/enchanted_item_glint'}
    d['materials'] = {'default': 'entity_alphatest', 'enchanted': 'entity_alphatest_glint'}
    d['render_controllers'] = ['controller.render.ap.as_item']
    return a


def anexo_com_animacao(anexo_original, molde, ident):
    a = copy.deepcopy(anexo_original)
    d = a['minecraft:attachable']['description']
    dm = molde['minecraft:attachable']['description']
    animacoes = d.setdefault('animations', {})
    scripts = d.setdefault('scripts', {})
    if not isinstance(animacoes, dict) or not isinstance(scripts, dict):
        raise ValueError(f'{d["identifier"]}: animations/scripts nao sao objetos')
    aliases = {}

    for chave, valor in dm.get('animations', {}).items():
        alias = f'ap_as_{chave}'
        sufixo = 2
        while alias in animacoes and animacoes[alias] != valor:
            alias = f'ap_as_{chave}_{sufixo}'
            sufixo += 1
        animacoes.setdefault(alias, copy.deepcopy(valor))
        aliases[chave] = alias

    for chave in ('initialize', 'pre_animation'):
        destino = scripts.setdefault(chave, [])
        if not isinstance(destino, list):
            raise ValueError(f'{d["identifier"]}: scripts.{chave} nao e uma lista')
        for linha in so_na_mao(dm.get('scripts', {}).get(chave, [])):
            if linha not in destino:
                destino.append(copy.deepcopy(linha))

    animate = scripts.setdefault('animate', [])
    if not isinstance(animate, list):
        raise ValueError(f'{d["identifier"]}: scripts.animate nao e uma lista')
    for entrada in dm.get('scripts', {}).get('animate', []):
        if isinstance(entrada, str):
            entrada = aliases.get(entrada, entrada)
        elif isinstance(entrada, dict):
            entrada = {aliases.get(nome, nome): condicao for nome, condicao in entrada.items()}
        if entrada not in animate:
            animate.append(copy.deepcopy(entrada))

    variaveis = dm.get('scripts', {}).get('variables', {})
    destino_variaveis = scripts.setdefault('variables', {})
    if not isinstance(variaveis, dict) or not isinstance(destino_variaveis, dict):
        raise ValueError(f'{d["identifier"]}: scripts.variables nao e um objeto')
    for nome, valor in variaveis.items():
        destino_variaveis.setdefault(nome, copy.deepcopy(valor))

    parent = dm.get('scripts', {}).get('parent_setup')
    if isinstance(parent, str):
        parent_atual = scripts.get('parent_setup')
        if parent_atual is None:
            scripts['parent_setup'] = parent
        elif not isinstance(parent_atual, str):
            raise ValueError(f'{d["identifier"]}: scripts.parent_setup nao e uma expressao')
        elif parent not in parent_atual:
            scripts['parent_setup'] = f'{parent.rstrip(";")};{parent_atual}'

    if 'scale' in dm.get('scripts', {}):
        scripts.setdefault('scale', copy.deepcopy(dm['scripts']['scale']))

    itens = d.setdefault('item', {})
    if not isinstance(itens, dict):
        raise ValueError(f'{d["identifier"]}: description.item nao e um objeto')
    itens.setdefault(ident, 'c.owning_entity -> v.actions_and_stuff;')
    return a


def indice_geometrias():
    geometrias = {}
    for p in sorted(glob.glob(os.path.join(PACKS, 'RP_*', 'models', '**', '*.json'), recursive=True)):
        j = tentar(p)
        if not j: continue
        for geo in j.get('minecraft:geometry', []):
            ident = geo.get('description', {}).get('identifier')
            if ident: geometrias.setdefault(ident, geo)
    return geometrias


def geometria_com_osso_item(ident, namespace, geometrias, adicionadas, cache):
    chave = (namespace, ident)
    if chave in cache: return cache[chave]
    original = geometrias.get(ident)
    if original is None:
        original = brarchive.geometria(AS, ident)
    geo = copy.deepcopy(original)
    ossos = geo['bones']
    if any(osso.get('name') == 'item' for osso in ossos):
        cache[chave] = ident
        return ident

    nome = ident.replace(':', '_').replace('.', '_')
    novo_ident = f'geometry.ap.as_use.{namespace}.{nome}'
    existentes = {g['description']['identifier'] for g in adicionadas[namespace]}
    base = novo_ident
    sufixo = 2
    while novo_ident in existentes:
        novo_ident = f'{base}_{sufixo}'
        sufixo += 1
    for osso in ossos:
        if osso.get('parent') is None:
            osso['parent'] = 'item'
    ossos.insert(0, {'name': 'item', 'pivot': [0, 0, 0]})
    geo['description']['identifier'] = novo_ident
    adicionadas[namespace].append(geo)
    cache[chave] = novo_ident
    return novo_ident


def aplicar_osso_item(anexo, ident, geometrias, adicionadas, cache):
    namespace = ident.split(':', 1)[0]
    referencias = anexo['minecraft:attachable']['description'].get('geometry')
    if not isinstance(referencias, dict):
        raise ValueError(f'{ident}: description.geometry nao e um objeto')
    for variante, geo in referencias.items():
        if not isinstance(geo, str):
            raise ValueError(f'{ident}: geometria {variante} nao e um identificador')
        referencias[variante] = geometria_com_osso_item(geo, namespace, geometrias, adicionadas, cache)


# ---------- itens e blocos dos addons ----------

def icone_do_item(c, itex):
    ic = c.get('minecraft:icon')
    if isinstance(ic, dict): ic = ic.get('textures', {}).get('default') or ic.get('texture')
    return itex.get(ic) if isinstance(ic, str) else None


def icone_por_identificador(ident, c, itex, terreno):
    candidatos = [ident]
    placer = c.get('minecraft:block_placer')
    bloco = placer.get('block') if isinstance(placer, dict) else None
    if isinstance(bloco, str) and bloco not in candidatos:
        candidatos.append(bloco)
    for candidato in candidatos:
        chave = candidato.replace(':', '_')
        caminho = itex.get(candidato) or terreno.get(candidato) or itex.get(chave) or terreno.get(chave)
        if caminho:
            return caminho
    return None


def tipo_do_item(c):
    if any(k in c for k in FORA): return None
    anim = c.get('minecraft:use_animation')
    if isinstance(anim, dict): anim = anim.get('value')
    if anim in ANIM_FORA: return None
    tags = set(c.get('minecraft:tags', {}).get('tags', []))
    for etqs, molde in FERRAMENTAS:
        if tags & set(etqs): return molde
    if 'minecraft:throwable' in c: return 'arremesso'
    if 'minecraft:food' in c or anim in ('eat', 'drink'): return 'comida'
    return 'item'


def faces_do_bloco(comp, bj, ident, terreno):
    """Caminho da textura de cada face, ou None se o bloco nao e um cubo simples."""
    geo = comp.get('minecraft:geometry')
    if isinstance(geo, dict): geo = geo.get('identifier')
    if geo not in (None, 'minecraft:geometry.full_block'): return None
    mi = comp.get('minecraft:material_instances')
    if mi:
        def inst(nome, n=0):
            v = mi.get(nome)
            if isinstance(v, str) and n < 5: return inst(v, n + 1)
            return v if isinstance(v, dict) else None
        res = {}
        for f in FACES:
            v = inst(f) or (inst('side') if f not in ('up', 'down') else None) or inst('*')
            if not v or 'texture' not in v: return None
            res[f] = terreno.get(v['texture'])
        return res if all(res.values()) else None
    t = bj.get(ident)
    if isinstance(t, str): return {f: terreno.get(t) for f in FACES} if terreno.get(t) else None
    if isinstance(t, dict):
        res = {}
        for f in FACES:
            n = t.get(f) or (t.get('side') if f not in ('up', 'down') else None) or t.get('side') or t.get('up')
            res[f] = terreno.get(n) if n else None
        return res if all(res.values()) else None
    return None


def textura_bloco(ident, faces):
    """Uma textura so (todas as faces iguais) ou uma tira de 6 quadros gravada no Compat. Devolve (caminho, colunas, quadros)."""
    if len(set(faces.values())) == 1:
        cam = faces['north']; img = imagem(cam)
        if not img: return None
        return cam, 1, max(1, img.height // img.width)
    imgs = [imagem(faces[f]) for f in FACES]
    if not all(imgs): return None
    lado = max(i.width for i in imgs)
    tira = Image.new('RGBA', (lado * 6, lado))
    for i, im in enumerate(imgs):
        q = im.crop((0, 0, im.width, im.width)).resize((lado, lado), Image.NEAREST)
        tira.paste(q, (i * lado, 0))
    nome = ident.replace(':', '_').replace('.', '_')
    os.makedirs(TEX_BLOCOS, exist_ok=True)
    tira.save(os.path.join(TEX_BLOCOS, nome + '.png'))
    return f'textures/ap/blocos/{nome}', 6, 1


def main():
    if os.path.isdir(SAIDA): shutil.rmtree(SAIDA)
    if os.path.isdir(TEX_BLOCOS): shutil.rmtree(TEX_BLOCOS)
    for p in glob.glob(os.path.join(COMPAT, 'models', 'entity', 'ap_2d_*.geo.json')): os.remove(p)
    tem = anexos_existentes()
    itex, terreno, bj = indice_texturas('item_texture.json'), indice_texturas('terrain_texture.json'), blocks_json()
    moldes = {}

    def molde(nome):
        if nome not in moldes:
            m = brarchive.anexo(AS, nome)
            gd = m['minecraft:attachable']['description']['geometry']
            moldes[nome] = (m, brarchive.geometria(AS, gd.get('default') or next(iter(gd.values()))))
        return moldes[nome]

    geos = defaultdict(list)  # namespace -> geometrias
    geometrias, geometrias_adicionadas, geometrias_cache = None, defaultdict(list), {}
    cubos_feitos = {}
    cont, pulos = Counter(), Counter()

    for p in sorted(glob.glob(os.path.join(PACKS, 'BP_*', 'items', '**', '*.json'), recursive=True)):
        j = tentar(p)
        if not j or 'minecraft:item' not in j: continue
        it = j['minecraft:item']; ident = it['description']['identifier']
        if ident.startswith('minecraft:'): continue
        c = it.get('components', {})
        tipo = tipo_do_item(c)
        if ident in tem:
            if tipo in ('arremesso', 'comida') and tem[ident] is not None:
                molde_anexo, _ = molde(MOLDE[tipo])
                adaptado = anexo_com_animacao(tem[ident], molde_anexo, ident)
                if geometrias is None:
                    geometrias = indice_geometrias()
                aplicar_osso_item(adaptado, ident, geometrias, geometrias_adicionadas, geometrias_cache)
                ns, nome = ident.split(':', 1)
                gravar(os.path.join(SAIDA, ns, nome.replace('/', '_') + '.json'), adaptado)
                tem[ident] = adaptado
                cont[f'{tipo}_com_anexo'] += 1
            continue
        if not tipo: pulos['uso proprio/vestivel'] += 1; continue
        cam = icone_do_item(c, itex)
        if not cam and tipo in ('arremesso', 'comida'):
            cam = icone_por_identificador(ident, c, itex, terreno)
        img = imagem(cam) if cam else None
        if not img and cam and tipo in ('arremesso', 'comida'):
            # Texturas vanilla podem existir no jogo sem uma copia PNG nos packs.
            img = Image.new('RGBA', (16, 16), (255, 255, 255, 255))
        if not img: pulos['sem icone'] += 1; continue
        quadro = min(img.height, img.width) if img.height > img.width else img.height
        ns, nome = ident.split(':', 1)
        gid = f'geometry.ap.2d.{ns}.{nome}'.replace(':', '_')
        if ':' in tipo:  # ferramenta
            m, mg = molde(tipo)
            g = geo_icone_diagonal(gid, mg, img, quadro)
        else:
            m, mg = molde(MOLDE[tipo])
            g = geo_icone_de_pe(gid, mg, img, quadro, ALTURA[tipo])
        if not any(b.get('cubes') for b in g['bones']): pulos['icone vazio'] += 1; continue
        geos[ns].append(g)
        gravar(os.path.join(SAIDA, ns, nome.replace('/', '_') + '.json'), anexo(m, ident, gid, cam))
        cont[tipo.split(':')[-1]] += 1
        tem[ident] = None

    m, mg = molde(MOLDE['bloco'])
    for p in sorted(glob.glob(os.path.join(PACKS, 'BP_*', 'blocks', '**', '*.json'), recursive=True)):
        j = tentar(p)
        if not j or 'minecraft:block' not in j: continue
        b = j['minecraft:block']; d = b['description']; ident = d['identifier']
        if ident.startswith('minecraft:') or ident in tem: continue
        menu = d.get('menu_category', {})
        if menu.get('category') == 'none' or menu.get('is_hidden_in_commands'): pulos['bloco escondido'] += 1; continue
        faces = faces_do_bloco(b.get('components', {}), bj, ident, terreno)
        if not faces: pulos['bloco com modelo proprio'] += 1; continue
        t = textura_bloco(ident, faces)
        if not t: pulos['bloco sem textura'] += 1; continue
        cam, colunas, quadros = t
        chave = (colunas, quadros)
        if chave not in cubos_feitos:
            gid = f'geometry.ap.2d.bloco_{colunas}x{quadros}'
            geos['blocos'].append(geo_cubo(gid, mg, colunas, quadros)); cubos_feitos[chave] = gid
        ns, nome = ident.split(':', 1)
        gravar(os.path.join(SAIDA, ns, 'bloco_' + nome.replace('/', '_') + '.json'), anexo(m, ident, cubos_feitos[chave], cam))
        cont['bloco'] += 1
        tem[ident] = None

    for ns in set(geos) | set(geometrias_adicionadas):
        lista = geos[ns]
        lista.extend(geometrias_adicionadas[ns])
        gravar(os.path.join(COMPAT, 'models', 'entity', f'ap_2d_{ns.replace(".", "_")}.geo.json'),
               {'format_version': '1.16.0', 'minecraft:geometry': lista})
    print('anexos:', dict(cont), 'total', sum(cont.values()))
    print('fora:', dict(pulos))


if __name__ == '__main__': main()
