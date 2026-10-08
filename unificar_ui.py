"""Mescla arquivos de UI (JSON UI) de varios addons que usam o MESMO caminho (so o ultimo da pilha vence).

Regras (por controle de nivel superior, em ordem de prioridade):
  - so um pack define -> mantem;
  - todos so tem `modifications` -> concatena as listas;
  - um define o controle inteiro e outros so `modifications` -> propriedades do completo + todas as modificacoes;
  - dois completos -> vale o de maior prioridade (aviso), salvo regras especiais (ganchos).
`_ui_defs.json`: uniao das listas. O namespace e restabelecido pelo nome do arquivo quando o addon o omitiu.
"""
import copy
import json
import re

NS_ARQUIVO = {'hud_screen': 'hud', 'chest_screen': 'chest', 'inventory_screen': 'crafting', 'chat_screen': 'chat',
              '_global_variables': None}


def _sem_comentarios(t):
    out, i, n, dentro = [], 0, len(t), False
    while i < n:
        c = t[i]
        if dentro:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(t[i + 1]); i += 1
            elif c == '"':
                dentro = False
        elif c == '"':
            dentro = True; out.append(c)
        elif c == '/' and t.startswith('//', i):
            while i < n and t[i] != '\n':
                i += 1
            continue
        elif c == '/' and t.startswith('/*', i):
            j = t.find('*/', i + 2); i = n if j < 0 else j + 2
            continue
        else:
            out.append(c)
        i += 1
    return ''.join(out)


def ler(b):
    t = _sem_comentarios(b.decode('utf-8-sig', errors='ignore'))
    for f in (lambda s: s, lambda s: re.sub(r',\s*([}\]])', r'\1', s)):
        try:
            return json.loads(f(t))
        except Exception:
            pass
    raise ValueError('JSON invalido')


def serializar(d):
    return (json.dumps(d, indent=2, ensure_ascii=False) + '\n').encode('utf-8')


def _so_mods(v):
    return isinstance(v, dict) and set(v) <= {'modifications'}


def mesclar(docs, prioridade, arquivo, log=lambda m: None, ganchos=None):
    """docs: {papel: dict}. Devolve dict mesclado."""
    ordem = [p for p in prioridade if p in docs]
    ganchos = ganchos or {}
    saida = {}
    ns = NS_ARQUIVO.get(arquivo)
    nss = {docs[p].get('namespace') for p in ordem if docs[p].get('namespace')}
    if len(nss) > 1:
        log(f'{arquivo}: namespaces diferentes {nss}')
    ns = next(iter(nss)) if nss else ns
    if ns:
        saida['namespace'] = ns
    base_de = lambda k: k.split('@')[0]
    chaves = []
    for p in ordem:
        for k in docs[p]:
            if k != 'namespace' and base_de(k) not in chaves:
                chaves.append(base_de(k))
    for bk in chaves:
        vals = [(p, v) for p in ordem for k, v in docs[p].items() if k != 'namespace' and base_de(k) == bk]
        k = next(k for p in ordem for k in docs[p] if k != 'namespace' and base_de(k) == bk)  # chave completa do 1o dono
        if len(vals) == 1:
            saida[k] = copy.deepcopy(vals[0][1]); continue
        if bk in ganchos:
            saida[k] = ganchos[bk](vals, log); continue
        if all(_so_mods(v) for _, v in vals):
            saida[k] = {'modifications': [m for _, v in vals for m in v['modifications']]}; continue
        completos = [(p, v) for p, v in vals if not _so_mods(v)]
        mods = [m for p, v in vals if isinstance(v, dict) and 'modifications' in v for m in v['modifications']]
        base = copy.deepcopy(completos[0][1])
        if len(completos) > 1 and json.dumps(completos[0][1], sort_keys=True) != json.dumps(completos[1][1], sort_keys=True):
            log(f'{arquivo}: {k}: definicoes diferentes ({", ".join(p for p, _ in completos)}); vale {completos[0][0]}')
        if mods:
            base['modifications'] = list(base.get('modifications', [])) + [m for m in mods if m not in base.get('modifications', [])]
        saida[k] = base
    return saida


def unir_ui_defs(docs):
    out, vistos = [], set()
    for d in docs:
        for x in d.get('ui_defs', []):
            if x not in vistos:
                vistos.add(x); out.append(x)
    return {'ui_defs': out}


# ---------- regras especiais ----------
def _gancho_bancada(vals, log):
    """CommonSense (mesa de lenha/flechas) x Farmers Delight (panela): a bancada 3x3 so aparece se nenhuma das telas especiais."""
    return {'bindings': [
        {'binding_name': '#crafting_label_text', 'binding_name_override': '#text'},
        {'binding_type': 'view',
         'source_property_name': "(((#text - $fletching_table) = #text) and ((#text - $woodcutter) = #text) and (not (#text = 'Cooking Pot')) and (not (#text = ' Cooking Pot ')))",
         'target_property_name': '#visible'}]}


def _gancho_actionbar(vals, log):
    """Dungeons (fundo da action bar com variaveis) + JavaCombat (esconde textos que comecam com '!')."""
    dg = next(v for p, v in vals if p == 'DG')
    out = json.loads(json.dumps(dg))
    out.setdefault('variables', []).append({'requires': "(('%.1s' * $atext) = '!')", '$visible': False})
    return out


def _gancho_chat(vals, log):
    """BoB esconde 'bob.toast;' e Dungeons esconde 'toast.': esconder os dois."""
    return {'bindings': [{'binding_type': 'view',
                          'source_property_name': "((not ('%.10s' * #text = 'bob.toast;')) and (('§␛' + #text + '§r') - ('§␛' + 'toast.') = ('§␛' + #text + '§r')))",
                          'target_property_name': '#visible'}]}


def _pos_hud(doc):
    """Mira extra do CommonSense (a 'bolinha' no meio da tela): sempre invisivel."""
    if isinstance(doc.get('bv_crosshair'), dict): doc['bv_crosshair']['alpha'] = 0.0
    return doc


JOBS = {
    'ui/_ui_defs.json': {'modo': 'ui_defs'},
    'ui/_global_variables.json': {'modo': 'dict', 'prioridade': ['BOB', 'CS']},
    'ui/chat_screen.json': {'modo': 'mesclar', 'prioridade': ['DG', 'BOB'], 'ganchos': {'messages_text/text': _gancho_chat}, 'arquivo': 'chat_screen'},
    'ui/chest_screen.json': {'modo': 'vence', 'prioridade': ['OTG', 'BOB']},
    'ui/hud_screen.json': {'modo': 'mesclar', 'prioridade': ['DG', 'BOB', 'JC', 'CS'], 'ganchos': {'hud_actionbar_text': _gancho_actionbar}, 'arquivo': 'hud_screen', 'pos': _pos_hud},
    'ui/inventory_screen.json': {'modo': 'mesclar', 'prioridade': ['CS'], 'ganchos': {'work_bench_panel_3x3': _gancho_bancada}, 'arquivo': 'inventory_screen'},
}


ROL_BP = {'BOB': 'BP_Better_on_Bedrock_1_1_behaviors', 'CS': 'BP_CommonSense', 'DG': 'BP_dungeons_BP', 'FO': 'BP_fo-bp-v1.19.4'}
for _c_ in ('chests/abandoned_mineshaft', 'chests/bastion_treasure', 'chests/desert_pyramid', 'chests/pillager_outpost', 'chests/ruined_portal',
            'chests/simple_dungeon', 'chests/woodland_mansion', 'entities/creeper', 'entities/enchanter', 'entities/piglin_barter',
            'entities/pillager_captain_equipment', 'entities/vindicator_captain_equipment', 'entities/vindicator_gear'):
    JOBS[f'loot_tables/{_c_}.json'] = {'modo': 'loot', 'prioridade': ['CS', 'DG', 'FO', 'BOB'], 'papeis': ROL_BP}
for _c_ in ('cartographer', 'farmer', 'librarian', 'wandering_trader'):
    JOBS[f'trading/economy_trades/{_c_}_trades.json'] = {'modo': 'trocas', 'prioridade': ['FO', 'DG', 'CS', 'BOB'], 'papeis': ROL_BP}


def rodar(caminho, entradas, log=lambda m: None, prioridade=None, modo=None):
    """entradas: {papel: bytes}. Devolve bytes do arquivo mesclado."""
    j = JOBS.get(caminho, {})
    modo = modo or j.get('modo')
    prioridade = prioridade or j.get('prioridade') or sorted(entradas)
    if modo in ('loot', 'trocas'):
        import unificar_dados
        return unificar_dados.rodar(modo, entradas, prioridade, log)
    if modo in ('uniao', 'catalogo', 'tick'):
        import unificar_recursos
        return unificar_recursos.rodar(modo, entradas, prioridade, log)
    if modo in ('entidade_bp', 'entidade_rp'):
        import unificar_player
        return getattr(unificar_player, modo)(entradas, prioridade, log)
    if modo == 'vence':
        return next(entradas[p] for p in prioridade if p in entradas)
    docs = {p: ler(b) for p, b in entradas.items()}
    if modo == 'ui_defs':
        return serializar(unir_ui_defs([docs[p] for p in sorted(docs)]))
    if modo == 'dict':
        out = {}
        for p in reversed([p for p in prioridade if p in docs]):
            out.update(docs[p])
        return serializar(out)
    out = mesclar(docs, prioridade, j['arquivo'], log, j.get('ganchos'))
    if j.get('pos'): out = j['pos'](out)
    return serializar(out)
