"""Modelo 3D da Relíquia dos Videntes (luneta), refeito do zero (pedido do João, 2026-10-28).

O modelo antigo era a luneta do A&S (geometry.oreville_ans.ugcyda) com UV em caixa e um cubo de 6,2 px: o jogo
arredonda a caixa de UV e as faces saíam desalinhadas. Este usa UV por face, medidas inteiras (o corpo fica 0,1 px
maior com "inflate", como antes) e uma textura em que cada lateral é simétrica, então nenhuma face pode sair
espelhada ou girada.

Os ossos mantêm os nomes, pivôs e o "binding" da luneta do A&S, porque as animações dele (segurar, mirar, andar)
mexem nesses ossos: a luneta continua na mesma posição na mão.

Grava:
  packs/RP_UnifiedCore/models/entity/seers_relic.geo.json
  packs/RP_UnifiedCore/textures/unified/seers_relic_model.png
e, com --previa CAMINHO, uma imagem do modelo em 3D.
"""
import json, math, os, sys
from PIL import Image, ImageDraw

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UC = os.path.join(RAIZ, 'packs', 'RP_UnifiedCore')
GEO_ID = 'geometry.unified.seers_relic'

# paleta da luneta preta com ouro (a mesma da textura anterior)
OURO, OURO_CLARO, OURO_ESC = (250, 194, 83), (249, 223, 116), (189, 106, 40)
PRETO, CINZA_ESC, CINZA = (16, 16, 20), (34, 34, 42), (56, 56, 68)
VIDRO, VIDRO_ESC = (213, 221, 232), (151, 163, 180)

CORPO = [OURO_ESC, OURO, OURO_CLARO, OURO_CLARO, OURO, OURO_ESC]  # 6 px, simétrico
OCULAR = [PRETO, CINZA_ESC, CINZA, CINZA_ESC, PRETO]              # 5 px, simétrico
REGIOES = {  # nome: (u, v, largura, altura, pixels por linha)
    'corpo': (0, 0, 6, 2, [CORPO, CORPO]),
    'ocular': (0, 2, 5, 2, [OCULAR, OCULAR]),
    'lente': (6, 0, 2, 2, [[VIDRO, VIDRO_ESC], [VIDRO_ESC, VIDRO]]),
    'aro': (8, 0, 2, 2, [[OURO_ESC, OURO_ESC], [OURO_ESC, OURO_ESC]]),
    'olho': (6, 2, 2, 2, [[PRETO, CINZA_ESC], [CINZA_ESC, PRETO]]),
    'fundo': (8, 2, 2, 2, [[PRETO, PRETO], [PRETO, PRETO]]),
}


def textura():
    im = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    for u, v, w, h, px in REGIOES.values():
        for y in range(h):
            for x in range(w): im.putpixel((u + x, v + y), px[y][x] + (255,))
    return im


def uv(lado, ponta_oeste, ponta_leste):
    """Cubo deitado no eixo x: as 4 laterais usam `lado`, as pontas oeste (-x) e leste (+x) as outras regiões."""
    def r(n): u, v, w, h, _ = REGIOES[n]; return {'uv': [u, v], 'uv_size': [w, h]}
    return {'north': r(lado), 'south': r(lado), 'up': r(lado), 'down': r(lado), 'west': r(ponta_oeste), 'east': r(ponta_leste)}


def geometria():
    # mesmos ossos e posição da luneta do A&S; o cubo de 6,2 px virou 6 px com inflate 0,1
    return {'format_version': '1.16.0', 'minecraft:geometry': [{
        'description': {'identifier': GEO_ID, 'texture_width': 16, 'texture_height': 16,
                        'visible_bounds_width': 3, 'visible_bounds_height': 2.5, 'visible_bounds_offset': [0, 0.75, 0]},
        'bones': [
            {'name': 'khq8d2kk', 'pivot': [0, 0, 0], 'binding': "c.item_slot=='torso'?'body':q.item_slot_to_bone_name(c.item_slot)"},
            {'name': 'khq8d2kk_2pak', 'parent': 'khq8d2kk', 'pivot': [0, 0, -5.25], 'cubes': [
                {'origin': [-5, -1, -1], 'size': [5, 2, 2], 'pivot': [0, 0, 0], 'rotation': [0, -90, 0], 'uv': uv('ocular', 'fundo', 'olho')},
                {'origin': [-11, -1, -1], 'size': [6, 2, 2], 'inflate': 0.1, 'pivot': [0, 0, 0], 'rotation': [0, -90, 0], 'uv': uv('corpo', 'lente', 'aro')},
            ]},
        ]}]}


def previa(caminho, tex, geo):
    """Desenho isométrico simples do modelo (sem a rotação dos cubos), para conferir as faces."""
    S, W, H = 34, 900, 420
    img = Image.new('RGBA', (W, H), (30, 30, 38, 255))
    dr = ImageDraw.Draw(img)
    yaw, pitch = math.radians(35), math.radians(-28)

    def proj(p):
        x, y, z = p
        x, z = x * math.cos(yaw) - z * math.sin(yaw), x * math.sin(yaw) + z * math.cos(yaw)
        y, z = y * math.cos(pitch) - z * math.sin(pitch), y * math.sin(pitch) + z * math.cos(pitch)
        return (W / 2 + x * S + 3.2 * S, H / 2 - y * S), z

    faces = []
    for c in geo['minecraft:geometry'][0]['bones'][1]['cubes']:
        i = c.get('inflate', 0)
        (x0, y0, z0), (sx, sy, sz) = c['origin'], c['size']
        a, b = (x0 - i, y0 - i, z0 - i), (x0 + sx + i, y0 + sy + i, z0 + sz + i)
        # cada face: canto de origem, vetor u, vetor v (em blocos 3D) e luz
        defs = {
            'north': ((b[0], b[1], a[2]), (a[0] - b[0], 0, 0), (0, a[1] - b[1], 0), 0.8),
            'south': ((a[0], b[1], b[2]), (b[0] - a[0], 0, 0), (0, a[1] - b[1], 0), 0.8),
            'west': ((a[0], b[1], a[2]), (0, 0, b[2] - a[2]), (0, a[1] - b[1], 0), 0.6),
            'east': ((b[0], b[1], b[2]), (0, 0, a[2] - b[2]), (0, a[1] - b[1], 0), 0.6),
            'up': ((a[0], b[1], a[2]), (b[0] - a[0], 0, 0), (0, 0, b[2] - a[2]), 1.0),
            'down': ((a[0], a[1], b[2]), (b[0] - a[0], 0, 0), (0, 0, a[2] - b[2]), 0.5),
        }
        for nome, (o, du, dv, luz) in defs.items():
            (u, v), (w, h) = c['uv'][nome]['uv'], c['uv'][nome]['uv_size']
            for ty in range(h):
                for tx in range(w):
                    cor = tex.getpixel((u + tx, v + ty))
                    if cor[3] == 0: continue
                    q = [tuple(o[k] + du[k] * (tx + ex) / w + dv[k] * (ty + ey) / h for k in range(3))
                         for ex, ey in ((0, 0), (1, 0), (1, 1), (0, 1))]
                    pts = [proj(p) for p in q]
                    faces.append((sum(z for _, z in pts) / 4, [p for p, _ in pts], tuple(int(ch * luz) for ch in cor[:3])))
    for _, pts, cor in sorted(faces, key=lambda f: -f[0]):
        dr.polygon(pts, fill=cor + (255,), outline=cor + (255,))
    dr.text((16, 12), 'Reliquia dos Videntes - modelo novo (UV por face, 16x16)', fill='white')
    big = tex.resize((16 * 12, 16 * 12), Image.NEAREST)
    img.paste(big, (W - 16 * 12 - 20, H - 16 * 12 - 20), big)
    img.save(caminho)


if __name__ == '__main__':
    tex, geo = textura(), geometria()
    os.makedirs(os.path.join(UC, 'models', 'entity'), exist_ok=True)
    with open(os.path.join(UC, 'models', 'entity', 'seers_relic.geo.json'), 'w', encoding='utf-8') as f:
        json.dump(geo, f, ensure_ascii=False, indent=2)
    tex.save(os.path.join(UC, 'textures', 'unified', 'seers_relic_model.png'))
    if '--previa' in sys.argv: previa(sys.argv[sys.argv.index('--previa') + 1], tex, geo)
