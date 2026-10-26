"""Texturas e modelo do Atril Arcano (Forsaken Grimoires), em pixel art 16x16.

Grava em packs/RP_ForsakenGrimoire:
  - textures/fgr/lectern_{base,sides,front,top,book}.png e lectern.png (icone)
  - models/blocks/fgr_lectern.geo.json (base, coluna, tampo e o Grimorio aberto em cima)
e registra 'fgr_lectern_book' no terrain_texture.json e no bloco (BP_ForsakenGrimoire/blocks/arcane_lectern.json).
Precisa do Pillow. Rode de novo depois de mexer nos desenhos abaixo.
"""
import json, os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RP = os.path.join(RAIZ, 'packs', 'RP_ForsakenGrimoire')
BP = os.path.join(RAIZ, 'packs', 'BP_ForsakenGrimoire')

# paleta: madeira escura (carvalho escuro), ouro, roxo arcano, papel
P = {
    '.': (0, 0, 0, 0),
    'a': (42, 26, 16), 'b': (58, 36, 22), 'c': (74, 47, 29), 'd': (92, 60, 37), 'e': (112, 75, 46),
    'G': (110, 70, 14), 'g': (176, 122, 26), 'y': (232, 182, 52), 'Y': (255, 236, 150),
    'p': (34, 14, 54), 'q': (56, 24, 88), 'r': (80, 36, 124), 's': (110, 56, 168), 't': (150, 92, 214),
    'R': (196, 140, 255), 'W': (240, 220, 255),
    'w': (238, 226, 196), 'v': (214, 198, 160), 'u': (170, 150, 112), 'k': (90, 70, 60),
}

DESENHOS = {
    # tampo e base vistos de cima: tabuas escuras com moldura de ouro e cravos nos cantos
    'base': [
        'GggggggggggggggG',
        'gyccdddcccddddcg',
        'gcbbccbbbbbcbbbg',
        'gdcccccdccccccdg',
        'gaaaaaaaaaaaaaag',
        'gddecddddddcdddg',
        'gccccbcccccccbcg',
        'gbbbbbbbbbbbbbbg',
        'gaaaaaaaaaaaaaag',
        'gdddcdddddecdddg',
        'gccbcccccbcccccg',
        'gbbbbbbbbbbbbbbg',
        'gaaaaaaaaaaaaaag',
        'gdcddddcddddddcg',
        'gccccccccccccyyg',
        'GggggggggggggggG',
    ],
    # laterais: linhas 0-7 = faixa do tampo (ouro com runas roxas); 14-15 = borda da base
    'sides': [
        'GgggggggggggggggG'[:16],
        'gqrsrqrsrqrsrqrg',
        'gRqsqRqsqRqsqRqg',
        'GgggggggggggggggG'[:16],
        'GgggggggggggggggG'[:16],
        'gqrsrqrsrqrsrqrg',
        'gRqsqRqsqRqsqRqg',
        'GgggggggggggggggG'[:16],
        'bcccdccccdcccdcb',
        'abbbbbbbbbbbbbba',
        'bcdcccccdcccccdb',
        'abbbbbbbbbbbbbba',
        'bccccdcccccdcccb',
        'aaaaaaaaaaaaaaaa',
        'GgggyggggggyggggG'[:16],
        'abbcbbbbbcbbbbca',
    ],
    # coluna: colunas 8-15 (linhas 1-13 = lados; 0-7 = topo/fundo). Talho com runa roxa brilhando no meio
    'front': [
        'aaaaaaaaGggggggG',
        'aaaaaaaagyggggyg',
        'aaaaaaaaabcddcba',
        'aaaaaaaaabqrrqba',
        'aaaaaaaaacqtsqca',
        'aaaaaaaaabqRsqba',
        'aaaaaaaaacqsRqca',
        'aaaaaaaaabqRtqba',
        'aaaaaaaaacqtsqca',
        'aaaaaaaaabqsRqba',
        'aaaaaaaaacqrrqca',
        'aaaaaaaaabcddcba',
        'aaaaaaaaacbccbca',
        'aaaaaaaagyggggyg',
        'aaaaaaaaGggggggG',
        'aaaaaaaaaaaaaaaa',
    ],
    # topo do tampo: veludo roxo com borda de ouro e um circulo arcano (o livro cobre o meio)
    'top': [
        'GggggggggggggggG',
        'gyqqqqqqqqqqqqyg',
        'gqrrrrrrrrrrrrqg',
        'gqrsssRssRsssrqg',
        'gqrsRsssssssRsrqg'[:16],
        'gqrssssqqssssrqg',
        'gqrRssqrrqssRrqg',
        'gqrsssqrtrqssrqg'[:16],
        'gqrsssqtrqsssrqg',
        'gqrRssqrrqssRrqg',
        'gqrssssqqssssrqg',
        'gqrsRsssssssRsrg'[:16],
        'gqrsssRssRsssrqg',
        'gqrrrrrrrrrrrrqg',
        'gyqqqqqqqqqqqqyg',
        'GggggggggggggggG',
    ],
    # livro aberto: x0-5 pagina esquerda, x6-11 pagina direita (linhas 0-8), x12-15 capa; linhas 9-15 capa e bordas
    'book': [
        'wwwwwvvwwwwwqrrq',
        'wkkkwvvwkkkwrsYr',
        'wwwwwvvwwwwwrYsr',
        'wkkkkvvkkkkwqrrq',
        'wwwwwvvwwwwwrsYr',
        'wkRkwvvwkRkwrYsr',
        'wwRRwvvwRRwwqrrq',
        'wkkkwvvwkkkwrsYr',
        'wwwwwvvwwwwwrYsr',
        'qrrrrrqrrrrrqgyq',
        'rssssrrssssrrgyr',
        'rsYysrrsyYsrrgyr',
        'rsyYsrrsYysrrgyr',
        'rssssrrssssrrgyr',
        'qrrrrrqrrrrrqgyq',
        'uuuuuuwwwwwwuuuu',
    ],
}


def imagem(linhas):
    im = Image.new('RGBA', (16, 16))
    px = im.load()
    for y, linha in enumerate(linhas):
        linha = (linha + linha[-1] * 16)[:16]
        for x, ch in enumerate(linha):
            c = P[ch]
            px[x, y] = c if len(c) == 4 else c + (255,)
    return im


def uv(u, v, w, h, mat):
    return {'uv': [u, v], 'uv_size': [w, h], 'material_instance': mat}


def geometria():
    lados = lambda v, h, mat: {f: uv(0, v, 16, h, mat) for f in ('north', 'south')}
    base = {'origin': [-8, 0, -8], 'size': [16, 2, 16], 'uv': {
        **{f: uv(0, 14, 16, 2, 'sides') for f in ('north', 'south', 'east', 'west')},
        'up': uv(0, 0, 16, 16, 'base'), 'down': uv(0, 0, 16, 16, 'base')}}
    coluna = {'origin': [-4, 2, -4], 'size': [8, 10, 8], 'uv': {
        **{f: uv(8, 2, 8, 10, 'front') for f in ('north', 'south', 'east', 'west')},
        'up': uv(8, 0, 8, 8, 'front'), 'down': uv(8, 0, 8, 8, 'front')}}
    # capitel e pe da coluna (molduras de ouro)
    pe = {'origin': [-5, 2, -5], 'size': [10, 1, 10], 'uv': {
        **{f: uv(0, 14, 10, 1, 'sides') for f in ('north', 'south', 'east', 'west')},
        'up': uv(0, 0, 10, 10, 'base'), 'down': uv(0, 0, 10, 10, 'base')}}
    capitel = {'origin': [-5, 11, -5], 'size': [10, 1, 10], 'uv': {
        **{f: uv(0, 14, 10, 1, 'sides') for f in ('north', 'south', 'east', 'west')},
        'up': uv(0, 0, 10, 10, 'base'), 'down': uv(0, 0, 10, 10, 'base')}}
    tampo = {'origin': [-8, 12, -6], 'size': [16, 3, 14], 'uv': {
        **lados(0, 3, 'sides'),
        'east': uv(0, 4, 14, 3, 'sides'), 'west': uv(0, 4, 14, 3, 'sides'),
        'up': uv(0, 0, 16, 16, 'top'), 'down': uv(0, 0, 16, 14, 'base')}}
    capa = {'origin': [-6.5, 15, -4], 'size': [13, 0.5, 10], 'uv': {
        **{f: uv(0, 15, 12, 1, 'book') for f in ('north', 'south', 'east', 'west')},
        'up': uv(0, 9, 12, 6, 'book'), 'down': uv(0, 9, 12, 6, 'book')}}
    pag = lambda x0, u: {'origin': [x0, 15.5, -3.5], 'size': [6, 1, 9], 'uv': {
        **{f: uv(0, 15, 6, 1, 'book') for f in ('north', 'south', 'east', 'west')},
        'up': uv(u, 0, 6, 9, 'book'), 'down': uv(12, 0, 4, 9, 'book')}}
    ossos = [
        {'name': 'base', 'pivot': [0, 0, 0], 'cubes': [base, pe]},
        {'name': 'post', 'parent': 'base', 'pivot': [0, 2, 0], 'cubes': [coluna, capitel]},
        {'name': 'top', 'parent': 'base', 'pivot': [0, 12, 0], 'cubes': [tampo]},
        {'name': 'book', 'parent': 'top', 'pivot': [0, 15, 0], 'cubes': [capa]},
        {'name': 'page_left', 'parent': 'book', 'pivot': [0, 15.5, 0], 'rotation': [0, 0, -6], 'cubes': [pag(-6, 0)]},
        {'name': 'page_right', 'parent': 'book', 'pivot': [0, 15.5, 0], 'rotation': [0, 0, 6], 'cubes': [pag(0, 6)]},
    ]
    return {'format_version': '1.12.0', 'minecraft:geometry': [{'description': {
        'identifier': 'geometry.fgr_lectern', 'texture_width': 16, 'texture_height': 16,
        'visible_bounds_width': 2, 'visible_bounds_height': 2, 'visible_bounds_offset': [0, 0.5, 0]}, 'bones': ossos}]}


def gravar_json(caminho, dados):
    with open(caminho, 'w', encoding='utf-8') as f:
        f.write(json.dumps(dados, ensure_ascii=False, separators=(',', ':')))


def main():
    pasta = os.path.join(RP, 'textures', 'fgr')
    for nome, linhas in DESENHOS.items():
        imagem(linhas).save(os.path.join(pasta, f'lectern_{nome}.png'))
    # icone: o tampo com o livro por cima
    icone = imagem(DESENHOS['top'])
    livro = imagem(DESENHOS['book']).crop((0, 0, 12, 9))
    icone.paste(livro, (2, 4), livro)
    icone.save(os.path.join(pasta, 'lectern.png'))
    gravar_json(os.path.join(RP, 'models', 'blocks', 'fgr_lectern.geo.json'), geometria())
    tt = os.path.join(RP, 'textures', 'terrain_texture.json')
    t = json.load(open(tt, encoding='utf-8'))
    t['texture_data']['fgr_lectern_book'] = {'textures': 'textures/fgr/lectern_book'}
    gravar_json(tt, t)
    bl = os.path.join(BP, 'blocks', 'arcane_lectern.json')
    b = json.load(open(bl, encoding='utf-8'))
    b['minecraft:block']['components']['minecraft:material_instances']['book'] = {'texture': 'fgr_lectern_book', 'render_method': 'opaque'}
    gravar_json(bl, b)
    print('atril: 6 texturas, modelo com livro aberto')


if __name__ == '__main__': main()
