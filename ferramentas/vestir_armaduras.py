#!/usr/bin/env python3
"""Animação de vestir do A&S em todas as armaduras do pack (pedido do João, 2026-10-31).

Uso: python ferramentas/vestir_armaduras.py   (depois do enxugar_ans.py, ao atualizar o A&S)

O A&S toca uma animação curta ao vestir capacete, peitoral ou calças (controles sfoyqn, oiegfy e jsoljm do
jogador). Ele percebe a troca por q.armor_texture_slot(N), que só muda com as armaduras do jogo (couro, ferro,
diamante...): as armaduras de addons não têm tipo de textura, então vesti-las não mudava nada e a animação não
tocava. Este script faz os três controles também perceberem quando o espaço da armadura passa de vazio para
ocupado (e o contrário), com q.is_item_name_any('slot.armor.<parte>',''), que vale para qualquer item.
O controle do capacete também saía do estado da animação com !q.has_armor_slot(0), que vale 1 o tempo todo com um
capacete de addon: o estado saía e voltava a cada quadro e a animação repetia sem parar (teste do João, 2026-10-31).
Essa saída sai daqui; tirar o capacete já é percebido pelo espaço vazio.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import brarchive  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AS = os.path.join(RAIZ, 'packs', 'RP_ActionsAndStuff')
# controle -> (espaço da armadura, estado que toca a animação, variável nova)
CONTROLES = {
    'controller.animation.oreville_ans.sfoyqn': ('head', 0),
    'controller.animation.oreville_ans.oiegfy': ('chest', 1),
    'controller.animation.oreville_ans.jsoljm': ('legs', 2),
}


def main():
    arq = os.path.join(AS, '__brarchive', 'animation_controllers.brarchive')
    itens = brarchive.ler(arq)
    nome = next(n for n, d in itens.items() if d and b'controller.animation.oreville_ans.sfoyqn' in d)
    j = json.loads(itens[nome])
    acs = j['animation_controllers']
    mudou = 0
    for ident, (parte, n) in CONTROLES.items():
        st = acs[ident]['states']
        vazio = f"q.is_item_name_any('slot.armor.{parte}','')"
        var = f'v.ap_vazio{n}'
        tocar = next(s for s in st if s != 'default')  # o estado que toca a animação
        # sem a saída "não é armadura do jogo", que repete a animação com uma armadura de addon
        so_jogo = re.compile(rf'\|\|!q\.has_armor_slot\({n}\)|!q\.has_armor_slot\({n}\)\|\|')
        for t in st[tocar]['transitions']:
            if 'default' in t and so_jogo.search(t['default']):
                t['default'] = so_jogo.sub('', t['default']); mudou += 1
        if any(var in x for x in st[tocar].get('on_entry', [])):
            continue
        # entra no estado (e toca) também quando há um item de addon no espaço
        for t in st['default']['transitions']:
            if tocar in t: t[tocar] = f'({t[tocar]})||!{vazio}'
        st[tocar].setdefault('on_entry', []).append(f'{var}={vazio};')
        for t in st[tocar]['transitions']:
            if 'default' in t: t['default'] = f"({t['default']})||{var}!={vazio}"
        mudou += 1
    if mudou:
        itens[nome] = json.dumps(j, ensure_ascii=False, separators=(',', ':')).encode()
        brarchive.escrever(arq, itens)
    print(f'vestir: {mudou} ajustes nos controles de armadura do A&S' if mudou else 'vestir: o A&S já estava ajustado')


if __name__ == '__main__': main()
