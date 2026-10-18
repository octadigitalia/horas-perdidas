/* Motor de calculo do Diagnostico de Horas Perdidas.
   Funcoes puras, sem acesso ao DOM, para permitir teste em node. */

const TIPO_PROCESSO = {
  captura_whatsapp: {
    label: "Captura de dados pelo WhatsApp",
    automacao: "Central de atendimento com bot que registra pedidos e dados do cliente direto no sistema, sem digitacao manual.",
  },
  planilhas: {
    label: "Consolidacao de planilhas",
    automacao: "Painel automatico que consolida as planilhas da equipe e recalcula os indicadores sozinho.",
  },
  propostas: {
    label: "Envio de propostas e e-mails",
    automacao: "Gerador de propostas e e-mails com modelo pronto que preenche tudo a partir do pedido.",
  },
  follow_up: {
    label: "Follow-up de clientes e orcamentos",
    automacao: "Sequencia automatica de follow-up disparada por gatilho com redacao assistida por IA.",
  },
  relatorios: {
    label: "Emissao de relatorios",
    automacao: "Relatorios gerados automaticamente a partir das fontes de dados e enviados no horario combinado.",
  },
  pedidos: {
    label: "Entrada manual de pedidos ou pagamentos",
    automacao: "Formulario de entrada conectado ao sistema com validacao automatica dos dados e do pagamento.",
  },
  outros: {
    label: "Outro processo manual",
    automacao: "Otimizacao assistida no Hub de IA: mapeamento do processo e definicao da primeira automatizacao.",
  },
};

/* Multiplicador de execucoes por mes por frequencia escolhida.
   Premissa: 21,7 dias uteis/mes arredondados a 30 dias corridos para dias,
   4,33 semanas por mes para semanas. */
const FREQ_MES = { dia: 30, semana: 4.33, mes: 1 };

function calcularProcesso(custoHora, execucaoPorPeriodo, minutos, pessoas, freq) {
  const execPorMes = (execucaoPorPeriodo || 0) * (FREQ_MES[freq] || 1);
  const horasMes = ((execPorMes || 0) * (minutos || 0) * (pessoas || 1)) / 60;
  return {
    execPorMes,
    horasMes,
    custoMes: horasMes * custoHora,
  };
}

/* Score de prontidao para IA (0 a 100):
   volume (40), dados estruturados (30), repeticao (20), concentracao no maior
   processo (10). Deterministico e explicavel para o lead. */
function calcularScore(processos) {
  if (!processos.length) return 0;
  const horasTotal = processos.reduce((s, p) => s + p.horasMes, 0);
  const custoTotal = processos.reduce((s, p) => s + p.custoMes, 0);
  const volumeScore = (Math.min(horasTotal, 160) / 160) * 40;
  const comDados = processos.filter((p) => p.dadosEstruturados).length;
  const estruturaScore = (comDados / processos.length) * 30;
  const repetitivos = processos.filter((p) => p.freq === "dia" || p.freq === "semana").length;
  const repeticaoScore = (repetitivos / processos.length) * 20;
  const maiorProcesso = Math.max(...processos.map((p) => p.custoMes));
  const concentracaoScore = custoTotal > 0 ? Math.min(maiorProcesso / custoTotal, 1) * 10 : 0;
  const score = Math.round(volumeScore + estruturaScore + repeticaoScore + concentracaoScore);
  return Math.max(0, Math.min(100, score));
}

function calcularResultado(estado) {
  const processos = estado.processos.map((p) => {
    const calc = calcularProcesso(estado.custoHora, p.execucoes, p.minutos, p.pessoas, p.freq);
    return { ...p, ...calc };
  });
  const horasMes = processos.reduce((s, p) => s + p.horasMes, 0);
  const custoMes = processos.reduce((s, p) => s + p.custoMes, 0);
  const score = calcularScore(processos);
  const ranking = [...processos].sort((a, b) => b.custoMes - a.custoMes).slice(0, 3);
  return {
    horasMes: Math.round(horasMes * 10) / 10,
    custoMes: Math.round(custoMes),
    custoAno: Math.round(custoMes * 12),
    score,
    ranking,
    processosTotal: processos.length,
  };
}
