# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 05

# MODELAGEM CONCEITUAL DO BANCO DE DADOS (DCM)

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Database Concept Model (DCM)
**Público-alvo:** Arquitetos de solução, DBAs, engenheiros de backend, analistas de negócio, product owners
**Documentos relacionados:** Doc 04 (SAD), Doc 06 (LDM), Doc 07 (Business Rules), Doc 11 (Security/LGPD)

---

## Sumário

- **Parte I — Fundações Conceituais**
  - Capítulo 1 — Objetivo e Escopo
  - Capítulo 2 — Filosofia do Banco
  - Capítulo 3 — Padrões Universais de Modelagem
  - Capítulo 4 — Personas e seu Reflexo no Modelo
  - Capítulo 5 — Diagrama ER Geral do Sistema
- **Parte II — Domínios e Entidades**
  - Capítulo 6 — Domínio CORE (Empresas, Filiais, Departamentos, Equipes)
  - Capítulo 7 — Domínio USUÁRIOS (Usuários, Cargos, Sessões, Tokens)
  - Capítulo 8 — Domínio PERMISSÕES (Roles, Permissões, Role_Permissions)
  - Capítulo 9 — Domínio INDICADORES (Indicadores, Categorias, Fórmulas)
  - Capítulo 10 — Domínio METAS (Metas, Distribuições, Ajustes)
  - Capítulo 11 — Domínio RESULTADOS (Resultados, Aprovações, Anexos)
  - Capítulo 12 — Domínio CAMPANHAS (Campanhas, Participantes, Regras, Premiações)
  - Capítulo 13 — Domínio RANKING (Rankings, Histórico de Posições)
  - Capítulo 14 — Domínio DASHBOARD (Dashboards, Widgets, Layouts)
  - Capítulo 15 — Domínio NOTIFICAÇÕES (Notificações, Templates, Filas)
  - Capítulo 16 — Domínio AUDITORIA (Audit_Logs, Audit_Log_Details)
  - Capítulo 17 — Domínio CONFIGURAÇÕES (System_Settings, Custom_Fields)
  - Capítulo 18 — Domínio IA (Conversas, Mensagens, Prompts, Modelos)
  - Capítulo 19 — Domínio LICENCIAMENTO (Licenças, Planos, Módulos)
  - Capítulo 20 — Domínio BACKUP (Backups, Restores, Retenção)
  - Capítulo 21 — Domínio API (API_Keys, Webhooks, Rate_Limits)
  - Capítulo 22 — Domínio RELATÓRIOS (Report_Templates, Report_Executions)
- **Parte III — Diagramas ER Detalhados**
  - Capítulo 23 — Diagramas por Domínio
  - Capítulo 24 — Diagrama de Relacionamentos N:N
- **Parte IV — Cenários de Uso para Validação do Modelo**
  - Capítulo 25 — Cenário A: "João lança resultado de faturamento"
  - Capítulo 26 — Cenário B: "Maria cria campanha para equipe"
  - Capítulo 27 — Cenário C: "Diretor consulta dashboard executivo"
  - Capítulo 28 — Cenário D: "Admin desativa usuário" (cascade)
- **Parte V — Considerações de Design**
  - Capítulo 29 — Por que multi-tenant com shared database?
  - Capítulo 30 — Por que soft delete em tudo?
  - Capítulo 31 — Por que versionamento em entidades críticas?
  - Capítulo 32 — Estratégia para tabela `results` (alto volume)
  - Capítulo 33 — Quando usar JSON vs colunas separadas
- **Parte VI — Estratégia e Próximos Passos**
  - Capítulo 34 — Estratégia de Crescimento
  - Capítulo 35 — Sugestões Estratégicas
  - Capítulo 36 — Mapeamento para o Documento 06 (LDM)

---

# PARTE I — FUNDAÇÕES CONCEITUAIS

# Capítulo 1 — Objetivo e Escopo

## 1.1 Objetivo

Este documento define a **modelagem conceitual** do banco de dados do Projeto Orion. Aqui estabelecemos **quais entidades** existem, **qual seu propósito de negócio**, **como se relacionam** entre si e **quais regras conceituais** governam sua existência.

Enquanto o Documento 06 (Logical Database Model) desce ao nível de SQL, tipos primitivos, índices e constraints, este Documento 05 mantém-se no **nível semântico**: a entidade "Meta" existe porque o negócio precisa expressar objetivos mensuráveis; a entidade "Resultado" existe porque o negócio precisa registrar conquistas realizadas.

## 1.2 O que este documento NÃO é

- **Não** é um script SQL — para isso ver Documento 06.
- **Não** é uma lista de regras de cálculo — para isso ver Documento 07.
- **Não** é um diagrama de classes — para isso ver Documento 04 (SAD).
- **Não** é uma especificação de API — para isso ver Documento 10.

## 1.3 Princípios de modelagem adotados

1. **Normalização 3NF com desnormalização controlada** — toda entidade é normalizada; desnormalizações só surgem em tabelas de agregação (`rankings`, `dashboards`, MViews).
2. **Multi-tenant first** — toda entidade de domínio carrega `company_id`, mesmo quando herdar de outra filha. Isso garante isolamento por tenant e prepara RLS.
3. **Soft delete universal** — nenhuma entidade é fisicamente removida em produção; `deleted_at` sinaliza exclusão lógica.
4. **Versionamento otimista** — toda entidade crítica possui `version` para conflito de concorrência.
5. **Identificação dupla** — `id` (inteiro, interno) e `uuid` (texto, público). APIs nunca expõem o `id` sequencial.
6. **Auditoria intrínseca** — toda entidade tem `created_at`, `updated_at`, `created_by`, `updated_by` populados via trigger.
7. **Extensibilidade sem migração** — toda entidade tem campo `metadata JSONB` para atributos customizados por tenant.

## 1.4 Escopo da Versão 1.0

A Versão 1.0 do Orion compreende **35 entidades conceituais** organizadas em **17 domínios**. As entidades reservadas para V2.0 (IA generativa avançada, automações, data warehouse) são citadas, mas não detalhadas — aparecem como "placeholders" para garantir que o modelo conceitual as acomode sem remodelagem.

---

# Capítulo 2 — Filosofia do Banco

## 2.1 Por que existem domínios?

O Orion é um sistema **grande por design**. Tentar manter todas as tabelas em uma lista plana torna o entendimento impossível. A divisão em **domínios** resolve três problemas:

1. **Cognitivo** — humanos navegam melhor por agrupamentos semânticos.
2. **Organizacional** — times de engenharia podem "deter" um domínio (ex.: time de billing detém `LICENCIAMENTO`).
3. **Técnico** — facilita isolamento de migrations, ownership de schemas futuros e sharding horizontal.

## 2.2 Lista oficial de domínios

```text
CORE              — Empresas, Filiais, Departamentos, Equipes
USUÁRIOS          — Pessoas que acessam o sistema
PERMISSÕES        — RBAC (Roles, Permissões, Atribuições)
METAS             — Objetivos quantitativos por período
INDICADORES       — Métricas que são medidas e perseguidas
CAMPANHAS         — Competições temporárias com premiações
RANKING           — Classificação de usuários por performance
DASHBOARD         — Painéis personalizados com widgets
NOTIFICAÇÕES      — Alertas in-app, e-mail, push
AUDITORIA         — Trilha imutável de todas as ações
CONFIGURAÇÕES     — Preferências do tenant e custom fields
IA                — Conversas, prompts, modelos (V2.0)
LICENCIAMENTO     — Planos, módulos contratados, validade
BACKUP            — Snapshots, restores, retenção
API               — Chaves, webhooks, rate limits
RELATÓRIOS        — Templates e execuções de relatórios
```

## 2.3 Fronteiras entre domínios

A fronteira entre dois domínios é sempre uma **foreign key com semântica clara**. Exemplo:

- `results.indicator_id` conecta RESULTADOS → INDICADORES.
- `rankings.campaign_id` conecta RANKING → CAMPANHAS (NULO quando ranking for "global" da empresa).
- `audit_logs.user_id` conecta AUDITORIA → USUÁRIOS.

Quando uma entidade pertence a dois domínios simultaneamente (ex.: `notifications` é transacional mas pertence à comunicação), **um domínio é o "dono"** e o outro é referenciado. Isso evita acoplamento circular.

---

# Capítulo 3 — Padrões Universais de Modelagem

Toda entidade de domínio possui um **bloco base** de campos conceituais. Estes campos não são opcionais — são a espinha dorsal do Orion.

## 3.1 Bloco base (campos conceituais)

| Campo conceitual | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Identificador interno | Inteiro | 1:1 | Chave primária surrogate, nunca exposta em API. |
| Identificador público | UUID | 1:1 | Exposto em APIs públicas; protege contra enumeração. |
| Tenant | Referência a Empresa | 1:1 | Em todas as tabelas, mesmo filhas diretas. |
| Criado em | Data/hora com fuso | 1:1 | Momento de criação. |
| Atualizado em | Data/hora com fuso | 1:1 | Momento da última alteração. |
| Excluído em | Data/hora com fuso | 0:1 | Quando preenchido, registro é "soft deleted". |
| Criado por | Referência a Usuário | 0:1 | Autor da criação (NULL em seeds do sistema). |
| Atualizado por | Referência a Usuário | 0:1 | Autor da última alteração. |
| Excluído por | Referência a Usuário | 0:1 | Autor da exclusão lógica. |
| Ativo | Booleano | 1:1 | Independente de `deleted_at`. Permite inativar sem excluir. |
| Versão | Inteiro | 1:1 | Controle de concorrência otimista. |
| ID externo | Texto | 0:1 | ID em sistema legado (ERP/CRM) para integração. |
| Metadados | JSON | 0:1 | Atributos extensíveis sem alteração de schema. |

## 3.2 Por que esses campos?

- **Identificador duplo (id + uuid):** `id` interno é mais rápido em JOINs e ocupa menos espaço em índices. `uuid` público evita enumeration attacks em APIs REST.
- **Tenant redundante:** mesmo `users` (que já é filho direto de `companies` via `branch.company_id`) tem `company_id` próprio. Isso evita JOIN em filtros de RLS.
- **Ativo ≠ Excluído:** `active=FALSE` significa "inativo mas visível"; `deleted_at IS NOT NULL` significa "removido, escondido das queries padrão".
- **Versão:** usado em `UPDATE ... WHERE id=? AND version=? RETURNING version`. Se 0 linhas, houve concorrência — a aplicação recarrega e tenta de novo.
- **Metadados:** escape hatch para campos customizados por tenant antes de uma migração formal. **Nunca** deve abrigar dados que aparecem em `WHERE`/`ORDER BY` de hot paths.

## 3.3 Convenção de nomenclatura

- Tabelas em `snake_case`, **plural** (`users`, `goals`).
- Tabelas de junção N:N: `_<entidadeA>_<entidadeB>` em ordem alfabética (`campaign_participants`, `role_permissions`).
- Chaves estrangeiras: `<entidade_singular>_id` (`company_id`, `user_id`).
- Flags: adjetivo ou `is_<...>`/`has_<...>` (`active`, `is_system`, `has_attachments`).
- Timestamps: `<evento>_at` (`created_at`, `deleted_at`).
- Datas sem hora: `<evento>_date` (`start_date`, `end_date`).

---

# Capítulo 4 — Personas e seu Reflexo no Modelo

O Orion tem 6 personas canônicas. Cada uma tem poderes e visões diferentes sobre as entidades. Compreender isso é essencial para modelar corretamente as **permissões** e os **filtros de escopo**.

## 4.1 Personas e suas relações com entidades

| Persona | Escopo de leitura | Escopo de escrita | Entidades que mais interage |
|---|---|---|---|
| **Admin Master** | Todas as empresas (cross-tenant) | Tudo, exceto deletar Tenant | companies, licenses, backups, system_settings |
| **Admin Empresa** | Própria empresa + filiais | Tudo dentro da empresa | companies (self), branches, users, roles, indicators, goals |
| **Diretor** | Empresa inteira (somente leitura estratégica) | Metas, Campanhas, Indicadores | goals, campaigns, indicators, dashboards, rankings |
| **Gerente** | Sua filial/equipe | Resultados da equipe, metas subordinadas | goals (subordinados), results, rankings |
| **Supervisor** | Sua equipe direta | Resultados da equipe, ajustes pontuais | results, notifications, rankings |
| **Vendedor** | Próprios dados | Seus próprios resultados | results (próprios), dashboards (próprios), notifications |

## 4.2 Reflexo no modelo

O modelo deve suportar três formas de **escopo**:

1. **Por tenant** — `company_id` em todas as tabelas (RLS).
2. **Por filial** — `branch_id` em tabelas operacionais.
3. **Por hierarquia de usuários** — `supervisor_id` em `users` permite recursão ("meus subordinados diretos e indiretos").

A hierarquia é implementada via **CTE recursiva** sobre `users.supervisor_id`. Para equipes grandes, é pré-calculada em uma **MView** `user_subordinates` (ver Documento 06, Cap. 40).

## 4.3 Exemplo de consulta modelada por persona

> "Listar resultados dos últimos 7 dias, conforme a persona do solicitante."

- **Vendedor:** `WHERE user_id = :me`
- **Supervisor:** `WHERE user_id IN (SELECT subordinate_id FROM user_subordinates WHERE supervisor_id = :me)`
- **Gerente:** `WHERE branch_id = :my_branch`
- **Diretor:** `WHERE company_id = :my_company`
- **Admin Empresa:** `WHERE company_id = :my_company`
- **Admin Master:** sem filtro (cross-tenant)

Esses filtros são aplicados pela **camada de serviço** com base na sessão do usuário, e reforçados por **RLS** no banco.

---

# Capítulo 5 — Diagrama ER Geral do Sistema

O diagrama abaixo mostra a **visão de helicóptero** do modelo. Linhas verticais indicam composição (1:N); linhas horizontais com `◇` indicam associação (referência fraca).

```text
                        ┌─────────────────────┐
                        │     companies       │  (Admin Master cria)
                        │  (Domínio CORE)     │
                        └──────────┬──────────┘
                                   │ 1:N
              ┌────────────────────┼────────────────────────┐
              │                    │                        │
              ▼                    ▼                        ▼
       ┌────────────┐       ┌────────────┐          ┌──────────────┐
       │  branches  │       │  licenses  │          │ system_      │
       │ (Filiais)  │       │ (Licencas) │          │  settings    │
       └─────┬──────┘       └────────────┘          └──────────────┘
             │ 1:N
             ▼
       ┌────────────┐
       │   users    │◄───────────┐
       │ (Usuários) │            │
       └─────┬──────┘            │
             │ 1:N               │
             │                   │
   ┌─────────┼─────────┬─────────┼──────────┬─────────────┐
   │         │         │         │          │             │
   ▼         ▼         ▼         ▼          ▼             ▼
┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│goals │ │results│ │ranking│ │notific.│ │dashb.  │ │audit_logs│
└──┬───┘ └──┬───┘ └───┬────┘ └────────┘ └────┬───┘ └──────────┘
   │        │         │                      │
   │        │         │                      │ 1:N
   │        │         │                      ▼
   │        │         │                ┌──────────┐
   │        │         │                │ widgets  │
   │        │         │                └──────────┘
   │        │         │
   │  N:1   │  N:1    │ N:1
   ▼        ▼         ▼
┌────────────────────────────┐
│        indicators          │◄────── indicator_categories (N:1)
│       (Indicadores)        │
└─────────────┬──────────────┘
              │ 1:N
              ▼
       ┌────────────┐
       │  campaigns │──────────┐
       │            │          │ 1:N
       └─────┬──────┘          ▼
             │ 1:N       ┌──────────────────────┐
             ▼           │ campaign_participants│
       ┌──────────┐      │  (N:N users↔campaig) │
       │  awards  │      └──────────────────────┘
       └──────────┘
```

## 5.1 Leituras do diagrama

- `companies` é a **raiz** do modelo. Tudo deriva dela.
- `users` é o **nó central de identidade** — quase toda entidade operacional referencia um usuário.
- `indicators` é o **nó central semântico** — metas, resultados, rankings, campanhas e dashboards referenciam indicadores.
- `results` é a **tabela de alto volume** — particionada por mês (ver Cap. 32).
- `audit_logs` é **transversal** — grava operações de qualquer entidade.
- `licenses` é **independente dentro de CORE** — pertence a uma empresa mas tem ciclo de vida próprio.

## 5.2 Domínios transversais vs verticais

Domínios **verticais** têm tabelas próprias e ciclos de vida isolados: CORE, USUÁRIOS, METAS, INDICADORES, CAMPANHAS, RANKING, DASHBOARD.

Domínios **transversais** atravessam todos os demais: AUDITORIA, NOTIFICAÇÕES, CONFIGURAÇÕES, PERMISSÕES. Eles armazenam metadata sobre as ações dos domínios verticais.

---

# PARTE II — DOMÍNIOS E ENTIDADES

# Capítulo 6 — Domínio CORE

O domínio CORE representa a estrutura organizacional do cliente. É o primeiro a ser populado em uma nova instalação e o último a ser modificado.

## 6.1 Entidade: Empresa (companies)

### Propósito
Representa o cliente pagador do Orion. Toda outra entidade do sistema pertence a uma empresa. Define a identidade visual, idioma, moeda e configurações de ciclo de vida do tenant.

### Ciclo de vida
- **Criação:** quando o Admin Master provisiona um novo cliente (via painel administrativo ou via signup self-service com aprovação).
- **Modificação:** campos de identidade (razão social, logo, contato) podem ser alterados pelo Admin Empresa; campos críticos (CNPJ, plano) exigem autenticação dupla.
- **Exclusão:** NUNCA é fisicamente removida. Pode ser "encerrada" (status = `closed`), o que suspende todas as licenças e bloqueia logins, mas preserva todos os dados históricos por exigência LGPD.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Razão social | Texto curto | 1:1 | Nome jurídico completo. |
| Nome fantasia | Texto curto | 0:1 | Nome comercial; se ausente, usar razão social. |
| CNPJ | Texto formatado | 0:1 (BR) | Obrigatório no Brasil; único globalmente. |
| Inscrição estadual | Texto | 0:1 | Opcional, depende do regime tributário. |
| Contatos (telefone, celular, e-mail) | Texto | 0:1 cada | Canais oficiais de comunicação. |
| Website | URL | 0:1 | Site público da empresa. |
| Endereço completo | Composto | 1:1 | CEP, logradouro, número, complemento, bairro, cidade, estado, país. |
| Identidade visual | Composto | 0:1 | Logo (URL), tema (cores), ícone favicon. |
| Localização | Composto | 0:1 | Idioma (pt-BR default), moeda (BRL default), timezone (America/Sao_Paulo default). |
| Status | Enum | 1:1 | `pending`, `active`, `suspended`, `closed`. |
| Licença ativa | Referência a Licença | 0:1 | Licença atualmente válida. |
| Expira em | Data | 0:1 | Data de validade do contrato atual. |

### Relacionamentos

- **1:N** com `branches` — empresa possui uma ou mais filiais.
- **1:N** com `users` — empresa possui usuários (todos pertencem a uma filial, mas `company_id` é redundante em `users`).
- **1:N** com `indicators` — indicadores são definidos por empresa.
- **1:N** com `dashboards`, `system_settings`, `audit_logs`, `notifications` — todas carregam `company_id`.
- **1:1** com `licenses` (em um dado instante) — empresa tem uma licença ativa; histórico de licenças é 1:N.

### Regras de negócio que afetam a entidade
- **RN-001:** Cada instalação pertence a apenas uma empresa.
- **RN-002:** Após ativação da licença, dados críticos (CNPJ, razão social) exigem autenticação dupla.
- **RN-003:** Empresas com status `pending` não podem receber usuários além do Admin Empresa inicial.
- **RN-LGPD-01:** Encerramento de empresa exige retenção de dados por prazo mínimo definido em política.

### Exemplo de uso
> A empresa "Comércio Solar Ltda" (CNPJ 12.345.678/0001-99) contrata o Orion. O Admin Master provisiona a empresa com status `pending`, gera uma licença trial de 14 dias e envia o link de ativação para o Admin Empresa designado. Após o primeiro login, a empresa muda para `active` e já pode cadastrar filiais e usuários.

### Considerações de performance
- Tabela **pequena** (centenas a poucos milhares de registros).
- Índice único em `cnpj` permite lookup rápido.
- `metadata` JSONB pode armazenar configurações experimentais sem migration.

### Considerações de segurança
- Acesso ao registro completo restrito a Admin Master e Admin Empresa.
- Campos de CNPJ e contatos são **dados pessoais/sensíveis** — devem ser criptografados em backup (LGPD).
- Modificações em status e licença geram registros de auditoria de alta criticidade.

---

## 6.2 Entidade: Filial (branches)

### Propósito
Representa uma unidade operacional da empresa (loja física, escritório regional, centro de distribuição). É o escopo intermediário entre empresa e usuário: a maioria das consultas operacionais filtra por `branch_id`.

### Ciclo de vida
- **Criação:** Admin Empresa cadastra nova filial quando expande operações.
- **Modificação:** dados de endereço, gerente e horário podem ser atualizados livremente; `code` é imutável após criação (referenciado em integrações).
- **Exclusão:** soft delete. Filial desativada (`status=closed`) bloqueia novos lançamentos, mas preserva histórico.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant proprietário. |
| Código | Texto curto | 1:1 | Identificador interno (ex.: `FIL-001`). Único por empresa. |
| Nome | Texto curto | 1:1 | Nome de exibição. |
| Gerente | Referência a Usuário | 0:1 | Usuário responsável pela filial. |
| Contatos | Composto | 0:1 | Telefone, e-mail. |
| Endereço completo | Composto | 1:1 | Mesma estrutura de empresa. |
| Geolocalização | Composto | 0:1 | Latitude/longitude para mapas. |
| Horário de funcionamento | JSON | 0:1 | Por dia da semana, com exceções. |
| Status | Enum | 1:1 | `active`, `inactive`, `maintenance`, `closed`. |

### Relacionamentos

- **N:1** com `companies`.
- **1:N** com `users` (cada usuário pertence a uma filial principal; pode ter filiais secundárias via tabela `user_branches`).
- **1:N** com `goals`, `results`, `rankings`, `notifications` (todas carregam `branch_id`).

### Regras de negócio
- **RN-004:** Cada funcionário deve estar vinculado a uma filial.
- **RN-005:** Metas podem ser por empresa, filial, equipe ou colaborador.
- **RN-006:** Filial desativada preserva dados históricos; novos lançamentos são bloqueados.

### Exemplo de uso
> A "Comércio Solar" abre uma filial em Campinas. O Admin Empresa cadastra a filial `FIL-002`, define horário de funcionamento (seg-sex 8h-18h, sáb 8h-12h), atribui um gerente e atribui a filial a 5 usuários existentes. A partir desse momento, esses usuários passam a ver dados default da nova filial.

### Considerações de performance
- Tabela pequena, mas com muitas leituras — cachear status da filial em Redis (TTL 5 min).
- `branch_id` aparece como filtro em quase toda query operacional — índice composto `(branch_id, created_at)` em tabelas de alto volume.

### Considerações de segurança
- Endereço e geolocalização são dados pessoais se identificados — cuidado com exposição em APIs públicas.
- Gerente é referência que pode ser usada para phishing interno — não expor em endpoints públicos.

---

## 6.3 Entidade: Departamento (departments) — opcional V1.0

### Propósito
Subdivisão organizacional dentro de uma filial (ex.: Vendas, Caixa, Logística). Nem todos os clientes usam; para pequenos varejos, filial já é granular suficiente.

### Ciclo de vida
- **Criação:** Admin Empresa quando estrutura organizacional é mais complexa.
- **Modificação/Exclusão:** livre, mas preserva histórico.

### Atributos principais
- Empresa, Filial, Nome, Código, Responsável, Status.

### Relacionamentos
- **N:1** com `companies` e `branches`.
- **1:N** com `users` (campo `department_id` em `users`, opcional).

---

## 6.4 Entidade: Equipe (teams)

### Propósito
Agrupamento operacional de usuários sob um líder comum. Equipes são fundamentais para o Orion: metas, campanhas e rankings frequentemente têm escopo de equipe.

### Atributos principais
- Empresa, Filial (opcional), Nome, Líder (Usuário), Membros (N:N via `team_members`), Status.

### Relacionamentos
- **N:N** com `users` via `team_members`.
- **1:N** com `goals` (meta pode ter escopo de equipe).
- **1:N** com `campaigns` (campanha pode ter como alvo uma equipe).

### Regras de negócio
- Um usuário pode pertencer a múltiplas equipes simultaneamente (ex.: "Equipe Vendas" e "Equipe Black Friday").
- Mudança de líder de equipe não altera automaticamente supervisor dos membros — são conceitos distintos (líder é operacional, supervisor é hierárquico).

---

# Capítulo 7 — Domínio USUÁRIOS

O domínio USUÁRIOS trata de identidade, autenticação e perfil das pessoas que interagem com o Orion.

## 7.1 Entidade: Usuário (users)

### Propósito
Representa qualquer pessoa física que acessa o Orion: Admin Empresa, Diretor, Gerente, Supervisor, Vendedor, ou usuários não-humanos (usuários de serviço para integrações).

### Ciclo de vida
- **Criação:** Admin Empresa cadastra usuário (ou importação em lote via CSV). Status inicial `invited`; e-mail de ativação enviado.
- **Ativação:** ao primeiro acesso com link de ativação, define senha; status muda para `active`.
- **Suspensão:** Admin pode suspender (`suspended`) — bloqueia login imediatamente, preserva dados.
- **Inativação:** usuário deixa a empresa (`inactive`) — preserva histórico, mas não pode logar.
- **Exclusão:** apenas soft delete, após período de carência LGPD (90 dias default).

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Filial principal | Referência a Filial | 1:1 | Filial onde o usuário atua primariamente. |
| Matrícula | Texto | 0:1 | Código de RH; único por empresa. |
| Nome completo | Texto | 1:1 | Nome de exibição. |
| CPF / RG | Texto | 0:1 | Documentos (Brasil). |
| Contatos | Composto | 0:1 | E-mail, telefone, celular. |
| Foto | URL | 0:1 | Avatar. |
| Login | Texto | 1:1 | E-mail, matrícula, CPF ou username (configurável). |
| Senha | Texto hash | 0:1 | bcrypt/argon2. NULL se SSO. |
| Cargo | Referência a Cargo | 0:1 | Cargo na empresa. |
| Função | Enum (persona) | 0:1 | `admin_master`, `admin_company`, `director`, `manager`, `supervisor`, `salesperson`. |
| Supervisor direto | Referência a Usuário | 0:1 | Para hierarquia recursiva. |
| Data de admissão | Data | 0:1 | Para cálculos de tempo de casa. |
| Situação | Enum | 1:1 | `pending`, `invited`, `active`, `suspended`, `inactive`. |
| Último acesso | Data/hora | 0:1 | Para auditoria e inatividade. |
| Preferências | JSON | 0:1 | UI prefs (tema, idioma, atalhos). |

### Relacionamentos

- **N:1** com `companies` e `branches`.
- **N:1** com `roles` (cargo → role; em V1.0, 1 usuário : 1 cargo; planejado 1:N em V2.0).
- **1:N** com `results` — usuário lança resultados.
- **1:N** com `goals` — usuário recebe metas.
- **1:N** com `notifications` — destinatário.
- **1:N** com `audit_logs` — autor das ações.
- **N:N** com `teams` via `team_members`.
- **N:N** com `branches` via `user_branches` (acesso a múltiplas filiais).
- **1:1 (auto-referência)** com `supervisor_id` — hierarquia.

### Regras de negócio
- **RN-007:** Cada usuário tem um único login (único globalmente ou por empresa — configurável).
- **RN-008:** Login pode ser e-mail, matrícula, CPF ou username.
- **RN-009:** Senha nunca é armazenada em texto — sempre hash com salt.
- **RN-010:** Suspensão revoga todas as sessões ativas imediatamente.
- **RN-011:** Inatividade por X dias (configurável, default 90) gera alerta para Admin Empresa.

### Exemplo de uso
> João é cadastrado como vendedor na filial FIL-001 da Comércio Solar. Recebe e-mail de ativação, define senha no primeiro acesso. Seu `supervisor_id` aponta para Maria, gerente da filial. A partir desse momento, João pode lançar resultados que automaticamente ficam visíveis a Maria e ao Diretor da empresa.

### Considerações de performance
- Tabela de tamanho médio (centenas a dezenas de milhares por tenant).
- Hierarquia recursiva (supervisor) é cara — pré-calcular em `user_subordinates` (MView).
- `email` deve ter índice único parcial `WHERE deleted_at IS NULL`.

### Considerações de segurança
- Senha: **argon2id** (preferencial) ou bcrypt cost 12+.
- Dados pessoais (CPF, RG, e-mail): protegidos por LGPD — acesso restrito, logs obrigatórios.
- Tentativas de login falhas: contador com bloqueio temporário após 5 falhas (rate limit por IP e por usuário).
- 2FA: campo `two_factor_enabled` + `two_factor_secret` (encrypted).

---

## 7.2 Entidade: Cargo (roles)

### Propósito
Catálogo de cargos/papéis organizacionais que a empresa define. Cada cargo tem um conjunto de permissões (RBAC). Não confundir com `function` (persona canônica) — cargo é livre, persona é fixa do sistema.

### Atributos
- Empresa, Nome, Descrição, Persona mapeada (enum), Permissões (N:N via `role_permissions`), É cargo do sistema (booleano — Admin Master, Admin Empresa), Status.

### Regras de negócio
- Cargos do sistema (`is_system=TRUE`) não podem ser removidos, apenas têm permissões ajustadas.
- Cada empresa pode criar cargos customizados (ex.: "Vendedor Sênior", "Caixa Turno Noite").

---

## 7.3 Entidade: Sessão (sessions)

### Propósito
Rastrear sessões ativas dos usuários para permitir revogação imediata (logout remoto, suspeita de roubo).

### Atributos principais
- Usuário, Token hash (não o token em si), IP de origem, User-Agent, Criada em, Expira em, Revogada em, Motivo da revogação.

### Regras de negócio
- Sessões expiram em 24h (configurável).
- Refresh tokens têm `family_id` para detectar roubo (se um refresh token da família for usado após ter sido rotacionado, a família inteira é revogada).

---

## 7.4 Entidade: Refresh Token (refresh_tokens)

### Propósito
Tokens de longa duração usados para obter novos access tokens sem reautenticar. Têm rotação com detecção de reuso.

### Atributos
- Família (ID), Token hash, Usuário, Criado em, Expira em, Revogado em, Substituído por (Token seguinte na família).

---

# Capítulo 8 — Domínio PERMISSÕES

## 8.1 Entidade: Permissão (permissions)

### Propósito
Catálogo de **todas as ações atômicas** possíveis no Orion. Uma permissão é um verbo + recurso (ex.: `results.create`, `goals.delete`, `dashboard.export`).

### Atributos
- Código (ex.: `results.create`), Descrição, Recurso (enum: `users`, `goals`, etc.), Ação (enum: `view`, `create`, `update`, `delete`, `export`, `print`, `configure`), Categoria, É permissão de sistema.

### Relacionamentos
- **N:N** com `roles` via `role_permissions`.

### Regras de negócio
- Permissões são pré-cadastradas pelo time de produto (catalogadas no Doc 10 — API).
- Negar permissão sobrepõe a conceder (em caso de múltiplos cargos).
- Permissões de sistema não podem ser removidas do catálogo.

---

## 8.2 Entidade: Role_Permissions (atribuição)

### Propósito
Tabela de junção N:N que vincula uma permissão a um cargo, com efeito (`allow` ou `deny`).

### Atributos
- Cargo, Permissão, Efeito (`allow`/`deny`), Escopo (empresa/filial/equipe/usuário — para granularidade fina), Condição (JSON — ex.: "apenas para próprios resultados").

### Regras de negócio
- `deny` sempre vence `allow` quando há conflito.
- Escopo permite implementar "pode editar resultados próprios e da equipe direta".

---

# Capítulo 9 — Domínio INDICADORES

## 9.1 Entidade: Indicador (indicators)

### Propósito
Esta é, possivelmente, **a entidade mais importante do Orion**. Um indicador é uma métrica mensurável que a empresa deseja perseguir (ex.: "Faturamento mensal", "Ticket médio", "NPS", "Conversão de leads"). Tudo no Orion — metas, resultados, rankings, campanhas, dashboards — orbita em torno de indicadores.

### Ciclo de vida
- **Criação:** Diretor ou Admin Empresa define novo indicador.
- **Modificação:** campos de exibição (ícone, cor, ordem) são livres; campos semânticos (fórmula, unidade, precisão) geram nova versão (versionamento).
- **Exclusão:** soft delete. Indicador em uso por metas/campanhas ativas é bloqueado para exclusão — apenas `archived`.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Nome | Texto | 1:1 | Curto, exibível. |
| Descrição | Texto longo | 0:1 | O que mede, como calcular. |
| Categoria | Referência a Categoria | 1:1 | Agrupamento semântico. |
| Tipo | Enum | 1:1 | `monetary`, `quantity`, `percentage`, `ratio`, `time`, `score`. |
| Ícone | Texto (emoji ou nome) | 0:1 | Para UI. |
| Cor | Hex | 0:1 | Para UI. |
| Unidade | Texto | 0:1 | Ex.: "R$", "un.", "%", "horas". |
| Precisão decimal | Inteiro | 1:1 | Casas decimais para exibição. |
| Valor mínimo aceitável | Decimal | 0:1 | Para validação de resultados. |
| Valor máximo aceitável | Decimal | 0:1 | Para validação de resultados. |
| Fórmula | JSON / Texto estruturado | 0:1 | Para indicadores calculados. |
| Peso | Decimal | 0:1 | Para ranking composto. |
| Exibir em | Flags | 1:1 cada | Dashboard, Ranking, Relatório. |
| Obrigatório | Booleano | 1:1 | Indicador que todo usuário deve ter meta. |
| Ordem | Inteiro | 1:1 | Ordenação na UI. |
| Status | Enum | 1:1 | `draft`, `active`, `archived`. |

### Relacionamentos

- **N:1** com `indicator_categories`.
- **1:N** com `goals` — meta é sempre para um indicador.
- **1:N** com `results` — resultado registra valor de um indicador.
- **1:N** com `campaign_indicators` (N:N com campanhas).
- **1:N** com `dashboard_widgets` — widgets exibem dados de indicadores.

### Regras de negócio
- **RN-IND-01:** Tipo define como somar resultados (somar monetary, mas não somar percentage — média ponderada).
- **RN-IND-02:** Mudança de fórmula gera nova versão; resultados antigos mantêm a versão vigente na data de lançamento.
- **RN-IND-03:** Indicador `obrigatório=TRUE` força criação de meta ao cadastrar usuário.
- **RN-IND-04:** Indicador arquivado não aceita novos resultados, mas mantém histórico.

### Exemplo de uso
> Diretor da Comércio Solar cria o indicador "Faturamento Mensal" (categoria Financeiro, tipo monetary, unidade "R$", precisão 2, peso 3, obrigatório, exibir em dashboard/ranking/relatório). A partir desse momento, todo usuário cadastrado recebe automaticamente uma meta para esse indicador (RN-IND-03).

### Considerações de performance
- Tabela pequena (dezenas a centenas por tenant).
- Catalogar em cache Redis por `company_id` (TTL 1h) — leitura em toda lista de dashboard.
- Fórmulas são interpretadas por engine própria (não SQL direto) — evitar SQL injection.

### Considerações de segurança
- Mudança de fórmula é **ação crítica** — exige auditoria reforçada e 2FA do autor.
- Indicadores de fórmula podem referenciar dados sensíveis (ex.: margem de lucro) — permissão `indicators.view_financial` controla exposição.

---

## 9.2 Entidade: Categoria de Indicador (indicator_categories)

### Propósito
Agrupamento semântico de indicadores para organização na UI e filtros em relatórios.

### Atributos
- Empresa, Nome, Descrição, Ícone, Cor, Ordem, Status.

### Categorias padrão (pré-cadastradas)
- Financeiro, Clientes, Produtos, Campanhas, Qualidade, Atendimento, Operacional, RH, Personalizado.

### Regras de negócio
- Categoria padrão (`is_system=TRUE`) não pode ser removida.
- Indicador só pode ser cadastrado em categoria existente e ativa.

---

# Capítulo 10 — Domínio METAS

## 10.1 Entidade: Meta (goals)

### Propósito
Define o **objetivo quantitativo** que um usuário, equipe, filial ou empresa deve alcançar para um indicador em um período. A meta é o "alvo"; o resultado é a "realização". A diferença entre eles gera o percentual de atingimento, base para rankings e comissões.

### Ciclo de vida
- **Criação:** Gerente/Diretor/Admin Empresa cria metas para seus subordinados. Metas podem ser criadas manualmente ou via distribuição automática (ex.: meta de filial distribuída igualmente entre vendedores).
- **Modificação:** alteração de valor gera **nova versão** (versionamento). Meta em período passado não pode ser alterada — apenas via "ajuste formal" com aprovação.
- **Exclusão:** soft delete. Metas com resultados já lançados não podem ser excluídas, apenas arquivadas.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Filial | Referência a Filial | 0:1 | NULO se meta for de empresa. |
| Equipe | Referência a Equipe | 0:1 | NULO se não for por equipe. |
| Usuário | Referência a Usuário | 0:1 | NULO se meta for coletiva. |
| Indicador | Referência a Indicador | 1:1 | O que está sendo medido. |
| Tipo | Enum | 1:1 | `daily`, `weekly`, `monthly`, `quarterly`, `yearly`, `custom`. |
| Data inicial | Data | 1:1 | Início do período. |
| Data final | Data | 1:1 | Fim do período. |
| Valor da meta | Decimal | 1:1 | Quantidade a atingir. |
| Meta diária | Decimal | 0:1 | Distribuição por dia (calculada ou manual). |
| Meta semanal | Decimal | 0:1 | Distribuição por semana. |
| Meta mensal | Decimal | 0:1 | Distribuição por mês. |
| Meta anual | Decimal | 0:1 | Distribuição anual. |
| Peso | Decimal | 0:1 | Peso para ranking composto. |
| Observação | Texto | 0:1 | Contexto, justificativa. |
| Status | Enum | 1:1 | `draft`, `active`, `achieved`, `missed`, `canceled`. |
| Versão | Inteiro | 1:1 | Versionamento. |

### Relacionamentos

- **N:1** com `companies`, `branches` (opcional), `teams` (opcional), `users` (opcional), `indicators`.
- **1:N** com `results` — os resultados que contribuem para esta meta (via `indicator_id` + escopo + período).
- **1:N** com `goal_adjustments` — histórico de ajustes formais.
- **1:N** com `goal_distributions` — quando meta é distribuída para subordinados.

### Regras de negócio
- **RN-MET-01:** Meta deve ter pelo menos um escopo definido (empresa, filial, equipe ou usuário).
- **RN-MET-02:** Não pode haver duas metas ativas para o mesmo escopo + indicador + período sobreposto.
- **RN-MET-03:** Distribuição automática: meta pai → somatório das metas filho deve igualar meta pai.
- **RN-MET-04:** Alteração de valor em período futuro requer apenas auditoria; em período passado requer aprovação do Diretor.
- **RN-MET-05:** Meta cancelada não conta para ranking.

### Exemplo de uso
> O Diretor cria meta mensal de R$ 500.000 de faturamento para a filial FIL-001 em outubro/2025. O sistema oferece distribuir automaticamente entre 5 vendedores da filial (R$ 100.000 cada). O Diretor ajusta manualmente: vendedor A R$ 150.000, vendedor B R$ 120.000, demais R$ 76.667. Cada vendedor agora vê sua meta individual no dashboard.

### Considerações de performance
- Tabela de tamanho médio (centenas de milhares por tenant em grandes empresas).
- Cálculo de "progresso da meta" é denso — usar **MView `goal_progress_daily`** pré-calculada.
- Índice composto `(user_id, indicator_id, start_date, end_date)` para consultas de dashboard.

### Considerações de segurança
- Metas podem conter informações estratégicas (ex.: meta de margem de lucro) — expor com base em persona.
- Distribuição automática expõe hierarquia — logs obrigatórios.

---

## 10.2 Entidade: Ajuste de Meta (goal_adjustments)

### Propósito
Histórico formal de alterações de meta, especialmente em períodos passados. Permite rastreabilidade "quem autorizou, quando, com qual justificativa".

### Atributos
- Meta (referência), Versão anterior, Versão nova, Solicitante, Aprovador, Justificativa, Data da aprovação, Status (`pending`, `approved`, `rejected`).

---

## 10.3 Entidade: Distribuição de Meta (goal_distributions)

### Propósito
Vincula uma meta pai (ex.: filial) às metas filho (ex.: vendedores), registrando se a distribuição foi automática ou manual.

---

# Capítulo 11 — Domínio RESULTADOS

## 11.1 Entidade: Resultado (results)

### Propósito
Esta é **a tabela de maior volume do Orion**. Cada resultado é um lançamento factual: "no dia X, o usuário Y atingiu o valor Z no indicador W". É o dado bruto que alimenta tudo: rankings, dashboards, comissões, relatórios.

### Ciclo de vida
- **Criação:** vendedor lança manualmente; integração via API cria automaticamente; workflow de aprovação põe em status `pending`.
- **Modificação:** resultados `approved` são imutáveis — apenas via "estorno" que cria novo resultado negativo (preservando histórico).
- **Exclusão:** soft delete com motivo obrigatório. Resultados com auditoria de aprovação não podem ser excluídos por vendedor — apenas por supervisor+.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Filial | Referência a Filial | 1:1 | Onde ocorreu. |
| Usuário | Referência a Usuário | 1:1 | Quem realizou. |
| Indicador | Referência a Indicador | 1:1 | O que foi medido. |
| Valor | Decimal | 1:1 | Quantidade atingida. |
| Data | Data | 1:1 | Quando o fato ocorreu (não quando foi lançado). |
| Hora | Hora | 0:1 | Para granularidade intradia. |
| Origem | Enum | 1:1 | `manual`, `api`, `import`, `integration`, `automation`. |
| Observação | Texto | 0:1 | Contexto do lançamento. |
| Anexos | N:N com file_uploads | 0:N | Comprovantes, fotos, notas fiscais. |
| Status | Enum | 1:1 | `draft`, `pending`, `approved`, `rejected`, `revised`. |
| Aprovado por | Referência a Usuário | 0:1 | Quem aprovou (se `approved`). |
| Aprovado em | Data/hora | 0:1 | Quando. |
| Rejeitado motivo | Texto | 0:1 | Se `rejected`. |
| Auditoria | JSON | 0:1 | Snapshot de contexto (IP, user-agent, geolocalização). |
| Período de referência | Composto | 1:1 | Ano/mês/desemana pré-calculados para filtros rápidos. |

### Relacionamentos

- **N:1** com `users`, `indicators`, `branches`, `companies`.
- **1:N** com `result_attachments` (N:N com `file_uploads`).
- **1:N** com `result_approvals` — histórico de aprovações/rejeições.
- **1:N** com `audit_logs` — toda alteração gera log.

### Regras de negócio
- **RN-RES-01:** Valor deve estar entre `min_value` e `max_value` do indicador (se definidos).
- **RN-RES-02:** Resultado em período fechado (ex.: mês passado) requer aprovação de supervisor.
- **RN-RES-03:** Resultado `approved` não pode ser alterado — apenas estornado.
- **RN-RES-04:** Resultado rejeitado gera notificação para o lançador.
- **RN-RES-05:** Lançamento duplicado (mesmo usuário + indicador + data + valor + origem) é detectado e bloqueado.
- **RN-RES-06:** Resultado de indicador do tipo `percentage` deve estar entre 0 e 100 (ou configurável).

### Exemplo de uso
> João (vendedor) lança manualmente o resultado de "Faturamento Mensal" para o dia 15/10/2025: R$ 8.500,00. Status inicial: `pending` (porque o indicador exige aprovação para lançamentos diários > R$ 5.000). Maria (supervisora) recebe notificação, abre o resultado, anexa a nota fiscal em PDF, clica em "Aprovar". Status vira `approved`. O dashboard de João é atualizado imediatamente, e o ranking da campanha "Outubro Verde" recalcula sua posição.

### Considerações de performance
- **Tabela de altíssimo volume:** estimativa de 100M+ registros/ano para clientes enterprise.
- **Particionamento RANGE mensal** por `result_date` — ver Cap. 32.
- **Índices:** `(company_id, branch_id, user_id, indicator_id, result_date)` cobre 90% das queries.
- **MViews** `goal_progress_daily`, `user_ranking_monthly` pré-calculam agregações.
- Detach de partições antigas para S3 Parquet após 24 meses.

### Considerações de segurança
- Resultados financeiros são **dado sensível** — RLS obrigatório.
- Acesso a resultados de outros usuários controlado por persona.
- Anexos herdam permissões do resultado.
- Log de acesso a resultado individual (quem visualizou, quando).

---

## 11.2 Entidade: Aprovação de Resultado (result_approvals)

### Propósito
Histórico de decisões sobre um resultado: quem aprovou, rejeitou, com qual comentário, em qual data.

### Atributos
- Resultado (referência), Decisor (Usuário), Decisão (`approved`/`rejected`/`requested_revision`), Comentário, Data, Anexos.

---

## 11.3 Entidade: Anexo (file_uploads)

### Propósito
Registro de qualquer arquivo enviado ao Orion (comprovante de resultado, foto de campanha, logo de empresa). O arquivo em si fica em storage externo (S3); o banco guarda apenas metadata.

### Atributos
- Empresa, Usuário upload, Nome original, MIME type, Tamanho, URL storage, Hash (SHA-256), Scan antivírus status, Status (`pending_scan`, `clean`, `infected`, `quarantine`).

---

# Capítulo 12 — Domínio CAMPANHAS

## 12.1 Entidade: Campanha (campaigns)

### Propósito
Competição temporária com regras próprias, indicadores específicos e premiações. Diferente de meta (que é perseguida continuamente), campanha é um "evento" com começo, meio e fim, criando urgência e engajamento.

### Ciclo de vida
- **Criação:** Diretor/Gerente cria campanha em status `draft`.
- **Agendamento:** ao definir período futuro, status vira `scheduled`.
- **Ativação:** no `start_date`, status vira `active` (via job).
- **Pausa:** pode ser pausada (`paused`) — resultados no período de pausa não contam.
- **Encerramento:** no `end_date`, status vira `finished`. Ranking final é congelado.
- **Cancelamento:** pode ser cancelada antes do fim — premiações não são distribuídas.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Filial | Referência a Filial | 0:1 | NULO se for cross-filial. |
| Nome | Texto | 1:1 | Ex.: "Campanha Outubro Verde". |
| Descrição | Texto longo | 0:1 | Regras em linguagem natural. |
| Objetivo | Texto | 0:1 | O que se busca alcançar. |
| Prêmio | Texto | 0:1 | Descrição do prêmio (ex.: "Viagem para Cancún"). |
| Regras | JSON estruturado | 0:1 | Regras formais (escopo, critério de desempate, etc.). |
| Indicadores | N:N via `campaign_indicators` | 0:N | Indicadores que contam para a campanha. |
| Participantes | N:N via `campaign_participants` | 0:N | Usuários/equipes participantes. |
| Período | Composto (início, fim) | 1:1 | Quando a campanha ocorre. |
| Imagem | URL | 0:1 | Banner promocional. |
| Premiações | N:N via `campaign_awards` | 0:N | Premiação por posição. |
| Status | Enum | 1:1 | `draft`, `scheduled`, `active`, `paused`, `finished`, `canceled`. |
| Criada por | Referência a Usuário | 1:1 | Autor. |

### Relacionamentos

- **N:1** com `companies`, `branches` (opcional), `users` (criador).
- **N:N** com `indicators` via `campaign_indicators` (campanha pode usar múltiplos indicadores com pesos).
- **N:N** com `users` via `campaign_participants` (com metadados de inscrição).
- **N:N** com `teams` via `campaign_teams`.
- **1:N** com `awards` (premiações definidas).
- **1:N** com `rankings` (rankings gerados para a campanha).

### Regras de negócio
- **RN-CAM-01:** Campanha só pode ser cancelada antes do fim; após `finished`, é imutável.
- **RN-CAM-02:** Período deve ser futuro para `draft`/`scheduled`.
- **RN-CAM-03:** Peso dos indicadores na campanha deve somar 100%.
- **RN-CAM-04:** Resultados de participantes só contam se forem `approved`.
- **RN-CAM-05:** Empate no ranking final é resolvido por critério configurado (mais recente, mais antigo, maior consistência, sorteio).

### Exemplo de uso
> Maria (Diretora) cria a campanha "Outubro Verde" para a equipe de vendas da FIL-001, de 01/10 a 31/10/2025. Define dois indicadores: Faturamento (peso 70%) e Ticket Médio (peso 30%). Premiação: 1º lugar = iPhone, 2º lugar = Smartwatch, 3º lugar = Bonificação R$ 500. Inscreve automaticamente todos os vendedores ativos. A campanha fica em `scheduled` até 01/10, quando vira `active`. Rankings são atualizados em tempo real a cada novo resultado lançado.

### Considerações de performance
- Tabela pequena (dezenas a centenas por tenant).
- Cálculo de ranking da campanha é **denso** — pré-calcular em `campaign_leaderboard` (MView) com refresh on-demand após novo resultado.
- Filtros por período exigem índice composto `(status, start_date, end_date)`.

### Considerações de segurança
- Apenas Diretor+ pode criar campanhas cross-filial.
- Premiações visíveis apenas para participantes (para não desmotivar não-participantes).
- Cancelamento gera notificação para todos os participantes.

---

## 12.2 Entidade: Participantes de Campanha (campaign_participants)

### Propósito
Tabela N:N que vincula usuários a campanhas, com metadados de inscrição (data, convite aceito/rejeitado, opt-in de comunicação).

### Atributos
- Campanha, Usuário, Data de inscrição, Status (`invited`, `accepted`, `declined`, `removed`), Opt-in comunicação, Pontuação final, Posição final.

---

## 12.3 Entidade: Indicadores da Campanha (campaign_indicators)

### Propósito
Tabela N:N que vincula indicadores a campanhas, com peso (para ranking composto).

### Atributos
- Campanha, Indicador, Peso (0-100), Direção (`higher_better` ou `lower_better`), Meta específica (opcional — sobrepõe meta padrão do período).

---

## 12.4 Entidade: Premiação (awards)

### Propósito
Catálogo de prêmios que podem ser atribuídos em campanhas. Permite reutilizar "Primeiro Lugar", "Medalha Ouro", "Troféu Destaque" entre campanhas.

### Atributos
- Empresa, Nome, Descrição, Tipo (`position`, `medal`, `trophy`, `points`, `bonus`, `custom`), Ícone, Valor monetário (opcional), Status.

### Tipos padrão
- Primeiro Lugar, Segundo Lugar, Terceiro Lugar, Medalha Ouro, Medalha Prata, Medalha Bronze, Troféu Destaque, Pontos, Bonificação.

### Regras de negógio
- Premiação personalizada pode ser criada por empresa.
- Uma mesma premiação pode ser usada em múltiplas campanhas (reaproveitamento).

---

## 12.5 Entidade: Premiação da Campanha (campaign_awards)

### Propósito
Vincula uma premiação específica a uma campanha, definindo a posição/critério que a recebe.

### Atributos
- Campanha, Premiação, Critério (`position_1`, `position_2`, `top_3`, `top_10_percent`, `improvement`, `custom`), Condição (JSON), Quantidade máxima de ganhadores.

---

# Capítulo 13 — Domínio RANKING

## 13.1 Entidade: Ranking (rankings)

### Propósito
Posição de um usuário em uma competição (campanha ou ranking global). O ranking é **pré-calculado** (não calculado em tempo real) para suportar alta leitura sem degradar o banco.

### Ciclo de vida
- **Criação/Atualização:** job agendado (a cada 15 min para campanhas ativas; diário para rankings globais) recalcula posições.
- **Exclusão:** rankings de campanhas encerradas são preservados (histórico permanente).

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Filial | Referência a Filial | 0:1 | NULO se ranking for cross-filial. |
| Usuário | Referência a Usuário | 1:1 | Quem está ranqueado. |
| Campanha | Referência a Campanha | 0:1 | NULO se ranking for global. |
| Indicador | Referência a Indicador | 0:1 | NULO se ranking for composto. |
| Período | Enum | 1:1 | `daily`, `weekly`, `monthly`, `quarterly`, `yearly`, `campaign`. |
| Data de referência | Data | 1:1 | Dia/mês/ano do ranking. |
| Pontuação | Decimal | 1:1 | Pontos ou valor atingido. |
| Posição | Inteiro | 1:1 | 1, 2, 3, ... |
| Variação de posição | Inteiro | 0:1 | +2 (subiu 2), -1 (caiu 1), 0 (estável). |
| Atualizado em | Data/hora | 1:1 | Última recálculo. |

### Relacionamentos

- **N:1** com `companies`, `branches` (opcional), `users`, `campaigns` (opcional), `indicators` (opcional).
- **1:N** com `ranking_history` — histórico de posições ao longo do tempo.

### Regras de negógio
- **RN-RAN-01:** Ranking é calculado por job, nunca em tempo real de leitura.
- **RN-RAN-02:** Usuários sem resultados no período aparecem com posição mas com pontuação zero.
- **RN-RAN-03:** Empate: mesmos pontos = mesma posição; próximo salta (se 2 empatarem em 1º, o próximo é 3º).
- **RN-RAN-04:** Ranking global desconsidera campanhas; usa apenas metas e resultados.

### Exemplo de uso
> João lançou R$ 8.500 hoje. O job das 18h recalcula o ranking da campanha "Outubro Verde". João sobe da posição 5 para 3 (variação +2). Maria, supervisora, vê o ranking atualizado às 18:15. Um widget de dashboard de João mostra "Você está em 3º lugar (+2 posições desde ontem)".

### Considerações de performance
- Tabela média-grande (milhões de registros em grandes tenants).
- **MView `user_ranking_monthly`** pré-calculada para rankings mensais globais.
- Índice composto `(campaign_id, period, position)` para consultas "top 10".
- Refresh incremental: apenas usuários com novos resultados desde o último cálculo.

### Considerações de segurança
- Ranking pode ser público (visível a todos os participantes) ou privado (apenas para gestores) — campo `visibility` em `campaigns`.
- Vendedores não vêem ranking de outras filiais (RLS).

---

## 13.2 Entidade: Histórico de Ranking (ranking_history)

### Propósito
Snapshot diário da posição de cada usuário, permitindo análises de evolução ("subiu 5 posições no mês").

### Atributos
- Ranking (referência), Data do snapshot, Posição na data, Pontuação na data.

---

# Capítulo 14 — Domínio DASHBOARD

## 14.1 Entidade: Dashboard (dashboards)

### Propósito
Painel personalizado composto por widgets. Cada usuário pode ter múltiplos dashboards (ex.: "Meu dia", "Minha equipe", "Visão estratégica"). Dashboards podem ser compartilhados (templates).

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Usuário | Referência a Usuário | 0:1 | NULO se for template. |
| Nome | Texto | 1:1 | Ex.: "Dashboard de Vendas". |
| Descrição | Texto | 0:1 | — |
| Layout | JSON | 1:1 | Grid CSS, posições dos widgets. |
| Widgets | N:N via `dashboard_widgets` | 0:N | Widgets incluídos. |
| Permissões | JSON | 0:1 | Quem pode ver/editar. |
| Tema | Enum | 0:1 | `light`, `dark`, `system`. |
| Filtros padrão | JSON | 0:1 | Período, filial, etc. |
| É template | Booleano | 1:1 | Se TRUE, é reutilizável. |
| Status | Enum | 1:1 | `draft`, `active`, `archived`. |

### Relacionamentos

- **N:1** com `companies`, `users` (opcional).
- **N:N** com `widgets` via `dashboard_widgets` (com posição e configuração específica).
- **1:N** com `dashboard_shares` — compartilhamento com outros usuários.

### Regras de negócio
- **RN-DAS-01:** Usuário pode ter até N dashboards ativos (configurável, default 10).
- **RN-DAS-02:** Templates do sistema não podem ser removidos, apenas clonados.
- **RN-DAS-03:** Dashboards compartilhados são read-only para quem recebeu o compartilhamento.

---

## 14.2 Entidade: Widget (widgets)

### Propósito
Catálogo de tipos de widget disponíveis para compor dashboards.

### Atributos
- Código, Nome, Descrição, Tipo (gráfico, meta, ranking, indicador, calendário, notificações, IA, campanhas, mapa, tabela, card), Configuração default (JSON), Ícone, Status.

### Tipos padrão
- Gráfico de barras, Gráfico de linhas, Gráfico de pizza, Donut, Meta, Ranking, Indicadores, Calendário, Notificações, IA Sugestões, Campanhas ativas, Mapa de calor, Tabela dinâmica, Card de KPI.

---

## 14.3 Entidade: Widget do Dashboard (dashboard_widgets)

### Propósito
Instância específica de um widget em um dashboard específico, com configuração própria.

### Atributos
- Dashboard, Widget (tipo), Posição X, Posição Y, Largura, Altura, Configuração (JSON — filtros, indicador exibido, etc.), Ordem de tab.

---

# Capítulo 15 — Domínio NOTIFICAÇÕES

## 15.1 Entidade: Notificação (notifications)

### Propósito
Mensagem que o Orion envia a um usuário, dentro do app, por e-mail, ou por push. Centraliza toda comunicação sistema→usuário.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Destinatário | Referência a Usuário | 1:1 | Quem recebe. |
| Remetente | Referência a Usuário | 0:1 | NULO se for sistema. |
| Título | Texto | 1:1 | Cabeçalho. |
| Mensagem | Texto longo | 1:1 | Corpo. |
| Tipo | Enum | 1:1 | `info`, `success`, `warning`, `error`, `campaign`, `goal`, `result`, `system`. |
| Prioridade | Enum | 1:1 | `low`, `normal`, `high`, `critical`. |
| Canal | Enum | 1:1 | `in_app`, `email`, `push`, `sms`, `webhook`. |
| Link | URL | 0:1 | Para onde navegar ao clicar. |
| Lida em | Data/hora | 0:1 | Quando o usuário marcou como lida. |
| Ação tomada | Enum | 0:1 | Para notificações com ação (ex.: aprovar resultado). |
| Expira em | Data/hora | 0:1 | Após essa data, não exibir mais. |

### Relacionamentos

- **N:1** com `companies`, `users` (destinatário), `users` (remetente, opcional).
- **N:1** com `notification_templates` (se gerada de template).

### Regras de negócio
- **RN-NOT-01:** Notificações `critical` ignoram preferências de "não perturbe" do usuário.
- **RN-NOT-02:** Notificações expiradas não aparecem na lista, mas ficam no histórico.
- **RN-NOT-03:** Máximo de N notificações não lidas por usuário (default 50); acima disso, agrupar.
- **RN-NOT-04:** Canal respeita preferências do usuário (opt-in/out por tipo).

---

## 15.2 Entidade: Template de Notificação (notification_templates)

### Propósito
Templates com placeholders (Handlebars) para mensagens recorrentes, com suporte a i18n (múltiplos idiomas).

### Atributos
- Código, Idioma, Tipo, Assunto, Corpo (com placeholders), Variáveis disponíveis (JSON schema), Versão, Status.

---

## 15.3 Entidade: Fila de E-mail (email_queue)

### Propósito
Fila de e-mails a serem enviados, com retry exponencial e tracking de bounces.

### Atributos
- Destinatário, Remetente, Assunto, Corpo HTML, Anexos, Status (`pending`, `sent`, `failed`, `bounced`), Tentativas, Próxima tentativa, Enviado em, Erro.

---

## 15.4 Entidade: Entrega de Webhook (webhook_deliveries)

### Propósito
Registro de tentativas de entrega de webhooks (para integrações externas), com payload, resposta, retry.

### Atributos
- Webhook (URL + segredo HMAC), Evento, Payload (JSON), Status HTTP, Resposta, Tentativas, Próxima tentativa, Enviado em.

---

# Capítulo 16 — Domínio AUDITORIA

## 16.1 Entidade: Log de Auditoria (audit_logs)

### Propósito
**Nenhuma ação será perdida.** Toda operação de escrita (CREATE/UPDATE/DELETE) em qualquer tabela do Orion gera um registro de auditoria. Permite rastreabilidade completa (quem, quando, o quê, de onde, com qual valor anterior e novo).

### Ciclo de vida
- **Criação:** automática via trigger universais em todas as tabelas de domínio.
- **Modificação:** NUNCA — registros de auditoria são **imutáveis** (write-once).
- **Exclusão:** NUNCA em produção; apenas após retenção legal (default 7 anos, configurável por tenant).

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Usuário | Referência a Usuário | 0:1 | Quem fez (NULL para sistema). |
| Data | Data/hora | 1:1 | Quando. |
| IP | Texto | 0:1 | Origem. |
| User-Agent | Texto | 0:1 | Navegador/dispositivo. |
| Sistema operacional | Texto | 0:1 | Derivado do UA. |
| Ação | Enum | 1:1 | `create`, `update`, `delete`, `view`, `login`, `logout`, `export`, `print`, `configure`. |
| Tabela afetada | Texto | 1:1 | Nome da tabela. |
| Registro afetado | Inteiro (ID) | 1:1 | ID do registro. |
| UUID do registro | UUID | 0:1 | Para referência cruzada. |
| Valor anterior | JSON | 0:1 | Snapshot antes. |
| Valor novo | JSON | 0:1 | Snapshot depois. |
| Diferença | JSON | 0:1 | Apenas campos alterados. |
| Contexto | JSON | 0:1 | Dados extras (ex.: batch_id para operações em lote). |

### Relacionamentos

- **N:1** com `companies`, `users`.
- **1:N** com `audit_log_details` — detalhamento campo-a-campo.

### Regras de negócio
- **RN-AUD-01:** Toda escrita gera log — sem exceções.
- **RN-AUD-02:** Logs são imutáveis (write-once).
- **RN-AUD-03:** Logs contêm apenas hashes de campos sensíveis (senha, tokens), nunca o valor.
- **RN-AUD-04:** Logs são particionados mensalmente; partições > 24 meses são arquivadas em S3 Parquet.
- **RN-AUD-05:** Consultas a logs são limitadas a Admin Master, Admin Empresa e auditores externos (com permissão especial).

### Exemplo de uso
> João lança resultado de R$ 8.500. A trigger `fn_write_audit_log` dispara após o INSERT em `results`, criando um registro em `audit_logs` com: usuário=João, ação=create, tabela=results, registro=12345, valor_novo={valor:8500,...}, IP=200.10.10.5, user-agent="Mozilla/...". Maria aprova o resultado 30 min depois — novo log: ação=update, tabela=results, registro=12345, valor_anterior={status:'pending'}, valor_novo={status:'approved', approved_by: Maria}. Se um auditor perguntar "quem mudou o status desse resultado?", a resposta está em 1 query.

### Considerações de performance
- **Tabela de altíssimo volume** — maior até que `results`.
- **Particionamento RANGE mensal** + subparticionamento HASH para enterprise.
- Índices: `(company_id, user_id, created_at)`, `(table_name, record_id, created_at)`.
- Consultas a logs antigos (24+ meses) vão para S3 + Athena, não para o banco operacional.

### Considerações de segurança
- Acesso extremamente restrito.
- Logs podem conter dados pessoais — criptografia em repouso obrigatória.
- Exportação de logs para auditoria externa gera **seu próprio log de auditoria** (meta-auditoria).

---

## 16.2 Entidade: Detalhe de Auditoria (audit_log_details)

### Propósito
Detalhamento campo-a-campo de uma mudança, permitindo queries como "quais campos foram alterados?" sem parsear o JSON `diff`.

### Atributos
- Audit log (referência), Campo, Valor anterior, Valor novo, Tipo de mudança (`added`, `modified`, `removed`).

---

# Capítulo 17 — Domínio CONFIGURAÇÕES

## 17.1 Entidade: Configuração do Sistema (system_settings)

### Propósito
Centraliza toda configuração por tenant em uma única tabela tipada. Em vez de espalhar flags por colunas em diversas tabelas, preferimos um key-value tipado.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Chave | Texto | 1:1 | Ex.: `auth.session_timeout_minutes`. |
| Valor | Texto (tipado via `value_type`) | 0:1 | O valor em si. |
| Tipo | Enum | 1:1 | `string`, `integer`, `decimal`, `boolean`, `json`, `enum`, `date`. |
| Categoria | Texto | 1:1 | Agrupamento (auth, ui, notification, etc.). |
| Descrição | Texto | 0:1 | Para painel admin. |
| Editável por | Enum | 1:1 | `admin_master`, `admin_company`, `director`, `system`. |
| É do sistema | Booleano | 1:1 | Se TRUE, não pode ser removida. |
| Schema de validação | JSON | 0:1 | Para validar o valor. |

### Regras de negócio
- **RN-SET-01:** Configurações do sistema não podem ser removidas, apenas sobrescritas.
- **RN-SET-02:** Alteração de configuração crítica (ex.: `auth.2fa_required`) exige 2FA do admin.
- **RN-SET-03:** Toda alteração é versionada — permite rollback.

---

## 17.2 Entidade: Campo Personalizado (custom_fields)

### Propósito
Permite que cada empresa crie campos customizados para qualquer cadastro (usuários, filiais, campanhas, indicadores) sem alterar schema.

### Atributos
- Empresa, Entidade alvo (enum: `users`, `branches`, `campaigns`, etc.), Nome, Rótulo, Tipo (`text`, `number`, `date`, `select`, `multiselect`, `file`, `boolean`), Obrigatório, Default, Opções (JSON), Ordem, Validação (regex), Status.

### Regras de negóocio
- **RN-CUS-01:** Valores dos campos customizados são armazenados em `custom_field_values` (N:1 com a entidade).
- **RN-CUS-02:** Campos customizados podem aparecer em relatórios mas não em rankings automáticos (são livres).
- **RN-CUS-03:** Remoção de campo customizado preserva valores históricos em JSON.

---

## 17.3 Entidade: Valor de Campo Personalizado (custom_field_values)

### Propósito
Armazena o valor de um campo customizado para um registro específico.

### Atributos
- Campo (referência), Entidade ( tabela + ID), Valor (texto — conversão no app conforme tipo).

---

# Capítulo 18 — Domínio IA

> **Nota:** este domínio é reservado para V2.0. As entidades são modeladas conceitualmente em V1.0 para garantir que o schema as acomode, mas a implementação é postergada.

## 18.1 Entidade: Conversa de IA (ai_conversations)

### Propósito
Sessão de conversa entre usuário e o assistente de IA do Orion. Permite contexto multi-turno.

### Atributos
- Empresa, Usuário, Título (auto-gerado da primeira mensagem), Status, Total de mensagens, Total de tokens, Modelo usado, Criada em, Última mensagem em.

---

## 18.2 Entidade: Mensagem de IA (ai_messages)

### Propósito
Cada mensagem (turno) dentro de uma conversa — pode ser do usuário ou do assistente.

### Atributos
- Conversa, Role (`user`, `assistant`, `system`), Conteúdo, Tokens, Tempo de resposta, Modelo, Feedback (`positive`, `negative`, `none`), Criada em.

---

## 18.3 Entidade: Prompt de Sistema (ai_prompts)

### Propósito
Catálogo de prompts de sistema versionados, usados para configurar o comportamento do assistente em diferentes contextos (ex.: "análise de meta", "sugestão de campanha").

### Atributos
- Código, Contexto, Conteúdo (prompt template), Versão, Variáveis, Ativo.

---

## 18.4 Entidade: Modelo de IA (ai_models)

### Propósito
Catálogo de modelos de IA disponíveis (ex.: GPT-4, Claude, Llama), com custos, capacidades, status.

### Atributos
- Código, Provedor, Nome, Versão, Context window, Custo por 1K tokens (input/output), Capacidades (JSON), Status.

---

# Capítulo 19 — Domínio LICENCIAMENTO

## 19.1 Entidade: Licença (licenses)

### Propósito
Contrato entre o Orion (Admin Master) e a empresa cliente. Define plano, módulos contratados, limites de uso e validade. Sem licença ativa, o tenant é bloqueado (apenas leitura, sem novos lançamentos).

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Plano | Enum | 1:1 | `trial`, `starter`, `pro`, `enterprise`, `custom`. |
| Número da licença | Texto | 1:1 | Identificador único. |
| Data de ativação | Data | 1:1 | Quando começou. |
| Validade | Data | 1:1 | Quando expira. |
| Máximo de usuários | Inteiro | 1:1 | Limite contratado. |
| Máximo de filiais | Inteiro | 1:1 | Limite contratado. |
| Módulos | JSON | 1:1 | Lista de módulos habilitados. |
| Add-ons | JSON | 0:1 | Recursos extras (IA, API, etc.). |
| Status | Enum | 1:1 | `pending`, `active`, `suspended`, `expired`, `canceled`. |
| Forma de pagamento | Enum | 0:1 | `monthly`, `yearly`, `lifetime`. |

### Regras de negócio
- **RN-LIC-01:** Sem licença ativa, tenant entra em modo read-only após 7 dias de carência.
- **RN-LIC-02:** Exceder limite de usuários bloqueia novos cadastros.
- **RN-LIC-03:** Trial vira `expired` automaticamente após 14 dias se não convertido.
- **RN-LIC-04:** Suspensão por inadimplência preserva dados; reativação restaura acesso.

---

## 19.2 Entidade: Plano (plans)

### Propósito
Catálogo de planos comerciais com features e limites.

### Atributos
- Código, Nome, Descrição, Preço mensal, Preço anual, Limite usuários, Limite filiais, Módulos incluídos, Add-ons disponíveis, Status.

---

## 19.3 Entidade: Módulo (modules)

### Propósito
Catálogo de módulos do Orion que podem ser ativados/desativados por plano.

### Atributos
- Código, Nome, Descrição, Ícone, Dependências (outros módulos), Disponível em planos, Status.

---

# Capítulo 20 — Domínio BACKUP

## 20.1 Entidade: Backup (backups)

### Propósito
Registro de cada snapshot do banco gerado (automático ou manual). Permite restore point-in-time.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 0:1 | NULO se for backup global (Admin Master). |
| Data | Data/hora | 1:1 | Quando foi gerado. |
| Responsável | Referência a Usuário | 0:1 | NULO se automático. |
| Arquivo | Texto (caminho) | 1:1 | Localização no storage. |
| Tamanho | Decimal | 1:1 | Em MB. |
| Tipo | Enum | 1:1 | `full`, `incremental`, `differential`, `snapshot`. |
| Status | Enum | 1:1 | `in_progress`, `completed`, `failed`, `restoring`. |
| Hash | Texto | 0:1 | SHA-256 para integridade. |
| Retenção até | Data | 1:1 | Quando pode ser removido. |

### Regras de negóocio
- **RN-BKP-01:** Backups automáticos diários para todos os tenants.
- **RN-BKP-02:** Retenção mínima de 30 dias; enterprise pode configurar até 7 anos.
- **RN-BKP-03:** Restore de produção exige aprovação dupla (Admin Master + Admin Empresa).
- **RN-BKP-04:** Falha de backup gera alerta crítico para Admin Master.

---

## 20.2 Entidade: Restore (restores)

### Propósito
Registro de operações de restore, com auditoria de quem solicitou, quando, e qual estado foi restaurado.

### Atributos
- Backup origem, Solicitante, Aprovador, Data, Status, Log de execução, Duração.

---

# Capítulo 21 — Domínio API

## 21.1 Entidade: Chave de API (api_keys)

### Propósito
Credenciais M2M (machine-to-machine) para integrações externas (ERP, CRM, BI). Diferente de usuários, não têm sessão — usam chave de longa duração com rate limit.

### Atributos conceituais

| Atributo | Tipo conceitual | Cardinalidade | Descrição |
|---|---|---|---|
| Empresa | Referência a Empresa | 1:1 | Tenant. |
| Nome | Texto | 1:1 | Ex.: "Integração ERP SAP". |
| Hash da chave | Texto | 1:1 | SHA-256 da chave real (nunca armazenada em texto). |
| Prefixo | Texto | 1:1 | Primeiros 8 chars para identificação. |
| Escopos | JSON | 1:1 | Permissões da chave. |
| IP whitelist | JSON | 0:1 | IPs permitidos. |
| Rate limit | Inteiro | 1:1 | Requisições por minuto. |
| Expira em | Data | 0:1 | NULO se sem expiração. |
| Última utilização | Data/hora | 0:1 | Para detectar chaves órfãs. |
| Status | Enum | 1:1 | `active`, `revoked`, `expired`. |
| Criada por | Referência a Usuário | 1:1 | Autor. |

### Regras de negógio
- **RN-API-01:** Chave é exibida apenas UMA vez na criação — nunca mais.
- **RN-API-02:** Rate limit padrão 60 req/min; enterprise até 1000.
- **RN-API-03:** Chave sem uso por 90 dias gera alerta; 180 dias → revogação automática.
- **RN-API-04:** Revogação é imediata e irreversível.

---

## 21.2 Entidade: Webhook (webhooks)

### Propósito
Endpoints externos que o Orion notifica sobre eventos (ex.: `result.created`, `campaign.finished`).

### Atributos
- Empresa, URL, Eventos assinados (JSON), Segredo HMAC, Status, Tentativas máximas, Timeout.

---

## 21.3 Entidade: Registro de Rate Limit (rate_limits)

### Propósito
Contador de requisições por API key e por IP, com janela deslizante.

### Atributos
- API key / IP, Janela (minuto), Contagem, Reset em.

---

# Capítulo 22 — Domínio RELATÓRIOS

## 22.1 Entidade: Template de Relatório (report_templates)

### Propósito
Catálogo de relatórios parametrizáveis (ex.: "Performance mensal por filial", "Ranking de campanha"). Pode ser do sistema ou customizado por tenant.

### Atributos
- Empresa (NULO se sistema), Nome, Descrição, Tipo (`tabular`, `chart`, `pdf`, `excel`), Query/Config (JSON), Parâmetros (JSON schema), Layout (JSON), Permissões, Status.

---

## 22.2 Entidade: Execução de Relatório (report_executions)

### Propósito
Histórico de execuções de relatórios, com parâmetros usados, resultado, tempo de execução.

### Atributos
- Template, Solicitante, Parâmetros (JSON), Iniciado em, Concluído em, Duração, Status, Arquivo resultado (URL), Erro, Filas.

### Regras de negócio
- **RN-REL-01:** Relatórios pesados (mais de 30s) são executados assincronamente e notificados por e-mail.
- **RN-REL-02:** Resultados de relatórios ficam disponíveis por 30 dias; após, são removidos do storage.
- **RN-REL-03:** Exportação de dados sensíveis gera log de auditoria reforçado.

---

# PARTE III — DIAGRAMAS ER DETALHADOS

# Capítulo 23 — Diagramas por Domínio

## 23.1 Diagrama — Domínio CORE + USUÁRIOS + PERMISSÕES

```text
┌─────────────────┐
│   companies     │
│  (Empresas)     │
└────────┬────────┘
         │
         ├─1:N─→ branches ──1:N─→ users ──N:N─→ teams (via team_members)
         │                       │
         │                       ├─N:1─→ roles ──N:N─→ permissions
         │                       │              (via role_permissions)
         │                       │
         │                       ├─1:N─→ sessions
         │                       ├─1:N─→ refresh_tokens
         │                       └─1:N─→ audit_logs
         │
         ├─1:1─→ licenses ──N:1─→ plans ──N:N─→ modules
         │
         ├─1:N─→ system_settings
         ├─1:N─→ custom_fields ──1:N─→ custom_field_values
         └─1:N─→ api_keys
```

## 23.2 Diagrama — Domínio METAS + INDICADORES + RESULTADOS

```text
┌──────────────────────┐
│ indicator_categories │
└──────────┬───────────┘
           │ 1:N
           ▼
┌──────────────────┐         ┌────────────────┐
│   indicators     │◄────────│   campaigns    │
│  (Indicadores)   │ N:N     │ (Campanhas)    │
└────────┬─────────┘         └───────┬────────┘
         │                          │
         │ 1:N                      │ 1:N
         ▼                          ▼
┌──────────────────┐         ┌────────────────────────┐
│      goals       │         │ campaign_indicators    │
│    (Metas)       │         │  (N:N indicators↔camp) │
└────┬─────────────┘         └────────────────────────┘
     │
     │ 1:N (via indicator + escopo + período)
     ▼
┌──────────────────┐
│     results      │◄──── N:N ──── file_uploads
│  (Resultados)    │              (via result_attachments)
└────┬─────────────┘
     │
     │ 1:N
     ▼
┌──────────────────────┐
│   result_approvals   │
└──────────────────────┘
```

## 23.3 Diagrama — Domínio CAMPANHAS + RANKING + PREMIAÇÕES

```text
                  ┌──────────────┐
                  │  campaigns   │
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────────┐
        │                │                    │
        ▼                ▼                    ▼
┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐
│ campaign_       │  │ campaign_        │  │ campaign_      │
│ participants    │  │ indicators       │  │ awards         │
│ (N:N users)     │  │ (N:N indicators) │  │ (N:N awards)   │
└─────────────────┘  └──────────────────┘  └────────┬───────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │    awards    │
                                            │ (Premiações) │
                                            └──────────────┘

       ┌──────────────────┐
       │    rankings      │
       └────────┬─────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
   campaign_id      indicator_id
   (NULO se         (NULO se
    global)          composto)
```

## 23.4 Diagrama — Domínio DASHBOARD + NOTIFICAÇÕES + AUDITORIA

```text
┌──────────────┐         ┌──────────────────┐
│  dashboards  │─N:N────→│     widgets      │
└──────┬───────┘         │  (catálogo)      │
       │                 └──────────────────┘
       │ 1:N
       ▼
┌─────────────────────┐
│ dashboard_widgets   │  (instância com config própria)
└─────────────────────┘


┌──────────────────┐     ┌──────────────────────────┐
│  notifications   │────→│ notification_templates   │
└──────┬───────────┘     └──────────────────────────┘
       │
       ├─N:1─→ users (destinatário)
       └─N:1─→ email_queue / webhook_deliveries


┌──────────────────┐     ┌──────────────────────┐
│   audit_logs     │─1:N─→│ audit_log_details    │
└──────────────────┘     └──────────────────────┘
       │
       └─N:1─→ users (autor)
       └─N:1─→ companies (tenant)
```

---

# Capítulo 24 — Diagrama de Relacionamentos N:N

O Orion tem vários relacionamentos N:N. O diagrama abaixo mostra as tabelas de junção e sua semântica.

```text
╔══════════════════════════════════════════════════════════════════════════╗
║                    RELACIONAMENTOS N:N DO ORION                          ║
╠═══════════════════════╦════════════════════════╦═════════════════════════╣
║   Entidade A          ║ Tabela de junção       ║   Entidade B            ║
╠═══════════════════════╬════════════════════════╬═════════════════════════╣
║ users                 ║ team_members           ║ teams                   ║
║ users                 ║ user_branches          ║ branches                ║
║ users                 ║ campaign_participants  ║ campaigns               ║
║ teams                 ║ campaign_teams         ║ campaigns               ║
║ indicators            ║ campaign_indicators    ║ campaigns               ║
║ awards                ║ campaign_awards        ║ campaigns               ║
║ roles                 ║ role_permissions       ║ permissions             ║
║ results               ║ result_attachments     ║ file_uploads            ║
║ dashboards            ║ dashboard_widgets      ║ widgets                 ║
║ plans                 ║ plan_modules           ║ modules                 ║
╚═══════════════════════╩════════════════════════╩═════════════════════════╝
```

## 24.1 Regras para tabelas de junção

1. **Sempre carregam `company_id`** redundante — para RLS sem JOIN.
2. **Sempre têm campos padrão** (created_at, updated_at, deleted_at, created_by, etc.).
3. **Constraint única composta** (entidadeA_id + entidadeB_id) impede duplicação.
4. **Atributos adicionais** ficam na própria junção (ex.: `weight` em `campaign_indicators`).
5. **Soft delete** também se aplica — um usuário pode "sair" de uma equipe sem perder histórico.

## 24.2 Diagrama de uma junção típica

```text
        ┌──────────────┐                ┌──────────────────────┐                ┌──────────────┐
        │   campaigns  │                │ campaign_indicators  │                │  indicators  │
        │              │                │                      │                │              │
        │  id (PK)     │◄───────────────│  campaign_id (FK)    │                │  id (PK)     │
        │  uuid        │                │  indicator_id (FK)   │───────────────►│  uuid        │
        │  company_id  │                │  company_id          │                │  company_id  │
        │  name        │                │  weight              │                │  name        │
        │  status      │                │  direction           │                │  type        │
        │  ...         │                │  target_value        │                │  ...         │
        └──────────────┘                │  created_at          │                └──────────────┘
                                        │  ...                 │
                                        │  UNIQUE(campaign_id, │
                                        │    indicator_id)     │
                                        └──────────────────────┘
```

---

# PARTE IV — CENÁRIOS DE USO PARA VALIDAÇÃO DO MODELO

Esta parte valida o modelo conceitual através de cenários reais. Para cada cenário, identificamos quais entidades são **lidas**, **criadas**, **modificadas** e quais **regras de negócio** se aplicam.

---

# Capítulo 25 — Cenário A: "João lança resultado de faturamento"

## 25.1 Descrição

João Silva é vendedor da filial FIL-001 da "Comércio Solar". Em 15/10/2025 às 14h30, ele abre o Orion e lança um resultado de faturamento de R$ 8.500,00 referente ao dia 15/10. O indicador "Faturamento Mensal" exige aprovação para lançamentos diários > R$ 5.000. Maria Souza, supervisora de João, aprova o resultado às 15h00 após anexar a nota fiscal.

## 25.2 Entidades envolvidas

### 25.2.1 Leitura (validação)
1. **`users`** — validar que João está ativo.
2. **`branches`** — validar que FIL-001 está ativa.
3. **`indicators`** — obter regras do "Faturamento Mensal" (tipo, unidade, min/max, exige aprovação).
4. **`goals`** — verificar se João tem meta ativa para o indicador no período.
5. **`campaigns`** — verificar campanhas ativas em 15/10 que incluam João e o indicador.
6. **`role_permissions`** — validar que João tem permissão `results.create`.

### 25.2.2 Criação
1. **`results`** — novo registro:
   - `user_id`: João
   - `indicator_id`: Faturamento Mensal
   - `value`: 8500.00
   - `result_date`: 2025-10-15
   - `status`: `pending`
   - `origin`: `manual`
2. **`audit_logs`** — log de criação (disparado por trigger):
   - `user_id`: João
   - `action`: `create`
   - `table_name`: `results`
   - `record_id`: <id do novo resultado>
   - `value_new`: {valor:8500,...}
3. **`notifications`** — notificação para Maria:
   - `recipient_id`: Maria
   - `type`: `result`
   - `priority`: `normal`
   - `message`: "João lançou R$ 8.500 em Faturamento Mensal. Aprovação pendente."
   - `link`: `/results/<uuid>`

### 25.2.3 Modificação (quando Maria aprova)
1. **`results`** — UPDATE no registro:
   - `status`: `approved`
   - `approved_by`: Maria
   - `approved_at`: 2025-10-15 15:00:00
2. **`result_approvals`** — novo registro:
   - `result_id`: <id>
   - `decider_id`: Maria
   - `decision`: `approved`
   - `comment`: "Conferido com nota fiscal"
3. **`file_uploads`** + **`result_attachments`** — anexo da nota fiscal:
   - `file_uploads`: novo registro com metadata do PDF
   - `result_attachments`: vincula file_upload ao result
4. **`audit_logs`** — novo log:
   - `action`: `update`
   - `value_old`: {status: 'pending'}
   - `value_new`: {status: 'approved', approved_by: Maria, ...}
5. **`notifications`** — notificação para João:
   - `message`: "Seu resultado de R$ 8.500 foi aprovado por Maria."

### 25.2.4 Recálculo assíncrono (via job)
1. **`rankings`** — recálculo da posição de João:
   - Na campanha "Outubro Verde"
   - No ranking mensal global
   - Atualização de `position` e `variation`
2. **MView `goal_progress_daily`** — refresh incremental
3. **MView `user_ranking_monthly`** — refresh incremental
4. **MView `campaign_leaderboard`** — refresh incremental

## 25.3 Regras de negócio acionadas

- **RN-RES-01:** Valor (8500) está entre min/max do indicador.
- **RN-RES-02:** Resultado no dia atual não requer aprovação obrigatória, mas por ser > R$ 5.000 (regra do indicador), exige.
- **RN-RES-03:** Após aprovado, é imutável — estorno criaria novo resultado negativo.
- **RN-RES-05:** Sistema verifica duplicação (João + indicador + data + valor + origem).
- **RN-CAM-04:** Resultado aprovado conta para a campanha.

## 25.4 Performance esperada

- **Criação do resultado:** < 100ms (INSERT + trigger de auditoria).
- **Notificação:** enfileirada, assíncrona (< 50ms para enfileirar).
- **Aprovação:** < 200ms (UPDATE + INSERT em result_approvals + INSERT em file_uploads + INSERT em result_attachments + audit_logs).
- **Recálculo de ranking:** job rodando a cada 15 min; João vê atualização em até 15 min.
- **MViews:** refresh on-demand após commit do resultado, em background.

---

# Capítulo 26 — Cenário B: "Maria cria campanha para equipe"

## 26.1 Descrição

Maria Souza agora atua como Diretora (promovida). Em 20/09/2025, ela cria a campanha "Outubro Verde" para a equipe de vendas da FIL-001, com período 01/10–31/10/2025, usando dois indicadores (Faturamento 70%, Ticket Médio 30%), e três premiações (1º iPhone, 2º Smartwatch, 3º Bonificação R$ 500). Ela inscreve automaticamente todos os vendedores ativos da filial.

## 26.2 Entidades envolvidas

### 26.2.1 Leitura (validação)
1. **`users`** — validar que Maria tem papel Diretor e permissão `campaigns.create`.
2. **`branches`** — validar que FIL-001 existe.
3. **`indicators`** — validar que "Faturamento Mensal" e "Ticket Médio" existem e estão ativos.
4. **`awards`** — validar que iPhone, Smartwatch e Bonificação existem no catálogo (ou criar).
5. **`users`** (via `team_members` ou `branches`) — listar vendedores ativos da filial para inscrição automática.

### 26.2.2 Criação
1. **`campaigns`** — novo registro:
   - `name`: "Outubro Verde"
   - `status`: `scheduled` (porque start_date é futuro)
   - `start_date`: 2025-10-01
   - `end_date`: 2025-10-31
   - `created_by`: Maria
2. **`campaign_indicators`** — 2 registros (N:N):
   - campaign + Faturamento Mensal, weight=70, direction=higher_better
   - campaign + Ticket Médio, weight=30, direction=higher_better
3. **`campaign_awards`** — 3 registros (N:N):
   - campaign + award "iPhone", criterion=position_1
   - campaign + award "Smartwatch", criterion=position_2
   - campaign + award "Bonificação R$500", criterion=position_3
4. **`campaign_participants`** — N registros (1 por vendedor ativo da filial):
   - status: `accepted` (auto-inscrição)
   - opt_in_communication: TRUE
5. **`audit_logs`** — log de criação da campanha + logs de inscrição em lote (com `batch_id`).
6. **`notifications`** — N notificações (1 por participante):
   - `message`: "Você foi inscrito na campanha 'Outubro Verde'. Boa sorte!"

### 26.2.3 Modificação (em 01/10/2025, via job agendado)
1. **`campaigns`** — UPDATE:
   - `status`: `scheduled` → `active`
2. **`audit_logs`** — log:
   - `user_id`: NULL (sistema)
   - `action`: `update`
   - `value_old`: {status: 'scheduled'}
   - `value_new`: {status: 'active'}

## 26.3 Regras de negócio acionadas

- **RN-CAM-02:** Período é futuro em 20/09 — permitido.
- **RN-CAM-03:** Pesos 70+30 = 100% — validado.
- **RN-CAM-01:** Campanha só pode ser cancelada antes do fim.
- **RN-CAM-04:** A partir de 01/10, resultados aprovados dos participantes contam.
- Verificação de sobreposição: se já existe campanha ativa para a mesma filial + indicadores + período sobreposto, alerta (mas não bloqueia — pode haver múltiplas campanhas simultâneas).

## 26.4 Performance esperada

- **Criação da campanha:** < 200ms.
- **Inscrição em lote (50 vendedores):** < 2s com batch insert.
- **Job de ativação em 01/10:** rodado a cada minuto, identifica campanhas `scheduled` com `start_date <= now()` e ativa.
- **Recálculo de ranking da campanha:** job dedicado a cada 15 min enquanto `status=active`.

---

# Capítulo 27 — Cenário C: "Diretor consulta dashboard executivo"

## 27.1 Descrição

Carlos Diretor abre o Orion em 31/10/2025 às 09h00. Ele tem um dashboard chamado "Visão Estratégica Outubro" com 6 widgets:
1. KPI Card: Faturamento total da empresa em outubro.
2. Gráfico de barras: Faturamento por filial.
3. Ranking: Top 10 vendedores da empresa.
4. Gráfico de linha: Evolução diária de faturamento.
5. Card de campanhas ativas.
6. Tabela: Meta vs. realizado por filial.

## 27.2 Entidades envolvidas

### 27.2.1 Leitura (todas em paralelo, com cache)
1. **`dashboards`** + **`dashboard_widgets`** + **`widgets`** — obter layout e configuração.
2. **`system_settings`** — preferências (tema, idioma).
3. **`users`** — validar persona Diretor e escopo.
4. **`results`** (agregado) — faturamento total, por filial, top 10, evolução diária.
5. **`goals`** — metas de outubro por filial.
6. **`campaigns`** + **`rankings`** — campanhas ativas e seus rankings.
7. **MView `goal_progress_daily`** — progresso das metas.
8. **MView `user_ranking_monthly`** — top 10.
9. **MView `branch_performance_monthly`** — por filial.

### 27.2.2 Criação (apenas metadados)
1. **`audit_logs`** — log de `view` do dashboard (RN-AUD-01).
2. **`dashboard_views`** (tabela opcional) — incrementar contador de visualizações.
3. **`notifications`** — se houver alertas pendentes (ex.: metas em risco).

### 27.2.3 Sem modificações em dados de domínio

Diretor está em modo leitura — nada em `results`, `goals`, `campaigns` é alterado.

## 27.3 Agregações necessárias

### 27.3.1 KPI Card — Faturamento total
```text
SELECT SUM(value)
FROM results
WHERE company_id = :tenant
  AND indicator_id = :fat_mensal
  AND result_date BETWEEN '2025-10-01' AND '2025-10-31'
  AND status = 'approved'
  AND deleted_at IS NULL;
```
**Atalho:** MView `indicator_summary_monthly` já tem isso pré-calculado.

### 27.3.2 Gráfico de barras — Por filial
```text
SELECT b.name, SUM(r.value)
FROM results r
JOIN branches b ON b.id = r.branch_id
WHERE r.company_id = :tenant
  AND r.indicator_id = :fat_mensal
  AND r.result_date BETWEEN '2025-10-01' AND '2025-10-31'
  AND r.status = 'approved'
GROUP BY b.name;
```
**Atalho:** MView `branch_performance_monthly`.

### 27.3.3 Ranking — Top 10
```text
SELECT u.name, r.total
FROM user_ranking_monthly r  -- MView
JOIN users u ON u.id = r.user_id
WHERE r.company_id = :tenant
  AND r.indicator_id = :fat_mensal
  AND r.period_month = '2025-10'
ORDER BY r.total DESC
LIMIT 10;
```

### 27.3.4 Evolução diária
```text
SELECT result_date, SUM(value)
FROM results
WHERE company_id = :tenant
  AND indicator_id = :fat_mensal
  AND result_date BETWEEN '2025-10-01' AND '2025-10-31'
  AND status = 'approved'
GROUP BY result_date
ORDER BY result_date;
```
**Atalho:** MView `goal_progress_daily`.

### 27.3.5 Campanhas ativas
```text
SELECT name, start_date, end_date, status
FROM campaigns
WHERE company_id = :tenant
  AND status = 'active'
  AND start_date <= CURRENT_DATE
  AND end_date >= CURRENT_DATE;
```

### 27.3.6 Meta vs. realizado
```text
SELECT b.name,
       g.value AS meta,
       COALESCE(SUM(r.value), 0) AS realizado
FROM goals g
JOIN branches b ON b.id = g.branch_id
LEFT JOIN results r ON r.branch_id = g.branch_id
                   AND r.indicator_id = g.indicator_id
                   AND r.result_date BETWEEN g.start_date AND g.end_date
                   AND r.status = 'approved'
WHERE g.company_id = :tenant
  AND g.indicator_id = :fat_mensal
  AND g.start_date = '2025-10-01'
GROUP BY b.name, g.value;
```

## 27.4 Regras de negócio acionadas

- **RN-DAS-01:** Diretor tem N dashboards ativos (dentro do limite).
- **RN-RAN-01:** Rankings são lidos de MView, nunca calculados em tempo real.
- **RN-PER-** (persona): Diretor vê toda a empresa; filtro por `company_id` é suficiente.
- **RN-AUD-01:** A leitura do dashboard gera log de auditoria (porque expõe dados sensíveis).

## 27.5 Performance esperada

- **Carregamento do dashboard:** < 1s (com cache Redis).
- **Cache invalidation:** ao aprovar um resultado, job invalida as MViews relacionadas — refresh em até 5 min.
- **Sem cache:** 2–5s para dashboards com 6 widgets (consultas paralelas).

---

# Capítulo 28 — Cenário D: "Admin desativa usuário" (cascade)

## 28.1 Descrição

O Admin Empresa "Ana" desativa o usuário "Pedro" em 31/10/2025. Pedro era vendedor da FIL-001, participante de 2 campanhas ativas, com 3 metas em andamento e 47 resultados aprovados em outubro. O cenário descreve o **cascade de efeitos**.

## 28.2 Entidades envolvidas

### 28.2.1 Modificação direta
1. **`users`** — UPDATE:
   - `status`: `active` → `inactive`
   - `active`: FALSE
   - `updated_by`: Ana
   - `updated_at`: 2025-10-31 14:00:00
2. **`sessions`** — UPDATE em todas as sessões ativas de Pedro:
   - `revoked_at`: 2025-10-31 14:00:00
   - `revocation_reason`: "user_inactivated"
3. **`refresh_tokens`** — UPDATE em todos os tokens ativos:
   - `revoked_at`: 2025-10-31 14:00:00
   - `revocation_reason`: "user_inactivated"
4. **`audit_logs`** — log:
   - `user_id`: Ana
   - `action`: `update`
   - `table_name`: `users`
   - `record_id`: <Pedro>
   - `value_old`: {status: 'active', active: true}
   - `value_new`: {status: 'inactive', active: false}

### 28.2.2 Efeitos em cascata (assíncronos, via jobs)

1. **`campaign_participants`** — UPDATE em inscrições ativas:
   - `status`: `accepted` → `removed`
   - Audit log para cada inscrição.
2. **`rankings`** — Pedro é removido dos rankings futuros (não dos passados):
   - Próximo cálculo de ranking desconsidera Pedro.
   - Rankings históricos (anteriores à desativação) preservam Pedro.
3. **`goals`** — UPDATE em metas futuras:
   - `status`: `active` → `canceled` (apenas para metas em períodos futuros)
   - Audit log.
4. **`results`** — **NÃO sofrem alteração**:
   - Os 47 resultados aprovados permanecem.
   - Continuam contando para rankings da campanha (porque foram realizados quando Pedro estava ativo).
5. **`notifications`** — criadas para:
   - Pedro: "Sua conta foi desativada. Em caso de dúvida, contate o RH."
   - Supervisor de Pedro: "Pedro foi desativado. Reatribua metas e clientes."
   - Diretor: "Vendedor Pedro desativado — impacto em 2 campanhas ativas."

### 28.2.3 Efeitos adicionais

6. **`goal_distributions`** — se Pedro tinha metas distribuídas a ele a partir de meta de filial, a meta pai precisa ser redistribuída:
   - Job identifica a meta pai.
   - Notifica Gerente para reabrir distribuição.
7. **`audit_logs`** — meta-log: " cascade job executado em <timestamp>, N registros afetados".

## 28.3 Regras de negócio acionadas

- **RN-010:** Suspensão revoga sessões imediatamente.
- **RN-007 (LGPD):** Dados pessoais de Pedro preservados por prazo mínimo (default 5 anos).
- **RN-MET-05:** Meta cancelada não conta para ranking.
- **RN-CAM-:** Pedro não conta mais como participante ativo, mas resultados já lançados permanecem.
- **RN-AUD-01:** Toda modificação gera log.

## 28.4 Decisão de design — soft delete vs inativação

Por que **inativar** (`status=inactive`, `active=FALSE`) em vez de **soft delete** (`deleted_at=<now>`)?

| Critério | Inativação | Soft delete |
|---|---|---|
| Aparece em relatórios históricos | Sim | Não (por padrão) |
| Pode ser reativado | Sim, fácil | Difícil (precisa "undelete") |
| Permite login | Não | Não |
| Aparece em listas de seleção | Não | Não |
| Dados preservados | Sim | Sim |

Para desativação de funcionário (saída da empresa), **inativação** é a escolha correta — preserva histórico e permite recontratação.

Soft delete é reservado para casos como: usuário cadastrado por engano, ainda sem atividade.

## 28.5 Performance esperada

- **Operação direta (UPDATE users + sessions + refresh_tokens):** < 500ms.
- **Cascade assíncrono:** job processa em background, 30s–2min dependendo do volume.
- **Notificações:** enfileiradas, entregues em < 1min.

---

# PARTE V — CONSIDERAÇÕES DE DESIGN

# Capítulo 29 — Por que multi-tenant com shared database?

## 29.1 As três opções de multi-tenancy

| Estratégia | Descrição | Prós | Contras |
|---|---|---|---|
| **Database-per-tenant** | Cada empresa tem seu próprio banco | Isolamento máximo, backup/restore granular | Custo alto, difícil de escalar para milhares de tenants, migrations em N bancos |
| **Schema-per-tenant** | Cada empresa tem seu schema no mesmo banco | Bom isolamento, gerenciável | PostgreSQL tem limite prático de ~1000 schemas; migrations complexas |
| **Shared database, shared schema** | Todos no mesmo schema, com `company_id` | Custo baixo, escalonável, migrations uma vez | Risco de vazamento cross-tenant se RLS falhar |

## 29.2 A escolha do Orion

O Orion adota **shared database + shared schema** com `company_id` em todas as tabelas e **RLS (Row-Level Security)** habilitado em três camadas:

1. **SQL (RLS PostgreSQL):** policy automática por `company_id`.
2. **ORM (Prisma middleware):** middleware adiciona `WHERE company_id = ?` em todas as queries.
3. **API (Fastify hook):** hook valida que o `company_id` da sessão bate com o da query.

A redundância é intencional — falha em uma camada é capturada pelas outras.

## 29.3 Por que essa escolha?

- **Custo:** um único cluster PostgreSQL atende milhares de tenants pequenos/médios.
- **Operação:** migrations aplicadas uma vez atingem todos os tenants.
- **Manutenção:** backup global cobre todos; restore granular via export SQL filtrado por `company_id`.
- **Futuro:** se um tenant crescer muito (enterprise), pode ser migrado para schema próprio sem mudança de código.

## 29.4 Mitigação de riscos

- **Vazamento cross-tenant:** RLS obrigatório, testes de penetração, fuzzing de queries.
- **Noisy neighbor:** rate limiting por tenant, throttling de queries pesadas, isolamento de connection pool.
- **Backup granular:** export SQL filtrado por `company_id` permite restore de tenant único.

---

# Capítulo 30 — Por que soft delete em tudo?

## 30.1 Princípio

No Orion, **nenhuma entidade é fisicamente removida em produção**. `deleted_at` sinaliza exclusão lógica; views padrão filtram `WHERE deleted_at IS NULL`.

## 30.2 Razões

### 30.2.1 Auditoria e compliance (LGPD)
LGPD exige rastreabilidade de dados pessoais. Soft delete preserva histórico mesmo após "remoção" pelo usuário, permitindo:
- Atender a solicitações de "direito ao esquecimento" de forma controlada (anônimização em vez de delete físico).
- Restaurar dados apagados por engano.

### 30.2.2 Integridade referencial
Resultados de Pedro (vendedor desativado) ainda referenciam o Pedro. Se Pedro fosse fisicamente removido, teríamos:
- `results.user_id` órfão (FK violada) ou
- Anônimização que perde contexto histórico.

Com soft delete, o registro do usuário permanece, apenas invisível nas listas.

### 30.2.3 Análise histórica
Rankings históricos, relatórios de performance, dashboards de evolução — todos precisam de dados "excluídos" para serem coerentes. Soft delete permite `WHERE deleted_at IS NULL OR deleted_at > :data_do_relatorio`.

### 30.2.4 Undo
Usuário apagou campanha por engano? Restauração imediata com `UPDATE ... SET deleted_at = NULL`.

## 30.3 Como evitar acúmulo de lixo

- **Particionamento:** tabelas de alto volume (`results`, `audit_logs`, `notifications`) são particionadas por mês. Partições antigas podem ser **detached e arquivadas em S3 Parquet** — efetivamente removidas do banco operacional sem `DELETE`.
- **Job de purge:** job diário identifica registros com `deleted_at < now() - INTERVAL '5 years'` e os move para archive (export + `DELETE` físico da partição).
- **Views padrão:** todas as queries via ORM usam `WHERE deleted_at IS NULL` automaticamente (middleware Prisma).

## 30.4 Quando soft delete NÃO é suficiente

- **Tabelas puramente de log/queue** (`email_queue`, `webhook_deliveries`, `audit_logs`): não têm soft delete; têm retenção temporal (delete físico após N dias).
- **Sessões expiradas:** cleanup físico diário.
- **Refresh tokens revogados:** cleanup após 30 dias.

---

# Capítulo 31 — Por que versionamento em entidades críticas?

## 31.1 Princípio

Entidades críticas (`indicators`, `goals`, `campaigns`, `permissions`, `system_settings`) têm campo `version INTEGER` que é **incrementado a cada UPDATE**. O UPDATE só procede se a versão informada pela aplicação bater com a versão atual do registro.

## 31.2 Razões

### 31.2.1 Concorrência otimista

Cenário: Maria e Carlos editam a mesma meta simultaneamente. Sem versionamento, a última gravação sobrescreve a primeira silenciosamente. Com versionamento:

```text
1. Maria lê a meta: version=3, value=50000
2. Carlos lê a meta: version=3, value=50000
3. Maria salva: UPDATE ... SET value=55000, version=4 WHERE id=X AND version=3
   → 1 linha afetada. OK.
4. Carlos salva: UPDATE ... SET value=60000, version=4 WHERE id=X AND version=3
   → 0 linhas afetadas. Conflito!
5. App recarrega a meta (agora version=4, value=55000), Carlos decide merge ou sobrescrever.
```

### 31.2.2 Histórico de versões (em entidades críticas)

Para `indicators` e `goals`, o Orion mantém tabela de histórico (`indicator_versions`, `goal_versions`) com snapshot completo de cada versão. Permite:
- "Como estava a fórmula desse indicador em janeiro?"
- "Quem alterou a meta de Pedro e quando?"
- Restaurar versão anterior em caso de erro.

### 31.2.3 Auditoria reforçada

Mudanças de versão em entidades críticas geram log de auditoria de alta criticidade, com 2FA do autor.

## 31.3 Implementação

- **Trigger BEFORE UPDATE:** incrementa `version` automaticamente.
- **Constraint CHECK:** `version >= 1`.
- **App:** usa `UPDATE ... WHERE id=? AND version=? RETURNING version`. Se 0 linhas, lança `OptimisticLockError`.

## 31.4 Entidades que NÃO precisam de versionamento

- `results` (imutáveis após aprovação; estorno cria novo registro).
- `audit_logs` (imutáveis por design).
- `notifications` (write-once até leitura).
- Tabelas de fila (`email_queue`, etc.).

---

# Capítulo 32 — Estratégia para tabela `results` (alto volume)

## 32.1 Por que `results` é especial

Estimativa de volume:
- Tenant pequeno: 1k resultados/mês → 12k/ano.
- Tenant médio: 50k/mês → 600k/ano.
- Tenant enterprise: 1M/mês → 12M/ano.
- 100 tenants enterprise: 1.2B/ano.

Em 3 anos, podemos ter **bilhões de registros**. PostgreSQL aguenta, mas exige estratégia.

## 32.2 Estratégia em camadas

### 32.2.1 Particionamento RANGE mensal por `result_date`

```text
results
├── results_2025_01 (PARTITION OF results FOR VALUES FROM ('2025-01-01') TO ('2025-02-01'))
├── results_2025_02
├── ...
├── results_2025_10
└── results_2025_11
```

**Por que mensal?**
- Granularidade suficiente para consultas temporais.
- Cada partição tem tamanho gerenciável (50–500GB).
- Detach de partições antigas é trivial.

### 32.2.2 Subparticionamento HASH (enterprise)

Para tenants com > 5M resultados/mês, subparticiona por `HASH(company_id)`:

```text
results_2025_10
├── results_2025_10_company_hash_0
├── results_2025_10_company_hash_1
├── ...
└── results_2025_10_company_hash_15
```

Isso permite paralelismo em queries cross-tenant (Admin Master) sem degradar.

### 32.2.3 PK composta `(id, result_date)`

PostgreSQL exige que a PK de tabela particionada inclua a chave de partição. Por isso: `PRIMARY KEY (id, result_date)`.

### 32.2.4 Índices

- **Primário:** `(id, result_date)`.
- **Lookup por usuário:** `(company_id, user_id, indicator_id, result_date)`.
- **Lookup por filial:** `(company_id, branch_id, indicator_id, result_date)`.
- **Status pendente:** `(company_id, status, result_date) WHERE status = 'pending'` (índice parcial).
- **Único anti-duplicação:** `UNIQUE (company_id, user_id, indicator_id, result_date, value, origin) WHERE deleted_at IS NULL`.

### 32.2.5 MViews pré-calculadas

- `goal_progress_daily` — soma diária por usuário+indicador.
- `user_ranking_monthly` — ranking mensal por indicador.
- `branch_performance_monthly` — agregado por filial.
- `indicator_summary_monthly` — agregado por indicador.
- `campaign_leaderboard` — ranking da campanha.

Refresh **concurrently** (não bloqueia leitura) via `pg_cron` a cada 15 min para campanhas ativas, e on-demand após commit de resultado.

### 32.2.6 Archive

Partições com > 24 meses:
1. **DETACH** da partição pai.
2. **Export** para S3 em formato Parquet (columnar, comprimido).
3. **DROP** da partição no banco operacional.
4. Consultas a dados antigos vão via Athena/Presto sobre S3.

### 32.2.7 Compression

Em PostgreSQL 15+, usar **TOAST** com compressão LZ4 em campos JSONB (ex.: `audit_context`).

---

# Capítulo 33 — Quando usar JSON vs colunas separadas

## 33.1 Princípio

O Orion usa tanto colunas separadas quanto campos JSONB. A escolha depende do padrão de acesso.

## 33.2 Use colunas separadas quando

1. **Aparece em `WHERE`/`JOIN`/`ORDER BY`** de hot paths.
   - Ex.: `users.email`, `results.user_id`, `goals.start_date`.
2. **Tem constraint de integridade** (`UNIQUE`, `CHECK`, `FK`).
   - Ex.: `companies.cnpj` (UNIQUE).
3. **É fortemente tipado** e nunca muda de tipo.
   - Ex.: `results.value` (DECIMAL).
4. **Aparece em índices**.
5. **É campo padrão universal** (`id`, `uuid`, `created_at`, etc.).

## 33.3 Use JSON quando

1. **Atributos extensíveis por tenant** sem migration.
   - Ex.: `metadata` em toda entidade — para campos customizados experimentais.
2. **Estrutura variável** dependente de outro campo.
   - Ex.: `campaigns.rules` (regras específicas de cada campanha).
   - Ex.: `dashboard_widgets.configuration` (config específica por tipo de widget).
3. **Snapshot de contexto** para auditoria.
   - Ex.: `audit_logs.value_old`, `audit_logs.value_new`, `audit_logs.context`.
4. **Configuração tipada** com schema de validação.
   - Ex.: `system_settings.validation_schema`.

## 33.4 Antipadrões

### 33.4.1 "JSON bag" — tudo em um campo JSON
```text
-- ❌ ERRADO
results.json_data = {
  "user_id": 123,
  "indicator_id": 456,
  "value": 8500,
  "result_date": "2025-10-15",
  ...
}
```
Impede índices, JOINs, constraints. Lentidão em qualquer filtro.

### 33.4.2 JSON para dados que mudam frequentemente
Se um campo JSON é atualizado a cada operação, o TOAST recomprime a linha inteira — overhead alto.

### 33.4.3 JSON para dados sensíveis sem criptografia
JSONB não suporta encrypt-by-field. Dados sensíveis em JSON exigem criptografia em nível de aplicação.

## 33.5 Exemplos no Orion

| Campo | Estrutura | Por quê |
|---|---|---|
| `users.metadata` | JSONB | Preferências que variam por tenant, sem schema fixo. |
| `campaigns.rules` | JSONB | Regras específicas, estruturadas mas variáveis. |
| `audit_logs.value_old/new` | JSONB | Snapshot de qualquer entidade — estrutura varia. |
| `system_settings.value` | Texto tipado | Simples key-value, validação via `validation_schema`. |
| `dashboard_widgets.configuration` | JSONB | Cada tipo de widget tem config própria. |
| `indicators.formula` | JSONB estruturado | Árvore de operações; interpretada por engine. |

## 33.6 Quando migrar de JSON para coluna

Sinal de que é hora de migrar:
1. Começa a aparecer em `WHERE` com frequência (ex.: `metadata->>'region' = 'SP'`).
2. Queries ficam lentas por causa de parse de JSON.
3. Necessidade de constraint (`UNIQUE`, `CHECK`).
4. Múltiplos tenants pedem o mesmo campo.

**Migração:**
1. Adiciona coluna (nullable).
2. Backfill progressivo: `UPDATE ... SET new_col = (metadata->>'field')::type WHERE id BETWEEN X AND Y`.
3. Cria índice `CONCURRENTLY`.
4. Atualiza app para ler da coluna.
5. Remove campo do JSON (após grace period).

---

# PARTE VI — ESTRATÉGIA E PRÓXIMOS PASSOS

# Capítulo 34 — Estratégia de Crescimento

O banco foi projetado para permitir:

- **Milhares de empresas** (multi-tenant shared DB suporta 10k+ tenants por cluster).
- **Milhões de usuários** (`users` com índices em `(company_id, status)`, paginação cursor-based).
- **Bilhões de registros históricos** (`results` particionada mensalmente, archive em S3 após 24 meses).

## 34.1 Marcos de escala

| Marco | Tenants | Usuários | Results/mês | Estratégia |
|---|---|---|---|---|
| MVP | 1–10 | 100–1k | 10k | Single PG, sem particionamento |
| Early growth | 10–100 | 1k–10k | 100k | Particionamento mensal em `results`, MViews |
| Mid growth | 100–1k | 10k–100k | 1M | Subparticionamento HASH, read replicas |
| Enterprise | 1k–10k | 100k–1M | 10M | Connection pooling (PgBouncer), tenants enterprise em schema próprio |
| Hyper scale | 10k+ | 1M+ | 100M+ | Sharding por `company_id`, Cassandra para `audit_logs`, S3+ Athena para histórico |

## 34.2 Sem necessidade de remodelagem estrutural

Todas as estratégias acima são **aditivas**:
- Particionamento é habilitado em tabelas existentes sem mudança de schema lógico.
- MViews são aditivas.
- Read replicas não mudam a aplicação.
- Sharding futuro usa `company_id` (já presente em todas as tabelas) como chave.

---

# Capítulo 35 — Sugestões Estratégicas

## 35.1 Sistema de Campos Personalizados

Cada empresa poderá criar novos campos para qualquer cadastro (usuários, filiais, campanhas, indicadores etc.), definindo tipo (texto, número, data, lista, arquivo), obrigatoriedade e regras de validação, sem alterar o banco de dados.

**Implementação:**
- Tabela `custom_fields` (catálogo por tenant).
- Tabela `custom_field_values` (valores por entidade).
- Ou, alternativa: usar `metadata` JSONB com schema validado por `custom_fields`.

**Quando migrar para coluna dedicada:** ver Cap. 33.6.

## 35.2 Versionamento de Configurações

Toda alteração em metas, indicadores, campanhas e permissões deverá gerar uma nova versão. Assim, será possível restaurar configurações anteriores e manter um histórico completo das mudanças.

**Implementação:**
- Campo `version` em entidades críticas (Cap. 31).
- Tabelas `_versions` (snapshot) para `indicators`, `goals`, `campaigns`.
- UI de "histórico de versões" com diff visual.

## 35.3 Data Warehouse Futuro

Desde o início, vamos separar o banco operacional do banco analítico. Isso facilitará a implementação de Business Intelligence (BI), dashboards avançados e modelos de IA sem impactar o desempenho do sistema principal.

**Implementação incremental:**
1. **V1.0:** MViews dentro do próprio PostgreSQL (já no escopo).
2. **V1.5:** Export diário para S3 Parquet; Athena para queries ad-hoc.
3. **V2.0:** Data warehouse dedicado (Snowflake, BigQuery, ou Redshift) com pipeline ETL/ELT.
4. **V2.5:** ML/AI sobre o DW (previsão de meta, detecção de anomalia).

## 35.4 Observabilidade de modelo

- Dashboard interno (Admin Master) com métricas de saúde do schema:
  - Top 10 tabelas por tamanho.
  - Top 10 queries mais lentas.
  - Índices não usados.
  - Partições prestes a arquivar.
- Alertas para: crescimento anormal de tabela, índice ineficiente, RLS desabilitada.

## 35.5 Catálogo de dados (data catalog)

- Documentação viva do schema: descrição de cada tabela, campo, ENUM.
- Integrado ao painel admin: "O que significa `result_status='revised'`?" → tooltip com definição.
- Reduz onboarding de novos engenheiros.

---

# Capítulo 36 — Mapeamento para o Documento 06 (LDM)

Este documento conceitual é a **fonte de verdade semântica**. O Documento 06 (Logical Database Model) é a **tradução para SQL/Prisma**.

## 36.1 Correspondência entidade → tabela

| Entidade conceitual (Doc 05) | Tabela lógica (Doc 06) | Domínio |
|---|---|---|
| Empresa | `companies` | CORE |
| Filial | `branches` | CORE |
| Departamento | `departments` | CORE |
| Equipe | `teams` | CORE |
| Usuário | `users` | USUÁRIOS |
| Cargo | `roles` | PERMISSÕES |
| Sessão | `sessions` | USUÁRIOS |
| Refresh Token | `refresh_tokens` | USUÁRIOS |
| Permissão | `permissions` | PERMISSÕES |
| Role_Permissions | `role_permissions` | PERMISSÕES |
| Indicador | `indicators` | INDICADORES |
| Categoria | `indicator_categories` | INDICADORES |
| Meta | `goals` | METAS |
| Ajuste de Meta | `goal_adjustments` | METAS |
| Distribuição de Meta | `goal_distributions` | METAS |
| Resultado | `results` (particionada) | RESULTADOS |
| Aprovação de Resultado | `result_approvals` | RESULTADOS |
| Anexo | `file_uploads` | RESULTADOS |
| Campanha | `campaigns` | CAMPANHAS |
| Participantes | `campaign_participants` | CAMPANHAS |
| Indicadores da Campanha | `campaign_indicators` | CAMPANHAS |
| Premiação | `awards` | CAMPANHAS |
| Premiação da Campanha | `campaign_awards` | CAMPANHAS |
| Ranking | `rankings` | RANKING |
| Histórico de Ranking | `ranking_history` | RANKING |
| Dashboard | `dashboards` | DASHBOARD |
| Widget | `widgets` | DASHBOARD |
| Widget do Dashboard | `dashboard_widgets` | DASHBOARD |
| Notificação | `notifications` | NOTIFICAÇÕES |
| Template de Notificação | `notification_templates` | NOTIFICAÇÕES |
| Fila de E-mail | `email_queue` | NOTIFICAÇÕES |
| Entrega de Webhook | `webhook_deliveries` | NOTIFICAÇÕES |
| Log de Auditoria | `audit_logs` (particionada) | AUDITORIA |
| Detalhe de Auditoria | `audit_log_details` | AUDITORIA |
| Configuração do Sistema | `system_settings` | CONFIGURAÇÕES |
| Campo Personalizado | `custom_fields` | CONFIGURAÇÕES |
| Valor de Campo Personalizado | `custom_field_values` | CONFIGURAÇÕES |
| Conversa de IA | `ai_conversations` | IA (V2.0) |
| Mensagem de IA | `ai_messages` | IA (V2.0) |
| Prompt de Sistema | `ai_prompts` | IA (V2.0) |
| Modelo de IA | `ai_models` | IA (V2.0) |
| Licença | `licenses` | LICENCIAMENTO |
| Plano | `plans` | LICENCIAMENTO |
| Módulo | `modules` | LICENCIAMENTO |
| Backup | `backups` | BACKUP |
| Restore | `restores` | BACKUP |
| Chave de API | `api_keys` | API |
| Webhook | `webhooks` | API |
| Rate Limit | `rate_limits` | API |
| Template de Relatório | `report_templates` | RELATÓRIOS |
| Execução de Relatório | `report_executions` | RELATÓRIOS |

## 36.2 O que esperar no Documento 06

No Documento 06, cada tabela listada acima terá:
1. **DDL completa** (`CREATE TABLE` PostgreSQL 15+, adaptações SQLite).
2. **Catálogo de campos** com tipo, nulabilidade, default, descrição.
3. **Índices** (PK, UNIQUE, secundários, parciais, GIN).
4. **Constraints** (`CHECK`, `FK`, `UNIQUE`).
5. **Triggers** (PL/pgSQL para auditoria, soft delete, versionamento).
6. **Dados de exemplo** (3–5 `INSERT`s realistas).
7. **Schema Prisma** completo.
8. **Particionamento** (para `results`, `audit_logs`).
9. **MViews** pré-calculadas.
10. **Stored procedures** (cálculo de ranking, distribuição de meta, etc.).

---

## Próximo Documento

**DOCUMENTO 06 – Logical Database Model (LDM).**

Nele, o modelo conceitual aqui apresentado é traduzido para estrutura lógica completa: cada tabela com DDL SQL, tipos de dados, índices, constraints, triggers, dados de exemplo, schema Prisma e estratégias avançadas (particionamento, MViews, stored procedures, migrations online).
