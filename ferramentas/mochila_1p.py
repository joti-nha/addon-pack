#!/usr/bin/env python3
"""Mochilas do OTG em primeira pessoa na posição original, com o jogador do A&S (pedido do João, 2026-10-29).

Uso: python ferramentas/mochila_1p.py

O OTG acerta a mochila na mão para o braço de primeira pessoa do jogo base (rotação [95, -45, 115], posição
[13.5, -10, 12], rightitem z -1). Com qualquer item na mão, o A&S soma ao braço a pose de segurar
(animation.oreville_ans.rikfbu: [-10, 40, 65] e [1, 4, -6]) e deixa o rightitem em z 0, então a mochila saía do
lugar. Este script calcula, para as 4 animações de primeira pessoa do OTG, a pose do osso root_item que põe a
mochila no mesmo lugar da tela que ela ocupa no OTG sem o A&S, e grava essas animações com os mesmos
identificadores no Addon Pack Compat (que fica acima do OTG e só é usado com o A&S). Sem o Compat, o OTG
continua com as originais.

Convenção (a do Blockbench para Bedrock, no espaço da geometria): rotação R = Rz(-z)·Ry(y)·Rx(-x), posição sem
inverter eixo, osso = T(posição)·T(pivô)·R·T(-pivô); o anexo ligado ao rightitem herda a matriz do osso.
"""
import json, os
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OTG = os.path.join(RAIZ, 'packs', 'RP_OTGBackpack', 'animations', 'attachables')
DESTINO = os.path.join(RAIZ, 'packs', 'RP_AddonPack_Compat', 'animations', 'ap_mochila_1p.animation.json')
PIVO_BRACO = (-5, 22, 0)  # rightArm de geometry.humanoid.custom
# braço direito em primeira pessoa: jogo base (first_person.empty_hand) e A&S com item na mão (anspom + rikfbu)
BRACO_JOGO = ((13.5, -10, 12), (95, -45, 115), (0, 0, -1))
BRACO_ANS = ((13.5 + 1, -10 + 4, 12 - 6), (95 - 10, -45 + 40, 115 + 65), (0, 0, 0))


def rot(e):
    x, y, z = np.radians(e)
    rx = np.array([[1, 0, 0], [0, np.cos(-x), -np.sin(-x)], [0, np.sin(-x), np.cos(-x)]])
    ry = np.array([[np.cos(y), 0, np.sin(y)], [0, 1, 0], [-np.sin(y), 0, np.cos(y)]])
    rz = np.array([[np.cos(-z), -np.sin(-z), 0], [np.sin(-z), np.cos(-z), 0], [0, 0, 1]])
    return rz @ ry @ rx


def osso(pos=(0, 0, 0), r=(0, 0, 0), pivo=(0, 0, 0)):
    m = np.eye(4); m[:3, :3] = rot(r)
    p, pi, t = np.eye(4), np.eye(4), np.eye(4)
    p[:3, 3] = pivo; pi[:3, 3] = -np.array(pivo, float); t[:3, 3] = pos
    return t @ p @ m @ pi


def euler(m):
    y = -np.degrees(np.arcsin(np.clip(m[2, 0], -1, 1)))
    return np.array([-np.degrees(np.arctan2(m[2, 1], m[2, 2])), y, -np.degrees(np.arctan2(m[1, 0], m[0, 0]))])


def mao(braco):
    pos, r, item = braco
    return osso(pos, r, PIVO_BRACO) @ osso(item)


def compensar(pos, r):
    alvo = mao(BRACO_JOGO) @ osso(pos, r)
    m = np.linalg.inv(mao(BRACO_ANS)) @ alvo
    e, p = euler(m[:3, :3]), m[:3, 3]
    assert np.abs(mao(BRACO_ANS) @ osso(p, e) - alvo).max() < 1e-6
    return [round(float(v), 3) for v in p], [round(float(v), 3) for v in e]


def main():
    saida = {}
    for arq in sorted(os.listdir(OTG)):
        for nome, anim in json.load(open(os.path.join(OTG, arq), encoding='utf-8-sig'))['animations'].items():
            if not nome.endswith('_mainhand.first_person_hold'): continue
            nova = json.loads(json.dumps(anim))
            raiz = nova['bones']['root_item']
            raiz['position'], raiz['rotation'] = compensar(raiz.get('position', [0, 0, 0]), raiz.get('rotation', [0, 0, 0]))
            saida[nome] = nova
            print(nome, raiz['rotation'], raiz['position'])
    with open(DESTINO, 'w', encoding='utf-8') as f:
        json.dump({'format_version': '1.8.0', 'animations': saida}, f, ensure_ascii=False, indent=2)
    print(f'{len(saida)} animações gravadas em {os.path.relpath(DESTINO, RAIZ)}')


if __name__ == '__main__': main()
