/* ============================================================
   K ADS — MOTOR DO DIAGNÓSTICO
   Lê o schema de perguntas, monta as etapas, valida, pontua
   o lead e envia para a planilha.
   ============================================================ */

(function () {
  "use strict";

  var CFG    = window.KADS_CONFIG || {};
  var STEPS  = window.KADS_STEPS || [];
  var CLASSES = window.KADS_CLASSIFICACAO || [];
  var CHAVE_RASCUNHO = "kads_diagnostico_rascunho";

  var UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
             "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

  var estado = {
    passo: -1,          // -1 = abertura, 0..n = blocos, 999 = enviado
    respostas: {},
    enviando: false,
    resultado: null
  };

  var palco       = document.getElementById("palco-passo");
  var forma       = document.getElementById("forma");
  var avisoGeral  = document.getElementById("aviso-geral");
  var progresso   = document.getElementById("progresso");
  var trilhos     = document.getElementById("progresso-trilhos");

  /* ---------- utilidades ---------- */

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function todasPerguntas() {
    var lista = [];
    STEPS.forEach(function (b) { b.perguntas.forEach(function (p) { lista.push(p); }); });
    return lista;
  }

  function acharPergunta(id) {
    return todasPerguntas().filter(function (p) { return p.id === id; })[0];
  }

  /* Uma pergunta condicional só conta se a condição estiver satisfeita. */
  function visivel(p) {
    if (!p.dependeDe) return true;
    return estado.respostas[p.dependeDe.pergunta] === p.dependeDe.valor;
  }

  function mascaraTelefone(v) {
    var d = String(v).replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2)  return d.length ? "(" + d : "";
    if (d.length <= 6)  return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  function emailValido(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  }

  function telefoneValido(v) {
    var d = String(v).replace(/\D/g, "");
    if (d.length < 10 || d.length > 11) return false;
    if (/^(\d)\1+$/.test(d)) return false;          // 00000000000
    if (Number(d.slice(0, 2)) < 11) return false;   // DDD inexistente
    return true;
  }

  /* ---------- rascunho ---------- */

  function salvarRascunho() {
    if (!CFG.salvarRascunho) return;
    try {
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({
        passo: estado.passo, respostas: estado.respostas, quando: Date.now()
      }));
    } catch (e) { /* navegador sem storage, segue o jogo */ }
  }

  function lerRascunho() {
    if (!CFG.salvarRascunho) return null;
    try {
      var bruto = localStorage.getItem(CHAVE_RASCUNHO);
      if (!bruto) return null;
      var d = JSON.parse(bruto);
      /* rascunho vale por 7 dias */
      if (!d || Date.now() - (d.quando || 0) > 7 * 864e5) return null;
      return d;
    } catch (e) { return null; }
  }

  function limparRascunho() {
    try { localStorage.removeItem(CHAVE_RASCUNHO); } catch (e) {}
  }

  /* ---------- pontuação do lead ---------- */

  function pontuar() {
    var total = 0, maximo = 0;

    todasPerguntas().forEach(function (p) {
      if (!p.opcoes) return;
      var pesos = p.opcoes
        .map(function (o) { return typeof o.peso === "number" ? o.peso : null; })
        .filter(function (x) { return x !== null; });
      if (!pesos.length) return;

      maximo += Math.max.apply(null, pesos);

      var resp = estado.respostas[p.id];
      var achou = p.opcoes.filter(function (o) { return o.valor === resp; })[0];
      if (achou && typeof achou.peso === "number") total += achou.peso;
    });

    var nota = maximo ? Math.round((total / maximo) * 100) : 0;
    var faixa = CLASSES.filter(function (c) { return nota <= c.ate; })[0] || CLASSES[CLASSES.length - 1];

    return {
      pontos: total,
      maximo: maximo,
      nota: nota,
      nivel: faixa ? faixa.nivel : "",
      temperatura: faixa ? faixa.rotulo : "",
      acao: faixa ? faixa.acao : ""
    };
  }

  /* ---------- origem do lead ---------- */

  function origem() {
    var q = new URLSearchParams(location.search);
    var utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      if (q.get(k)) utm[k] = q.get(k);
    });
    return {
      utm: utm,
      origem_texto: Object.keys(utm).length
        ? [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean).join(" / ")
        : (document.referrer ? "Referência: " + document.referrer : "Acesso direto"),
      pagina: location.href,
      dispositivo: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Celular" : "Computador"
    };
  }

  /* ---------- montagem dos campos ---------- */

  function montarCampo(p) {
    var largura = p.largura ? ' data-largura="' + p.largura + '"' : "";
    var oculto  = visivel(p) ? "" : " hidden";
    var valor   = estado.respostas[p.id] || "";

    var html = '<div class="campo" data-campo="' + p.id + '"' + largura + oculto + '>';

    html += '<label class="campo-rotulo" for="c-' + p.id + '">' + esc(p.rotulo);
    if (!p.obrigatoria) html += '<span class="opcional">opcional</span>';
    html += '</label>';

    if (p.ajuda) html += '<p class="campo-ajuda">' + esc(p.ajuda) + '</p>';

    if (p.tipo === "escolha") {
      html += '<div class="controles" role="radiogroup" aria-labelledby="c-' + p.id + '">';
      p.opcoes.forEach(function (o, i) {
        var marcado = valor === o.valor ? " checked" : "";
        html += '<label class="opcao">' +
                  '<input type="radio" name="' + p.id + '" value="' + esc(o.valor) + '"' + marcado +
                  ' id="c-' + p.id + (i === 0 ? '' : '-' + i) + '">' +
                  '<span class="opcao-marca" aria-hidden="true"></span>' +
                  '<span class="opcao-texto">' + esc(o.valor) + '</span>' +
                '</label>';
      });
      html += '</div>';

    } else if (p.tipo === "textarea") {
      html += '<textarea id="c-' + p.id + '" name="' + p.id + '" placeholder="' +
              esc(p.placeholder || "") + '">' + esc(valor) + '</textarea>';

    } else if (p.tipo === "uf") {
      html += '<div class="select-embrulho"><select id="c-' + p.id + '" name="' + p.id + '">' +
              '<option value="">UF</option>';
      UFS.forEach(function (uf) {
        html += '<option value="' + uf + '"' + (valor === uf ? " selected" : "") + '>' + uf + '</option>';
      });
      html += '</select></div>';

    } else {
      var tipo = p.tipo === "telefone" ? "tel" : (p.tipo === "email" ? "email" : "text");
      var extra = "";
      if (p.tipo === "telefone") extra = ' inputmode="tel" maxlength="16"';
      if (p.tipo === "email")    extra = ' inputmode="email" spellcheck="false" autocapitalize="off"';
      html += '<input type="' + tipo + '" id="c-' + p.id + '" name="' + p.id + '"' + extra +
              ' value="' + esc(valor) + '" placeholder="' + esc(p.placeholder || "") + '"' +
              (p.autocomplete ? ' autocomplete="' + p.autocomplete + '"' : "") + '>';
    }

    html += '<p class="campo-erro"><span aria-hidden="true">▲</span> <span class="campo-erro-texto"></span></p>';
    html += '</div>';
    return html;
  }

  /* Agrupa campos que dividem a mesma linha (cidade e UF) */
  function montarCampos(perguntas) {
    var html = '<div class="campos">';
    var i = 0;
    while (i < perguntas.length) {
      var p = perguntas[i];
      if (p.largura) {
        var linha = [];
        while (i < perguntas.length && perguntas[i].largura) { linha.push(perguntas[i]); i++; }
        html += '<div class="campo-linha">' + linha.map(montarCampo).join("") + '</div>';
      } else {
        html += montarCampo(p);
        i++;
      }
    }
    return html + '</div>';
  }

  /* ---------- telas ---------- */

  /* Conta o que a pessoa realmente vê: tira as condicionais e o campo de UF,
     que é complemento da cidade e não uma pergunta a mais. */
  function quantasPerguntas() {
    return todasPerguntas().filter(function (p) {
      return !p.dependeDe && p.largura !== "um-terco";
    }).length;
  }

  function telaAbertura() {
    var rascunho = lerRascunho();
    var temRascunho = rascunho && rascunho.passo >= 0;

    return '<div class="entra">' +
      '<div class="bloco-cabeca">' +
        '<div class="bloco-indice"><span>Diagnóstico</span><hr></div>' +
        '<h2 class="bloco-titulo">Vamos entender o momento do seu supermercado</h2>' +
        '<p class="bloco-apoio">Responda algumas perguntas rápidas. A partir das respostas, nossa equipe avalia o cenário e entra em contato caso faça sentido avançarmos para uma conversa estratégica.</p>' +
      '</div>' +
      '<ul class="abertura-lista">' +
        '<li><b>' + quantasPerguntas() + '</b> perguntas, quase todas de múltipla escolha</li>' +
        '<li><b>3</b> minutos para responder, dá para fazer pelo celular</li>' +
        '<li><b>0</b> compromisso, você só é chamado se fizer sentido</li>' +
      '</ul>' +
      '<div class="acoes">' +
        '<button type="button" class="botao botao-principal" data-acao="comecar">' +
          (temRascunho ? 'Continuar de onde parei' : 'Começar diagnóstico') +
          '<span aria-hidden="true">→</span></button>' +
        (temRascunho ? '<button type="button" class="botao botao-secundario" data-acao="recomecar">Começar do zero</button>' : '') +
        '<span class="acoes-nota">Suas respostas ficam só com o time da K Ads</span>' +
      '</div>' +
    '</div>';
  }

  function telaBloco(indice) {
    var b = STEPS[indice];
    var ultimo = indice === STEPS.length - 1;

    return '<div class="entra">' +
      '<div class="bloco-cabeca">' +
        '<div class="bloco-indice"><span>' + esc(b.etiqueta) + '</span><hr>' +
          '<span>' + (indice + 1) + ' de ' + STEPS.length + '</span></div>' +
        '<h2 class="bloco-titulo" tabindex="-1" id="foco-bloco">' + esc(b.titulo) + '</h2>' +
        (b.apoio ? '<p class="bloco-apoio">' + esc(b.apoio) + '</p>' : '') +
      '</div>' +
      montarCampos(b.perguntas) +
      '<div class="acoes">' +
        '<button type="button" class="botao botao-principal" data-acao="avancar">' +
          (ultimo ? 'Enviar diagnóstico' : 'Continuar') +
          '<span aria-hidden="true">→</span></button>' +
        '<button type="button" class="botao botao-secundario" data-acao="voltar">Voltar</button>' +
      '</div>' +
    '</div>';
  }

  function telaFinal() {
    var r = estado.resultado || {};
    var nome = (estado.respostas.nome || "").split(" ")[0];
    var zap = "https://wa.me/" + (CFG.whatsapp || "") +
              "?text=" + encodeURIComponent(CFG.whatsappMensagem || "");

    return '<div class="final entra">' +
      '<div class="final-selo"><svg viewBox="0 0 24 24" fill="none" stroke-width="2.6" ' +
        'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>' +
      '<h2 class="final-titulo">Recebemos, ' + esc(nome || "obrigado") + '.</h2>' +
      '<p class="final-texto">Seu diagnóstico já está com o nosso time. Vamos analisar o cenário do ' +
        esc(estado.respostas.supermercado || "seu supermercado") +
        ' e, se fizer sentido avançarmos, falamos com você pelo WhatsApp.</p>' +
      '<dl class="final-cartao">' +
        '<dt>Supermercado</dt><dd>' + esc(estado.respostas.supermercado || "") +
          ' · ' + esc(estado.respostas.cidade || "") + '/' + esc(estado.respostas.estado || "") + '</dd>' +
        '<dt>Retorno pelo WhatsApp</dt><dd>' + esc(estado.respostas.whatsapp || "") + '</dd>' +
        '<dt>E-mail</dt><dd>' + esc(estado.respostas.email || "") + '</dd>' +
      '</dl>' +
      '<div class="acoes">' +
        '<a class="botao botao-principal" href="' + zap + '" target="_blank" rel="noopener">' +
          'Falar agora no WhatsApp<span aria-hidden="true">→</span></a>' +
        '<span class="acoes-nota">Protocolo ' + esc(r.protocolo || "gerado no envio") + '</span>' +
      '</div>' +
    '</div>';
  }

  /* ---------- render ---------- */

  function render() {
    avisoGeral.textContent = "";

    if (estado.passo === -1) {
      document.body.dataset.fase = "abertura";
      progresso.hidden = true;
      palco.innerHTML = telaAbertura();
    } else if (estado.passo === 999) {
      document.body.dataset.fase = "enviado";
      progresso.hidden = true;
      palco.innerHTML = telaFinal();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.body.dataset.fase = "respondendo";
      progresso.hidden = false;
      palco.innerHTML = telaBloco(estado.passo);
      atualizarProgresso();
      window.scrollTo({ top: 0, behavior: "smooth" });
      var foco = document.getElementById("foco-bloco");
      if (foco) foco.focus({ preventScroll: true });
    }
  }

  function atualizarProgresso() {
    document.getElementById("progresso-atual").textContent = estado.passo + 1;
    document.getElementById("progresso-total").textContent = STEPS.length;
    document.getElementById("progresso-nome").textContent = STEPS[estado.passo].etiqueta;

    trilhos.innerHTML = STEPS.map(function (_, i) {
      var cls = i < estado.passo ? " cheio" : (i === estado.passo ? " atual" : "");
      return '<span class="trilho' + cls + '"></span>';
    }).join("");

    trilhos.setAttribute("aria-valuenow", Math.round((estado.passo / STEPS.length) * 100));
  }

  /* Mostra e esconde campos condicionais sem redesenhar a etapa */
  function atualizarCondicionais() {
    STEPS[estado.passo] && STEPS[estado.passo].perguntas.forEach(function (p) {
      if (!p.dependeDe) return;
      var no = palco.querySelector('[data-campo="' + p.id + '"]');
      if (!no) return;

      if (visivel(p)) {
        /* Voltou a aparecer. Se estava com a resposta automática de quando
           estava escondido, limpa para a pessoa responder de verdade. */
        if (no.hidden && p.respostaAutomatica &&
            estado.respostas[p.id] === p.respostaAutomatica) {
          delete estado.respostas[p.id];
          Array.prototype.forEach.call(
            no.querySelectorAll("input[type=radio]"),
            function (r) { r.checked = false; }
          );
        }
        no.hidden = false;
      } else {
        no.hidden = true;
        no.classList.remove("com-erro");
        if (p.respostaAutomatica) estado.respostas[p.id] = p.respostaAutomatica;
        else delete estado.respostas[p.id];
      }
    });
  }

  /* ---------- validação ---------- */

  function erroDoCampo(p) {
    var v = (estado.respostas[p.id] || "").trim();

    if (!v) {
      if (!p.obrigatoria) return null;
      if (p.tipo === "escolha") return "Escolha uma opção para seguir.";
      if (p.tipo === "uf")      return "Selecione o estado.";
      return "Esse campo é necessário para seguirmos.";
    }
    if (p.id === "nome" && v.length < 3)                 return "Escreva seu nome completo.";
    if (p.tipo === "telefone" && !telefoneValido(v))     return "Confira o número com DDD.";
    if (p.tipo === "email" && !emailValido(v))           return "Confira o e-mail, parece estar incompleto.";
    if (p.minimo && v.length < p.minimo)                 return "Conta um pouco mais, com pelo menos " + p.minimo + " caracteres.";
    return null;
  }

  function validarBloco() {
    var bloco = STEPS[estado.passo];
    var primeiroErro = null;

    bloco.perguntas.forEach(function (p) {
      var no = palco.querySelector('[data-campo="' + p.id + '"]');
      if (!no) return;
      no.classList.remove("com-erro");
      if (!visivel(p)) return;

      var erro = erroDoCampo(p);
      if (erro) {
        no.classList.add("com-erro");
        no.querySelector(".campo-erro-texto").textContent = erro;
        if (!primeiroErro) primeiroErro = no;
      }
    });

    if (primeiroErro) {
      primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
      var alvo = primeiroErro.querySelector("input, textarea, select");
      if (alvo) alvo.focus({ preventScroll: true });
      return false;
    }
    return true;
  }

  /* ---------- envio ---------- */

  function montarEnvio() {
    var r = pontuar();
    var o = origem();
    var protocolo = "KA-" + Date.now().toString(36).toUpperCase().slice(-6);

    var respostas = {};
    todasPerguntas().forEach(function (p) {
      respostas[p.id] = estado.respostas[p.id] || "";
    });

    /* Se o objetivo foi "Outro", o texto livre substitui na leitura do comercial */
    if (respostas.objetivo === "Outro" && respostas.objetivo_outro) {
      respostas.objetivo = "Outro: " + respostas.objetivo_outro;
    }

    return {
      protocolo: protocolo,
      enviado_em: new Date().toISOString(),
      respostas: respostas,
      qualificacao: r,
      origem: o
    };
  }

  function enviar() {
    if (estado.enviando) return;

    var dados = montarEnvio();
    estado.resultado = { protocolo: dados.protocolo };

    var botao = palco.querySelector('[data-acao="avancar"]');
    estado.enviando = true;
    if (botao) { botao.disabled = true; botao.firstChild.textContent = "Enviando"; }

    /* O Google leva alguns segundos para responder, principalmente na primeira
       chamada do dia. Sem esse aviso a pessoa acha que travou e fecha a página. */
    avisoGeral.className = "aviso-status";
    avisoGeral.textContent = "Registrando suas respostas. Isso leva alguns segundos, não feche a página.";

    function concluir() {
      avisoGeral.className = "campo-erro";
      avisoGeral.textContent = "";
      limparRascunho();
      estado.enviando = false;
      estado.passo = 999;
      render();
    }

    function falhou(motivo) {
      estado.enviando = false;
      if (botao) { botao.disabled = false; botao.firstChild.textContent = "Enviar diagnóstico"; }
      avisoGeral.className = "campo-erro";
      avisoGeral.innerHTML = 'Não conseguimos enviar agora. Tente de novo em instantes ou ' +
        '<a href="https://wa.me/' + (CFG.whatsapp || "") + '?text=' +
        encodeURIComponent("Olá! Tentei enviar o diagnóstico da K Ads e não foi.") +
        '" target="_blank" rel="noopener">fale com a gente no WhatsApp</a>.';
      console.error("[K Ads] Falha no envio:", motivo, dados);
    }

    /* Modo teste: sem endpoint configurado, nada é gravado */
    if (!CFG.endpoint) {
      console.group("[K Ads] MODO TESTE — nada foi gravado na planilha");
      console.log("Configure a URL do Apps Script em assets/js/config.js");
      console.table(dados.respostas);
      console.log("Qualificação:", dados.qualificacao);
      console.groupEnd();
      setTimeout(concluir, 700);
      return;
    }

    /* text/plain evita o preflight de CORS, que o Apps Script não responde */
    var corta = null;
    var opcoes = {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dados)
    };

    if (typeof AbortController === "function") {
      var controle = new AbortController();
      opcoes.signal = controle.signal;
      corta = setTimeout(function () { controle.abort(); }, 45000);
    }

    fetch(CFG.endpoint, opcoes)
      .then(function (resp) { if (corta) clearTimeout(corta); return resp; })
      .then(function (resp) { return resp.json().catch(function () { return { ok: resp.ok }; }); })
      .then(function (json) {
        if (json && json.ok === false) return falhou(json.erro || "recusado pela planilha");
        concluir();
      })
      .catch(function (e) {
        if (corta) clearTimeout(corta);
        falhou(e.name === "AbortError" ? "demorou demais" : (e.message || "sem conexão"));
      });
  }

  /* ---------- eventos ---------- */

  forma.addEventListener("click", function (e) {
    var alvo = e.target.closest("[data-acao]");
    if (!alvo) return;
    var acao = alvo.dataset.acao;

    if (acao === "comecar") {
      var d = lerRascunho();
      estado.passo = d && d.passo >= 0 ? Math.min(d.passo, STEPS.length - 1) : 0;
      if (d) estado.respostas = d.respostas || {};
      render();

    } else if (acao === "recomecar") {
      limparRascunho();
      estado.respostas = {};
      estado.passo = 0;
      render();

    } else if (acao === "voltar") {
      estado.passo = estado.passo - 1;
      render();

    } else if (acao === "avancar") {
      if (!validarBloco()) return;
      salvarRascunho();
      if (estado.passo === STEPS.length - 1) enviar();
      else { estado.passo++; render(); }
    }
  });

  forma.addEventListener("input", function (e) {
    var campo = e.target.closest("[data-campo]");
    if (!campo) return;
    var id = campo.dataset.campo;
    var p = acharPergunta(id);

    if (p && p.tipo === "telefone") e.target.value = mascaraTelefone(e.target.value);

    estado.respostas[id] = e.target.value;
    campo.classList.remove("com-erro");
    atualizarCondicionais();
    salvarRascunho();
  });

  forma.addEventListener("change", function (e) {
    var campo = e.target.closest("[data-campo]");
    if (!campo) return;
    estado.respostas[campo.dataset.campo] = e.target.value;
    campo.classList.remove("com-erro");
    atualizarCondicionais();
    salvarRascunho();

    /* Marcou uma opção, o próximo campo pendente ganha o foco */
    if (e.target.type === "radio") {
      var seguinte = campo.nextElementSibling;
      if (seguinte && !seguinte.hidden) {
        var alvo = seguinte.querySelector("input, textarea, select");
        if (alvo && !alvo.value) alvo.focus({ preventScroll: true });
      }
    }
  });

  /* Enter avança, menos dentro de textarea */
  forma.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    if (e.target.tagName === "TEXTAREA") return;
    e.preventDefault();
    var botao = palco.querySelector('[data-acao="avancar"], [data-acao="comecar"]');
    if (botao) botao.click();
  });

  /* ---------- início ---------- */

  document.getElementById("progresso-total").textContent = STEPS.length;
  render();
})();
