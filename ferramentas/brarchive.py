"""Leitura dos arquivos .brarchive (formato em que o Actions & Stuff guarda seus JSON).

Formato: cabecalho de 16 bytes (magica, quantidade de entradas, versao), depois uma tabela com
256 bytes por entrada (1 byte com o tamanho do nome, o nome, e nos ultimos 8 bytes deslocamento e
tamanho) e por fim os dados. As texturas PNG ficam soltas no pack, fora do arquivo.
"""
import glob, json, os, struct

MAGICA = 0x267052a0b125277d


def ler(caminho):
    b = open(caminho, 'rb').read()
    magica, n, _ = struct.unpack_from('<QII', b, 0)
    if magica != MAGICA: raise ValueError(f'{caminho} nao e um .brarchive')
    base, out = 16 + n * 256, {}
    for i in range(n):
        e = b[16 + i * 256:16 + (i + 1) * 256]
        nome = e[1:1 + e[0]].decode()
        desl, tam = struct.unpack_from('<II', e, 248)
        out[nome] = b[base + desl:base + desl + tam]
    return out


def jsons(pack, pasta):
    """Todos os JSON de uma pasta (ex.: 'attachables', 'models/entity') do pack base, sem subpacks."""
    res = {}
    for arq in sorted(glob.glob(os.path.join(pack, '__brarchive', pasta + '.brarchive'))):
        for nome, dados in ler(arq).items():
            try: res[nome] = json.loads(dados)
            except ValueError: pass
    return res


def geometria(pack, ident):
    """Procura uma geometria pelo identificador em models/ e models/entity/ do pack base."""
    for pasta in ('models', 'models/entity'):
        for j in jsons(pack, pasta).values():
            for g in j.get('minecraft:geometry', []) if isinstance(j, dict) else []:
                if g.get('description', {}).get('identifier') == ident: return g
    raise KeyError(ident)


def anexo(pack, ident):
    for j in jsons(pack, 'attachables').values():
        d = j.get('minecraft:attachable', {}).get('description', {})
        if d.get('identifier') == ident: return j
    raise KeyError(ident)
