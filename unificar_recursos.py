"""Unioes simples de arquivos de dados que varios addons trazem no mesmo caminho (so um sobreviveria)."""
import json

from unificar_ui import ler, serializar


def _c(x):
    return json.dumps(x, sort_keys=True, ensure_ascii=False)


def uniao(docs, ordem, log=lambda m: None):
    """Uniao recursiva; em conflito de valor simples vale o de maior prioridade."""
    def _u(a, b, caminho):
        if isinstance(a, dict) and isinstance(b, dict):
            r = dict(a)
            for k, v in b.items():
                r[k] = _u(a[k], v, caminho + '/' + k) if k in a else v
            return r
        if isinstance(a, list) and isinstance(b, list):
            vistos = {_c(x) for x in a}
            return a + [x for x in b if _c(x) not in vistos]
        if a != b:
            log(f'conflito em {caminho}: mantido o de maior prioridade')
        return a
    out = None
    for p in ordem:
        if p in docs:
            out = docs[p] if out is None else _u(out, docs[p], '')
    return out


def catalogo(docs, ordem, log=lambda m: None):
    cats, vistos, base = [], set(), None
    for p in ordem:
        if p not in docs:
            continue
        j = docs[p]
        base = base or j
        for c in j['minecraft:crafting_items_catalog'].get('categories', []):
            if _c(c) not in vistos:
                vistos.add(_c(c)); cats.append(c)
    out = json.loads(_c(base)); out['minecraft:crafting_items_catalog']['categories'] = cats
    return out


def tick(docs, ordem, log=lambda m: None):
    vals = []
    for p in ordem:
        for v in docs.get(p, {}).get('values', []):
            if v not in vals:
                vals.append(v)
    return {'values': vals}


def rodar(modo, entradas, prioridade, log=lambda m: None):
    docs = {p: ler(b) for p, b in entradas.items()}
    f = {'uniao': uniao, 'catalogo': catalogo, 'tick': tick}[modo]
    return serializar(f(docs, prioridade, log))
