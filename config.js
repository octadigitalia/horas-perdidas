/* Configuracao de producao do Diagnostico de Horas Perdidas (OctaDigital).
   Ajuste SO os valores abaixo; o restante da aplicacao nao muda. */
const HPH_CONFIG = {
  /* Endpoint de captura de leads: webhook do roteador do Trafego.
     Fluxo homologado em OCT-27: grava em Google Sheets + PostgreSQL de
     contingencia e notifica a executiva via WAHA. CORS liberado para
     https://octadigitalia.github.io. */
  leadsWebhookUrl: "https://webhooks.octadigital.com.br/webhook/horas-perdidas-leads",

  /* Link de checkout/parceiro do Hub de IA (R$ 97/mes) usado no CTA final. */
  hubUrl: "https://octadigital.com.br/",

  /* Custo medio da hora de trabalho manual (BRL), pre-populado e editavel
     pelo usuario na primeira tela do diagnostico. */
  custoHoraDefault: 35,

  /* Versao do ativo, enviada em cada lead para diagnostico de regressao. */
  versao: "1.0.0",
};
