#!/usr/bin/env python3
"""Monta o Addon Pack (um unico .mcaddon) a partir dos addons ORIGINAIS que voce ja tem.

Uso:   python montar_addon_pack.py PASTA_COM_OS_ORIGINAIS [-o Addon_Pack.mcaddon]

O script nao inclui o conteudo dos addons de terceiros. Ele le os seus arquivos
(.mcaddon / .mcpack), aplica as pequenas alteracoes listadas em dados/receita.json
(so se o arquivo original for exatamente o esperado, conferido por CRC32).
As alteracoes em codigo de terceiros sao guardadas apenas como pequenos trechos (diferencas), nunca como arquivos inteiros,
acrescenta os packs proprios do modpack e grava tudo em um unico .mcaddon.
Os seus originais nunca sao modificados. Uso pessoal e privado (ver CREDITS.md).
"""
import argparse, io, json, os, re, sys, zipfile, zlib

AQUI = os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(AQUI, 'dados')
sys.path.insert(0, AQUI)

def ler_json(b):
    t = b.decode('utf-8-sig', errors='ignore')
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    t = re.sub(r'(?m)^\s*//.*$', '', t)
    for f in (lambda s: s, lambda s: re.sub(r',\s*([}\]])', r'\1', s)):
        try: return json.loads(f(t))
        except Exception: pass
    return None

def vtuple(v):
    if isinstance(v, str): v = [int(x) for x in re.findall(r'\d+', v)]
    return tuple(v)

class Pack:
    def __init__(self, zf, raiz, uuid, versao, nome, origem):
        self.zf, self.raiz, self.uuid, self.versao, self.nome, self.origem = zf, raiz, uuid, versao, nome, origem
    def arquivos(self):
        for i in self.zf.infolist():
            if i.is_dir() or not i.filename.startswith(self.raiz): continue
            if i.filename.lower().endswith('.mcpack') or i.filename.lower().endswith('.mcaddon'): continue
            yield i.filename[len(self.raiz):], i

def varrer(zf, origem, achados):
    nomes = [i for i in zf.infolist() if not i.is_dir()]
    for i in nomes:
        fn = i.filename
        if fn.lower().endswith('manifest.json') and (fn == 'manifest.json' or fn.endswith('/manifest.json')) and '/subpacks/' not in fn:
            j = ler_json(zf.read(i))
            if not j or 'header' not in j or 'uuid' not in j['header']: continue
            raiz = fn[:-len('manifest.json')]
            achados.append(Pack(zf, raiz, j['header']['uuid'], vtuple(j['header'].get('version', [0])), j['header'].get('name', ''), origem))
    for i in nomes:
        if i.filename.lower().endswith(('.mcpack', '.mcaddon', '.zip')):
            try: varrer(zipfile.ZipFile(io.BytesIO(zf.read(i))), origem + '::' + os.path.basename(i.filename), achados)
            except zipfile.BadZipFile: pass


def aplicar_hunks(orig, hunks):
    """orig: str. Cada hunk: {antes, velho, novo, depois}. Cada ancora precisa ser unica no original."""
    pos = []
    for h in hunks:
        chave = h['antes'] + h['velho'] + h['depois']
        i = orig.find(chave)
        if i < 0 or orig.find(chave, i + 1) >= 0: return None
        pos.append((i + len(h['antes']), len(h['velho']), h['novo']))
    pos.sort(); out, cur = [], 0
    for i, n, novo in pos:
        if i < cur: return None
        out.append(orig[cur:i]); out.append(novo); cur = i + n
    out.append(orig[cur:])
    return ''.join(out)

def nova_versao(v, build):
    """Versao carimbada: o 3o numero ganha o numero da montagem, para o jogo aceitar o pack como atualizacao
    (pack com mesmo UUID e mesma versao e recusado como duplicado e o antigo continua valendo)."""
    t = list(vtuple(v)) + [0, 0, 0]
    return [t[0], t[1], t[2] + build]

def carimbar(dados, build, novas):
    """Reescreve header.version e as dependencias (por uuid) do manifest. novas: uuid -> [a, b, c]."""
    j = ler_json(dados)
    if not j or 'header' not in j: return dados
    def fmt(novo, antigo): return '.'.join(map(str, novo)) if isinstance(antigo, str) else list(novo)
    h = j['header']
    if h.get('uuid') in novas: h['version'] = fmt(novas[h['uuid']], h.get('version', [0, 0, 0]))
    for d in j.get('dependencies', []) or []:
        if d.get('uuid') in novas: d['version'] = fmt(novas[d['uuid']], d.get('version', [0, 0, 0]))
    return json.dumps(j, indent=2, ensure_ascii=False).encode('utf-8')

def brarchive_extrair(b):
    """Leitor de .brarchive: cabecalho de 16 bytes + entradas de 256 bytes (nome, offset, tamanho) + dados."""
    import struct
    magic, n, _ver = struct.unpack('<QII', b[:16])
    if magic != 0x267052a0b125277d: return {}
    base, out = 16 + n * 256, {}
    for i in range(n):
        e = b[16 + i * 256: 16 + (i + 1) * 256]
        off, size = struct.unpack('<II', e[-8:])
        out[e[1:1 + e[0]].decode('utf-8')] = b[base + off: base + off + size]
    return out

def derivar(dv, por_uuid):
    """Gera um arquivo de pack proprio a partir de um arquivo SEU (ex.: o anexo da luneta do Actions & Stuff),
    trocando so o identificador. Nada do addon original vem neste pacote: e lido da sua copia."""
    p = por_uuid.get(dv['uuid'])
    if p is None: return None
    for rel, info in p.arquivos():
        if rel != dv['arquivo']: continue
        for _nome, dados in brarchive_extrair(p.zf.read(info)).items():
            if dv['contem'].encode('utf-8') in dados:
                t = dados.decode('utf-8')
                for a_, b_ in dv['trocas']: t = t.replace(a_, b_)
                return t.encode('utf-8')
    return None

def slug(s):
    s = re.sub(r'§.', '', s)
    return re.sub(r'[^A-Za-z0-9._-]+', '_', s).strip('_')[:60] or 'pack'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pasta'); ap.add_argument('-o', '--saida', default='Addon_Pack_Completo.mcaddon')
    a = ap.parse_args()
    receita = json.load(open(os.path.join(DADOS, 'receita.json'), encoding='utf-8'))
    achados = []
    for raiz, _, fs in os.walk(a.pasta):
        for f in sorted(fs):
            if f.lower().endswith(('.mcaddon', '.mcpack', '.zip')) and os.path.abspath(os.path.join(raiz, f)) != os.path.abspath(a.saida):
                try: varrer(zipfile.ZipFile(os.path.join(raiz, f)), f, achados)
                except zipfile.BadZipFile: print('  ignorado (nao e zip valido):', f)
    # Varias copias/versoes do mesmo pack (o manifest muitas vezes repete a mesma versao): escolhe a que
    # mais combina com a receita (CRC dos arquivos que o modpack altera); empate -> versao mais nova.
    esperados = {}
    for pt in receita['patches']: esperados.setdefault(pt['uuid'], {})[pt['caminho']] = pt['crc_antes']
    for sec in ('bp', 'rp'):
        for e in (receita.get('unificar') or {}).get(sec, []): esperados.setdefault(e['uuid'], {})[e['caminho']] = e['crc']
    for job in (receita.get('unificar') or {}).get('ui', []):
        for e in job['entradas']: esperados.setdefault(e['uuid'], {})[e['caminho']] = e['crc']
    def pontos(p):
        exp = esperados.get(p.uuid, {})
        return sum(1 for rel, info in p.arquivos() if exp.get(rel) == (info.CRC & 0xffffffff))
    por_uuid = {}
    for p in achados:
        p._pts = pontos(p)
        q = por_uuid.get(p.uuid)
        if q is None or (p._pts, p.versao) > (q._pts, q.versao): por_uuid[p.uuid] = p
    faltam = [(r['nome'], r['arquivo_esperado']) for r in receita['packs'] if r['uuid'] not in por_uuid]
    if faltam:
        print('\nFALTAM estes originais na pasta (coloque-os e rode de novo):')
        for n, f in faltam: print(f'  - {n}   (arquivo: {f})')
        sys.exit(1)
    # merge do player (BP/RP): le os originais, confere CRC, combina
    unif = receita.get('unificar')
    subst = {}  # (uuid, caminho) -> bytes
    if unif:
        def orig_bytes(uuid, rel, pasta=None):
            if pasta in receita.get('packs_novos', []):
                try: return open(os.path.join(DADOS, 'packs', pasta, rel), 'rb').read()
                except OSError: return None
            p = por_uuid[uuid]
            for r_, i in p.arquivos():
                if r_ == rel: return p.zf.read(i)
        ent = {'bp': {}, 'rp': {}}; bom = True
        for lado in ('bp', 'rp'):
            for e in unif[lado]:
                b = orig_bytes(e['uuid'], e['caminho'])
                if b is None or (zlib.crc32(b) & 0xffffffff) != e['crc']:
                    avisos0 = f"{e['papel']}: {e['caminho']} diferente do esperado; merge do player NAO feito"
                    print('AVISO:', avisos0); bom = False
                else: ent[lado][e['papel']] = b
        if bom:
            import unificar_player
            bb, rb = unificar_player.calcular(ent['bp'], ent['rp'], log=lambda m: None)
            if (zlib.crc32(bb) & 0xffffffff) == unif['crc_saida_bp'] and (zlib.crc32(rb) & 0xffffffff) == unif['crc_saida_rp']:
                for e in unif['bp']: subst[(e['uuid'], e['caminho'])] = bb
                for e in unif['rp']: subst[(e['uuid'], e['caminho'])] = rb
            else: print('AVISO: resultado do merge do player nao bate com o esperado; NAO aplicado')
    if unif and unif.get('ui'):
        import unificar_ui
        for job in unif['ui']:
            ent_ui, bom_ui = {}, True
            for e in job['entradas']:
                b = orig_bytes(e['uuid'], e['caminho'], e['pasta'])
                if b is None or (zlib.crc32(b) & 0xffffffff) != e['crc']:
                    print(f"AVISO: {e['pasta']}: {e['caminho']} diferente do esperado; merge de UI NAO feito"); bom_ui = False
                else: ent_ui[e['papel']] = b
            if not bom_ui: continue
            sb = unificar_ui.rodar(job['caminho'], ent_ui, prioridade=job.get('prioridade'), modo=job.get('modo'))
            if (zlib.crc32(sb) & 0xffffffff) != job['crc_saida']:
                print(f"AVISO: resultado de {job['caminho']} nao bate com o esperado; NAO aplicado"); continue
            for e in job['entradas']: subst[(e['uuid'], e['caminho'])] = sb
            for e in job.get('copias', []): subst[(e['uuid'], e['caminho'])] = sb
    for u_, ic in receita.get('icones', {}).items():
        try:
            b = open(os.path.join(DADOS, ic['arquivo']), 'rb').read()
            if (zlib.crc32(b) & 0xffffffff) == ic['crc']: subst[(u_, 'pack_icon.png')] = b
        except OSError: pass
    # versoes carimbadas de todos os packs da saida
    build = int(receita.get('build', 0)); novas = {}
    if build:
        for r in receita['packs']: novas[r['uuid']] = nova_versao(por_uuid[r['uuid']].versao, build)
        for np_ in receita['packs_novos']:
            j = ler_json(open(os.path.join(DADOS, 'packs', np_, 'manifest.json'), 'rb').read())
            novas[j['header']['uuid']] = nova_versao(j['header'].get('version', [0, 0, 0]), build)
    patches = {}
    for pt in receita['patches']: patches.setdefault(pt['uuid'], []).append(pt)
    usados, avisos = set(), []
    with zipfile.ZipFile(a.saida, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as out:
        for r in receita['packs']:
            p = por_uuid[r['uuid']]
            if p.versao != tuple(r['versao']):
                avisos.append(f"{r['nome']}: voce tem a versao {'.'.join(map(str, p.versao))}, a receita foi feita com {'.'.join(map(str, r['versao']))}")
            pasta = r['pasta']
            aplicar = {pt['caminho']: pt for pt in patches.get(r['uuid'], [])}
            ok = {}
            for rel, info in p.arquivos():
                dados = None
                if rel in aplicar:
                    pt = aplicar[rel]
                    if (info.CRC & 0xffffffff) == pt['crc_antes']:
                        try:
                            novo = aplicar_hunks(p.zf.read(info).decode('utf-8'), pt['hunks'])
                            nb = novo.encode('utf-8') if novo is not None else None
                        except UnicodeDecodeError: nb = None
                        if nb is not None and (zlib.crc32(nb) & 0xffffffff) == pt['crc_depois']:
                            dados = nb; ok[rel] = True
                        else:
                            avisos.append(f"{r['nome']}: {rel} nao conferiu apos aplicar; alteracao NAO aplicada")
                    else:
                        avisos.append(f"{r['nome']}: {rel} e diferente do esperado; alteracao NAO aplicada")
                if (r['uuid'], rel) in subst: dados = subst[(r['uuid'], rel)]; ok[rel] = True
                if rel in aplicar and aplicar[rel].get('para'):
                    if dados is not None: out.writestr(f"{pasta}/{aplicar[rel]['para']}", dados)
                    else: out.writestr(f'{pasta}/{rel}', p.zf.read(info))
                    continue
                final = dados if dados is not None else p.zf.read(info)
                if build and rel == 'manifest.json': final = carimbar(final, build, novas)
                out.writestr(f'{pasta}/{rel}', final)
            for rel in aplicar:
                if rel not in ok and not any(w.endswith(rel) for w in avisos): avisos.append(f"{r['nome']}: {rel} nao encontrado; alteracao NAO aplicada")
            print(f"  {pasta}  ({len(ok)} alteracao(oes) aplicada(s))")
        for np_ in receita['packs_novos']:
            base = os.path.join(DADOS, 'packs', np_)
            for raiz, _, fs in os.walk(base):
                for f in fs:
                    full = os.path.join(raiz, f)
                    arc = f'{np_}/' + os.path.relpath(full, base).replace(os.sep, '/')
                    if build and arc == f'{np_}/manifest.json': out.writestr(arc, carimbar(open(full, 'rb').read(), build, novas))
                    else: out.write(full, arc)
            print(f'  {np_}  (pack proprio do modpack)')
        for dv in receita.get('derivados', []):
            b = derivar(dv, por_uuid)
            if b is None or (zlib.crc32(b) & 0xffffffff) != dv['crc_saida']:
                avisos.append(f"{dv['destino']}: nao foi possivel gerar a partir do seu {dv['de']}; ficou de fora"); continue
            out.writestr(dv['destino'], b)
    print('\nPronto:', a.saida)
    if build: print(f'Montagem {build}: todos os packs sairam com versao nova. Antes de importar, APAGUE do jogo os packs antigos do Addon Pack\n'
                    '(Configuracoes > Armazenamento) e depois reative os packs no mundo. Veja LEIA-ME.md.')
    for w in avisos: print('AVISO:', w)
if __name__ == '__main__': main()
