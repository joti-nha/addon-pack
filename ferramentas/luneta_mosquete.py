#!/usr/bin/env python3
"""Luneta do Mosquete de Caça (Improvised Guns) com o zoom e a borda da Relíquia dos Videntes (pedido do João, 2026-10-31).

Uso: python ferramentas/luneta_mosquete.py   (rode de novo depois de atualizar o Improvised Guns)

A moldura da luneta do addon é um modelo 3D no osso "head" do anexo, feito para a cabeça do jogador em primeira pessoa
do jogo base. O A&S não vira a cabeça desse jeito, então a moldura não fica na frente da câmera. Este script só esconde
essa moldura nos dois anexos do mosquete (a animação "scope_gone" do próprio addon passa a valer sempre); o resto do
anexo continua o original. O zoom e a borda vêm do Unified Core (BP_UnifiedCore/scripts/main.js, "Luneta do Mosquete"),
com a mesma borda de luneta da Relíquia.
"""
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANEXOS = [os.path.join(RAIZ, 'packs', 'RP_ImprovisedGuns', 'attachables', p, 'hunting_musket.json')
          for p in ('weapons', 'shadow_weapons')]
ANTES = '"scope": "query.is_sneaking==false || !c.is_first_person"'
DEPOIS = '"scope": "1"'


def main():
    feitos = 0
    for arq in ANEXOS:
        texto = open(arq, encoding='utf-8', newline='').read()
        if DEPOIS in texto: continue
        if texto.count(ANTES) != 1: raise SystemExit(f'condição da moldura não encontrada em {arq}')
        with open(arq, 'w', encoding='utf-8', newline='') as f: f.write(texto.replace(ANTES, DEPOIS))
        feitos += 1
    print(f'luneta do mosquete: moldura 3D escondida em {feitos} anexos')


if __name__ == '__main__': main()
