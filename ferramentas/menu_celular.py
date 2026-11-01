#!/usr/bin/env python3
"""Menu do Empacotador para o celular (Termux no Android).

Uso, de dentro da pasta do repositorio:
    python ferramentas/menu_celular.py          menu com opcoes
    python ferramentas/menu_celular.py --montar monta direto e oferece abrir no Minecraft
O comando de sempre continua valendo: python ferramentas/empacotar.py
"""
import os, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from empacotar import PASTA_POR_PACK, RAIZ, SAIDA_PADRAO, ErroEmpacotar, Tela, empacotar  # noqa: E402

DOWNLOADS = os.path.expanduser('~/storage/downloads')
T = Tela()


def destino(por_pack=False):
    """No Termux com acesso aos arquivos, salva em Download (onde o gerenciador de arquivos acha)."""
    nome = PASTA_POR_PACK if por_pack else SAIDA_PADRAO
    if os.path.isdir(DOWNLOADS): return os.path.join(DOWNLOADS, nome)
    return os.path.join(RAIZ, nome)


def abrir_no_minecraft(arq):
    if not os.path.exists(arq):
        print(T.c('vermelho', '  Ainda nao existe um .mcaddon montado. Use a opcao 1 primeiro.')); return
    if shutil.which('termux-open'):
        subprocess.run(['termux-open', arq])
        print(T.c('cinza', '  Escolha "Minecraft" na lista que o Android abrir.'))
    else:
        print(f'  Abra este arquivo com o Minecraft pelo gerenciador de arquivos:\n  {arq}')


def montar(por_pack=False):
    try:
        info = empacotar(RAIZ, destino(por_pack), None, Tela(), por_pack)
    except ErroEmpacotar as e:
        print(T.c('vermelho', f'  ERRO: {e}')); return None
    except KeyboardInterrupt:
        print(T.c('amarelo', '\n  Cancelado. A montagem foi interrompida.')); return None
    if not DOWNLOADS or not os.path.isdir(DOWNLOADS):
        print(T.c('amarelo', '  Dica: rode "termux-setup-storage" uma vez para salvar direto na pasta Download.'))
    return info['saida']


def perguntar(texto):
    try: return input(texto).strip().lower()
    except EOFError: return ''


def menu():
    while True:
        arq = destino()
        existe = os.path.exists(arq)
        w = min(40, max(28, shutil.get_terminal_size((40, 20)).columns - 5))
        print()
        print(T.c('roxo', '  ╭' + '─' * w + '╮'))
        print(T.c('roxo', '  │') + T.c('negrito', '  ⛏  ADDON PACK · celular'.ljust(w)) + T.c('roxo', '│'))
        print(T.c('roxo', '  ╰' + '─' * w + '╯'))
        estado = f'{os.path.getsize(arq) / 1048576:.0f} MiB pronto' if existe else 'nenhum montado ainda'
        print(T.c('cinza', f'  .mcaddon: {estado}'))
        print()
        print(f'  {T.c("verde", "1")}  Montar o .mcaddon')
        print(f'  {T.c("verde", "2")}  Baixar pack por pack')
        print(f'  {T.c("verde", "3")}  Abrir no Minecraft')
        print(f'  {T.c("verde", "4")}  Montar e abrir no Minecraft')
        print(f'  {T.c("verde", "5")}  Onde fica o arquivo')
        print(f'  {T.c("verde", "0")}  Sair')
        op = perguntar(T.c('amarelo', '\n  Escolha: '))
        if op == '1': montar()
        elif op == '2': montar(por_pack=True)
        elif op == '3':
            abrir_no_minecraft(arq)
        elif op == '4':
            feito = montar()
            if feito: abrir_no_minecraft(feito)
        elif op == '5': print(f'  Arquivo único: {arq}\n  Packs separados: {destino(True)}')
        elif op in ('0', 'q', 'sair', ''): return
        else: print(T.c('vermelho', '  Opcao invalida.'))


def main():
    if '--montar' in sys.argv:
        feito = montar()
        if feito and perguntar(T.c('amarelo', '  Abrir no Minecraft agora? (s/n) ')) in ('s', 'sim', 'y'):
            abrir_no_minecraft(feito)
        return
    menu()


if __name__ == '__main__': main()
