# Diagnóstico de Horas Perdidas (OctaDigital)

Primeiro ativo técnico proprietário da OctaDigital, motor de atração e captura para o Hub de IA (R$ 97/mês). Ferramenta web 100% estática: cálculo no navegador, sem backend, sem login, sem instalação.

- Promessa: descobrir em 2 minutos quanto os processos manuais de uma empresa custam em horas e reais todos os meses.
- Fluxo: 6 campos básicos + descrição de 1 a 5 processos manuais + resultado calculado (horas mensais, custo de oportunidade mensal e anual, score de prontidão para IA 0 a 100, ranking dos 3 processos mais caros com primeira automação possível), captura de e-mail opcional e CTA para o Hub.
- Origem da aprovação: OCT-26 (decisões do CMO) em execução pela OCT-20 (CTO), plano `bb174ff2`.

## Arquivos e endpoints

| Arquivo | Papel |
|---|---|
| `index.html` | Aplicação do diagnóstico (landing, perguntas, resultado, captura, CTA) |
| `guia.html` | Guia dos 3 primeiros passos entregue ao lead |
| `calc.js` | Motor de cálculo puro (testável em node) |
| `config.js` | Pontos de configuração: webhook de leads, link do Hub, custo/hora, versão |
| `app.js` | Controlador de telas, UTM e envio do lead |
| `styles.css` | Identidade visual (fundo escuro, acento âmbar) |

## Configuração de produção (config.js)

- `leadsWebhookUrl`: ativo em produção: `https://webhooks.octadigital.com.br/webhook/horas-perdidas-leads` (homologado em OCT-27 com CORS liberado para este domínio Pages, PostgreSQL de contingência e notificação executiva via WAHA).
- `hubUrl`: `https://octadigital.com.br/` (landing do Hub de IA, R$ 97/mês).
- `custoHoraDefault`: R$ 35, editável pelo usuário na primeira tela.

## Schema do lead (POST JSON no webhook)

```json
{
  "email": "seu@email.com.br",
  "timestamp": "2026-10-18T04:00:00.000Z",
  "ativo": "Diagnóstico de Horas Perdidas",
  "versao": "1.0.0",
  "horasMes": 62.5,
  "custoMes": 21880,
  "custoAno": 262560,
  "score": 74,
  "topProcessos": "Consolidação de planilhas | Follow-up de clientes e orçamentos | Emissão de relatórios",
  "utm": {
    "utm_source": "linkedin",
    "utm_medium": "social",
    "utm_campaign": "horas-perdidas-lancamento",
    "canal_origem": "post-oct-23"
  }
}
```

Parâmetro extra de URL: `?origem=` pode marcar o canal (post, carrossel, video). UTMs passam de forma transparente.

## Premissas de cálculo

- Frequência diária = 30 execuções/mês; semanal = 4,33; mensal = 1.
- Horas mensais do processo = execuções x minutos x pessoas / 60.
- Custo mensal = horas mensais x custo/hora informado pelo usuário (padrão R$ 35).
- Score de prontidão para IA: volume de horas (40, satura em 160 h/mês) + dados estruturados (30) + repetição (20) + concentração no maior processo (10).

## Teste local

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
node --check calc.js && node --check app.js && node --check config.js
```

## Deploy

Qualquer host estático valida este bundle: GitHub Pages (ativo neste repositório), S3 + CloudFront (page host corporativo) ou servidor nginx. Para o page host corporativo com domínio próprio (`octadigital.com.br`), usar o helper `paperclip-page` com o slug `octadigital-horas-perdidas`; o CNAME é guerra do Board (decisão de DNS).

## Diretrizes de conteúdo (para Content Engineer e Motion Video Editor)

- Ângulo: autoridade técnica por prova numérica. O lead vê o próprio prejuízo na tela.
- Abrir o post e o vídeo com o número do prejuízo gerado na tela; navegar o demo ao vivo.
- NÃO prometer entrega de e-mail sem o webhook do OCT-27 ativo (hoje está ativo e homologado; se o endpoint cair, acionar o roteador do Tráfego antes do conteúdo ir ao ar).
- NÃO alterar a cópia do CTA do Hub sem aprovação do CMO (bloco `cta-final`).

## Roteiro de homologação

1. Abrir `index.html`: landing exibida, sem travessão e sem promessa de captura.
2. Fluxo completo com dado real: 2 processos, conferir horas e R$ do resultado somados à mão.
3. Confirmar que o ranking ordena do maior para o menor custo.
4. Confirmar que o bloco de e-mail está oculto sem webhook e visível com webhook.
5. Confirmar CTA e guia, responsivo em tela estreita.
