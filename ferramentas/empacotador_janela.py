#!/usr/bin/env python3
"""Janela do Empacotador do Addon Pack (Windows, e tambem Linux/macOS com Python + Tk).

No Windows vem pronta como "Empacotador Addon Pack.exe" na Release do GitHub: coloque o .exe na pasta
do repositorio (a que tem packs/) e de dois cliques. O comando continua funcionando igual:
    python ferramentas/empacotar.py
"""
import os, queue, subprocess, sys, threading, time
import tkinter as tk
from tkinter import filedialog, font as tkfont, messagebox

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from empacotar import SAIDA_PADRAO, ErroEmpacotar, achar_raiz, empacotar  # noqa: E402

COR = {
    'fundo': '#14151a', 'cartao': '#1e2028', 'borda': '#2c2f3a', 'texto': '#e8e9ee', 'fraco': '#8b8fa3',
    'verde': '#5cd65c', 'verde_escuro': '#2f7d32', 'verde_vivo': '#8af58a', 'trilho': '#2a2d36',
    'roxo': '#a78bfa', 'amarelo': '#ffd166', 'vermelho': '#ff6b6b', 'botao': '#3f9b42', 'botao_sobre': '#4fb853',
}


def pasta_do_programa():
    if getattr(sys, 'frozen', False): return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def abrir(caminho):
    if sys.platform.startswith('win'): os.startfile(caminho)  # noqa: S606 (abre com o programa padrao)
    elif sys.platform == 'darwin': subprocess.Popen(['open', caminho])
    else: subprocess.Popen(['xdg-open', caminho])


class Botao(tk.Canvas):
    """Botao arredondado desenhado a mao, com cor ao passar o mouse."""

    def __init__(self, pai, texto, acao, largura=200, altura=44, cor=None, cor_sobre=None, fonte=None):
        super().__init__(pai, width=largura, height=altura, bg=pai['bg'], highlightthickness=0, cursor='hand2')
        self.texto, self.acao, self.l, self.a = texto, acao, largura, altura
        self.cor, self.cor_sobre, self.fonte = cor or COR['botao'], cor_sobre or COR['botao_sobre'], fonte
        self.ativo = True; self.sobre = False
        self.bind('<Enter>', lambda e: self._sobre(True)); self.bind('<Leave>', lambda e: self._sobre(False))
        self.bind('<Button-1>', lambda e: self.ativo and self.acao())
        self._desenhar()

    def _sobre(self, v):
        self.sobre = v; self._desenhar()

    def configurar(self, texto=None, ativo=None):
        if texto is not None: self.texto = texto
        if ativo is not None: self.ativo = ativo; self.config(cursor='hand2' if ativo else 'arrow')
        self._desenhar()

    def _desenhar(self):
        self.delete('all')
        cor = (self.cor_sobre if self.sobre else self.cor) if self.ativo else COR['borda']
        r, l, a = 10, self.l, self.a
        for x0, y0, x1, y1, ini in ((0, 0, 2 * r, 2 * r, 90), (l - 2 * r, 0, l, 2 * r, 0),
                                    (0, a - 2 * r, 2 * r, a, 180), (l - 2 * r, a - 2 * r, l, a, 270)):
            self.create_arc(x0, y0, x1, y1, start=ini, extent=90, fill=cor, outline=cor)
        self.create_rectangle(r, 0, l - r, a, fill=cor, outline=cor)
        self.create_rectangle(0, r, l, a - r, fill=cor, outline=cor)
        self.create_text(l / 2, a / 2, text=self.texto, fill=COR['texto'] if self.ativo else COR['fraco'], font=self.fonte)


class Barra(tk.Canvas):
    """Barra de progresso em blocos, no estilo da barra de experiencia do Minecraft, com brilho que corre."""

    def __init__(self, pai, largura=560, altura=26, blocos=28):
        super().__init__(pai, width=largura, height=altura, bg=pai['bg'], highlightthickness=0)
        self.l, self.a, self.n = largura, altura, blocos
        self.frac = 0.0; self.fase = 0.0
        self._desenhar()

    def valor(self, frac):
        self.frac = max(0.0, min(1.0, frac)); self._desenhar()

    def animar(self):
        self.fase = (self.fase + 0.04) % 1.4; self._desenhar()

    def _desenhar(self):
        self.delete('all')
        gap = 3
        w = (self.l - gap * (self.n - 1)) / self.n
        cheios = self.frac * self.n
        for i in range(self.n):
            x0 = i * (w + gap); x1 = x0 + w
            self.create_rectangle(x0, 0, x1, self.a, fill=COR['trilho'], outline=COR['borda'])
            parte = max(0.0, min(1.0, cheios - i))
            if parte <= 0: continue
            brilho = abs((i / self.n) - self.fase) < 0.08 and self.frac < 1
            cor = COR['verde_vivo'] if brilho else COR['verde']
            xf = x0 + (x1 - x0) * parte
            self.create_rectangle(x0, 0, xf, self.a, fill=cor, outline='')
            self.create_rectangle(x0, 0, xf, 5, fill=COR['verde_vivo'], outline='')
            self.create_rectangle(x0, self.a - 5, xf, self.a, fill=COR['verde_escuro'], outline='')


class Janela:
    def __init__(self, raiz_tk):
        self.tk = raiz_tk
        self.fila = queue.Queue(); self.trabalhando = False; self.saida_final = None
        self.raiz = achar_raiz(pasta_do_programa(), os.getcwd())
        self.saida = os.path.join(self.raiz, SAIDA_PADRAO) if self.raiz else ''
        self.inicio = 0.0; self.total = 0; self.np = 0

        raiz_tk.title('Addon Pack · Empacotador')
        raiz_tk.configure(bg=COR['fundo'])
        raiz_tk.minsize(640, 600)
        try:
            base = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
            self.icone = tk.PhotoImage(file=os.path.join(base, 'recursos', 'icone.png'))
            raiz_tk.iconphoto(True, self.icone)
        except tk.TclError:
            pass
        familia = 'Segoe UI' if sys.platform.startswith('win') else 'Helvetica'
        self.f_titulo = tkfont.Font(family=familia, size=22, weight='bold')
        self.f_sub = tkfont.Font(family=familia, size=11)
        self.f_texto = tkfont.Font(family=familia, size=10)
        self.f_negrito = tkfont.Font(family=familia, size=10, weight='bold')
        self.f_botao = tkfont.Font(family=familia, size=12, weight='bold')
        self.f_grande = tkfont.Font(family=familia, size=16, weight='bold')
        self.f_mono = tkfont.Font(family='Consolas' if sys.platform.startswith('win') else 'Courier', size=9)

        corpo = tk.Frame(raiz_tk, bg=COR['fundo'], padx=28, pady=22); corpo.pack(fill='both', expand=True)
        self._cabecalho(corpo)
        self._cartao_pastas(corpo)
        self._cartao_progresso(corpo)
        rodape = tk.Label(corpo, text='Prefere o comando? python ferramentas/empacotar.py', bg=COR['fundo'],
                          fg=COR['fraco'], font=self.f_texto)
        rodape.pack(side='bottom', pady=(10, 0))
        self._atualizar_pastas()
        self.tk.after(60, self._tique)

    # ---------------------------------------------------------------- montagem da tela
    def _cabecalho(self, pai):
        topo = tk.Frame(pai, bg=COR['fundo']); topo.pack(fill='x', pady=(0, 16))
        icone = tk.Canvas(topo, width=56, height=56, bg=COR['fundo'], highlightthickness=0); icone.pack(side='left')
        # bloco de grama em pixels
        px = 7
        for y in range(8):
            for x in range(8):
                if y < 2: cor = ('#6cc04a', '#5aa83c', '#7fd35a')[(x * 3 + y) % 3]
                elif y == 2: cor = ('#6cc04a', '#866043')[(x + 1) % 2]
                else: cor = ('#866043', '#79553a', '#96704f')[(x * 5 + y * 3) % 3]
                icone.create_rectangle(x * px, y * px, x * px + px, y * px + px, fill=cor, outline='')
        textos = tk.Frame(topo, bg=COR['fundo']); textos.pack(side='left', padx=14)
        tk.Label(textos, text='ADDON PACK', bg=COR['fundo'], fg=COR['texto'], font=self.f_titulo).pack(anchor='w')
        tk.Label(textos, text='Empacotador · gera o Addon_Pack_Completo.mcaddon', bg=COR['fundo'], fg=COR['roxo'],
                 font=self.f_sub).pack(anchor='w')

    def _cartao(self, pai, **pack):
        borda = tk.Frame(pai, bg=COR['borda'], padx=1, pady=1); borda.pack(fill='x', **pack)
        dentro = tk.Frame(borda, bg=COR['cartao'], padx=18, pady=14); dentro.pack(fill='both', expand=True)
        return dentro

    def _linha_pasta(self, pai, rotulo, acao):
        linha = tk.Frame(pai, bg=COR['cartao']); linha.pack(fill='x', pady=4)
        tk.Label(linha, text=rotulo, bg=COR['cartao'], fg=COR['fraco'], font=self.f_negrito, width=11, anchor='w').pack(side='left')
        valor = tk.Label(linha, text='', bg=COR['cartao'], fg=COR['texto'], font=self.f_texto, anchor='w')
        valor.pack(side='left', fill='x', expand=True)
        b = Botao(linha, 'Trocar…', acao, largura=86, altura=30, cor=COR['borda'], cor_sobre='#3a3e4c', fonte=self.f_texto)
        b.pack(side='right')
        return valor, b

    def _cartao_pastas(self, pai):
        c = self._cartao(pai, pady=(0, 14))
        self.l_raiz, self.b_raiz = self._linha_pasta(c, 'Repositório', self._escolher_raiz)
        self.l_saida, self.b_saida = self._linha_pasta(c, 'Salvar em', self._escolher_saida)
        self.l_info = tk.Label(c, text='', bg=COR['cartao'], fg=COR['fraco'], font=self.f_texto, anchor='w')
        self.l_info.pack(fill='x', pady=(6, 0))

    def _cartao_progresso(self, pai):
        c = self._cartao(pai, pady=(0, 0))
        acoes = tk.Frame(c, bg=COR['cartao']); acoes.pack(fill='x')
        self.b_montar = Botao(acoes, '⛏  Montar .mcaddon', self._montar, largura=230, altura=46, fonte=self.f_botao)
        self.b_montar.pack(side='left')
        self.l_estado = tk.Label(acoes, text='Pronto para montar.', bg=COR['cartao'], fg=COR['fraco'], font=self.f_sub, anchor='w')
        self.l_estado.pack(side='left', padx=16)

        self.l_pct = tk.Label(c, text='0%', bg=COR['cartao'], fg=COR['texto'], font=self.f_grande, anchor='w')
        self.l_pct.pack(fill='x', pady=(16, 4))
        self.barra = Barra(c, largura=580); self.barra.pack(fill='x')
        self.l_detalhe = tk.Label(c, text=' ', bg=COR['cartao'], fg=COR['fraco'], font=self.f_texto, anchor='w')
        self.l_detalhe.pack(fill='x', pady=(6, 10))

        moldura = tk.Frame(c, bg=COR['borda'], padx=1, pady=1); moldura.pack(fill='both', expand=True)
        self.log = tk.Text(moldura, height=9, bg='#101116', fg=COR['texto'], font=self.f_mono, relief='flat', highlightthickness=0,
                           padx=10, pady=8, state='disabled', wrap='none', insertbackground=COR['texto'])
        self.log.pack(fill='both', expand=True)
        self.log.tag_config('ok', foreground=COR['verde']); self.log.tag_config('fraco', foreground=COR['fraco'])
        self.log.tag_config('erro', foreground=COR['vermelho']); self.log.tag_config('destaque', foreground=COR['amarelo'])

        self.depois = tk.Frame(c, bg=COR['cartao'])
        self.b_minecraft = Botao(self.depois, '▶  Abrir no Minecraft', self._abrir_minecraft, largura=200, altura=40, fonte=self.f_negrito)
        self.b_minecraft.pack(side='left', pady=(12, 0))
        Botao(self.depois, '📁  Abrir pasta', self._abrir_pasta, largura=150, altura=40, cor=COR['borda'],
              cor_sobre='#3a3e4c', fonte=self.f_negrito).pack(side='left', padx=10, pady=(12, 0))

    # ---------------------------------------------------------------- acoes
    def _escreve(self, texto, tag=None):
        self.log.config(state='normal'); self.log.insert('end', texto + '\n', tag); self.log.see('end')
        self.log.config(state='disabled')

    def _atualizar_pastas(self):
        self.l_raiz.config(text=self.raiz or 'não encontrada: escolha a pasta do repositório (a que tem packs/)',
                           fg=COR['texto'] if self.raiz else COR['amarelo'])
        self.l_saida.config(text=self.saida or '-')
        if self.raiz:
            pasta = os.path.join(self.raiz, 'packs')
            n = sum(1 for d in os.listdir(pasta) if os.path.isfile(os.path.join(pasta, d, 'manifest.json')))
            self.l_info.config(text=f'{n} packs encontrados em packs/')
        else:
            self.l_info.config(text='Dica: coloque o .exe dentro da pasta do repositório para ele achar sozinho.')
        self.b_montar.configurar(ativo=bool(self.raiz) and not self.trabalhando)

    def _escolher_raiz(self):
        if self.trabalhando: return
        d = filedialog.askdirectory(title='Pasta do repositório addon-pack (a que tem packs/)')
        if not d: return
        r = achar_raiz(d)
        if not r: messagebox.showwarning('Addon Pack', 'Essa pasta não tem a pasta packs/.'); return
        self.raiz = r; self.saida = os.path.join(r, SAIDA_PADRAO); self._atualizar_pastas()

    def _escolher_saida(self):
        if self.trabalhando: return
        f = filedialog.asksaveasfilename(title='Salvar o .mcaddon em', defaultextension='.mcaddon', initialfile=SAIDA_PADRAO,
                                         filetypes=[('Addon do Minecraft', '*.mcaddon')])
        if f: self.saida = f; self._atualizar_pastas()

    def _montar(self):
        if self.trabalhando or not self.raiz: return
        self.trabalhando = True; self.saida_final = None
        self.depois.pack_forget()
        self.b_montar.configurar('Montando…', ativo=False); self.b_raiz.configurar(ativo=False); self.b_saida.configurar(ativo=False)
        self.log.config(state='normal'); self.log.delete('1.0', 'end'); self.log.config(state='disabled')
        self.barra.valor(0); self.l_pct.config(text='0%', fg=COR['texto'])
        self.l_estado.config(text='Lendo os packs…', fg=COR['amarelo'])
        self.inicio = time.monotonic()
        threading.Thread(target=self._trabalho, daemon=True).start()

    def _trabalho(self):
        try:
            empacotar(self.raiz, self.saida, None, lambda ev, d: self.fila.put((ev, d)))
        except ErroEmpacotar as e:
            self.fila.put(('erro', str(e)))
        except Exception as e:  # noqa: BLE001 (mostra qualquer falha na janela em vez de fechar)
            self.fila.put(('erro', f'{type(e).__name__}: {e}'))

    def _tique(self):
        try:
            while True:
                ev, d = self.fila.get_nowait()
                getattr(self, '_ev_' + ev)(d)
        except queue.Empty:
            pass
        if self.trabalhando:
            self.barra.animar()
            gasto = time.monotonic() - self.inicio
            frac = self.barra.frac
            falta = f' · falta ~{int(gasto / frac - gasto)}s' if frac > 0.03 else ''
            if hasattr(self, 'pack_atual'):
                self.l_detalhe.config(text=f'[{self.n_atual}/{self.np}]  {self.pack_atual}   ·   {int(gasto)}s{falta}')
        self.tk.after(60, self._tique)

    def _ev_inicio(self, d):
        self.total, self.np = d['arquivos'], d['packs']
        self.l_estado.config(text=f'Montando {d["packs"]} packs ({d["arquivos"]:,} arquivos)'.replace(',', '.'))
        self._escreve(f'Montagem {d["build"]} · {d["packs"]} packs', 'destaque')

    def _ev_pack(self, d):
        if hasattr(self, 'pack_atual') and d['indice'] > 1: self._escreve(f'  ✔ {self.pack_atual}', 'ok')
        self.n_atual, self.pack_atual = d['indice'], d['nome']

    def _ev_arquivo(self, d):
        frac = d['feitos'] / d['total'] if d['total'] else 0
        self.barra.valor(frac); self.l_pct.config(text=f'{frac * 100:.0f}%')

    def _ev_fim(self, d):
        self._escreve(f'  ✔ {self.pack_atual}', 'ok')
        mb = d['bytes'] / 1048576
        self._escreve(f'\nPronto! {mb:.0f} MiB em {d["segundos"]:.0f}s', 'ok')
        self._escreve('Antes de importar, apague do jogo os packs antigos do Addon Pack.', 'fraco')
        self.saida_final = d['saida']
        self.barra.valor(1); self.l_pct.config(text='100% ✔', fg=COR['verde'])
        self.l_estado.config(text='✅ Pronto! O .mcaddon foi criado.', fg=COR['verde'])
        self.l_detalhe.config(text=d['saida'])
        self._acabou()
        self.depois.pack(fill='x')

    def _ev_erro(self, msg):
        self._escreve(f'\nERRO: {msg}', 'erro')
        self.l_estado.config(text='Falhou. Nenhum .mcaddon foi criado.', fg=COR['vermelho'])
        self._acabou()

    def _acabou(self):
        self.trabalhando = False
        self.b_montar.configurar('⛏  Montar de novo', ativo=True); self.b_raiz.configurar(ativo=True); self.b_saida.configurar(ativo=True)
        self.tk.bell()

    def _abrir_minecraft(self):
        if self.saida_final and os.path.exists(self.saida_final):
            try: abrir(self.saida_final)
            except OSError as e: messagebox.showerror('Addon Pack', f'Não consegui abrir: {e}')

    def _abrir_pasta(self):
        if self.saida_final: abrir(os.path.dirname(self.saida_final))


def main():
    if sys.platform.startswith('win'):
        try:
            import ctypes
            ctypes.windll.shcore.SetProcessDpiAwareness(1)  # letra nitida em telas com zoom
        except Exception:  # noqa: BLE001
            pass
    raiz = tk.Tk()
    Janela(raiz)
    raiz.mainloop()


if __name__ == '__main__': main()
