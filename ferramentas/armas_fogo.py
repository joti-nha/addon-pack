#!/usr/bin/env python3
"""Armas do Improvised Guns na posição original em primeira pessoa (pedido do João, 2026-10-31).

Uso: python ferramentas/armas_fogo.py   (depois do mesclar_jogador.py, que refaz o jogador do Compat)

Os anexos das armas (etiqueta rev:improvised_gun) foram feitos para o braço de primeira pessoa do jogo base: braço em
[13.5, -10, 12] / [95, -45, 115] e item na posição do empty_hand. O A&S soma ao braço a pose de segurar item
(rikfbu: [-10, 40, 65] e [1, 4, -6]) e muda o rightitem, então a arma ficava torta ou fora da tela.
A luneta do Mosquete de Caça fica no osso "head" do anexo, desenhada para a cabeça virada 180° do first_person.base_pose
do jogo base; o A&S não gira a cabeça em primeira pessoa, e a luneta ficava atrás da câmera.
O A&S também não inclina o corpo com a câmera em primeira pessoa (só gira o corpo quando o jogador está montado) e o braço
dele acompanha a câmera assim mesmo, então o corpo fica como o A&S deixa e a cabeça só ganha o giro de 180°.

Este script grava no Addon Pack Compat três animações com override_previous_animation, tocadas por último no jogador
mesclado, só em primeira pessoa e com uma arma na mão: cabeça; braço e item da mão principal; braço e item da mão
secundária. Com a luneta (agachado com o Mosquete de Caça) o braço some, como no jogo base.
As passivas do Patrulheiro nas armas ficam em packs/BP_ImprovisedGuns/scripts/apPatrulheiro.js.
"""
import json, os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
COMPAT = os.path.join(PACKS, 'RP_AddonPack_Compat')
ETIQUETA = 'rev:improvised_gun'

def arma(mao): return f"q.equipped_item_any_tag('slot.weapon.{mao}','{ETIQUETA}')"
def luneta(mao): return f"q.is_sneaking&&q.is_item_name_any('slot.weapon.{mao}',0,'rev:hunting_musket','rev:shadow_hunting_musket')"

def item_jogo_base(braco, item):
    # posição do item no animation.player.first_person.empty_hand do jogo base
    return [0.0, f"q.get_default_bone_pivot('{braco}',1)-q.get_default_bone_pivot('{item}',1)-7.0",
            f"-q.get_default_bone_pivot('{item}',2)"]

ANIMACOES = {
    # cabeça virada como no first_person.base_pose do jogo base (a luneta é desenhada nela); a inclinação fica com o A&S
    'animation.ap.arma_fogo.base': {'loop': True, 'override_previous_animation': True, 'bones': {
        'head': {'rotation': [0.0, 180.0, 0.0]}}},
    # empty_hand e breathing_bob do jogo base
    'animation.ap.arma_fogo.mao_direita': {'loop': True, 'override_previous_animation': True, 'bones': {
        'rightarm': {'position': [13.5, -10.0, 12.0], 'rotation': [95.0, -45.0, 115.0],
                     'scale': f"({luneta('mainhand')})?0:1"},
        'rightitem': {'position': [0.0, item_jogo_base('rightarm', 'rightitem')[1] + '+(v.bob_animation??0)*Math.sin(q.life_time*45)*0.5',
                                   item_jogo_base('rightarm', 'rightitem')[2]]}}},
    # no jogo base o braço esquerdo fica na pose de descanso em primeira pessoa
    'animation.ap.arma_fogo.mao_esquerda': {'loop': True, 'override_previous_animation': True, 'bones': {
        'leftarm': {'position': [0.0, 0.0, 0.0], 'rotation': [0.0, 0.0, 0.0], 'scale': f"({luneta('offhand')})?0:1"},
        'leftitem': {'position': item_jogo_base('leftarm', 'leftitem')}}},
}
NO_JOGADOR = [  # (nome curto, animação, condição), tocadas depois de tudo
    ('ap_arma_fogo_base', 'animation.ap.arma_fogo.base', f"v.is_first_person&&({arma('mainhand')}||{arma('offhand')})"),
    ('ap_arma_fogo_dir', 'animation.ap.arma_fogo.mao_direita', f"v.is_first_person&&{arma('mainhand')}"),
    ('ap_arma_fogo_esq', 'animation.ap.arma_fogo.mao_esquerda', f"v.is_first_person&&{arma('offhand')}"),
]


def gravar(caminho, obj, compacto=True):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':')) if compacto else json.dump(obj, f, ensure_ascii=False, indent=2)


def jogador():
    arq = os.path.join(COMPAT, 'entity', 'player.entity.json')
    j = json.load(open(arq, encoding='utf-8'))
    d = j['minecraft:client_entity']['description']
    animate = d['scripts']['animate']
    # tira entradas antigas e põe de novo no fim, para tocarem depois do A&S
    nomes = {n for n, _, _ in NO_JOGADOR}
    animate[:] = [e for e in animate if (next(iter(e)) if isinstance(e, dict) else e) not in nomes]
    for nome, anim, cond in NO_JOGADOR:
        d['animations'][nome] = anim
        animate.append({nome: cond})
    gravar(arq, j)


def main():
    gravar(os.path.join(COMPAT, 'animations', 'ap_armas_fogo.animation.json'),
           {'format_version': '1.8.0', 'animations': ANIMACOES}, compacto=False)
    jogador()
    print(f'armas de fogo: {len(ANIMACOES)} animações de primeira pessoa no jogador mesclado')


if __name__ == '__main__': main()
