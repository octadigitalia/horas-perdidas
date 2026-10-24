/* Configuracao de producao do Diagnostico de Horas Perdidas (OctaDigital).
   ATIVO CANCELADO pelo Board em 2026-10-24 (OCT-20): captura desligada.
   Mapeador em octadigital.com.br/mapeador segue intacto e separado. */
const HPH_CONFIG = {
  /* Endpoint de captura de leads: DESLIGADO por cancelamento total.
     Valor vazio oculta o campo de e-mail por design, sem promessa quebrada. */
  leadsWebhookUrl: "",

  /* Link de checkout/parceiro do Hub de IA (R$ 97/mes) usado no CTA final. */
  hubUrl: "https://octadigital.com.br/",

  /* Custo medio da hora de trabalho manual (BRL), pre-populado e editavel
     pelo usuario na primeira tela do diagnostico. */
  custoHoraDefault: 35,

  /* Versao do ativo, enviada em cada lead para diagnostico de regressao. */
  versao: "1.0.0-cancelled",
};
