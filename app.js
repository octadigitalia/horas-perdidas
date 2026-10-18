/* Diagnostico de Horas Perdidas: controlador de telas e captura de lead.
   Depende de calc.js (motor) e config.js (HPH_CONFIG). */
(function () {
  "use strict";

  var estado = { colaboradores: 15, custoHora: HPH_CONFIG.custoHoraDefault, processos: [] };
  var $ = function (sel) { return document.querySelector(sel); };

  function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(function (t) { t.classList.remove("ativa"); });
    var alvo = $(id);
    if (alvo) {
      alvo.classList.add("ativa");
      alvo.scrollIntoView({ behavior: "smooth" });
    }
  }

  function montarTipos() {
    var sel = $("#proc-tipo");
    sel.innerHTML = "";
    Object.keys(TIPO_PROCESSO).forEach(function (k) {
      var opt = document.createElement("option");
      opt.value = k;
      opt.textContent = TIPO_PROCESSO[k].label;
      sel.appendChild(opt);
    });
  }

  function lerProcessoDoFormulario() {
    var tipo = $("#proc-tipo").value;
    return {
      tipo: tipo,
      nome: tipo === "outros" ? ($("#proc-nome").value || "Outro processo manual") : TIPO_PROCESSO[tipo].label,
      freq: $("#proc-freq").value,
      execucoes: Math.max(1, parseInt($("#proc-exec").value, 10) || 0),
      minutos: Math.max(1, parseInt($("#proc-min").value, 10) || 0),
      pessoas: Math.max(1, parseInt($("#proc-pessoas").value, 10) || 1),
      dadosEstruturados: $("#proc-estruturado").checked,
    };
  }

  function atualizarLista() {
    var el = $("#lista-processos");
    if (!estado.processos.length) { el.textContent = "Nenhum processo registrado ainda."; return; }
    el.textContent = "Registrados: " + estado.processos.map(function (p, i) {
      return (i + 1) + "º " + p.nome;
    }).join(", ") + ". Limite de 5 processos.";
    $("#btn-processo-avancar").disabled = estado.processos.length >= 5;
  }

  function formatarBRL(valor) {
    return "R$ " + valor.toLocaleString("pt-BR");
  }

  function renderarResultado(res) {
    $("#res-horas").textContent = res.horasMes.toLocaleString("pt-BR");
    $("#res-custo").textContent = formatarBRL(res.custoMes);
    $("#res-ano").textContent = formatarBRL(res.custoAno);
    $("#res-score").textContent = res.score;

    var ol = $("#ranking");
    ol.innerHTML = "";
    res.ranking.forEach(function (p, i) {
      var li = document.createElement("li");
      li.innerHTML = "<b>" + (i + 1) + "º " + p.nome + "</b>: " +
        p.horasMes.toLocaleString("pt-BR") + " h/mês, " + formatarBRL(Math.round(p.custoMes)) + "/mês. " +
        "<span class='sugestao'>Primeira automação possível: " + TIPO_PROCESSO[p.tipo].automacao + "</span>";
      ol.appendChild(li);
    });

    var cta = $("#cta-hub");
    if (HPH_CONFIG.hubUrl) {
      cta.href = HPH_CONFIG.hubUrl;
      cta.target = "_blank";
    } else {
      cta.href = "guia.html";
      cta.removeAttribute("target");
    }
  }

  function paramsUtm() {
    var p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get("utm_source") || "",
      utm_medium: p.get("utm_medium") || "",
      utm_campaign: p.get("utm_campaign") || "",
      canal_origem: p.get("origem") || (document.referrer ? new URL(document.referrer, window.location.href).hostname : "direto"),
    };
  }

  function prepararCaptura(res) {
    var bloco = $("#bloco-captura");
    if (!HPH_CONFIG.leadsWebhookUrl) { bloco.style.display = "none"; return; }
    bloco.style.display = "";
    $("#form-email").onsubmit = function (ev) {
      ev.preventDefault();
      var msg = $("#msg-envio");
      msg.textContent = "Enviando";
      var payload = {
        email: $("#lead-email").value,
        timestamp: new Date().toISOString(),
        ativo: HPH_CONFIG.nomeAtivo,
        versao: HPH_CONFIG.versao,
        horasMes: res.horasMes,
        custoMes: res.custoMes,
        custoAno: res.custoAno,
        score: res.score,
        topProcessos: res.ranking.map(function (p) { return p.nome; }).join(" | "),
        utm: paramsUtm(),
      };
      fetch(HPH_CONFIG.leadsWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(function (r) {
        if (r.ok) {
          msg.textContent = "Recebido. Em instantes o resumo e o guia chegam no seu e-mail.";
          $("#btn-enviar").disabled = true;
        } else {
          msg.textContent = "Falha no envio. Tente novamente em instantes.";
        }
      }).catch(function () {
        msg.textContent = "Falha de conexão. Tente novamente em instantes.";
      });
    };
  }

  function calcularEExibir() {
    var res = calcularResultado(estado);
    renderarResultado(res);
    prepararCaptura(res);
    mostrarTela("#tela-resultado");
  }

  function vincularEventos() {
    $("#btn-iniciar").addEventListener("click", function () { mostrarTela("#tela-basico"); });
    $("#proc-tipo").addEventListener("change", function () {
      $("#campo-outro-processo").style.display = this.value === "outros" ? "" : "none";
    });
    $("#btn-basico-avancar").addEventListener("click", function () {
      estado.colaboradores = Math.max(1, parseInt($("#colaboradores").value, 10) || 0);
      estado.custoHora = Math.max(1, parseFloat($("#custo-hora").value) || HPH_CONFIG.custoHoraDefault);
      mostrarTela("#tela-processos");
      atualizarLista();
    });
    $("#btn-processo-avancar").addEventListener("click", function (ev) {
      ev.preventDefault();
      if (estado.processos.length >= 5) { return; }
      estado.processos.push(lerProcessoDoFormulario());
      $("#form-processo").reset();
      montarTipos();
      $("#campo-outro-processo").style.display = "none";
      atualizarLista();
    });
    $("#btn-processo-finalizar").addEventListener("click", function (ev) {
      ev.preventDefault();
      if (!estado.processos.length) {
        estado.processos.push(lerProcessoDoFormulario());
      }
      calcularEExibir();
    });
    $("#btn-refazer").addEventListener("click", function () {
      estado = { colaboradores: 15, custoHora: HPH_CONFIG.custoHoraDefault, processos: [] };
      montarTipos();
      mostrarTela("#tela-abertura");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    montarTipos();
    vincularEventos();
  });
})();
