#!/usr/bin/env python3
"""Itens com animação própria ficam como no addon original (pedido do João, 2026-10-31).

Uso: python ferramentas/animacao_propria.py   (rode de novo depois de atualizar um addon ou de gerar anexos)

"Animação própria" = o anexo do item no pack do próprio addon usa animações definidas nesse pack (segurar, golpe,
carga, recarga, giro, troca de página...) ou os controles de lança e tridente do jogo base. Esses itens usam o anexo
original do addon, sem nada do A&S por cima:
  - a linha parent_setup do A&S (v.oreville_mainhand_visible/custom_pos) sai do anexo do addon. Sem ela o A&S trata
    o item como de outro addon: desfaz a pose de segurar dele e esconde o braço em primeira pessoa, como o jogo base;
  - anexos do Addon Pack Compat com o mesmo item (cópias com a linha do A&S, moldes do A&S, poses minhas) são apagados;
  - a etiqueta ap:golpe_unico sai do item.
As etiquetas oreville:* que o modpack tinha posto nesses itens saíram uma vez, em 2026-10-31 (lista no CHANGELOG 0.6);
as que o próprio addon já trazia (como as do Dungeons) ficam. Itens sem anexo próprio continuam com o A&S
(anexos_2d.py, anexos_cataclysm.py).

Exceções (EXCECOES): os escudos do Dark Age usam o anexo do escudo do A&S (escudos_dk.py, pedido do João).
O Mosquete de Caça tem só a moldura da luneta escondida (luneta_mosquete.py), que não é do A&S.
"""
import glob, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from armas_niveis import sem_comentarios  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(RAIZ, 'packs')
COMPAT = os.path.join(PACKS, 'RP_AddonPack_Compat')
NOSSOS = {'RP_AddonPack_Compat', 'RP_ActionsAndStuff', 'RP_UnifiedCore', 'RP_ForsakenGrimoire'}
EXCECOES = {'dk:sentinel_shield', 'dk:unboned_shield'}
DO_JOGO = ('controller.animation.spear.', 'controller.animation.trident.')
LINHA_ANS = re.compile(r"\s*c\.item_slot\s*==\s*'main_hand'\s*\?\s*\{\s*v\.oreville_mainhand_visible\s*=\s*1;\s*"
                       r"v\.oreville_mainhand_custom_pos\s*=\s*1;\s*\}\s*:\s*c\.item_slot\s*==\s*'off_hand'\s*\?\s*"
                       r"\{\s*v\.oreville_offhand_visible\s*=\s*1;\s*\}\s*:\s*0;")
ETIQUETAS = ['ap:golpe_unico']


def ler(caminho):
    texto = open(caminho, encoding='utf-8-sig').read()
    try: return json.loads(sem_comentarios(texto))
    except ValueError: return json.loads(re.sub(r',(\s*[}\]])', r'\1', sem_comentarios(texto)))


def gravar(caminho, obj):
    with open(caminho, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))


def alvos(desc):
    """Itens que o anexo desenha (campo item, ou o identificador)."""
    a = desc.get('item') or desc.get('identifier')
    return set(a) if isinstance(a, dict) else {a} if a else set()


def animacoes_do_pack(pack):
    ids = set()
    for pasta in ('animations', 'animation_controllers'):
        for arq in glob.glob(os.path.join(pack, pasta, '**', '*.json'), recursive=True):
            try: j = ler(arq)
            except (ValueError, UnicodeDecodeError): continue
            for chave in ('animations', 'animation_controllers'):
                if isinstance(j.get(chave), dict): ids.update(j[chave])
    return ids


def anexos(pasta):
    for arq in glob.glob(os.path.join(pasta, 'attachables', '**', '*.json'), recursive=True):
        try: j = ler(arq)
        except (ValueError, UnicodeDecodeError): continue
        d = j.get('minecraft:attachable', {}).get('description') if isinstance(j, dict) else None
        if isinstance(d, dict): yield arq, j, d


def itens_com_animacao_propria():
    itens, linhas = set(), 0
    for pack in sorted(os.listdir(PACKS)):
        if not pack.startswith('RP_') or pack in NOSSOS: continue
        proprias = animacoes_do_pack(os.path.join(PACKS, pack))
        for arq, j, d in anexos(os.path.join(PACKS, pack)):
            usadas = [v for v in (d.get('animations') or {}).values() if isinstance(v, str)]
            if not any(v in proprias or v.startswith(DO_JOGO) for v in usadas): continue
            ids = alvos(d) - EXCECOES
            if not ids: continue
            itens |= ids
            ps = (d.get('scripts') or {}).get('parent_setup')
            if isinstance(ps, str) and LINHA_ANS.search(ps):
                resto = LINHA_ANS.sub('', ps).strip()
                if resto: d['scripts']['parent_setup'] = resto
                else: d['scripts'].pop('parent_setup')
                gravar(arq, j)
                linhas += 1
    return itens, linhas


def limpar_compat(itens):
    apagados = 0
    for arq, _, d in list(anexos(COMPAT)):
        if alvos(d) & itens:
            os.remove(arq)
            apagados += 1
    return apagados


def limpar_etiquetas(itens):
    trocas = 0
    for arq in glob.glob(os.path.join(PACKS, 'BP_*', 'items', '**', '*.json'), recursive=True):
        try: j = ler(arq)
        except (ValueError, UnicodeDecodeError): continue
        it = j.get('minecraft:item', {}) if isinstance(j, dict) else {}
        if it.get('description', {}).get('identifier') not in itens: continue
        tags = it.get('components', {}).get('minecraft:tags', {}).get('tags')
        if not isinstance(tags, list) or not any(t in tags for t in ETIQUETAS): continue
        it['components']['minecraft:tags']['tags'] = [t for t in tags if t not in ETIQUETAS]
        gravar(arq, j)
        trocas += 1
    return trocas


def main():
    itens, linhas = itens_com_animacao_propria()
    apagados = limpar_compat(itens)
    trocas = limpar_etiquetas(itens)
    print(f'animação própria: {len(itens)} itens; linha do A&S tirada de {linhas} anexos; '
          f'{apagados} anexos do Compat apagados; etiquetas tiradas de {trocas} itens')


if __name__ == '__main__': main()
