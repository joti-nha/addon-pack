#!/usr/bin/env python3
"""Otimiza a pasta packs/ sem mudar o que o jogo le.

Uso:   python ferramentas/otimizar.py [--sem-png] [pasta]

- JSON: tira espacos, quebras de linha e comentarios que estao fora de textos. O arquivo so e
  regravado se, lido de novo, der exatamente o mesmo conteudo do original (mesmas chaves, na mesma
  ordem, inclusive repetidas, e os mesmos numeros escritos do mesmo jeito). manifest.json fica legivel.
- PNG: recompressao sem perda com oxipng (python -m pip install pyoxipng). Os pixels, o tipo de cor e
  os metadados nao mudam; so os dados comprimidos sao refeitos.
- Lixo: apaga desktop.ini, Thumbs.db e .DS_Store.
Pode rodar quantas vezes quiser: o que ja esta otimizado fica como esta.
"""
import argparse, json, os, re, sys
from concurrent.futures import ProcessPoolExecutor

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIXO = {'desktop.ini', 'thumbs.db', '.ds_store'}
ESPACO = ' \t\r\n'


def compactar(t):
    """Remove espacos e comentarios fora de strings. Devolve None se o texto parecer malformado."""
    out, i, n = [], 0, len(t)
    while i < n:
        c = t[i]
        if c == '"':
            j = i + 1
            while j < n:
                if t[j] == '\\': j += 2; continue
                if t[j] == '"': break
                if t[j] == '\n': return None
                j += 1
            if j >= n: return None
            out.append(t[i:j + 1]); i = j + 1
        elif c in ESPACO:
            i += 1
        elif c == '/' and t.startswith('//', i):
            j = t.find('\n', i); i = n if j < 0 else j + 1
        elif c == '/' and t.startswith('/*', i):
            j = t.find('*/', i + 2)
            if j < 0: return None
            i = j + 2
        else:
            j = i
            while j < n and t[j] not in ESPACO and t[j] not in '"/,:{}[]': j += 1
            if j == i: j = i + 1
            tok = t[i:j]
            # dois tokens soltos lado a lado (ex.: numeros separados so por espaco) nao podem grudar
            if out and tok[0] not in ',:{}[]' and out[-1][-1] not in ',:{}["' and out[-1][-1] not in '"':
                out.append(' ')
            out.append(tok); i = j
    return ''.join(out)


def ler(texto):
    """json.loads guardando chaves repetidas, a ordem e o texto exato dos numeros.
    Aceita virgula sobrando antes de } ou ], como o Bedrock."""
    for s in (texto, re.sub(r',(\s*[}\]])', r'\1', texto)):
        try:
            return json.loads(s, object_pairs_hook=lambda p: ('obj', p), parse_float=lambda x: ('num', x),
                              parse_int=lambda x: ('num', x), parse_constant=lambda x: ('num', x))
        except ValueError:
            pass
    return None


def sem_comentarios(t):
    """Referencia independente do compactar(): tira so comentarios de linha inteira e blocos /* */."""
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    return re.sub(r'(?m)^\s*//.*$', '', t)


def otimizar_json(caminho):
    b = open(caminho, 'rb').read()
    try: t = b.decode('utf-8-sig')
    except UnicodeDecodeError: return 0
    if not t.strip(): return 0
    novo = compactar(t)
    if novo is None or len(novo.encode('utf-8')) >= len(b): return 0
    # o original e lido por um caminho que nao usa o compactar(); se nao der para ler, nao mexe
    antes = ler(t)
    if antes is None: antes = ler(sem_comentarios(t))
    if antes is None or ler(novo) != antes: return 0
    nb = novo.encode('utf-8')
    open(caminho, 'wb').write(nb)
    return len(b) - len(nb)


def otimizar_png(caminho):
    import oxipng
    antes = os.path.getsize(caminho)
    try: dados = oxipng.optimize_from_memory(
            open(caminho, 'rb').read(), level=4, strip=oxipng.StripChunks.none(),
            # so recomprime: mesmo tipo de cor, mesma profundidade e todos os blocos de metadados
            bit_depth_reduction=False, color_type_reduction=False, palette_reduction=False,
            grayscale_reduction=False, optimize_alpha=False)
    except Exception:
        return 0
    if len(dados) >= antes: return 0
    open(caminho, 'wb').write(dados)
    return antes - len(dados)


def tarefa(args):
    tipo, caminho = args
    return tipo, (otimizar_json(caminho) if tipo == 'json' else otimizar_png(caminho))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pasta', nargs='?', default=os.path.join(RAIZ, 'packs'))
    ap.add_argument('--sem-png', action='store_true')
    a = ap.parse_args()
    if not a.sem_png:
        try: import oxipng  # noqa: F401
        except ImportError: sys.exit('Falta o oxipng: python -m pip install pyoxipng (ou use --sem-png)')
    jobs, apagados = [], 0
    for raiz, _, fs in os.walk(a.pasta):
        for f in fs:
            p, fl = os.path.join(raiz, f), f.lower()
            if fl in LIXO: os.remove(p); apagados += 1
            elif fl.endswith('.json') and fl != 'manifest.json': jobs.append(('json', p))
            elif fl.endswith('.png') and not a.sem_png: jobs.append(('png', p))
    ganho = {'json': [0, 0], 'png': [0, 0]}
    with ProcessPoolExecutor() as ex:
        for tipo, g in ex.map(tarefa, jobs, chunksize=64):
            if g: ganho[tipo][0] += 1; ganho[tipo][1] += g
    for tipo, (n, g) in ganho.items():
        print(f'{tipo.upper()}: {n} arquivos menores, {g / 1048576:.1f} MiB a menos')
    print(f'Lixo apagado: {apagados} arquivos')


if __name__ == '__main__': main()
