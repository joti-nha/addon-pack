"""Separa as páginas de glifos que o Better on Bedrock e o Cataclysmical dividiam com o Dungeons e o Forsaken.

Cada página (font/glyph_XX.png) cobre os caracteres U+XX00 a U+XXFF e só vale a do pack mais alto na lista,
então os ícones de um pack apareciam trocados pelos de outro. O Dungeons fica com a E3 e o Forsaken com a E4;
o BoB vai para E5/E6 e o Cataclysmical para E7/E9. O script renomeia as imagens e troca os caracteres
(crus ou como \\uE3xx) nos textos, JSON e scripts dos dois packs e no dicionário de tradução.
Rodar de novo não muda nada.
"""
import glob, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOVER = {
    'Better_on_Bedrock_1_1': {0xE3: 0xE5, 0xE4: 0xE6},
    'Cataclysmical': {0xE3: 0xE7, 0xE4: 0xE9},
}
# O  nos hud_screen.json é um marcador de texto compartilhado por vários packs, não um ícone.
NAO_MEXER = {'hud_screen.json'}


def trocar(s, mapa):
    def cru(m):
        c = ord(m.group())
        return chr((mapa[c >> 8] << 8) | (c & 0xFF))
    def esc(m):
        c = int(m.group(1), 16)
        novo = (mapa[c >> 8] << 8) | (c & 0xFF)
        return '\\u' + (f'{novo:04X}' if m.group(1).isupper() else f'{novo:04x}')
    s = re.sub('[' + ''.join(chr(p << 8) + '-' + chr((p << 8) | 0xFF) for p in mapa) + ']', cru, s)
    s = re.sub(r'\\u((?:' + '|'.join(f'{p:02x}|{p:02X}' for p in mapa) + r')[0-9a-fA-F]{2})', esc, s)
    return s


def gravar_se_mudou(f, novo_texto, b, bom):
    novo = (b'\xef\xbb\xbf' if bom else b'') + novo_texto.encode('utf-8')
    if novo != b:
        open(f, 'wb').write(novo)
        return True
    return False


for nome, mapa in MOVER.items():
    pastas = [p for p in glob.glob(os.path.join(RAIZ, 'packs', '*')) if nome in os.path.basename(p)]
    for pasta in pastas:
        for velha, nova in mapa.items():
            a = os.path.join(pasta, 'font', f'glyph_{velha:02X}.png')
            if os.path.exists(a):
                os.replace(a, os.path.join(pasta, 'font', f'glyph_{nova:02X}.png'))
                print('página', os.path.basename(pasta), f'{velha:02X} -> {nova:02X}')
        for f in glob.glob(os.path.join(pasta, '**', '*'), recursive=True):
            if not f.endswith(('.lang', '.json', '.js', '.mcfunction')) or os.path.basename(f) in NAO_MEXER: continue
            b = open(f, 'rb').read()
            bom = b.startswith(b'\xef\xbb\xbf')
            try: s = b[3:].decode('utf-8') if bom else b.decode('utf-8')
            except UnicodeDecodeError: continue
            if gravar_se_mudou(f, trocar(s, mapa), b, bom):
                print('texto', os.path.relpath(f, RAIZ))

# Chaves e textos do Cataclysmical guardados no dicionário de tradução
dic = os.path.join(RAIZ, 'ferramentas', 'recursos', 'traducao_ptbr.json')
b = open(dic, 'rb').read()
s = b.decode('utf-8')
linhas = []
for l in s.split('\n'):
    if 'Trinkets Bag' in l or 'Bolsa de Bugigangas' in l: l = trocar(l, MOVER['Cataclysmical'])
    linhas.append(l)
if gravar_se_mudou(dic, '\n'.join(linhas), b, False): print('texto', os.path.relpath(dic, RAIZ))
