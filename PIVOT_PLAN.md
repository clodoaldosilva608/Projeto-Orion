# PIVOT PLAN — Projeto Orion

**Data:** 2026-07-27
**Decisão:** Pivotar de "Plataforma de Gestão de Equipes Comerciais" para "Plataforma Inteligente de Desenvolvimento de Software"
**Abordagem MVP:** Equilibrada (conservadora + IA + templates + pipeline parcial)

---

## 1. Contexto da Mudança

### Antes (P0–P13)
Construímos 13 fases seguindo `docs/16_Roadmap.md` que descrevia o Orion como uma plataforma de **gestão de equipes comerciais** — com metas, indicadores, ranking, campanhas, gamificação, calendário, checklist e feedback. Isso estava alinhado com `docs/01_Product_Vision_Document.md`.

### Gatilho do Pivot
O usuário compartilhou uma consultoria estratégica que redefine o Orion como:
> "plataforma completa para criação, gerenciamento, entrega, licenciamento e evolução contínua de software, utilizando IA como parte central do processo"

A consultoria alerta que o escopo atual é "muito amplo" e recomenda focar em uma **Plataforma Inteligente de Desenvolvimento de Software** com abordagem Equilibrada.

### Decisão do Usuário (2026-07-27)
- ✅ Pivotar para Software Factory
- ✅ MVP Equilibrado (conservador + IA + templates + pipeline parcial)

---

## 2. Novo Posicionamento

### Antes
> "Plataforma de Gestão Inteligente de Equipes Comerciais"

### Depois
> "Plataforma Inteligente de Desenvolvimento de Software — gerenciamos todo o ciclo de vida do seu software, da ideia à evolução contínua, utilizando IA e uma plataforma unificada."

### Mudança de promessa
- **Antes:** "Nós gerenciamos suas equipes de vendas"
- **Depois:** "Nós gerenciamos todo o ciclo de vida do seu software"

---

## 3. Módulos Existentes — Decisão

Os módulos de "Equipes Comerciais" construídos em P0–P13 **NÃO serão removidos**. Eles serão **reorganizados como "Módulos Extras"** opcionais — úteis para clientes SaaS que também querem gerenciar suas próprias equipes de vendas.

### Módulos que PERMANECEM no núcleo (genéricos, reutilizáveis)
| Módulo | Como é reutilizado |
|---|---|
| Auth (Supabase) | Auth de clientes e equipe |
| RBAC | Permissões para workspace do cliente |
| Audit Log | Auditoria de todas as ações |
| LGPD | Conformidade (já configurada) |
| 2FA | Segurança de login |
| Email/SMTP | Notificações de projeto |
| Webhooks | Integrações externas |
| Notificações | Alertas de projeto |
| Backups | Export de dados |
| Settings | Configurações da empresa |
| Stripe | Pagamentos de projetos/assinaturas |
| Marketplace de Plugins | Plugins para a fábrica de software |
| IA Chat (básico) | Base para briefing IA |

### Módulos que viram "Módulos Extras" (opcionais, para clientes de vendas)
| Módulo | Status |
|---|---|
| Metas, Indicadores, Resultados, Ranking | Movido para "Módulos de Vendas" |
| Campanhas & Premiações | Movido para "Módulos de Vendas" |
| Gamificação | Movido para "Módulos de Vendas" |
| Calendário Comercial | Movido para "Módulos de Vendas" |
| Checklist Diário | Movido para "Módulos de Vendas" |
| Sistema de Feedback | Movido para "Módulos de Vendas" |
| Painel TV (ranking vendas) | Movido para "Módulos de Vendas" |

### Módulos NOVOS a construir (Fábrica de Software)
| Módulo | Fase |
|---|---|
| SoftwareProject (entidade central) | P14 |
| /fabrica dashboard | P14 |
| /fabrica/projetos (lista de projetos) | P14 |
| ProjectBriefing (briefing estruturado) | P14 |
| IA Briefing (gera doc a partir de input) | P15 |
| IA Geração de Documentação (PRD, arquitetura) | P15 |
| IA Sugestões de Arquitetura | P15 |
| ProjectTemplate (catálogo de templates) | P16 |
| Pipeline de Desenvolvimento (stages) | P16 |
| Workspace do Cliente | P17 |
| Licenciamento de Software | P17 |
| Distribuição/Atualizações | P17+ |

---

## 4. Plano de Execução

### P14 — Foundation (fase atual)
1. Criar este PIVOT_PLAN.md ✓
2. Reorganizar Sidebar (Fábrica primeiro, Vendas como extras)
3. Atualizar landing page com novo posicionamento
4. Schema Prisma: SoftwareProject + ProjectBriefing + ProjectTemplate + ProjectStage
5. /fabrica dashboard
6. /fabrica/projetos page

### P15 — IA Briefing & Documentação
- Form de briefing estruturado
- IA gera PRD + arquitetura inicial a partir do briefing
- IA sugere stack tecnológica
- Templates de documentação

### P16 — Templates & Pipeline
- Catálogo de templates (e-commerce, CRM, blog, dashboard, etc.)
- Pipeline visual (Briefing → Arquitetura → Dev → Test → Deploy → Manutenção)
- Atribuição de equipe a estágios

### P17 — Workspace do Cliente & Licenciamento
- Cliente acompanha projeto em tempo real
- Timeline, milestones, deliverables
- Licença de software entregue (activation key)
- Validação + expiração

### P18+ — Distribuição & Atualizações
- Deploy automático
- Update channels
- Versionamento

---

## 5. Arquitetura — Entidade Central "Projeto"

Per a consultoria:
> "Definir o domínio central 'Projeto' como entidade principal"

### Modelo SoftwareProject (novo)
```
SoftwareProject
  ├── clientId (FK → SaasClient)
  ├── briefingId (FK → ProjectBriefing)
  ├── templateId (FK → ProjectTemplate, opcional)
  ├── name, description
  ├── status: briefing | architecting | developing | testing | deploying | delivered | maintenance
  ├── stack: JSON (tecnologias escolhidas)
  ├── timeline: JSON (milestones)
  ├── team: JSON (assigned users + roles)
  ├── startDate, estimatedEndDate, deliveredAt
  ├── licenseId (FK → SoftwareLicense, após entrega)
  └── metadata
```

### Modelo ProjectBriefing (novo)
```
ProjectBriefing
  ├── projectId (FK → SoftwareProject)
  ├── clientName, clientCompany, clientContact
  ├── problemStatement
  ├── targetAudience
  ├── keyFeatures: JSON[]
  ├── successCriteria
  ├── budget, timeline
  ├── iaGeneratedDoc: TEXT (PRD gerado por IA)
  ├── iaArchitectureSuggestion: TEXT
  ├── iaStackSuggestion: JSON
  └── status: draft | ai_processing | reviewed | approved
```

### Modelo ProjectTemplate (novo)
```
ProjectTemplate
  ├── name, description, category
  ├── iconEmoji, iconColor
  ├── stackDefault: JSON
  ├── featuresDefault: JSON[]
  ├── estimatedHours
  ├── estimatedPriceCents
  ├── isActive
  └── metadata
```

### Modelo ProjectStage (novo)
```
ProjectStage
  ├── projectId (FK → SoftwareProject)
  ├── name (Briefing, Arquitetura, Desenvolvimento, etc.)
  ├── status: pending | active | completed | blocked
  ├── assignedTo: JSON (user IDs)
  ├── startDate, endDate
  ├── deliverables: JSON
  ├── notes
  └── sortOrder
```

---

## 6. Impacto na Documentação Existente

A documentação em `docs/` (29 documentos) descreve o produto ANTERIOR (Equipes Comerciais). Esses docs serão **preservados como referência histórica** mas não serão mais o guia ativo.

Novo documento mestre: `PIVOT_PLAN.md` (este arquivo) + futuros docs em `docs/v2-software-factory/`.

---

## 7. Métricas de Sucesso do Pivot

- ✅ Novo positioning claro na landing page
- ✅ /fabrica dashboard funcional com projetos reais
- ✅ Pelo menos 1 projeto de software criado via plataforma
- ✅ IA briefing gerando PRD a partir de input do cliente
- ✅ Pelo menos 3 templates reutilizáveis no catálogo
- ✅ Workspace do cliente acessível
- ✅ Licença de software entregue e validável

---

## 8. Riscos do Pivot

1. **Módulos de vendas ficam órfãos** → Mitigação: reorganizar como "Módulos Extras", não remover
2. **Mudança confunde usuários existentes** → Mitigação: manter URLs antigas funcionando
3. **Escopo do MVP ainda amplo** → Mitigação: seguir abordagem Equilibrada, não Ousada
4. **IA pode não gerar código bom o suficiente** → Mitigação: IA gera documentação e sugestões, não código final (Equilibrado)

---

**Última atualização:** 2026-07-27
**Próxima fase:** P14-B (reorganizar sidebar)
