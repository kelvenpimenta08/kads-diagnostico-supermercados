# Como o lead é classificado

Documento para o time comercial da K Ads. Explica de onde vem a nota, o nível
e a temperatura que aparecem na planilha de leads.

---

## A ideia

Nem todo supermercado que preenche o formulário tem o mesmo potencial. Uma rede
de 8 lojas que já investe 10 mil por mês e está procurando agência agora não é a
mesma coisa que uma loja única que nunca investiu e só quer entender o assunto.

Os dois são leads. Mas um precisa de ligação hoje e o outro não.

A nota existe para o time abrir a planilha e saber, em dois segundos, quem
ligar primeiro.

---

## De onde vem a nota

Oito das quinze perguntas valem ponto. Cada resposta tem um peso, e a soma vira
uma nota de 0 a 100.

**A soma máxima possível é 35 pontos.** A nota é essa soma convertida para
uma escala de 100. Ou seja:

```
nota = (pontos obtidos ÷ 35) × 100
```

Um lead que fez 28 pontos tem nota 80.

### As oito perguntas que pontuam

Elas se dividem em três grupos, e cada grupo responde a uma pergunta diferente
sobre o lead.

#### 1. Tamanho: dá para atender e sustentar investimento?

| Pergunta | Vale até |
|---|---|
| Quantas lojas ou unidades | 5 pontos |
| Faturamento mensal | 5 pontos |
| Quantos colaboradores | 5 pontos |

Escala em todas as três: a menor faixa vale 1 e a maior vale 5.

Uma exceção: quem responde **"Prefiro não informar"** no faturamento recebe
**2 pontos**, não zero. Recusar a informação é comum em empresa familiar e não
significa que a empresa é pequena, então não faz sentido punir o lead por isso.

#### 2. Maturidade: já entende o que é mídia paga?

| Pergunta | Vale até |
|---|---|
| Já investiu em tráfego pago | 3 pontos |
| Quanto investe por mês | 5 pontos |
| Tem alguém no marketing | 2 pontos |

Quem já investe hoje vale 3, quem investiu e parou vale 2, quem nunca investiu
vale 1. A lógica é que quem já anunciou entende o que está comprando, e a venda
é mais curta.

No investimento mensal, a escala vai de 1 (até mil reais) a 5 (acima de dez
mil). Quem não investe fica com 0, porque a pergunta nem aparece para essa
pessoa.

A pergunta da equipe pesa pouco de propósito, só 2 pontos, e quase não separa
os leads. Ter agência ou ter equipe interna não torna ninguém melhor ou pior,
só muda o discurso da conversa.

#### 3. Intenção: quer fechar, e essa pessoa pode decidir?

| Pergunta | Vale até |
|---|---|
| Momento de contratação | 5 pontos |
| Poder de decisão | 5 pontos |

Este é o grupo mais importante na prática. "Estamos procurando agora" vale 5,
e "quero apenas entender melhor" vale 1. "Eu sou o responsável pela decisão"
vale 5, e "não participo da decisão" vale **0**.

Zero mesmo. Um lead de rede grande falando com quem não decide nada continua
sendo uma conversa longa.

### O que não pontua

Nome, WhatsApp, e-mail, nome do supermercado, cidade, estado, objetivo,
principal dificuldade e observações **não entram na conta**.

Não é esquecimento. Objetivo e dificuldade são as respostas mais ricas para
preparar a conversa, mas não dizem nada sobre o tamanho da oportunidade.
"Quero vender mais" pode vir tanto de uma rede de 10 lojas quanto de um
mercadinho de bairro. Servem para você saber **o que falar**, não **com quem
falar primeiro**.

---

## Os três níveis

Não existe nível D. São três.

| Nota | Nível | Temperatura | O que o time faz | Cor na planilha |
|---|---|---|---|---|
| 65 a 100 | **A** | Quente | Prioridade, falar hoje | rosa |
| 40 a 64 | **B** | Morno | Contato em até 48 horas | laranja claro |
| 0 a 39 | **C** | Frio | Nutrir | cinza |

A linha inteira já chega pintada na planilha, então dá para bater o olho e ver
onde estão os quentes sem ler nota nenhuma.

---

## Dois exemplos reais dos testes

**Rede Bom Dia, Resende/RJ. Nota 86, nível A.**
Sete a dez lojas, fatura acima de 5 milhões, mais de 200 colaboradores, investe
acima de dez mil por mês, tem equipe interna, está procurando agência agora e
quem preencheu é o dono. Fez 30 dos 35 pontos.

**Mercado Bom Preço, Barra Mansa/RJ. Nota 34, nível C.**
Loja única, fatura até 500 mil, até 20 colaboradores, nunca investiu, não tem
ninguém no marketing, só quer entender melhor e não decide sozinho. Fez 12
pontos.

O primeiro é uma ligação hoje. O segundo entra em nutrição e pode virar cliente
daqui a seis meses.

---

## Calibrando com o tempo

Esses pesos são um ponto de partida baseado no perfil de cliente que a K Ads
quer. Depois de uns 30 ou 40 leads reais, vale olhar quais notas viraram
contrato de verdade.

Se todo mundo que fechou tinha nota acima de 70, o corte do nível A pode subir.
Se metade dos leads C acabou fechando, algum peso está errado.

Duas coisas mudam isso, as duas no arquivo `assets/js/schema.js`:

- **Os pesos de cada resposta**: campo `peso` dentro de cada opção
- **Os cortes de faixa**: bloco `KADS_CLASSIFICACAO`, no fim do arquivo

Não precisa mexer em mais nada. O formulário, a planilha e as cores se ajustam
sozinhos ao que estiver ali.
