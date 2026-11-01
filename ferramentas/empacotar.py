#!/usr/bin/env python3
"""Empacota a pasta packs/ em um ou varios arquivos .mcaddon prontos para importar.

Uso:   python ferramentas/empacotar.py [-o DESTINO] [--build N] [--simples] [--por-pack]

Os packs ja estao prontos no repositorio (originais + alteracoes do modpack), entao nao e preciso
mais nenhum arquivo externo. O script so carimba uma versao nova nos manifests, para o jogo aceitar
a importacao como atualizacao (pack com mesmo UUID e mesma versao e recusado como duplicado).

Este arquivo e usado pelo comando, pela janela do Windows (empacotador_janela.py) e pelo menu do
celular (menu_celular.py): todos chamam empacotar().
"""
import argparse, datetime, io, json, os, re, shutil, sys, time, zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA_PADRAO = 'Addon_Pack_Completo.mcaddon'
PASTA_POR_PACK = 'Addon_Pack_Por_Pack'
IGNORAR = {'desktop.ini', 'thumbs.db', '.ds_store', '.gitkeep'}
# Numero da montagem = minutos desde 01/10/2026. Sempre cresce, no GitHub e no seu aparelho, entao cada
# montagem nova tem versao maior que a anterior. As montagens antigas chegaram a 208; esta conta ja passa disso.
INICIO_BUILD = datetime.datetime(2026, 10, 1, tzinfo=datetime.timezone.utc)


class ErroEmpacotar(Exception):
    pass


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
    agora = datetime.datetime.now(datetime.timezone.utc)
    return int((agora - INICIO_BUILD).total_seconds() // 60)


def achar_raiz(*inicios):
    """Procura a pasta do repositorio (a que tem packs/): no proprio inicio, numa subpasta dele
    (ex.: addon-pack-main extraido do ZIP) ou subindo ate 3 niveis."""
    for ini in inicios:
        if not ini or not os.path.isdir(ini): continue
        d = os.path.abspath(ini)
        for _ in range(4):
            if os.path.isdir(os.path.join(d, 'packs')): return d
            try: subs = sorted(os.listdir(d))
            except OSError: subs = []
            for sub in subs:
                if os.path.isdir(os.path.join(d, sub, 'packs')): return os.path.join(d, sub)
            pai = os.path.dirname(d)
            if pai == d: break
            d = pai
    return None


def empacotar(raiz=RAIZ, saida=None, build=None, progresso=None, por_pack=False):
    """Monta o .mcaddon. progresso(evento, dados) recebe:
       'inicio' {packs, arquivos, build}, 'pack' {indice, nome}, 'arquivo' {feitos, total},
       'fim' {saida, packs, arquivos, bytes, segundos, build}.
    Com por_pack=True, grava um .mcaddon por pasta em packs/ dentro do destino informado."""
    avisar = progresso or (lambda evento, dados: None)
    pasta = os.path.join(raiz, 'packs')
    if not os.path.isdir(pasta): raise ErroEmpacotar(f'Nao achei a pasta packs/ em {raiz}')
    saida = saida or os.path.join(raiz, PASTA_POR_PACK if por_pack else SAIDA_PADRAO)
    build = build_automatico() if build is None else build
    inicio = time.monotonic()

    packs = sorted(d for d in os.listdir(pasta) if os.path.isfile(os.path.join(pasta, d, 'manifest.json')))
    if not packs: raise ErroEmpacotar('A pasta packs/ nao tem nenhum pack')
    manifests, novas, listas = {}, {}, {}
    for p in packs:
        j = ler_json(open(os.path.join(pasta, p, 'manifest.json'), 'rb').read())
        if not j or 'header' not in j: raise ErroEmpacotar(f'manifest invalido em packs/{p}')
        manifests[p] = j
        u = j['header']['uuid']
        if u in novas: raise ErroEmpacotar(f'UUID repetido em packs/{p}')
        t = list(vtuple(j['header'].get('version', [0, 0, 0]))) + [0, 0, 0]
        novas[u] = [t[0], t[1], t[2] + build]
        base = os.path.join(pasta, p)
        listas[p] = [os.path.join(r, f) for r, _, fs in os.walk(base) for f in sorted(fs) if f.lower() not in IGNORAR]
    total = sum(len(v) for v in listas.values())
    avisar('inicio', {'packs': len(packs), 'arquivos': total, 'build': build, 'por_pack': por_pack})

    def fmt(novo, antigo): return '.'.join(map(str, novo)) if isinstance(antigo, str) else list(novo)

    def criar_mcpack(p):
        nonlocal feitos
        j = manifests[p]
        h = j['header']; h['version'] = fmt(novas[h['uuid']], h.get('version', [0, 0, 0]))
        for d in j.get('dependencies', []) or []:
            if d.get('uuid') in novas: d['version'] = fmt(novas[d['uuid']], d.get('version', [0, 0, 0]))
        base = os.path.join(pasta, p)
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED, compresslevel=9, allowZip64=False) as mp:
            for full in listas[p]:
                arc = os.path.relpath(full, base).replace(os.sep, '/')
                if arc == 'manifest.json': mp.writestr(arc, json.dumps(j, indent=2, ensure_ascii=False))
                else: mp.write(full, arc)
                feitos += 1
                if feitos % 50 == 0 or feitos == total: avisar('arquivo', {'feitos': feitos, 'total': total})
        return buf.getvalue()

    feitos = 0
    saidas = []
    try:
        if por_pack:
            os.makedirs(saida, exist_ok=True)
            for n, p in enumerate(packs, 1):
                avisar('pack', {'indice': n, 'nome': p})
                destino = os.path.join(saida, p + '.mcaddon')
                parcial = destino + '.parcial'
                with zipfile.ZipFile(parcial, 'w', zipfile.ZIP_STORED, allowZip64=False) as out:
                    out.writestr(p + '.mcpack', criar_mcpack(p))
                os.replace(parcial, destino)
                saidas.append(destino)
        else:
            parcial = saida + '.parcial'
            if os.path.exists(saida): os.remove(saida)
            with zipfile.ZipFile(parcial, 'w', zipfile.ZIP_STORED, allowZip64=False) as out:
                for n, p in enumerate(packs, 1):
                    avisar('pack', {'indice': n, 'nome': p})
                    out.writestr(p + '.mcpack', criar_mcpack(p))
            os.replace(parcial, saida)
            saidas.append(saida)
    except BaseException:
        for destino in (locals().get('parcial'),):
            try: os.remove(destino)
            except (OSError, TypeError): pass
        raise
    info = {'saida': saida, 'saidas': saidas, 'packs': len(packs), 'arquivos': total,
            'bytes': sum(os.path.getsize(arq) for arq in saidas), 'segundos': time.monotonic() - inicio,
            'build': build, 'por_pack': por_pack}
    avisar('fim', info)
    return info


# ---------------------------------------------------------------- tela do comando

class Tela:
    """Progresso no terminal: barra colorida que se atualiza no lugar (CMD, PowerShell, Termux).
    Com --simples, ou quando a saida nao e um terminal, imprime uma linha por pack."""
    CORES = {'verde': '32', 'ciano': '36', 'amarelo': '33', 'cinza': '90', 'negrito': '1', 'roxo': '35', 'vermelho': '31'}

    def __init__(self, simples=False):
        self.viva = sys.stdout.isatty() and not simples
        if self.viva and os.name == 'nt': os.system('')  # liga as cores ANSI no CMD do Windows
        try: sys.stdout.reconfigure(encoding='utf-8')
        except (AttributeError, ValueError): pass
        self.inicio = time.monotonic(); self.pack = ''; self.n = self.np = self.total = 0
        self.ultimo = 0.0; self.desenhado = False
        # no celular a tela e estreita: tudo se ajusta para nenhuma linha quebrar (senao a barra se repete)
        self.colunas = max(32, shutil.get_terminal_size((80, 24)).columns)

    def c(self, cor, t):
        return f'\033[{self.CORES[cor]}m{t}\033[0m' if self.viva else t

    def __call__(self, evento, d):
        getattr(self, '_' + evento)(d)

    def _inicio(self, d):
        self.np, self.total = d['packs'], d['arquivos']
        w = min(48, self.colunas - 5)
        linha2 = f'   {d["packs"]} packs · {d["arquivos"]:,} arquivos'.replace(',', '.')
        print()
        print(self.c('roxo', '  ╭' + '─' * w + '╮'))
        print(self.c('roxo', '  │') + self.c('negrito', '  ⛏  ADDON PACK · Empacotador'.ljust(w)) + self.c('roxo', '│'))
        print(self.c('roxo', '  │') + self.c('cinza', linha2[:w].ljust(w)) + self.c('roxo', '│'))
        print(self.c('roxo', '  │') + self.c('cinza', f'   montagem {d["build"]}'[:w].ljust(w)) + self.c('roxo', '│'))
        print(self.c('roxo', '  ╰' + '─' * w + '╯'))
        print()
        if not self.viva: print('Montando... espere a mensagem "Pronto".', flush=True)

    def _pack(self, d):
        self._fechar_pack()
        self.n, self.pack = d['indice'], d['nome']
        if not self.viva: print(f'  [{self.n:2}/{self.np}] {self.pack}', flush=True)
        self._desenhar(self.feitos_atual if hasattr(self, 'feitos_atual') else 0, forcar=True)

    def _arquivo(self, d):
        self.feitos_atual = d['feitos']
        self._desenhar(d['feitos'])

    def _fechar_pack(self):
        if self.viva and self.pack:
            self._apagar(); print(f'  {self.c("verde", "✔")} {self.pack}')

    def _apagar(self):
        if self.desenhado: sys.stdout.write('\r\033[2K\033[1A\033[2K\r'); self.desenhado = False

    def _desenhar(self, feitos, forcar=False):
        if not self.viva: return
        agora = time.monotonic()
        if not forcar and agora - self.ultimo < 0.08 and feitos < self.total: return
        self._apagar(); self.ultimo = agora
        frac = feitos / self.total if self.total else 0
        largura = max(10, min(30, self.colunas - 30))
        cheio = int(frac * largura)
        barra = self.c('verde', '█' * cheio) + self.c('cinza', '░' * (largura - cheio))
        gasto = agora - self.inicio
        falta = f'~{int(gasto / frac - gasto)}s' if frac > 0.03 else '...'
        giro = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[int(agora * 10) % 10]
        sys.stdout.write(f'  {self.c("ciano", giro)} {self.c("amarelo", f"[{self.n:2}/{self.np}]")} {self.pack[:self.colunas - 14]}\n'
                         f'  {barra} {self.c("negrito", f"{frac * 100:5.1f}%")}  {self.c("cinza", f"{int(gasto)}s · falta {falta}"[:self.colunas - largura - 11])}')
        sys.stdout.flush(); self.desenhado = True

    def _fim(self, d):
        self._fechar_pack()
        mb = d['bytes'] / 1048576
        resultado = f'{len(d["saidas"])} .mcaddon' if d['por_pack'] else f'{d["packs"]} packs'
        print()
        print(self.c('verde', '  ✅ Pronto!') + f'  {resultado}, {mb:.0f} MiB, em {d["segundos"]:.0f}s (montagem {d["build"]})')
        print(f'  📦 {d["saida"]}')
        print(self.c('cinza', '  Antes de importar, apague do jogo os packs antigos do Addon Pack (Configuracoes > Armazenamento).'))
        print()


def main():
    ap = argparse.ArgumentParser(description='Monta o Addon_Pack_Completo.mcaddon a partir da pasta packs/.')
    ap.add_argument('-o', '--saida', help=f'arquivo de saida (padrao: {SAIDA_PADRAO} na raiz do repositorio)')
    ap.add_argument('--build', type=int, help='numero somado ao 3o numero da versao (padrao: minutos desde 01/10/2026)')
    ap.add_argument('--simples', action='store_true', help='sem cores nem barra animada (uma linha por pack)')
    ap.add_argument('--por-pack', action='store_true', help='gera um .mcaddon separado para cada pack em DESTINO')
    a = ap.parse_args()
    try:
        empacotar(RAIZ, a.saida, a.build, Tela(a.simples), a.por_pack)
    except ErroEmpacotar as e:
        sys.exit(f'ERRO: {e}')
    except KeyboardInterrupt:
        sys.exit('\nCancelado. Nenhum .mcaddon foi criado.')


if __name__ == '__main__': main()
