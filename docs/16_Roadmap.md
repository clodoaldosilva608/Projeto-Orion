# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 16

# ROADMAP ESTRATÉGICO

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Roadmap de Produto (5 anos)

---

# Capítulo 1 — Objetivo

Este documento apresenta o roadmap de longo prazo do Projeto Orion, organizado por versões maiores (v1.0 a v5.0+), por trimestres e por áreas estratégicas (produto, técnico, mercado, contratações, budget). Serve como guia para priorização de features, alocação de recursos, comunicação com stakeholders, planejamento de contratações e gestão financeira.

**Público-alvo:** Liderança executiva (CEO, CTO, CFO), product managers, tech leads, investidores e stakeholders estratégicos.

**Disclaimer:** Este roadmap é uma declaração de intenção estratégica, não um contrato. Datas e features específicas estão sujeitas a mudanças baseadas em feedback de clientes, evolução do mercado, capacidade da equipe e discover contínuo.

---

# Capítulo 2 — Visão de 5 Anos

| Ano | Marco | Foco | MRR Alvo | Clientes |
|-----|-------|------|----------|----------|
| 2025 | v1.0 Lançamento | Plataforma core, primeiros 100 clientes | R$ 80.000 | 100 |
| 2026 | v2.0 IA + Marketplace | IA avançada, plugins de terceiros | R$ 500.000 | 1.000 |
| 2027 | v3.0 BI + Mobile Nativo | Business Intelligence, apps iOS/Android | R$ 2.500.000 | 5.000 |
| 2028 | v4.0 Internacional | Expansão América Latina, multi-idioma | R$ 8.000.000 | 15.000 |
| 2029 | v5.0 Plataforma | Ecossistema completo, IPO ready | R$ 20.000.000 | 30.000+ |

### Princípios Norteadores

1. **Product-led growth:** produto excelente gera expansão orgânica
2. **Platform play:** marketplace + API pública criam lock-in positivo
3. **Vertical depth antes de horizontal breadth:** dominar gestão comercial antes de expandir vertical
4. **Latin America first:** conquistar LATAM antes de pensar em outros continentes
5. **AI-native:** IA não é feature, é camada transversal

---

# Capítulo 3 — v1.0 (2025 Q3-Q4)

## 3.1 Objetivo

Lançar a plataforma core, validar produto-mercado, conquistar primeiros 100 clientes pagantes.

## 3.2 Escopo

### Q3 2025 (Julho-Setembro)

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Setup do projeto | Repo, CI/CD, infraestrutura | 50 | — | Deploy automático em staging |
| Módulo Core + Auth | Login, JWT, refresh, MFA | 80 | Setup | 95% cobertura de testes |
| Módulo Empresas + Filiais | CRUD completo, hierarquia | 40 | Core | Criação de empresa < 2min |
| Módulo Usuários + Permissões (RBAC) | Roles, permissions, atribuição | 60 | Empresas | Atribuição de role < 5s |
| Módulo Indicadores + Construtor | Custom fields, fórmulas | 100 | Usuários | Criar indicador < 1min |
| Módulo Metas + Atribuição | Individual, grupo, distribuição | 80 | Indicadores | Distribuir 100 metas < 5s |

### Q4 2025 (Outubro-Dezembro)

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Módulo Resultados + Aprovação | Workflow de aprovação | 70 | Metas | Aprovação < 2s |
| Módulo Ranking (tempo real) | WebSocket, cache Redis | 60 | Resultados | Update em < 1s |
| Módulo Dashboard (widgets arrastáveis) | Grid customizável | 80 | Todos módulos | Carrega < 1s |
| Módulo Campanhas + Premiações | Regras, awards, participantes | 90 | Metas, Resultados | Criar campanha < 5min |
| Módulo Auditoria | Log imutável de mudanças | 40 | Todos módulos | Log criado em < 100ms |
| Módulo Licenciamento | Ativação, validação, expiração | 50 | Core | Validação < 50ms |
| Módulo Backup | Backup automático S3 | 30 | Core | Restore < 30min |
| Módulo Atualizações | Update automático | 40 | Licenciamento | Update < 10min |
| Empacotamento Electron | Windows, macOS, Linux | 60 | Web | Installer < 100MB |
| PWA instalável | Service worker, manifest | 30 | Web | Lighthouse > 90 |
| Painel admin separado | admin.suaempresa.com | 50 | Core | Isolamento total |
| Primeiros 10 pilotos | Onboarding assistido | — | Tudo acima | NPS piloto > 50 |

## 3.3 Métricas de Sucesso v1.0

| Métrica | Meta | Como Medir | Frequência |
|---------|------|------------|------------|
| Clientes pagantes | 100 | Stripe + CRM | Diário |
| MRR | R$ 80.000 | Stripe | Diário |
| Churn mensal | < 3% | Stripe + análise | Mensal |
| NPS | > 40 | Pesquisa pós-onboarding | Trimestral |
| Tempo médio de implantação | < 2 dias | Métrica de onboarding | Por cliente |
| Uptime | 99.5% | Status page | Mensal |
| Bugs P0 em produção | 0 | Sentry + Linear | Semanal |
| p95 latência API | < 500ms | Datadog APM | Contínuo |
| Cobertura de testes | > 70% | Vitest coverage | Por PR |
| CSAT suporte | > 90% | Pesquisa pós-ticket | Por ticket |

## 3.4 Recursos Necessários

### Equipe

| Cargo | Qtd | Custo Anual (R$) |
|-------|-----|------------------|
| CEO | 1 | 240.000 |
| CTO | 1 | 240.000 |
| Tech Lead | 1 | 180.000 |
| Dev Backend Sênior | 1 | 168.000 |
| Dev Frontend Sênior | 1 | 168.000 |
| Dev Full-stack Pleno | 2 | 240.000 |
| Designer UX/UI | 1 | 120.000 |
| QA Engineer | 1 | 96.000 |
| DevOps | 1 | 144.000 |
| Product Manager | 1 | 144.000 |
| Customer Success | 1 | 84.000 |
| **Total** | **12** | **1.824.000** |

### Infraestrutura (Anual)

| Item | Custo Mensal | Custo Anual |
|------|--------------|-------------|
| AWS (Vercel + RDS + ElastiCache + S3) | R$ 8.000 | R$ 96.000 |
| Sentry + Datadog | R$ 3.000 | R$ 36.000 |
| OpenAI API | R$ 2.000 | R$ 24.000 |
| GitHub + Linear + Slack | R$ 1.500 | R$ 18.000 |
| Domínios + SSL | R$ 200 | R$ 2.400 |
| Email (SendGrid) | R$ 500 | R$ 6.000 |
| **Total** | **R$ 15.200** | **R$ 182.400** |

### Total Anual v1.0: ~R$ 2.006.400

### Receita Projetada

| Trimestre | Clientes | MRR Final | Receita Trimestre |
|-----------|----------|-----------|-------------------|
| Q3 2025 | 30 | R$ 24.000 | R$ 36.000 |
| Q4 2025 | 100 | R$ 80.000 | R$ 156.000 |
| **Total 2025** | **100** | **R$ 80.000** | **R$ 192.000** |

**Burn rate anual:** R$ 1.814.400 (após receita)
**Runway necessário:** 18-24 meses de runway a partir do início de 2025

---

# Capítulo 4 — v2.0 (2026)

## 4.1 Objetivo

Adicionar inteligência artificial, marketplace de plugins e expansão comercial agressiva.

## 4.2 Escopo

### Q1 2026 (Janeiro-Março)

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Módulo IA Básico | Chat interativo, insight diário, previsão de meta, relatório narrativo | 120 | v1.0 | 100k queries/mês |
| Notificações Push | Web + PWA mobile | 40 | Auth | 90% entrega < 5s |
| Mural da Empresa | Rede social interna (posts, likes, comentários) | 80 | Users | 30% MAU usa |

**Feature Detail: IA Básico**

- **Descrição:** Sistema de IA que permite aos usuários fazer perguntas em linguagem natural sobre seus dados ("Quantos vendedores bateram a meta em outubro?"), recebe insights automáticos diários ("João está 15% abaixo da meta, sugerir acompanhamento"), prevê meta mensal baseado em tendência, e gera relatório narrativo semanal.
- **Esforço:** 120 story points (~6 devs × 4 semanas)
- **Dependências:** v1.0 completo (metas, resultados, ranking)
- **Stack:** OpenAI GPT-4o-mini (custo otimizado), pgvector para embeddings, Redis para cache
- **Métricas:**
  - Latência p95 chat: < 3s
  - Custo por query: < R$ 0,15
  - Satisfação (thumbs up/down): > 75% positivo
  - Adesão: 60% das empresas ativas usam IA no mês
- **Riscos:**
  - Custo de IA explode → mitigar com cache agressivo + fallback para GPT-3.5
  - Alucinação → mitigar com prompt engineering + RAG com dados estruturados
  - LGPD → dados pessoais NUNCA enviados à IA (anonimização prévia)

### Q2 2026 (Abril-Junho)

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Marketplace de Plugins v1 | API pública estável, SDKs (JS/Python/PHP), 5 plugins oficiais | 150 | v1.0 | 20+ plugins em 6 meses |
| Gamificação Avançada | Medalhas, troféus, níveis, conquistas | 60 | Users | Aumenta engajamento 25% |
| Calendário Comercial | Datas comemorativas, feriados, eventos | 30 | Core | 80% preenche calendário |

**Feature Detail: Marketplace de Plugins v1**

- **Descrição:** Plataforma que permite desenvolvedores terceiros criarem plugins que estendem o Orion. Plugins podem adicionar: integrações (WhatsApp, Telegram, CRM), novos tipos de widgets, automações customizadas, relatórios específicos.
- **Esforço:** 150 SP (~8 devs × 6 semanas)
- **Stack:** API REST pública versionada (`/api/v1/public/`), OAuth2 para apps, webhooks bidirecionais, sandbox para testes
- **5 Plugins Oficiais:**
  1. WhatsApp Business — notifica vendedores via WhatsApp
  2. Telegram Bot — ranking diário no Telegram
  3. CRM Básico — pipeline de vendas integrado
  4. Estoque Básico — sincroniza com ERPs
  5. Comissões — cálculo automático de comissões
- **Métricas:**
  - 20+ plugins publicados em 6 meses
  - 30% das empresas instalam ao menos 1 plugin
  - SDK downloads: 500+ no primeiro mês
  - Documentação: 95% satisfação em DX survey
- **Receita esperada:** Revenue share 70/30 (plugin dev / Orion)

### Q3 2026 (Julho-Setembro)

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| API Pública v1 | REST + Webhooks, documentação OpenAPI | 80 | v1.0 | 100 devs ativos |
| Integração ERPs | Totvs, SAP B1, Sankhya | 120 | API Pública | 200 empresas integradas |
| Painel TV | Smart TV (Tizen, webOS) para ranking em tempo real | 50 | Ranking | 50 TVs ativas |
| App Mobile PWA otimizado | Offline-first completo | 80 | PWA v1.0 | 1.000 instalações |

### Q4 2026 (Outubro-Dezembro)

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Checklist Diário | Para vendedores (tarefas do dia) | 40 | Users | 60% uso diário |
| Biblioteca de Treinamentos | PDFs, vídeos, certificados | 60 | Core | 30% completa treinamento |
| Central de Documentos | Por colaborador | 40 | Users | — |
| Sistema de Feedback | Estruturado, anônimo opcional | 50 | Users | 50% participa |
| Multi-idioma | Português + Inglês | 70 | Core | 100% traduzido |

## 4.3 Métricas de Sucesso v2.0

| Métrica | Meta | Como Medir | Frequência |
|---------|------|------------|------------|
| Clientes ativos | 1.000 | Stripe | Diário |
| MRR | R$ 500.000 | Stripe | Diário |
| Plugins no marketplace | 20+ | Marketplace dashboard | Mensal |
| Uso mensal de IA | 100k queries | Logs | Mensal |
| País | Brasil | — | — |
| Parceiros implementadores | 10 | CRM | Mensal |
| NPS | > 50 | Pesquisa | Trimestral |
| Churn | < 2% | Análise | Mensal |
| DAU/MAU | > 40% | Analytics | Mensal |
| API calls/dia (públicas) | 100k | Logs | Diário |

## 4.4 Recursos Necessários v2.0

### Equipe (expansão)

| Novo Cargo | Qtd | Custo Anual |
|------------|-----|-------------|
| Engenheiro de IA | 1 | 240.000 |
| Dev Backend Sênior | 1 | 168.000 |
| Dev Frontend Pleno | 1 | 120.000 |
| Dev Mobile (React Native prep) | 1 | 144.000 |
| Product Designer | 1 | 96.000 |
| Customer Success | 2 | 168.000 |
| Sales Rep | 2 | 240.000 (comissão) |
| Marketing | 1 | 96.000 |
| **Total novos** | **10** | **1.272.000** |

### Total equipe v2.0: 22 pessoas, ~R$ 3.096.000/ano

### Infraestrutura v2.0 (Anual)

| Item | Custo Mensal | Custo Anual |
|------|--------------|-------------|
| AWS (escala 10×) | R$ 25.000 | R$ 300.000 |
| OpenAI API (escala 100×) | R$ 20.000 | R$ 240.000 |
| Sentry + Datadog + Logs | R$ 8.000 | R$ 96.000 |
| Ferramentas (GitHub, Linear, Slack, etc.) | R$ 3.000 | R$ 36.000 |
| CDN (Cloudflare) | R$ 2.000 | R$ 24.000 |
| Email (escala) | R$ 2.000 | R$ 24.000 |
| **Total** | **R$ 60.000** | **R$ 720.000** |

### Total Anual v2.0: ~R$ 3.816.000

### Receita Projetada v2.0

| Trimestre | Clientes | MRR Final | Receita Trimestre |
|-----------|----------|-----------|-------------------|
| Q1 2026 | 200 | R$ 160.000 | R$ 360.000 |
| Q2 2026 | 400 | R$ 320.000 | R$ 720.000 |
| Q3 2026 | 700 | R$ 560.000 | R$ 1.320.000 |
| Q4 2026 | 1.000 | R$ 500.000 | R$ 1.590.000 |
| **Total 2026** | **1.000** | **R$ 500.000** | **R$ 3.990.000** |

**Break-even projetado:** Q3 2026

---

# Capítulo 5 — v3.0 (2027)

## 5.1 Objetivo

Lançar Business Intelligence, apps nativos mobile, expandir para 5.000 clientes.

## 5.2 Escopo

### Q1 2027

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Apps Nativos iOS/Android | React Native, push nativas, biometria, offline completo | 200 | API Pública | 50k instalações |
| BI - Business Intelligence | Cubos OLAP, relatórios ad-hoc, drill-down | 180 | v2.0 | 1M queries/mês |

**Feature Detail: Apps Nativos iOS/Android**

- **Descrição:** Apps nativos (React Native) para iOS e Android, com notificações push nativas, autenticação biométrica (Face ID/Touch ID), modo offline completo (sincronização quando volta online).
- **Esforço:** 200 SP (~8 devs mobile × 12 semanas)
- **Stack:** React Native + Expo EAS, SQLite local para offline, MMKV para storage rápido, WatermelonDB para sync
- **Métricas:**
  - Crash-free sessions: > 99.5%
  - App Store rating: > 4.5
  - Tempo médio de startup: < 2s
  - 50k instalações em 6 meses
  - Retenção D30: > 40%

### Q2 2027

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| IA Avançada | Agente autônomo, visão computacional, previsão churn, benchmarking | 150 | IA Básico | 30% usa recursos avançados |
| Automações Power User | Motor de regras visual, workflows, triggers | 100 | Core | 20% empresas criam automação |

### Q3 2027

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Integração CRMs | Salesforce, HubSpot, Pipedrive | 90 | API Pública | 100 empresas integradas |
| Chat Corporativo | Interno, mensagens diretas e em grupo | 70 | Users | 40% MAU usa |
| Gestão de Comissões | Completa, multi-cenários | 80 | Metas, Resultados | 50% empresas usam |
| Assinatura Eletrônica | Documentos com validade jurídica | 50 | Core | — |

### Q4 2027

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Multi-moeda | USD, EUR, ARS, MXN | 60 | Core | 100% conversão automática |
| Multi-timezone aprimorado | Display por user, conversão automática | 30 | Core | Zero conflitos |
| App Smartwatch | Apple Watch, Wear OS | 50 | Mobile | 5k instalações |
| Voice Assistant | Alexa, Google Assistant | 40 | API | 1k usuários ativos |

## 5.3 Métricas de Sucesso v3.0

| Métrica | Meta | Como Medir | Frequência |
|---------|------|------------|------------|
| Clientes ativos | 5.000 | Stripe | Diário |
| MRR | R$ 2.500.000 | Stripe | Diário |
| Apps mobile ativos | 50.000 | Analytics | Mensal |
| BI queries/mês | 1M | Logs | Mensal |
| País | Brasil + Argentina | — | — |
| NPS | > 55 | Pesquisa | Trimestral |
| Churn | < 1.5% | Análise | Mensal |
| Net Revenue Retention | > 120% | Stripe | Mensal |

## 5.4 Recursos Necessários v3.0

### Equipe (expansão para 50 pessoas)

| Novo Cargo | Qtd | Custo Anual |
|------------|-----|-------------|
| Dev Mobile Sênior | 2 | 336.000 |
| Dev BI/Data | 2 | 336.000 |
| Dev Backend Sênior | 2 | 336.000 |
| Data Scientist | 1 | 240.000 |
| DevOps Sênior | 1 | 180.000 |
| Product Manager | 1 | 144.000 |
| Product Designer | 2 | 192.000 |
| Customer Success | 4 | 336.000 |
| Sales Rep | 4 | 480.000 (comissão) |
| Marketing | 2 | 192.000 |
| Suporte N1/N2 | 4 | 240.000 |
| Financeiro/Admin | 2 | 168.000 |
| **Total novos** | **28** | **3.180.000** |

### Total equipe v3.0: ~50 pessoas, ~R$ 6.276.000/ano

### Infraestrutura v3.0 (Anual)

| Item | Custo Anual |
|------|-------------|
| AWS (multi-region) | R$ 800.000 |
| OpenAI API (escala 1000×) | R$ 1.500.000 |
| Observabilidade | R$ 200.000 |
| CDN global | R$ 100.000 |
| Ferramentas | R$ 100.000 |
| Marketing tools | R$ 80.000 |
| **Total** | **R$ 2.780.000** |

### Total Anual v3.0: ~R$ 9.056.000

### Receita Projetada v3.0

| Trimestre | Clientes | MRR Final | Receita Trimestre |
|-----------|----------|-----------|-------------------|
| Q1 2027 | 1.500 | R$ 750.000 | R$ 1.875.000 |
| Q2 2027 | 2.500 | R$ 1.250.000 | R$ 3.000.000 |
| Q3 2027 | 3.500 | R$ 1.750.000 | R$ 4.500.000 |
| Q4 2027 | 5.000 | R$ 2.500.000 | R$ 6.375.000 |
| **Total 2027** | **5.000** | **R$ 2.500.000** | **R$ 15.750.000** |

**Lucro líquido projetado 2027:** ~R$ 6.694.000

---

# Capítulo 6 — v4.0 (2028)

## 6.1 Objetivo

Expansão internacional completa, ecossistema de marketplace maduro, 15.000+ clientes.

## 6.2 Escopo

| Feature | Descrição | Esforço (SP) | Dependências | Métricas de Sucesso |
|---------|-----------|--------------|--------------|---------------------|
| Expansão América Latina | Espanhol LATAM, conformidade fiscal (MX, AR, CL, CO, PE) | 200 | Multi-idioma | 6 países ativos |
| Marketplace Maduro | 100+ plugins, revenue share 70/30, certificação | 150 | Marketplace v1 | 100+ plugins |
| IA Generativa Avançada | Geração de campanhas, dashboards, onboarding conversacional | 120 | IA v3 | 50% usa |
| Integração E-commerce | Shopify, WooCommerce, VTEX, Mercado Livre | 100 | API Pública | 200 empresas |
| SSO Empresarial | SAML 2.0, AD, Okta, Azure AD, Google Workspace | 80 | Auth | 100 empresas |
| Compliance Avançado | SOC 2 Type II, ISO 27001, PCI DSS | 100 | — | Certificações obtidas |

**Feature Detail: Expansão América Latina**

- **Descrição:** Localizar produto para espanhol LATAM, adaptar conformidade fiscal para México (CFDI), Argentina (AFIP), Chile (SII), Colômbia (DIAN), Peru (SUNAT). Estabelecer parcerias de distribuição locais.
- **Esforço:** 200 SP (~10 devs × 6 meses)
- **Métricas:**
  - 6 países com clientes ativos
  - 20% da receita fora do Brasil
  - 5 parceiros implementadores internacionais
  - Localização 100% completa (UI, docs, suporte)

## 6.3 Métricas de Sucesso v4.0

| Métrica | Meta | Como Medir | Frequência |
|---------|------|------------|------------|
| Clientes ativos | 15.000 | Stripe | Diário |
| MRR | R$ 8.000.000 | Stripe | Diário |
| Países | 6 | Stripe | Mensal |
| Plugins marketplace | 100+ | Dashboard | Mensal |
| Funcionários | 80+ | RH | Mensal |
| NPS | > 55 | Pesquisa | Trimestral |
| Churn | < 1.5% | Análise | Mensal |
| Net Revenue Retention | > 130% | Stripe | Mensal |

## 6.4 Recursos Necessários v4.0

### Equipe (expansão para 80 pessoas)

| Novo Cargo | Qtd | Custo Anual |
|------------|-----|-------------|
| Dev Backend Sênior | 4 | 672.000 |
| Dev Frontend Sênior | 3 | 504.000 |
| Dev Mobile | 2 | 336.000 |
| DevOps/SRE | 2 | 360.000 |
| Security Engineer | 1 | 240.000 |
| Data Scientist | 2 | 480.000 |
| Product Manager | 2 | 288.000 |
| Product Designer | 2 | 240.000 |
| Customer Success | 6 | 540.000 |
| Sales (internacional) | 4 | 600.000 |
| Marketing (internacional) | 2 | 240.000 |
| Suporte (multi-idioma) | 6 | 420.000 |
| Legal/Compliance | 1 | 240.000 |
| **Total novos** | **37** | **5.160.000** |

### Total equipe v4.0: ~87 pessoas, ~R$ 11.436.000/ano

### Infraestrutura v4.0 (Anual)

| Item | Custo Anual |
|------|-------------|
| AWS (multi-region global) | R$ 2.500.000 |
| OpenAI API | R$ 3.000.000 |
| Observabilidade | R$ 400.000 |
| CDN global premium | R$ 200.000 |
| Security (WAF, DDoS) | R$ 200.000 |
| Compliance (auditorias) | R$ 300.000 |
| Marketing tools | R$ 200.000 |
| **Total** | **R$ 6.800.000** |

### Total Anual v4.0: ~R$ 18.236.000

### Receita Projetada v4.0

| Trimestre | Clientes | MRR Final | Receita Trimestre |
|-----------|----------|-----------|-------------------|
| Q1 2028 | 7.500 | R$ 4.000.000 | R$ 9.750.000 |
| Q2 2028 | 10.000 | R$ 5.500.000 | R$ 14.250.000 |
| Q3 2028 | 12.500 | R$ 7.000.000 | R$ 18.750.000 |
| Q4 2028 | 15.000 | R$ 8.000.000 | R$ 22.500.000 |
| **Total 2028** | **15.000** | **R$ 8.000.000** | **R$ 65.250.000** |

**Lucro líquido projetado 2028:** ~R$ 47.014.000

---

# Capítulo 7 — v5.0+ (2029)

## 7.1 Objetivo

Consolidar como plataforma de referência LATAM, ecossistema robusto, IPO ready.

## 7.2 Escopo (Visão)

| Feature | Descrição | Esforço (SP) | Métricas de Sucesso |
|---------|-----------|--------------|---------------------|
| Plataforma Aberta | SDKs multi-linguagem, webhooks bidirecionais, embedded mode | 150 | 5 SDKs ativos |
| IA Multimodal | Texto + Imagem + Áudio + Vídeo, análise de fotos de treinamento | 180 | 30% usa |
| Orion for Developers | Certificação oficial, hackathons, comunidade open-source | 80 | 1k certificados |
| Expansão Vertical | Orion Saúde, Varejo, Indústria, Serviços | 300 | 4 verticais ativas |
| Analytics Network | Benchmarking anônimo opt-in, insights de mercado | 100 | 500 empresas |
| IPO Ready | Auditoria Big Four, governança madura, compliance SEC/CVM | 200 | Pronto para S-1 |

## 7.3 Métricas de Sucesso v5.0

| Métrica | Meta | Como Medir | Frequência |
|---------|------|------------|------------|
| Clientes ativos | 30.000+ | Stripe | Diário |
| MRR | R$ 20.000.000 | Stripe | Diário |
| Países | 10+ | Stripe | Mensal |
| Funcionários | 200+ | RH | Mensal |
| ARR | R$ 250M+ | Stripe | Mensal |
| Marketplace GMV | R$ 50M/ano | Dashboard | Mensal |
| Comunidade devs | 10k+ | Discord + GitHub | Mensal |

## 7.4 Recursos Necessários v5.0

### Equipe (expansão para 200+ pessoas)

- Engenharia: 80 (40 backend, 25 frontend, 10 mobile, 5 devops)
- Produto: 20 (10 PMs, 10 designers)
- Data/IA: 15
- Sales: 30 (15 Brasil, 15 internacional)
- Customer Success: 25
- Suporte: 15
- Marketing: 10
- G&A (Financeiro, RH, Legal, Admin): 15
- **Total: ~210 pessoas**

### Custo Anual v5.0: ~R$ 30.000.000 equipe + R$ 15.000.000 infra = R$ 45.000.000

### Receita Projetada v5.0

| Trimestre | Clientes | MRR Final | Receita Trimestre |
|-----------|----------|-----------|-------------------|
| Q1 2029 | 20.000 | R$ 12.000.000 | R$ 30.000.000 |
| Q2 2029 | 24.000 | R$ 15.000.000 | R$ 40.500.000 |
| Q3 2029 | 27.000 | R$ 17.500.000 | R$ 48.750.000 |
| Q4 2029 | 30.000 | R$ 20.000.000 | R$ 56.250.000 |
| **Total 2029** | **30.000** | **R$ 20.000.000** | **R$ 175.500.000** |

**Lucro líquido projetado 2029:** ~R$ 130.500.000

---

# Capítulo 8 — Funcionalidades por Versão (Resumo)

## 8.1 Tabela Cross-Versão

| Funcionalidade | v1.0 | v2.0 | v3.0 | v4.0 | v5.0 |
|----------------|------|------|------|------|------|
| Cadastro de empresas | ✅ | — | — | — | — |
| Indicadores personalizados | ✅ | — | — | — | — |
| Metas e resultados | ✅ | — | — | — | — |
| Dashboard configurável | ✅ | — | — | — | — |
| Ranking em tempo real | ✅ | — | — | — | — |
| Campanhas e premiações | ✅ | — | — | — | — |
| Auditoria | ✅ | — | — | — | — |
| Licenciamento | ✅ | — | — | — | — |
| Painel admin separado | ✅ | — | — | — | — |
| PWA instalável | ✅ | — | — | — | — |
| IA básica (chat + insights) | — | ✅ | — | — | — |
| Marketplace v1 | — | ✅ | — | — | — |
| API pública | — | ✅ | — | — | — |
| Integração ERPs | — | ✅ | — | — | — |
| Gamificação avançada | — | ✅ | — | — | — |
| Apps nativos iOS/Android | — | — | ✅ | — | — |
| Business Intelligence | — | — | ✅ | — | — |
| IA avançada (autônoma) | — | — | ✅ | — | — |
| Integração CRMs | — | — | ✅ | — | — |
| Multi-moeda | — | — | ✅ | — | — |
| Expansão LATAM | — | — | — | ✅ | — |
| Marketplace maduro | — | — | — | ✅ | — |
| SSO empresarial | — | — | — | ✅ | — |
| IA multimodal | — | — | — | — | ✅ |
| Expansão vertical | — | — | — | — | ✅ |

---

# Capítulo 9 — Roadmap Técnico Paralelo

Além das features de produto, o roadmap técnico inclui:

## 9.1 2025

| Item | Esforço | Prioridade | Métricas |
|------|---------|------------|----------|
| Setup CI/CD completo | 40 SP | P0 | Deploy < 10min |
| Observabilidade (logs, métricas, traces) | 30 SP | P0 | MTTR < 30min |
| Testes automatizados > 70% cobertura | 60 SP | P0 | Cobertura 70%+ |
| Primeiros runbooks de incidente | 20 SP | P1 | 10 runbooks |
| Storybook completo | 30 SP | P1 | 100% componentes |
| ESLint rules customizadas | 15 SP | P2 | 0 warnings |
| ADRs das decisões críticas | 20 SP | P1 | 15 ADRs |

## 9.2 2026

| Item | Esforço | Prioridade | Métricas |
|------|---------|------------|----------|
| Migração para microsserviços (seletiva) | 200 SP | P1 | Auth como MS |
| Event sourcing para módulos críticos | 100 SP | P2 | Results + Rankings |
| Cache distribuído avançado | 50 SP | P1 | Hit rate > 80% |
| CDN global | 20 SP | P1 | Latência < 100ms |
| Multi-region read replicas | 80 SP | P2 | Latência global < 200ms |
| Performance monitoring automatizado | 30 SP | P1 | p95 < 300ms |
| Zero-downtime deploy | 40 SP | P1 | 0 drops em deploy |

## 9.3 2027

| Item | Esforço | Prioridade | Métricas |
|------|---------|------------|----------|
| Multi-region deployment | 150 SP | P0 | Failover < 60s |
| Disaster recovery automatizado | 80 SP | P0 | RTO < 4h, RPO < 15min |
| Performance: p95 < 200ms global | 100 SP | P0 | p95 monitorado |
| Zero-downtime deploys | 60 SP | P1 | 0 incidentes em deploy |
| Service mesh (Istio/Linkerd) | 100 SP | P2 | Observabilidade ms |
| Feature flags system | 40 SP | P1 | 100% features flag |
| Database sharding | 200 SP | P2 | 10x scale |

## 9.4 2028

| Item | Esforço | Prioridade | Métricas |
|------|---------|------------|----------|
| Service mesh (Istio/Linkerd) | 150 SP | P1 | mTLS entre serviços |
| Políticas zero-trust | 80 SP | P0 | Zero breach |
| Compliance automation (SOC2, ISO) | 100 SP | P0 | Certificações |
| FinOps (controle de custos cloud) | 60 SP | P1 | Custo por cliente < R$ 50/mês |
| Self-service infra (Terraform) | 80 SP | P2 | Provisionamento < 1h |
| Data warehouse (Snowflake/BigQuery) | 120 SP | P1 | BI queries < 5s |

## 9.5 2029

| Item | Esforço | Prioridade | Métricas |
|------|---------|------------|----------|
| Multi-cloud (AWS + GCP) | 200 SP | P1 | Vendor lock-in mitigado |
| Edge computing | 100 SP | P2 | Latência < 50ms global |
| AI infrastructure própria | 150 SP | P1 | Custo IA -50% |
| Observabilidade 2.0 (eBPF) | 80 SP | P2 | Overhead < 1% |
| Compliance SEC/CVM | 100 SP | P0 | IPO ready |

---

# Capítulo 10 — Tech Debt Roadmap

Tech debt é inevitável em startup de crescimento rápido. A estratégia é **reservar 20% da capacidade de cada sprint para tech debt** e ter um roadmap explícito de pagamento.

## 10.1 Tech Debt Identificado (Q4 2025)

| ID | Descrição | Severidade | Esforço | Prazo |
|----|-----------|------------|---------|-------|
| TD-001 | Auth usa NextAuth; migrar para solução própria para suportar refresh token rotation | Alta | 60 SP | Q1 2026 |
| TD-002 | Sem particionamento em `results` (table scan em relatórios mensais) | Alta | 80 SP | Q1 2026 |
| TD-003 | Cache de ranking expira em 60s, deveria ser event-driven | Média | 30 SP | Q2 2026 |
| TD-004 | Sem rate limiting em API pública | Alta | 20 SP | Q1 2026 |
| TD-005 | Cobertura de testes em módulo de IA é 50% (meta 80%) | Média | 40 SP | Q2 2026 |
| TD-006 | Console.log em produção em 12 arquivos | Baixa | 8 SP | Q1 2026 |
| TD-007 | Sem migrations online (deploy causa downtime de 30s) | Alta | 60 SP | Q2 2026 |
| TD-008 | Storybook desatualizado (30% componentes sem stories) | Baixa | 20 SP | Q2 2026 |
| TD-009 | Sem ADRs para decisões de v1.0 (retroativo) | Média | 15 SP | Q1 2026 |
| TD-010 | Bulkhead ausente (uma empresa grande pode degradar serviço) | Alta | 50 SP | Q2 2026 |

## 10.2 Tech Debt Planejado por Versão

### v2.0 (2026)
- Migrar auth para solução própria com refresh rotation (TD-001)
- Particionar tabela `results` por mês (TD-002)
- Cache event-driven para ranking (TD-003)
- Rate limiting API pública (TD-004)
- Migrations online (TD-007)
- Bulkhead por tenant (TD-010)

### v3.0 (2027)
- Migrar para microsserviços seletivamente (auth, notifications, IA)
- Implementar event sourcing em `results` e `rankings`
- Data warehouse separado para BI (não consultar OLTP)
- Service mesh para observabilidade

### v4.0 (2028)
- Multi-region active-active
- Database sharding por tenant (enterprise)
- Substituir monolito Next.js API por serviços dedicados onde fizer sentido
- Infraestrutura como código 100% (Terraform)

### v5.0 (2029)
- Multi-cloud (reduz vendor lock-in)
- Edge computing para latência global
- AI infrastructure própria (reduz custo OpenAI)
- Observabilidade 2.0 com eBPF

## 10.3 Processo de Gestão de Tech Debt

1. **Identificação:** qualquer dev pode criar um TD no Linear com label `tech-debt`
2. **Triagem:** tech lead avalia severidade (Alta/Média/Baixa) quinzenalmente
3. **Planejamento:** TDs de severidade Alta entram automaticamente na próxima sprint
4. **Execução:** 20% da capacidade de cada sprint é reservada para TD
5. **Acompanhamento:** dashboard de TD aberto vs fechado revisado mensalmente

## 10.4 Métricas de Tech Debt

| Métrica | Alvo | Como Medir |
|---------|------|------------|
| TDs Alta severidade abertos | < 5 | Linear filter |
| TDs Média severidade abertos | < 15 | Linear filter |
| Idade média de TD Alta | < 60 dias | Linear |
| % capacidade sprint para TD | 20% | Sprint planning |
| Cobertura de testes | > 80% | Vitest |
| Complexidade ciclomática média | < 8 | ESLint plugin |
| Duplicação de código | < 3% | SonarQube |

---

# Capítulo 11 — Migration Paths Entre Versões

Cada versão maior (v1.0 → v2.0 → ...) envolve breaking changes que precisam de migração cuidadosa para clientes existentes.

## 11.1 Princípios de Migration

1. **Backward compatibility:** nova versão deve funcionar com dados antigos
2. **Progressive rollout:** 5% → 25% → 50% → 100% dos clientes
3. **Automatic migration:** cliente não precisa fazer nada (sistema migra automaticamente)
4. **Rollback capability:** se algo quebrar, voltar em < 5min
5. **Communication:** clientes notificados 30 dias antes, com changelog
6. **Beta program:** clientes voluntários testam antes do rollout geral

## 11.2 v1.0 → v2.0 Migration

### Breaking Changes

- Auth: troca de NextAuth para solução própria — requer re-login de todos os usuários
- Schema: tabela `results` particionada — migração online em janelas de baixo tráfego
- API: versãoamento `/api/v1/` mantido, `/api/v2/` para novos endpoints

### Plano de Migration

```
T-30 dias: Comunicado aos clientes (email + in-app)
T-15 dias: Beta program aberto (voluntários)
T-7 dias:  5% dos clientes migrados (canary)
T-3 dias:  25% migrados
T-1 dia:   50% migrados
T+0:       100% migrados
T+7 dias:  Encerramento v1.0 (end of life)
```

### Script de Migration

```typescript
// scripts/migrate-v1-to-v2.ts
import { prisma } from '@/lib/prisma';

async function migrateTenant(companyId: number) {
  console.log(`Migrating company ${companyId}...`);
  
  // 1. Backup
  await backupTenant(companyId);
  
  // 2. Migrate auth (force re-login)
  await prisma.session.deleteMany({ where: { companyId } });
  await prisma.refreshToken.deleteMany({ where: { companyId } });
  
  // 3. Partition results (online)
  await partitionResultsTable(companyId);
  
  // 4. Update settings
  await prisma.systemSettings.updateMany({
    where: { companyId },
    data: { version: '2.0.0' },
  });
  
  console.log(`Company ${companyId} migrated successfully`);
}

async function main() {
  const companies = await prisma.company.findMany({ where: { active: true }});
  for (const company of companies) {
    try {
      await migrateTenant(company.id);
    } catch (err) {
      console.error(`Failed to migrate ${company.id}:`, err);
      await rollbackTenant(company.id);
    }
  }
}

main();
```

## 11.3 v2.0 → v3.0 Migration

### Breaking Changes

- Mobile apps nativos substituem PWA (PWA ainda funciona, mas deprecated)
- BI requer data warehouse separado (migração de dados históricos)
- API v1 deprecated (mantida por 12 meses, depois removida)

### Plano

- 6 meses de overlap (v2 e v3 simultâneos)
- Migração assistida (CSM acompanha cada cliente enterprise)
- Self-migration para clientes self-service

## 11.4 v3.0 → v4.0 Migration

### Breaking Changes

- Multi-moeda requer configuração por empresa
- SSO requer setup admin (opcional, mas recomendado)
- Compliance SOC2 requer aceites de termos

## 11.5 v4.0 → v5.0 Migration

### Breaking Changes

- Expansão vertical: clientes podem optar por vertical específica
- Analytics Network: opt-in explícito (LGPD)
- IPO ready: sem breaking change técnico, mas mudanças de governança

---

# Capítulo 12 — Beta Program Structure

## 12.1 Objetivo

Validar features com clientes reais antes do rollout geral, coletar feedback estruturado, identificar bugs em ambiente real.

## 12.2 Estrutura

### Tiers de Beta

| Tier | Descrição | Acesso | Compromisso |
|------|-----------|--------|-------------|
| **Alpha** | Interno + 3-5 clientes próximos | Features em desenvolvimento | Feedback semanal |
| **Closed Beta** | 20-50 clientes voluntários | Feature completa, em staging | Feedback quinzenal |
| **Open Beta** | Qualquer cliente pode optar | Feature em produção, com flag | Feedback opcional |
| **GA** (General Availability) | Todos os clientes | Feature estável | Suporte normal |

### Critérios para Promoção de Tier

| Transição | Critérios |
|-----------|-----------|
| Alpha → Closed Beta | 0 bugs P0, 90% testes passando, CSAT alpha > 70% |
| Closed Beta → Open Beta | 0 bugs P0/P1, CSAT > 80%, 20+ clientes testaram |
| Open Beta → GA | 0 bugs P0/P1/P2, CSAT > 85%, 100+ clientes, 30 dias estável |

## 12.3 Processo de Beta Program

### Recrutamento

1. **Email para base:** "Seja o primeiro a testar X"
2. **In-app:** banner para clientes elegíveis
3. **Segmentação:** features específicas para segmentos específicos
4. **Incentivo:** desconto de 10% por 3 meses para participantes ativos

### Onboarding Beta

```
1. Cliente aceita termo de beta (riscos, suporte limitado)
2. Feature flag ativada para a empresa
3. CSM agenda call de onboarding (30min)
4. Documentação específica enviada
5. Canal Slack exclusivo #orion-beta-X criado
6. Check-in semanal do CSM
```

### Coleta de Feedback

- **In-app feedback widget:** "Como avalia esta feature?" (1-5 estrelas + comentário)
- **Survey NPS da feature:** após 30 dias de uso
- **Entrevistas qualitativas:** 5 clientes por mês, 30min cada
- **Telemetria:** uso real (queries, ações, fluxos)
- **Bugs reportados:** via Sentry + Linear

### Decisão de GA

Após 30 dias em Open Beta com:
- ✅ CSAT > 85%
- ✅ 0 bugs P0/P1 abertos
- ✅ 100+ clientes ativos usando
- ✅ NPS da feature > 50

→ Promover para GA (remover feature flag).

Se não bater metas:
- ❌ Iterar com base no feedback
- ❌ Adicionar mais 30 dias de beta
- ❌ Em último caso, descontinuar feature

## 12.4 Cases de Beta Program

### Beta IA Básico (Q1 2026)

- 15 clientes alpha (3 meses)
- 30 clientes closed beta (2 meses)
- 80 clientes open beta (1 mês)
- Resultado: 4 bugs P1 capturados, 12 melhorias de UX, GA em 6 meses

### Beta Marketplace (Q2 2026)

- 5 plugins oficiais em alpha interno (2 meses)
- 20 desenvolvedores terceiros convidados (closed beta)
- 100 empresas open beta (1 mês)
- Resultado: 3 plugins adicionais criados pela comunidade antes do GA

---

# Capítulo 13 — Customer Feedback Loop

## 13.1 Fontes de Feedback

| Fonte | Frequência | Volume | Tipo |
|-------|------------|--------|------|
| NPS survey | Trimestral | ~80% response | Quantitativo |
| In-app feedback widget | Contínuo | ~5% dos usuários | Quantitativo + qualitativo |
| Entrevistas com clientes | Mensal | 10 clientes | Qualitativo profundo |
| Tickets de suporte | Contínuo | ~50/semana | Issues específicas |
- Customer Success Manager calls | Semanal | 20 clientes top | Estratégico |
| Sales lost/gained analysis | Mensal | 10 perdas + 10 ganhos | Competitivo |
- Beta program feedback | Por feature | Variável | Específico |
| Social media (LinkedIn, Twitter) | Contínuo | Baixo | Marke-aware |
| Reviews (G2, Capterra) | Contínuo | ~2/mês | Público |
| Churn interviews | Por churn | 100% dos churns | Crítico |

## 13.2 Processo de Feedback Loop

```
1. Coleta (múltiplas fontes)
2. Triagem (PM + CSM + Support lead, semanal)
3. Categorização (bug, feature request, improvement, complaint)
4. Priorização (RICE scoring)
5. Planejamento (sprint planning, quarterly)
6. Implementação
7. Comunicação ("você pediu, nós fizemos")
8. Medição de impacto (uso da feature, NPS delta)
```

## 13.3 Ferramentas

- **Linear:** bugs e feature requests
- **Productboard:** product feedback aggregation
- **Vitally:** customer health + NPS
- **Slack:** canais `#feedback` e `#feature-requests`
- **Notion:** entrevistas e notes de calls
- **Zoom:** gravações de entrevistas (com transcrição)

## 13.4 Comunicação "You Asked, We Built"

Toda feature implementada baseada em feedback deve ser comunicada:

1. **Email para quem pediu:** "Você pediu X em [data], está pronto!"
2. **Release notes:** destacar "Baseado em feedback de N clientes"
3. **In-app notification:** banner na primeira vez que abre
4. **Blog post:** para features maiores
5. **Social media:** para features de destaque

## 13.5 Métricas de Feedback Loop

| Métrica | Alvo | Como Medir |
|---------|------|------------|
| Time to acknowledge feedback | < 48h | Linear |
| Time to resolve feature request | < 90 dias (média) | Linear |
| % features vindas de feedback | > 60% | Sprint planning |
| NPS de feature recém-lançada | > 50 | Survey |
| CSAT suporte | > 90% | Por ticket |
| % clientes que sentem "ouvem" | > 70% | Survey anual |

---

# Capítulo 14 — Competitive Monitoring

## 14.1 Competidores Diretos

| Competidor | Mercado | Forças | Fraquezas | Diferencial Orion |
|------------|---------|--------|-----------|-------------------|
| Movdesk | Brasil, gestão comercial | Bom produto, base estabelecida | UX datada, sem IA | UX moderna + IA |
| Salesforce Sales Cloud | Global | Brand, ecossistema | Caro, complexo | Acessível + simples |
| Pipedrive | Global PMEs | Simples, barato | Pouco customizável | Customizável + LATAM |
| HubSpot Sales Hub | Global | Marketing integrado | Caro em escala | Pricing justo |
| RD Station Sales | Brasil | Marketing integrado, brand | Foco marketing não vendas | Foco puro em vendas |
| Meetime | Brasil | Inside sales bom | Escala limitada | Multi-canal |
| Agendor | Brasil PMEs | Simples, app mobile bom | Sem IA, sem BI | IA + BI |

## 14.2 Competidores Indiretos

- **ERPs com módulo comercial:** Totvs, SAP B1, Sankhya
- **Planilhas:** Excel, Google Sheets (fase inicial do cliente)
- **CRMs genéricos:** Zoho, Insightly
- **Ferramentas de gamificação:** Gametize, Centrical

## 14.3 Monitoramento Contínuo

### Fontes

| Fonte | Frequência | Insight |
|-------|------------|---------|
| Site do competidor | Mensal | Novidades, pricing |
| Blog / changelog | Semanal | Roadmap inferido |
| Reviews (G2, Capterra) | Quinzenal | Pontos fortes/fracos |
- LinkedIn (empleados) | Diário | Contratações, expansão |
| Customer interviews | Mensal | Por que ganhamos/perdemos |
| Win/loss analysis | Mensal | Competidores citados |
| Google Alerts | Diário | Notícias, anúncios |
| App Store / Play Store | Mensal | Reviews de apps mobile |
| SEO tools (Ahrefs, SEMrush) | Mensal | Tráfego, keywords |

### Processo

1. **Coleta quinzenal:** PM responsável atualizaNotion de competitive intel
2. **Análise mensal:** time de produto revisa, identifica padrões
3. **Reunião trimestral:** leadership review, ajusta roadmap
4. **Comunicação:** newsletter interna `#orion-competitive`

## 14.4 Framework de Resposta Competitiva

Quando competidor lança feature relevante:

| Avaliar | Decisão |
|---------|---------|
| É diferencial competitivo? | Sim → Acelerar no roadmap |
| Tabela stakes | Não → Ignorar (não correr atrás) |
| Tem impacto em vendas? | Sim → Comunicar para sales (objection handling) |
| Pode ser commodity? | Sim → Planejar feature equivalente em 6 meses |

## 14.5 Diferenciais Sustentáveis (Moat)

1. **Network effects:** marketplace de plugins (mais plugins → mais clientes → mais plugins)
2. **Switching costs:** dados históricos, integrações configuradas, treinamento
3. **Economies of scale:** custos de IA e infra diminuem por cliente
4. **Brand:** Orion como referência em gestão comercial LATAM
5. **Patents/IP:** algoritmos de ranking e IA patenteados (quando aplicável)
6. **Data:** Analytics Network gera insights exclusivos

---

# Capítulo 15 — Market Analysis por Ano

## 15.1 2025 — Brasil PMEs

### Mercado Endereçável (TAM)

- 19 milhões de PMEs no Brasil (SEBRAE)
- 4 milhões com equipe comercial estruturada (5+ vendedores)
- 1,5 milhão com potencial de usar gestão comercial
- **TAM:** 1.500.000 empresas × R$ 800/mês = R$ 14.4B/ano

### Mercado Atendível (SAM)

- PMEs com faturamento R$ 1M-50M/ano
- Equipe comercial 5-50 vendedores
- Digital mature (usam softwares)
- **SAM:** 200.000 empresas × R$ 1.200/mês = R$ 2.88B/ano

### Mercado Alvo (SOM) — 5 anos

- 30.000 clientes (v5.0)
- **SOM:** R$ 288M/ano (10% do SAM)

### Tendências 2025

- IA generativa mainstream (ChatGPT desde 2023)
- LGPD compliance virou prioridade
- Mobile-first virou default
- Cloud aceito até por setores conservadores
- Pix consolidado (integração futura)

## 15.2 2026 — Brasil + canais

### Expansão

- Canais: revendas, consultorias, contadores
- Parcerias: SEBRAE, Sebraetec, Apex-Brasil
- Segmentos varejo, serviços, indústria inicial

### Tendências 2026

- IA agents autônomos
- Embedded finance
- Voice commerce
- Realidade aumentada em vendas (nicho)

## 15.3 2027 — LATAM inicial (Argentina)

### Mercado Argentino

- 600k PMEs
- Inflação torna pricing complexo (USD)
- Cultura próxima ao Brasil
- **SAM AR:** 50.000 empresas × USD 100/mês = USD 60M/ano

### Tendências 2027

- IA multimodal
- Edge AI
- Web3 em nichos
- Regulação IA (UE AI Act influência LATAM)

## 15.4 2028 — LATAM completo

### Mercados Adicionais

- México: 4M PMEs, SAM USD 400M/ano
- Chile: 800k PMEs, SAM USD 80M/ano
- Colômbia: 1.5M PMEs, SAM USD 150M/ano
- Peru: 1M PMEs, SAM USD 80M/ano

### Tendências 2028

- IA regulada globalmente
- Quantum computing em nichos
- Sustainability reporting obrigatório

## 15.5 2029 — Plataforma consolidada

### Posicionamento

- Líder em gestão comercial LATAM
- Expansão vertical (Saúde, Varejo, Indústria, Serviços)
- Ecossistema de marketplace robusto
- IPO ready

### Tendências 2029

- IA generativa virou commodity
- Edge computing mainstream
- Realidade virtual em vendas (early adopters)
- Web4 / Spatial computing

---

# Capítulo 16 — Hiring Plan por Ano

## 16.1 Visão Geral

| Ano | Headcount Início | Headcount Fim | Contratações | Churn Estimado |
|-----|------------------|---------------|--------------|----------------|
| 2025 | 5 | 12 | 7 | 0 |
| 2026 | 12 | 22 | 10 | 2 |
| 2027 | 22 | 50 | 28 | 5 |
| 2028 | 50 | 87 | 37 | 8 |
| 2029 | 87 | 210 | 123 | 15 |

## 16.2 Plano Detalhado por Ano

### 2025 — Time Fundacional

| Cargo | Q1 | Q2 | Q3 | Q4 | Total |
|-------|----|----|----|----|----|
| Tech Lead | 1 | — | — | — | 1 |
| Dev Backend Sênior | — | 1 | — | — | 1 |
| Dev Frontend Sênior | — | 1 | — | — | 1 |
| Dev Full-stack Pleno | — | — | 1 | 1 | 2 |
| Designer UX/UI | — | — | 1 | — | 1 |
| QA Engineer | — | — | — | 1 | 1 |
| DevOps | — | — | — | 1 | 1 |
| Product Manager | — | — | 1 | — | 1 |
| Customer Success | — | — | — | 1 | 1 |

### 2026 — Expansão V2.0

| Cargo | Q1 | Q2 | Q3 | Q4 | Total |
|-------|----|----|----|----|----|
| Engenheiro de IA | 1 | — | — | — | 1 |
| Dev Backend Sênior | — | 1 | — | — | 1 |
| Dev Frontend Pleno | — | 1 | — | — | 1 |
| Dev Mobile | — | — | 1 | — | 1 |
| Product Designer | — | 1 | — | — | 1 |
| Customer Success | — | 1 | 1 | — | 2 |
| Sales Rep | — | — | 1 | 1 | 2 |
| Marketing | — | — | — | 1 | 1 |

### 2027 — Scale-up V3.0

| Cargo | Q1 | Q2 | Q3 | Q4 | Total |
|-------|----|----|----|----|----|
| Dev Mobile Sênior | 1 | 1 | — | — | 2 |
| Dev BI/Data | 1 | 1 | — | — | 2 |
| Dev Backend Sênior | — | 1 | 1 | — | 2 |
| Data Scientist | 1 | — | — | — | 1 |
| DevOps Sênior | — | 1 | — | — | 1 |
| Product Manager | — | 1 | — | — | 1 |
| Product Designer | — | 1 | 1 | — | 2 |
| Customer Success | 1 | 1 | 1 | 1 | 4 |
| Sales Rep | 1 | 1 | 1 | 1 | 4 |
| Marketing | — | 1 | 1 | — | 2 |
| Suporte N1/N2 | — | 1 | 1 | 1 | 3 (revisado para 4) |
| Financeiro/Admin | — | — | 1 | 1 | 2 |

### 2028 — Internacional V4.0

| Cargo | Q1 | Q2 | Q3 | Q4 | Total |
|-------|----|----|----|----|----|
| Dev Backend Sênior | 1 | 1 | 1 | 1 | 4 |
| Dev Frontend Sênior | 1 | 1 | 1 | — | 3 |
| Dev Mobile | — | 1 | 1 | — | 2 |
| DevOps/SRE | 1 | 1 | — | — | 2 |
| Security Engineer | 1 | — | — | — | 1 |
| Data Scientist | 1 | 1 | — | — | 2 |
| Product Manager | 1 | 1 | — | — | 2 |
| Product Designer | 1 | 1 | — | — | 2 |
| Customer Success | 2 | 1 | 2 | 1 | 6 |
| Sales (internacional) | 1 | 1 | 1 | 1 | 4 |
| Marketing (internacional) | 1 | 1 | — | — | 2 |
| Suporte (multi-idioma) | 2 | 1 | 2 | 1 | 6 |
| Legal/Compliance | 1 | — | — | — | 1 |

### 2029 — Plataforma V5.0

| Cargo | Total |
|-------|----|
| Engenharia | 80 (40 backend, 25 frontend, 10 mobile, 5 devops) |
| Produto | 20 (10 PMs, 10 designers) |
| Data/IA | 15 |
| Sales | 30 |
| Customer Success | 25 |
| Suporte | 15 |
| Marketing | 10 |
| G&A | 15 |
| **Total** | **210** |

## 16.3 Estratégia de Contratação

### Fontes

| Fonte | % esperado | Custo médio |
|-------|------------|-------------|
| Referral interno | 40% | R$ 5k bounty |
| LinkedIn Recruiter | 25% | R$ 8k/seat/mês |
| Portais (Gupy, LinkedIn Jobs) | 15% | R$ 500/vaga |
| Comunidades (Discord, meetups) | 10% | Tempo |
| Headhunter (sênior/especialista) | 5% | 20% salário anual |
- Universities (estágios) | 5% | Tempo + baixo salário |

### Tempo Médio de Contratação

| Cargo | Tempo Médio |
|-------|-------------|
| Dev Júnior | 30 dias |
| Dev Pleno | 45 dias |
| Dev Sênior | 60 dias |
| Tech Lead / Especialista | 90 dias |
| Sales / CS | 30 dias |
| G&A | 45 dias |

### Critérios de Seleção

**Cultura:** Add value, ownership bias, customer obsession, growth mindset, collaboration
**Técnico (devs):** código limpo, testes, padrões, systems thinking
**Comportamental:** comunicação, resilência, adaptabilidade

## 16.4 Onboarding

Ver Documento 15 — Capítulo 16 (Onboarding 30-60-90 days).

## 16.5 Retenção

| Iniciativa | Frequência | Custo |
|------------|------------|-------|
| Review de carreira | Semestral | Tempo |
- Plano de desenvolvimento individual (PDI) | Anual | Tempo |
- 1:1 com gestor | Semanal | Tempo |
- Feedback 360 | Anual | Tempo |
- Treinamentos/cursos | Contínuo | R$ 5k/funcionário/ano |
- Conferências | Anual | R$ 10k/funcionário
- Hack days | Trimestral | 1 dia
- Sábados livres (não trabalhar) | Sempre | — |
- Health/Wellness | Contínuo | R$ 2k/ano
- Stock options (a partir de 2027) | Anual | Equity pool 10% |
- Home office flexível | Sempre | — |
- Equipamento premium | Onboarding | R$ 15k/funcionário |

**Meta churn voluntário:** < 10% ao ano (excelência: < 5%)

---

# Capítulo 17 — Budget por Ano

## 17.1 Visão Geral

| Ano | Receita | Custos | Resultado | Margem |
|-----|---------|--------|-----------|--------|
| 2025 | R$ 192.000 | R$ 2.006.400 | -R$ 1.814.400 | -944% |
| 2026 | R$ 3.990.000 | R$ 3.816.000 | +R$ 174.000 | +4% |
| 2027 | R$ 15.750.000 | R$ 9.056.000 | +R$ 6.694.000 | +43% |
| 2028 | R$ 65.250.000 | R$ 18.236.000 | +R$ 47.014.000 | +72% |
| 2029 | R$ 175.500.000 | R$ 45.000.000 | +R$ 130.500.000 | +74% |

## 17.2 Breakdown 2025 (Burn)

| Categoria | Valor Anual | % |
|-----------|-------------|---|
| Pessoal (12) | R$ 1.824.000 | 91% |
| Infraestrutura | R$ 182.400 | 9% |
| **Total** | **R$ 2.006.400** | **100%** |

### Capex (One-time)

| Item | Valor |
|------|-------|
| Setup infraestrutura | R$ 50.000 |
| Equipamentos (12 pessoas) | R$ 180.000 |
| Branding (logo, site) | R$ 50.000 |
| Marketing inicial | R$ 100.000 |
| Reserva de contingência | R$ 200.000 |
| **Total Capex** | **R$ 580.000** |

### Total 2025: R$ 2.586.400

### Funding Necessário

- Seed: R$ 3.000.000 (out 2024)
- Runway: 18 meses (até Q2 2026)
- Próxima rodada: Series A em Q1 2026

## 17.3 Breakdown 2026 (Break-even)

| Categoria | Valor Anual | % |
|-----------|-------------|---|
| Pessoal (22) | R$ 3.096.000 | 81% |
| Infraestrutura | R$ 720.000 | 19% |
| **Total** | **R$ 3.816.000** | **100%** |

### Capex 2026

| Item | Valor |
|------|-------|
| Equipamentos (10 novos) | R$ 150.000 |
- Marketing campanhas | R$ 300.000 |
- Eventos (feira, patrocínio) | R$ 100.000 |
- **Total Capex** | **R$ 550.000** |

### Lucro 2026: +R$ 174.000 (break-even em Q3)

## 17.4 Breakdown 2027 (Scale-up)

| Categoria | Valor Anual | % |
|-----------|-------------|---|
| Pessoal (50) | R$ 6.276.000 | 69% |
| Infraestrutura | R$ 2.780.000 | 31% |
| **Total** | **R$ 9.056.000** | **100%** |

### Capex 2027

| Item | Valor |
|------|-------|
- Equipamentos (28 novos) | R$ 420.000 |
- Marketing | R$ 600.000 |
- Eventos | R$ 200.000 |
- Filial Buenos Aires | R$ 150.000 |
- **Total Capex** | **R$ 1.370.000** |

### Lucro 2027: +R$ 6.694.000 (43% margem)

## 17.5 Breakdown 2028 (Internacional)

| Categoria | Valor Anual | % |
|-----------|-------------|---|
| Pessoal (87) | R$ 11.436.000 | 63% |
| Infraestrutura | R$ 6.800.000 | 37% |
| **Total** | **R$ 18.236.000** | **100%** |

### Capex 2028

| Item | Valor |
|------|-------|
- Equipamentos (37 novos) | R$ 555.000 |
- Marketing internacional | R$ 1.500.000 |
- Filiais (MX, CL, CO, PE) | R$ 800.000 |
- Compliance (SOC2, ISO) | R$ 300.000 |
- **Total Capex** | **R$ 3.155.000** |

### Lucro 2028: +R$ 47.014.000 (72% margem)

## 17.6 Breakdown 2029 (IPO Ready)

| Categoria | Valor Anual | % |
|-----------|-------------|---|
| Pessoal (210) | R$ 30.000.000 | 67% |
| Infraestrutura | R$ 15.000.000 | 33% |
| **Total** | **R$ 45.000.000** | **100%** |

### Capex 2029

| Item | Valor |
|------|-------|
- Equipamentos | R$ 1.000.000 |
- Marketing | R$ 3.000.000 |
- Compliance IPO | R$ 2.000.000 |
- Aquisições | R$ 5.000.000 |
- **Total Capex** | **R$ 11.000.000** |

### Lucro 2029: +R$ 130.500.000 (74% margem)

## 17.7 Plano de Funding

| Rodada | Data | Valor | Valuation | Uso |
|--------|------|-------|-----------|-----|
| Seed | Out 2024 | R$ 3M | R$ 15M post | MVP + primeiros clientes |
| Series A | Mar 2026 | R$ 15M | R$ 60M post | Expansão v2.0, IA, marketplace |
| Series B | Set 2027 | R$ 50M | R$ 250M post | Internacional, BI, mobile nativo |
| Series C | Mar 2029 | R$ 150M | R$ 800M post | IPO prep, aquisições |
| IPO | 2030 | R$ 500M+ | R$ 2B+ | Liquidez, expansão global |

## 17.8 Unit Economics

### CAC (Customer Acquisition Cost)

| Ano | CAC | Payback (meses) |
|-----|-----|-----------------|
| 2025 | R$ 5.000 | 8 |
| 2026 | R$ 3.500 | 4 |
| 2027 | R$ 2.500 | 2 |
| 2028 | R$ 2.000 | 1.5 |
| 2029 | R$ 1.800 | 1.2 |

### LTV (Lifetime Value)

| Ano | LTV | LTV/CAC |
|-----|-----|---------|
| 2025 | R$ 15.000 | 3× |
| 2026 | R$ 25.000 | 7× |
| 2027 | R$ 40.000 | 16× |
| 2028 | R$ 60.000 | 30× |
| 2029 | R$ 80.000 | 44× |

### ARPU (Average Revenue Per User)

| Ano | ARPU mensal |
|-----|-------------|
| 2025 | R$ 800 |
| 2026 | R$ 500 |
| 2027 | R$ 500 |
| 2028 | R$ 530 |
| 2029 | R$ 665 |

(ARPU diminui em 2026-2027 porque aumenta % de PMEs menores; cresce em 2028-2029 por upsell de IA/marketplace)

---

# Capítulo 18 — Risk Register Detalhado

## 18.1 Categorias de Risco

| Categoria | Riscos Identificados |
|-----------|---------------------|
| Produto | Bugs P0, performance, UX ruim |
| Técnico | Tech debt, scaling, security breach |
| Mercado | Competidor, mudança regulatória, desaceleração |
| Operacional | Churn de talentos, falha de vendor, processo ineficiente |
| Financeiro | Burn alto, receita abaixo do esperado, funding não fecha |
| Compliance | LGPD, ISO, SOC2, IPO |
| Estratégico | Pivot errado, M&A falha, expansão malsucedida |

## 18.2 Risk Register

| ID | Risco | Categoria | Probabilidade | Impacto | Score | Mitigação | Owner | Status |
|----|-------|-----------|---------------|---------|-------|-----------|-------|--------|
| R-001 | Concorrente lança similar mais barato | Mercado | Alta | Médio | 12 | Diferenciação via IA + marketplace; lock-in via ecossistema | CEO | Monitorando |
| R-002 | Custo de IA explode (OpenAI) | Técnico | Média | Alto | 12 | Cache agressivo, fallback para GPT-3.5, modelos open-source (Llama), próprio modelo em 2029 | CTO | Ativo |
| R-003 | LGPD multa | Compliance | Baixa | Alto | 8 | Compliance desde v1.0, DPO dedicado, auditoria anual | Legal | Ativo |
| R-004 | Key dev sai (key person risk) | Operacional | Média | Alto | 12 | Documentação rigorosa, pareamento, salary review competitivo, stock options | CTO | Ativo |
| R-005 | Cloud provider outage (AWS) | Técnico | Baixa | Alto | 8 | Multi-region, backup em provedor diferente (GCP em 2029), DR testado | DevOps | Ativo |
| R-006 | Data breach / security incident | Técnico | Baixa | Crítico | 12 | WAF, pentest anual, bug bounty, encryption at rest, MFA obrigatório | Security | Ativo |
| R-007 | Funding não fecha (Series A) | Financeiro | Média | Crítico | 16 | Pipeline de 5+ VCs, runway estendido até 18 meses, break-even sem Series A (v2.0 com receita menor) | CEO | Ativo |
| R-008 | Churn explode (>5%) | Mercado | Baixa | Crítico | 10 | NPS quarterly, CS proactive, churn interviews, fix issues rapidamente | CS | Monitorando |
| R-009 | Performance degrada com escala | Técnico | Média | Médio | 9 | Performance testing em CI, capacity planning, scalability tests mensais | CTO | Ativo |
| R-010 | Bug P0 em produção | Produto | Média | Alto | 12 | 2 approvals, testes automatizados, canary deploy, rollback em < 5min | CTO | Ativo |
| R-011 | Beta program não atrai voluntários | Produto | Baixa | Médio | 4 | Incentivos (desconto), CS indica clientes, comunicação clara | PM | Monitorando |
| R-012 | Expansão LATAM falha (cultura/produto) | Estratégico | Média | Alto | 12 | PM local contratado, parcerias de distribuição, adaptação cultural | CEO | Planejado |
| R-013 | Compliance SOC2 demora | Compliance | Média | Médio | 9 | Iniciar em 2027, consultoria especializada, automation | Legal | Planejado |
| R-014 | Marketplace não atrai devs | Mercado | Média | Alto | 12 | 5 plugins oficiais como prova de valor, hackathon, revenue share atrativo (70/30) | PM | Planejado |
| R-015 | IA gera respostas erradas/alucinação | Produto | Média | Médio | 9 | RAG com dados estruturados, prompt engineering, human-in-the-loop para ações críticas | PM IA | Ativo |
| R-016 | Refactor gigante quebra produção | Técnico | Baixa | Alto | 8 | Strangler fig pattern, feature flags, canary deploy, testes antes/depois | Tech Lead | Ativo |
| R-017 | Vendedor não adapta ao produto | Mercado | Média | Médio | 9 | Treinamento, scripts de objeção, demo personalizada | Sales | Ativo |
| R-018 | Concorrente adquire competidor | Mercado | Baixa | Alto | 8 | Diferenciação contínua, lock-in via ecossistema, M&A próprio | CEO | Monitorando |
| R-019 | Custo cloud explode com escala | Financeiro | Média | Médio | 9 | FinOps, reserved instances, multi-cloud, otimização contínua | DevOps | Ativo |
| R-020 | Funcionário descontente / cultura tóxica | Operacional | Baixa | Alto | 8 | Cultura forte, eNPS quarterly, 1:1 semanais, action plans | HR | Ativo |
| R-021 | Cliente enterprise pede feature que conflita com produto | Produto | Média | Médio | 9 | Product council, feature requests priorizadas com RICE, custom development pago | PM | Ativo |
| R-022 | API pública tem breaking change | Técnico | Baixa | Alto | 8 | Versionamento (/v1/, /v2/), deprecation policy 12 meses, communication | DevRel | Ativo |
| R-023 | PWA deprecated por browsers | Técnico | Baixa | Médio | 4 | Apps nativos (v3.0) como alternativa, monitorar W3C | CTO | Monitorando |
| R-024 | Perda de cliente enterprise (10%+ MRR) | Mercado | Baixa | Crítico | 10 | QBRs, CSM dedicado, health score, escalonamento | CS | Ativo |
| R-025 | Inflação explode custos no Brasil | Financeiro | Média | Médio | 9 | Reajuste anual, contratos em USD para enterprise, hedge | CFO | Ativo |

## 18.3 Top 5 Riscos Críticos (Score ≥ 12)

### R-007 — Funding não fecha (Series A)

- **Impacto:** Crítico (company killer)
- **Mitigação ativa:**
  1. Pipeline de 5+ VCs desde Q4 2025
  2. Manter runway de 18+ meses sempre
  3. Plano break-even sem Series A (cortar gastos em 30%, focar em lucratividade vs crescimento)
  4. Bridge loan de R$ 5M disponível (investidores atuais)
- **Owner:** CEO
- **Review:** Mensal

### R-002 — Custo de IA explode

- **Impacto:** Alto (margem comprimida, feature degradada)
- **Mitigação ativa:**
  1. Cache de respostas em Redis (hit rate alvo: 60%)
  2. Fallback para GPT-3.5-turbo quando custo > threshold
  3. Avaliação de Llama 3.1 / Mistral self-hosted (Q3 2026)
  4. Budget por empresa (limite duro mensal)
  5. Self-hosted LLM em 2029 (reduz custo em 80%)
- **Owner:** CTO
- **Review:** Quinzenal

### R-004 — Key dev sai

- **Mitigação ativa:**
  1. Stock options vesting 4 anos (cliff 1 ano)
  2. Salário acima de mercado (P75)
  3. Documentação rigorosa (ADRs, este Developer Guide)
  4. Pair programming espalha conhecimento
  5. Plano de carreira claro
  6. 1:1 semanais, eNPS quarterly
- **Owner:** CTO + HR
- **Review:** Mensal

### R-006 — Data breach

- **Mitigação ativa:**
  1. Pentest anual (terceirizado)
  2. Bug bounty program (HackerOne)
  3. WAF (Cloudflare) + DDoS protection
  4. Encryption at rest (AES-256) e in transit (TLS 1.3)
  5. MFA obrigatório para todos
  6. Least privilege access
  7. Audit logs imutáveis
  8. Incident response plan testado trimestralmente
- **Owner:** Security Lead
- **Review:** Contínuo

### R-010 — Bug P0 em produção

- **Mitigação ativa:**
  1. 2 approvals obrigatórios em todo PR
  2. Cobertura de testes > 80% em módulos críticos
  3. Canary deploy (5% → 25% → 50% → 100%)
  4. Feature flags para desligar instantaneamente
  5. Rollback em < 5min
  6. On-call rotation 24/7
  7. Post-mortem obrigatório (blameless)
- **Owner:** CTO
- **Review:** Por incidente

## 18.4 Processo de Gestão de Riscos

1. **Identificação:** qualquer funcionário pode adicionar risco ao register (Linear)
2. **Triagem:** CTO + COO revisam quinzenalmente novos riscos
3. **Avaliação:** probabilidade × impacto = score (1-25)
4. **Mitigação:** todo risco score ≥ 9 tem plano de mitigação documentado
5. **Monitoramento:** revisão mensal de todos os riscos ativos
6. **Comunicação:** top 10 riscos compartilhados em board meeting trimestral
7. **Encerramento:** risco pode ser fechado quando mitigação implementada OU probabilidade diminui

---

# Capítulo 19 — Decision Framework

## 19.1 RICE (Reach, Impact, Confidence, Effort)

Toda feature candidata é avaliada:

- **R**each: quantos usuários impacta (por trimestre)
- **I**mpact: magnitude do impacto (3=muito, 2=médio, 1=baixo, 0.5=mínimo)
- **C**onfidence: confiança na estimativa (100%, 80%, 50%)
- **E**ffort: meses-pessoa necessários

**Score = (R × I × C) / E**

### Exemplo Prático

| Feature | Reach | Impact | Confidence | Effort | Score |
|---------|-------|--------|------------|--------|-------|
| IA sugerir metas | 1000 | 3 | 80% | 2 | 1200 |
| App nativo iOS | 500 | 3 | 80% | 4 | 300 |
| Dark mode | 5000 | 1 | 100% | 0.5 | 1000 |
| Multi-moeda | 200 | 2 | 80% | 1.5 | 213 |
| BI cubos OLAP | 300 | 3 | 50% | 6 | 75 |

Priorizar por score descendente.

## 19.2 MoSCoW (Must, Should, Could, Won't)

Para cada release:

- **Must:** obrigatório, sem isto não lança
- **Should:** importante, mas pode esperar uma release
- **Could:** nice to have, se sobrar tempo
- **Won't:** explicitamente fora do escopo desta release

### Exemplo v1.0

- **Must:** Auth, Empresas, Usuários, Indicadores, Metas, Resultados, Ranking, Dashboard, Campanhas, Auditoria, Licenciamento
- **Should:** Backup, Atualizações, PWA, Painel admin
- **Could:** Tema customizado por empresa, multi-idioma parcial
- **Won't:** IA, Marketplace, Apps nativos, BI

## 19.3 Kano Model

Classifica features por tipo de necessidade:

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| **Must-be** (básicas) | Ausência causa insatisfação; presença não causa satisfação | Login, CRUD básico, segurança |
| **One-dimensional** (performance) | Mais é melhor | Velocidade, número de integrações |
| **Attractive** (excitement) | Surpreende; ausência não frustra | IA insights, ranking em tempo real |
| **Indifferent** | Não importa | Features que ninguém usa |
| **Reverse** | Mais é pior | Anúncios no app |

### Mapeamento Orion

| Feature | Tipo Kano |
|---------|-----------|
| Login | Must-be |
| Multi-tenant | Must-be |
| Auditoria | Must-be |
| Velocidade API | One-dimensional |
| Número de integrações | One-dimensional |
| IA sugerir metas | Attractive |
| Gamificação | Attractive |
| Analytics Network | Attractive |
| Anúncios | Reverse (não faremos) |

### Estratégia

- **Must-be:** sempre ter, sem nunca falhar
- **One-dimensional:** investir continuamente para melhorar
- **Attractive:** 1-2 por release, para encantar
- **Indifferent:** cortar do roadmap
- **Reverse:** nunca fazer

## 19.4 Processo de Decisão Combinado

```
1. Brainstorm features (qualquer um pode propor)
2. Score RICE para cada uma
3. Categorizar MoSCoW baseado em estratégia e timing
4. Classificar Kano para balancear (não só Must-be)
5. Mix final: 60% Must/Should (RICE alto) + 30% Could (Kano Attractive) + 10% Won't explícito
6. Validate com 5 clientes (entrevistas)
7. Ajustar com base no feedback
8. Planejar nas sprints
```

## 19.5 Critérios de Go/No-Go

Antes de iniciar uma feature:

| Critério | Pergunta | Required |
|----------|----------|----------|
| Estratégia | Está alinhada com visão 5 anos? | Sim |
| Demanda | Tem 5+ clientes pedindo? | Sim |
| Viabilidade técnica | Sabe como fazer? | Sim |
| Recursos | Tem devs disponíveis? | Sim |
| ROI | LTV/CAC > 3× ou churn reduz? | Sim |
| Risco | Pode quebrar algo crítico? | Não |
| Compliance | Atravessa LGPD? | Não |
- Suporte | Consegue treinar CS/suporte? | Sim |
| Manutenção | Consegue manter pós-launch? | Sim |
| Documentação | Consegue documentar? | Sim |

Se todos "Sim/Não": **GO**. Qualquer "Não": **No-Go** ou **Defer**.

---

# Capítulo 20 — Processo de Planejamento

## 20.1 Cadência

- **Planejamento trimestral:** define escopo do próximo quarter (1 dia, todo time)
- **Sprint bisemanal:** execução (kickoff + planning)
- **Review mensal:** ajustes baseados em métricas (2h, leadership)
- **Retrospectiva bisemanal:** melhoria contínua (1h, squad)
- **All-hands mensal:** alinhamento geral (1h, empresa)
- **Board meeting trimestral:** investidores (2h, board)

## 20.2 Inputs para Roadmap

- Feedback de clientes (NPS, entrevistas, suporte)
- Métricas de uso (telemetria)
- Análise competitiva
- Visão estratégica da liderança
- Tendências de mercado
- Tech debt prioritário
- Capacidade da equipe

## 20.3 Output Esperado por Trimestre

1. **OKRs do trimestre** (3-5 objetivos, 2-4 KRs cada)
2. **Roadmap detalhado** (features por sprint)
3. **Plano de capacity** (devs × sprints)
4. **Plano de contratação** (se necessário)
5. **Plano de budget** (ajustes se necessário)
6. **Riscos atualizados** (risk register review)

---

# Capítulo 21 — Quarterly OKRs

## 21.1 Q4 2025 (Lançamento v1.0)

### Objetivo 1: Lançar v1.0 com qualidade excepcional

- KR1: 100 clientes pagantes até 31/12
- KR2: NPS > 40
- KR3: 0 bugs P0 em produção
- KR4: Cobertura de testes > 70%

### Objetivo 2: Estabelecer operações de cliente

- KR1: Tempo médio de implantação < 2 dias
- KR2: CSAT suporte > 90%
- KR3: 10 runbooks de incidente documentados
- KR4: Onboarding automatizado (wizard)

### Objetivo 3: Preparar v2.0

- KR1: Tech debt Alta severidade fechado (TD-001, TD-002, TD-004)
- KR2: Protótipo IA funcional
- KR3: 5 parceiros implementadores treinados
- KR4: Pipeline Series A com 5+ VCs

## 21.2 Q1 2026 (IA + Marketplace Prep)

### Objetivo 1: IA Básico em GA

- KR1: 100k queries IA/mês
- KR2: CSAT IA > 75%
- KR3: Custo por query < R$ 0,15
- KR4: 60% das empresas ativas usam IA

### Objetivo 2: Marketplace Beta

- KR1: API pública documentada (OpenAPI)
- KR2: 3 SDKs (JS, Python, PHP)
- KR3: 5 plugins oficiais em produção
- KR4: 20 devs externos no beta program

### Objetivo 3: Série A fechada

- KR1: Term sheet assinado
- KR2: Due diligence completa
- KR3: R$ 15M captados
- KR4: Runway estendido para 24 meses

## 21.3 Q2 2026 (Marketplace GA + Scale)

### Objetivo 1: Marketplace GA

- KR1: 20+ plugins publicados
- KR2: 30% das empresas instalam ao menos 1 plugin
- KR3: Revenue share operacional
- KR4: 100+ devs ativos

### Objetivo 2: Scale comercial

- KR1: 400 clientes ativos
- KR2: MRR R$ 320.000
- KR3: CAC < R$ 3.500
- KR4: LTV/CAC > 7×

### Objetivo 3: Performance

- KR1: p95 API < 300ms
- KR2: Uptime > 99.9%
- KR3: 0 incidentes P0
- KR4: Cobertura de testes > 80%

## 21.4 Padrão de OKR por Quarter

Cada quarter tem:

- **3 objetivos** (máximo 5)
- **3-4 KRs por objetivo** (máximo 5)
- **1 owner por objetivo** (liderança)
- **1 owner por KR** (executor)
- **Check-in semanal** (15min, time de owners)
- **Review no fim do quarter** (score 0.0-1.0)

### Score de KR

- 0.0 — Não alcançado (0% do alvo)
- 0.3 — Parcialmente (50% do alvo)
- 0.7 — Quase (70-90%)
- 1.0 — Alcançado (100%)
- 1.0+ — Excedeu (>100%)

**Meta average:** 0.7 (70%). Se sempre 1.0, é porque objetivos foram conservadores demais.

---

# Capítulo 22 — Comunicação do Roadmap

## 22.1 Públicos

| Público | Nível de Detalhe | Canal | Frequência |
|---------|------------------|-------|------------|
| Clientes enterprise | Roadmap completo (12 meses) | Reuniões QBR | Trimestral |
| Clientes self-service | Próximas 3 features | Email mensal + in-app | Mensal |
| Investidores | Roadmap completo + financeiro | Board meetings | Trimestral |
| Time interno | Roadmap completo | All-hands + Notion | Mensal |
| Público geral | High-level | Blog posts | Trimestral |
| Parceiros | Roadmap + integrações | Partner portal | Trimestral |
| Imprensa | Releases principais | Press releases | Por release |

## 22.2 Disclaimer Padrão

> "Este roadmap apresenta nossa visão atual e está sujeito a mudanças baseadas em feedback de clientes, evolução do mercado e capacidade da equipe. Datas e features específicas não constituem compromisso formal."

## 22.3 Templates de Comunicação

### Email Mensal para Clientes Self-Service

```markdown
Assunto: Novidades Orion — [Mês/Ano]

Olá, [Nome]!

Novidades deste mês no Orion:

🚀 Lançado: [Feature 1]
- Descrição curta
- Como usar

🔧 Melhorias: [Feature 2, 3]
- Resumo

📅 Em breve (próximos 30 dias):
- [Feature 4]
- [Feature 5]

Quer sugerir uma feature? Responda este email!

— Time Orion
```

### QBR (Quarterly Business Review) para Enterprise

```markdown
## QBR — [Cliente] — [Trimestre]

### 1. Sumário Executivo (5min)
- ROI entregue
- Saúde da conta
- Próximos passos

### 2. Uso e Adoção (10min)
- MAU
- Features mais usadas
- Features subutilizadas

### 3. Resultados de Negócio (10min)
- Metas batidas
- Ranking melhorou?
- Campanhas executadas

### 4. Roadmap Exclusivo (15min)
- Próximas 3 features relevantes
- Features pedidas pelo cliente
- Beta programs disponíveis

### 5. Suporte e Issues (10min)
- Tickets abertos/fechados
- Bugs P0/P1
- SLA cumprido

### 6. Próximos Passos (10min)
- Action items
- Próximo QBR
```

### Blog Post Trimestral

```markdown
# Orion Q[X] [Year]: O que lançamos e o que vem aí

## Resumo do Trimestre
- [X] clientes ativos
- [Y] MRR
- [Z] features lançadas

## Destaques do Trimestre
1. [Feature 1] — descrição + impacto
2. [Feature 2] — descrição + impacto

## O Que Vem a Seguir (próximos 3 meses)
- [Feature 3]
- [Feature 4]

## Voz do Cliente
> "Quote de cliente sobre feature lançada"
> — [Nome], [Cargo] na [Empresa]

## Métricas de Saúde
- Uptime: 99.X%
- p95 latency: Xms
- NPS: X

— Time Orion
```

---

# Capítulo 23 — Métricas de Sucesso do Roadmap

## 23.1 Métricas de Produto

| Métrica | 2025 | 2026 | 2027 | 2028 | 2029 |
|---------|------|------|------|------|------|
| Clientes ativos | 100 | 1.000 | 5.000 | 15.000 | 30.000 |
| MRR | R$ 80k | R$ 500k | R$ 2.5M | R$ 8M | R$ 20M |
| NPS | 40 | 50 | 55 | 55 | 60 |
| Churn mensal | 3% | 2% | 1.5% | 1.5% | 1% |
| DAU/MAU | 35% | 40% | 45% | 45% | 50% |

## 23.2 Métricas Técnicas

| Métrica | 2025 | 2026 | 2027 | 2028 | 2029 |
|---------|------|------|------|------|------|
| Uptime | 99.5% | 99.9% | 99.95% | 99.99% | 99.99% |
| p95 API | 500ms | 300ms | 200ms | 150ms | 100ms |
| Cobertura testes | 70% | 80% | 85% | 85% | 90% |
| Bugs P0/ano | < 5 | < 3 | < 2 | < 1 | 0 |
| Deploy frequency | Semanal | Diário | Diário | Multi/dia | Multi/dia |
| MTTR | 60min | 30min | 15min | 10min | 5min |

## 23.3 Métricas Financeiras

| Métrica | 2025 | 2026 | 2027 | 2028 | 2029 |
|---------|------|------|------|------|------|
| Receita anual | R$ 192k | R$ 3.99M | R$ 15.75M | R$ 65.25M | R$ 175.5M |
| Margem | -944% | 4% | 43% | 72% | 74% |
| CAC | R$ 5k | R$ 3.5k | R$ 2.5k | R$ 2k | R$ 1.8k |
| LTV | R$ 15k | R$ 25k | R$ 40k | R$ 60k | R$ 80k |
| LTV/CAC | 3× | 7× | 16× | 30× | 44× |

## 23.4 Métricas de Pessoas

| Métrica | 2025 | 2026 | 2027 | 2028 | 2029 |
|---------|------|------|------|------|------|
| Headcount fim ano | 12 | 22 | 50 | 87 | 210 |
| eNPS | 50 | 50 | 45 | 45 | 50 |
| Voluntary churn | < 5% | < 10% | < 10% | < 10% | < 10% |
| Time to hire | 45 dias | 45 dias | 60 dias | 60 dias | 60 dias |

---

# Conclusão

O roadmap do Projeto Orion é ambicioso mas executável. A chave do sucesso está em:

1. **Foco** — não tentar fazer tudo em v1.0
2. **Validação** — cada feature testada com clientes reais antes de escalar
3. **Velocidade** — ship frequentemente, itere com base em dados
4. **Excelência técnica** — não acumular débito técnico que atrapalhe versões futuras
5. **Ecossistema** — marketplace e API criam lock-in positivo
6. **Pessoas** — time excepcional com cultura forte
7. **Disciplina financeira** — break-even em 2026, lucro em 2027+
8. **Customer obsession** — ouvir, comunicar, encantar

O Orion não é apenas um software, é uma plataforma de negócios que deve evoluir por décadas. Cada decisão hoje deve considerar impacto em 5 anos.

**Próximos passos imediatos:**
- Aprovar roadmap com board (Q3 2025)
- Comunicar para time interno (all-hands)
- Comunicar para clientes enterprise (QBRs)
- Iniciar execução Q4 2025

---

*Fim do Roadmap Estratégico — Documento 16 do Dossiê Master do Projeto Orion*
