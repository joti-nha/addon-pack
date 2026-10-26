#!/usr/bin/env python3
"""Addon Pack: da uso a materiais de addons que quase nao serviam para nada.

1. SUBSTITUTOS: o material entra no lugar de um lingote do mesmo nivel nas receitas de equipamento de outro addon
   (copias em BP_UnifiedCore/recipes/materiais; a receita original continua valendo).
2. TROCAS: conversao 1:1 entre metais repetidos (os dois sentidos).
3. DROPS: o material passa a cair de chefes de outros addons (um grupo a mais na tabela de drop; rodar de novo
   nao duplica).

Uso: python3 ferramentas/materiais.py
"""
import glob, json, os, re, shutil

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "packs")
SAIDA = os.path.join(RAIZ, "BP_UnifiedCore", "recipes", "materiais")

# material -> lingote que ele substitui (mesmo nivel de picareta em niveis.js)
SUBSTITUTOS = {
    "test:vibranium_ingot": "panascais_caves:nocturite_ingot",  # vibranio: nivel 7, como a nocturita
    "dk:darkalita_ingot": "panascais_caves:cryorite_ingot",     # darkalita: armadura Unbound, nivel da netherite
}
TROCAS = [
    ("better_on_bedrock:tin_ingot", "ntk:tin_ingot"),
    ("better_on_bedrock:alluminum_ingot", "ntk:zinc_ingot"),
]
CHEFES = ["BP_Mowzie_s_Mobs_Add-On_1.1_BP/loot_tables/hf/mzs/" + n for n in
          ("wroughtnaut.json", "frostmaw.json", "sculptor.json")] + \
         ["BP_Better_on_Bedrock_1_1_behaviors/loot_tables/entities/" + n for n in
          ("withered_samurai.json", "inferior.json", "frostaeris.json", "willager.json", "flender.json", "enchanter.json")] + \
         ["BP_Eternal_Caves_1.1_Add-On_BP/loot_tables/panascais/caves/" + n for n in
          ("specter.json", "lava_widow.json", "ancient_serpent.json")] + \
         ["BP_Cataclysmical_BP/loot_tables/minera/cata/entities/" + p + n for p in ("", "flawless/")
          for n in ("sun_tribunal.json", "verdant_sentinel.json")]
DARKAGE = "BP_DarkAge_Bizarre_Remake_v0.7.76_BP/loot_tables/entities/"
# tabela -> [(item, chance, min, max)]
DROPS = {t: [("test:vibranium_ingot", 0.4, 1, 3)] for t in CHEFES}
DROPS[DARKAGE + "unbound_elemental.json"] = [("dk:darkalita_ingot", 1.0, 2, 4)]
DROPS[DARKAGE + "elemental_knight.json"] = [("dk:darkalita_ingot", 0.5, 1, 2)]
DROPS[DARKAGE + "unboned.json"] = [("dk:darkalita_ingot", 0.15, 1, 1)]

NAO_EQUIPAMENTO = re.compile(r"(block|ingot|nugget|raw_|_rod$)")

def load(f):
    try:
        return json.loads(open(f, encoding="utf-8-sig").read())
    except Exception:
        return None

def save(f, d, compacto=False):
    os.makedirs(os.path.dirname(f), exist_ok=True)
    txt = json.dumps(d, ensure_ascii=False, separators=(",", ":")) if compacto else json.dumps(d, ensure_ascii=False, indent=2) + "\n"
    open(f, "w", encoding="utf-8").write(txt)

def troca_item(v, de, para):
    if isinstance(v, str):
        return para if v == de else v, v == de
    if isinstance(v, dict) and v.get("item") == de:
        return dict(v, item=para), True
    if isinstance(v, list):
        res = [troca_item(i, de, para) for i in v]
        return [r[0] for r in res], any(r[1] for r in res)
    return v, False

def nome(i):
    return i.split(":")[-1]

def receitas():
    if os.path.isdir(SAIDA):
        shutil.rmtree(SAIDA)
    n = 0
    for f in sorted(glob.glob(os.path.join(RAIZ, "BP_*", "recipes", "**", "*.json"), recursive=True)):
        if "BP_UnifiedCore" in f:
            continue
        d = load(f)
        if not d:
            continue
        for tipo, r in d.items():
            if tipo not in ("minecraft:recipe_shaped", "minecraft:recipe_shapeless"):
                continue
            res = r.get("result")
            if isinstance(res, list):
                res = res[0] if res else None
            res_id = res.get("item") if isinstance(res, dict) else res
            if not res_id or NAO_EQUIPAMENTO.search(nome(res_id)):
                continue
            for mat, alvo in SUBSTITUTOS.items():
                campo = "key" if "key" in r else "ingredients"
                novo, achou = troca_item(list(r[campo].values()) if campo == "key" else r[campo], alvo, mat)
                if not achou:
                    continue
                nr = json.loads(json.dumps(r))
                nr[campo] = dict(zip(r["key"].keys(), novo)) if campo == "key" else novo
                ident = f"unified:{nome(mat)}_{r['description']['identifier'].replace(':', '_').replace('.', '_')}"
                nr["description"]["identifier"] = ident
                nr.pop("unlock", None)
                save(os.path.join(SAIDA, nome(mat), ident.split(":")[1] + ".json"),
                     {"format_version": "1.20.10", tipo: nr})
                n += 1
    for a, b in TROCAS:
        for de, para in ((a, b), (b, a)):
            ident = f"unified:{nome(de)}_para_{para.replace(':', '_')}"
            save(os.path.join(SAIDA, "trocas", ident.split(":")[1] + ".json"), {
                "format_version": "1.20.10",
                "minecraft:recipe_shapeless": {
                    "description": {"identifier": ident}, "tags": ["crafting_table"],
                    "ingredients": [{"item": de}], "result": {"item": para}}})
            n += 1
    print(f"{n} receitas em {os.path.relpath(SAIDA, RAIZ)}")

def drops():
    for rel, itens in DROPS.items():
        f = os.path.join(RAIZ, rel)
        d = load(f)
        if d is None:
            print("  sem tabela:", rel)
            continue
        raw = open(f, encoding="utf-8-sig").read()
        pools = d.setdefault("pools", [])
        for item, chance, lo, hi in itens:
            if item in json.dumps(pools):
                continue
            pool = {"rolls": 1, "entries": [{"type": "item", "name": item, "weight": 1,
                                             "functions": [{"function": "set_count", "count": {"min": lo, "max": hi}}]}]}
            if chance < 1:
                pool["conditions"] = [{"condition": "random_chance", "chance": chance}]
            pools.append(pool)
        save(f, d, compacto="\n" not in raw.strip())
    print(f"{len(DROPS)} tabelas de chefe com drop novo")

if __name__ == "__main__":
    receitas()
    drops()
