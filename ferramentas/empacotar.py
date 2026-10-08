#!/usr/bin/env python3
"""Empacota a pasta packs/ em um unico .mcaddon pronto para importar no Minecraft.

Uso:   python ferramentas/empacotar.py [-o Addon_Pack_Completo.mcaddon] [--build N]

Os packs ja estao prontos no repositorio (originais + alteracoes do modpack), entao nao e preciso
mais nenhum arquivo externo. O script so carimba uma versao nova nos manifests, para o jogo aceitar
a importacao como atualizacao (pack com mesmo UUID e mesma versao e recusado como duplicado).
"""
import argparse, json, os, re, subprocess, sys, zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
IGNORAR = {'desktop.ini', 'thumbs.db', '.ds_store', '.gitkeep'}
# Montagens anteriores (script antigo) chegaram ao numero 104; as novas precisam ficar acima disso.
BASE_BUILD = 200


def ler_json(b):
    t = b.decode('utf-8-sig', errors='ignore')
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    t = re.sub(r'(?m)^\s*//.*$', '', t)
    for f in (lambda s: s, lambda s: re.sub(r',\s*([}\]])', r'\1', s)):
        try: return json.loads(f(t))
        except ValueError: pass
    return None


def vtuple(v):
    if isinstance(v, str): v = [int(x) for x in re.findall(r'\d+', v)]
    return tuple(v)


def build_automatico():
    try:
        n = subprocess.run(['git', 'rev-list', '--count', 'HEAD'], cwd=RAIZ, capture_output=True, text=True, check=True).stdout
        return BASE_BUILD + int(n.strip())
    except (OSError, subprocess.CalledProcessError, ValueError):
        return BASE_BUILD


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--saida', default=os.path.join(RAIZ, 'Addon_Pack_Completo.mcaddon'))
    ap.add_argument('--build', type=int, help='numero somado ao 3o numero da versao (padrao: 200 + commits)')
    a = ap.parse_args()
    build = a.build if a.build is not None else build_automatico()

    packs = sorted(d for d in os.listdir(PACKS) if os.path.isfile(os.path.join(PACKS, d, 'manifest.json')))
    manifests, novas = {}, {}
    for p in packs:
        j = ler_json(open(os.path.join(PACKS, p, 'manifest.json'), 'rb').read())
        if not j or 'header' not in j: sys.exit(f'ERRO: manifest invalido em packs/{p}')
        manifests[p] = j
        u = j['header']['uuid']
        if u in novas: sys.exit(f'ERRO: UUID repetido em packs/{p}')
        t = list(vtuple(j['header'].get('version', [0, 0, 0]))) + [0, 0, 0]
        novas[u] = [t[0], t[1], t[2] + build]

    def fmt(novo, antigo): return '.'.join(map(str, novo)) if isinstance(antigo, str) else list(novo)

    total = 0
    with zipfile.ZipFile(a.saida, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as out:
        for p in packs:
            j = manifests[p]
            h = j['header']; h['version'] = fmt(novas[h['uuid']], h.get('version', [0, 0, 0]))
            for d in j.get('dependencies', []) or []:
                if d.get('uuid') in novas: d['version'] = fmt(novas[d['uuid']], d.get('version', [0, 0, 0]))
            base = os.path.join(PACKS, p)
            for raiz, _, fs in os.walk(base):
                for f in sorted(fs):
                    if f.lower() in IGNORAR: continue
                    full = os.path.join(raiz, f)
                    arc = p + '/' + os.path.relpath(full, base).replace(os.sep, '/')
                    if arc == p + '/manifest.json': out.writestr(arc, json.dumps(j, indent=2, ensure_ascii=False))
                    else: out.write(full, arc)
                    total += 1
    mb = os.path.getsize(a.saida) / 1048576
    print(f'Pronto: {a.saida}\n{len(packs)} packs, {total} arquivos, {mb:.0f} MiB, montagem {build}.')
    print('Antes de importar, apague do jogo os packs antigos do Addon Pack (Configuracoes > Armazenamento).')


if __name__ == '__main__': main()
