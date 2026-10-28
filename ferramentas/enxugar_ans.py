"""Enxuga o Actions & Stuff (pedido do João, 2026-10-28).

1. Tira os moveis e construcoes que aparecem quando um suporte de armadura (ou cubo de enxofre)
   com o nome "§§" segura um item: toda condicao que exige q.is_name_any('§§') vira falsa, as
   entradas de render controller e de animacao que dependiam dela saem, e as negadas ficam sem
   a parte do nome.
2. Remove as geometrias e as texturas soltas de textures/oreville/ans que nada mais usa
   (procura em todos os packs do modpack, nao so no A&S).
3. Os subpacks Custom (SP0) e Full Experience (SP2) sairam do pack: fica so o Vanilla Experience (SP1).

Rodar uma vez a partir da raiz do repositorio: python ferramentas/enxugar_ans.py
"""
import glob, json, os, re, sys

sys.path.insert(0, os.path.dirname(__file__))
import brarchive as br

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
ANS = os.path.join(PACKS, 'RP_ActionsAndStuff_RP')
NOME = "q.is_name_any('§§')"
SUPORTE = "q.is_owner_identifier_any('minecraft:armor_stand','minecraft:sulfur_cube')"


def dump(j): return json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode()


def fora_de_parenteses(s, tok):
    n = 0
    for i, c in enumerate(s):
        n += c == '('; n -= c == ')'
        if n == 0 and s.startswith(tok, i): return True
    return False


def sem_nome(cond):
    """Condicao com '§§' sempre falso. Devolve None (sempre falsa), True (sempre verdadeira) ou a nova string."""
    if not isinstance(cond, str) or NOME not in cond: return cond
    c = cond
    for neg in (f'!({NOME}&&{SUPORTE})', f'!({SUPORTE}&&{NOME})', f'!{NOME}'):
        c = c.replace(neg + '&&', '').replace('&&' + neg, '')
        if c == neg: return True
    if NOME not in c: return c
    # o que sobra exige o nome: so aceito se for uma conjuncao simples (sem || no nivel de fora)
    if fora_de_parenteses(c, '||') or f'!({NOME}' in c or f'!{NOME}' in c:
        raise ValueError(f'condicao inesperada: {cond}')
    return None


def limpar_lista(lista):
    out = []
    for e in lista:
        if isinstance(e, dict):
            (k, v), = e.items()
            v = sem_nome(v)
            if v is None: continue
            e = k if v is True else {k: v}
        out.append(e)
    return out


def chaves_dos_controllers():
    """controller -> (geometrias, texturas, materiais) usados, pelos nomes 'Geometry.x' etc."""
    res = {}
    for arq in glob.glob(os.path.join(ANS, '**', 'render_controllers.brarchive'), recursive=True):
        for d in br.ler(arq).values():
            for nome, rc in json.loads(d).get('render_controllers', {}).items():
                s = json.dumps(rc)
                usados = tuple(set(re.findall(rf'{t}\.(\w+)', s, re.I)) for t in ('geometry', 'texture', 'material'))
                if nome in res: usados = tuple(a | b for a, b in zip(res[nome], usados))
                res[nome] = usados
    return res


def anexos():
    rcs, removidos = chaves_dos_controllers(), 0
    for arq in sorted(glob.glob(os.path.join(ANS, '**', 'attachables.brarchive'), recursive=True)):
        itens, mudou = br.ler(arq), False
        for nome, d in itens.items():
            if '§§'.encode() not in d: continue
            j = json.loads(d)
            desc = j['minecraft:attachable']['description']
            antes = [list(e)[0] if isinstance(e, dict) else e for e in desc.get('render_controllers', [])]
            desc['render_controllers'] = limpar_lista(desc.get('render_controllers', []))
            scr = desc.get('scripts', {})
            if 'animate' in scr: scr['animate'] = limpar_lista(scr['animate'])
            depois = [list(e)[0] if isinstance(e, dict) else e for e in desc['render_controllers']]
            # chaves de geometria/textura/material que so os controllers removidos usavam
            if all(c in rcs for c in depois):
                for i, campo in enumerate(('geometry', 'textures', 'materials')):
                    usadas = set().union(*(rcs[c][i] for c in depois)) if depois else set()
                    usadas = {u.lower() for u in usadas}
                    for k in list(desc.get(campo, {})):
                        if k.lower() not in usadas and k not in ('default', 'enchanted'): del desc[campo][k]
            novo = dump(j)
            if novo != d: itens[nome], mudou = novo, True; removidos += len(antes) - len(depois)
        if mudou: br.escrever(arq, itens)
    return removidos


def textos_de_todos(exceto=()):
    """Texto de todos os JSON/JS dos packs (soltos e dentro de .brarchive), para procurar referencias."""
    partes = []
    for raiz, _, arqs in os.walk(PACKS):
        for a in arqs:
            p = os.path.join(raiz, a)
            if any(e in p for e in exceto): continue
            if a.endswith('.brarchive'):
                partes += [d.decode('utf8', 'replace') for d in br.ler(p).values()]
            elif a.endswith(('.json', '.js', '.mcfunction', '.material')) and a != 'textures_list.json':
                partes.append(open(p, encoding='utf8', errors='replace').read())
    return '\n'.join(partes)


def geometrias():
    texto = textos_de_todos(exceto=(os.sep + 'models' + os.sep + 'entity.brarchive',))
    refs = set(re.findall(r'geometry\.oreville_ans\.[\w.]+', texto))
    tirados = 0
    for arq in glob.glob(os.path.join(ANS, '**', 'models', 'entity.brarchive'), recursive=True):
        itens, novos = br.ler(arq), {}
        for nome, d in itens.items():
            j = json.loads(d)
            gs = j.get('minecraft:geometry', [])
            fica = [g for g in gs if g['description']['identifier'] in refs or not g['description']['identifier'].startswith('geometry.oreville_ans.')]
            tirados += len(gs) - len(fica)
            if not fica and gs: continue
            if len(fica) != len(gs): j['minecraft:geometry'] = fica; d = dump(j)
            novos[nome] = d
        br.escrever(arq, novos)
    return tirados


def apagar_sem_ref(pasta, refs):
    """Apaga os arquivos de `pasta` (com subpastas) cujo caminho sem extensao nao esta em refs.
    As camadas de um .texture_set.json mantido (_mer, _normal...) ficam junto."""
    arqs = {}
    for raiz, _, nomes in os.walk(pasta):
        for a in nomes:
            p = os.path.join(raiz, a)
            arqs[p] = os.path.relpath(p, pasta).replace(os.sep, '/').split('.')[0]
    refs = set(refs)
    for p, rel in arqs.items():
        if p.endswith('.texture_set.json') and rel in refs:
            ts = json.load(open(p, encoding='utf8')).get('minecraft:texture_set', {})
            refs |= {os.path.dirname(rel) + '/' + v if '/' in rel else v for v in ts.values() if isinstance(v, str)}
    tiradas = 0
    for p, rel in arqs.items():
        if rel not in refs: os.remove(p); tiradas += 1
    for raiz, _, _ in sorted(os.walk(pasta), reverse=True):
        if not os.listdir(raiz): os.rmdir(raiz)
    return tiradas


def texturas():
    refs = set(re.findall(r'textures/oreville/ans/([\w/]+)', textos_de_todos()))
    return sum(apagar_sem_ref(p, refs) for p in glob.glob(os.path.join(ANS, '**', 'textures', 'oreville', 'ans'), recursive=True))


MEXIDAS = ('textures/oreville/ans/',)


def indices():
    """Refaz os indices (.brarchive de texturas e textures_list.json) das pastas mexidas com o que sobrou no disco."""
    for arq in glob.glob(os.path.join(ANS, '**', '__brarchive', 'textures', '**', '*.brarchive'), recursive=True):
        base, rel = arq.split(os.sep + '__brarchive' + os.sep)
        rel = rel[:-len('.brarchive')].replace(os.sep, '/')
        if not any((rel + '/').startswith(m) for m in MEXIDAS): continue
        pasta = os.path.join(base, rel)
        if not os.path.isdir(pasta): os.remove(arq); continue
        itens = br.ler(arq)
        fica = {n: d for n, d in itens.items() if os.path.exists(os.path.join(pasta, n))}
        if len(fica) != len(itens): br.escrever(arq, fica)
    for lista in glob.glob(os.path.join(ANS, '**', 'textures', 'textures_list.json'), recursive=True):
        base = os.path.dirname(os.path.dirname(lista))
        j = json.load(open(lista, encoding='utf8'))
        fica = [t for t in j if not t.startswith(MEXIDAS) or glob.glob(os.path.join(base, t) + '.*')]
        if len(fica) != len(j):
            open(lista, 'w', encoding='utf8').write(json.dumps(fica, separators=(',', ':')))


if __name__ == '__main__':
    print('controllers de construcao removidos:', anexos())
    print('geometrias removidas:', geometrias())
    print('texturas do A&S removidas:', texturas())
    indices()
