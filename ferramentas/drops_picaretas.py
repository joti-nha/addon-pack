#!/usr/bin/env python3
"""Addon Pack: drops de blocos que so saiam com picaretas especificas.

Varios addons (Cataclysmical, RPG) testam a picareta pelo id (`match_tool` com `item`), entao uma picareta de
outro addon quebra o bloco e nao ganha nada. O nivel da picareta ja e cobrado pelo Unified Core (niveis.js cancela
a quebra), entao aqui o teste vira "qualquer picareta" (etiqueta minecraft:is_pickaxe) e os grupos repetidos somem.
Imprime os blocos cuja picareta minima passa do nivel 3 e que nao estao em MINERIOS, para conferir o nivel.

Uso: python3 ferramentas/drops_picaretas.py
"""
import glob, json, os, re

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "packs")
NIVEIS = os.path.join(RAIZ, "BP_UnifiedCore", "scripts", "niveis.js")
TAG = ["minecraft:is_pickaxe"]

# Tabelas reescritas inteiras. Vibranio (RPG): so caia com Toque Suave e 50% de chance, entao quase nunca saia nada;
# agora o minerio sempre cai e vira lingote no forno.
FIXAS = {
    "BP_SimpleRPG/loot_tables/blocks/vibranium_ore.json": {"pools": [{
        "rolls": 1,
        "conditions": [{"condition": "match_tool", "item_tags_any": TAG}],
        "entries": [{"type": "item", "name": "test:vibranium_ore", "weight": 1}],
    }]},
}

def niveis():
    s = open(NIVEIS, encoding="utf-8").read()
    ferr = dict((k, int(v)) for k, v in re.findall(r'"([\w:]+_pickaxe|[\w:]+runebreaker)":\s*(\d+)', s))
    mins = re.search(r"MINERIOS = \{(.*?)\n\};", s, re.S).group(1)
    return ferr, set(re.findall(r'"([\w:]+)":', mins))

def eh_picareta(c):
    return c.get("condition") == "match_tool" and str(c.get("item", "")).endswith("_pickaxe")

def main():
    ferr, minerios = niveis()
    mudados = 0
    for f in sorted(glob.glob(os.path.join(RAIZ, "BP_*", "loot_tables", "**", "*.json"), recursive=True)):
        raw = open(f, encoding="utf-8-sig").read()
        try:
            d = json.loads(raw)
        except Exception:
            continue
        pools = d.get("pools")
        if not isinstance(pools, list):
            continue
        usadas, novos, vistos = [], [], set()
        for p in pools:
            for c in p.get("conditions", []):
                if eh_picareta(c):
                    usadas.append(c.pop("item"))
                    c["item_tags_any"] = TAG
            chave = json.dumps(p, sort_keys=True)
            if chave in vistos:
                continue
            vistos.add(chave)
            novos.append(p)
        if not usadas:
            continue
        d["pools"] = novos
        open(f, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
        mudados += 1
        nivel = min(ferr.get(i, 1) for i in usadas)
        bloco = os.path.splitext(os.path.basename(f))[0]
        if nivel > 3 and not any(m.endswith(":" + bloco) for m in minerios):
            print(f"  nivel {nivel} fora de MINERIOS: {os.path.relpath(f, RAIZ)} ({', '.join(sorted(set(usadas)))})")
    for rel, d in FIXAS.items():
        open(os.path.join(RAIZ, rel), "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
    print(f"{mudados} tabelas de drop agora aceitam qualquer picareta")

if __name__ == "__main__":
    main()
