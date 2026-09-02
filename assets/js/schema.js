/* ============================================================
   K ADS — PERGUNTAS DO DIAGNÓSTICO
   Para mudar, incluir ou tirar pergunta, edite só este arquivo.
   O formulário, a validação, a planilha e a pontuação do lead
   se ajustam sozinhos ao que estiver aqui.

   Campo "peso": quanto aquela resposta vale na qualificação.
   Quanto maior o total, mais quente o lead.
   ============================================================ */

window.KADS_STEPS = [

  {
    id: "contato",
    etiqueta: "Contato",
    titulo: "Primeiro, quem fala com a gente",
    apoio: "Para o nosso time saber com quem está conversando.",
    perguntas: [
      {
        id: "nome",
        rotulo: "Qual é o seu nome?",
        tipo: "texto",
        placeholder: "Nome e sobrenome",
        obrigatoria: true,
        autocomplete: "name"
      },
      {
        id: "whatsapp",
        rotulo: "Qual é o seu WhatsApp?",
        tipo: "telefone",
        placeholder: "(00) 00000-0000",
        ajuda: "É por ali que retornamos o seu diagnóstico.",
        obrigatoria: true,
        autocomplete: "tel"
      },
      {
        id: "email",
        rotulo: "Qual é o seu e-mail?",
        tipo: "email",
        placeholder: "nome@supermercado.com.br",
        obrigatoria: true,
        autocomplete: "email"
      }
    ]
  },

  {
    id: "loja",
    etiqueta: "A operação",
    titulo: "Sobre o supermercado",
    apoio: "Praça e tamanho de operação mudam totalmente a estratégia de mídia.",
    perguntas: [
      {
        id: "supermercado",
        rotulo: "Qual é o nome do supermercado?",
        tipo: "texto",
        placeholder: "Nome da rede ou da loja",
        obrigatoria: true,
        autocomplete: "organization"
      },
      {
        id: "cidade",
        rotulo: "Em qual cidade o supermercado está?",
        tipo: "texto",
        placeholder: "Cidade",
        obrigatoria: true,
        largura: "dois-tercos"
      },
      {
        id: "estado",
        rotulo: "Estado",
        tipo: "uf",
        obrigatoria: true,
        largura: "um-terco"
      },
      {
        id: "unidades",
        rotulo: "Quantas lojas ou unidades o supermercado possui?",
        tipo: "escolha",
        obrigatoria: true,
        opcoes: [
          { valor: "1 unidade", peso: 1 },
          { valor: "2 a 3 unidades", peso: 2 },
          { valor: "4 a 6 unidades", peso: 3 },
          { valor: "7 a 10 unidades", peso: 4 },
          { valor: "Mais de 10 unidades", peso: 5 }
        ]
      }
    ]
  },

  {
    id: "porte",
    etiqueta: "Porte",
    titulo: "O tamanho da operação hoje",
    apoio: "Essas duas respostas definem o volume de mídia que faz sentido para você. Ficam entre nós.",
    perguntas: [
      {
        id: "faturamento",
        rotulo: "Qual é o faturamento médio mensal da empresa?",
        tipo: "escolha",
        obrigatoria: true,
        opcoes: [
          { valor: "Até R$ 500 mil", peso: 1 },
          { valor: "De R$ 500 mil a R$ 1 milhão", peso: 2 },
          { valor: "De R$ 1 milhão a R$ 3 milhões", peso: 3 },
          { valor: "De R$ 3 milhões a R$ 5 milhões", peso: 4 },
          { valor: "Acima de R$ 5 milhões", peso: 5 },
          { valor: "Prefiro não informar", peso: 2 }
        ]
      },
      {
        id: "colaboradores",
        rotulo: "Quantos colaboradores a empresa possui atualmente?",
        tipo: "escolha",
        obrigatoria: true,
        opcoes: [
          { valor: "Até 20", peso: 1 },
          { valor: "21 a 50", peso: 2 },
          { valor: "51 a 100", peso: 3 },
          { valor: "101 a 200", peso: 4 },
          { valor: "Mais de 200", peso: 5 }
        ]
      }
    ]
  },

  {
    id: "midia",
    etiqueta: "Mídia",
    titulo: "O que já foi feito no digital",
    apoio: "Não existe resposta errada aqui. Serve para sabermos de onde partimos.",
    perguntas: [
      {
        id: "ja_investiu",
        rotulo: "O supermercado já investe ou já investiu em tráfego pago?",
        tipo: "escolha",
        obrigatoria: true,
        opcoes: [
          { valor: "Sim, investimos atualmente", peso: 3 },
          { valor: "Já investimos, mas paramos", peso: 2 },
          { valor: "Nunca investimos", peso: 1 }
        ]
      },
      {
        id: "investimento",
        rotulo: "Qual é a média de investimento mensal em anúncios?",
        tipo: "escolha",
        obrigatoria: true,
        dependeDe: { pergunta: "ja_investiu", valor: "Sim, investimos atualmente" },
        respostaAutomatica: "Não investimos atualmente",
        opcoes: [
          { valor: "Até R$ 1.000", peso: 1 },
          { valor: "R$ 1.000 a R$ 3.000", peso: 2 },
          { valor: "R$ 3.000 a R$ 5.000", peso: 3 },
          { valor: "R$ 5.000 a R$ 10.000", peso: 4 },
          { valor: "Acima de R$ 10.000", peso: 5 },
          { valor: "Não investimos atualmente", peso: 0 }
        ]
      },
      {
        id: "equipe",
        rotulo: "Hoje vocês têm alguém responsável pelo marketing digital?",
        tipo: "escolha",
        obrigatoria: true,
        opcoes: [
          { valor: "Sim, temos equipe interna", peso: 2 },
          { valor: "Sim, trabalhamos com uma agência", peso: 2 },
          { valor: "Temos apenas um profissional ou freelancer", peso: 2 },
          { valor: "Não temos ninguém responsável atualmente", peso: 1 }
        ]
      }
    ]
  },

  {
    id: "objetivo",
    etiqueta: "Objetivo",
    titulo: "Onde você quer chegar",
    apoio: "A parte mais importante do diagnóstico. Pode ser direto.",
    perguntas: [
      {
        id: "objetivo",
        rotulo: "Qual é o principal objetivo do supermercado com o marketing digital hoje?",
        tipo: "escolha",
        obrigatoria: true,
        opcoes: [
          { valor: "Aumentar o movimento nas lojas" },
          { valor: "Aumentar as vendas" },
          { valor: "Divulgar ofertas e promoções para mais pessoas" },
          { valor: "Fortalecer a marca na região" },
          { valor: "Atrair novos clientes" },
          { valor: "Expandir para novas regiões ou unidades" },
          { valor: "Outro" }
        ]
      },
      {
        id: "objetivo_outro",
        rotulo: "Conta rapidamente qual é o objetivo",
        tipo: "texto",
        placeholder: "Descreva em uma linha",
        obrigatoria: false,
        dependeDe: { pergunta: "objetivo", valor: "Outro" }
      },
      {
        id: "dificuldade",
        rotulo: "Qual é a principal dificuldade que vocês enfrentam hoje no digital?",
        tipo: "textarea",
        placeholder: "Ex: fazemos anúncio do encarte mas não sabemos se traz gente na loja, o movimento cai no meio do mês, a concorrência anuncia mais que a gente...",
        ajuda: "Quanto mais específico, melhor conseguimos te responder. Pode pular se preferir.",
        obrigatoria: false
      }
    ]
  },

  {
    id: "decisao",
    etiqueta: "Decisão",
    titulo: "Momento da empresa",
    apoio: "Último bloco. Serve para sabermos como e quando falar com você.",
    perguntas: [
      {
        id: "momento",
        rotulo: "Existe interesse em contratar uma empresa especializada em tráfego pago para supermercados?",
        tipo: "escolha",
        obrigatoria: true,
        opcoes: [
          { valor: "Sim, estamos procurando agora", peso: 5 },
          { valor: "Sim, nos próximos 30 dias", peso: 4 },
          { valor: "Estamos avaliando possibilidades", peso: 2 },
          { valor: "Por enquanto, quero apenas entender melhor", peso: 1 }
        ]
      },
      {
        id: "decisor",
        rotulo: "Quem participa da decisão sobre a contratação de marketing?",
        tipo: "escolha",
        obrigatoria: true,
        opcoes: [
          { valor: "Eu sou o responsável pela decisão", peso: 5 },
          { valor: "Decido junto com outras pessoas", peso: 4 },
          { valor: "Preciso apresentar a proposta para outra pessoa", peso: 2 },
          { valor: "Não participo diretamente da decisão", peso: 0 }
        ]
      },
      {
        id: "observacoes",
        rotulo: "Tem algo sobre o supermercado ou sobre o momento da empresa que seja importante nos contar?",
        tipo: "textarea",
        placeholder: "Opcional. Abertura de loja nova, reforma, troca de agência, entrada de concorrente na cidade...",
        obrigatoria: false
      }
    ]
  }
];

/* ============================================================
   CLASSIFICAÇÃO DO LEAD
   O total de pontos vira uma nota de 0 a 100 e uma temperatura.
   Ajuste os cortes conforme o time comercial for calibrando.
   ============================================================ */

window.KADS_CLASSIFICACAO = [
  { ate: 39,  nivel: "C", rotulo: "Frio",   acao: "Nutrir" },
  { ate: 64,  nivel: "B", rotulo: "Morno",  acao: "Contato em até 48h" },
  { ate: 100, nivel: "A", rotulo: "Quente", acao: "Prioridade, falar hoje" }
];
