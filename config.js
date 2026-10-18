/* Configuracao de producao do Diagnostico de Horas Perdidas (OctaDigital).
   Ajuste SO os valores abaixo; o restante da aplicacao nao muda. */
const HPH_CONFIG = {
  /* Endpoint de captura de leads: webhook do roteador do Trafego (Google Sheets).
     POST JSON com o schema documentado no README.
     Vazio = modo homologacao: o campo de e-mail fica oculto e nenhuma promessa
     de envio e exibida, evitando coleta quebrada. */
  leadsWebhookUrl: "",

  /* Link de checkout/parceiro do Hub de IA (R$ 97/mes) usado no CTA final.
     Deve ser preenchido antes do lancamento publico. */
  hubUrl: "",

  /* Custo medio da hora de trabalho manual (BRL), pre-populado e editavel
     pelo usuario na primeira tela do diagnostico. */
  custoHoraDefault: 35,

  /* Versao do ativo, enviada em cada lead para diagnostico de regressao. */
  versao: "1.0.0",
};
