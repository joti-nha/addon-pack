"""Unifica o `minecraft:player` de varios addons (BP: entities/player.json; RP: entity/player.entity.json).

O Minecraft usa so UM arquivo por caminho; cada addon traz o seu e o ultimo da pilha vence, apagando os outros.
Aqui os arquivos sao lidos dos SEUS originais e combinados (uniao de componentes, grupos, eventos, animacoes,
controladores de render...). O resultado e gravado em todos os packs envolvidos, entao a ordem da pilha deixa de importar.

Regra importante: o RnR usa `minecraft:variant` para a raca e o OTG Backpack usa o mesmo componente para escolher
a mochila (o render do OTG mostra mochila quando variant > 0). Para nao colidir, a raca do RnR passa a usar
`minecraft:skin_id` / `query.skin_id`.
"""
import json
import re

IGNORAR_COMPONENTES_IGUAIS = True


from unificar_ui import ler as _ler  # noqa: E402


def _versao(v):
    return tuple(int(x) for x in re.findall(r'\d+', str(v)))


def _canon(x):
    return json.dumps(x, sort_keys=True, ensure_ascii=False)


def _uniao_lista(*listas):
    out, vistos = [], set()
    for l in listas:
        for x in l:
            k = _canon(x)
            if k not in vistos:
                vistos.add(k)
                out.append(x)
    return out


def _como_lista(v):
    if v is None:
        return []
    return v if isinstance(v, list) else [v]


def _renomear_variant_bp(doc):
    """RnR: raca em minecraft:skin_id (nao colide com a mochila do OTG, que usa minecraft:variant)."""
    n = 0
    for g in doc['minecraft:entity'].get('component_groups', {}).values():
        if 'minecraft:variant' in g:
            g['minecraft:skin_id'] = g.pop('minecraft:variant')
            n += 1
    comp = doc['minecraft:entity'].get('components', {})
    if 'minecraft:variant' in comp:
        comp['minecraft:skin_id'] = comp.pop('minecraft:variant')
        n += 1
    return n


def _renomear_variant_texto(obj):
    t = json.dumps(obj, ensure_ascii=False)
    t2 = re.sub(r'\b(query|q)\.variant\b', lambda m: m.group(1) + '.skin_id', t)
    return json.loads(t2), t != t2


def unificar_bp(docs, prioridade, log, renomear_variant=False):
    """docs: {papel: json}. prioridade: lista de papeis, o primeiro vence conflitos simples."""
    ordem = [p for p in prioridade if p in docs]
    if renomear_variant and 'RNR' in docs:
        _renomear_variant_bp(docs['RNR'])
    fv = max((docs[p].get('format_version', '1.21.0') for p in ordem), key=_versao)
    base = {'format_version': fv, 'minecraft:entity': {}}
    ent = base['minecraft:entity']
    # descricao
    desc = {}
    for p in reversed(ordem):
        for k, v in docs[p]['minecraft:entity']['description'].items():
            if k in ('properties', 'animations'):
                desc.setdefault(k, {}).update(v)
            elif k == 'scripts':
                s = desc.setdefault('scripts', {})
                for sk, sv in v.items():
                    s[sk] = _uniao_lista(_como_lista(s.get(sk)), _como_lista(sv)) if isinstance(sv, list) else sv
            else:
                desc[k] = v
    ent['description'] = desc
    # component_groups e events: uniao, conflitos -> primeiro da prioridade (com aviso se diferem)
    for sec in ('component_groups', 'events'):
        out = {}
        for p in ordem:
            for k, v in docs[p]['minecraft:entity'].get(sec, {}).items():
                if k not in out:
                    out[k] = v
                elif _canon(out[k]) != _canon(v):
                    dono = [q for q in ordem if k in docs[q]['minecraft:entity'].get(sec, {})][0]
                    log(f'{sec}/{k}: versoes diferentes; vale {dono}')
        ent[sec] = out
    # components
    comps = {}
    for p in ordem:
        for k, v in docs[p]['minecraft:entity'].get('components', {}).items():
            comps.setdefault(k, []).append((p, v))
    out = {}
    for k, vs in comps.items():
        distintos = {_canon(v) for _, v in vs}
        if len(distintos) == 1:
            out[k] = vs[0][1]
        elif k == 'minecraft:environment_sensor':
            out[k] = {'triggers': _uniao_lista(*[_como_lista(v.get('triggers')) for _, v in vs])}
        elif k == 'minecraft:hurt_on_condition':
            out[k] = {'damage_conditions': _uniao_lista(*[_como_lista(v.get('damage_conditions')) for _, v in vs])}
        else:
            out[k] = vs[0][1]
            log(f'components/{k}: versoes diferentes ({", ".join(p for p, _ in vs)}); vale {vs[0][0]}')
    ent['components'] = dict(sorted(out.items()))
    return base


def unificar_rp(docs, prioridade, log, renomear_variant=False):
    ordem = [p for p in prioridade if p in docs]
    if renomear_variant and 'RNR' in docs:
        docs['RNR'], mudou = _renomear_variant_texto(docs['RNR'])
    fv = max((docs[p].get('format_version', '1.10.0') for p in ordem), key=_versao)
    base = {'format_version': fv, 'minecraft:client_entity': {'description': {}}}
    desc = base['minecraft:client_entity']['description']
    for p in reversed(ordem):  # o primeiro da prioridade sobrescreve
        d = docs[p]['minecraft:client_entity']['description']
        for k, v in d.items():
            if k in ('materials', 'textures', 'geometry', 'animations', 'particle_effects', 'sound_effects'):
                desc.setdefault(k, {}).update(v)
            elif k == 'render_controllers':
                continue
            elif k == 'scripts':
                s = desc.setdefault('scripts', {})
                for sk, sv in v.items():
                    if isinstance(sv, list):
                        s[sk] = _uniao_lista(_como_lista(s.get(sk)), sv)
                    elif isinstance(sv, dict):
                        s.setdefault(sk, {}).update(sv)
                    else:
                        s[sk] = sv
            else:
                desc[k] = v
    # scripts.scale e variaveis de raca: o RnR muda a escala por raca; o dele vence
    if renomear_variant and 'RNR' in docs:
        sr = docs['RNR']['minecraft:client_entity']['description'].get('scripts', {})
        if 'scale' in sr:
            desc['scripts']['scale'] = sr['scale']
    # render_controllers: lista ordenada. Base = prioridade (RNR primeiro); acrescenta controladores que faltam.
    lista, nomes = [], {}
    for p in ordem:
        for rc in docs[p]['minecraft:client_entity']['description'].get('render_controllers', []):
            nome = rc if isinstance(rc, str) else next(iter(rc))
            if nome in nomes:
                continue
            nomes[nome] = p
            lista.append(rc)
    desc['render_controllers'] = lista
    return base


def serializar(doc):
    return (json.dumps(doc, indent=2, ensure_ascii=False) + '\n').encode('utf-8')


BP_ALVO = 'entities/player.json'
RP_ALVO = 'entity/player.entity.json'
BP_PRIORIDADE = ['OTG', 'RNR', 'RPG', 'JC', 'CS']
RP_PRIORIDADE = ['RNR', 'OTG', 'RPG']


def calcular(entradas_bp, entradas_rp, log=print):
    """entradas_*: {papel: bytes}. Devolve (bytes_bp, bytes_rp)."""
    bp = unificar_bp({k: _ler(v) for k, v in entradas_bp.items()}, BP_PRIORIDADE, log, True)
    rp = unificar_rp({k: _ler(v) for k, v in entradas_rp.items()}, RP_PRIORIDADE, log, True)
    return serializar(bp), serializar(rp)


def entidade_bp(entradas, prioridade, log=lambda m: None):
    return serializar(unificar_bp({k: _ler(v) for k, v in entradas.items()}, prioridade, log))


def entidade_rp(entradas, prioridade, log=lambda m: None):
    return serializar(unificar_rp({k: _ler(v) for k, v in entradas.items()}, prioridade, log))
