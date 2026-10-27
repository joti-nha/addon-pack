#!/usr/bin/env python3
"""Addon Pack: completa o pt_BR.lang de cada pack com a tradução de ferramentas/recursos/traducao_ptbr.json.

Para cada pasta packs/*/texts:
- lê o en_US.lang e o pt_BR.lang (cria o pt_BR.lang se não existir);
- toda chave do en_US que falta no pt_BR entra num bloco no fim do arquivo, traduzida pelo dicionário
  (texto inglês -> texto pt-BR) ou, sem tradução, com o texto em inglês;
- põe "pt_BR" no languages.json (e no language_names.json, se houver).

O bloco é refeito a cada execução, então rodar de novo não duplica nada. A chave contentKey (pacote
cifrado) nunca é copiada.

Uso: python3 ferramentas/traduzir_ptbr.py
"""
import glob, json, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.join(AQUI, "..", "packs")
DICIONARIO = os.path.join(AQUI, "recursos", "traducao_ptbr.json")
INICIO = "## >>> Addon Pack: tradução pt-BR (ferramentas/traduzir_ptbr.py)"
FIM = "## <<< Addon Pack: tradução pt-BR"
PULAR = {"contentKey"}


def achar(pasta, nome):
    """nome do arquivo sem diferenciar maiúsculas (en_us.lang / en_US.lang)."""
    for f in os.listdir(pasta):
        if f.lower() == nome.lower():
            return os.path.join(pasta, f)
    return None


def ler(texto):
    """chave -> valor, como o jogo lê: ignora comentários e o que vem depois de tab+#."""
    d = {}
    for linha in texto.splitlines():
        if not linha or linha.lstrip().startswith("#") or "=" not in linha:
            continue
        k, v = linha.split("=", 1)
        if "\t#" in v:
            v = v.split("\t#")[0]
        d[k.strip()] = v.rstrip() if v.strip() else v
    return d


def sem_bloco(texto):
    return re.sub(re.escape(INICIO) + r".*?" + re.escape(FIM) + r"\r?\n?", "", texto, flags=re.S)


def json_lista(caminho, item, chave=None):
    """acrescenta item a uma lista JSON (languages.json / language_names.json) se ainda não estiver lá."""
    dados = json.load(open(caminho, encoding="utf-8-sig")) if os.path.exists(caminho) else []
    tem = any((x[0] if isinstance(x, list) else x) == (chave or item) for x in dados)
    if not tem:
        dados.append(item)
        json.dump(dados, open(caminho, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    return not tem


def main():
    trad = json.load(open(DICIONARIO, encoding="utf-8"))
    total = traduzidas = 0
    for pasta in sorted(glob.glob(os.path.join(RAIZ, "*", "texts"))):
        en_arq = achar(pasta, "en_US.lang")
        if not en_arq:
            continue
        en = ler(open(en_arq, encoding="utf-8-sig", errors="replace").read())
        pt_arq = achar(pasta, "pt_BR.lang") or os.path.join(pasta, "pt_BR.lang")
        cru = open(pt_arq, "rb").read() if os.path.exists(pt_arq) else b""
        bom = cru.startswith(b"\xef\xbb\xbf")
        bruto = cru.decode("utf-8-sig", errors="replace")
        nl = "\r\n" if "\r\n" in bruto else "\n"
        base = sem_bloco(bruto)
        pt = ler(base)
        novas = []
        for k, v in en.items():
            if k in pt or k in PULAR:
                continue
            t = trad.get(v)
            traduzidas += t is not None
            novas.append(f"{k}={t if t is not None else v}")
        total += len(novas)
        corpo = base
        if novas:
            if corpo and not corpo.endswith(("\n", "\r")):
                corpo += nl
            corpo += nl.join([INICIO] + novas + [FIM]) + nl
        if corpo != bruto:
            open(pt_arq, "wb").write((b"\xef\xbb\xbf" if bom else b"") + corpo.encode("utf-8"))
        if corpo:
            json_lista(os.path.join(pasta, "languages.json"), "pt_BR")
            nomes = os.path.join(pasta, "language_names.json")
            if os.path.exists(nomes):
                json_lista(nomes, ["pt_BR", "Português (Brasil)"], "pt_BR")
        print(f"{os.path.relpath(pasta, RAIZ)}: {len(novas)} chaves novas")
    print(f"total: {total} chaves, {traduzidas} traduzidas")


if __name__ == "__main__":
    main()
