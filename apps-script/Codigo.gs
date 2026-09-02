/* ============================================================
   K ADS — RECEBEDOR DO DIAGNÓSTICO
   Cole este código no Apps Script da sua planilha e publique
   como "app da web". O passo a passo está no README.md
   ============================================================ */

/* ---------- AJUSTES ---------- */

var ABA = "Leads";

/* Deixe vazio para não receber e-mail. Aceita vários separados por vírgula. */
var AVISAR_EMAIL = "";

/* Só manda e-mail para lead deste nível ou melhor. Use "A", "B" ou "C". */
var AVISAR_A_PARTIR_DE = "B";

/* ---------- ORDEM E TÍTULO DAS COLUNAS ---------- */

var COLUNAS = [
  ["quando",        "Data e hora"],
  ["protocolo",     "Protocolo"],
  ["nota",          "Nota"],
  ["nivel",         "Nível"],
  ["temperatura",   "Temperatura"],
  ["acao",          "Ação sugerida"],
  ["nome",          "Nome"],
  ["whatsapp",      "WhatsApp"],
  ["email",         "E-mail"],
  ["supermercado",  "Supermercado"],
  ["cidade",        "Cidade"],
  ["estado",        "UF"],
  ["unidades",      "Unidades"],
  ["faturamento",   "Faturamento mensal"],
  ["colaboradores", "Colaboradores"],
  ["ja_investiu",   "Já investiu em tráfego"],
  ["investimento",  "Investimento mensal"],
  ["equipe",        "Equipe de marketing"],
  ["objetivo",      "Objetivo principal"],
  ["dificuldade",   "Principal dificuldade"],
  ["momento",       "Momento de contratação"],
  ["decisor",       "Poder de decisão"],
  ["observacoes",   "Observações"],
  ["origem_texto",  "Origem"],
  ["dispositivo",   "Dispositivo"],
  ["pagina",        "Página"]
];

var CORES = { A: "#ffd6e6", B: "#ffe8cc", C: "#f1f1f1" };

/* ---------- ENTRADA ---------- */

function doPost(e) {
  var trava = LockService.getScriptLock();
  try {
    trava.waitLock(20000);

    if (!e || !e.postData || !e.postData.contents) {
      return responder({ ok: false, erro: "corpo vazio" });
    }

    var dados = JSON.parse(e.postData.contents);
    var linha = montarLinha(dados);
    var aba = pegarAba();

    aba.appendRow(linha);
    pintarLinha(aba, dados);
    avisar(dados);

    return responder({ ok: true, protocolo: dados.protocolo || "" });

  } catch (erro) {
    console.error(erro);
    return responder({ ok: false, erro: String(erro) });
  } finally {
    try { trava.releaseLock(); } catch (x) {}
  }
}

/* Abrir a URL no navegador confirma que a publicação está de pé. */
function doGet() {
  return responder({ ok: true, servico: "K Ads — recebedor do diagnóstico", ativo: true });
}

function responder(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- PLANILHA ---------- */

function pegarAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);

  if (!aba) {
    aba = planilha.insertSheet(ABA);
  }

  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS.map(function (c) { return c[1].toUpperCase(); }));
    formatarPlanilha(aba);
  }

  return aba;
}

/* ---------- FORMATAÇÃO ---------- */

/* Quantas linhas já saem formatadas. Como o appendRow escreve na primeira
   linha vazia, e essa linha já está formatada, cada lead novo entra no
   padrão sozinho, sem precisar rodar nada de novo. */
var LINHAS_FORMATADAS = 2000;

/* Rode esta função pelo editor sempre que quiser reaplicar o padrão visual. */
function formatarPlanilha(aba) {
  aba = aba || SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
  if (!aba) return;

  var colunas = COLUNAS.length;

  /* Cabeçalho em maiúsculo, negrito, 12, centralizado */
  var titulos = COLUNAS.map(function (c) { return c[1].toUpperCase(); });
  aba.getRange(1, 1, 1, colunas)
     .setValues([titulos])
     .setFontFamily("Arial")
     .setFontSize(12)
     .setFontWeight("bold")
     .setBackground("#0f1412")
     .setFontColor("#ff4d94")
     .setHorizontalAlignment("center")
     .setVerticalAlignment("middle")
     .setWrap(true);

  /* Corpo: mesma fonte 12, centralizado na horizontal e na vertical */
  aba.getRange(2, 1, LINHAS_FORMATADAS, colunas)
     .setFontFamily("Arial")
     .setFontSize(12)
     .setFontWeight("normal")
     .setHorizontalAlignment("center")
     .setVerticalAlignment("middle")
     .setWrap(true);

  aba.setRowHeight(1, 46);
  aba.setFrozenRows(1);

  larguras(aba, {
    quando: 165, protocolo: 120, nota: 80, nivel: 80, temperatura: 130,
    acao: 200, nome: 200, whatsapp: 160, email: 250, supermercado: 220,
    cidade: 160, estado: 70, unidades: 150, faturamento: 210,
    colaboradores: 150, ja_investiu: 190, investimento: 180, equipe: 200,
    objetivo: 230, dificuldade: 340, momento: 210, decisor: 230,
    observacoes: 320, origem_texto: 200, dispositivo: 130, pagina: 220
  });

  SpreadsheetApp.flush();
  Logger.log("Formatação aplicada em " + colunas + " colunas.");
}

/* Acha a coluna pela chave, assim incluir ou tirar pergunta não quebra a largura. */
function larguras(aba, mapa) {
  Object.keys(mapa).forEach(function (chave) {
    for (var i = 0; i < COLUNAS.length; i++) {
      if (COLUNAS[i][0] === chave) {
        aba.setColumnWidth(i + 1, mapa[chave]);
        return;
      }
    }
  });
}

function montarLinha(d) {
  var r = d.respostas || {};
  var q = d.qualificacao || {};
  var o = d.origem || {};

  var fonte = {
    quando:      d.enviado_em ? new Date(d.enviado_em) : new Date(),
    protocolo:   d.protocolo || "",
    nota:        q.nota,
    nivel:       q.nivel,
    temperatura: q.temperatura,
    acao:        q.acao,
    origem_texto: o.origem_texto || "",
    dispositivo:  o.dispositivo || "",
    pagina:       o.pagina || ""
  };

  return COLUNAS.map(function (c) {
    var chave = c[0];
    if (fonte.hasOwnProperty(chave)) return fonte[chave];
    return r[chave] !== undefined ? r[chave] : "";
  });
}

function pintarLinha(aba, d) {
  var nivel = (d.qualificacao || {}).nivel;
  if (!CORES[nivel]) return;
  aba.getRange(aba.getLastRow(), 1, 1, COLUNAS.length).setBackground(CORES[nivel]);
}

/* ---------- AVISO POR E-MAIL ---------- */

function avisar(d) {
  if (!AVISAR_EMAIL) return;

  var ordem = { A: 3, B: 2, C: 1 };
  var q = d.qualificacao || {};
  if ((ordem[q.nivel] || 0) < (ordem[AVISAR_A_PARTIR_DE] || 0)) return;

  var r = d.respostas || {};
  var assunto = "[K Ads] Lead " + (q.nivel || "") + " · " +
                (r.supermercado || "sem nome") + " · " + (r.cidade || "") + "/" + (r.estado || "");

  var corpo =
    "Nota " + q.nota + "/100 · " + q.temperatura + " · " + q.acao + "\n\n" +
    "Nome: " + (r.nome || "") + "\n" +
    "WhatsApp: " + (r.whatsapp || "") + "\n" +
    "E-mail: " + (r.email || "") + "\n" +
    "Supermercado: " + (r.supermercado || "") + "\n" +
    "Praça: " + (r.cidade || "") + "/" + (r.estado || "") + "\n" +
    "Unidades: " + (r.unidades || "") + "\n" +
    "Faturamento: " + (r.faturamento || "") + "\n" +
    "Investe hoje: " + (r.ja_investiu || "") + " · " + (r.investimento || "") + "\n" +
    "Momento: " + (r.momento || "") + "\n" +
    "Decisão: " + (r.decisor || "") + "\n\n" +
    "Objetivo: " + (r.objetivo || "") + "\n\n" +
    "Dificuldade relatada:\n" + (r.dificuldade || "") + "\n\n" +
    "Observações:\n" + (r.observacoes || "sem observações") + "\n\n" +
    "Origem: " + ((d.origem || {}).origem_texto || "") + "\n" +
    "Protocolo: " + (d.protocolo || "");

  MailApp.sendEmail(AVISAR_EMAIL, assunto, corpo);
}

/* ---------- TESTE ---------- */

/* Rode esta função uma vez pelo editor para criar a aba,
   autorizar as permissões e ver uma linha de exemplo. */
function testarComLeadFalso() {
  var falso = {
    protocolo: "KA-TESTE",
    enviado_em: new Date().toISOString(),
    respostas: {
      nome: "Lead de teste", whatsapp: "(24) 99999-0000",
      email: "teste@supermercadomodelo.com.br",
      supermercado: "Supermercado Modelo", cidade: "Volta Redonda", estado: "RJ",
      unidades: "2 a 3 unidades", faturamento: "De R$ 1 milhão a R$ 3 milhões",
      colaboradores: "51 a 100", ja_investiu: "Sim, investimos atualmente",
      investimento: "R$ 3.000 a R$ 5.000", equipe: "Temos apenas um profissional ou freelancer",
      objetivo: "Aumentar o movimento nas lojas",
      dificuldade: "Anunciamos o encarte mas não sabemos se traz gente na loja.",
      momento: "Sim, estamos procurando agora",
      decisor: "Eu sou o responsável pela decisão",
      observacoes: "Linha criada pelo teste, pode apagar."
    },
    qualificacao: { pontos: 26, maximo: 35, nota: 74, nivel: "A", temperatura: "Quente", acao: "Prioridade, falar hoje" },
    origem: { origem_texto: "Teste pelo editor", dispositivo: "Computador", pagina: "-" }
  };

  var aba = pegarAba();
  aba.appendRow(montarLinha(falso));
  pintarLinha(aba, falso);
  Logger.log("Linha de teste criada na aba " + ABA);
}
