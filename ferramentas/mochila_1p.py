#!/usr/bin/env python3
"""Mochilas do OTG em primeira pessoa com o jogador do A&S: em pé na mão, mais para cima (pedidos do João, 2026-10-29 e 2026-10-31).

Uso: python ferramentas/mochila_1p.py

O OTG acerta a mochila na mão para o braço de primeira pessoa do jogo base (rotação [95, -45, 115], posição
[13.5, -10, 12], rightitem z -1). Com qualquer item na mão, o A&S soma ao braço a pose de segurar
(animation.oreville_ans.rikfbu: [-10, 40, 65] e [1, 4, -6]) e deixa o rightitem em z 0. Este script parte da pose
original do OTG (em pé, de frente para a câmera, mas baixa e cortada na borda da tela), sobe a mochila até a mão
(o fundo dela em ALVO, no espaço do modelo) e calcula a pose do osso root_item que dá esse lugar com o braço do
A&S. Grava as 4 animações de primeira pessoa com os mesmos identificadores no Addon Pack Compat (que fica acima
do OTG e só é usado com o A&S). Sem o Compat, o OTG continua com as originais.

Convenção (a do Blockbench para Bedrock, no espaço da geometria): rotação R = Rz(-z)·Ry(y)·Rx(-x), posição sem
inverter eixo, osso = T(posição)·T(pivô)·R·S·T(-pivô), com a rotação da animação somada à rotação de repouso do
osso; o anexo ligado ao rightitem herda a matriz do osso. Nesse espaço, na primeira pessoa, +y é para cima, +z é
para a frente da câmera (olho em y ≈ 24) e +x é para a direita da tela.
"""
import glob, json, os
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OTG_RP = os.path.join(RAIZ, 'packs', 'RP_OTGBackpack')
OTG = os.path.join(OTG_RP, 'animations', 'attachables')
DESTINO = os.path.join(RAIZ, 'packs', 'RP_AddonPack_Compat', 'animations', 'ap_mochila_1p.animation.json')
PIVO_BRACO = (-5, 22, 0)  # rightArm de geometry.humanoid.custom
# braço direito em primeira pessoa: jogo base (first_person.empty_hand) e A&S com item na mão (anspom + rikfbu)
BRACO_JOGO = ((13.5, -10, 12), (95, -45, 115), (0, 0, -1))
BRACO_ANS = ((13.5 + 1, -10 + 4, 12 - 6), (95 - 10, -45 + 40, 115 + 65), (0, 0, 0))
# onde fica o meio do fundo da mochila (espaço do modelo): na altura da mão do A&S (~[11.4, 16.9, 15.8]), um pouco
# para dentro da tela. A pose original do OTG deixava o meio da mochila em ~[2, 14, 10], abaixo da borda da tela.
ALVO = (9, 14.5, 15)
ALTURA_MAX = 12  # a mochila comum tem ~11; as mais altas (a do creeper tem ~18) encolhem até essa altura
SEM_CUBOS = {'LightBone'}  # cubos de brilho do creeper (caixas grandes), fora da medida


def rot(e):
    x, y, z = np.radians(e)
    rx = np.array([[1, 0, 0], [0, np.cos(-x), -np.sin(-x)], [0, np.sin(-x), np.cos(-x)]])
    ry = np.array([[np.cos(y), 0, np.sin(y)], [0, 1, 0], [-np.sin(y), 0, np.cos(y)]])
    rz = np.array([[np.cos(-z), -np.sin(-z), 0], [np.sin(-z), np.cos(-z), 0], [0, 0, 1]])
    return rz @ ry @ rx


def osso(pos=(0, 0, 0), r=(0, 0, 0), pivo=(0, 0, 0), escala=1.0):
    m = np.eye(4); m[:3, :3] = rot(r) * escala
    p, pi, t = np.eye(4), np.eye(4), np.eye(4)
    p[:3, 3] = pivo; pi[:3, 3] = -np.array(pivo, float); t[:3, 3] = pos
    return t @ p @ m @ pi


def euler(m):
    y = -np.degrees(np.arcsin(np.clip(m[2, 0], -1, 1)))
    return np.array([-np.degrees(np.arctan2(m[2, 1], m[2, 2])), y, -np.degrees(np.arctan2(m[1, 0], m[0, 0]))])


def mao(braco):
    pos, r, item = braco
    return osso(pos, r, PIVO_BRACO) @ osso(item)


def geometrias():
    res = {}
    for arq in glob.glob(os.path.join(OTG_RP, 'models', '**', '*.json'), recursive=True):
        try: j = json.load(open(arq, encoding='utf-8-sig'))
        except ValueError: continue
        for g in j.get('minecraft:geometry', []) if isinstance(j, dict) else []:
            res[g['description']['identifier']] = g
    return res


def escala_de(v):
    if isinstance(v, (int, float)): return float(v)
    if isinstance(v, list) and all(isinstance(a, (int, float)) for a in v) and len(set(v)) == 1: return float(v[0])
    return None


def cantos(g, anim):
    """Cantos dos cubos visíveis (ossos com escala 0 fixa na animação e os filhos deles ficam de fora)."""
    pais = {b['name']: b.get('parent') for b in g['bones']}
    ocultos = {n for n, b in anim.get('bones', {}).items() if escala_de(b.get('scale', 1)) == 0}
    def oculto(n):
        while n:
            if n in ocultos: return True
            n = pais.get(n)
        return False
    pts = []
    for b in g['bones']:
        if oculto(b['name']) or b['name'] in SEM_CUBOS: continue
        for c in b.get('cubes', []):
            o, s = np.array(c['origin'], float), np.array(c['size'], float)
            for i in range(8):
                pts.append(o + s * [(i >> k) & 1 for k in range(3)])
    return np.array(pts)


def nova_pose(g, anim):
    raiz = next(b for b in g['bones'] if b['name'] == 'root_item')
    pivo, repouso = raiz.get('pivot', [0, 0, 0]), np.array(raiz.get('rotation', [0, 0, 0]), float)
    a = anim['bones']['root_item']
    s = escala_de(a.get('scale', 1)) or 1.0
    c = cantos(g, anim)
    def pose(s):  # pose original do OTG no espaço do modelo, com o braço do jogo base, e os cantos nela
        f = mao(BRACO_JOGO) @ osso(a.get('position', [0, 0, 0]), np.array(a.get('rotation', [0, 0, 0]), float) + repouso, pivo, s)
        return f, (f @ np.c_[c, np.ones(len(c))].T)[:3].T
    f, p = pose(s)
    altura = p[:, 1].max() - p[:, 1].min()
    if altura > ALTURA_MAX:
        s = s * ALTURA_MAX / altura
        f, p = pose(s)
    fundo = np.array([(p[:, 0].min() + p[:, 0].max()) / 2, p[:, 1].min(), (p[:, 2].min() + p[:, 2].max()) / 2])
    alvo = np.eye(4); alvo[:3, 3] = np.array(ALVO) - fundo
    # osso do root_item que dá esse lugar com o braço do A&S
    b = np.linalg.inv(mao(BRACO_ANS)) @ alvo @ f
    r = b[:3, :3] / s
    e = euler(r)
    pos = b[:3, 3] - np.array(pivo) + r @ np.array(pivo) * s
    assert np.abs(mao(BRACO_ANS) @ osso(pos, e, pivo, s) - alvo @ f).max() < 1e-6
    return [round(float(v), 3) for v in pos], [round(float(v), 3) for v in e - repouso], round(float(s), 3)


def main():
    geos, saida = geometrias(), {}
    for arq in sorted(os.listdir(OTG)):
        for nome, anim in json.load(open(os.path.join(OTG, arq), encoding='utf-8-sig'))['animations'].items():
            if not nome.endswith('_mainhand.first_person_hold'): continue
            g = geos['geometry.' + nome.split('.')[1]]  # animation.<x>_mainhand... -> geometry.<x>_mainhand
            nova = json.loads(json.dumps(anim))
            raiz = nova['bones']['root_item']
            raiz['position'], raiz['rotation'], s = nova_pose(g, anim)
            if s != (escala_de(raiz.get('scale', 1)) or 1.0): raiz['scale'] = s
            saida[nome] = nova
            print(nome, raiz['rotation'], raiz['position'], raiz.get('scale', 1))
    with open(DESTINO, 'w', encoding='utf-8') as f:
        json.dump({'format_version': '1.8.0', 'animations': saida}, f, ensure_ascii=False, indent=2)
    print(f'{len(saida)} animações gravadas em {os.path.relpath(DESTINO, RAIZ)}')


if __name__ == '__main__': main()
