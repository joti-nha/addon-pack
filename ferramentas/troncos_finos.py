"""Texturas que faltam no Better on Bedrock: troncos finos descascados de cerejeira, mangue e carvalho-pálido.

O terrain_texture.json do BoB aponta para textures/blocks/thin_logs/small_log_<madeira>_stripped_{side,top},
mas os arquivos nunca vieram no pack (o bloco aparecia roxo e preto).
A lateral é a textura descascada do jogo (cópia do A&S SP2, guardada em ferramentas/recursos/troncos) recortada em 12 px de largura.
O topo usa o miolo do small_log_<madeira>_top e troca o anel de casca pela madeira descascada.
Precisa do Pillow.
"""
import os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FINOS = os.path.join(RAIZ, 'packs', 'RP_Better_on_Bedrock_1_1_resources', 'textures', 'blocks', 'thin_logs')
VANILLA = os.path.join(RAIZ, 'ferramentas', 'recursos', 'troncos')

for madeira in ('cherry', 'mangrove', 'pale_oak'):
    lado_v = Image.open(os.path.join(VANILLA, f'stripped_{madeira}_log_side.png')).convert('RGBA')
    topo = Image.open(os.path.join(FINOS, f'small_log_{madeira}_top.png')).convert('RGBA')
    lado = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    lado.paste(lado_v.crop((2, 0, 14, 16)), (2, 0))
    novo_topo = topo.copy()
    for y in range(16):
        for x in range(16):
            miolo = 4 <= x <= 11 and 4 <= y <= 11
            if topo.getpixel((x, y))[3] and not miolo:
                novo_topo.putpixel((x, y), lado_v.getpixel((x, y)))
    lado.save(os.path.join(FINOS, f'small_log_{madeira}_stripped_side.png'))
    novo_topo.save(os.path.join(FINOS, f'small_log_{madeira}_stripped_top.png'))
    print(madeira, 'ok')
