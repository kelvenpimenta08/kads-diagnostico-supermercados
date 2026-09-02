#!/usr/bin/env python3
"""
Gera publicar/index.html: uma versao do formulario num arquivo so,
com CSS, JavaScript e imagens embutidos.

Use quando quiser publicar sem subir pasta de assets, por exemplo
colando direto na interface do GitHub.

    python3 ferramentas/gerar-arquivo-unico.py

Continue editando os arquivos normais (index.html, assets/...).
Este script so junta tudo no fim.
"""

import io, os, base64
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def caminho(*p): return os.path.join(RAIZ, *p)
def ler(p):      return io.open(caminho(p), encoding="utf-8").read()

def imagem_reduzida(origem, altura):
    """Reduz a imagem e devolve como data URI, para o arquivo nao ficar pesado."""
    im = Image.open(caminho(origem))
    if im.height > altura:
        prop = altura / im.height
        im = im.resize((round(im.width * prop), altura), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

def main():
    html = ler("index.html")

    # CSS externo vira <style>
    html = html.replace(
        '<link rel="stylesheet" href="assets/css/styles.css">',
        "<style>\n" + ler("assets/css/styles.css") + "\n</style>")

    # Imagens viram data URI. 120px de altura cobre tela retina de sobra.
    html = html.replace('src="assets/img/kads-logo.png"',
                        'src="' + imagem_reduzida("assets/img/kads-logo.png", 120) + '"')
    html = html.replace('href="assets/img/kads-icone.png"',
                        'href="' + imagem_reduzida("assets/img/kads-icone.png", 64) + '"')

    # Os tres scripts viram um bloco so, na mesma ordem do original
    partes = [ler("assets/js/" + n) for n in ("config.js", "schema.js", "app.js")]
    for nome, js in zip(("config", "schema", "app"), partes):
        if "</script" in js.lower():
            raise SystemExit("ERRO: " + nome + ".js contem </script> e quebraria a pagina")

    antigo = ('<script src="assets/js/config.js"></script>\n'
              '<script src="assets/js/schema.js"></script>\n'
              '<script src="assets/js/app.js"></script>')
    if antigo not in html:
        raise SystemExit("ERRO: nao achei o bloco de scripts no index.html")
    html = html.replace(antigo, "<script>\n" + "\n".join(partes) + "\n</script>")

    html = html.replace("assets/js/config.js", "bloco KADS_CONFIG no topo do script")

    if "assets/" in html:
        raise SystemExit("ERRO: ainda sobrou referencia a assets/ no arquivo final")

    destino = caminho("publicar", "index.html")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    io.open(destino, "w", encoding="utf-8").write(html)
    print("publicar/index.html gerado com %.1f KB" % (os.path.getsize(destino) / 1024))

if __name__ == "__main__":
    main()
