# Diagnóstico de Crescimento para Supermercados — K Ads

Formulário de captação e qualificação de leads. Site estático, sem build,
sem dependência. As respostas caem numa planilha do Google, já pontuadas
e classificadas por nível de oportunidade.

```
index.html                 página
assets/css/styles.css      visual
assets/js/config.js        <- o único arquivo que você precisa editar
assets/js/schema.js        as 15 perguntas e os pesos da qualificação
assets/js/app.js           motor do formulário
apps-script/Codigo.gs      código que recebe e grava na planilha
```

---

## Parte 1 — Ligar a planilha (10 minutos, uma vez só)

1. Crie uma planilha nova no Google Sheets. Nome sugerido: **K Ads — Diagnóstico Supermercados**.
2. Nela, vá em **Extensões → Apps Script**.
3. Apague o conteúdo do editor e cole tudo que está em `apps-script/Codigo.gs`.
4. Se quiser aviso por e-mail a cada lead bom, preencha a linha:
   ```js
   var AVISAR_EMAIL = "seuemail@keepads.com.br";
   ```
   Deixe vazio para não receber nada.
5. Salve. Na lista de funções escolha **testarComLeadFalso** e clique em **Executar**.
   O Google vai pedir autorização: autorize com a conta dona da planilha.
   Isso cria a aba `Leads`, o cabeçalho e uma linha de exemplo que você pode apagar.
6. Clique em **Implantar → Nova implantação**.
   - Tipo: **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**  ← precisa ser este, senão o site não consegue gravar
7. Copie a **URL do app da web**. Ela termina em `/exec`.
8. Cole essa URL em `assets/js/config.js`:
   ```js
   endpoint: "https://script.google.com/macros/s/AKfy.../exec",
   ```
9. Aproveite e ajuste o WhatsApp da tela final no mesmo arquivo.

> Para conferir se está no ar: abra a URL `/exec` no navegador.
> Se aparecer `{"ok":true,...}`, está funcionando.

**Importante:** toda vez que você editar o Apps Script, precisa ir em
**Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão → Implantar.**
Sem isso a alteração não entra no ar.

---

## Parte 2 — Publicar o site

Enquanto o `endpoint` estiver vazio, o formulário roda em **modo teste**:
valida tudo, mostra a tela final e imprime o resultado no console do navegador,
sem gravar nada. Bom para revisar antes de ligar na planilha.

### Opção A — Netlify Drop (a mais rápida)

1. Abra <https://app.netlify.com/drop>
2. Arraste **a pasta inteira** deste projeto para a página.
3. O link sai na hora. Em **Site configuration → Change site name** você troca
   o endereço para algo como `diagnostico-kads.netlify.app`.

### Opção B — Vercel

```bash
npm i -g vercel
```

```bash
cd "/Users/enzosantos/FORMULARIO - KAROL + KEEP" && vercel --prod
```

O primeiro comando pede login pelo navegador. Depois é só confirmar as perguntas
com Enter.

### Domínio próprio

Nos dois casos dá para apontar um domínio da K Ads, por exemplo
`diagnostico.kads.com.br`, no painel do serviço.

---

## Como o lead é qualificado

Cada resposta de múltipla escolha tem um peso em `assets/js/schema.js`.
A soma vira uma nota de 0 a 100 e uma temperatura, que já chegam na planilha
prontas e com a linha colorida.

| Nota | Nível | Temperatura | Ação sugerida |
|------|-------|-------------|----------------|
| 0 a 39   | C | Frio   | Nutrir |
| 40 a 64  | B | Morno  | Contato em até 48h |
| 65 a 100 | A | Quente | Prioridade, falar hoje |

Pesam na conta: faturamento, número de unidades, colaboradores, se já investe,
quanto investe, se tem equipe de marketing, o momento de contratação e o poder
de decisão de quem preencheu.

Para calibrar depois de rodar alguns leads reais, mexa nos `peso` do
`schema.js` e nos cortes em `KADS_CLASSIFICACAO`, no fim do mesmo arquivo.

---

## Mexer nas perguntas

Tudo em `assets/js/schema.js`. O formulário, a validação, a planilha e a
pontuação se ajustam sozinhos.

Para incluir uma pergunta, copie um bloco existente e mude os campos:

```js
{
  id: "estacionamento",                 // vira o nome da coluna
  rotulo: "O supermercado tem estacionamento próprio?",
  tipo: "escolha",                      // texto | textarea | escolha | uf | telefone
  obrigatoria: true,
  opcoes: [
    { valor: "Sim", peso: 2 },
    { valor: "Não", peso: 1 }
  ]
}
```

Depois, em `apps-script/Codigo.gs`, adicione a linha correspondente na lista
`COLUNAS` para ela aparecer na planilha, e reimplante o script.

Pergunta que só aparece dependendo de outra resposta:

```js
dependeDe: { pergunta: "ja_investiu", valor: "Sim, investimos atualmente" },
respostaAutomatica: "Não investimos atualmente"
```

---

## Identidade visual

As cores saíram do próprio logo da K Ads e estão no topo de `assets/css/styles.css`:

```css
--rosa:       #f80170;   /* magenta da marca */
--rosa-texto: #ff4d94;   /* versão clara, para texto sobre fundo escuro */
--laranja:    #fc840f;   /* ponta do gradiente */
--gradiente:  linear-gradient(118deg, #f80170 0%, #fc840f 100%);
--alerta:     #ffd166;   /* erros, de propósito fora da paleta da marca */
```

Duas observações sobre essas escolhas:

- O texto dos botões é escuro, não branco. Branco sobre o rosa da marca dá
  contraste 4.0:1, abaixo do mínimo de 4.5:1. Escuro dá 4.9:1 no rosa e 8.0:1
  no laranja, e ainda mantém o visual de neon.
- O amarelo dos erros é proposital. Vermelho brigaria com o rosa da marca e o
  usuário não distinguiria alerta de identidade.

### Arquivos do logo

```
assets/img/kads-logo.png     logo do cabeçalho, fundo transparente
assets/img/kads-icone.png    ícone da aba e do atalho de celular
assets/img/originais/        os PNG originais, como vieram
```

O `kads-logo.png` foi gerado a partir da versão de fundo preto, com o fundo
removido para funcionar sobre qualquer tom escuro. Se um dia sair um SVG do
logo, é só trocar o `<img>` dentro de `.logo-bloco` no `index.html`.

As fontes estão em `--display` e `--corpo`, carregadas no `<head>` do `index.html`.

---

## Detalhes que já estão resolvidos

- Rascunho salvo no navegador por 7 dias, o lead pode fechar e voltar
- Máscara e validação de WhatsApp com DDD
- Pergunta de investimento só aparece para quem investe hoje
- Captura de `utm_source`, `utm_medium` e `utm_campaign` para saber de qual anúncio veio o lead
- Registro do dispositivo, celular ou computador
- Protocolo por envio, para o comercial referenciar
- Trava contra gravação duplicada na planilha
- Funciona com teclado e com leitor de tela
- Respeita quem desligou animações no sistema
