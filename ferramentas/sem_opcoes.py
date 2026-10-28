"""Tira o botao "editar pacote" da tela de packs do mundo (pedido do João, 2026-10-28).

O botao aparece quando o manifest tem "subpacks" ou "settings". Aqui:
- cada pack com subpacks recebe o conteudo do subpack padrao (o ultimo da lista, que e o que o jogo
  escolhe) e perde a lista: A&S (Vanilla Experience), Forsaken (spawn normal de estruturas),
  CommonSense BP (trinkets ligados) e CommonSense RP (os 5 subpacks so traziam a mesma tela e um
  _global_variables vazio que escondia o unificado);
- as configuracoes saem dos manifests e as consultas q.is_pack_setting_* viram o valor padrao,
  em todos os packs (o A&S e os anexos copiados dele no Compat e no Unified Core).

Rodar de novo nao muda nada.
"""
import glob, json, os, re, shutil, sys

sys.path.insert(0, os.path.dirname(__file__))
import brarchive as br

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
SUBPACK_PADRAO = {
    'RP_ActionsAndStuff_RP': 'SP1',
    'BP_fo-bp-v1.19.4': '1_default',
    'BP_CommonSense': 'enabled',
    'RP_CommonSense': None,  # os subpacks so traziam a mesma tela e um _global_variables vazio, que apagava o unificado
}


def ler_manifest(pack):
    p = os.path.join(PACKS, pack, 'manifest.json')
    raw = open(p, encoding='utf-8-sig', newline='').read()
    return p, raw, json.loads(raw)


def gravar_manifest(p, raw, j):
    if '\n' in raw.strip():
        ind = re.search(r'\n([ \t]+)"', raw).group(1)
        out = json.dumps(j, ensure_ascii=False, indent=ind)
        if '\r\n' in raw: out = out.replace('\n', '\r\n')
    else:
        out = json.dumps(j, ensure_ascii=False, separators=(',', ':'))
    open(p, 'w', encoding='utf-8', newline='').write(out)


def ids(d):
    """Identificadores definidos por um JSON (para achar definicoes repetidas entre base e subpack)."""
    try: j = json.loads(d)
    except ValueError: return set()
    if not isinstance(j, dict): return set()
    s = set()
    for k in ('render_controllers', 'animations', 'animation_controllers'):
        if isinstance(j.get(k), dict): s |= set(j[k])
    for g in j.get('minecraft:geometry', []): s.add(g['description']['identifier'])
    for k, v in j.items():
        if isinstance(v, dict) and 'identifier' in v.get('description', {}): s.add(k + '|' + v['description']['identifier'])
    return s


def sem_ids(d, tirar):
    """Remove de um JSON as definicoes em `tirar`. Devolve None se o arquivo inteiro era so isso."""
    j = json.loads(d)
    for k, v in j.items():
        if isinstance(v, dict) and k + '|' + v.get('description', {}).get('identifier', '') in tirar: return None
    for k in ('render_controllers', 'animations', 'animation_controllers'):
        if isinstance(j.get(k), dict):
            for n in list(j[k]):
                if n in tirar: del j[k][n]
    if 'minecraft:geometry' in j:
        j['minecraft:geometry'] = [g for g in j['minecraft:geometry'] if g['description']['identifier'] not in tirar]
        if not j['minecraft:geometry']: return None
    return json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode()


def juntar_brarchive(base, sub):
    """O subpack sobrepoe a base por nome de arquivo; definicoes repetidas em outros arquivos da base saem."""
    a, b = br.ler(base) if os.path.exists(base) else {}, br.ler(sub)
    novos = set().union(*map(ids, b.values())) if b else set()
    out = {}
    for n, d in a.items():
        if n in b: continue
        if d and ids(d) & novos:
            d = sem_ids(d, novos)
            if d is None: continue
        out[n] = d
    out.update(b)
    os.makedirs(os.path.dirname(base), exist_ok=True)
    br.escrever(base, out)


def juntar_subpack(pack, nome):
    raiz = os.path.join(PACKS, pack)
    sub = os.path.join(raiz, 'subpacks', nome or '')
    if nome and os.path.isdir(sub):
        for d, _, arqs in os.walk(sub):
            for a in arqs:
                origem = os.path.join(d, a)
                rel = os.path.relpath(origem, sub)
                alvo = os.path.join(raiz, rel)
                if a.endswith('.brarchive'):
                    juntar_brarchive(alvo, origem)
                elif a == 'textures_list.json' and os.path.exists(alvo):
                    l = json.load(open(alvo, encoding='utf-8-sig'))
                    l += [t for t in json.load(open(origem, encoding='utf-8-sig')) if t not in l]
                    open(alvo, 'w', encoding='utf-8').write(json.dumps(l, separators=(',', ':')))
                else:
                    os.makedirs(os.path.dirname(alvo), exist_ok=True)
                    shutil.copyfile(origem, alvo)
    if os.path.isdir(os.path.join(raiz, 'subpacks')): shutil.rmtree(os.path.join(raiz, 'subpacks'))
    p, raw, j = ler_manifest(pack)
    if 'subpacks' in j:
        del j['subpacks']
        gravar_manifest(p, raw, j)


def padroes():
    """Valor padrao de cada configuracao de todos os manifests; tira as configuracoes."""
    res = {}
    for m in glob.glob(os.path.join(PACKS, '*', 'manifest.json')):
        pack = os.path.basename(os.path.dirname(m))
        p, raw, j = ler_manifest(pack)
        if 'settings' not in j: continue
        for s in j['settings']:
            if 'name' in s: res[s['name']] = s.get('default')
        del j['settings']
        gravar_manifest(p, raw, j)
    return res


def trocar_consultas(texto, pad):
    def sel(m):
        return '1' if pad.get(m.group(1)) == m.group(2) else '0'

    def lig(m):
        return '1' if pad.get(m.group(1)) else '0'
    texto = re.sub(r"q(?:uery)?\.is_pack_setting_selected\('([^']+)','([^']+)'\)", sel, texto)
    return re.sub(r"q(?:uery)?\.is_pack_setting_enabled\('([^']+)'\)", lig, texto)


def consultas(pad):
    n = 0
    for raiz, _, arqs in os.walk(PACKS):
        for a in arqs:
            p = os.path.join(raiz, a)
            if a.endswith('.brarchive'):
                itens, mudou = br.ler(p), False
                for k, d in itens.items():
                    if b'is_pack_setting' in d:
                        novo = trocar_consultas(d.decode('utf-8'), pad).encode('utf-8')
                        if novo != d: itens[k], mudou = novo, True; n += 1
                if mudou: br.escrever(p, itens)
            elif a.endswith('.json'):
                t = open(p, encoding='utf-8', newline='').read()
                if 'is_pack_setting' in t:
                    novo = trocar_consultas(t, pad)
                    if novo != t: open(p, 'w', encoding='utf-8', newline='').write(novo); n += 1
    return n


if __name__ == '__main__':
    for pack, sub in SUBPACK_PADRAO.items(): juntar_subpack(pack, sub)
    pad = padroes()
    print('configuracoes:', pad)
    print('arquivos com consultas trocadas:', consultas(pad))
