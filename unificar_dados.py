"""Mescla tabelas de saque (loot_tables) e trocas (trading) de varios addons que usam o MESMO caminho."""
import json

from unificar_ui import ler, serializar


def _c(x):
    return json.dumps(x, sort_keys=True, ensure_ascii=False)


def _chave_entrada(e):
    return (e.get('type'), e.get('name'))


def mesclar_loot(docs, prioridade, log=lambda m: None):
    """O 1o pack da prioridade fica como esta. Nos demais, pools equivalentes (mesmas condicoes/rolls e ao menos
    uma entrada em comum) recebem as entradas que faltam; os outros pools entram inteiros, sem repetir itens que
    ja saem sob as mesmas condicoes."""
    ordem = [p for p in prioridade if p in docs]
    saida = {k: v for k, v in docs[ordem[0]].items() if k != 'pools'}
    pools = [json.loads(_c(q)) for q in docs[ordem[0]].get('pools', [])]
    cab = lambda q: _c([q.get('conditions'), q.get('rolls'), q.get('bonus_rolls'), q.get('tiers')])
    for p in ordem[1:]:
        usados = set()
        for pool in docs[p].get('pools', []):
            nomes = {_chave_entrada(e) for e in pool.get('entries', [])}
            alvo = next((i for i, q in enumerate(pools) if i not in usados and cab(q) == cab(pool)
                         and nomes & {_chave_entrada(e) for e in q.get('entries', [])}), None)
            if alvo is not None:
                usados.add(alvo)
                ja = {_chave_entrada(e) for e in pools[alvo]['entries']}
                pools[alvo]['entries'].extend(json.loads(_c(e)) for e in pool['entries'] if _chave_entrada(e) not in ja)
                continue
            cond = _c(pool.get('conditions'))
            ja = {_chave_entrada(e) for q in pools if _c(q.get('conditions')) == cond for e in q.get('entries', [])}
            novos = [e for e in pool.get('entries', []) if _chave_entrada(e) not in ja]
            if novos:
                q = json.loads(_c(pool)); q['entries'] = [json.loads(_c(e)) for e in novos]
                pools.append(q)
    saida['pools'] = pools
    return saida


def mesclar_trocas(docs, prioridade, log=lambda m: None):
    """Alinha por posicao do nivel (o 1o pack da prioridade manda no resto do nivel); grupos distintos sao somados."""
    ordem = [p for p in prioridade if p in docs]
    tiers = []
    for p in ordem:
        for i, t in enumerate(docs[p].get('tiers', [])):
            if i >= len(tiers):
                tiers.append(json.loads(_c(t))); continue
            vistos = {_c(g) for g in tiers[i].get('groups', [])}
            for g in t.get('groups', []):
                if _c(g) not in vistos:
                    vistos.add(_c(g)); tiers[i].setdefault('groups', []).append(json.loads(_c(g)))
    saida = {k: v for k, v in docs[ordem[0]].items() if k != 'tiers'}
    saida['tiers'] = tiers
    return saida


def rodar(modo, entradas, prioridade, log=lambda m: None):
    docs = {p: ler(b) for p, b in entradas.items()}
    f = mesclar_loot if modo == 'loot' else mesclar_trocas
    return serializar(f(docs, prioridade, log))
