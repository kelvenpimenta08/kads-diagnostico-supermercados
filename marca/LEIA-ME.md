# Identidade visual K Ads

Kit da marca. O manual completo está em `K-Ads-Identidade-Visual.pdf`.

---

## Cores

| Nome | HEX | RGB | CMYK | Onde usar |
|---|---|---|---|---|
| Magenta K Ads | `#F80170` | 248, 1, 112 | 0, 100, 55, 3 | Cor principal |
| Laranja K Ads | `#FC840F` | 252, 132, 15 | 0, 48, 94, 1 | Ponta do gradiente |
| Magenta claro | `#FF4D94` | 255, 77, 148 | 0, 70, 42, 0 | Texto sobre fundo escuro |
| Grafite | `#080A09` | 8, 10, 9 | 20, 0, 10, 96 | Fundo principal |
| Grafite claro | `#0F1412` | 15, 20, 18 | 25, 0, 10, 92 | Cards e superfícies |
| Creme | `#FAF8F5` | 250, 248, 245 | 0, 1, 2, 2 | Fundo claro |
| Amarelo de alerta | `#FFD166` | 255, 209, 102 | 0, 18, 60, 0 | Erro e aviso |

**Gradiente da marca**

```css
linear-gradient(118deg, #F80170 0%, #FC840F 100%)
```

Em editores que não aceitam ângulo em graus, use gradiente linear da esquerda
para a direita, com leve inclinação para cima.

---

## Tipografia

| | Fonte | Pesos | Onde baixar |
|---|---|---|---|
| Títulos | **Bricolage Grotesque** | 700, 800 | fonts.google.com/specimen/Bricolage+Grotesque |
| Texto | **Instrument Sans** | 400, 500, 600, 700 | fonts.google.com/specimen/Instrument+Sans |

As duas são gratuitas e liberadas para uso comercial.

**Substitutas**, quando não dá para instalar fonte:

- No lugar de Bricolage: Archivo Black, Anton ou Arial Black
- No lugar de Instrument: Inter, Helvetica Neue ou Arial

**Ajustes que fazem diferença:** nos títulos, espaçamento entre letras negativo
(de -0,03 a -0,05em) e entrelinha apertada (0,95 a 1,05). No corpo de texto,
entrelinha de 1,5 a 1,65.

---

## Arquivos

```
logos/
  kads-simbolo-256px.png             K isolado, fundo transparente
  kads-simbolo-512px.png
  kads-simbolo-1024px.png            use este em apresentação
  kads-icone-512px.png               quadrado com margem, para avatar
  kads-icone-1024px.png
  kads-simbolo-fundo-escuro.png      quadrado com fundo chapado
  kads-simbolo-fundo-claro.png
  kads-horizontal-claro.png          símbolo + "Ads", texto claro, transparente
  kads-horizontal-escuro.png         símbolo + "Ads", texto grafite, transparente
  kads-horizontal-claro-sobre-fundo-escuro.png
  kads-horizontal-escuro-sobre-fundo-claro.png

paleta/
  gradiente-k-ads-2400x1350.png      fundo de slide pronto
  gradiente-k-ads-faixa.png          faixa fina, para divisória
  cor-*.png                          bloco chapado de cada cor

exemplos/
  certo-*.png                        aplicações corretas
  errado-*.png                       os quatro erros mais comuns
```

Os PNG têm fundo transparente de verdade, com o gradiente preservado. Dá para
colar direto em PowerPoint, Keynote, Canva ou Google Slides.

---

## Regras que mais importam

1. **Nunca distorcer.** Redimensione sempre travando a proporção.
2. **Nunca recolorir.** O gradiente é parte da marca, não um efeito.
3. **Fundo escuro é o preferencial.** Em branco o gradiente perde força.
4. **Texto escuro sobre o gradiente**, nunca branco. Branco sobre o magenta dá
   contraste 4,0 e não passa no mínimo de acessibilidade. Grafite dá 4,9.
5. **Área de respiro:** metade da altura do K, livre em volta.
6. **Tamanho mínimo:** 24px de altura em tela, 8mm em impressão.

---

## Para montar a apresentação

Um caminho que funciona bem com esta marca:

- Capa e divisórias de seção em grafite `#080A09`, com o logo horizontal claro
- Slides de conteúdo em creme `#FAF8F5`, com texto grafite
- O gradiente só em um elemento por slide: um número grande, uma barra, um selo
- Números e títulos em Bricolage 800, resto em Instrument
- Use `gradiente-k-ads-faixa.png` como divisória entre blocos

O erro mais comum é usar o gradiente em tudo. Ele perde o impacto e a
apresentação fica cansativa de ler.
