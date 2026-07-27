# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 23

# ESPECIFICAÇÃO DE INTEGRAÇÕES

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Especificações de Integrações Externas

---

# Capítulo 1 — Objetivo

Este documento detalha as integrações externas suportadas pelo Projeto Orion, os protocolos de cada uma, autenticação, mapeamento de dados, e exemplos práticos de implementação. Integrações são essenciais para que o Orion troque dados com sistemas já existentes no cliente (ERPs, CRMs, mensageria, e-mail).

---

# Capítulo 2 — Visão Geral de Integrações

## 2.1 Categorias

| Categoria | Sistemas | Disponibilidade |
|-----------|----------|-----------------|
| ERP | Totvs, SAP B1, Sankhya | v2.0 |
| CRM | Salesforce, HubSpot, Pipedrive | v3.0 |
| Mensageria | WhatsApp, Telegram | v2.0 (plugins) |
| E-mail | SMTP, SendGrid, SES | v1.0 |
| E-commerce | Shopify, WooCommerce, VTEX | v3.0 |
| BI | Power BI, Tableau, Metabase | v3.0 |
| Auth | Google, Microsoft, SAML | v1.0-v2.0 |
| Storage | S3, Google Cloud Storage | v1.0 |

## 2.2 Tipos de Integração

### Inbound (sistema externo → Orion)
- Webhooks recebidos pelo Orion
- API REST consumida por sistemas externos
- Importação manual de arquivos (Excel, CSV)

### Outbound (Orion → sistema externo)
- Webhooks disparados pelo Orion
- Chamadas API para sistemas externos
- Exportação automática para FTP/S3

---

# Capítulo 3 — Integração com ERPs

## 3.1 Totvs (Protheus e RM)

### Visão
Sincroniza dados de vendas do Totvs com o Orion para lançar resultados automaticamente.

### Autenticação
- OAuth 2.0 com client credentials
- Ou Basic Auth com API key (legado)

### Endpoints Consumidos (Totvs → Orion)
```
GET /api/v1/sales?date={YYYY-MM-DD}
GET /api/v1/sales/{id}/items
GET /api/v1/products/{id}
GET /api/v1/sellers/{id}
```

### Mapeamento de Dados

| Totvs Field | Orion Field | Transformação |
|-------------|-------------|---------------|
| `F2_EMISSAO` | `result_date` | Date parse |
| `F2_VEND1` | `user.external_id` | Lookup por CPF |
| `F2_VALBRUT` | `value` | Decimal(18,4) |
| `F2_DOC` + `F2_SERIE` | `external_reference` | Concatenação |
| `C6_PRODUTO` | `product.external_id` | Lookup |
| `C6_VALOR` | `sale_item.value` | Decimal |

### Fluxo
```
1. Scheduler roda a cada 30min (configurável)
2. Busca vendas no Totvs desde última sincronização
3. Para cada venda:
   - Identifica vendedor por CPF
   - Mapeia indicadores (configurável: faturamento, itens, etc.)
   - Lança resultado no Orion via API
4. Marca timestamp de última sync
5. Emite evento result.imported (auditado)
```

### Tratamento de Erros
- Vendedor não encontrado: cria log, pula registro
- Valor inválido: cria log, pula registro
- Timeout Totvs: retry 3x com backoff exponencial

### Configuração no Orion
```
Admin > Integrações > ERP > Totvs
- URL base: https://api.totvs.com.br
- Client ID: ****
- Client Secret: ****
- Empresa: 01
- Filial: 0101
- Sincronizar a cada: 30 min
- Indicador padrão: Faturamento
- Status: Ativo
```

## 3.2 SAP Business One

### Diferenças vs Totvs
- API via Service Layer (REST)
- Autenticação por sessão (login/logout)
- Filtros via OData

### Mapeamento
| SAP B1 Field | Orion Field |
|--------------|-------------|
| `DocDate` | `result_date` |
| `SalesPersonCode` | `user.external_id` |
| `DocTotal` | `value` |
| `DocEntry` | `external_reference` |

## 3.3 Sankhya

### Visão
Sincronização via API REST Sankhya (Gan.

### Mapeamento
| Sankhya Field | Orion Field |
|---------------|-------------|
| `DTNEG` | `result_date` |
| `CODVEND` | `user.external_id` |
| `VLRNOTA` | `value` |
| `NUNOTA` | `external_reference` |

---

# Capítulo 4 — Integração com CRMs

## 4.1 Salesforce

### Visão
Permite que gestores vejam dados do CRM alongside dados de performance do Orion.

### Autenticação
- OAuth 2.0 com refresh token
- Sandbox e produção suportados

### Endpoints Consumidos
```
GET /services/data/v60.0/sobjects/Opportunity
GET /services/data/v60.0/sobjects/User/{id}
GET /services/data/v60.0/query?q=SELECT...
```

### Mapeamento

| Salesforce Field | Orion Field | Obs |
|------------------|-------------|-----|
| `Opportunity.OwnerId` | `user.external_id` | Salesperson |
| `Opportunity.Amount` | `sale.value` | Revenue |
| `Opportunity.CloseDate` | `result_date` | When closed |
| `Opportunity.StageName` | `sale.status` | Stage |
| `Account.Name` | `customer.name` | Customer |

### Webhook Salesforce → Orion
Quando oportunidade é marcada como "Closed Won":
1. Salesforce dispara webhook para `https://api.orion.com/v1/integrations/salesforce/webhook`
2. Orion valida assinatura HMAC
3. Mapeia oportunidade para resultado
4. Lança no Orion
5. Notifica vendedor

## 4.2 HubSpot

### Visão
Sincroniza deals do HubSpot como resultados no Orion.

### Autenticação
- API Key (v1) ou Private App (v2)

### Mapeamento
| HubSpot Field | Orion Field |
|---------------|-------------|
| `deal_amount` | `sale.value` |
| `deal_owner` | `user.external_id` |
| `closedate` | `result_date` |
| `dealstage` | `sale.status` |

## 4.3 Pipedrive

### Mapeamento
| Pipedrive Field | Orion Field |
|-----------------|-------------|
| `value` | `sale.value` |
| `user_id` | `user.external_id` |
| `won_time` | `result_date` |
| `status` | `sale.status` (won/lost) |

---

# Capítulo 5 — Integração com WhatsApp

## 5.1 WhatsApp Business API (Oficial)

### Visão
Permite enviar notificações para vendedores e gerentes via WhatsApp.

### Pré-requisitos
- WhatsApp Business API account (Meta)
- Número verificado
- Template messages aprovados

### Templates Aprovados

#### Novo Resultado Lançado
```
Olá, {{1}}!

Seu resultado de {{2}} foi registrado:
• {{3}}: {{4}}
• Progresso: {{5}}% da meta

Continue assim! 🚀
```

#### Meta Atingida 🎉
```
Parabéns {{1}}! 🎉

Você atingiu {{2}}% da meta de {{3}} hoje!

Sua posição no ranking: #{{4}}

Continue performando!
```

#### Campanha Começou
```
{{1}}, começou a campanha {{2}}! 🏆

Período: {{3}} a {{4}}
Indicador: {{5}}
Premiação: {{6}}

Acesse o Orion para acompanhar seu progresso.
```

### Fluxo de Envio
```
1. Evento ocorre no Orion (ex: goal.achieved)
2. Sistema verifica se webhook WhatsApp está configurado
3. Busca número do vendedor no cadastro
4. Monta mensagem com template
5. Envia para WhatsApp Business API
6. Aguarda confirmação de entrega
7. Registra auditoria
```

### Limites
- 1 mensagem por usuário por hora (anti-spam)
- Apenas templates aprovados (sem free text)
- Custo por mensagem (cobrado pela Meta)

### Configuração
```
Admin > Integrações > WhatsApp
- Phone Number ID: ****
- Business Account ID: ****
- Access Token: ****
- Webhook Verify Token: ****
- Templates mapeados: ✓
- Status: Ativo
```

## 5.2 WhatsApp NÃO Oficial (Plugin)

Aviso: usar API não oficial viola ToS da Meta. Plugin disponível mas não recomendado.

---

# Capítulo 6 — Integração com Telegram

## 6.1 Visão
Bot do Telegram para receber notificações e consultar dashboard.

## 6.2 Setup

1. Criar bot via @BotFather no Telegram
2. Obter token
3. Configurar no Orion
4. Usuários vinculam Telegram via `/start @OrionBot`

## 6.3 Comandos do Bot

| Comando | Ação |
|---------|------|
| `/start` | Vincula Telegram ao usuário Orion |
| `/metas` | Mostra metas do dia |
| `/ranking` | Mostra top 5 do dia |
| `/resultado` | Mostra seu resultado atual |
| `/campanhas` | Lista campanhas ativas |
| `/ajuda` | Lista comandos |

## 6.4 Notificações Automáticas

- Meta atingida 🎉
- Campanha começou
- Campanha terminando (3 dias)
- Resultado pendente de aprovação (gerentes)
- Insights de IA (opcional)

---

# Capítulo 7 — Integração com E-mail (SMTP)

## 7.1 Configuração SMTP

```
Admin > Sistema > Parâmetros > E-mail
- Host: smtp.sendgrid.net
- Porta: 587
- Usuário: apikey
- Senha: ****
- TLS: Sim
- Remetente: noreply@suaempresa.com
- Nome remetente: Sistema Orion
```

## 7.2 Templates de E-mail

### Boas-vindas
```
Assunto: Bem-vindo ao Orion, {{nome}}!

Olá {{nome}},

Sua conta no Orion foi criada pela {{empresa}}.

Para acessar:
- URL: {{login_url}}
- Login: {{email}}
- Senha temporária: {{senha_temp}}

Você será solicitado a trocar a senha no primeiro acesso.

Dúvidas? Contate seu supervisor.

Equipe Orion
```

### Reset de Senha
```
Assunto: Reset de senha - Orion

Olá {{nome}},

Recebemos uma solicitação para resetar sua senha.

Clique no link abaixo (válido por 1 hora):
{{reset_link}}

Se você não solicitou, ignore este e-mail.

Equipe Orion
```

### Relatório Diário (Gerentes)
```
Assunto: [Orion] Relatório diário - {{data}}

Resumo de {{empresa}} - {{filial}}:

📊 Faturamento: R$ {{valor}} ({{percentual}}% da meta)
👥 Vendedores ativos: {{ativos}}/{{total}}
🏆 Top vendedor: {{top_nome}} ({{top_pct}}%)
⚠️ Abaixo da meta: {{abaixo}} vendedores

Ver detalhes: {{dashboard_url}}

Equipe Orion
```

## 7.3 Provedores Suportados

| Provedor | Host | Porta |
|----------|------|-------|
| SendGrid | smtp.sendgrid.net | 587 |
| AWS SES | email-smtp.us-east-1.amazonaws.com | 587 |
| Mailgun | smtp.mailgun.org | 587 |
| Gmail (SMTP) | smtp.gmail.com | 587 |
| Office 365 | smtp.office365.com | 587 |
| Generic SMTP | (configurável) | (configurável) |

---

# Capítulo 8 — Integração com E-commerce

## 8.1 Shopify

### Visão
Importa pedidos do Shopify como resultados de vendas.

### Autenticação
- OAuth 2.0 (Shopify App)

### Webhook Shopify → Orion
```
POST /v1/integrations/shopify/webhook
Event: orders/create
```

### Mapeamento
| Shopify Field | Orion Field |
|---------------|-------------|
| `order.total_price` | `sale.value` |
| `order.customer` | `customer.external_id` |
| `order.created_at` | `result_date` |
| `order.id` | `external_reference` |

## 8.2 WooCommerce

### Autenticação
- REST API com Consumer Key/Secret

### Mapeamento
| WooCommerce Field | Orion Field |
|-------------------|-------------|
| `total` | `sale.value` |
| `customer_id` | `customer.external_id` |
| `date_created` | `result_date` |
| `id` | `external_reference` |

## 8.3 VTEX

### Autenticação
- App Key e App Token

### Mapeamento
| VTEX Field | Orion Field |
|------------|-------------|
| `totals.value` | `sale.value` |
| `clientProfileData.email` | `customer.external_id` |
| `creationDate` | `result_date` |
| `orderId` | `external_reference` |

---

# Capítulo 9 — Integração com BI

## 9.1 Power BI

### Visão
Conector para Power BI consumir dados do Orion.

### Como Funciona
1. Orion expõe endpoint OData
2. Power BI Desktop conecta via "OData Feed"
3. Usuário seleciona tabelas para importar
4. Refresh automático configurável

### Endpoint
```
GET https://api.orion.com/v1/odata
GET https://api.orion.com/v1/odata/goals
GET https://api.orion.com/v1/odata/results
GET https://api.orion.com/v1/odata/users
```

### Autenticação
- API Key no header `Authorization: Bearer {token}`
- Token gerado pelo Admin em Integrações > API Keys

## 9.2 Tableau

### Como Funciona
- Conector PostgreSQL direto (read-only user)
- Ou via Web Data Connector (WDC)

### Read-only User
```sql
CREATE USER orion_bi WITH PASSWORD '***' CONNECTION LIMIT 5;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO orion_bi;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO orion_bi;
```

## 9.3 Metabase

### Setup
- Self-hosted Metabase conecta ao PostgreSQL do Orion
- Usuário read-only (mesmo que Tableau)
- Dashboards criados no Metabase (separados do Orion)

---

# Capítulo 10 — SSO (Single Sign-On)

## 10.1 Google Workspace

### Visão
Login com conta Google corporativa.

### Setup
1. Criar projeto no Google Cloud Console
2. Configurar OAuth consent screen
3. Criar credenciais OAuth 2.0
4. Configurar URLs de callback no Orion
5. Mapear domínios permitidos

### Fluxo
1. Usuário clica "Entrar com Google"
2. Redireciona para Google OAuth
3. Usuário autoriza
4. Google retorna code
5. Orion troca code por token
6. Orion busca e-mail do usuário
7. Se e-mail existe no Orion, cria sessão JWT

## 10.2 Microsoft (Azure AD)

### Setup
1. Registrar app no Azure Portal
2. Configurar redirect URIs
3. Gerar client secret
4. Configurar API permissions (User.Read)

### Fluxo
Similar ao Google, via Microsoft Identity Platform.

## 10.3 SAML 2.0 (v2.0)

### Visão
Para empresas que já têm Identity Provider (Okta, OneLogin, AD FS).

### Setup
1. Admin faz upload do metadata XML do IdP
2. Orion gera seu metadata
3. Admin configura no IdP
4. Usuários logam via IdP, redirecionam para Orion

### Mapeamento de Atributos
| SAML Attribute | Orion Field |
|----------------|-------------|
| `email` | `user.email` |
| `name` | `user.full_name` |
| `role` | `user.role` (se provisionamento JIT) |

---

# Capítulo 11 — Storage Externo (S3)

## 11.1 Visão
Backup e armazenamento de arquivos em S3 (ou compatível: MinIO, DigitalOcean Spaces, etc).

## 11.2 Usos

### Backup Automático
- Backup diário enviado para S3
- Retenção configurável (90 dias default)
- Criptografia AES-256 no S3

### Armazenamento de Anexos
- Fotos de comprovantes
- Documentos de campanhas
- Logos de empresas

### Export de Relatórios
- Relatórios grandes exportados para S3
- Link assinado enviado por e-mail

## 11.3 Configuração
```
Admin > Sistema > Storage
- Provider: AWS S3 (ou MinIO, DO Spaces, etc)
- Bucket: orion-backups
- Region: sa-east-1
- Access Key: ****
- Secret Key: ****
- Encryption: AES-256
- Lifecycle: 90 dias → Glacier
```

---

# Capítulo 12 — Webhooks do Orion (Outbound)

## 12.1 Eventos Disponíveis

| Evento | Quando dispara |
|--------|----------------|
| `user.created` | Novo usuário cadastrado |
| `user.updated` | Dados do usuário alterados |
| `user.deleted` | Usuário desativado |
| `goal.created` | Nova meta criada |
| `goal.updated` | Meta alterada |
| `goal.achieved` | Meta atingida ou superada |
| `result.created` | Resultado lançado |
| `result.approved` | Resultado aprovado |
| `result.rejected` | Resultado rejeitado |
| `campaign.started` | Campanha começou |
| `campaign.ended` | Campanha encerrou |
| `ranking.updated` | Ranking recalculado |
| `license.expiring` | Licença expira em 7 dias |
| `license.expired` | Licença expirou |

## 12.2 Payload Padrão

```json
{
  "event": "goal.achieved",
  "timestamp": "2025-08-15T14:30:00Z",
  "companyId": 1,
  "data": {
    "goalId": 42,
    "userId": 10,
    "userName": "João Silva",
    "indicatorId": 3,
    "indicatorName": "Faturamento",
    "achievementPercent": 110.5,
    "targetValue": 30000,
    "achievedValue": 33150
  },
  "signature": "sha256=abc123def456..."
}
```

## 12.3 Assinatura HMAC

Todo webhook é assinado. Header:
```
X-Orion-Signature: sha256=<hmac>
X-Orion-Event: goal.achieved
X-Orion-Delivery: <uuid>
```

Cliente valida:
```python
import hmac, hashlib

def verify_signature(payload, signature, secret):
    expected = 'sha256=' + hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

## 12.4 Retry Policy

- 3 tentativas com backoff exponencial: 1min, 5min, 30min
- Após 3 falhas: webhook desativado
- Cliente é notificado por e-mail
- Pode reativar manualmente

## 12.5 Configuração

```
Admin > Sistema > Integrações > Webhooks
- URL: https://sistema-cliente.com/webhook
- Eventos: [✓] goal.achieved [✓] result.created [✓] campaign.ended
- Secret: ****
- Status: Ativo
- Última entrega: 2025-08-15 14:30
- Taxa de sucesso: 99.2%
```

---

# Capítulo 13 — SDKs Oficiais

## 13.1 JavaScript/TypeScript

```bash
npm install @orion/sdk-js
```

```typescript
import { OrionClient } from '@orion/sdk-js';

const client = new OrionClient({
  apiKey: 'orion_sk_...',
  baseUrl: 'https://api.orion.com/v1'
});

// Criar meta
const goal = await client.goals.create({
  userId: 10,
  indicatorId: 3,
  goalType: 'monthly',
  targetValue: 30000,
  startDate: '2025-08-01',
  endDate: '2025-08-31'
});

// Listar resultados
const results = await client.results.list({
  userId: 10,
  dateFrom: '2025-08-01',
  dateTo: '2025-08-31'
});

// Escutar webhooks (Node.js Express)
app.post('/webhook', (req, res) => {
  const event = client.webhooks.constructEvent(req.body, req.headers);
  if (event.type === 'goal.achieved') {
    console.log('Meta atingida!', event.data);
  }
  res.json({ received: true });
});
```

## 13.2 Python

```bash
pip install orion-sdk-python
```

```python
from orion import OrionClient

client = OrionClient(
    api_key='orion_sk_...',
    base_url='https://api.orion.com/v1'
)

# Criar resultado
result = client.results.create(
    user_id=10,
    indicator_id=3,
    result_date='2025-08-15',
    value=1250.50,
    notes='Vendas da manhã'
)

# Listar metas
goals = client.goals.list(user_id=10, status='active')
```

## 13.3 PHP

```bash
composer require orion/sdk-php
```

```php
<?php
require 'vendor/autoload.php';

$client = new Orion\Client('orion_sk_...', 'https://api.orion.com/v1');

$goal = $client->goals()->create([
    'userId' => 10,
    'indicatorId' => 3,
    'goalType' => 'monthly',
    'targetValue' => 30000,
    'startDate' => '2025-08-01',
    'endDate' => '2025-08-31'
]);
```

---

# Capítulo 14 — Monitoramento de Integrações

## 14.1 Dashboard de Integrações

```
Admin > Sistema > Integrações > Status

┌──────────────────────────────────────────────────┐
│ INTEGRAÇÃO          STATUS    ÚLTIMA SYNC       │
├──────────────────────────────────────────────────┤
│ Totvs ERP           ✅ OK     15/08 14:30       │
│ WhatsApp            ✅ OK     15/08 14:32       │
│ SendGrid (Email)    ✅ OK     15/08 14:31       │
│ Google OAuth        ✅ OK     —                 │
│ S3 Backup           ✅ OK     15/08 02:00       │
│ Power BI            ✅ OK     —                 │
└──────────────────────────────────────────────────┘
```

## 14.2 Logs de Integração

Cada integração gera logs estruturados:
- Request/Response
- Latência
- Status code
- Erros (com stack trace)

Disponível em `Admin > Sistema > Logs > Integrações`

## 14.3 Alertas

| Condição | Alerta |
|----------|--------|
| Sync falha 3x consecutivas | Email ao admin |
| Latência > 30s | Warning no dashboard |
| Webhook falha | Email + dashboard |
| Token expira em 7 dias | Email preventivo |

---

# Capítulo 15 — Mapeamento Detalhado de Campos (50+ por ERP)

Mapeamento completo campo-a-campo entre os três principais ERPs nacionais (Totvs Protheus, SAP Business One, Sankhya) e o Orion. Cada ERP tem peculiaridades de nomenclatura, tipos e semântica que precisam ser tratadas na integração.

## 15.1 Totvs Protheus — Mapeamento Completo (65 campos)

### Cabeçalho da Nota Fiscal de Saída (SF2)
| Totvs Field | Orion Field | Tipo | Direção | Transformação | Notas |
|-------------|-------------|------|---------|---------------|-------|
| `F2_FILIAL` | `branch.external_code` | CHAR(2) | → | Lookup por código + tenant | Filial no Protheus |
| `F2_DOC` | `external_reference` | CHAR(9) | → | Concatenar com série | Número NF |
| `F2_SERIE` | `external_reference.serie` | CHAR(3) | → | Parte do external_reference | Série NF |
| `F2_EMISSAO` | `result_date` | DATE(8) | → | `DD/MM/YY` → ISO 8601 | Data emissão |
| `F2_CLIENTE` | `customer.external_id` | CHAR(6) | → | Lookup por código | Cliente SA1 |
| `F2_LOJA` | `customer.branch_code` | CHAR(2) | → | Concatenar com cliente | Loja do cliente |
| `F2_VEND1` | `user.external_id` | CHAR(6) | → | Lookup por código → CPF | Vendedor principal |
| `F2_VEND2` | `secondary_seller_id` | CHAR(6) | → | Opcional | Vendedor 2 (comissão) |
| `F2_VEND3` | `tertiary_seller_id` | CHAR(6) | → | Opcional | Vendedor 3 |
| `F2_VEND4` | `quaternary_seller_id` | CHAR(6) | → | Opcional | Vendedor 4 |
| `F2_VEND5` | `quinary_seller_id` | CHAR(6) | → | Opcional | Vendedor 5 |
| `F2_VALBRUT` | `value` | NUMERIC(14,2) | → | Decimal | Valor bruto |
| `F2_VALMERC` | `merchandise_value` | NUMERIC(14,2) | → | Decimal | Valor mercadorias |
| `F2_DESCONT` | `discount_value` | NUMERIC(14,2) | → | Decimal | Desconto |
| `F2_VALIPI` | `ipi_value` | NUMERIC(14,2) | → | Decimal | IPI |
| `F2_BASEICM` | `icms_base` | NUMERIC(14,2) | → | Decimal | Base ICMS |
| `F2_VALICM` | `icms_value` | NUMERIC(14,2) | → | Decimal | Valor ICMS |
| `F2_BASEICMST` | `icms_st_base` | NUMERIC(14,2) | → | Decimal | Base ICMS-ST |
| `F2_ICMSRET` | `icms_st_value` | NUMERIC(14,2) | → | Decimal | Valor ICMS-ST |
| `F2_VALPIS` | `pis_value` | NUMERIC(14,2) | → | Decimal | PIS |
| `F2_VALCOFI` | `cofins_value` | NUMERIC(14,2) | → | Decimal | COFINS |
| `F2_RECISS` | `iss_value` | NUMERIC(14,2) | → | Decimal | ISS |
| `F2_VALFET` | `freight_value` | NUMERIC(14,2) | → | Decimal | Frete |
| `F2_SEGURO` | `insurance_value` | NUMERIC(14,2) | → | Decimal | Seguro |
| `F2_DESPESA` | `expenses_value` | NUMERIC(14,2) | → | Decimal | Outras despesas |
| `F2_TIPOCLI` | `customer.type` | CHAR(1) | → | Lookup: F=Cons. Final, R=Rev., S=Solidário | Tipo cliente |
| `F2_TPFRET` | `freight_type` | CHAR(1) | → | C=CIF, F=FOB, T=Terceiros, S=Sem | Tipo frete |
| `F2_STATUS` | `nf_status` | CHAR(1) | → | Lookup | Status NF |
| `F2_HORA` | `result_time` | CHAR(6) | → | HH:MM:SS | Hora emissão |
| `F2_ESPECIE` | `document_species` | CHAR(2) | → | Lookup: NF=NF-e, CF=Cupom | Espécie documento |
| `F2_COND` | `payment_condition` | CHAR(3) | → | Lookup SE4 | Condição pagamento |
| `F2_CHVNFE` | `nf_access_key` | CHAR(44) | → |Direto | Chave NF-e |
| `F2_PROTOCL` | `nf_protocol` | CHAR(15) | → | Direto | Protocolo SEFAZ |
| `F2_DTENTR` | `delivery_date` | DATE(8) | → | `DD/MM/YY` → ISO | Data entrega |

### Itens da Nota (SD2)
| Totvs Field | Orion Field | Tipo | Notas |
|-------------|-------------|------|-------|
| `D2_FILIAL` | `branch_id` | CHAR(2) | Filial |
| `D2_DOC` | `external_reference` | CHAR(9) | Mesma da SF2 |
| `D2_SERIE` | `external_reference.serie` | CHAR(3) | Série |
| `D2_ITEM` | `item_sequence` | CHAR(2) | Seq item |
| `D2_COD` | `product.external_id` | CHAR(15) | Produto SB1 |
| `D2_UM` | `product.unit` | CHAR(2) | Unidade medida |
| `D2_QUANT` | `quantity` | NUMERIC(14,4) | Quantidade |
| `D2_PRCVEN` | `unit_price` | NUMERIC(14,4) | Preço unitário |
| `D2_TOTAL` | `total_value` | NUMERIC(14,2) | Total item |
| `D2_DESC` | `discount_value` | NUMERIC(14,2) | Desconto item |
| `D2_VALFRE` | `freight_value` | NUMERIC(14,2) | Frete rateado |
| `D2_SEGURO` | `insurance_value` | NUMERIC(14,2) | Seguro rateado |
| `D2_VALIPI` | `ipi_value` | NUMERIC(14,2) | IPI item |
| `D2_VALICM` | `icms_value` | NUMERIC(14,2) | ICMS item |
| `D2_BASEICM` | `icms_base` | NUMERIC(14,2) | Base ICMS |
| `D2_PICM` | `icms_rate` | NUMERIC(6,2) | % ICMS |
| `D2_VALIMP6` | `pis_value` | NUMERIC(14,2) | PIS item |
| `D2_VALIMP5` | `cofins_value` | NUMERIC(14,2) | COFINS item |
| `D2_CF` | `fiscal_code` | CHAR(5) | CFOP |
| `D2_TES` | `tes_code` | CHAR(3) | Tipo Entrada/Saída |
| `D2_CLASFIS` | `fiscal_classification` | CHAR(8) | NCM |
| `D2_LOTECTL` | `lot_control` | CHAR(10) | Lote |
| `D2_DTVALID` | `expiration_date` | DATE(8) | Validade |
| `D2_NUMLOTE` | `sublot` | CHAR(6) | Sublote |
| `D2_LOCALIZ` | `location_code` | CHAR(15) | Endereço estoque |
| `D2_NUMSEQ` | `stock_sequence` | CHAR(6) | Seq estoque |

### Cadastro de Vendedor (SA3)
| Totvs Field | Orion Field | Notas |
|-------------|-------------|-------|
| `A3_COD` | `user.external_id` | Código vendedor |
| `A3_NOME` | `user.full_name` | Nome |
| `A3_CGC` | `user.cpf` | CPF (lookup para match) |
| `A3_EMAIL` | `user.email` | Email |
| `A3_TEL` | `user.phone` | Telefone |
| `A3_END` | `user.address.street` | Endereço |
| `A3_MUN` | `user.address.city` | Cidade |
| `A3_EST` | `user.address.state` | UF |
| `A3_CEP` | `user.address.zip` | CEP |
| `A3_COMIS` | `commission_rate_default` | % comissão |
| `A3_TIPO` | `seller_type` | Interno/Externo |

### Cadastro de Cliente (SA1)
| Totvs Field | Orion Field | Notas |
|-------------|-------------|-------|
| `A1_COD` | `customer.external_id` | Código |
| `A1_LOJA` | `customer.branch_code` | Loja |
| `A1_NOME` | `customer.name` | Nome/Razão |
| `A1_PESSOA` | `customer.person_type` | F=Física, J=Jurídica |
| `A1_CGC` | `customer.cpf_cnpj` | CPF ou CNPJ |
| `A1_EMAIL` | `customer.email` | Email |
| `A1_TEL` | `customer.phone` | Telefone |
| `A1_END` | `customer.address.street` | Endereço |
| `A1_MUN` | `customer.address.city` | Cidade |
| `A1_EST` | `customer.address.state` | UF |
| `A1_CEP` | `customer.address.zip` | CEP |
| `A1_VEND` | `customer.primary_seller` | Vendedor principal |
| `A1_COND` | `customer.payment_condition` | Cond. pagamento |

### Cadastro de Produto (SB1)
| Totvs Field | Orion Field | Notas |
|-------------|-------------|-------|
| `B1_COD` | `product.external_id` | Código |
| `B1_DESC` | `product.name` | Descrição |
| `B1_UM` | `product.unit` | Unidade |
| `B1_TIPO` | `product.type` | Tipo (PA, MP, etc.) |
| `B1_GRUPO` | `product.category` | Grupo |
| `B1_POSIPI` | `product.ncm` | NCM |
| `B1_PRCVEN` | `product.sale_price` | Preço venda |
| `B1_CUSTD` | `product.cost` | Custo standard |
| `B1_ESTFOR` | `product.supplier` | Fornecedor |

### Regras de Transformação
1. **CPF/CNPJ:** Remove formatação (`.` e `-`), mantém apenas dígitos
2. **Datas:** `DD/MM/YY` → `YYYY-MM-DD` (ISO 8601)
3. **Decimais:** Totvs usa `,` como separador decimal, Orion usa `.`
4. **Char para Number:** Strip leading zeros (`"00042"` → `42`)
5. **Lookup de vendedor:** `F2_VEND1` (código Protheus) → buscar `users.external_id` no Orion
6. **Multi-tenant:** Sempre filtrar por `F2_FILIAL` correspondente ao tenant

## 15.2 SAP Business One — Mapeamento Completo (60 campos)

### Documento de Venda (ODLN / OINV)
| SAP B1 Field | Orion Field | Tipo | Tabela | Notas |
|-------------|-------------|------|--------|-------|
| `DocEntry` | `external_reference` | INT | OINV | ID interno SAP |
| `DocNum` | `external_doc_number` | INT | OINV | Número visível |
| `Series` | `external_reference.series` | INT | OINV | Série (NNF) |
| `DocType` | `document_type` | CHAR(1) | OINV | d=Item, s=Service |
| `DocDate` | `result_date` | DATETIME | OINV | Data documento |
| `DocDueDate` | `due_date` | DATETIME | OINV | Vencimento |
| `TaxDate` | `tax_date` | DATETIME | OINV | Data fiscal |
| `CardCode` | `customer.external_id` | NVARCHAR(15) | OINV | Código cliente OCRD |
| `CardName` | `customer.name` | NVARCHAR(100) | OINV | Nome cliente |
| `CardCode` | `customer.external_id` | NVARCHAR(15) | OINV | Código cliente |
| `SalesPersonCode` | `user.external_id` | INT | OINV | Vendedor OSLP |
| `NumAtCard` | `customer_po_number` | NVARCHAR(100) | OINV | PO do cliente |
| `ContactPersonCode` | `contact_person_id` | INT | OINV | Contato OCPR |
| `PaymentGroupCode` | `payment_condition` | INT | OINV | Octgot |
| `DocTotal` | `value` | NUMERIC(19,6) | OINV | Total documento |
| `VatSum` | `tax_total` | NUMERIC(19,6) | OINV | Total impostos |
| `DocTotalFC` | `foreign_value` | NUMERIC(19,6) | OINV | Valor moeda estrangeira |
| `DocRate` | `exchange_rate` | NUMERIC(19,6) | OINV | Taxa câmbio |
| `DocCur` | `currency` | NVARCHAR(3) | OINV | Moeda (BRL, USD) |
| `Comments` | `notes` | NVARCHAR(254) | OINV | Observações |
| `JrnlMemo` | `journal_memo` | NVARCHAR(50) | OINV | Memo contábil |
| `TransID` | `transaction_id` | INT | OINV | ID transação contábil |
| `WarehouseCode` | `warehouse_code` | NVARCHAR(8) | OINV | Filial OWHS |
| `Branch` | `branch_id` | INT | OINV | Filial */
| `BPL_ID` | `branch_id` | INT | OINV | Business Place |
| `BPLName` | `branch_name` | NVARCHAR(30) | OINV | Nome filial |
| `AtCardEntry` | `original_doc_id` | INT | OINV | Doc origem |
| `BaseAmnt` | `base_amount` | NUMERIC(19,6) | OINV | Valor base |
| `BaseType` | `base_type` | INT | OINV | Tipo doc origem |
| `CntrlAcct` | `control_account` | NVARCHAR(15) | OINV | Conta contábil |
| `Project` | `project_code` | NVARCHAR(20) | OINV | Projeto OPRJ |
| `OperatorCode` | `operator_code` | INT | OINV | Operador |
| `DocumentsOwner` | `document_owner` | INT | OINV | Dono doc OHEM |
| `SequenceCode` | `sequence_id` | INT | OINV | Seq NFSe |
| `SequenceSerial` | `sequence_serial` | INT | OINV | Serial |
| `SeriesString` | `series_string` | NVARCHAR(10) | OINV | String série |
| `SubSeriesString` | `subseries_string` | NVARCHAR(10) | OINV | Sub série |
| `Indicator` | `indicator` | NVARCHAR(1) | OINV | Indicador |
| `Exported` | `exported_flag` | CHAR(1) | OINV | Flag exportação |
| `LogInstanc` | `log_instance` | INT | OINV | Instância log |
| `ManualNumber` | `manual_number` | CHAR(1) | OINV | Numeração manual |
| `Canceled` | `canceled` | CHAR(1) | OINV | Y/N cancelado |
| `Signature` | `signature` | NVARCHAR(254) | OINV | Assinatura msg |
| `CreateTS` | `create_timestamp` | INT | OINV | HHMMSS |
| `UpdateTS` | `update_timestamp` | INT | OINV | HHMMSS |
| `UserSign` | `user_sign` | INT | OINV | Usuário criação |
| `UserSign2` | `user_sign2` | INT | OINV | Usuário update |
| `ObjType` | `object_type` | NVARCHAR(20) | OINV | 13=Invoice, 14=Credit |

### Linhas do Documento (INV1)
| SAP B1 Field | Orion Field | Notas |
|-------------|-------------|-------|
| `LineNum` | `item_sequence` | Seq item |
| `ItemCode` | `product.external_id` | Código OITM |
| `Dscription` | `product.name` | Descrição |
| `Quantity` | `quantity` | Quantidade |
| `Price` | `unit_price` | Preço unitário |
| `PriceBefDi` | `price_before_discount` | Preço antes desc |
| `DiscountPrc` | `discount_percent` | % desconto |
| `LineTotal` | `total_value` | Total linha |
| `GTotal` | `gross_total` | Total bruto |
| `VatGroup` | `tax_group` | Grupo imposto |
| `VatPrcnt` | `tax_rate` | % imposto |
| `TaxCode` | `tax_code` | Código imposto |
| `TaxTotal` | `tax_value` | Valor imposto |
| `WarehouseCode` | `warehouse_code` | Filial |
| `SalesPersonCode` | `seller_id` | Vendedor linha |
| `AccountCode` | `account_code` | Conta contábil |
| `Project` | `project_code` | Projeto |
| `OcrCode` | `dimension1` | Dimensão 1 |
| `OcrCode2` | `dimension2` | Dimensão 2 |
| `OcrCode3` | `dimension3` | Dimensão 3 |
| `OcrCode4` | `dimension4` | Dimensão 4 |
| `OcrCode5` | `dimension5` | Dimensão 5 |
| `CostingCode` | `cost_center` | Centro custo |
| `BaseType` | `base_type` | Doc origem |
| `BaseEntry` | `base_entry` | ID doc origem |
| `BaseLine` | `base_line` | Linha origem |
| `TreeType` | `tree_type` | Tipo árvore |
| `AcctCode` | `account_code` | Conta |
| `UomCode` | `uom_code` | Unidade medida |
| `UomEntry` | `uom_entry` | ID unidade |
| `UnitsMeas` | `units_meas` | Fator unidade |
| `LineVat` | `line_vat` | VAT linha |
| `TaxOnly` | `tax_only` | Apenas imposto |

### Cadastro de Cliente (OCRD)
| SAP B1 Field | Orion Field | Notas |
|-------------|-------------|-------|
| `CardCode` | `customer.external_id` | Código |
| `CardName` | `customer.name` | Nome |
| `CardType` | `customer.type` | C=Cliente, L=Fornecedor, S=Lead |
| `GroupCode` | `customer.group` | Grupo OCRG |
| `FederalTaxID` | `customer.cpf_cnpj` | CNPJ/CPF |
| `StateTaxID` | `customer.ie` | Inscrição estadual |
| `CityTaxID` | `customer.im` | Inscrição municipal |
| `Email` | `customer.email` | Email |
| `Phone1` | `customer.phone1` | Tel 1 |
| `Phone2` | `customer.phone2` | Tel 2 |
| `Cellular` | `customer.mobile` | Celular |
| `Balance` | `customer.balance` | Saldo |
| `CreditLimit` | `customer.credit_limit` | Limite crédito |
| `CurrentAccountBalance` | `customer.current_balance` | Saldo atual |
| `SalesPersonCode` | `customer.seller_id` | Vendedor |
| `SlpCode` | `customer.sales_person` | Vendedor |
| `BilltoAddr` | `customer.billing_address` | Endereço cobrança |
| `ShiptoAddr` | `customer.shipping_address` | Endereço entrega |
| `Currency` | `customer.currency` | Moeda |
| `ListNum` | `customer.price_list` | Lista preço |
| `PayBlock` | `customer.payment_block` | Bloqueio pagamento |
| `DunningLevel` | `customer.dunning_level` | Nível cobrança |
| `DunningBalance` | `customer.dunning_balance` | Saldo cobrança |
| `BackOrders` | `customer.back_orders` | Pedidos pendentes |

### Cadastro de Item (OITM)
| SAP B1 Field | Orion Field | Notas |
|-------------|-------------|-------|
| `ItemCode` | `product.external_id` | Código |
| `ItemName` | `product.name` | Nome |
| `ForeignName` | `product.foreign_name` | Nome estrangeiro |
| `ItemsGroupCode` | `product.category` | Grupo OITB |
| `CustomGroupCode` | `product.custom_group` | Grupo custom |
| `PurchaseItem` | `product.purchase` | Compra Y/N |
| `SalesItem` | `product.sale` | Venda Y/N |
| `InventoryItem` | `product.inventory` | Estoque Y/N |
| `ItemClass` | `product.class` | Classe |
| `UserText` | `product.user_text` | Texto livre |
| `UoMGroupEntry` | `product.uom_group` | Grupo unidade |
| `DefaultSalesUoM` | `product.default_sale_uom` | Unidade venda |
| `DefaultPurchUoM` | `product.default_purchase_uom` | Unidade compra |
| `AvgPrice` | `product.avg_cost` | Custo médio |
| `LastPurPrc` | `product.last_purchase_price` | Último preço compra |
| `StandardCost` | `product.standard_cost` | Custo standard |
| `MovingAveragePrice` | `product.moving_avg_price` | Preço médio móvel |
| `PriceAtWhs` | `product.price_at_whs` | Preço por filial |
| `ValuationMethod` | `product.valuation` | Método avaliação |
| `ManageBatchNumbers` | `product.batch_managed` | Lote Y/N |
| `ManageSerialNumbers` | `product.serial_managed` | Série Y/N |
| `WTLotSize` | `product.lot_size` | Tamanho lote |
| `Mainsupplier` | `product.supplier` | Fornecedor principal |
| `CountryOrg` | `product.country` | País origem |
| `SWW` | `product.custom_field` | Campo custom |
| `Quality` | `product.quality` | Qualidade |
| `Producer` | `product.producer` | Produtor |
| `Brand` | `product.brand` | Marca |
| `Model` | `product.model` | Modelo |
| `SizeInUnits` | `product.size` | Tamanho |

### Service Layer API
SAP B1 usa **Service Layer** (REST + OData):
```
GET /b1s/v1/Invoices?$filter=DocDate ge '2025-08-01' and DocDate le '2025-08-31'
&$select=DocEntry,DocNum,DocDate,CardCode,CardName,SalesPersonCode,DocTotal
&$expand=DocumentLines($select=ItemCode,Quantity,Price,LineTotal)
&$top=100&$skip=0
```

## 15.3 Sankhya — Mapeamento Completo (55 campos)

### Cabeçalho da Nota (TGFCAB)
| Sankhya Field | Orion Field | Tipo | Notas |
|---------------|-------------|------|-------|
| `NUNOTA` | `external_reference` | INT | ID único |
| `CODPARC` | `customer.external_id` | INT | Parceiro TGFPAR |
| `CODVEND` | `user.external_id` | INT | Vendedor TGFVEN |
| `DTNEG` | `result_date` | DATE | Data negociação |
| `DTENTSAI` | `entry_exit_date` | DATE | Entrada/saída |
| `DTFATURA` | `invoice_date` | DATE | Data faturamento |
| `DTMOV` | `movement_date` | DATE | Data movimento |
| `CODEMP` | `company_id` | INT | Empresa TG EMP |
| `CODTIPVENDA` | `sale_type` | INT | Tipo venda |
| `CODTIPNEG` | `negotiation_type` | INT | Tipo negociação |
| `CODNAT` | `nature_code` | INT | Natureza operação |
| `CODCENCUS` | `cost_center` | INT | Centro custo |
| `CODPROJ` | `project_code` | INT | Projeto |
| `NUMNOTA` | `invoice_number` | INT | Número NF |
| `SERIENOTA` | `series` | VARCHAR(3) | Série |
| `TIPMOVE` | `movement_type` | CHAR(1) | E=Entrada, S=Saída |
| `STATUSNOTA` | `nf_status` | CHAR(1) | A=Aberta, F=Faturada, C=Cancelada |
| `VLRNOTA` | `value` | NUMERIC(15,2) | Valor total nota |
| `VLRDESC` | `discount_value` | NUMERIC(15,2) | Desconto |
| `VLRTOTALITEMS` | `items_total` | NUMERIC(15,2) | Total itens |
| `VLRFRETE` | `freight_value` | NUMERIC(15,2) | Frete |
| `VLROUTRASDESP` | `other_expenses` | NUMERIC(15,2) | Outras despesas |
| `VLRSEGURO` | `insurance_value` | NUMERIC(15,2) | Seguro |
| `VLRIPI` | `ipi_value` | NUMERIC(15,2) | IPI |
| `VLRICMS` | `icms_value` | NUMERIC(15,2) | ICMS |
| `VLRICMSST` | `icms_st_value` | NUMERIC(15,2) | ICMS-ST |
| `VLRPIS` | `pis_value` | NUMERIC(15,2) | PIS |
| `VLRCOFINS` | `cofins_value` | NUMERIC(15,2) | COFINS |
| `VLRBASEICMS` | `icms_base` | NUMERIC(15,2) | Base ICMS |
| `VLRBASEICMSST` | `icms_st_base` | NUMERIC(15,2) | Base ICMS-ST |
| `VLRBASEIPI` | `ipi_base` | NUMERIC(15,2) | Base IPI |
| `VLRBASEPIS` | `pis_base` | NUMERIC(15,2) | Base PIS |
| `VLRBASECOFINS` | `cofins_base` | NUMERIC(15,2) | Base COFINS |
| `PERCENTUALDESC` | `discount_percent` | NUMERIC(6,2) | % desconto |
| `CODCPG` | `payment_condition` | VARCHAR(5) | Cond pagamento |
| `CODTIPOPER` | `operation_type` | INT | Tipo operação |
| `OBSERVACAO` | `notes` | VARCHAR(4000) | Observação |
| `CHAVENFE` | `nf_access_key` | VARCHAR(44) | Chave NF-e |
| `PROTOCOLO` | `nf_protocol` | VARCHAR(15) | Protocolo SEFAZ |
| `XMLNFE` | `xml_nf` | TEXT | XML NF-e |
| `CODOCORRENCIA` | `occurrence_code` | INT | Ocorrência |
| `CODUSU` | `user_id` | INT | Usuário Sankhya |
| `CODVEN` | `salesperson_id` | INT | Vendedor |
| `CODPARCTRANS` | `transporter_id` | INT | Transportadora |
| `CODPARCRED` | `recipient_id` | INT | Destinatário |
| `CIF_FOB` | `freight_type` | CHAR(1) | C=CIF, F=FOB |
| `TIPOFRETE` | `freight_paid_by` | CHAR(1) | 0=Emitente, 1=Destinatário |
| `PESOBRUTO` | `gross_weight` | NUMERIC(15,3) | Peso bruto |
| `PESOLIQUIDO` | `net_weight` | NUMERIC(15,3) | Peso líquido |
| `QTDCXS` | `boxes_quantity` | INT | Qtd caixas |
| `QTDEVOL` | `volumes_quantity` | INT | Qtd volumes |
| `PRAZOENTREGA` | `delivery_deadline` | INT | Prazo entrega (dias) |
| `CODMOTIVO` | `reason_code` | INT | Motivo |
| `APROVADO` | `approved` | CHAR(1) | S/N aprovado |
| `CODAPROVADOR` | `approver_id` | INT | Aprovador |
| `DATAAPROVACAO` | `approval_date` | DATETIME | Data aprovação |

### Itens da Nota (TGFITE)
| Sankhya Field | Orion Field | Notas |
|---------------|-------------|-------|
| `NUNOTA` | `external_reference` | FK TGFCAB |
| `SEQITE` | `item_sequence` | Seq item |
| `CODPROD` | `product.external_id` | Produto TGFPRO |
| `CODVOL` | `volume_unit` | Unidade |
| `QTDNEG` | `quantity` | Quantidade |
| `VLRUNIT` | `unit_price` | Preço unitário |
| `VLRTOT` | `total_value` | Total item |
| `VLRDESC` | `discount_value` | Desconto |
| `PERDESC` | `discount_percent` | % desconto |
| `CODLOC` | `location_code` | Local estoque |
| `CODDER` | `derivation_code` | Derivação |
| `CODLOTE` | `lot_code` | Lote |
| `DTVAL` | `expiration_date` | Validade |
| `CODTIPIPI` | `ipi_type` | Tipo IPI |
| `ALIQIPI` | `ipi_rate` | % IPI |
| `VLRIPI` | `ipi_value` | Valor IPI |
| `VLRBASEIPI` | `ipi_base` | Base IPI |
| `CODTIPICMS` | `icms_type` | Tipo ICMS |
| `ALIQICMS` | `icms_rate` | % ICMS |
| `VLRICMS` | `icms_value` | Valor ICMS |
| `VLRBASEICMS` | `icms_base` | Base ICMS |
| `ALIQICMSST` | `icms_st_rate` | % ICMS-ST |
| `VLRICMSST` | `icms_st_value` | Valor ICMS-ST |
| `VLRBASEICMSST` | `icms_st_base` | Base ICMS-ST |
| `CODTIPPIS` | `pis_type` | Tipo PIS |
| `ALIQPIS` | `pis_rate` | % PIS |
| `VLRPIS` | `pis_value` | Valor PIS |
| `VLRBASEPIS` | `pis_base` | Base PIS |
| `CODTIPCOFINS` | `cofins_type` | Tipo COFINS |
| `ALIQCOFINS` | `cofins_rate` | % COFINS |
| `VLRCOFINS` | `cofins_value` | Valor COFINS |
| `VLRBASECOFINS` | `cofins_base` | Base COFINS |

### Cadastro de Parceiro (TGFPAR)
| Sankhya Field | Orion Field | Notas |
|---------------|-------------|-------|
| `CODPARC` | `customer.external_id` | Código |
| `NOMEPARC` | `customer.name` | Nome |
| `RAZAOSOCIAL` | `customer.legal_name` | Razão social |
| `TIPPESSOA` | `customer.person_type` | F/J |
| `CGC_CPF` | `customer.cpf_cnpj` | CPF/CNPJ |
| `IE` | `customer.ie` | Insc estadual |
| `IM` | `customer.im` | Insc municipal |
| `EMAIL` | `customer.email` | Email |
| `TELEFONE` | `customer.phone` | Telefone |
| `CELULAR` | `customer.mobile` | Celular |
| `CODVEND` | `customer.seller_id` | Vendedor |
| `CODROC` | `customer.route` | Rota |
| `CODATV` | `customer.activity` | Atividade |
| `CODTIP` | `customer.type` | Tipo |
| `CODRAMO` | `customer.segment` | Ramo |
| `CLIENTE` | `customer.is_client` | S/N |
| `FORNECEDOR` | `customer.is_supplier` | S/N |
| `TRANSPORTADORA` | `customer.is_transporter` | S/N |
| `LIMITECRED` | `customer.credit_limit` | Limite |
| `SALDOLIMITE` | `customer.balance_limit` | Saldo limite |

### Cadastro de Vendedor (TGFVEN)
| Sankhya Field | Orion Field | Notas |
|---------------|-------------|-------|
| `CODVEND` | `user.external_id` | Código |
| `NOMEVEND` | `user.full_name` | Nome |
| `CGC_CPF` | `user.cpf` | CPF |
| `EMAIL` | `user.email` | Email |
| `TELEFONE` | `user.phone` | Tel |
| `COMISSAOPERC` | `commission_rate` | % comissão |
| `CODSUPERVISOR` | `supervisor_id` | Supervisor |
| `CODREGIAO` | `region_id` | Região |

### Cadastro de Produto (TGFPRO)
| Sankhya Field | Orion Field | Notas |
|---------------|-------------|-------|
| `CODPROD` | `product.external_id` | Código |
| `DESCRPROD` | `product.name` | Descrição |
| `DESCRCOMPLETA` | `product.full_description` | Desc completa |
| `CODVOL` | `product.unit` | Unidade |
| `CODGRUPOPROD` | `product.category` | Grupo |
| `CODTIPOPROD` | `product.type` | Tipo |
| `CODNCM` | `product.ncm` | NCM |
| `PRECO` | `product.sale_price` | Preço |
| `CUSTO` | `product.cost` | Custo |
| `MARCA` | `product.brand` | Marca |
| `ATIVO` | `product.active` | S/N |

### API Sankhya (Swagger)
```
POST /mge/service.sbr?serviceName=CRUDServiceProvider.loadRecords
{
  "serviceName": "CRUDServiceProvider.loadRecords",
  "requestBody": {
    "dataSet": {
      "rootEntity": "CabecalhoNota",
      "includePresentationFields": "false",
      "offsetPage": "0",
      "criteria": {
        "expression": "DTNEG >= '2025-08-01' AND DTNEG <= '2025-08-31' AND STATUSNOTA = 'F'"
      },
      "entity": {
        "field": ["NUNOTA", "CODPARC", "CODVEND", "DTNEG", "VLRNOTA"]
      }
    }
  }
}
```

---

# Capítulo 16 — Exemplos de Payload para Webhooks

Para cada webhook do Orion (Capítulo 12), especificação completa do payload com exemplos reais.

## 16.1 user.created
```json
{
  "event": "user.created",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345678",
  "timestamp": "2025-08-15T14:30:00.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "userId": 10,
    "externalId": "VEND001",
    "email": "joao.silva@empresa.com",
    "fullName": "João Silva Santos",
    "cpf": "12345678901",
    "phone": "+5511987654321",
    "role": "seller",
    "branchId": 5,
    "branchName": "Loja SP - Centro",
    "active": true,
    "createdAt": "2025-08-15T14:30:00.000Z",
    "createdBy": 1
  },
  "signature": "sha256=4a8e2c1b9f5d3e7a6c2b1d8e9f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a"
}
```

## 16.2 user.updated
```json
{
  "event": "user.updated",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345679",
  "timestamp": "2025-08-15T15:45:22.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "userId": 10,
    "changes": {
      "phone": {
        "old": "+551187654321",
        "new": "+5511987654321"
      },
      "role": {
        "old": "seller",
        "new": "manager"
      }
    },
    "updatedBy": 1,
    "updatedAt": "2025-08-15T15:45:22.000Z"
  },
  "signature": "sha256=..."
}
```

## 16.3 goal.created
```json
{
  "event": "goal.created",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345680",
  "timestamp": "2025-08-15T09:15:00.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "goalId": 1024,
    "userId": 10,
    "userName": "João Silva Santos",
    "branchId": 5,
    "indicatorId": 3,
    "indicatorName": "Faturamento",
    "indicatorType": "monetary",
    "goalType": "monthly",
    "targetValue": 30000.00,
    "achievedValue": 0,
    "achievementPercent": 0,
    "startDate": "2025-08-01",
    "endDate": "2025-08-31",
    "status": "active",
    "notes": "Meta de faturamento mensal",
    "createdAt": "2025-08-15T09:15:00.000Z",
    "createdBy": 1
  },
  "signature": "sha256=..."
}
```

## 16.4 goal.achieved
```json
{
  "event": "goal.achieved",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345681",
  "timestamp": "2025-08-15T16:23:45.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "goalId": 1024,
    "userId": 10,
    "userName": "João Silva Santos",
    "branchId": 5,
    "branchName": "Loja SP - Centro",
    "indicatorId": 3,
    "indicatorName": "Faturamento",
    "achievementPercent": 110.5,
    "targetValue": 30000.00,
    "achievedValue": 33150.00,
    "achievedAt": "2025-08-15T16:23:45.000Z",
    "daysToAchieve": 14,
    "overachieved": true,
    "previousRanking": 3,
    "newRanking": 1
  },
  "signature": "sha256=..."
}
```

## 16.5 result.created
```json
{
  "event": "result.created",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345682",
  "timestamp": "2025-08-15T14:30:00.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "resultId": 99812,
    "userId": 10,
    "userName": "João Silva Santos",
    "branchId": 5,
    "branchName": "Loja SP - Centro",
    "indicatorId": 3,
    "indicatorName": "Faturamento",
    "resultDate": "2025-08-15",
    "value": 1250.50,
    "quantity": 1,
    "externalReference": "NF-000123456-1",
    "externalSource": "totvs",
    "notes": "Venda de cosméticos manhã",
    "status": "pending_approval",
    "createdAt": "2025-08-15T14:30:00.000Z",
    "createdBy": 10,
    "attachments": [
      {
        "id": "att_abc123",
        "filename": "comprovante.jpg",
        "url": "https://storage.orion.com/tenants/t42/receipts/2025/08/15/result-99812.jpg?sig=...",
        "expiresAt": "2025-08-15T15:30:00.000Z"
      }
    ]
  },
  "signature": "sha256=..."
}
```

## 16.6 result.approved
```json
{
  "event": "result.approved",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345683",
  "timestamp": "2025-08-15T15:00:00.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "resultId": 99812,
    "userId": 10,
    "userName": "João Silva Santos",
    "branchId": 5,
    "indicatorId": 3,
    "indicatorName": "Faturamento",
    "value": 1250.50,
    "resultDate": "2025-08-15",
    "approvedAt": "2025-08-15T15:00:00.000Z",
    "approvedBy": 5,
    "approvedByName": "Maria Souza (Gerente)",
    "approvalNotes": "Confere com NF-e",
    "goalImpact": {
      "goalId": 1024,
      "previousAchievement": 31900.00,
      "newAchievement": 33150.50,
      "achievementPercentChange": 4.17
    },
    "rankingImpact": {
      "previousRank": 3,
      "newRank": 2
    }
  },
  "signature": "sha256=..."
}
```

## 16.7 result.rejected
```json
{
  "event": "result.rejected",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345684",
  "timestamp": "2025-08-15T15:05:00.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "resultId": 99812,
    "userId": 10,
    "userName": "João Silva Santos",
    "value": 1250.50,
    "resultDate": "2025-08-15",
    "rejectedAt": "2025-08-15T15:05:00.000Z",
    "rejectedBy": 5,
    "rejectedByName": "Maria Souza (Gerente)",
    "reason": "Divergência entre valor da NF-e e valor lançado",
    "reasonCode": "value_mismatch",
    "nextSteps": "Revisar valor e reabrir resultado"
  },
  "signature": "sha256=..."
}
```

## 16.8 campaign.started
```json
{
  "event": "campaign.started",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345685",
  "timestamp": "2025-08-01T00:00:00.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "campaignId": 15,
    "name": "Campanha de Inverno 2025",
    "description": "Venda mais itens de inverno e ganhe prêmios!",
    "startDate": "2025-08-01",
    "endDate": "2025-08-31",
    "indicators": [
      {
        "indicatorId": 3,
        "indicatorName": "Faturamento",
        "weight": 60,
        "targetValue": 50000
      },
      {
        "indicatorId": 7,
        "indicatorName": "Itens vendidos",
        "weight": 40,
        "targetValue": 500
      }
    ],
    "participantsCount": 25,
    "branches": [5, 6, 7],
    "awards": [
      {
        "position": 1,
        "description": "iPhone 15 Pro",
        "estimatedValue": 9000
      },
      {
        "position": 2,
        "description": "Apple Watch Series 9",
        "estimatedValue": 4500
      },
      {
        "position": 3,
        "description": "AirPods Pro",
        "estimatedValue": 2200
      }
    ],
    "type": "individual",
    "rules": "Válido para vendedores ativos. Não cumulativo com outras campanhas."
  },
  "signature": "sha256=..."
}
```

## 16.9 campaign.ended
```json
{
  "event": "campaign.ended",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345686",
  "timestamp": "2025-08-31T23:59:59.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "campaignId": 15,
    "name": "Campanha de Inverno 2025",
    "endDate": "2025-08-31",
    "winners": [
      {
        "position": 1,
        "userId": 10,
        "userName": "João Silva Santos",
        "branchId": 5,
        "score": 95.5,
        "award": "iPhone 15 Pro",
        "awardValue": 9000
      },
      {
        "position": 2,
        "userId": 12,
        "userName": "Maria Oliveira",
        "branchId": 5,
        "score": 87.2,
        "award": "Apple Watch Series 9",
        "awardValue": 4500
      },
      {
        "position": 3,
        "userId": 8,
        "userName": "Pedro Santos",
        "branchId": 6,
        "score": 82.1,
        "award": "AirPods Pro",
        "awardValue": 2200
      }
    ],
    "totalParticipants": 25,
    "completedParticipants": 22,
    "campaignSummary": {
      "totalSales": 1250000,
      "totalItems": 12500,
      "averageScore": 65.3
    }
  },
  "signature": "sha256=..."
}
```

## 16.10 ranking.updated
```json
{
  "event": "ranking.updated",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345687",
  "timestamp": "2025-08-15T15:00:05.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "scope": "monthly",
    "period": "2025-08",
    "branchId": 5,
    "indicatorId": 3,
    "generatedAt": "2025-08-15T15:00:00.000Z",
    "version": 142,
    "topUsers": [
      {"rank": 1, "userId": 10, "userName": "João Silva", "achievementPercent": 110.5, "value": 33150.50},
      {"rank": 2, "userId": 12, "userName": "Maria Oliveira", "achievementPercent": 95.2, "value": 28560.00},
      {"rank": 3, "userId": 8, "userName": "Pedro Santos", "achievementPercent": 87.1, "value": 26130.00},
      {"rank": 4, "userId": 15, "userName": "Ana Costa", "achievementPercent": 75.5, "value": 22650.00},
      {"rank": 5, "userId": 7, "userName": "Bruno Lima", "achievementPercent": 68.3, "value": 20490.00}
    ],
    "totalUsersRanked": 25,
    "averageAchievement": 62.4,
    "changesFromPrevious": [
      {"userId": 10, "previousRank": 2, "newRank": 1, "direction": "up"},
      {"userId": 12, "previousRank": 1, "newRank": 2, "direction": "down"}
    ]
  },
  "signature": "sha256=..."
}
```

## 16.11 license.expiring
```json
{
  "event": "license.expiring",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345688",
  "timestamp": "2025-08-25T09:00:00.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "licenseId": "LIC-2025-ORION-PRO-42",
    "plan": "professional",
    "expiresAt": "2025-09-01T00:00:00.000Z",
    "daysUntilExpiry": 7,
    "currentUsers": 35,
    "maxUsers": 50,
    "currentBranches": 4,
    "maxBranches": 5,
    "renewalUrl": "https://orion.com/renew/LIC-2025-ORION-PRO-42",
    "renewalPrice": 18000.00,
    "currency": "BRL",
    "contactEmail": "sales@orion.com"
  },
  "signature": "sha256=..."
}
```

## 16.12 license.expired
```json
{
  "event": "license.expired",
  "eventId": "evt_5f8a3b2c-1234-5678-9abc-def012345689",
  "timestamp": "2025-09-01T00:00:00.000Z",
  "version": "1.0",
  "companyId": 42,
  "data": {
    "licenseId": "LIC-2025-ORION-PRO-42",
    "plan": "professional",
    "expiredAt": "2025-09-01T00:00:00.000Z",
    "gracePeriodDays": 7,
    "gracePeriodEndsAt": "2025-09-08T00:00:00.000Z",
    "systemStatus": "read_only",
    "renewalUrl": "https://orion.com/renew/LIC-2025-ORION-PRO-42",
    "contactEmail": "sales@orion.com"
  },
  "signature": "sha256=..."
}
```

---

# Capítulo 17 — Rate Limiting por Integração

Cada integração tem limites próprios (do provedor externo ou auto-impostos) que precisam ser respeitados.

## 17.1 Rate Limits por Provedor Externo

| Provedor | Limite | Janela | Tipo | Fonte |
|----------|--------|--------|------|-------|
| Totvs Protheus (REST) | 100 req/min | Por IP/token | API | Documentação TOTVS |
| SAP B1 Service Layer | 60 req/min | Por usuário | API | Documentação SAP |
| Sankhya | 30 req/min | Por usuário | API | Documentação Sankhya |
| Salesforce REST | 100 req/min (concurrent) | Por usuário | API | Salesforce limits |
| HubSpot | 100 req/10s (private app) | Por token | API | HubSpot docs |
| Pipedrive | 40 req/min | Por token | API | Pipedrive docs |
| Shopify | 2 req/sec (basic) | Por app | Leaky bucket | Shopify docs |
| WooCommerce | Variável (server) | Por IP | Server | Cliente configura |
| VTEX | 4 req/sec | Por app | API | VTEX docs |
| WhatsApp Business | 80 req/hora (templates) | Por número | Tier-based | Meta docs |
| Twilio SMS | 10 req/sec | Por conta | API | Twilio docs |
| SendGrid | 600 req/min (mail send) | Por chave | API | SendGrid docs |
| AWS SES | 14 req/sec | Por conta | API | SES limits |
| OpenAI | 60 req/min (GPT-4o) | Por chave | Tier-based | OpenAI docs |
| Anthropic | 50 req/min | Por chave | Tier-based | Anthropic docs |
| Google OAuth | 100M req/day | Por client | Daily | Google docs |
| Microsoft Graph | 10k req/10min | Por app | API | MS docs |

## 17.2 Implementação no Orion

### Token Bucket Algorithm
```typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,
    private refillRate: number,  // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  async consume(count: number = 1): Promise<boolean> {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
    
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }
  
  async waitForToken(): Promise<void> {
    while (!(await this.consume(1))) {
      await sleep(100);
    }
  }
}

// Por provedor
const rateLimiters = {
  totvs: new TokenBucket(100, 100/60),  // 100/min
  sap: new TokenBucket(60, 1),          // 60/min
  sankhya: new TokenBucket(30, 0.5),    // 30/min
  whatsapp: new TokenBucket(80, 80/3600),// 80/hora
  // ...
};
```

### Rate Limit por Integração (Tabela Resumo)
| Integração | Limite Praticado | Backoff se exceder | Notificação Admin |
|-----------|------------------|---------------------|-------------------|
| Totvs ERP | 80 req/min | Exponential 5s | Após 3 falhas |
| SAP B1 | 50 req/min | Exponential 5s | Após 3 falhas |
| Sankhya | 25 req/min | Exponential 5s | Após 3 falhas |
| Salesforce | 80 req/min | Exponential 10s | Após 3 falhas |
| HubSpot | 90 req/10s | Exponential 5s | Após 5 falhas |
| Pipedrive | 35 req/min | Exponential 5s | Após 5 falhas |
| Shopify | 1.5 req/sec | Exponential 2s | Após 5 falhas |
| WhatsApp | 50 req/hora | Linear 60s | Após 2 falhas |
| Twilio SMS | 8 req/sec | Linear 1s | Após 5 falhas |
| SendGrid | 500 req/min | Linear 60s | Após 3 falhas |

### Circuit Breaker
Após N falhas consecutivas, circuito abre e paramos de tentar:
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private resetTimeout: number = 60_000,
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker open');
      }
    }
    
    try {
      const result = await fn();
      this.failures = 0;
      this.state = 'closed';
      return result;
    } catch (e) {
      this.failures++;
      this.lastFailure = Date.now();
      if (this.failures >= this.threshold) {
        this.state = 'open';
      }
      throw e;
    }
  }
}
```

## 17.3 Rate Limit por Cliente Orion
Além do limite do provedor externo, Orion impõe limites por cliente (para evitar abuso):
- 1000 API calls/hora por cliente (plano Starter)
- 5000 API calls/hora (Professional)
- 50000 API calls/hora (Enterprise)

Implementado via Redis com sliding window:
```typescript
async function checkRateLimit(tenantId: number, plan: string): Promise<boolean> {
  const limits = { starter: 1000, professional: 5000, enterprise: 50000 };
  const limit = limits[plan] || 1000;
  const key = `ratelimit:${tenantId}:${Math.floor(Date.now() / 3600000)}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 3600);
  return count <= limit;
}
```

---

# Capítulo 18 — Error Handling por Integração

## 18.1 Categorias de Erro

### Erros de Conexão (Network)
- DNS falhou
- TCP timeout
- TLS handshake falhou
- Connection refused

### Erros de Autenticação (Auth)
- 401 Unauthorized (token expirado ou inválido)
- 403 Forbidden (sem permissão)
- Token malformado

### Erros de Cliente (4xx)
- 400 Bad Request (payload inválido)
- 404 Not Found (recurso não existe)
- 409 Conflict (já existe)
- 422 Unprocessable Entity (validação semântica)
- 429 Too Many Requests (rate limit excedido)

### Erros de Servidor (5xx)
- 500 Internal Server Error (erro genérico)
- 502 Bad Gateway
- 503 Service Unavailable
- 504 Gateway Timeout

### Erros de Aplicação (Negócio)
- Vendedor não encontrado no Orion
- Valor inválido (negativo, não-numérico)
- Data fora de período permitido
- Empresa não autorizada para integração

## 18.2 Estratégia por Tipo de Erro

| Tipo | Ação | Retry? | Notifica? |
|------|------|--------|-----------|
| Connection (timeout) | Log + retry | Sim (3x backoff exp) | Após 3 falhas |
| Auth (401) | Não tentar de novo | Não | Sim, imediato (token pode ter expirado) |
| Auth (403) | Não tentar de novo | Não | Sim, imediato |
| 400 | Log detalhado | Não | Não |
| 404 | Log | Não | Não |
| 409 | Log (já processado) | Não | Não |
| 422 | Log | Não | Sim (erro de dado) |
| 429 | Backoff + retry | Sim (até 5x) | Após 5 retries |
| 5xx | Retry | Sim (3x backoff exp) | Após 3 falhas |
| Negócio (vendedor não encontrado) | Log + pular | Não | Sim (resumo no fim) |

## 18.3 Estrutura de Log de Erro
```typescript
{
  "timestamp": "2025-08-15T14:30:00.000Z",
  "level": "error",
  "integration": "totvs",
  "tenantId": 42,
  "operation": "sync_sales",
  "externalReference": "F2_DOC=000123456",
  "error": {
    "type": "validation_error",
    "code": "TOTVS_422",
    "message": "Vendedor F2_VEND1=VEND999 não encontrado no Orion",
    "details": {
      "externalField": "F2_VEND1",
      "externalValue": "VEND999",
      "lookupKey": "external_id",
      "tenantId": 42
    }
  },
  "retry": {
    "attempt": 1,
    "maxAttempts": 3,
    "willRetry": false
  },
  "context": {
    "requestId": "req_abc123",
    "userId": 1,
    "batchId": "batch_xyz789"
  }
}
```

## 18.4 Dead Letter Queue (DLQ)
Mensagens que falham após todos os retries vão para DLQ:
- Stored no PostgreSQL em `integration_failures` table
- Disponível para reprocessamento manual
- Limpeza após 30 dias

```sql
CREATE TABLE integration_failures (
  id BIGSERIAL PRIMARY KEY,
  tenant_id INT NOT NULL,
  integration VARCHAR(50) NOT NULL,
  operation VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  error JSONB NOT NULL,
  attempts INT NOT NULL,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by INT
);

CREATE INDEX idx_failures_unresolved ON integration_failures(tenant_id, integration)
  WHERE resolved_at IS NULL;
```

## 18.5 Tratamento Específico por Integração

### Totvs Protheus
- Token expira em 1 hora → refresh automático
- Schema XML varia por versão → versionar parser
- Campos customizados (X2_CAMPO) → ignora se não mapeado

### SAP B1 Service Layer
- Session timeout 30 min → re-login automático
- CSRF token em POST → captura e reutiliza
- $expand com limite 100 → pagina manualmente

### Sankhya
- XML SOAP body → parser específico
- XML response aninhado → extract correto
- Timeouts frequentes em queries grandes → batch menor

### Salesforce
- OAuth refresh token → automático
- Bulk API para volumes > 10k registros
- SOQL injection escape

### WhatsApp Business
- Template não aprovado → log + notifica admin
- 24h window (após reply do cliente) → não manda template, manda session message
- Opt-out → marca usuário como opted_out

---

# Capítulo 19 — Retry Policies Específicas

## 19.1 Política Padrão
- **Max attempts:** 5
- **Backoff:** Exponential: 1s, 5s, 25s, 125s, 625s
- **Jitter:** Random entre 0 e 50% do backoff (evita thundering herd)
- **Timeout por tentativa:** 30s
- **Total timeout:** 24h (depois vai para DLQ)

## 19.2 Políticas por Integração

| Integração | Max Attempts | Backoff Type | Base Delay | Max Delay | Jitter |
|-----------|--------------|--------------|-----------|-----------|--------|
| Totvs ERP | 5 | Exponential | 5s | 5min | 50% |
| SAP B1 | 5 | Exponential | 5s | 5min | 50% |
| Sankhya | 5 | Exponential | 5s | 5min | 50% |
| Salesforce | 5 | Exponential | 10s | 10min | 30% |
| HubSpot | 5 | Exponential | 5s | 5min | 30% |
| Pipedrive | 5 | Exponential | 5s | 5min | 30% |
| Shopify | 7 | Exponential | 2s | 2min | 50% |
| WooCommerce | 5 | Exponential | 10s | 10min | 50% |
| VTEX | 5 | Exponential | 5s | 5min | 30% |
| WhatsApp | 10 | Linear (60s) | 60s | 60s | 10s |
| Twilio SMS | 5 | Exponential | 30s | 5min | 20% |
| SendGrid | 5 | Linear (60s) | 60s | 60s | 10s |
| AWS SES | 5 | Exponential | 30s | 5min | 20% |
| OpenAI | 3 | Exponential | 5s | 60s | 50% |
| Anthropic | 3 | Exponential | 5s | 60s | 50% |
| Webhook outbound | 3 | Exponential | 60s | 30min | 30% |

## 19.3 Implementação
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts: number;
    backoff: 'exponential' | 'linear';
    baseDelay: number;
    maxDelay: number;
    jitter: number;  // 0 to 1
    retryOn: (error: Error) => boolean;
  }
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (!options.retryOn(error as Error)) {
        throw error;
      }
      
      if (attempt === options.maxAttempts) {
        logger.error({
          err: error,
          attempt,
          maxAttempts: options.maxAttempts
        }, 'All retry attempts exhausted');
        throw error;
      }
      
      // Calculate delay
      let delay: number;
      if (options.backoff === 'exponential') {
        delay = Math.min(
          options.baseDelay * Math.pow(2, attempt - 1),
          options.maxDelay
        );
      } else {
        delay = options.baseDelay;
      }
      
      // Apply jitter
      const jitterAmount = delay * options.jitter * Math.random();
      delay = delay + jitterAmount - (delay * options.jitter / 2);
      
      logger.warn({
        err: error,
        attempt,
        nextAttemptIn: delay
      }, 'Retrying after error');
      
      await sleep(delay);
    }
  }
  
  throw lastError;
}

// Uso
await withRetry(() => totvsApi.getSales(date), {
  maxAttempts: 5,
  backoff: 'exponential',
  baseDelay: 5000,
  maxDelay: 300000,  // 5 min
  jitter: 0.5,
  retryOn: (err) => isNetworkError(err) || isServerError(err) || isRateLimited(err)
});
```

## 19.4 Retry Conditions
```typescript
function shouldRetry(error: Error): boolean {
  // Network errors
  if (error instanceof NetworkError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof ConnectionError) return true;
  
  // HTTP errors
  if (error instanceof HttpError) {
    if (error.status === 429) return true;  // Rate limited
    if (error.status >= 500) return true;   // Server error
    if (error.status === 408) return true;  // Request timeout
    if (error.status === 425) return true;  // Too early
  }
  
  // Don't retry on:
  // 400, 401, 403, 404, 409, 422 (client errors)
  return false;
}
```

---

# Capítulo 20 — Sandbox vs Production

## 20.1 Ambientes Disponíveis

| Ambiente | URL | Propósito | Dados |
|----------|-----|-----------|-------|
| Sandbox | `sandbox.orion.com` | Testes de integração | Sintéticos + isolados |
| Staging | `staging.orion.com` | QA interno | Cópia prod anonimizada |
| Production | `api.orion.com` | Real | Reais |

## 20.2 Isolamento de Sandbox
- Database separado
- Redis separado
- Storage S3 separado (bucket `orion-sandbox`)
- Sem emails reais (interceptados por Mailtrap)
- Sem WhatsApp real (apenas log)
- Sem SMS real (apenas log)
- API keys com prefixo `test_`

## 20.3 Credenciais de Sandbox por Integração

### Totvs
- Sandbox: `https://sandbox.totvs.com.br` (instância compartilhada)
- Production: `https://api.totvs.com.br` (URL específica do cliente)

### SAP B1
- Sandbox: Service Layer com company DB `SBO_TEST`
- Production: Service Layer com company DB real do cliente

### Sankhya
- Sandbox: Instância Sankhya de testes (compartilhada por parceiros)
- Production: URL específica do cliente

### Salesforce
- Sandbox: Sandbox do Salesforce (Partial, Full, ou Developer)
- Production: Production org do cliente

### HubSpot
- Sandbox: Developer test account
- Production: Account real

### WhatsApp Business
- Sandbox: WhatsApp Sandbox do Twilio (números join com código)
- Production: Número verificado pela Meta

## 20.4 Dados de Teste (Sandbox)
Sandbox vem pré-populado com:
- 1 empresa de teste
- 3 filiais (SP, RJ, BH)
- 50 usuários (5 gerentes, 45 vendedores)
- 100 produtos
- 1000 clientes
- 10000 resultados (12 meses)
- 50 campanhas (ativas e encerradas)
- 10 metas ativas por usuário

## 20.5 Fluxo de Promoção para Produção
1. **Dev:** Testa localmente com Docker Compose + sandbox externo
2. **Staging:** Deploy automático em merge para `main`
3. **Sandbox:** Cliente testa integração com suas credenciais sandbox
4. **Production:** Após validação em sandbox, swap para credenciais produção

## 20.6 Mecanismo de Swap
```typescript
// Configuração varia por ambiente
const config = {
  sandbox: {
    apiBaseUrl: 'https://sandbox.orion.com/v1',
    externalApis: {
      totvs: { url: 'https://sandbox.totvs.com.br' },
      whatsapp: { sandboxMode: true }
    }
  },
  production: {
    apiBaseUrl: 'https://api.orion.com/v1',
    externalApis: {
      totvs: { url: process.env.TOTVS_URL },
      whatsapp: { sandboxMode: false }
    }
  }
};

const activeConfig = process.env.NODE_ENV === 'production'
  ? config.production
  : config.sandbox;
```

## 20.7 Promotion Checklist
Antes de promover uma integração para produção:
- [ ] Credenciais de produção testadas em sandbox
- [ ] Mapeamento de campos validado com dados reais
- [ ] Performance aceitável (< 5min para sync completo)
- [ ] Error handling cobre edge cases (token expira, rede cai, etc.)
- [ ] Logs estruturados e auditáveis
- [ ] Rate limits respeitados
- [ ] Webhook endpoint em produção validado
- [ ] Cliente assinou termo de aceite de integração

---

# Capítulo 21 — Testing Strategies

## 21.1 Níveis de Teste

### Unit Tests
- Mocks para APIs externas (nock, msw)
- Testa transformações de dados isoladamente
- Cobertura > 80% para módulos de integração

### Integration Tests
- Testcontainers para PostgreSQL/Redis reais
- Mocks para APIs externas (controláveis via WireMock)
- Testa fluxo completo: recebimento → transformação → escrita no DB

### Contract Tests
- Pact entre Orion e provedores externos
- Garante que mudanças no Orion não quebram integração
- Garante que mudanças no provedor são detectadas

### E2E Tests
- Sandbox real (não mocked)
- Testa fluxo end-to-end com credenciais sandbox
- Executado nightly em CI

## 21.2 Mocking Strategy

### Mocks por Ambiente
| Ambiente | External APIs | Database | Storage |
|----------|--------------|----------|---------|
| Unit test | Mocked (nock) | Mocked | Mocked |
| Integration test | WireMock | Real (testcontainer) | Real (testcontainer MinIO) |
| E2E sandbox | Real (sandbox) | Real (sandbox DB) | Real (sandbox S3) |
| E2E production | Real | Real | Real |

## 21.3 Exemplos de Teste

### Unit Test — Transformação Totvs
```typescript
describe('TotvsTransformer', () => {
  describe('transformSale', () => {
    it('should transform F2_EMISSAO from DD/MM/YY to ISO 8601', () => {
      const input = { F2_EMISSAO: '15/08/25' };
      const result = TotvsTransformer.transformSale(input);
      expect(result.result_date).toBe('2025-08-15');
    });
    
    it('should remove non-numeric from CPF', () => {
      const input = { A3_CGC: '123.456.789-01' };
      const result = TotvsTransformer.transformSeller(input);
      expect(result.cpf).toBe('12345678901');
    });
    
    it('should concatenate F2_DOC and F2_SERIE as external_reference', () => {
      const input = { F2_DOC: '000123456', F2_SERIE: '1' };
      const result = TotvsTransformer.transformSale(input);
      expect(result.external_reference).toBe('000123456-1');
    });
    
    it('should convert decimal comma to dot', () => {
      const input = { F2_VALBRUT: '1250,50' };
      const result = TotvsTransformer.transformSale(input);
      expect(result.value).toBe(1250.50);
    });
  });
});
```

### Integration Test — Sync Flow
```typescript
describe('Totvs Sync Integration', () => {
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let wireMock: WireMock;
  
  beforeAll(async () => {
    postgres = await new PostgreSqlContainer().start();
    redis = await new RedisContainer().start();
    wireMock = await WireMock.start();
    
    await runMigrations(postgres.getConnectionUrl());
  });
  
  afterAll(async () => {
    await postgres.stop();
    await redis.stop();
    await wireMock.stop();
  });
  
  beforeEach(async () => {
    await cleanDatabase(postgres.getConnectionUrl());
  });
  
  it('should sync sales from Totvs to Orion', async () => {
    // Setup: mock Totvs API
    await wireMock.register(
      WireMock.get('/api/v1/sales?date=2025-08-15')
        .willReturn(WireMock.aResponse()
          .withStatus(200)
          .withJsonBody([{
            F2_DOC: '000123456',
            F2_SERIE: '1',
            F2_EMISSAO: '15/08/25',
            F2_VEND1: 'VEND001',
            F2_VALBRUT: '1250,50'
          }]))
    );
    
    // Setup: create user with external_id VEND001
    await db.user.create({
      data: { id: 10, external_id: 'VEND001', tenant_id: 42, ... }
    });
    
    // Execute sync
    const syncService = new TotvsSyncService({
      baseUrl: wireMock.url,
      tenantId: 42
    });
    await syncService.syncSales('2025-08-15');
    
    // Verify result was created
    const results = await db.result.findMany({ where: { tenant_id: 42 }});
    expect(results).toHaveLength(1);
    expect(results[0].external_reference).toBe('000123456-1');
    expect(results[0].value).toBe(1250.50);
  });
  
  it('should handle vendedor not found', async () => {
    // Setup: mock Totvs returns sale with unknown vendedor
    await wireMock.register(
      WireMock.get('/api/v1/sales?date=2025-08-15')
        .willReturn(WireMock.aResponse()
          .withStatus(200)
          .withJsonBody([{
            F2_DOC: '000123457',
            F2_SERIE: '1',
            F2_VEND1: 'VEND999',  // não existe
            F2_VALBRUT: '500,00'
          }]))
    );
    
    const syncService = new TotvsSyncService({...});
    const result = await syncService.syncSales('2025-08-15');
    
    expect(result.synced).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('Vendedor VEND999 não encontrado');
  });
});
```

### Contract Test — Pact
```typescript
// consumer: orion-api
// provider: totvs

describe('Pact between Orion and Totvs', () => {
  const provider = new Pact({
    consumer: { name: 'orion-api' },
    provider: { name: 'totvs' },
    port: 1234
  });
  
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  
  it('should fetch sales by date', async () => {
    await provider.addInteraction({
      uponReceiving: 'a request for sales by date',
      withRequest: {
        method: 'GET',
        path: '/api/v1/sales',
        query: { date: '2025-08-15' },
        headers: { Authorization: 'Bearer ...' }
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: [{
          F2_DOC: Matchers.string('000123456'),
          F2_SERIE: Matchers.string('1'),
          F2_EMISSAO: Matchers.string('15/08/25'),
          F2_VEND1: Matchers.string('VEND001'),
          F2_VALBRUT: Matchers.string('1250,50')
        }]
      }
    });
    
    const sales = await totvsClient.getSales('2025-08-15');
    expect(sales).toHaveLength(1);
    expect(sales[0].F2_DOC).toBe('000123456');
  });
});
```

## 21.4 Test Data Builders
```typescript
class SaleBuilder {
  private sale: any = {
    F2_DOC: '000123456',
    F2_SERIE: '1',
    F2_EMISSAO: '15/08/25',
    F2_VEND1: 'VEND001',
    F2_VALBRUT: '1250,50'
  };
  
  withDoc(doc: string) { this.sale.F2_DOC = doc; return this; }
  withVendedor(vend: string) { this.sale.F2_VEND1 = vend; return this; }
  withValue(value: string) { this.sale.F2_VALBRUT = value; return this; }
  
  build() { return { ...this.sale }; }
}

// Uso
const sale = new SaleBuilder()
  .withVendedor('VEND999')
  .build();
```

---

# Capítulo 22 — Monitoring por Integração

## 22.1 Métricas Coletadas por Integração

### Métricas Operacionais
| Métrica | Descrição | Tipo |
|---------|-----------|------|
| `integration_requests_total` | Total de requisições | Counter (com labels: integration, status) |
| `integration_request_duration_seconds` | Latência | Histogram (com labels: integration, operation) |
| `integration_errors_total` | Erros | Counter (com labels: integration, error_type) |
| `integration_retries_total` | Retries | Counter |
| `integration_last_sync_timestamp` | Última sync bem-sucedida | Gauge (com labels: integration, tenant) |
| `integration_sync_duration_seconds` | Duração da sync | Histogram |
| `integration_records_synced_total` | Registros sincronizados | Counter |
| `integration_records_failed_total` | Registros falhados | Counter |
| `integration_dlq_size` | Tamanho da Dead Letter Queue | Gauge |

### Métricas de Negócio
| Métrica | Descrição |
|---------|-----------|
| `integration_active_tenants` | Tenants com integração ativa |
| `integration_revenue_impact` | Receita afetada pela integração (estimativa) |
| `integration_adoption_rate` | % clientes com integração ativa |

## 22.2 Dashboards por Integração

### Dashboard Totvs
```
TOTVS INTEGRATION DASHBOARD
├── Status: ✅ Ativo (última sync: 14:30)
├── Tenants conectados: 23
├── Requisições hoje: 1.234 (99.2% sucesso)
├── Latência média: 245ms
├── Erros hoje: 12 (10 vendedor não encontrado, 2 timeout)
├── DLQ: 3 mensagens pendentes
├── Records sincronizados hoje: 4.567
└── Gráfico: sync duration (últimos 30 dias)
```

### Dashboard WhatsApp
```
WHATSAPP INTEGRATION DASHBOARD
├── Status: ✅ Ativo
├── Mensagens enviadas hoje: 234
├── Taxa de entrega: 95.8%
├── Erros hoje: 5 (3 número inválido, 2 opt-out)
├── Templates mais usados: orion_goal_achieved (45%)
├── Latência média entrega: 4.2s
└── Custos hoje: $1.45 USD
```

## 22.3 Alertas por Integração

| Condição | Severidade | Canal |
|----------|------------|-------|
| Sync falha 3x consecutivas | Critical | PagerDuty + Slack |
| Latência > 5s por 10min | Warning | Slack |
| Erro rate > 10% por 30min | Critical | PagerDuty |
| DLQ cresce > 10 mensagens/hora | Warning | Slack |
| Token expira em 7 dias | Info | Email admin |
| Tenant sem sync há > 2h | Warning | Slack |
| Custo WhatsApp > $50/dia | Warning | Email CFO |
| Rate limit atingido | Info | Log |

## 22.4 Health Checks
Endpoint `/health/integrations` retorna status agregado:
```json
{
  "status": "degraded",
  "integrations": {
    "totvs": {
      "status": "ok",
      "lastSync": "2025-08-15T14:30:00Z",
      "latencyMs": 245,
      "errorRate": 0.008
    },
    "sap": {
      "status": "down",
      "lastSync": "2025-08-15T12:00:00Z",
      "error": "Authentication failed",
      "errorRate": 1.0
    },
    "whatsapp": {
      "status": "ok",
      "lastMessage": "2025-08-15T14:32:00Z",
      "deliveryRate": 0.958
    },
    "sendgrid": {
      "status": "ok",
      "lastSend": "2025-08-15T14:31:00Z",
      "bounceRate": 0.012
    }
  }
}
```

## 22.5 Logs Estruturados
Cada operação de integração loga:
```json
{
  "timestamp": "2025-08-15T14:30:00.000Z",
  "level": "info",
  "service": "orion-api",
  "module": "totvs-sync",
  "tenantId": 42,
  "integration": "totvs",
  "operation": "sync_sales",
  "requestId": "req_abc123",
  "duration": 2450,
  "recordsProcessed": 50,
  "recordsSucceeded": 48,
  "recordsFailed": 2,
  "errors": [
    {"type": "validation", "message": "Vendedor VEND999 não encontrado"}
  ]
}
```

---

# Capítulo 23 — Custos de Cada Integração

## 23.1 Custos de Implementação (One-time)

| Integração | Dev Days | Custo (R$) | Notas |
|-----------|----------|------------|-------|
| Totvs Protheus | 15 | R$ 12.000 | Mapeamento complexo, parsing XML |
| SAP B1 | 12 | R$ 9.600 | Service Layer REST, OData |
| Sankhya | 10 | R$ 8.000 | XML SOAP body, parser específico |
| Salesforce | 12 | R$ 9.600 | SOQL, Bulk API, OAuth complexo |
| HubSpot | 6 | R$ 4.800 | API bem documentada |
| Pipedrive | 5 | R$ 4.000 | API simples |
| Shopify | 5 | R$ 4.000 | OAuth padrão, webhooks |
| WooCommerce | 6 | R$ 4.800 | REST API simples |
| VTEX | 8 | R$ 6.400 | API complexa, multi-região |
| WhatsApp Business | 8 | R$ 6.400 | Templates, BSP, 24h window |
| Telegram Bot | 3 | R$ 2.400 | Bot API simples |
| SendGrid/SES SMTP | 2 | R$ 1.600 | Configuração DNS |
| Google OAuth | 3 | R$ 2.400 | OAuth padrão |
| Microsoft Azure AD | 3 | R$ 2.400 | OAuth padrão |
| SAML 2.0 | 8 | R$ 6.400 | XML, certificates, IdP-specific |
| Power BI OData | 5 | R$ 4.000 | Expor OData feed |
| Tableau (read-only DB) | 2 | R$ 1.600 | User management |
| S3 backup | 2 | R$ 1.600 | Lifecycle, IAM |

## 23.2 Custos Operacionais Mensais (por cliente)

| Integração | Custo Variável | Custo Fixo | Notas |
|-----------|----------------|-----------|-------|
| Totvs ERP | R$ 0 (cliente tem) | R$ 199/mês (plugin) | Plugin revenue |
| SAP B1 | R$ 0 | R$ 249/mês | Plugin revenue |
| Sankhya | R$ 0 | R$ 199/mês | Plugin revenue |
| Salesforce | API quota do cliente | R$ 299/mês | Plugin revenue |
| HubSpot | API quota | R$ 199/mês | Plugin revenue |
| WhatsApp Business | $0.005-0.08/msg | R$ 99/mês (plugin) + msg costs | Plugin + Meta |
| Telegram | R$ 0 | R$ 49/mês (plugin) | Bot API free |
| SendGrid | $0.001/email | R$ 79/mês (plugin) | Plugin + email |
| AWS SES | $0.10/1k emails | R$ 0 (incluso) | Cliente paga |
| OpenAI GPT-4o | $0.005/1k tokens | R$ 299/mês (IA Premium) | Plugin + API |
| Anthropic Claude | $0.003/1k tokens | R$ 299/mês (IA Premium) | Plugin + API |
| Cloudflare | $0 (Pro plan) | R$ 80/mês (share) | CDN/WAF |
| AWS (S3, EC2) | Variável | R$ 500/mês | Infra share |
| Twilio SMS | $0.05/SMS BR | Pay per use | Cliente paga |

## 23.3 Exemplo de Cálculo de Custo

### Cenário: 100 clientes Professional com WhatsApp + Totvs

**Receita:**
- 100 clientes × R$ 18.000/ano = R$ 1.800.000/ano (R$ 150k/mês MRR)
- 60% adotam WhatsApp = 60 clientes × R$ 99/mês = R$ 5.940/mês
- 40% adotam Totvs = 40 clientes × R$ 199/mês = R$ 7.960/mês
- Total receita adicional: R$ 13.900/mês

**Custos:**
- WhatsApp messages: 60 clientes × 200 msg/mês × $0.05 = $600 USD/mês ≈ R$ 3.000/mês
- Twilio SMS: ~10% preferem SMS, 6 clientes × 50 SMS/mês × $0.05 = $15 USD/mês ≈ R$ 75/mês
- Dev maintenance: 1 dev 20% time = R$ 2.000/mês
- Infra (Redis, DB): R$ 500/mês (share)
- Total custos: R$ 5.575/mês

**Margem:** R$ 13.900 - R$ 5.575 = R$ 8.325/mês (60% margem)

### Cenário: IA Premium com 100 clientes
- Receita: 100 × R$ 299/mês = R$ 29.900/mês
- Custo tokens (estimado): 100 × 50k tokens/dia × 30 dias × $0.005/1k = $750 USD/mês ≈ R$ 3.750/mês
- Margem: R$ 26.150/mês (87% margem)

## 23.4 Custos por Volume (SaaS Scaling)

| Componente | 100 clientes | 500 clientes | 1000 clientes |
|-----------|--------------|--------------|---------------|
| AWS EC2 (app) | R$ 2.000/mês | R$ 8.000/mês | R$ 15.000/mês |
| AWS RDS PostgreSQL | R$ 1.500/mês | R$ 4.000/mês | R$ 8.000/mês |
| ElastiCache Redis | R$ 500/mês | R$ 1.500/mês | R$ 3.000/mês |
| AWS S3 | R$ 200/mês | R$ 800/mês | R$ 1.500/mês |
| Cloudflare | R$ 80/mês | R$ 200/mês | R$ 400/mês |
| OpenAI/Anthropic | R$ 3.000/mês | R$ 15.000/mês | R$ 30.000/mês |
| WhatsApp/Twilio | R$ 3.000/mês | R$ 15.000/mês | R$ 30.000/mês |
| SES/SendGrid | R$ 500/mês | R$ 2.000/mês | R$ 4.000/mês |
| **Total infra + APIs** | **R$ 10.780/mês** | **R$ 46.500/mês** | **R$ 91.900/mês** |

---

# Capítulo 24 — Comparativo: Quando Usar Qual Integração

## 24.1 ERP — Qual Escolher

| Situação do Cliente | ERP Recomendado | Justificativa |
|---------------------|-----------------|---------------|
| PME varejo com Totvs Protheus | Totvs Integration | Já investiu no Totvs, sync nativo |
| PME com SAP B1 | SAP B1 Integration | SAP B1 é o sistema deles |
| PME com Sankhya | Sankhya Integration | Sankhya é o sistema deles |
| PME sem ERP (planilha) | Nenhuma | Importação manual via Excel |
| Indústria com SAP ECC/ERP | Desenvolvimento custom | Não temos plugin pronto; criar projeto |
| Cliente com Oracle ERP | Desenvolvimento custom | Não temos plugin |
| Cliente multination com SAP S/4HANA | SAP B1 Integration (parcial) + custom | Adaptar B1 para S/4HANA via API similar |

### Critérios para Desenvolver Nova Integração ERP
- 5+ clientes potenciais pedem
- ROI: custo dev < 6 meses de receita plugin
- ERP tem API REST (sem API = trabalho manual, não vale)

## 24.2 CRM — Qual Escolher

| Perfil Cliente | CRM Recomendado | Por quê |
|----------------|-----------------|---------|
| PME sem CRM | Nenhum (Orion é CRM-lite) | Orion já tem gestão comercial |
| PME com Pipedrive | Pipedrive Integration | Sync deals como resultados |
| PME com HubSpot | HubSpot Integration | Sync deals |
| Enterprise com Salesforce | Salesforce Integration | Sync opportunities |
| Enterprise com Dynamics 365 | Custom development | Sem plugin pronto |

## 24.3 Comunicação — WhatsApp vs SMS vs Email vs Push

| Cenário | Canal | Por quê |
|---------|-------|---------|
| Notificação de meta atingida (urgente, pessoal) | WhatsApp + Push | WhatsApp tem maior taxa de leitura (90%+ vs 20% email) |
| Reset de senha | Email + SMS | Email é primary; SMS para usuários sem email |
| Campanha começou (broadcast) | WhatsApp + Email | WhatsApp para reach; Email para arquivar |
| Resumo diário para gerente | Email | Email permite relatório mais rico |
| Aprovação pendente | Push + Email | Push é instantâneo; Email para audit |
| Convite para novo usuário | Email | Profissional, com link de setup |
| Alerta de sync falhou (admin) | Email | Baixa urgência; precisa de contexto |
| Código 2FA | SMS | Altamente deliverable, sem app necessário |
| Lembrete de meta (15h) | Push | Gratuito, instantâneo, se usuário habilitou |
| Insights de IA | Push + Email | Push para quick; Email para detalhe |

## 24.4 BI — Power BI vs Tableau vs Metabase

| Situação | Ferramenta | Por quê |
|----------|-----------|---------|
| Cliente Microsoft-heavy | Power BI | Já têm licença, integra com Teams |
| Cliente enterprise com data team | Tableau | Melhor para análises complexas |
| Startup custo-consciente | Metabase | Open-source, gratuito |
| Cliente sem BI | Não conectar | Foco no Orion dashboard nativo |
| Cliente com Looker | Custom connector via OData | Usar endpoint OData genérico |

## 24.5 Auth — Google vs Microsoft vs SAML vs Magic Link

| Perfil Cliente | Auth Recomendado |
|----------------|------------------|
| PME com Google Workspace | Google OAuth |
| PME com Microsoft 365 | Microsoft Azure AD |
| Enterprise com Okta/OneLogin | SAML 2.0 |
| PME sem IdP corporativo | Email/senha + Magic Link |
| Cliente exige 2FA via SMS | Email/senha + SMS 2FA |
| Cliente exige 2FA via TOTP | Email/senha + TOTP (Google Authenticator) |

## 24.6 Storage — S3 vs MinIO vs Local

| Situação | Storage | Por quê |
|----------|---------|---------|
| Cloud SaaS | AWS S3 | Padrão, durável, lifecycle |
| On-prem PME | MinIO (Docker) | S3-compatível, self-hosted |
| Dev local | Filesystem local | Sem dependência externa |
| Cliente com Azure já | Azure Blob Storage | Evitar S3 se Azure-only |
| Cliente com GCP já | Google Cloud Storage | Evitar S3 se GCP-only |

## 24.7 Exemplo Prático: Cliente Médio BR (PME varejo)

### Stack Típica
- **ERP:** Totvs Protheus
- **CRM:** Nenhum (Orion substitui)
- **Comunicação:** WhatsApp Business + Email (SES)
- **Auth:** Google Workspace (ou email/senha)
- **BI:** Power BI (já têm licença Microsoft 365)
- **Storage:** AWS S3 (cloud)

### Plugins Orion Necessários
1. Totvs Integration (R$ 199/mês)
2. WhatsApp Business (R$ 99/mês)
3. Email Avançado (R$ 79/mês) — opcional se SES direto
4. Power BI Connector (R$ 149/mês) — opcional

### Custo Mensal Plugin: R$ 526
### Receita Orion Professional: R$ 1.500/mês (R$ 18k/ano ÷ 12)
### Plugin Attach Rate: 35%

### Decisão Final
Cliente típico BR usa:
- Totvs + WhatsApp + Power BI + Google OAuth
- 3 plugins → R$ 447/mês adicional
- Total Orion: R$ 1.947/mês (R$ 23.364/ano)

---

# Capítulo 25 — Roadmap de Integrações

## v1.0 (Q1 2026)
- SMTP (genérico)
- AWS SES
- Google OAuth
- Microsoft Azure AD
- AWS S3

## v1.5 (Q2 2026)
- Totvs Protheus
- SendGrid
- Cloudflare CDN

## v2.0 (Q3 2026)
- SAP B1
- Sankhya
- WhatsApp Business (Twilio)
- SAML 2.0
- Webhooks outbound

## v2.5 (Q4 2026)
- Pipedrive
- HubSpot
- Shopify
- WooCommerce
- VTEX
- Power BI (OData)
- Twilio SMS
- Telegram Bot

## v3.0 (Q1 2027)
- Salesforce
- Tableau
- Metabase
- FCM Push Notifications
- Magic Link Auth

## v3.5 (Q2 2027)
- Microsoft Dynamics 365 (CRM)
- Oracle ERP (custom)
- Zendesk (suporte)
- Intercom (chat)

## v4.0 (Q3 2027)
- Bling ERP (BR)
- ContaAzul ERP (BR)
- Omie ERP (BR)
- RD Station CRM
- Magento E-commerce
- BigCommerce E-commerce

## v4.5 (Q4 2027)
- Mercado Livre (e-commerce BR)
- Amazon Seller Central
- B2W (Americanas)
- Magazine Luiza Marketplace
- Carrefour Marketplace

## v5.0 (2028+)
- Latam ERPs (e.g., SIAT Peru, ODOO MX)
- Europe ERPs (Sage, Datev)
- US ERPs (NetSuite, QuickBooks)
- Open Finance BR
- Pix API direto
