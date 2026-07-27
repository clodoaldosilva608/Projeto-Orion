# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 06

# LOGICAL DATABASE MODEL (LDM)

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Logical Database Model (LDM)
**Stack Alvo:** PostgreSQL 15+ (cloud) / SQLite 3.40+ (local) / Prisma ORM 5+
**Última Revisão:** 2025

---

## Sumário

- Parte I — Fundações (Capítulos 1 a 7)
- Parte II — Domínio Núcleo / Core (Capítulos 8 a 17)
- Parte III — Domínio de Gestão de Performance (Capítulos 18 a 25)
- Parte IV — Domínio de Experiência e Comunicação (Capítulos 26 a 31)
- Parte V — Domínio Transversal / Plataforma (Capítulos 32 a 37)
- Parte VI — Infraestrutura Avançada (Capítulos 38 a 42)
- Parte VII — Schema Prisma Completo (Capítulo 43)
- Apêndices

---

# PARTE I — FUNDAÇÕES

# Capítulo 1 — Objetivo e Escopo

## 1.1 Objetivo

Este documento transforma o modelo conceitual (Documento 05) em uma estrutura **lógica** pronta para implementação. Ele fornece, para cada tabela do Orion:

1. **Descrição de propósito** — quando e por que a tabela existe, quando NÃO usar.
2. **Estrutura SQL completa** — comando `CREATE TABLE` production-ready para PostgreSQL 15+, com adaptações documentadas para SQLite local.
3. **Catálogo de campos** — tipo, nulabilidade, valor padrão, descrição, regras de validação.
4. **Índices** — primários, únicos, secundários e compostos, cada um com justificativa de consulta que atende.
5. **Constraints** — `CHECK`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, com regra de negócio correspondente.
6. **Triggers recomendados** — funções PL/pgSQL para auditoria, soft delete, contadores, consistência de versão.
7. **Dados de exemplo** — 3 a 5 registros `INSERT` por tabela, realistas e interligados.
8. **Relacionamentos** — cardinalidade 1:1, 1:N, N:N com diagrama textual e regras de integridade referencial (`ON DELETE`, `ON UPDATE`).
9. **Schema Prisma** — bloco `model` correspondente, pronto para o `schema.prisma` do Orion.

## 1.2 Escopo

O Orion 1.0 compreende **37 tabelas lógicas** distribuídas em 5 domínios:

| Domínio | Tabelas | Foco |
|---|---|---|
| Core | companies, branches, users, sessions, refresh_tokens, api_keys, file_uploads, roles, permissions, role_permissions | Identidade, tenancy, RBAC |
| Performance | indicator_categories, indicators, goals, results, campaigns, campaign_participants, awards, rankings | Gestão de metas e resultados |
| Experiência | dashboards, widgets, notifications, notification_templates, email_queue, webhook_deliveries | UI customizável e comunicação |
| Transversal | audit_logs, audit_log_details, licenses, backups, system_settings, plugin_installations | Plataforma, compliance, billing |
| V2.0 (preparação) | ai_conversations, ai_messages, ai_prompts, ai_models, automation_rules, automation_triggers, automation_actions | Reservado, schema documentado |

## 1.3 Público-alvo

- **Engenheiros de backend** — implementar migrations, seeds e queries.
- **DBAs** — provisionar PostgreSQL/SQLite, ajustar índices, configurar RLS.
- **Arquitetos** — validar decisões de particionamento e sharding futuro.
- **QA** — gerar massa de teste alinhada com o catálogo de exemplo.

## 1.4 Convenções deste documento

- Comandos SQL em blocos ` ```sql ` para PostgreSQL; diferenças SQLite marcadas com `-- SQLite:` inline.
- Blocos Prisma em ` ```prisma `.
- Tabelas de campos em Markdown, com colunas: `Campo | Tipo | Nulo? | Default | Descrição`.
- Triggers nomeados como `trg_<tabela>_<evento>`; funções como `fn_<tabela>_<ação>`.

---

# Capítulo 2 — Padrões de Nomenclatura

## 2.1 Tabelas

- Formato: `snake_case`, **plural**.
- Nome deve representar a entidade (`users`, `goals`) — nunca uma ação (`create_user`).
- Tabelas de junção N:N usam `_<entidadeA>_<entidadeB>` em ordem alfabética (`campaign_participants`, `role_permissions`).
- Tabelas filhas de auditoria usam sufixo `_details`, `_log` ou `_history`.
- Tabelas reservadas para V2.0 usam prefixo de domínio (`ai_`, `automation_`, `dw_`).

```text
companies          branches           users
roles              permissions        role_permissions
goals              results            indicators
indicator_categories                  campaigns
campaign_participants                  awards
rankings           dashboards         widgets
notifications      notification_templates
audit_logs         audit_log_details  licenses
backups            system_settings    sessions
refresh_tokens     api_keys           file_uploads
email_queue        webhook_deliveries plugin_installations
```

## 2.2 Campos

- `snake_case`, em inglês, alinhado ao Prisma.
- Chaves estrangeiras: `<entidade_singular>_id` (`company_id`, `user_id`).
- Flags booleanas: adjetivo ou `is_<...>`/`has_<...>` (`active`, `is_system`, `has_attachments`).
- Timestamps: sempre `<evento>_at` (`created_at`, `deleted_at`, `expired_at`).
- Datas (sem hora): `<evento>_date` (`start_date`, `end_date`).
- Enums / status: nome do conceito como coluna (`status`, `plan`, `priority`), valores em `snake_case` (`'active'`, `'pending'`).

## 2.3 Índices

- Prefixo `idx_<tabela>_<coluna(s)>` para índices secundários.
- Prefixo `udx_<tabela>_<coluna(s)>` para índices `UNIQUE`.
- Prefixo `pk_<tabela>` para chave primária (caso nomeada explicitamente).
- Prefixo `ft_<tabela>_<coluna>` para índices full-text (GIN/GIST).
- Índices parciais recebem sufixo `_partial` (`idx_users_email_partial`).

## 2.4 Constraints

- `CHECK`: `chk_<tabela>_<regra>` (`chk_users_email_format`).
- `FOREIGN KEY`: `fk_<tabela>_<coluna>` (`fk_goals_user_id`).
- `UNIQUE`: mesmo nome do índice único (`udx_companies_cnpj`).

## 2.5 Triggers e Funções

- Função: `fn_<tabela>_<ação>` (`fn_users_set_updated_at`).
- Trigger: `trg_<tabela>_<evento>` (`trg_users_before_update`).
- Eventos padronizados: `before_insert`, `before_update`, `before_delete`, `after_insert`, `after_update`, `after_delete`.

---

# Capítulo 3 — Campos Padrão (Convenção Universal)

Todas as tabelas de domínio (excluindo tabelas puras de log/queue) devem possuir o seguinte bloco de campos de plataforma. Eles garantem auditoria, soft delete, multi-tenant e controle de concorrência otimista.

## 3.1 Catálogo padrão

| Campo | Tipo PG | Tipo SQLite | Nulo? | Default | Descrição |
|---|---|---|---|---|---|
| `id` | `BIGSERIAL` | `INTEGER PRIMARY KEY AUTOINCREMENT` | NOT NULL | auto | Chave primária surrogate. |
| `uuid` | `UUID` | `TEXT` (UUID v4 gerado pela app) | NOT NULL | `gen_random_uuid()` | Identificador público exposto em APIs. |
| `company_id` | `BIGINT` | `INTEGER` | NOT NULL (exceto `companies`) | — | Tenant. Obrigatório em todas as tabelas multi-tenant. |
| `created_at` | `TIMESTAMPTZ` | `DATETIME` | NOT NULL | `now()` | Momento de criação com fuso. |
| `updated_at` | `TIMESTAMPTZ` | `DATETIME` | NOT NULL | `now()` | Momento da última atualização (atualizado por trigger). |
| `deleted_at` | `TIMESTAMPTZ` | `DATETIME` | NULL | `NULL` | Quando preenchido, registro está soft-deletado. |
| `created_by` | `BIGINT` | `INTEGER` | NULL | `NULL` | `users.id` de quem criou (NULL em seeds/sistema). |
| `updated_by` | `BIGINT` | `INTEGER` | NULL | `NULL` | `users.id` de quem atualizou por último. |
| `deleted_by` | `BIGINT` | `INTEGER` | NULL | `NULL` | `users.id` que executou o soft delete. |
| `active` | `BOOLEAN` | `INTEGER` (0/1) | NOT NULL | `TRUE` | Flag de ativo/inativo independente do soft delete. |
| `version` | `INTEGER` | `INTEGER` | NOT NULL | `1` | Controle de concorrância otimista (incrementado a cada UPDATE). |
| `external_id` | `VARCHAR(100)` | `TEXT` | NULL | `NULL` | ID em sistema externo (ERP, CRM) para integração. |
| `metadata` | `JSONB` | `JSON` | NULL | `'{}'` | Atributos extensíveis sem alteração de schema. |

## 3.2 DDL base reutilizável

Cada tabela começa com este bloco. Em migrations reais, isso é encapsulado em uma macro Prisma ou em um builder SQL programático.

```sql
CREATE TABLE <nome> (
    id           BIGSERIAL PRIMARY KEY,
    uuid         UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id   BIGINT       NOT NULL REFERENCES companies(id),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ  NULL,
    created_by   BIGINT       NULL REFERENCES users(id),
    updated_by   BIGINT       NULL REFERENCES users(id),
    deleted_by   BIGINT       NULL REFERENCES users(id),
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    version      INTEGER      NOT NULL DEFAULT 1,
    external_id  VARCHAR(100) NULL,
    metadata     JSONB        NOT NULL DEFAULT '{}'::jsonb,
    -- campos específicos...
    CONSTRAINT chk_<nome>_version CHECK (version >= 1),
    CONSTRAINT chk_<nome>_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);
```

## 3.3 Raciocínio por campo

- **`id` vs `uuid`**: usamos `id` internamente (junções mais rápidas, índices menores) e expomos `uuid` em APIs públicas (evita enumerar IDs sequenciais, facilita replicação futura).
- **`company_id` em todas as tabelas**: mesmo tabelas filhas diretas de `branches` ou `users` recebem `company_id` redundante. Isso permite varreduras por tenant sem JOINs e habilita RLS trivial.
- **`active` vs `deleted_at`**: são ortogonais. `active=FALSE` significa "inativo mas visível no sistema"; `deleted_at IS NOT NULL` significa "removido lógico, escondido de todas as queries via view padrão".
- **`version`**: usado em `UPDATE ... WHERE id=? AND version=? RETURNING version`. Se 0 linhas afetadas, houve concorrência — a aplicação recarrega e tenta de novo (pattern *optimistic locking*).
- **`external_id`**: evita migrações traumáticas quando o Orion substitui um ERP legado. Já vem com índice único parcial (`WHERE external_id IS NOT NULL`).
- **`metadata`**: escape hatch para campos customizados por tenant antes de uma migração formal. Nunca deve abrigar dados que aparecem em `WHERE`/`ORDER BY` de hot paths.

---

# Capítulo 4 — Tipos de Dados Customizados (ENUMs e Domínios)

O Orion define um conjunto centralizado de ENUMs PostgreSQL. Em SQLite, esses ENUMs são implementados como `TEXT` com `CHECK (coluna IN (...))`.

## 4.1 ENUMs centrais

```sql
-- PostgreSQL
CREATE TYPE user_status        AS ENUM ('pending','active','suspended','invited','inactive');
CREATE TYPE branch_status      AS ENUM ('active','inactive','maintenance','closed');
CREATE TYPE goal_type          AS ENUM ('daily','weekly','monthly','quarterly','yearly','custom');
CREATE TYPE result_status      AS ENUM ('draft','pending','approved','rejected','revised');
CREATE TYPE campaign_status    AS ENUM ('draft','scheduled','active','paused','finished','canceled');
CREATE TYPE award_type         AS ENUM ('points','money','product','badge','experience','custom');
CREATE TYPE notification_priority AS ENUM ('low','normal','high','urgent');
CREATE TYPE notification_channel  AS ENUM ('in_app','email','sms','push','webhook');
CREATE TYPE audit_action       AS ENUM ('create','update','delete','restore','login','logout','export','import','config');
CREATE TYPE license_plan       AS ENUM ('free','starter','pro','enterprise','custom');
CREATE TYPE license_status     AS ENUM ('trial','active','suspended','expired','canceled');
CREATE TYPE backup_type        AS ENUM ('full','incremental','differential','snapshot');
CREATE TYPE backup_status      AS ENUM ('queued','running','completed','failed','expired');
CREATE TYPE email_status       AS ENUM ('queued','sending','sent','failed','bounced','suppressed');
CREATE TYPE webhook_status     AS ENUM ('queued','delivering','delivered','failed','retry');
CREATE TYPE file_purpose       AS ENUM ('avatar','attachment','import','export','logo','document','temp');
CREATE TYPE plugin_status      AS ENUM ('installed','enabled','disabled','error','pending_update');
CREATE TYPE api_key_scope      AS ENUM ('read','write','admin','full');
```

Equivalente SQLite (exemplo para `user_status`):

```sql
-- SQLite
CREATE TABLE users (
    ...
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','active','suspended','invited','inactive')),
    ...
);
```

## 4.2 Domínios reutilizáveis

```sql
CREATE DOMAIN email_address   AS VARCHAR(255) CHECK (value ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
CREATE DOMAIN cnpj_brazil     AS VARCHAR(18)  CHECK (value ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$');
CREATE DOMAIN cpf_brazil      AS VARCHAR(14)  CHECK (value ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$');
CREATE DOMAIN phone_e164      AS VARCHAR(20)  CHECK (value ~ '^\+[1-9]\d{1,14}$');
CREATE DOMAIN iso_currency    AS CHAR(3)      CHECK (value ~ '^[A-Z]{3}$');
CREATE DOMAIN iso_language    AS CHAR(2)      CHECK (value ~ '^[a-z]{2}$');
CREATE DOMAIN positive_decimal AS DECIMAL(18,4) CHECK (value >= 0);
CREATE DOMAIN latitude_deg    AS DECIMAL(10,8) CHECK (value BETWEEN -90 AND 90);
CREATE DOMAIN longitude_deg   AS DECIMAL(11,8) CHECK (value BETWEEN -180 AND 180);
CREATE DOMAIN color_hex       AS VARCHAR(7)   CHECK (value ~ '^#[0-9A-Fa-f]{6}$');
```

## 4.3 Tabela de lookup de ENUMs (catálogo runtime)

Para permitir que o frontend liste dinamicamente os valores, mantemos uma tabela de metadados:

```sql
CREATE TABLE enum_catalog (
    id           BIGSERIAL PRIMARY KEY,
    enum_name    VARCHAR(100) NOT NULL,
    value        VARCHAR(100) NOT NULL,
    label_pt     VARCHAR(200) NOT NULL,
    label_en     VARCHAR(200) NOT NULL,
    label_es     VARCHAR(200) NOT NULL,
    sort_order   INTEGER      NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    metadata     JSONB        NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT udx_enum_catalog UNIQUE (enum_name, value)
);
```

---

# Capítulo 5 — Estratégia Multi-tenant

## 5.1 Modelo adotado: **Shared Database, Shared Schema** com `company_id` + RLS

O Orion roda em uma única base PostgreSQL por região. Cada linha operacional carrega `company_id`. O isolamento entre tenants é garantido em **três camadas**:

1. **Camada SQL — Row-Level Security (RLS)**: policy automática que filtra por `company_id` extraído de `current_setting('orion.company_id')`.
2. **Camada ORM — Prisma middleware**: injeta `where: { company_id }` em toda query automaticamente.
3. **Camada API — Tenant resolver**: middleware Express/Fastify extrai `company_id` do JWT e injeta na configuração da requisição.

## 5.2 Habilitando RLS por tabela

Para cada tabela multi-tenant:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_users ON users
    USING (company_id = current_setting('orion.company_id', true)::bigint)
    WITH CHECK (company_id = current_setting('orion.company_id', true)::bigint);
```

O `FORCE` garante que mesmo o owner da tabela respeita a policy. Em migrations administrativas, desativar temporariamente com `SET LOCAL orion.bypass_rls = 'on'` (role `orion_admin`).

## 5.3 Configuração por requisição

A aplicação executa, ao iniciar cada transaction:

```sql
SET LOCAL orion.company_id = '42';
SET LOCAL orion.user_id    = '128';
SET LOCAL orion.request_id = 'req_abc123';
```

Esses settings são lidos também por triggers de auditoria (Capítulo 7), eliminando a necessidade de passá-los como parâmetro em cada `INSERT`.

## 5.4 Tabelas isentas de RLS

- `companies` — só acessível pelo role admin; a aplicação filtra por `id = current_setting('orion.company_id')`.
- `licenses` — só admin de billing.
- `enum_catalog`, `system_settings` (globais) — leitura pública.
- `audit_logs` — RLS por `company_id`, mas com retention própria.
- `ai_models` — catálogo global.

## 5.5 Vantagens e trade-offs

| Aspecto | Decisão | Justificativa |
|---|---|---|
| Custo de infraestrutura | Baixo | Uma DB serve a milhares de tenants. |
| Backup seletivo por tenant | Médio | Possível via `pg_dump --where` (extensão) ou export lógico via API. |
| Risco de vazamento | Médio | Mitigado por 3 camadas (RLS, Prisma, API). |
| Performance sob carga | Alto | Índices compostos com `company_id` líder garantem seletividade. |
| Migração para DB dedicado | Fácil | Como todo dado tem `company_id`, dump seletivo + restore em DB novo. |

---

# Capítulo 6 — Estratégia de Soft Delete

## 6.1 Princípios

1. **Nenhum `DELETE` físico** em tabelas de domínio. Sempre `UPDATE ... SET deleted_at = now(), active = FALSE`.
2. **Queries padrão excluem soft-deletados**: todas as queries da aplicação usam a view `vw_<tabela>_active` (Capítulo 6.3) em vez da tabela física.
3. **Retention configurável por tenant**: `system_settings` define por domínio quantos dias manter soft-deletados antes de purge físico (default: 90 dias).
4. **Purge em job dedicado**: `cron` diário executa `fn_purge_soft_deleted(days)` que remove fisicamente registros expirados.
5. **Restore**: endpoint `POST /api/<resource>/{uuid}/restore` zera `deleted_at` e reativa.

## 6.2 Índice parcial para queries ativas

Cada tabela recebe:

```sql
CREATE INDEX idx_users_active ON users (company_id, id)
    WHERE deleted_at IS NULL;
```

Esse índice parcial é menor e mais rápido que um índice completo, pois exclui todos os soft-deletados.

## 6.3 Views padrão

Para cada tabela, criamos uma view `_active` que filtra `deleted_at IS NULL`:

```sql
CREATE VIEW vw_users_active AS
SELECT * FROM users WHERE deleted_at IS NULL;

CREATE VIEW vw_goals_active AS
SELECT * FROM goals WHERE deleted_at IS NULL;

-- ... uma por tabela de domínio
```

A aplicação Prisma mapeia essas views quando o acesso é somente-leitura. Para escrita, usa a tabela física com `where: { deleted_at: null }` no middleware.

## 6.4 Trigger de soft delete com auditoria

```sql
CREATE OR REPLACE FUNCTION fn_generic_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Converte DELETE físico em UPDATE
        UPDATE products
        SET deleted_at = now(),
            deleted_by = current_setting('orion.user_id', true)::bigint,
            active     = FALSE,
            version    = version + 1
        WHERE id = OLD.id;
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Aplicado por tabela:
CREATE TRIGGER trg_products_prevent_delete
BEFORE DELETE ON products
FOR EACH ROW EXECUTE FUNCTION fn_generic_soft_delete();
```

## 6.5 Constraints adicionais

- `CHECK (deleted_at IS NULL OR active = FALSE)` — soft-deletado nunca pode estar ativo.
- `CHECK (deleted_at IS NULL OR deleted_by IS NOT NULL)` — sempre rastreável.
- Após restore, aplicação deve zerar `deleted_by` também (não apenas `deleted_at`).

---

# Capítulo 7 — Padrão de Triggers Recomendados

## 7.1 Catálogo universal de triggers

Cada tabela de domínio recebe **três triggers obrigatórios** e triggers opcionais por regra de negócio:

| Trigger | Quando | Função |
|---|---|---|
| `trg_<t>_before_insert` | BEFORE INSERT | Seta `created_at`, `uuid` (se nulo), `version=1`, `company_id` a partir de setting. |
| `trg_<t>_before_update` | BEFORE UPDATE | Seta `updated_at = now()`, incrementa `version`, bloqueia alteração de `company_id`. |
| `trg_<t>_after_write` | AFTER INSERT/UPDATE/DELETE | Insere linha em `audit_logs` + `audit_log_details`. |

## 7.2 Funções universais

```sql
CREATE OR REPLACE FUNCTION fn_set_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at := COALESCE(NEW.created_at, now());
        NEW.updated_at := NEW.created_at;
        NEW.version    := COALESCE(NEW.version, 1);
        NEW.uuid       := COALESCE(NEW.uuid, gen_random_uuid());
        IF NEW.company_id IS NULL AND TG_TABLENAME <> 'companies' THEN
            NEW.company_id := current_setting('orion.company_id', true)::bigint;
        END IF;
        IF NEW.created_by IS NULL THEN
            NEW.created_by := NULLIF(current_setting('orion.user_id', true), '')::bigint;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Bloqueia troca de tenant via UPDATE comum
        IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
            RAISE EXCEPTION 'company_id cannot be changed via UPDATE (table=%, id=%)',
                TG_TABLENAME, OLD.id USING ERRCODE = 'check_violation';
        END IF;
        -- Bloqueia retrocesso de versão
        IF NEW.version < OLD.version THEN
            RAISE EXCEPTION 'version regression detected (table=%, id=%, old=%, new=%)',
                TG_TABLENAME, OLD.id, OLD.version, NEW.version USING ERRCODE = 'check_violation';
        END IF;
        NEW.updated_at := now();
        NEW.version    := GREATEST(NEW.version, OLD.version + 1);
        NEW.updated_by := NULLIF(current_setting('orion.user_id', true), '')::bigint;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

Aplicação por tabela:

```sql
CREATE TRIGGER trg_users_before_insert
BEFORE INSERT ON users
FOR EACH ROW EXECUTE FUNCTION fn_set_audit_fields();

CREATE TRIGGER trg_users_before_update
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION fn_set_audit_fields();
```

## 7.3 Função de auditoria automática

```sql
CREATE OR REPLACE FUNCTION fn_write_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_action   audit_action;
    v_user_id  BIGINT;
    v_company  BIGINT;
    v_log_id   BIGINT;
BEGIN
    v_user_id  := NULLIF(current_setting('orion.user_id',  true), '')::bigint;
    v_company  := NULLIF(current_setting('orion.company_id', true), '')::bigint;

    IF TG_OP = 'INSERT' THEN
        v_action := 'create'::audit_action;
        INSERT INTO audit_logs (company_id, user_id, action, table_name, record_id,
                                record_uuid, new_value, ip_address, user_agent, request_id)
        VALUES (v_company, v_user_id, v_action, TG_TABLE_NAME, NEW.id,
                NEW.uuid, to_jsonb(NEW), NULL, NULL, NULL)
        RETURNING id INTO v_log_id;

        INSERT INTO audit_log_details (audit_log_id, field_name, change_type, new_value)
        SELECT v_log_id, key, 'set', value FROM jsonb_each(to_jsonb(NEW));

    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'update'::audit_action;
        INSERT INTO audit_logs (company_id, user_id, action, table_name, record_id,
                                record_uuid, old_value, new_value, request_id)
        VALUES (v_company, v_user_id, v_action, TG_TABLE_NAME, NEW.id,
                NEW.uuid, to_jsonb(OLD), to_jsonb(NEW), NULL)
        RETURNING id INTO v_log_id;

        -- Apenas campos que mudaram
        INSERT INTO audit_log_details (audit_log_id, field_name, change_type, old_value, new_value)
        SELECT v_log_id, key,
               CASE WHEN old_val IS NULL THEN 'set'
                    WHEN new_val IS NULL THEN 'unset'
                    ELSE 'change' END,
               old_val, new_val
        FROM jsonb_each(to_jsonb(OLD)) AS o(key, old_val)
        JOIN jsonb_each(to_jsonb(NEW)) AS n(key, new_val) USING (key)
        WHERE old_val IS DISTINCT FROM new_val
          AND key NOT IN ('updated_at','version');
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'delete'::audit_action;
        INSERT INTO audit_logs (company_id, user_id, action, table_name, record_id,
                                record_uuid, old_value, request_id)
        VALUES (v_company, v_user_id, v_action, TG_TABLE_NAME, OLD.id,
                OLD.uuid, to_jsonb(OLD), NULL);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

Aplicação por tabela de domínio:

```sql
CREATE TRIGGER trg_users_after_write
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION fn_write_audit_log();
```

## 7.4 Quando NÃO usar trigger de auditoria

- Tabelas de log/queue (`audit_logs`, `email_queue`, `webhook_deliveries`) — seriam recursivas.
- Tabelas voláteis (`sessions`, `refresh_tokens`) — gerariam ruído.
- Bulk inserts de migração — desativar temporariamente com `ALTER TABLE ... DISABLE TRIGGER trg_<t>_after_write;`.

---


# PARTE II — DOMÍNIO NÚCLEO (CORE)

# Capítulo 8 — Tabela `companies`

## 8.1 Descrição

Armazena as **empresas (tenants)** cadastradas no Orion. Cada linha nesta tabela representa um cliente pagante (ou em trial) e estabelece o escopo de isolamento para todas as tabelas dependentes via `company_id`.

**Quando usar:** cadastro inicial de cliente, exibição de perfil da empresa em telas administrativas, validação de licença no boot da aplicação, faturamento.

**Quando NÃO usar:** never gravar dados operacionais (metas, resultados) nesta tabela — ela deve permanecer pequena (< 100k linhas mesmo em escala massiva) para garantir lookups instantâneos em middlewares de tenant resolution.

## 8.2 Estrutura SQL

```sql
CREATE TABLE companies (
    id                   BIGSERIAL PRIMARY KEY,
    uuid                 UUID         NOT NULL DEFAULT gen_random_uuid(),
    legal_name           VARCHAR(255) NOT NULL,
    trade_name           VARCHAR(255) NOT NULL,
    cnpj                 VARCHAR(18),
    state_registration   VARCHAR(50),
    tax_id_country       VARCHAR(50),                  -- equivalente internacional do CNPJ
    phone                VARCHAR(30),
    mobile               VARCHAR(30),
    email                email_address,
    website              VARCHAR(255),
    zip_code             VARCHAR(20),
    address              VARCHAR(255),
    address_number       VARCHAR(20),
    complement           VARCHAR(100),
    district             VARCHAR(100),
    city                 VARCHAR(100),
    state                VARCHAR(100),
    country              VARCHAR(100)  NOT NULL DEFAULT 'BR',
    latitude             latitude_deg,
    longitude            longitude_deg,
    logo_url             TEXT,
    theme                VARCHAR(50)   NOT NULL DEFAULT 'orion-light',
    language             iso_language  NOT NULL DEFAULT 'pt',
    currency             iso_currency  NOT NULL DEFAULT 'BRL',
    timezone             VARCHAR(50)   NOT NULL DEFAULT 'America/Sao_Paulo',
    fiscal_calendar      VARCHAR(20)   NOT NULL DEFAULT 'january',
    license_id           BIGINT REFERENCES licenses(id),
    license_expires_at   TIMESTAMPTZ,
    onboarding_completed BOOLEAN       NOT NULL DEFAULT FALSE,
    onboarding_step      VARCHAR(50),
    plan                 license_plan  NOT NULL DEFAULT 'free',
    trial_ends_at        TIMESTAMPTZ,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
    deleted_at           TIMESTAMPTZ,
    created_by           BIGINT,
    updated_by           BIGINT,
    deleted_by           BIGINT,
    active               BOOLEAN       NOT NULL DEFAULT TRUE,
    version              INTEGER       NOT NULL DEFAULT 1,
    external_id          VARCHAR(100),
    metadata             JSONB         NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_companies_legal_name    CHECK (length(legal_name) >= 2),
    CONSTRAINT chk_companies_trade_name    CHECK (length(trade_name) >= 2),
    CONSTRAINT chk_companies_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE),
    CONSTRAINT chk_companies_trial_only_free CHECK (plan = 'free' OR trial_ends_at IS NULL OR trial_ends_at > now() - interval '1 day')
);

CREATE UNIQUE INDEX udx_companies_uuid   ON companies (uuid);
CREATE UNIQUE INDEX udx_companies_cnpj   ON companies (cnpj) WHERE cnpj IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX udx_companies_email  ON companies (email) WHERE email IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX udx_companies_external ON companies (external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_companies_trade_name    ON companies (trade_name);
CREATE INDEX idx_companies_active        ON companies (id) WHERE deleted_at IS NULL AND active = TRUE;
CREATE INDEX idx_companies_plan          ON companies (plan, license_expires_at);
CREATE INDEX idx_companies_deleted       ON companies (deleted_at) WHERE deleted_at IS NOT NULL;
```

## 8.3 Catálogo de campos

| Campo | Tipo | Nulo? | Default | Descrição |
|---|---|---|---|---|
| `id` | BIGSERIAL | NOT NULL | auto | PK interna. |
| `uuid` | UUID | NOT NULL | `gen_random_uuid()` | PK pública. |
| `legal_name` | VARCHAR(255) | NOT NULL | — | Razão social. |
| `trade_name` | VARCHAR(255) | NOT NULL | — | Nome fantasia. |
| `cnpj` | VARCHAR(18) | NULL | — | CNPJ Brasil (formato `00.000.000/0000-00`). |
| `state_registration` | VARCHAR(50) | NULL | — | Inscrição estadual. |
| `tax_id_country` | VARCHAR(50) | NULL | — | ID fiscal internacional (EIN, CIF, etc). |
| `phone`, `mobile` | VARCHAR(30) | NULL | — | Telefones de contato. |
| `email` | email_address | NULL | — | E-mail corporativo principal. |
| `website` | VARCHAR(255) | NULL | — | URL do site. |
| `zip_code` | VARCHAR(20) | NULL | — | CEP / ZIP. |
| `address` | VARCHAR(255) | NULL | — | Logradouro. |
| `address_number` | VARCHAR(20) | NULL | — | Número (texto p/ "S/N", "Km 12"). |
| `complement` | VARCHAR(100) | NULL | — | Complemento. |
| `district` | VARCHAR(100) | NULL | — | Bairro. |
| `city`, `state`, `country` | VARCHAR(100) | NOT NULL | `'BR'` | Localização. |
| `latitude`, `longitude` | DECIMAL | NULL | — | Geolocalização. |
| `logo_url` | TEXT | NULL | — | URL do logo (S3). |
| `theme` | VARCHAR(50) | NOT NULL | `'orion-light'` | Tema visual padrão. |
| `language` | CHAR(2) | NOT NULL | `'pt'` | Idioma padrão (ISO 639-1). |
| `currency` | CHAR(3) | NOT NULL | `'BRL'` | Moeda (ISO 4217). |
| `timezone` | VARCHAR(50) | NOT NULL | `'America/Sao_Paulo'` | IANA tz. |
| `fiscal_calendar` | VARCHAR(20) | NOT NULL | `'january'` | Início do ano fiscal. |
| `license_id` | BIGINT | NULL | — | FK para `licenses`. |
| `license_expires_at` | TIMESTAMPTZ | NULL | — | Cache de expiração (desnormalizado). |
| `onboarding_completed` | BOOLEAN | NOT NULL | FALSE | Indica onboarding finalizado. |
| `onboarding_step` | VARCHAR(50) | NULL | — | Etapa atual (`'company'`, `'branches'`, `'users'`, `'indicators'`). |
| `plan` | license_plan | NOT NULL | `'free'` | Plano corrente. |
| `trial_ends_at` | TIMESTAMPTZ | NULL | — | Fim do trial. |
| `metadata` | JSONB | NOT NULL | `'{}'` | Campos extras. |

## 8.4 Relacionamentos

- **1:1 com `licenses`** — uma empresa tem no máximo uma licença ativa (via `license_id`).
- **1:N com `branches`** — empresa possui múltiplas filiais.
- **1:N com `users`** — empresa possui múltiplos usuários.
- **1:N com `indicators`, `goals`, `results`, `campaigns`, `rankings`, `dashboards`, `notifications`, `audit_logs`, `backups`, `system_settings`, `file_uploads`, `plugin_installations`, `api_keys`**.

```text
companies 1───* branches
companies 1───* users
companies 1───* indicators
companies 1───* goals
companies 1───* results
companies 1───* campaigns
companies 1───* audit_logs
companies 1───1 licenses  (license_id)
```

## 8.5 Triggers

Aplica os triggers universais (`trg_companies_before_insert`, `trg_companies_before_update`, `trg_companies_after_write`). Adicionalmente:

```sql
CREATE OR REPLACE FUNCTION fn_companies_sync_license_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.license_id IS DISTINCT FROM OLD.license_id OR NEW.license_id IS NOT NULL THEN
        UPDATE companies c
        SET license_expires_at = (SELECT expiration_date FROM licenses WHERE id = NEW.license_id)
        WHERE c.id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_after_update
AFTER UPDATE ON companies
FOR EACH ROW
WHEN (NEW.license_id IS DISTINCT FROM OLD.license_id)
EXECUTE FUNCTION fn_companies_sync_license_expiry();
```

## 8.6 Dados de exemplo

```sql
INSERT INTO companies (uuid, legal_name, trade_name, cnpj, email, city, state, country, plan)
VALUES
 ('11111111-1111-1111-1111-111111111111','TechVendas Comercio Ltda','TechVendas','12.345.678/0001-90','contato@techvendas.com.br','São Paulo','SP','BR','pro'),
 ('22222222-2222-2222-2222-222222222222','Mercado Sul S.A.','Mercado Sul','98.765.432/0001-10','ti@mercadosul.com.br','Porto Alegre','RS','BR','enterprise'),
 ('33333333-3333-3333-3333-333333333333','Startup Biotecnologia','BioOrion','55.444.333/0001-22','ops@bioorion.com','Campinas','SP','BR','starter');
```

## 8.7 Schema Prisma

```prisma
model Company {
  id                  BigInt    @id @default(autoincrement())
  uuid                String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  legalName           String    @map("legal_name") @db.VarChar(255)
  tradeName           String    @map("trade_name") @db.VarChar(255)
  cnpj                String?   @db.VarChar(18)
  stateRegistration   String?   @map("state_registration") @db.VarChar(50)
  taxIdCountry        String?   @map("tax_id_country") @db.VarChar(50)
  phone               String?   @db.VarChar(30)
  mobile              String?   @db.VarChar(30)
  email               String?   @db.VarChar(255)
  website             String?   @db.VarChar(255)
  zipCode             String?   @map("zip_code") @db.VarChar(20)
  address             String?   @db.VarChar(255)
  addressNumber       String?   @map("address_number") @db.VarChar(20)
  complement          String?   @db.VarChar(100)
  district            String?   @db.VarChar(100)
  city                String?   @db.VarChar(100)
  state               String?   @db.VarChar(100)
  country             String    @default("BR") @db.VarChar(100)
  latitude            Decimal?  @db.Decimal(10, 8)
  longitude           Decimal?  @db.Decimal(11, 8)
  logoUrl             String?   @map("logo_url")
  theme               String    @default("orion-light") @db.VarChar(50)
  language            String    @default("pt") @db.Char(2)
  currency            String    @default("BRL") @db.Char(3)
  timezone            String    @default("America/Sao_Paulo") @db.VarChar(50)
  fiscalCalendar      String    @default("january") @map("fiscal_calendar") @db.VarChar(20)
  licenseId           BigInt?   @map("license_id")
  licenseExpiresAt    DateTime? @map("license_expires_at") @db.Timestamptz
  onboardingCompleted Boolean   @default(false) @map("onboarding_completed")
  onboardingStep      String?   @map("onboarding_step") @db.VarChar(50)
  plan                String    @default("free") @db.VarChar(20)
  trialEndsAt         DateTime? @map("trial_ends_at") @db.Timestamptz
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt           DateTime? @map("deleted_at") @db.Timestamptz
  createdBy           BigInt?   @map("created_by")
  updatedBy           BigInt?   @map("updated_by")
  deletedBy           BigInt?   @map("deleted_by")
  active              Boolean   @default(true)
  version             Int       @default(1)
  externalId          String?   @map("external_id") @db.VarChar(100)
  metadata            Json      @default("{}")

  license             License?  @relation(fields: [licenseId], references: [id])
  branches            Branch[]
  users               User[]
  indicators          Indicator[]
  goals               Goal[]
  results             Result[]
  campaigns           Campaign[]
  auditLogs           AuditLog[]
  backups             Backup[]
  systemSettings      SystemSetting[]
  fileUploads         FileUpload[]
  pluginInstallations PluginInstallation[]
  apiKeys             ApiKey[]

  @@unique([cnpj], map: "udx_companies_cnpj")
  @@unique([email], map: "udx_companies_email")
  @@unique([externalId], map: "udx_companies_external")
  @@index([tradeName], map: "idx_companies_trade_name")
  @@index([plan, licenseExpiresAt], map: "idx_companies_plan")
  @@map("companies")
}
```

---

# Capítulo 9 — Tabela `branches`

## 9.1 Descrição

Filiais (ou lojas, unidades, departamentos geograficamente isolados) de uma empresa. Cada filial pode ter gerente próprio, metas próprias e indicadores próprios. Uma empresa sem filiais usa uma única filial "Matriz" criada no onboarding.

**Quando usar:** sempre que houver separação geográfica, fiscal ou operacional dentro de uma mesma empresa. Mesmo empresas single-site devem ter uma filial "Matriz" para uniformizar queries.

## 9.2 Estrutura SQL

```sql
CREATE TABLE branches (
    id                BIGSERIAL PRIMARY KEY,
    uuid              UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id        BIGINT       NOT NULL REFERENCES companies(id),
    code              VARCHAR(50)  NOT NULL,
    name              VARCHAR(255) NOT NULL,
    phone             VARCHAR(30),
    mobile            VARCHAR(30),
    manager_id        BIGINT REFERENCES users(id),
    zip_code          VARCHAR(20),
    address           VARCHAR(255),
    address_number    VARCHAR(20),
    complement        VARCHAR(100),
    district          VARCHAR(100),
    city              VARCHAR(100),
    state             VARCHAR(100),
    country           VARCHAR(100) NOT NULL DEFAULT 'BR',
    latitude          latitude_deg,
    longitude         longitude_deg,
    operating_hours   JSONB,                 -- { mon: ["08:00","18:00"], ... }
    status            branch_status NOT NULL DEFAULT 'active',
    is_headquarters   BOOLEAN      NOT NULL DEFAULT FALSE,
    opened_at         DATE,
    closed_at         DATE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    created_by        BIGINT,
    updated_by        BIGINT,
    deleted_by        BIGINT,
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    version           INTEGER      NOT NULL DEFAULT 1,
    external_id       VARCHAR(100),
    metadata          JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_branches_code_length   CHECK (length(code) BETWEEN 1 AND 50),
    CONSTRAINT chk_branches_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE),
    CONSTRAINT chk_branches_closed_only_inactive CHECK (closed_at IS NULL OR status = 'closed'),
    CONSTRAINT chk_branches_single_hq CHECK (
        (NOT is_headquarters) OR
        (NOT EXISTS (
            SELECT 1 FROM branches b2
            WHERE b2.company_id = branches.company_id
              AND b2.is_headquarters
              AND b2.id IS DISTINCT FROM branches.id
              AND b2.deleted_at IS NULL
        ))
    )
);

CREATE UNIQUE INDEX udx_branches_uuid       ON branches (uuid);
CREATE UNIQUE INDEX udx_branches_company_code ON branches (company_id, code) WHERE deleted_at IS NULL;
CREATE INDEX idx_branches_company           ON branches (company_id, id) WHERE deleted_at IS NULL;
CREATE INDEX idx_branches_manager           ON branches (manager_id) WHERE manager_id IS NOT NULL;
CREATE INDEX idx_branches_geolocation       ON branches (company_id, latitude, longitude) WHERE latitude IS NOT NULL;
```

## 9.3 Catálogo de campos

| Campo | Tipo | Nulo? | Default | Descrição |
|---|---|---|---|---|
| `code` | VARCHAR(50) | NOT NULL | — | Código interno único por empresa (`MAT`, `FIL01`). |
| `name` | VARCHAR(255) | NOT NULL | — | Nome de exibição. |
| `manager_id` | BIGINT | NULL | — | FK `users.id` do gerente. |
| `operating_hours` | JSONB | NULL | — | Horários de funcionamento por dia. |
| `status` | branch_status | NOT NULL | `'active'` | Estado operacional. |
| `is_headquarters` | BOOLEAN | NOT NULL | FALSE | Marca a matriz (uma por empresa). |
| `opened_at`, `closed_at` | DATE | NULL | — | Datas de inauguração / fechamento. |

## 9.4 Relacionamentos

- **N:1 com `companies`** (`company_id`).
- **N:1 com `users`** (`manager_id` — auto-relacionamento via `users`).
- **1:N com `users`** (usuários alocados a esta filial).
- **1:N com `goals`, `results`, `rankings`, `campaigns`** (escopo de filial).

## 9.5 Dados de exemplo

```sql
INSERT INTO branches (uuid, company_id, code, name, city, state, is_headquarters, opened_at)
VALUES
 ('aaaa1111-0000-0000-0000-000000000001', 1, 'MAT', 'TechVendas Matriz',           'São Paulo',    'SP', TRUE,  '2018-03-01'),
 ('aaaa1111-0000-0000-0000-000000000002', 1, 'FIL01','TechVendas Rio',             'Rio de Janeiro','RJ', FALSE, '2020-06-15'),
 ('aaaa1111-0000-0000-0000-000000000003', 2, 'CENTRO','Mercado Sul Centro',        'Porto Alegre', 'RS', TRUE,  '2015-01-10'),
 ('aaaa1111-0000-0000-0000-000000000004', 2, 'NORTE','Mercado Sul Norte',          'Canoas',       'RS', FALSE, '2017-09-20'),
 ('aaaa1111-0000-0000-0000-000000000005', 3, 'LAB01','BioOrion Lab Campinas',      'Campinas',     'SP', TRUE,  '2022-11-05');
```

## 9.6 Schema Prisma

```prisma
model Branch {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId       BigInt    @map("company_id")
  code            String    @db.VarChar(50)
  name            String    @db.VarChar(255)
  phone           String?   @db.VarChar(30)
  mobile          String?   @db.VarChar(30)
  managerId       BigInt?   @map("manager_id")
  zipCode         String?   @map("zip_code") @db.VarChar(20)
  address         String?   @db.VarChar(255)
  addressNumber   String?   @map("address_number") @db.VarChar(20)
  complement      String?   @db.VarChar(100)
  district        String?   @db.VarChar(100)
  city            String?   @db.VarChar(100)
  state           String?   @db.VarChar(100)
  country         String    @default("BR") @db.VarChar(100)
  latitude        Decimal?  @db.Decimal(10, 8)
  longitude       Decimal?  @db.Decimal(11, 8)
  operatingHours  Json?     @map("operating_hours")
  status          String    @default("active") @db.VarChar(20)
  isHeadquarters  Boolean   @default(false) @map("is_headquarters")
  openedAt        DateTime? @map("opened_at") @db.Date
  closedAt        DateTime? @map("closed_at") @db.Date
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz
  createdBy       BigInt?   @map("created_by")
  updatedBy       BigInt?   @map("updated_by")
  deletedBy       BigInt?   @map("deleted_by")
  active          Boolean   @default(true)
  version         Int       @default(1)
  externalId      String?   @map("external_id") @db.VarChar(100)
  metadata        Json      @default("{}")

  company         Company   @relation(fields: [companyId], references: [id])
  manager         User?     @relation("BranchManager", fields: [managerId], references: [id])
  users           User[]    @relation("BranchUsers")
  goals           Goal[]
  results         Result[]
  rankings        Ranking[]

  @@unique([companyId, code], map: "udx_branches_company_code")
  @@index([companyId], map: "idx_branches_company")
  @@index([managerId], map: "idx_branches_manager")
  @@map("branches")
}
```

---

# Capítulo 10 — Tabela `users`

## 10.1 Descrição

Usuários do Orion — pessoas físicas que acessam o sistema. Cada usuário pertence a **uma** empresa (`company_id`) e opcionalmente a **uma** filial principal (`branch_id`). Pode ter múltiplas filiais acessíveis (via tabela N:N `user_branches`, futura V1.1).

**Quando usar:** autenticação, autorização, atribuição de metas, exibição em rankings, auditoria.

## 10.2 Estrutura SQL

```sql
CREATE TABLE users (
    id                BIGSERIAL PRIMARY KEY,
    uuid              UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id        BIGINT       NOT NULL REFERENCES companies(id),
    branch_id         BIGINT       REFERENCES branches(id),
    role_id           BIGINT       REFERENCES roles(id),
    employee_code     VARCHAR(50),
    full_name         VARCHAR(255) NOT NULL,
    display_name      VARCHAR(100),
    cpf               cpf_brazil,
    rg                VARCHAR(20),
    email             email_address NOT NULL,
    phone             VARCHAR(30),
    mobile            VARCHAR(30),
    avatar_url        TEXT,
    username          VARCHAR(100),
    password_hash     TEXT,
    password_algo     VARCHAR(30)  NOT NULL DEFAULT 'argon2id',
    password_changed_at TIMESTAMPTZ,
    failed_login_count INTEGER     NOT NULL DEFAULT 0,
    locked_until      TIMESTAMPTZ,
    two_factor_enabled BOOLEAN     NOT NULL DEFAULT FALSE,
    two_factor_secret TEXT,
    two_factor_backup JSONB,
    admission_date    DATE,
    termination_date  DATE,
    last_login        TIMESTAMPTZ,
    last_login_ip     VARCHAR(100),
    last_login_ua     TEXT,
    status            user_status  NOT NULL DEFAULT 'pending',
    locale            VARCHAR(10)  NOT NULL DEFAULT 'pt-BR',
    timezone          VARCHAR(50),
    receive_emails    BOOLEAN      NOT NULL DEFAULT TRUE,
    receive_push      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    created_by        BIGINT,
    updated_by        BIGINT,
    deleted_by        BIGINT,
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    version           INTEGER      NOT NULL DEFAULT 1,
    external_id       VARCHAR(100),
    metadata          JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_users_full_name   CHECK (length(full_name) >= 3),
    CONSTRAINT chk_users_email_unique_per_tenant CHECK (TRUE),  -- enforced via partial unique idx
    CONSTRAINT chk_users_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE),
    CONSTRAINT chk_users_termination_after_admission CHECK (
        termination_date IS NULL OR admission_date IS NULL OR termination_date >= admission_date),
    CONSTRAINT chk_users_locked_status CHECK (
        (locked_until IS NULL AND status <> 'suspended') OR
        (locked_until IS NOT NULL) OR
        (status = 'suspended')),
    CONSTRAINT chk_users_password_when_active CHECK (
        status IN ('pending','invited') OR password_hash IS NOT NULL)
);

CREATE UNIQUE INDEX udx_users_uuid              ON users (uuid);
CREATE UNIQUE INDEX udx_users_email_company     ON users (email, company_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX udx_users_username_company  ON users (username, company_id)
    WHERE username IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX udx_users_cpf_company       ON users (cpf, company_id)
    WHERE cpf IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX udx_users_employee_code     ON users (company_id, employee_code)
    WHERE employee_code IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_users_company_branch           ON users (company_id, branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role                     ON users (role_id) WHERE role_id IS NOT NULL;
CREATE INDEX idx_users_status                   ON users (company_id, status);
CREATE INDEX idx_users_last_login               ON users (last_login);
CREATE INDEX idx_users_locked                   ON users (locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX idx_users_active_partial           ON users (company_id, id) WHERE deleted_at IS NULL AND active = TRUE;
```

## 10.3 Catálogo de campos (relevantes)

| Campo | Tipo | Nulo? | Default | Descrição |
|---|---|---|---|---|
| `password_hash` | TEXT | NULL | — | Hash Argon2id. NULL apenas para convites pendentes. |
| `password_algo` | VARCHAR(30) | NOT NULL | `'argon2id'` | Algoritmo usado (para migração futura). |
| `password_changed_at` | TIMESTAMPTZ | NULL | — | Para forçar troca periódica. |
| `failed_login_count` | INTEGER | NOT NULL | 0 | Contador para lockout. |
| `locked_until` | TIMESTAMPTZ | NULL | — | Lock temporário após 5 falhas. |
| `two_factor_enabled` | BOOLEAN | NOT NULL | FALSE | 2FA TOTP ativo. |
| `two_factor_secret` | TEXT | NULL | — | Secret TOTP (criptografado em repouso via pgcrypto). |
| `two_factor_backup` | JSONB | NULL | — | Array de códigos backup (hashes). |
| `admission_date`, `termination_date` | DATE | NULL | — | Vigência do vínculo. |
| `last_login`, `last_login_ip`, `last_login_ua` | — | NULL | — | Rastreio de sessão. |
| `status` | user_status | NOT NULL | `'pending'` | Estado lógico do usuário. |

## 10.4 Relacionamentos

- **N:1 com `companies`**, **N:1 com `branches`**, **N:1 com `roles`**.
- **1:N com `goals`, `results`, `rankings`, `dashboards`, `notifications`, `audit_logs`**.
- **1:N com `sessions`** e **`refresh_tokens`**.
- **N:N com `campaigns`** via `campaign_participants`.

## 10.5 Triggers adicionais

```sql
CREATE OR REPLACE FUNCTION fn_users_increment_failed_login()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.failed_login_count > OLD.failed_login_count AND NEW.failed_login_count >= 5 THEN
        NEW.locked_until := now() + interval '15 minutes';
        IF NEW.failed_login_count >= 10 THEN
            NEW.status := 'suspended'::user_status;
        END IF;
    ELSIF NEW.failed_login_count = 0 THEN
        NEW.locked_until := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_before_update_login
BEFORE UPDATE OF failed_login_count ON users
FOR EACH ROW EXECUTE FUNCTION fn_users_increment_failed_login();
```

## 10.6 Dados de exemplo

```sql
INSERT INTO users (uuid, company_id, branch_id, full_name, email, status, password_hash, role_id, employee_code, admission_date)
VALUES
 ('bbbbb111-0000-0000-0000-000000000001', 1, 1, 'Ana Paula Souza',  'ana.souza@techvendas.com.br',  'active',   '$argon2id$v=19$m=65536$...', 1, 'EMP001', '2019-02-10'),
 ('bbbbb111-0000-0000-0000-000000000002', 1, 1, 'Carlos Eduardo Lima','carlos.lima@techvendas.com.br','active',   '$argon2id$v=19$m=65536$...', 4, 'EMP002', '2020-08-01'),
 ('bbbbb111-0000-0000-0000-000000000003', 1, 2, 'Mariana Costa',    'mariana.costa@techvendas.com.br','active',  '$argon2id$v=19$m=65536$...', 5, 'EMP003', '2021-01-15'),
 ('bbbbb111-0000-0000-0000-000000000004', 2, 3, 'Roberto Alves',    'roberto.alves@mercadosul.com.br','active',  '$argon2id$v=19$m=65536$...', 2, 'MS001',  '2018-04-20'),
 ('bbbbb111-0000-0000-0000-000000000005', 3, 5, 'Fernanda Dias',    'fernanda.dias@bioorion.com',    'invited',  NULL,                       1, 'BO001',  '2024-09-01');
```

## 10.7 Schema Prisma

```prisma
model User {
  id                  BigInt    @id @default(autoincrement())
  uuid                String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId           BigInt    @map("company_id")
  branchId            BigInt?   @map("branch_id")
  roleId              BigInt?   @map("role_id")
  employeeCode        String?   @map("employee_code") @db.VarChar(50)
  fullName            String    @map("full_name") @db.VarChar(255)
  displayName         String?   @map("display_name") @db.VarChar(100)
  cpf                 String?   @db.VarChar(14)
  rg                  String?   @db.VarChar(20)
  email               String    @db.VarChar(255)
  phone               String?   @db.VarChar(30)
  mobile              String?   @db.VarChar(30)
  avatarUrl           String?   @map("avatar_url")
  username            String?   @db.VarChar(100)
  passwordHash        String?   @map("password_hash")
  passwordAlgo        String    @default("argon2id") @map("password_algo") @db.VarChar(30)
  passwordChangedAt   DateTime? @map("password_changed_at") @db.Timestamptz
  failedLoginCount    Int       @default(0) @map("failed_login_count")
  lockedUntil         DateTime? @map("locked_until") @db.Timestamptz
  twoFactorEnabled    Boolean   @default(false) @map("two_factor_enabled")
  twoFactorSecret     String?   @map("two_factor_secret")
  twoFactorBackup     Json?     @map("two_factor_backup")
  admissionDate       DateTime? @map("admission_date") @db.Date
  terminationDate     DateTime? @map("termination_date") @db.Date
  lastLogin           DateTime? @map("last_login") @db.Timestamptz
  lastLoginIp         String?   @map("last_login_ip") @db.VarChar(100)
  lastLoginUa         String?   @map("last_login_ua")
  status              String    @default("pending") @db.VarChar(20)
  locale              String    @default("pt-BR") @db.VarChar(10)
  timezone            String?   @db.VarChar(50)
  receiveEmails       Boolean   @default(true) @map("receive_emails")
  receivePush         Boolean   @default(true) @map("receive_push")
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt           DateTime? @map("deleted_at") @db.Timestamptz
  createdBy           BigInt?   @map("created_by")
  updatedBy           BigInt?   @map("updated_by")
  deletedBy           BigInt?   @map("deleted_by")
  active              Boolean   @default(true)
  version             Int       @default(1)
  externalId          String?   @map("external_id") @db.VarChar(100)
  metadata            Json      @default("{}")

  company             Company   @relation(fields: [companyId], references: [id])
  branch              Branch?   @relation("BranchUsers", fields: [branchId], references: [id])
  managedBranches     Branch[]  @relation("BranchManager")
  role                Role?     @relation(fields: [roleId], references: [id])
  goals               Goal[]
  results             Result[]
  rankings            Ranking[]
  dashboards          Dashboard[]
  notifications       Notification[]
  sessions            Session[]
  refreshTokens       RefreshToken[]
  auditLogs           AuditLog[]
  apiKeys             ApiKey[]

  @@unique([email, companyId], map: "udx_users_email_company")
  @@unique([username, companyId], map: "udx_users_username_company")
  @@unique([cpf, companyId], map: "udx_users_cpf_company")
  @@unique([companyId, employeeCode], map: "udx_users_employee_code")
  @@index([companyId, branchId], map: "idx_users_company_branch")
  @@index([roleId], map: "idx_users_role")
  @@index([status], map: "idx_users_status")
  @@index([lastLogin], map: "idx_users_last_login")
  @@map("users")
}
```

---

# Capítulo 11 — Tabela `sessions`

## 11.1 Descrição

Sessões ativas dos usuários. Cada login bem-sucedido cria uma linha aqui. O Orion usa sessões stateful no banco (em vez de JWT stateless puro) para permitir **revogação imediata** (logout remoto, bloqueio de conta, troca de senha invalida sessões).

**Quando usar:** validação de token de acesso em middleware, listagem de "dispositivos conectados" para o usuário, invalidação em massa.

**Quando NÃO usar:** armazenar refresh tokens (tabela `refresh_tokens`) nem dados voláteis de cache (Redis).

## 11.2 Estrutura SQL

```sql
CREATE TABLE sessions (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    user_id         BIGINT       NOT NULL REFERENCES users(id),
    session_token_hash TEXT     NOT NULL,    -- SHA-256 do token enviado ao cliente
    refresh_token_id BIGINT      REFERENCES refresh_tokens(id),
    ip_address      VARCHAR(100),
    user_agent      TEXT,
    device_type     VARCHAR(30),             -- desktop/mobile/tablet/bot
    device_id       VARCHAR(100),
    location        JSONB,                   -- { city, country, lat, lng }
    issued_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ  NOT NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at      TIMESTAMPTZ,
    revoked_reason  VARCHAR(50),             -- logout, expired, password_change, admin
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,

    CONSTRAINT chk_sessions_expires_after_issue CHECK (expires_at > issued_at),
    CONSTRAINT chk_sessions_revoked_inactive   CHECK (revoked_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_sessions_token_hash ON sessions (session_token_hash);
CREATE INDEX idx_sessions_user_active       ON sessions (user_id, expires_at)
    WHERE revoked_at IS NULL;
CREATE INDEX idx_sessions_company_active    ON sessions (company_id, expires_at)
    WHERE revoked_at IS NULL;
CREATE INDEX idx_sessions_expires            ON sessions (expires_at)
    WHERE revoked_at IS NULL;
```

## 11.3 Relacionamentos

- **N:1 com `users`**, **N:1 com `companies`**, **N:1 (opcional) com `refresh_tokens`**.

## 11.4 Dados de exemplo

```sql
INSERT INTO sessions (uuid, company_id, user_id, session_token_hash, ip_address, device_type, expires_at, last_activity_at)
VALUES
 ('ccccc111-0000-0000-0000-000000000001', 1, 1, '5f2c1...hash...001', '200.150.10.20','desktop','2025-01-15 18:00:00-03','2025-01-15 14:30:00-03'),
 ('ccccc111-0000-0000-0000-000000000002', 1, 2, '5f2c1...hash...002', '200.150.10.21','mobile', '2025-01-15 19:00:00-03','2025-01-15 15:00:00-03'),
 ('ccccc111-0000-0000-0000-000000000003', 2, 4, '5f2c1...hash...003', '189.20.30.40','desktop','2025-01-15 18:30:00-03','2025-01-15 14:45:00-03');
```

## 11.5 Prisma

```prisma
model Session {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  userId            BigInt    @map("user_id")
  sessionTokenHash  String    @map("session_token_hash")
  refreshTokenId    BigInt?   @map("refresh_token_id")
  ipAddress         String?   @map("ip_address") @db.VarChar(100)
  userAgent         String?   @map("user_agent")
  deviceType        String?   @map("device_type") @db.VarChar(30)
  deviceId          String?   @map("device_id") @db.VarChar(100)
  location          Json?
  issuedAt          DateTime  @default(now()) @map("issued_at") @db.Timestamptz
  expiresAt         DateTime  @map("expires_at") @db.Timestamptz
  lastActivityAt    DateTime  @default(now()) @map("last_activity_at") @db.Timestamptz
  revokedAt         DateTime? @map("revoked_at") @db.Timestamptz
  revokedReason     String?   @map("revoked_reason") @db.VarChar(50)
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active            Boolean   @default(true)
  version           Int       @default(1)

  company           Company   @relation(fields: [companyId], references: [id])
  user              User      @relation(fields: [userId], references: [id])
  refreshToken      RefreshToken? @relation(fields: [refreshTokenId], references: [id])

  @@index([userId, expiresAt], map: "idx_sessions_user_active")
  @@index([companyId, expiresAt], map: "idx_sessions_company_active")
  @@index([expiresAt], map: "idx_sessions_expires")
  @@map("sessions")
}
```

---

# Capítulo 12 — Tabela `refresh_tokens`

## 12.1 Descrição

Tokens de longa duração usados para obter novos tokens de acesso sem refazer login. Implementa o fluxo **refresh token rotation**: cada uso invalida o token anterior e emite um novo, com detecção de reuso (se um token já usado aparece de novo, toda a cadeia é revogada — sinal de roubo).

## 12.2 Estrutura SQL

```sql
CREATE TABLE refresh_tokens (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    user_id         BIGINT       NOT NULL REFERENCES users(id),
    session_id      BIGINT       REFERENCES sessions(id),
    token_hash      TEXT         NOT NULL,
    family_id       UUID         NOT NULL,         -- agrupa tokens de uma cadeia
    predecessor_id  BIGINT       REFERENCES refresh_tokens(id),
    issued_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ  NOT NULL,
    used_at         TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    revoked_reason  VARCHAR(50),
    ip_address      VARCHAR(100),
    user_agent      TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,

    CONSTRAINT chk_refresh_expires_after_issue CHECK (expires_at > issued_at),
    CONSTRAINT chk_refresh_used_before_revoke  CHECK (revoked_at IS NULL OR used_at IS NOT NULL OR revoked_reason = 'security'),
    CONSTRAINT chk_refresh_revoked_inactive    CHECK (revoked_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_refresh_tokens_hash    ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_user_active    ON refresh_tokens (user_id, expires_at)
    WHERE revoked_at IS NULL;
CREATE INDEX idx_refresh_tokens_family          ON refresh_tokens (family_id, issued_at);
CREATE INDEX idx_refresh_tokens_expires         ON refresh_tokens (expires_at)
    WHERE revoked_at IS NULL AND used_at IS NULL;
```

## 12.3 Fluxo de rotação

```text
[Login] → emite RT1 (family_id = F1, predecessor = NULL)
[Uso RT1] → marca RT1.used_at; emite RT2 (family_id = F1, predecessor = RT1.id)
[Uso RT2] → marca RT2.used_at; emite RT3 (family_id = F1, predecessor = RT2.id)
[Ataque: reuso RT1] → RT1.used_at IS NOT NULL → REVOGAR TODA A FAMÍLIA F1
```

## 12.4 Trigger de detecção de reuso

```sql
CREATE OR REPLACE FUNCTION fn_refresh_detect_reuse()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.used_at IS NOT NULL AND OLD.used_at IS NOT NULL THEN
        -- Tentativa de usar token já usado → revoga família inteira
        UPDATE refresh_tokens
        SET revoked_at = now(),
            revoked_reason = 'reuse_detected',
            active = FALSE
        WHERE family_id = NEW.family_id AND revoked_at IS NULL;
        RAISE EXCEPTION 'Refresh token reuse detected — family % revoked', NEW.family_id
            USING ERRCODE = 'raise_exception';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_before_update
BEFORE UPDATE ON refresh_tokens
FOR EACH ROW EXECUTE FUNCTION fn_refresh_detect_reuse();
```

## 12.5 Dados de exemplo

```sql
INSERT INTO refresh_tokens (uuid, company_id, user_id, token_hash, family_id, expires_at)
VALUES
 ('ddddd111-0000-0000-0000-000000000001', 1, 1, 'hash...rt1', '11111111-fam-0001-0000-000000000001','2025-02-15 14:00:00-03'),
 ('ddddd111-0000-0000-0000-000000000002', 1, 1, 'hash...rt2', '11111111-fam-0001-0000-000000000001','2025-02-15 14:00:00-03'),
 ('ddddd111-0000-0000-0000-000000000003', 2, 4, 'hash...rt3', '22222222-fam-0002-0000-000000000002','2025-02-15 14:30:00-03');
```

## 12.6 Prisma

```prisma
model RefreshToken {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId       BigInt    @map("company_id")
  userId          BigInt    @map("user_id")
  sessionId       BigInt?   @map("session_id")
  tokenHash       String    @map("token_hash")
  familyId        String    @map("family_id") @db.Uuid
  predecessorId   BigInt?   @map("predecessor_id")
  issuedAt        DateTime  @default(now()) @map("issued_at") @db.Timestamptz
  expiresAt       DateTime  @map("expires_at") @db.Timestamptz
  usedAt          DateTime? @map("used_at") @db.Timestamptz
  revokedAt       DateTime? @map("revoked_at") @db.Timestamptz
  revokedReason   String?   @map("revoked_reason") @db.VarChar(50)
  ipAddress       String?   @map("ip_address") @db.VarChar(100)
  userAgent       String?   @map("user_agent")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active          Boolean   @default(true)
  version         Int       @default(1)

  company         Company   @relation(fields: [companyId], references: [id])
  user            User      @relation(fields: [userId], references: [id])
  session         Session?  @relation(fields: [sessionId], references: [id])
  predecessor     RefreshToken? @relation("RefreshTokenChain", fields: [predecessorId], references: [id])
  successors      RefreshToken[] @relation("RefreshTokenChain")

  @@index([userId, expiresAt], map: "idx_refresh_tokens_user_active")
  @@index([familyId, issuedAt], map: "idx_refresh_tokens_family")
  @@index([expiresAt], map: "idx_refresh_tokens_expires")
  @@map("refresh_tokens")
}
```

---

# Capítulo 13 — Tabela `api_keys`

## 13.1 Descrição

Chaves de API para integrações programáticas (M2M). Cada chave tem um escopo, expiração configurável, e é hasheada em repouso (apenas o hash `SHA-256` é armazenado — o token legível é mostrado uma única vez na criação).

## 13.2 Estrutura SQL

```sql
CREATE TABLE api_keys (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    user_id         BIGINT       REFERENCES users(id),         -- usuário responsável
    name            VARCHAR(100) NOT NULL,                     -- "Integração ERP"
    key_prefix      VARCHAR(20)  NOT NULL,                     -- "orion_live_" (mostrado em listagens)
    key_hash        TEXT         NOT NULL,                     -- SHA-256 do secret
    scope           api_key_scope NOT NULL DEFAULT 'read',
    allowed_ips     JSONB,                                     -- ["200.150.10.0/24"]
    allowed_origins JSONB,
    rate_limit_per_min INTEGER NOT NULL DEFAULT 600,
    rate_limit_per_day INTEGER NOT NULL DEFAULT 50000,
    last_used_at    TIMESTAMPTZ,
    last_used_ip    VARCHAR(100),
    last_used_endpoint VARCHAR(255),
    total_requests  BIGINT       NOT NULL DEFAULT 0,
    issued_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ,
    revoked_at      TIMESTAMPTZ,
    revoked_reason  VARCHAR(100),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_api_keys_expires_after_issue CHECK (expires_at IS NULL OR expires_at > issued_at),
    CONSTRAINT chk_api_keys_revoked_inactive   CHECK (revoked_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_api_keys_hash    ON api_keys (key_hash);
CREATE INDEX idx_api_keys_company_active ON api_keys (company_id) WHERE revoked_at IS NULL AND deleted_at IS NULL;
CREATE INDEX idx_api_keys_prefix         ON api_keys (key_prefix);
CREATE INDEX idx_api_keys_expires         ON api_keys (expires_at) WHERE expires_at IS NOT NULL AND revoked_at IS NULL;
```

## 13.3 Prisma

```prisma
model ApiKey {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  userId            BigInt?   @map("user_id")
  name              String    @db.VarChar(100)
  keyPrefix         String    @map("key_prefix") @db.VarChar(20)
  keyHash           String    @map("key_hash")
  scope             String    @default("read") @db.VarChar(20)
  allowedIps        Json?     @map("allowed_ips")
  allowedOrigins    Json?     @map("allowed_origins")
  rateLimitPerMin   Int       @default(600) @map("rate_limit_per_min")
  rateLimitPerDay   Int       @default(50000) @map("rate_limit_per_day")
  lastUsedAt        DateTime? @map("last_used_at") @db.Timestamptz
  lastUsedIp        String?   @map("last_used_ip") @db.VarChar(100)
  lastUsedEndpoint  String?   @map("last_used_endpoint") @db.VarChar(255)
  totalRequests     BigInt    @default(0) @map("total_requests")
  issuedAt          DateTime  @default(now()) @map("issued_at") @db.Timestamptz
  expiresAt         DateTime? @map("expires_at") @db.Timestamptz
  revokedAt         DateTime? @map("revoked_at") @db.Timestamptz
  revokedReason     String?   @map("revoked_reason") @db.VarChar(100)
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])
  user              User?     @relation(fields: [userId], references: [id])

  @@index([companyId], map: "idx_api_keys_company_active")
  @@index([keyPrefix], map: "idx_api_keys_prefix")
  @@map("api_keys")
}
```

## 13.4 Dados de exemplo

```sql
INSERT INTO api_keys (uuid, company_id, name, key_prefix, key_hash, scope, rate_limit_per_min, expires_at)
VALUES
 ('eeeee111-0000-0000-0000-000000000001', 1, 'Integração ERP SAP',   'orion_live_','hash_001...','read', 600, '2026-01-15 00:00:00-03'),
 ('eeeee111-0000-0000-0000-000000000002', 1, 'BI PowerBI',           'orion_live_','hash_002...','read', 1200,'2026-01-15 00:00:00-03'),
 ('eeeee111-0000-0000-0000-000000000003', 2, 'App Mobile Vendedores','orion_live_','hash_003...','write',3000, NULL);
```

---

# Capítulo 14 — Tabela `file_uploads`

## 14.1 Descrição

Registro de todos os arquivos enviados ao Orion (logos, anexos de resultado, imports CSV, exports PDF, avatares). O conteúdo físico vai para S3/MinIO; esta tabela armazena metadados, controle de vírus, expiração e vínculo com a entidade de domínio.

## 14.2 Estrutura SQL

```sql
CREATE TABLE file_uploads (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    user_id         BIGINT       REFERENCES users(id),
    purpose         file_purpose NOT NULL,
    original_name   VARCHAR(500) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    size_bytes      BIGINT       NOT NULL,
    storage_provider VARCHAR(30) NOT NULL DEFAULT 's3',
    storage_bucket  VARCHAR(100) NOT NULL,
    storage_key     TEXT         NOT NULL,
    storage_region  VARCHAR(30),
    checksum_sha256 CHAR(64),
    width           INTEGER,
    height          INTEGER,
    duration_secs   INTEGER,                            -- para áudio/vídeo
    pages           INTEGER,                            -- para PDF
    is_image        BOOLEAN      NOT NULL DEFAULT FALSE,
    is_virus_scanned BOOLEAN     NOT NULL DEFAULT FALSE,
    is_virus_clean  BOOLEAN,
    virus_scan_at   TIMESTAMPTZ,
    virus_scan_engine VARCHAR(50),
    attached_to_table VARCHAR(100),                     -- 'results', 'users', 'companies'
    attached_to_id  BIGINT,
    attached_to_uuid UUID,
    url_expires_at  TIMESTAMPTZ,                        -- URL pré-assinada válida até
    permanent       BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at      TIMESTAMPTZ,                        -- purge automático
    purged_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_files_size_positive   CHECK (size_bytes > 0),
    CONSTRAINT chk_files_purge_check     CHECK (purged_at IS NULL OR active = FALSE),
    CONSTRAINT chk_files_virus_check     CHECK (purpose <> 'attachment' OR is_virus_scanned = TRUE)
);

CREATE UNIQUE INDEX udx_files_uuid       ON file_uploads (uuid);
CREATE UNIQUE INDEX udx_files_checksum   ON file_uploads (checksum_sha256, company_id)
    WHERE checksum_sha256 IS NOT NULL;
CREATE INDEX idx_files_company_purpose   ON file_uploads (company_id, purpose, created_at DESC);
CREATE INDEX idx_files_attached          ON file_uploads (attached_to_table, attached_to_id)
    WHERE attached_to_id IS NOT NULL;
CREATE INDEX idx_files_expires           ON file_uploads (expires_at) WHERE expires_at IS NOT NULL AND purged_at IS NULL;
CREATE INDEX idx_files_virus_pending     ON file_uploads (id) WHERE is_virus_scanned = FALSE;
```

## 14.3 Dados de exemplo

```sql
INSERT INTO file_uploads (uuid, company_id, user_id, purpose, original_name, mime_type, size_bytes, storage_bucket, storage_key, checksum_sha256, is_image, attached_to_table, attached_to_id)
VALUES
 ('fffff111-0000-0000-0000-000000000001', 1, 1, 'avatar',    'ana.jpg',     'image/jpeg', 248_320, 'orion-uploads-br','avatars/1/1-ana.jpg',     'a1b2...', TRUE, 'users', 1),
 ('fffff111-0000-0000-0000-000000000002', 1, 2, 'attachment','comprovante.pdf','application/pdf', 156_000, 'orion-uploads-br','attachments/results/123.pdf','c3d4...', FALSE, 'results', 123),
 ('fffff111-0000-0000-0000-000000000003', 1, 1, 'import',    'metas_jan.csv','text/csv', 45_000, 'orion-uploads-br','imports/goals/2025-01.csv','e5f6...', FALSE, NULL, NULL);
```

## 14.4 Prisma

```prisma
model FileUpload {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  userId            BigInt?   @map("user_id")
  purpose           String    @db.VarChar(30)
  originalName      String    @map("original_name") @db.VarChar(500)
  mimeType          String    @map("mime_type") @db.VarChar(100)
  sizeBytes         BigInt    @map("size_bytes")
  storageProvider   String    @default("s3") @map("storage_provider") @db.VarChar(30)
  storageBucket     String    @map("storage_bucket") @db.VarChar(100)
  storageKey        String    @map("storage_key")
  storageRegion     String?   @map("storage_region") @db.VarChar(30)
  checksumSha256    String?   @map("checksum_sha256") @db.Char(64)
  width             Int?
  height            Int?
  durationSecs      Int?      @map("duration_secs")
  pages             Int?
  isImage           Boolean   @default(false) @map("is_image")
  isVirusScanned    Boolean   @default(false) @map("is_virus_scanned")
  isVirusClean      Boolean?  @map("is_virus_clean")
  virusScanAt       DateTime? @map("virus_scan_at") @db.Timestamptz
  virusScanEngine   String?   @map("virus_scan_engine") @db.VarChar(50)
  attachedToTable   String?   @map("attached_to_table") @db.VarChar(100)
  attachedToId      BigInt?   @map("attached_to_id")
  attachedToUuid    String?   @map("attached_to_uuid") @db.Uuid
  urlExpiresAt      DateTime? @map("url_expires_at") @db.Timestamptz
  permanent         Boolean   @default(false)
  expiresAt         DateTime? @map("expires_at") @db.Timestamptz
  purgedAt          DateTime? @map("purged_at") @db.Timestamptz
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])
  user              User?     @relation(fields: [userId], references: [id])

  @@index([companyId, purpose], map: "idx_files_company_purpose")
  @@index([attachedToTable, attachedToId], map: "idx_files_attached")
  @@index([expiresAt], map: "idx_files_expires")
  @@map("file_uploads")
}
```

---

# Capítulo 15 — Tabela `roles`

## 15.1 Descrição

Perfis de acesso (RBAC). Cada empresa pode criar perfis próprios, mas há perfis **sistema** (`is_system=TRUE`) pré-cadastrados que não podem ser excluídos: `Administrador`, `Diretor`, `Gerente`, `Supervisor`, `Vendedor`.

## 15.2 Estrutura SQL

```sql
CREATE TABLE roles (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,    -- atribuído a novos usuários
    level           INTEGER      NOT NULL DEFAULT 0,         -- hierarquia 0=lowest, 100=admin
    color           color_hex    DEFAULT '#6B7280',
    icon            VARCHAR(50),
    permissions_count INTEGER    NOT NULL DEFAULT 0,         -- cache denormalizado
    users_count     INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    deleted_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    external_id     VARCHAR(100),
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_roles_level_range      CHECK (level BETWEEN 0 AND 100),
    CONSTRAINT chk_roles_system_undeletable CHECK (NOT is_system OR active = TRUE),
    CONSTRAINT chk_roles_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_roles_uuid          ON roles (uuid);
CREATE UNIQUE INDEX udx_roles_company_slug  ON roles (company_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_roles_company              ON roles (company_id, level DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_roles_default              ON roles (company_id) WHERE is_default = TRUE AND deleted_at IS NULL;
```

## 15.3 Dados de exemplo

```sql
INSERT INTO roles (uuid, company_id, name, slug, is_system, level, color, description)
VALUES
 ('1111aaaa-0000-0000-0000-000000000001', 1, 'Administrador','admin',     TRUE, 100, '#DC2626', 'Acesso total ao Orion'),
 ('1111aaaa-0000-0000-0000-000000000002', 1, 'Diretor',      'director',  TRUE,  80, '#7C3AED', 'Visão estratégica e gestores'),
 ('1111aaaa-0000-0000-0000-000000000003', 1, 'Gerente',      'manager',   TRUE,  60, '#2563EB', 'Gestão de filial e equipe'),
 ('1111aaaa-0000-0000-0000-000000000004', 1, 'Supervisor',   'supervisor',TRUE,  40, '#059669', 'Supervisão operacional'),
 ('1111aaaa-0000-0000-0000-000000000005', 1, 'Vendedor',     'salesperson',TRUE,20, '#D97706', 'Acesso de ponta, lança resultados');
```

## 15.4 Prisma

```prisma
model Role {
  id               BigInt    @id @default(autoincrement())
  uuid             String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId        BigInt    @map("company_id")
  name             String    @db.VarChar(100)
  slug             String    @db.VarChar(100)
  description      String?
  isSystem         Boolean   @default(false) @map("is_system")
  isDefault        Boolean   @default(false) @map("is_default")
  level            Int       @default(0)
  color            String?   @db.VarChar(7)
  icon             String?   @db.VarChar(50)
  permissionsCount Int       @default(0) @map("permissions_count")
  usersCount       Int       @default(0) @map("users_count")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  createdBy        BigInt?   @map("created_by")
  updatedBy        BigInt?   @map("updated_by")
  deletedBy        BigInt?   @map("deleted_by")
  active           Boolean   @default(true)
  version          Int       @default(1)
  externalId       String?   @map("external_id") @db.VarChar(100)
  metadata         Json      @default("{}")

  company          Company   @relation(fields: [companyId], references: [id])
  users            User[]
  permissions      RolePermission[]

  @@unique([companyId, slug], map: "udx_roles_company_slug")
  @@index([companyId], map: "idx_roles_company")
  @@map("roles")
}
```

---

# Capítulo 16 — Tabela `permissions`

## 16.1 Descrição

Catálogo global de permissões granulares (não é multi-tenant — é o catálogo de capacidades do Orion). Cada permissão é uma tupla `module.action` que o frontend usa para mostrar/esconder UI e o backend usa para autorizar endpoints.

## 16.2 Estrutura SQL

```sql
CREATE TABLE permissions (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    module          VARCHAR(100) NOT NULL,           -- 'users', 'goals', 'campaigns'
    action          VARCHAR(100) NOT NULL,           -- 'create','read','update','delete','export'
    slug            VARCHAR(200) NOT NULL,           -- 'users.create'
    description     TEXT,
    category        VARCHAR(50),                     -- 'CRUD','reports','admin','integration'
    is_system       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_dangerous    BOOLEAN      NOT NULL DEFAULT FALSE,  -- highlight in UI
    requires_2fa    BOOLEAN      NOT NULL DEFAULT FALSE,
    ui_label_key    VARCHAR(200),                    -- i18n key
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,

    CONSTRAINT chk_permissions_slug_format CHECK (slug ~ '^[a-z_]+\.[a-z_]+$')
);

CREATE UNIQUE INDEX udx_permissions_slug ON permissions (slug);
CREATE UNIQUE INDEX udx_permissions_module_action ON permissions (module, action);
CREATE INDEX idx_permissions_module ON permissions (module);
```

## 16.3 Dados de exemplo (subset)

```sql
INSERT INTO permissions (uuid, module, action, slug, description, category, is_dangerous)
VALUES
 ('2222aaaa-0000-0000-0000-000000000001','users','create','users.create','Criar usuários','CRUD',FALSE),
 ('2222aaaa-0000-0000-0000-000000000002','users','delete','users.delete','Excluir usuários','CRUD',TRUE),
 ('2222aaaa-0000-0000-0000-000000000003','goals','create','goals.create','Criar metas','CRUD',FALSE),
 ('2222aaaa-0000-0000-0000-000000000004','goals','export','goals.export','Exportar metas','reports',FALSE),
 ('2222aaaa-0000-0000-0000-000000000005','system_settings','update','system_settings.update','Alterar config global','admin',TRUE),
 ('2222aaaa-0000-0000-0000-000000000006','audit_logs','read','audit_logs.read','Ler auditoria','admin',FALSE);
```

## 16.4 Prisma

```prisma
model Permission {
  id            BigInt    @id @default(autoincrement())
  uuid          String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  module        String    @db.VarChar(100)
  action        String    @db.VarChar(100)
  slug          String    @unique @db.VarChar(200)
  description   String?
  category      String?   @db.VarChar(50)
  isSystem      Boolean   @default(true) @map("is_system")
  isDangerous   Boolean   @default(false) @map("is_dangerous")
  requires2fa   Boolean   @default(false) @map("requires_2fa")
  uiLabelKey    String?   @map("ui_label_key") @db.VarChar(200)
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active        Boolean   @default(true)
  version       Int       @default(1)

  roles         RolePermission[]

  @@unique([module, action], map: "udx_permissions_module_action")
  @@index([module], map: "idx_permissions_module")
  @@map("permissions")
}
```

---

# Capítulo 17 — Tabela `role_permissions`

## 17.1 Descrição

Junção N:N entre `roles` e `permissions`. Permite que um perfil tenha centenas de permissões. Adicionalmente, suporta **escopos** — uma permissão pode ser concedida apenas para a filial do usuário (`scope='own_branch'`) ou para toda a empresa (`scope='company'`).

## 17.2 Estrutura SQL

```sql
CREATE TABLE role_permissions (
    id              BIGSERIAL PRIMARY KEY,
    role_id         BIGINT       NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   BIGINT       NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    scope           VARCHAR(30)  NOT NULL DEFAULT 'company',  -- company, own_branch, own, custom
    conditions      JSONB,                                     -- { branch_ids: [1,2], ... }
    granted_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    granted_by      BIGINT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,

    CONSTRAINT chk_rp_scope_values CHECK (scope IN ('company','own_branch','own','custom'))
);

CREATE UNIQUE INDEX udx_role_permissions ON role_permissions (role_id, permission_id, scope);
CREATE INDEX idx_rp_role ON role_permissions (role_id);
CREATE INDEX idx_rp_perm ON role_permissions (permission_id);
```

## 17.3 Dados de exemplo

```sql
INSERT INTO role_permissions (role_id, permission_id, scope, granted_by)
VALUES
 (1, 1, 'company', 1),   -- admin: users.create em toda empresa
 (1, 2, 'company', 1),   -- admin: users.delete
 (1, 5, 'company', 1),   -- admin: system_settings.update
 (3, 3, 'own_branch', 1),-- gerente: goals.create apenas na própria filial
 (5, 4, 'own', 1);       -- vendedor: goals.export apenas das próprias metas
```

## 17.4 Prisma

```prisma
model RolePermission {
  id           BigInt   @id @default(autoincrement())
  roleId       BigInt   @map("role_id")
  permissionId BigInt   @map("permission_id")
  scope        String   @default("company") @db.VarChar(30)
  conditions   Json?
  grantedAt    DateTime @default(now()) @map("granted_at") @db.Timestamptz
  grantedBy    BigInt?  @map("granted_by")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz
  active       Boolean  @default(true)
  version      Int      @default(1)

  role         Role         @relation(fields: [roleId], references: [id])
  permission   Permission   @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId, scope], map: "udx_role_permissions")
  @@index([permissionId], map: "idx_rp_perm")
  @@map("role_permissions")
}
```

---

# PARTE III — DOMÍNIO DE GESTÃO DE PERFORMANCE

# Capítulo 18 — Tabela `indicator_categories`

## 18.1 Descrição

Categorias que agrupam indicadores (Financeiro, Clientes, Operacional, etc.). Cada empresa cria suas próprias categorias; são fornecidas categorias padrão como sugestão no onboarding.

## 18.2 Estrutura SQL

```sql
CREATE TABLE indicator_categories (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    description     TEXT,
    color           color_hex    DEFAULT '#3B82F6',
    icon            VARCHAR(50),
    sort_order      INTEGER      NOT NULL DEFAULT 0,
    is_system       BOOLEAN      NOT NULL DEFAULT FALSE,
    parent_id       BIGINT       REFERENCES indicator_categories(id),
    indicators_count INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    deleted_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    external_id     VARCHAR(100),
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_indcat_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE),
    CONSTRAINT chk_indcat_no_self_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

CREATE UNIQUE INDEX udx_indcat_company_slug ON indicator_categories (company_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_indcat_company_parent      ON indicator_categories (company_id, parent_id, sort_order) WHERE deleted_at IS NULL;
```

## 18.3 Dados de exemplo

```sql
INSERT INTO indicator_categories (uuid, company_id, name, slug, color, icon, sort_order, is_system)
VALUES
 ('3333aaaa-0000-0000-0000-000000000001', 1, 'Financeiro',  'financeiro',  '#10B981', 'dollar',  1, TRUE),
 ('3333aaaa-0000-0000-0000-000000000002', 1, 'Vendas',      'vendas',      '#3B82F6', 'cart',    2, TRUE),
 ('3333aaaa-0000-0000-0000-000000000003', 1, 'Clientes',    'clientes',    '#8B5CF6', 'users',   3, TRUE),
 ('3333aaaa-0000-0000-0000-000000000004', 1, 'Operacional', 'operacional', '#F59E0B', 'cog',     4, TRUE),
 ('3333aaaa-0000-0000-0000-000000000005', 1, 'RH',          'rh',          '#EC4899', 'heart',   5, TRUE);
```

## 18.4 Prisma

```prisma
model IndicatorCategory {
  id               BigInt    @id @default(autoincrement())
  uuid             String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId        BigInt    @map("company_id")
  name             String    @db.VarChar(100)
  slug             String    @db.VarChar(100)
  description      String?
  color            String?   @db.VarChar(7)
  icon             String?   @db.VarChar(50)
  sortOrder        Int       @default(0) @map("sort_order")
  isSystem         Boolean   @default(false) @map("is_system")
  parentId         BigInt?   @map("parent_id")
  indicatorsCount  Int       @default(0) @map("indicators_count")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  createdBy        BigInt?   @map("created_by")
  updatedBy        BigInt?   @map("updated_by")
  deletedBy        BigInt?   @map("deleted_by")
  active           Boolean   @default(true)
  version          Int       @default(1)
  externalId       String?   @map("external_id") @db.VarChar(100)
  metadata         Json      @default("{}")

  company          Company   @relation(fields: [companyId], references: [id])
  parent           IndicatorCategory?  @relation("IndicatorCategoryTree", fields: [parentId], references: [id])
  children         IndicatorCategory[] @relation("IndicatorCategoryTree")
  indicators       Indicator[]

  @@unique([companyId, slug], map: "udx_indcat_company_slug")
  @@index([companyId, parentId], map: "idx_indcat_company_parent")
  @@map("indicator_categories")
}
```

---

# Capítulo 19 — Tabela `indicators`

## 19.1 Descrição

**A tabela mais importante do Orion.** Define o que será medido, como, com qual peso e onde será exibido. Cada empresa cria indicadores próprios e o sistema fornece uma biblioteca de templates.

## 19.2 Estrutura SQL

```sql
CREATE TABLE indicators (
    id                BIGSERIAL PRIMARY KEY,
    uuid              UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id        BIGINT       NOT NULL REFERENCES companies(id),
    category_id       BIGINT       REFERENCES indicator_categories(id),
    code              VARCHAR(50),                            -- 'VND-001'
    name              VARCHAR(255) NOT NULL,
    slug              VARCHAR(255) NOT NULL,
    description       TEXT,
    indicator_type    VARCHAR(30)  NOT NULL,                  -- currency, percentage, integer, decimal, score, time, custom
    unit              VARCHAR(30),
    decimal_places    INTEGER      NOT NULL DEFAULT 2,
    icon              VARCHAR(100),
    color             color_hex    DEFAULT '#3B82F6',
    formula           TEXT,                                   -- expressão JS sandboxed
    formula_deps      JSONB,                                  -- [ids de outros indicadores usados]
    weight            DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    target_value      DECIMAL(18,4),
    min_value         DECIMAL(18,4),
    max_value         DECIMAL(18,4),
    aggregation       VARCHAR(30)  NOT NULL DEFAULT 'sum',   -- sum, avg, max, min, last, count
    frequency         VARCHAR(20)  NOT NULL DEFAULT 'daily', -- hourly, daily, weekly, monthly
    is_required       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_cumulative     BOOLEAN      NOT NULL DEFAULT FALSE,    -- soma ao longo do mês
    allow_manual_input BOOLEAN     NOT NULL DEFAULT TRUE,
    allow_attachments BOOLEAN      NOT NULL DEFAULT TRUE,
    allow_notes       BOOLEAN      NOT NULL DEFAULT TRUE,
    requires_approval BOOLEAN      NOT NULL DEFAULT FALSE,
    show_dashboard    BOOLEAN      NOT NULL DEFAULT TRUE,
    show_ranking      BOOLEAN      NOT NULL DEFAULT TRUE,
    show_reports      BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order        INTEGER      NOT NULL DEFAULT 0,
    is_template       BOOLEAN      NOT NULL DEFAULT FALSE,    -- originou de template
    template_id       BIGINT,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    effective_from    DATE,
    effective_to      DATE,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,
    created_by        BIGINT,
    updated_by        BIGINT,
    deleted_by        BIGINT,
    active            BOOLEAN      NOT NULL DEFAULT TRUE,
    version           INTEGER      NOT NULL DEFAULT 1,
    external_id       VARCHAR(100),
    metadata          JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_ind_type_values CHECK (indicator_type IN ('currency','percentage','integer','decimal','score','time','custom')),
    CONSTRAINT chk_ind_agg_values  CHECK (aggregation IN ('sum','avg','max','min','last','count')),
    CONSTRAINT chk_ind_freq_values CHECK (frequency IN ('hourly','daily','weekly','monthly')),
    CONSTRAINT chk_ind_min_max     CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value),
    CONSTRAINT chk_ind_weight_pos  CHECK (weight >= 0),
    CONSTRAINT chk_ind_decimals    CHECK (decimal_places BETWEEN 0 AND 6),
    CONSTRAINT chk_ind_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_indicators_uuid         ON indicators (uuid);
CREATE UNIQUE INDEX udx_indicators_company_slug ON indicators (company_id, slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX udx_indicators_company_code ON indicators (company_id, code) WHERE code IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_indicators_company_cat         ON indicators (company_id, category_id, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_indicators_dashboard           ON indicators (company_id, sort_order) WHERE show_dashboard AND deleted_at IS NULL;
CREATE INDEX idx_indicators_ranking             ON indicators (company_id, sort_order) WHERE show_ranking AND deleted_at IS NULL;
CREATE INDEX idx_indicators_active              ON indicators (company_id, id) WHERE active AND deleted_at IS NULL;
```

## 19.3 Tipos de Indicador

| Tipo | Descrição | Exemplo |
|---|---|---|
| `currency` | Valor monetário na moeda da empresa. | Receita, ticket médio. |
| `percentage` | Percentual 0–100 (ou 0–1 configurável). | Conversão, churn. |
| `integer` | Contagem inteira. | Nº de atendimentos, vendas. |
| `decimal` | Número decimal genérico. | Horas trabalhadas. |
| `score` | Pontuação 0–1000 com pesos. | NPS, satisfação. |
| `time` | Duração em segundos. | TMA, tempo de resposta. |
| `custom` | Sem agregação; armazenado como JSONB. | Lista de produtos vendidos. |

## 19.4 Dados de exemplo

```sql
INSERT INTO indicators (uuid, company_id, category_id, code, name, slug, indicator_type, unit, target_value, weight, show_dashboard, show_ranking, aggregation, frequency)
VALUES
 ('4444aaaa-0000-0000-0000-000000000001', 1, 2, 'VND-001', 'Receita Líquida',         'receita-liquida',         'currency',   'BRL', 50000.00, 3.0, TRUE, TRUE, 'sum','daily'),
 ('4444aaaa-0000-0000-0000-000000000002', 1, 2, 'VND-002', 'Ticket Médio',            'ticket-medio',            'currency',   'BRL', 350.00,  1.0, TRUE, FALSE,'avg','daily'),
 ('4444aaaa-0000-0000-0000-000000000003', 1, 3, 'CLI-001', 'NPS',                     'nps',                     'score',      '',   75.0,    1.5, TRUE, TRUE, 'avg','weekly'),
 ('4444aaaa-0000-0000-0000-000000000004', 1, 4, 'OPS-001', 'Tempo Médio Atendimento', 'tempo-medio-atendimento', 'time',       's',  600.0,   0.5, TRUE, FALSE,'avg','daily'),
 ('4444aaaa-0000-0000-0000-000000000005', 1, 1, 'FIN-001', 'Margem de Lucro',         'margem-lucro',            'percentage', '%',  25.0,    2.0, TRUE, TRUE, 'avg','monthly');
```

## 19.5 Prisma

```prisma
model Indicator {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  categoryId        BigInt?   @map("category_id")
  code              String?   @db.VarChar(50)
  name              String    @db.VarChar(255)
  slug              String    @db.VarChar(255)
  description       String?
  indicatorType     String    @map("indicator_type") @db.VarChar(30)
  unit              String?   @db.VarChar(30)
  decimalPlaces     Int       @default(2) @map("decimal_places")
  icon              String?   @db.VarChar(100)
  color             String?   @db.VarChar(7)
  formula           String?
  formulaDeps       Json?     @map("formula_deps")
  weight            Decimal   @default(1.0) @db.Decimal(10, 2)
  targetValue       Decimal?  @map("target_value") @db.Decimal(18, 4)
  minValue          Decimal?  @map("min_value") @db.Decimal(18, 4)
  maxValue          Decimal?  @map("max_value") @db.Decimal(18, 4)
  aggregation       String    @default("sum") @db.VarChar(30)
  frequency         String    @default("daily") @db.VarChar(20)
  isRequired        Boolean   @default(false) @map("is_required")
  isCumulative      Boolean   @default(false) @map("is_cumulative")
  allowManualInput  Boolean   @default(true) @map("allow_manual_input")
  allowAttachments  Boolean   @default(true) @map("allow_attachments")
  allowNotes        Boolean   @default(true) @map("allow_notes")
  requiresApproval  Boolean   @default(false) @map("requires_approval")
  showDashboard     Boolean   @default(true) @map("show_dashboard")
  showRanking       Boolean   @default(true) @map("show_ranking")
  showReports       Boolean   @default(true) @map("show_reports")
  sortOrder         Int       @default(0) @map("sort_order")
  isTemplate        Boolean   @default(false) @map("is_template")
  templateId        BigInt?   @map("template_id")
  isActive          Boolean   @default(true) @map("is_active")
  effectiveFrom     DateTime? @map("effective_from") @db.Date
  effectiveTo       DateTime? @map("effective_to") @db.Date
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  deletedBy         BigInt?   @map("deleted_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  externalId        String?   @map("external_id") @db.VarChar(100)
  metadata          Json      @default("{}")

  company           Company            @relation(fields: [companyId], references: [id])
  category          IndicatorCategory? @relation(fields: [categoryId], references: [id])
  goals             Goal[]
  results           Result[]

  @@unique([companyId, slug], map: "udx_indicators_company_slug")
  @@unique([companyId, code], map: "udx_indicators_company_code")
  @@index([companyId, categoryId], map: "idx_indicators_company_cat")
  @@index([companyId, sortOrder], map: "idx_indicators_dashboard")
  @@map("indicators")
}
```

---

# Capítulo 20 — Tabela `goals`

## 20.1 Descrição

Metas atribuídas a usuários, filiais ou empresa inteira, por período e indicador. Cada meta pode ter sub-metas derivadas (diária a partir de mensal, etc.).

## 20.2 Estrutura SQL

```sql
CREATE TABLE goals (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    branch_id       BIGINT       REFERENCES branches(id),
    user_id         BIGINT       REFERENCES users(id),       -- NULL = meta da filial/empresa
    indicator_id    BIGINT       NOT NULL REFERENCES indicators(id),
    goal_type       goal_type    NOT NULL,
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    target_value    DECIMAL(18,4) NOT NULL,
    min_value       DECIMAL(18,4),
    stretch_value   DECIMAL(18,4),                            -- valor "sonho" acima do alvo
    weight          DECIMAL(10,2) NOT NULL DEFAULT 1.0,
    achieved_value  DECIMAL(18,4),                            -- cache calculado
    achieved_pct    DECIMAL(8,4),                             -- 0–1 ou 0–1.5 se ultrapassou
    achieved_at     TIMESTAMPTZ,                              -- meta atingida
    parent_goal_id  BIGINT       REFERENCES goals(id),        -- meta mensal -> diárias
    notes           TEXT,
    is_auto_distributed BOOLEAN NOT NULL DEFAULT FALSE,       -- distribuída automaticamente entre subordinados
    distribution_strategy VARCHAR(30),                        -- 'equal','proportional','manual'
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    deleted_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    external_id     VARCHAR(100),
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_goals_dates         CHECK (end_date >= start_date),
    CONSTRAINT chk_goals_target_pos    CHECK (target_value > 0),
    CONSTRAINT chk_goals_weight_pos    CHECK (weight >= 0),
    CONSTRAINT chk_goals_scope_check   CHECK (user_id IS NOT NULL OR branch_id IS NOT NULL),
    CONSTRAINT chk_goals_stretch_gt_target CHECK (stretch_value IS NULL OR stretch_value >= target_value),
    CONSTRAINT chk_goals_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_goals_uuid                ON goals (uuid);
CREATE INDEX idx_goals_company_user_date          ON goals (company_id, user_id, start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_company_branch_date        ON goals (company_id, branch_id, start_date, end_date) WHERE deleted_at IS NULL AND user_id IS NULL;
CREATE INDEX idx_goals_indicator                  ON goals (indicator_id, start_date);
CREATE INDEX idx_goals_parent                    ON goals (parent_goal_id) WHERE parent_goal_id IS NOT NULL;
CREATE INDEX idx_goals_active_period             ON goals (company_id, start_date, end_date) WHERE deleted_at IS NULL;
```

## 20.3 Tipos de Meta

| Tipo | Duração típica | Caso de uso |
|---|---|---|
| `daily` | 1 dia | Metas operacionais diárias (vendas do dia). |
| `weekly` | 7 dias | Fechamento semanal. |
| `monthly` | 1 mês | Meta padrão. |
| `quarterly` | 3 meses | Metas estratégicas. |
| `yearly` | 12 meses | Metas anuais corporativas. |
| `custom` | Arbitrário | Campanhas, períodos especiais. |

## 20.4 Trigger de cálculo de achieved_pct

```sql
CREATE OR REPLACE FUNCTION fn_goals_recalc_achieved()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.achieved_value IS NOT NULL AND NEW.target_value > 0 THEN
        NEW.achieved_pct := NEW.achieved_value / NEW.target_value;
        IF NEW.achieved_pct >= 1 AND NEW.achieved_at IS NULL THEN
            NEW.achieved_at := now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_goals_before_update_achieved
BEFORE UPDATE OF achieved_value ON goals
FOR EACH ROW EXECUTE FUNCTION fn_goals_recalc_achieved();
```

## 20.5 Dados de exemplo

```sql
INSERT INTO goals (uuid, company_id, branch_id, user_id, indicator_id, goal_type, start_date, end_date, target_value, weight)
VALUES
 ('5555aaaa-0000-0000-0000-000000000001', 1, 1, 1, 1, 'monthly','2025-01-01','2025-01-31', 50000.00, 3.0),
 ('5555aaaa-0000-0000-0000-000000000002', 1, 1, 2, 1, 'monthly','2025-01-01','2025-01-31', 30000.00, 3.0),
 ('5555aaaa-0000-0000-0000-000000000003', 1, 1, 1, 3, 'weekly', '2025-01-13','2025-01-19', 75.0,    1.5),
 ('5555aaaa-0000-0000-0000-000000000004', 1, NULL,NULL,1,'yearly','2025-01-01','2025-12-31', 1000000.00, 5.0),
 ('5555aaaa-0000-0000-0000-000000000005', 1, 2, 3, 1, 'monthly','2025-01-01','2025-01-31', 20000.00, 3.0);
```

## 20.6 Prisma

```prisma
model Goal {
  id                   BigInt    @id @default(autoincrement())
  uuid                 String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId            BigInt    @map("company_id")
  branchId             BigInt?   @map("branch_id")
  userId               BigInt?   @map("user_id")
  indicatorId          BigInt    @map("indicator_id")
  goalType             String    @map("goal_type") @db.VarChar(30)
  startDate            DateTime  @map("start_date") @db.Date
  endDate              DateTime  @map("end_date") @db.Date
  targetValue          Decimal   @map("target_value") @db.Decimal(18, 4)
  minValue             Decimal?  @map("min_value") @db.Decimal(18, 4)
  stretchValue         Decimal?  @map("stretch_value") @db.Decimal(18, 4)
  weight               Decimal   @default(1.0) @db.Decimal(10, 2)
  achievedValue        Decimal?  @map("achieved_value") @db.Decimal(18, 4)
  achievedPct          Decimal?  @map("achieved_pct") @db.Decimal(8, 4)
  achievedAt           DateTime? @map("achieved_at") @db.Timestamptz
  parentGoalId         BigInt?   @map("parent_goal_id")
  notes                String?
  isAutoDistributed    Boolean   @default(false) @map("is_auto_distributed")
  distributionStrategy String?   @map("distribution_strategy") @db.VarChar(30)
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt            DateTime? @map("deleted_at") @db.Timestamptz
  createdBy            BigInt?   @map("created_by")
  updatedBy            BigInt?   @map("updated_by")
  deletedBy            BigInt?   @map("deleted_by")
  active               Boolean   @default(true)
  version              Int       @default(1)
  externalId           String?   @map("external_id") @db.VarChar(100)
  metadata             Json      @default("{}")

  company              Company    @relation(fields: [companyId], references: [id])
  branch               Branch?    @relation(fields: [branchId], references: [id])
  user                 User?      @relation(fields: [userId], references: [id])
  indicator            Indicator  @relation(fields: [indicatorId], references: [id])
  parentGoal           Goal?      @relation("GoalTree", fields: [parentGoalId], references: [id])
  childGoals           Goal[]     @relation("GoalTree")

  @@index([companyId, userId, startDate], map: "idx_goals_company_user_date")
  @@index([companyId, branchId, startDate], map: "idx_goals_company_branch_date")
  @@index([indicatorId, startDate], map: "idx_goals_indicator")
  @@index([parentGoalId], map: "idx_goals_parent")
  @@map("goals")
}
```

---

# Capítulo 21 — Tabela `results`

## 21.1 Descrição

Resultados lançados (medidas efetivas). Tabela de **maior volume** do Orion — pode crescer a milhões de registros por mês em clientes enterprise. Por isso é **particionada por mês** (ver Capítulo 38).

## 21.2 Estrutura SQL (particionada)

```sql
CREATE TABLE results (
    id              BIGSERIAL,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL,
    branch_id       BIGINT,
    user_id         BIGINT       NOT NULL,
    indicator_id    BIGINT       NOT NULL,
    goal_id         BIGINT,
    result_date     DATE         NOT NULL,
    result_time     TIME         NOT NULL DEFAULT '00:00:00',
    value           DECIMAL(18,4) NOT NULL,
    previous_value  DECIMAL(18,4),                          -- valor anterior (para deltas)
    cumulative_value DECIMAL(18,4),                         -- soma acumulada no período
    notes           TEXT,
    attachments     JSONB        NOT NULL DEFAULT '[]'::jsonb,
    source          VARCHAR(30)  NOT NULL DEFAULT 'manual', -- manual, import, api, automation
    source_ref      VARCHAR(100),                           -- id externo
    status          result_status NOT NULL DEFAULT 'draft',
    approved_by     BIGINT,
    approved_at     TIMESTAMPTZ,
    rejected_reason TEXT,
    revision_of     BIGINT,                                 -- ID do resultado revisado
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    deleted_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    PRIMARY KEY (id, result_date),
    CONSTRAINT chk_results_value_not_nan CHECK (value = value),  -- NaN check
    CONSTRAINT chk_results_status_flow   CHECK (
        (status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR
        status <> 'approved'),
    CONSTRAINT chk_results_reject_reason CHECK (status <> 'rejected' OR rejected_reason IS NOT NULL),
    CONSTRAINT chk_results_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
) PARTITION BY RANGE (result_date);

-- Partição do mês corrente (exemplo Janeiro/2025)
CREATE TABLE results_2025_01 PARTITION OF results
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE results_2025_02 PARTITION OF results
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Partition default ( captura de erros de range)
CREATE TABLE results_default PARTITION OF results DEFAULT;

-- Índices em cada partição são automáticos via parent indexes:
CREATE UNIQUE INDEX udx_results_uuid      ON results (uuid, result_date);
CREATE INDEX idx_results_company_user_date ON results (company_id, user_id, result_date DESC);
CREATE INDEX idx_results_company_ind_date  ON results (company_id, indicator_id, result_date DESC);
CREATE INDEX idx_results_branch_date       ON results (company_id, branch_id, result_date DESC) WHERE branch_id IS NOT NULL;
CREATE INDEX idx_results_goal              ON results (goal_id) WHERE goal_id IS NOT NULL;
CREATE INDEX idx_results_status_pending    ON results (company_id, indicator_id) WHERE status = 'pending';
CREATE INDEX idx_results_active_partial    ON results (company_id, user_id) WHERE deleted_at IS NULL AND active = TRUE;
```

## 21.3 Trigger de atualização de meta

```sql
CREATE OR REPLACE FUNCTION fn_results_update_goal_achieved()
RETURNS TRIGGER AS $$
DECLARE
    v_goal_id BIGINT;
    v_ind_id  BIGINT;
    v_start   DATE;
    v_end     DATE;
    v_agg     VARCHAR(30);
BEGIN
    v_goal_id := COALESCE(NEW.goal_id, OLD.goal_id);
    IF v_goal_id IS NULL THEN RETURN NEW; END IF;

    SELECT indicator_id, start_date, end_date INTO v_ind_id, v_start, v_end
    FROM goals WHERE id = v_goal_id;
    SELECT aggregation INTO v_agg FROM indicators WHERE id = v_ind_id;

    UPDATE goals g
    SET achieved_value = (
        SELECT
            CASE v_agg
                WHEN 'sum' THEN COALESCE(SUM(r.value),0)
                WHEN 'avg' THEN COALESCE(AVG(r.value),0)
                WHEN 'max' THEN COALESCE(MAX(r.value),0)
                WHEN 'min' THEN COALESCE(MIN(r.value),0)
                WHEN 'last' THEN COALESCE((SELECT value FROM results
                                            WHERE goal_id = v_goal_id
                                              AND deleted_at IS NULL
                                            ORDER BY result_date DESC, result_time DESC LIMIT 1),0)
                WHEN 'count' THEN COUNT(*)
                ELSE 0
            END
        FROM results r
        WHERE r.goal_id = v_goal_id
          AND r.deleted_at IS NULL
          AND r.status = 'approved'
          AND r.result_date BETWEEN v_start AND v_end
    )
    WHERE g.id = v_goal_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_results_after_write
AFTER INSERT OR UPDATE OR DELETE ON results
FOR EACH ROW EXECUTE FUNCTION fn_results_update_goal_achieved();
```

## 21.4 Dados de exemplo

```sql
INSERT INTO results (uuid, company_id, branch_id, user_id, indicator_id, goal_id, result_date, result_time, value, status, source)
VALUES
 ('6666aaaa-0000-0000-0000-000000000001', 1, 1, 1, 1, 1, '2025-01-10','10:30:00', 1850.50, 'approved','manual'),
 ('6666aaaa-0000-0000-0000-000000000002', 1, 1, 1, 1, 1, '2025-01-11','11:15:00', 2100.00, 'approved','manual'),
 ('6666aaaa-0000-0000-0000-000000000003', 1, 1, 2, 1, 2, '2025-01-10','09:45:00', 980.75,  'pending', 'manual'),
 ('6666aaaa-0000-0000-0000-000000000004', 1, 1, 1, 3, 3, '2025-01-15','14:00:00', 72.0,    'approved','api'),
 ('6666aaaa-0000-0000-0000-000000000005', 1, 2, 3, 1, 5, '2025-01-12','16:20:00', 750.00,  'draft',   'import');
```

## 21.5 Prisma

```prisma
model Result {
  id               BigInt    @default(autoincrement())
  uuid             String    @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId        BigInt    @map("company_id")
  branchId         BigInt?   @map("branch_id")
  userId           BigInt    @map("user_id")
  indicatorId      BigInt    @map("indicator_id")
  goalId           BigInt?   @map("goal_id")
  resultDate       DateTime  @map("result_date") @db.Date
  resultTime       String    @default("00:00:00") @map("result_time") @db.Time
  value            Decimal   @db.Decimal(18, 4)
  previousValue    Decimal?  @map("previous_value") @db.Decimal(18, 4)
  cumulativeValue  Decimal?  @map("cumulative_value") @db.Decimal(18, 4)
  notes            String?
  attachments      Json      @default("[]")
  source           String    @default("manual") @db.VarChar(30)
  sourceRef        String?   @map("source_ref") @db.VarChar(100)
  status           String    @default("draft") @db.VarChar(20)
  approvedBy       BigInt?   @map("approved_by")
  approvedAt       DateTime? @map("approved_at") @db.Timestamptz
  rejectedReason   String?   @map("rejected_reason")
  revisionOf       BigInt?   @map("revision_of")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  createdBy        BigInt?   @map("created_by")
  updatedBy        BigInt?   @map("updated_by")
  deletedBy        BigInt?   @map("deleted_by")
  active           Boolean   @default(true)
  version          Int       @default(1)
  metadata         Json      @default("{}")

  company          Company    @relation(fields: [companyId], references: [id])
  branch           Branch?    @relation(fields: [branchId], references: [id])
  user             User       @relation(fields: [userId], references: [id])
  indicator        Indicator  @relation(fields: [indicatorId], references: [id])
  goal             Goal?      @relation(fields: [goalId], references: [id])

  @@unique([uuid, resultDate], map: "udx_results_uuid")
  @@index([companyId, userId, resultDate], map: "idx_results_company_user_date")
  @@index([companyId, indicatorId, resultDate], map: "idx_results_company_ind_date")
  @@index([goalId], map: "idx_results_goal")
  @@map("results")
}
```

---

# Capítulo 22 — Tabela `campaigns`

## 22.1 Descrição

Campanhas de incentivo/gamificação. Agrupam indicadores, participantes, prêmios e regras de pontuação em um período.

## 22.2 Estrutura SQL

```sql
CREATE TABLE campaigns (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    branch_id       BIGINT       REFERENCES branches(id),     -- NULL = toda empresa
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    description     TEXT,
    objective       TEXT,
    rules           JSONB        NOT NULL DEFAULT '{}'::jsonb,
    scoring_formula TEXT,                                     -- ex: 'sum(results.value) * weight'
    indicators      JSONB        NOT NULL DEFAULT '[]'::jsonb, -- array de indicator_ids
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    image_url       TEXT,
    banner_url      TEXT,
    color           color_hex    DEFAULT '#7C3AED',
    status          campaign_status NOT NULL DEFAULT 'draft',
    visibility      VARCHAR(20)  NOT NULL DEFAULT 'private',  -- public, private, restricted
    max_participants INTEGER,
    participants_count INTEGER    NOT NULL DEFAULT 0,
    is_featured     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    deleted_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    external_id     VARCHAR(100),
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_campaigns_dates       CHECK (end_date >= start_date),
    CONSTRAINT chk_campaigns_visibility  CHECK (visibility IN ('public','private','restricted')),
    CONSTRAINT chk_campaigns_max_part    CHECK (max_participants IS NULL OR max_participants > 0),
    CONSTRAINT chk_campaigns_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_campaigns_uuid         ON campaigns (uuid);
CREATE UNIQUE INDEX udx_campaigns_company_slug ON campaigns (company_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_company_status      ON campaigns (company_id, status, start_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_active_period       ON campaigns (company_id, start_date, end_date) WHERE status = 'active';
CREATE INDEX idx_campaigns_featured            ON campaigns (company_id) WHERE is_featured AND deleted_at IS NULL;
```

## 22.3 Trigger de mudança de status

```sql
CREATE OR REPLACE FUNCTION fn_campaigns_auto_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'scheduled' AND NEW.start_date <= CURRENT_DATE THEN
        NEW.status := 'active'::campaign_status;
    ELSIF NEW.status = 'active' AND NEW.end_date < CURRENT_DATE THEN
        NEW.status := 'finished'::campaign_status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_campaigns_before_update
BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION fn_campaigns_auto_status();
```

## 22.4 Dados de exemplo

```sql
INSERT INTO campaigns (uuid, company_id, name, slug, description, objective, start_date, end_date, status, color, indicators, rules)
VALUES
 ('7777aaaa-0000-0000-0000-000000000001', 1, 'Vendador de Ouro Janeiro','vendedor-ouro-jan-2025',
  'Campanha de incentivo para vendedores em janeiro','Maximizar receita líquida',
  '2025-01-01','2025-01-31','active','#F59E0B',
  '[1,2]','{"scoring":"sum(value)","weight_by_indicator":{1:3,2:1}}'::jsonb),
 ('7777aaaa-0000-0000-0000-000000000002', 1, 'NPS Campeão Q1','nps-campeao-q1-2025',
  'Reconhecer quem mantém NPS alto no trimestre','NPS médio acima de 75',
  '2025-01-01','2025-03-31','active','#8B5CF6',
  '[3]','{"scoring":"avg(value)","min_results":5}'::jsonb),
 ('7777aaaa-0000-0000-0000-000000000003', 2, 'Black Friday Sul','black-friday-sul-2025',
  'Campanha de volume na Black Friday','Bater 150% do volume de novembro passado',
  '2025-11-24','2025-11-30','scheduled','#DC2626',
  '[1]','{"scoring":"sum(value)","bonus_multiplier":1.5}'::jsonb);
```

## 22.5 Prisma

```prisma
model Campaign {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  branchId          BigInt?   @map("branch_id")
  name              String    @db.VarChar(255)
  slug              String    @db.VarChar(255)
  description       String?
  objective         String?
  rules             Json      @default("{}")
  scoringFormula    String?   @map("scoring_formula")
  indicators        Json      @default("[]")
  startDate         DateTime  @map("start_date") @db.Date
  endDate           DateTime  @map("end_date") @db.Date
  imageUrl          String?   @map("image_url")
  bannerUrl         String?   @map("banner_url")
  color             String?   @db.VarChar(7)
  status            String    @default("draft") @db.VarChar(20)
  visibility        String    @default("private") @db.VarChar(20)
  maxParticipants   Int?      @map("max_participants")
  participantsCount Int       @default(0) @map("participants_count")
  isFeatured        Boolean   @default(false) @map("is_featured")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  deletedBy         BigInt?   @map("deleted_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  externalId        String?   @map("external_id") @db.VarChar(100)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])
  branch            Branch?   @relation(fields: [branchId], references: [id])
  participants      CampaignParticipant[]
  awards            Award[]
  rankings          Ranking[]

  @@unique([companyId, slug], map: "udx_campaigns_company_slug")
  @@index([companyId, status, startDate], map: "idx_campaigns_company_status")
  @@map("campaigns")
}
```

---

# Capítulo 23 — Tabela `campaign_participants`

## 23.1 Estrutura SQL

```sql
CREATE TABLE campaign_participants (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    campaign_id     BIGINT       NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    user_id         BIGINT       NOT NULL REFERENCES users(id),
    branch_id       BIGINT       REFERENCES branches(id),
    joined_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    joined_by       BIGINT,                                  -- self, manager, admin
    status          VARCHAR(20)  NOT NULL DEFAULT 'active',  -- active, withdrawn, banned
    withdrawn_at    TIMESTAMPTZ,
    initial_score   DECIMAL(18,4) NOT NULL DEFAULT 0,        -- carry-over
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_cp_status_values CHECK (status IN ('active','withdrawn','banned')),
    CONSTRAINT chk_cp_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_cp_campaign_user ON campaign_participants (campaign_id, user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cp_user                  ON campaign_participants (user_id, status);
CREATE INDEX idx_cp_campaign_status       ON campaign_participants (campaign_id, status);
```

## 23.2 Dados de exemplo

```sql
INSERT INTO campaign_participants (uuid, campaign_id, company_id, user_id, branch_id, joined_by, initial_score)
VALUES
 ('8888aaaa-0000-0000-0000-000000000001', 1, 1, 1, 1, NULL, 0),
 ('8888aaaa-0000-0000-0000-000000000002', 1, 1, 2, 1, NULL, 0),
 ('8888aaaa-0000-0000-0000-000000000003', 1, 1, 3, 2, NULL, 0),
 ('8888aaaa-0000-0000-0000-000000000004', 2, 1, 1, 1, NULL, 0),
 ('8888aaaa-0000-0000-0000-000000000005', 3, 2, 4, 3, 4, 0);
```

## 23.3 Prisma

```prisma
model CampaignParticipant {
  id            BigInt    @id @default(autoincrement())
  uuid          String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  campaignId    BigInt    @map("campaign_id")
  companyId     BigInt    @map("company_id")
  userId        BigInt    @map("user_id")
  branchId      BigInt?   @map("branch_id")
  joinedAt      DateTime  @default(now()) @map("joined_at") @db.Timestamptz
  joinedBy      BigInt?   @map("joined_by")
  status        String    @default("active") @db.VarChar(20)
  withdrawnAt   DateTime? @map("withdrawn_at") @db.Timestamptz
  initialScore  Decimal   @default(0) @map("initial_score") @db.Decimal(18, 4)
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt     DateTime? @map("deleted_at") @db.Timestamptz
  active        Boolean   @default(true)
  version       Int       @default(1)
  metadata      Json      @default("{}")

  campaign      Campaign  @relation(fields: [campaignId], references: [id])
  company       Company   @relation(fields: [companyId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  branch        Branch?   @relation(fields: [branchId], references: [id])

  @@unique([campaignId, userId], map: "udx_cp_campaign_user")
  @@index([userId, status], map: "idx_cp_user")
  @@map("campaign_participants")
}
```

---

# Capítulo 24 — Tabela `awards`

## 24.1 Estrutura SQL

```sql
CREATE TABLE awards (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    campaign_id     BIGINT       NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    award_type      award_type   NOT NULL,
    points          INTEGER,
    value           DECIMAL(18,2),                            -- valor monetário
    image_url       TEXT,
    badge_code      VARCHAR(50),
    min_position    INTEGER,                                  -- 1 = primeiro lugar
    min_score       DECIMAL(18,4),
    max_recipients  INTEGER,                                  -- limita quantos podem receber
    recipients_count INTEGER     NOT NULL DEFAULT 0,
    is_guaranteed   BOOLEAN      NOT NULL DEFAULT FALSE,      -- todo mundo que bater recebe
    sort_order      INTEGER      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    deleted_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_awards_points_or_value CHECK (award_type NOT IN ('points','money') OR points IS NOT NULL OR value IS NOT NULL),
    CONSTRAINT chk_awards_position_pos    CHECK (min_position IS NULL OR min_position >= 1),
    CONSTRAINT chk_awards_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_awards_uuid ON awards (uuid);
CREATE INDEX idx_awards_campaign    ON awards (campaign_id, sort_order) WHERE deleted_at IS NULL;
```

## 24.2 Dados de exemplo

```sql
INSERT INTO awards (uuid, campaign_id, company_id, name, award_type, points, value, min_position, max_recipients, sort_order)
VALUES
 ('9999aaaa-0000-0000-0000-000000000001', 1, 1, 'Troféu Ouro',        'badge', 1000, NULL, 1, 1, 1),
 ('9999aaaa-0000-0000-0000-000000000002', 1, 1, 'Troféu Prata',       'badge', 600,  NULL, 2, 1, 2),
 ('9999aaaa-0000-0000-0000-000000000003', 1, 1, 'Troféu Bronze',      'badge', 300,  NULL, 3, 1, 3),
 ('9999aaaa-0000-0000-0000-000000000004', 1, 1, 'Bonificação Top 10', 'money', NULL, 500.00, NULL, 10, 4),
 ('9999aaaa-0000-0000-0000-000000000005', 2, 1, 'Medalha NPS 75+',    'badge', 250,  NULL, NULL, NULL, 1);
```

## 24.3 Prisma

```prisma
model Award {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  campaignId      BigInt    @map("campaign_id")
  companyId       BigInt    @map("company_id")
  name            String    @db.VarChar(255)
  description     String?
  awardType       String    @map("award_type") @db.VarChar(50)
  points          Int?
  value           Decimal?  @db.Decimal(18, 2)
  imageUrl        String?   @map("image_url")
  badgeCode       String?   @map("badge_code") @db.VarChar(50)
  minPosition     Int?      @map("min_position")
  minScore        Decimal?  @map("min_score") @db.Decimal(18, 4)
  maxRecipients   Int?      @map("max_recipients")
  recipientsCount Int       @default(0) @map("recipients_count")
  isGuaranteed    Boolean   @default(false) @map("is_guaranteed")
  sortOrder       Int       @default(0) @map("sort_order")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz
  createdBy       BigInt?   @map("created_by")
  updatedBy       BigInt?   @map("updated_by")
  deletedBy       BigInt?   @map("deleted_by")
  active          Boolean   @default(true)
  version         Int       @default(1)
  metadata        Json      @default("{}")

  campaign        Campaign  @relation(fields: [campaignId], references: [id])
  company         Company   @relation(fields: [companyId], references: [id])

  @@index([campaignId, sortOrder], map: "idx_awards_campaign")
  @@map("awards")
}
```

---

# Capítulo 25 — Tabela `rankings`

## 25.1 Estrutura SQL

```sql
CREATE TABLE rankings (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    branch_id       BIGINT       REFERENCES branches(id),
    user_id         BIGINT       NOT NULL REFERENCES users(id),
    campaign_id     BIGINT       REFERENCES campaigns(id),
    indicator_id    BIGINT       REFERENCES indicators(id),
    period_type     goal_type    NOT NULL,
    period_start    DATE         NOT NULL,
    period_end      DATE         NOT NULL,
    score           DECIMAL(18,4) NOT NULL,
    normalized_score DECIMAL(8,4),                            -- 0–1 vs. meta
    position        INTEGER      NOT NULL,
    previous_position INTEGER,                                -- para indicar ↑↓
    trend           VARCHAR(10),                              -- up, down, stable, new
    calculated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    is_official     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_rankings_dates    CHECK (period_end >= period_start),
    CONSTRAINT chk_rankings_position CHECK (position >= 1),
    CONSTRAINT chk_rankings_scope    CHECK (campaign_id IS NOT NULL OR indicator_id IS NOT NULL),
    CONSTRAINT chk_rankings_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_rankings_scope ON rankings (company_id, branch_id, user_id, campaign_id, indicator_id, period_type, period_start)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_rankings_company_period ON rankings (company_id, period_type, period_start, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_rankings_user            ON rankings (user_id, period_start DESC);
CREATE INDEX idx_rankings_campaign        ON rankings (campaign_id, position) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_rankings_official        ON rankings (company_id, period_start) WHERE is_official;
```

## 25.2 Dados de exemplo

```sql
INSERT INTO rankings (uuid, company_id, branch_id, user_id, campaign_id, period_type, period_start, period_end, score, position, previous_position, trend, is_official)
VALUES
 ('aaaa1111-aaaa-0000-0000-000000000001', 1, 1, 1, 1, 'monthly','2025-01-01','2025-01-31', 35000.00, 1, NULL, 'new',   TRUE),
 ('aaaa1111-aaaa-0000-0000-000000000002', 1, 1, 2, 1, 'monthly','2025-01-01','2025-01-31', 28000.00, 2, NULL, 'new',   TRUE),
 ('aaaa1111-aaaa-0000-0000-000000000003', 1, 2, 3, 1, 'monthly','2025-01-01','2025-01-31', 15500.00, 3, NULL, 'new',   TRUE),
 ('aaaa1111-aaaa-0000-0000-000000000004', 1, 1, 1, 2, 'weekly', '2025-01-13','2025-01-19', 76.5,     1, 2,    'up',    FALSE),
 ('aaaa1111-aaaa-0000-0000-000000000005', 1, 1, 2, 2, 'weekly', '2025-01-13','2025-01-19', 71.0,     2, 1,    'down',  FALSE);
```

## 25.3 Prisma

```prisma
model Ranking {
  id               BigInt    @id @default(autoincrement())
  uuid             String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId        BigInt    @map("company_id")
  branchId         BigInt?   @map("branch_id")
  userId           BigInt    @map("user_id")
  campaignId       BigInt?   @map("campaign_id")
  indicatorId      BigInt?   @map("indicator_id")
  periodType       String    @map("period_type") @db.VarChar(30)
  periodStart      DateTime  @map("period_start") @db.Date
  periodEnd        DateTime  @map("period_end") @db.Date
  score            Decimal   @db.Decimal(18, 4)
  normalizedScore  Decimal?  @map("normalized_score") @db.Decimal(8, 4)
  position         Int
  previousPosition Int?      @map("previous_position")
  trend            String?   @db.VarChar(10)
  calculatedAt     DateTime  @default(now()) @map("calculated_at") @db.Timestamptz
  isOfficial       Boolean   @default(false) @map("is_official")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  active           Boolean   @default(true)
  version          Int       @default(1)
  metadata         Json      @default("{}")

  company          Company   @relation(fields: [companyId], references: [id])
  branch           Branch?   @relation(fields: [branchId], references: [id])
  user             User      @relation(fields: [userId], references: [id])
  campaign         Campaign? @relation(fields: [campaignId], references: [id])

  @@index([companyId, periodType, periodStart, position], map: "idx_rankings_company_period")
  @@index([userId, periodStart], map: "idx_rankings_user")
  @@index([campaignId, position], map: "idx_rankings_campaign")
  @@map("rankings")
}
```

---

# PARTE IV — DOMÍNIO DE EXPERIÊNCIA E COMUNICAÇÃO

# Capítulo 26 — Tabela `dashboards`

## 26.1 Descrição

Dashboards personalizados por usuário (ou shared com equipe). Cada dashboard é uma coleção de widgets com layout definido em JSONB (compatível com React Grid Layout).

## 26.2 Estrutura SQL

```sql
CREATE TABLE dashboards (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    user_id         BIGINT       REFERENCES users(id),       -- NULL = dashboard do tenant
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    layout          JSONB        NOT NULL DEFAULT '[]'::jsonb,
    theme           VARCHAR(50)  NOT NULL DEFAULT 'default',
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    is_shared       BOOLEAN      NOT NULL DEFAULT FALSE,
    shared_with     JSONB        NOT NULL DEFAULT '[]'::jsonb, -- [user_ids] ou role slugs
    filters         JSONB        NOT NULL DEFAULT '{}'::jsonb, -- { branch_id, period, ... }
    refresh_interval INTEGER,                                 -- auto refresh em segundos
    last_viewed_at  TIMESTAMPTZ,
    views_count     BIGINT       NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    deleted_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    external_id     VARCHAR(100),
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_dashboards_single_default CHECK (
        NOT is_default OR
        (NOT EXISTS (
            SELECT 1 FROM dashboards d2
            WHERE d2.company_id = dashboards.company_id
              AND d2.user_id IS NOT DISTINCT FROM dashboards.user_id
              AND d2.is_default
              AND d2.id IS DISTINCT FROM dashboards.id
              AND d2.deleted_at IS NULL
        ))
    ),
    CONSTRAINT chk_dashboards_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_dashboards_uuid       ON dashboards (uuid);
CREATE INDEX idx_dashboards_user              ON dashboards (user_id, is_default) WHERE deleted_at IS NULL;
CREATE INDEX idx_dashboards_company_shared    ON dashboards (company_id) WHERE is_shared AND deleted_at IS NULL;
```

## 26.3 Dados de exemplo

```sql
INSERT INTO dashboards (uuid, company_id, user_id, name, layout, theme, is_default, is_shared)
VALUES
 ('bbbb1111-aaaa-0000-0000-000000000001', 1, 1, 'Meu Dashboard', '[{"i":"w1","x":0,"y":0,"w":6,"h":4}]'::jsonb, 'default', TRUE,  FALSE),
 ('bbbb1111-aaaa-0000-0000-000000000002', 1, 1, 'Visão Gerencial','[{"i":"w1","x":0,"y":0,"w":12,"h":6}]'::jsonb, 'executive', FALSE, TRUE),
 ('bbbb1111-aaaa-0000-0000-000000000003', 1, NULL, 'Dashboard Padrão Tenant', '[{"i":"w1","x":0,"y":0,"w":4,"h":4}]'::jsonb, 'default', TRUE, TRUE);
```

## 26.4 Prisma

```prisma
model Dashboard {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId       BigInt    @map("company_id")
  userId          BigInt?   @map("user_id")
  name            String    @db.VarChar(255)
  description     String?
  layout          Json      @default("[]")
  theme           String    @default("default") @db.VarChar(50)
  isDefault       Boolean   @default(false) @map("is_default")
  isShared        Boolean   @default(false) @map("is_shared")
  sharedWith      Json      @default("[]") @map("shared_with")
  filters         Json      @default("{}")
  refreshInterval Int?      @map("refresh_interval")
  lastViewedAt    DateTime? @map("last_viewed_at") @db.Timestamptz
  viewsCount      BigInt    @default(0) @map("views_count")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz
  createdBy       BigInt?   @map("created_by")
  updatedBy       BigInt?   @map("updated_by")
  deletedBy       BigInt?   @map("deleted_by")
  active          Boolean   @default(true)
  version         Int       @default(1)
  externalId      String?   @map("external_id") @db.VarChar(100)
  metadata        Json      @default("{}")

  company         Company   @relation(fields: [companyId], references: [id])
  user            User?     @relation(fields: [userId], references: [id])
  widgets         Widget[]

  @@index([userId, isDefault], map: "idx_dashboards_user")
  @@index([companyId], map: "idx_dashboards_company_shared")
  @@map("dashboards")
}
```

---

# Capítulo 27 — Tabela `widgets`

## 27.1 Estrutura SQL

```sql
CREATE TABLE widgets (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    dashboard_id    BIGINT       NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    widget_type     VARCHAR(100) NOT NULL,                   -- 'chart','kpi','ranking','table','calendar'
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    configuration   JSONB        NOT NULL DEFAULT '{}'::jsonb,
    data_source     JSONB,                                   -- { indicator_id, period, agg }
    position        JSONB        NOT NULL,                   -- { x, y, w, h }
    is_visible      BOOLEAN      NOT NULL DEFAULT TRUE,
    cache_ttl       INTEGER      NOT NULL DEFAULT 60,        -- segundos
    last_rendered_at TIMESTAMPTZ,
    last_error      TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_widgets_position_valid CHECK (
        (position->>'x')::int >= 0 AND
        (position->>'y')::int >= 0 AND
        (position->>'w')::int BETWEEN 1 AND 12 AND
        (position->>'h')::int >= 1
    ),
    CONSTRAINT chk_widgets_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_widgets_uuid       ON widgets (uuid);
CREATE INDEX idx_widgets_dashboard         ON widgets (dashboard_id, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_widgets_type              ON widgets (company_id, widget_type);
```

## 27.2 Tipos de Widget

```text
chart.line      chart.bar       chart.pie      chart.area    chart.heatmap
kpi.single      kpi.target      kpi.delta      kpi.sparkline
ranking.list    ranking.podium
table.dynamic   calendar.month  map.geo        card.callout  alert.banner
```

## 27.3 Dados de exemplo

```sql
INSERT INTO widgets (uuid, dashboard_id, company_id, widget_type, title, configuration, data_source, position)
VALUES
 ('cccc1111-aaaa-0000-0000-000000000001', 1, 1, 'kpi.single','Receita do Mês','{"format":"currency"}'::jsonb,'{"indicator_id":1,"period":"monthly"}'::jsonb,'{"x":0,"y":0,"w":3,"h":2}'::jsonb),
 ('cccc1111-aaaa-0000-0000-000000000002', 1, 1, 'chart.line','Evolução Receita','{"color":"#10B981"}'::jsonb,'{"indicator_id":1,"period":"daily","agg":"sum"}'::jsonb,'{"x":3,"y":0,"w":9,"h":4}'::jsonb),
 ('cccc1111-aaaa-0000-0000-000000000003', 1, 1, 'ranking.list','Top Vendedores','{}'::jsonb,'{"campaign_id":1,"period":"monthly"}'::jsonb,'{"x":0,"y":4,"w":6,"h":4}'::jsonb),
 ('cccc1111-aaaa-0000-0000-000000000004', 2, 1, 'chart.bar','Meta vs Realizado','{}'::jsonb,'{"indicator_ids":[1,2,3],"period":"monthly"}'::jsonb,'{"x":0,"y":0,"w":12,"h":6}'::jsonb),
 ('cccc1111-aaaa-0000-0000-000000000005', 3, 1, 'kpi.target','NPS Atual','{"target":75}'::jsonb,'{"indicator_id":3,"period":"weekly"}'::jsonb,'{"x":0,"y":0,"w":4,"h":2}'::jsonb);
```

## 27.4 Prisma

```prisma
model Widget {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  dashboardId     BigInt    @map("dashboard_id")
  companyId       BigInt    @map("company_id")
  widgetType      String    @map("widget_type") @db.VarChar(100)
  title           String    @db.VarChar(255)
  description     String?
  configuration   Json      @default("{}")
  dataSource      Json?     @map("data_source")
  position        Json
  isVisible       Boolean   @default(true) @map("is_visible")
  cacheTtl        Int       @default(60) @map("cache_ttl")
  lastRenderedAt  DateTime? @map("last_rendered_at") @db.Timestamptz
  lastError       String?   @map("last_error")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz
  createdBy       BigInt?   @map("created_by")
  updatedBy       BigInt?   @map("updated_by")
  active          Boolean   @default(true)
  version         Int       @default(1)
  metadata        Json      @default("{}")

  dashboard       Dashboard @relation(fields: [dashboardId], references: [id])
  company         Company   @relation(fields: [companyId], references: [id])

  @@index([dashboardId], map: "idx_widgets_dashboard")
  @@index([companyId, widgetType], map: "idx_widgets_type")
  @@map("widgets")
}
```

---

# Capítulo 28 — Tabela `notifications`

## 28.1 Descrição

Notificações endereçadas a usuários. Cada linha representa uma instância específica (uma notificação para 100 usuários = 100 linhas) para permitir marcação individual de lida e status de entrega por canal.

## 28.2 Estrutura SQL

```sql
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    user_id         BIGINT       NOT NULL REFERENCES users(id),
    template_id     BIGINT       REFERENCES notification_templates(id),
    title           VARCHAR(255) NOT NULL,
    message         TEXT         NOT NULL,
    body_html       TEXT,
    priority        notification_priority NOT NULL DEFAULT 'normal',
    notification_type VARCHAR(50) NOT NULL,                  -- goal_achieved, ranking_update, campaign_started, ...
    category        VARCHAR(50),                             -- system, social, alert, ...
    action_url      TEXT,
    action_label    VARCHAR(100),
    icon            VARCHAR(50),
    image_url       TEXT,
    channels        JSONB        NOT NULL DEFAULT '["in_app"]'::jsonb,
    channels_status JSONB        NOT NULL DEFAULT '{}'::jsonb,-- { in_app: 'delivered', email: 'sent' }
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    is_archived     BOOLEAN      NOT NULL DEFAULT FALSE,
    archived_at     TIMESTAMPTZ,
    is_actioned     BOOLEAN      NOT NULL DEFAULT FALSE,
    actioned_at     TIMESTAMPTZ,
    scheduled_for   TIMESTAMPTZ,                              -- para notifs agendadas
    sent_at         TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    related_table   VARCHAR(100),
    related_id      BIGINT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_notifications_read_consistency CHECK ((is_read = FALSE) OR (read_at IS NOT NULL)),
    CONSTRAINT chk_notifications_archived_consistency CHECK ((is_archived = FALSE) OR (archived_at IS NOT NULL)),
    CONSTRAINT chk_notifications_actioned_consistency CHECK ((is_actioned = FALSE) OR (actioned_at IS NOT NULL))
);

CREATE UNIQUE INDEX udx_notifications_uuid   ON notifications (uuid);
CREATE INDEX idx_notif_user_unread           ON notifications (user_id, created_at DESC) WHERE is_read = FALSE AND deleted_at IS NULL;
CREATE INDEX idx_notif_company_type          ON notifications (company_id, notification_type, created_at DESC);
CREATE INDEX idx_notif_scheduled             ON notifications (scheduled_for) WHERE scheduled_for IS NOT NULL AND sent_at IS NULL;
CREATE INDEX idx_notif_priority              ON notifications (user_id, priority) WHERE is_read = FALSE;
```

## 28.3 Dados de exemplo

```sql
INSERT INTO notifications (uuid, company_id, user_id, title, message, priority, notification_type, action_url, is_read)
VALUES
 ('dddd1111-aaaa-0000-0000-000000000001', 1, 1, 'Meta atingida! 🎉','Você atingiu 105% da meta de Receita Líquida de Janeiro.','high','goal_achieved','/goals/1', FALSE),
 ('dddd1111-aaaa-0000-0000-000000000002', 1, 1, 'Nova campanha disponível','A campanha Vendador de Ouro Janeiro está ativa.','normal','campaign_started','/campaigns/1', FALSE),
 ('dddd1111-aaaa-0000-0000-000000000003', 1, 2, 'Subiu no ranking 🚀','Você subiu da posição 3 para a 2 no ranking mensal.','normal','ranking_update','/rankings', TRUE),
 ('dddd1111-aaaa-0000-0000-000000000004', 1, 1, 'Resultado rejeitado','Seu lançamento de NPS foi rejeitado. Motivo: valor fora do range.','urgent','result_rejected','/results/123', FALSE),
 ('dddd1111-aaaa-0000-0000-000000000005', 2, 4, 'Backup concluído','Backup automático concluído com sucesso.','low','backup_completed',NULL, FALSE);
```

## 28.4 Prisma

```prisma
model Notification {
  id                  BigInt    @id @default(autoincrement())
  uuid                String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId           BigInt    @map("company_id")
  userId              BigInt    @map("user_id")
  templateId          BigInt?   @map("template_id")
  title               String    @db.VarChar(255)
  message             String
  bodyHtml            String?   @map("body_html")
  priority            String    @default("normal") @db.VarChar(20)
  notificationType    String    @map("notification_type") @db.VarChar(50)
  category            String?   @db.VarChar(50)
  actionUrl           String?   @map("action_url")
  actionLabel         String?   @map("action_label") @db.VarChar(100)
  icon                String?   @db.VarChar(50)
  imageUrl            String?   @map("image_url")
  channels            Json      @default("[\"in_app\"]")
  channelsStatus      Json      @default("{}") @map("channels_status")
  isRead              Boolean   @default(false) @map("is_read")
  readAt              DateTime? @map("read_at") @db.Timestamptz
  isArchived          Boolean   @default(false) @map("is_archived")
  archivedAt          DateTime? @map("archived_at") @db.Timestamptz
  isActioned          Boolean   @default(false) @map("is_actioned")
  actionedAt          DateTime? @map("actioned_at") @db.Timestamptz
  scheduledFor        DateTime? @map("scheduled_for") @db.Timestamptz
  sentAt              DateTime? @map("sent_at") @db.Timestamptz
  expiresAt           DateTime? @map("expires_at") @db.Timestamptz
  relatedTable        String?   @map("related_table") @db.VarChar(100)
  relatedId           BigInt?   @map("related_id")
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt           DateTime? @map("deleted_at") @db.Timestamptz
  createdBy           BigInt?   @map("created_by")
  updatedBy           BigInt?   @map("updated_by")
  active              Boolean   @default(true)
  version             Int       @default(1)
  metadata            Json      @default("{}")

  company             Company              @relation(fields: [companyId], references: [id])
  user                User                 @relation(fields: [userId], references: [id])
  template            NotificationTemplate? @relation(fields: [templateId], references: [id])

  @@index([userId, createdAt], map: "idx_notif_user_unread")
  @@index([companyId, notificationType], map: "idx_notif_company_type")
  @@index([scheduledFor], map: "idx_notif_scheduled")
  @@map("notifications")
}
```

---

# Capítulo 29 — Tabela `notification_templates`

## 29.1 Descrição

Templates versionados para notificações. Suporta variáveis Mustache/Handlebars e múltiplos idiomas. Reduz duplicação: uma campanha com 1000 participantes gera 1000 `notifications` a partir de **1** template.

## 29.2 Estrutura SQL

```sql
CREATE TABLE notification_templates (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       REFERENCES companies(id),   -- NULL = template global
    code            VARCHAR(100) NOT NULL,                   -- 'goal_achieved', 'campaign_started'
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    notification_type VARCHAR(50) NOT NULL,
    default_priority notification_priority NOT NULL DEFAULT 'normal',
    default_channels JSONB       NOT NULL DEFAULT '["in_app"]'::jsonb,
    subject_template TEXT,                                    -- "{{user.name}}, você atingiu a meta!"
    body_template_text TEXT,
    body_template_html TEXT,
    variables_schema JSONB       NOT NULL DEFAULT '{}'::jsonb, -- JSON schema dos vars
    locale          VARCHAR(10)  NOT NULL DEFAULT 'pt-BR',
    is_system       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_nt_active_when_not_deleted CHECK (deleted_at IS NULL OR is_active = FALSE)
);

CREATE UNIQUE INDEX udx_nt_company_code_locale ON notification_templates (company_id, code, locale) WHERE deleted_at IS NULL;
CREATE INDEX idx_nt_code                       ON notification_templates (code, is_active);
```

## 29.3 Dados de exemplo

```sql
INSERT INTO notification_templates (uuid, company_id, code, name, notification_type, subject_template, body_template_text, variables_schema, is_system)
VALUES
 ('eeee1111-aaaa-0000-0000-000000000001', NULL, 'goal_achieved',      'Meta Atingida',      'goal_achieved',
  'Parabéns {{user.first_name}}!',
  'Você atingiu {{achieved_pct}}% da meta {{indicator.name}} de {{period}}.',
  '{"user":"object","achieved_pct":"number","indicator":"object","period":"string"}'::jsonb, TRUE),
 ('eeee1111-aaaa-0000-0000-000000000002', NULL, 'campaign_started',   'Campanha Iniciada',  'campaign_started',
  'Nova campanha: {{campaign.name}}',
  'A campanha {{campaign.name}} começou! Participe: {{action_url}}',
  '{"campaign":"object","action_url":"string"}'::jsonb, TRUE),
 ('eeee1111-aaaa-0000-0000-000000000003', NULL, 'ranking_change',     'Mudança no Ranking', 'ranking_update',
  'Você é o nº {{position}} agora',
  'Subiu de {{previous_position}} para {{position}} no ranking {{period_type}}.',
  '{"position":"number","previous_position":"number","period_type":"string"}'::jsonb, TRUE),
 ('eeee1111-aaaa-0000-0000-000000000004', NULL, 'result_rejected',    'Resultado Rejeitado','result_rejected',
  'Resultado rejeitado',
  'Seu lançamento de {{indicator.name}} foi rejeitado. Motivo: {{reason}}.',
  '{"indicator":"object","reason":"string"}'::jsonb, TRUE),
 ('eeee1111-aaaa-0000-0000-000000000005', NULL, 'backup_completed',   'Backup Concluído',   'backup_completed',
  'Backup concluído',
  'Backup automático concluído em {{completed_at}}. Arquivo: {{file_name}}.',
  '{"completed_at":"string","file_name":"string"}'::jsonb, TRUE);
```

## 29.4 Prisma

```prisma
model NotificationTemplate {
  id                 BigInt    @id @default(autoincrement())
  uuid               String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId          BigInt?   @map("company_id")
  code               String    @db.VarChar(100)
  name               String    @db.VarChar(255)
  description        String?
  notificationType   String    @map("notification_type") @db.VarChar(50)
  defaultPriority    String    @default("normal") @map("default_priority") @db.VarChar(20)
  defaultChannels    Json      @default("[\"in_app\"]") @map("default_channels")
  subjectTemplate    String?   @map("subject_template")
  bodyTemplateText   String?   @map("body_template_text")
  bodyTemplateHtml   String?   @map("body_template_html")
  variablesSchema    Json      @default("{}") @map("variables_schema")
  locale             String    @default("pt-BR") @db.VarChar(10)
  isSystem           Boolean   @default(false) @map("is_system")
  isActive           Boolean   @default(true) @map("is_active")
  version            Int       @default(1)
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt          DateTime? @map("deleted_at") @db.Timestamptz
  createdBy          BigInt?   @map("created_by")
  updatedBy          BigInt?   @map("updated_by")
  metadata           Json      @default("{}")

  notifications      Notification[]

  @@unique([companyId, code, locale], map: "udx_nt_company_code_locale")
  @@index([code, isActive], map: "idx_nt_code")
  @@map("notification_templates")
}
```

---

# Capítulo 30 — Tabela `email_queue`

## 30.1 Descrição

Fila de e-mails transacionais e em massa. O worker `email-sender` consome essa tabela com `SELECT ... FOR UPDATE SKIP LOCKED` para envio paralelo. Suporta retries exponenciais, supressão de bounces e priorização.

## 30.2 Estrutura SQL

```sql
CREATE TABLE email_queue (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    notification_id BIGINT       REFERENCES notifications(id),
    template_id     BIGINT       REFERENCES notification_templates(id),
    from_email      VARCHAR(255) NOT NULL DEFAULT 'no-reply@orion.app',
    from_name       VARCHAR(100) NOT NULL DEFAULT 'Orion',
    to_email        VARCHAR(255) NOT NULL,
    to_name         VARCHAR(255),
    reply_to        VARCHAR(255),
    cc              JSONB,
    bcc             JSONB,
    subject         VARCHAR(500) NOT NULL,
    body_text       TEXT,
    body_html       TEXT,
    attachments     JSONB        NOT NULL DEFAULT '[]'::jsonb,
    headers         JSONB        NOT NULL DEFAULT '{}'::jsonb,
    tags            JSONB        NOT NULL DEFAULT '[]'::jsonb,
    priority        SMALLINT     NOT NULL DEFAULT 5,          -- 1 (urgent) a 9 (low)
    status          email_status NOT NULL DEFAULT 'queued',
    attempts        INTEGER      NOT NULL DEFAULT 0,
    max_attempts    INTEGER      NOT NULL DEFAULT 5,
    next_attempt_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_attempt_at TIMESTAMPTZ,
    last_error      TEXT,
    last_error_code VARCHAR(30),
    provider        VARCHAR(30)  NOT NULL DEFAULT 'ses',      -- ses, sendgrid, smtp
    provider_message_id VARCHAR(255),
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    opened_at       TIMESTAMPTZ,
    clicked_at      TIMESTAMPTZ,
    bounced_at      TIMESTAMPTZ,
    bounce_reason   TEXT,
    suppressed_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_email_attempts_nonneg CHECK (attempts >= 0),
    CONSTRAINT chk_email_priority_range  CHECK (priority BETWEEN 1 AND 9),
    CONSTRAINT chk_email_sent_status     CHECK (status <> 'sent' OR sent_at IS NOT NULL),
    CONSTRAINT chk_email_bounced_status  CHECK (status <> 'bounced' OR bounced_at IS NOT NULL)
);

CREATE UNIQUE INDEX udx_email_uuid        ON email_queue (uuid);
CREATE INDEX idx_email_status_priority    ON email_queue (status, next_attempt_at, priority)
    WHERE status IN ('queued','failed');
CREATE INDEX idx_email_company_created    ON email_queue (company_id, created_at DESC);
CREATE INDEX idx_email_notification        ON email_queue (notification_id) WHERE notification_id IS NOT NULL;
CREATE INDEX idx_email_to_email            ON email_queue (to_email, status);
```

## 30.3 Trigger de próximo retry

```sql
CREATE OR REPLACE FUNCTION fn_email_next_retry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'failed' AND NEW.attempts < NEW.max_attempts THEN
        -- Backoff exponencial: 1min, 5min, 15min, 60min, 240min
        NEW.next_attempt_at := now() + (power(2, NEW.attempts) || ' minutes')::interval;
        NEW.status := 'queued'::email_status;
    ELSIF NEW.status = 'failed' AND NEW.attempts >= NEW.max_attempts THEN
        NEW.active := FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_email_before_update
BEFORE UPDATE ON email_queue
FOR EACH ROW
WHEN (NEW.status = 'failed' AND OLD.status <> 'failed')
EXECUTE FUNCTION fn_email_next_retry();
```

## 30.4 Dados de exemplo

```sql
INSERT INTO email_queue (uuid, company_id, notification_id, to_email, to_name, subject, body_html, priority, status, next_attempt_at)
VALUES
 ('ffff1111-aaaa-0000-0000-000000000001', 1, 1, 'ana.souza@techvendas.com.br',  'Ana Paula Souza',  'Parabéns! Meta atingida 🎉', '<h1>Você atingiu 105% da meta</h1>', 3, 'sent',    '2025-01-15 14:01:00-03'),
 ('ffff1111-aaaa-0000-0000-000000000002', 1, 2, 'ana.souza@techvendas.com.br',  'Ana Paula Souza',  'Nova campanha disponível',     '<p>Campanha Vendador de Ouro Janeiro</p>', 5, 'queued',  now()),
 ('ffff1111-aaaa-0000-0000-000000000003', 1, 4, 'ana.souza@techvendas.com.br',  'Ana Paula Souza',  'Resultado rejeitado',          '<p>Seu lançamento foi rejeitado</p>', 2, 'sent',    '2025-01-15 14:30:00-03'),
 ('ffff1111-aaaa-0000-0000-000000000004', 1, 3, 'carlos.lima@techvendas.com.br','Carlos Eduardo Lima','Você subiu no ranking 🚀',   '<p>Posição 2 no ranking mensal</p>', 5, 'failed',  now() + interval '5 minutes'),
 ('ffff1111-aaaa-0000-0000-000000000005', 2, 5, 'roberto.alves@mercadosul.com.br','Roberto Alves',  'Backup concluído',              '<p>Backup automático concluído</p>', 9, 'queued',  now());
```

## 30.5 Prisma

```prisma
model EmailQueue {
  id                 BigInt    @id @default(autoincrement())
  uuid               String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId          BigInt    @map("company_id")
  notificationId     BigInt?   @map("notification_id")
  templateId         BigInt?   @map("template_id")
  fromEmail          String    @default("no-reply@orion.app") @map("from_email") @db.VarChar(255)
  fromName           String    @default("Orion") @map("from_name") @db.VarChar(100)
  toEmail            String    @map("to_email") @db.VarChar(255)
  toName             String?   @map("to_name") @db.VarChar(255)
  replyTo            String?   @map("reply_to") @db.VarChar(255)
  cc                 Json?
  bcc                Json?
  subject            String    @db.VarChar(500)
  bodyText           String?   @map("body_text")
  bodyHtml           String?   @map("body_html")
  attachments        Json      @default("[]")
  headers            Json      @default("{}")
  tags               Json      @default("[]")
  priority           Int       @default(5) @db.SmallInt
  status             String    @default("queued") @db.VarChar(20)
  attempts           Int       @default(0)
  maxAttempts        Int       @default(5) @map("max_attempts")
  nextAttemptAt      DateTime  @default(now()) @map("next_attempt_at") @db.Timestamptz
  lastAttemptAt      DateTime? @map("last_attempt_at") @db.Timestamptz
  lastError          String?   @map("last_error")
  lastErrorCode      String?   @map("last_error_code") @db.VarChar(30)
  provider           String    @default("ses") @db.VarChar(30)
  providerMessageId  String?   @map("provider_message_id") @db.VarChar(255)
  sentAt             DateTime? @map("sent_at") @db.Timestamptz
  deliveredAt        DateTime? @map("delivered_at") @db.Timestamptz
  openedAt           DateTime? @map("opened_at") @db.Timestamptz
  clickedAt          DateTime? @map("clicked_at") @db.Timestamptz
  bouncedAt          DateTime? @map("bounced_at") @db.Timestamptz
  bounceReason       String?   @map("bounce_reason")
  suppressedAt       DateTime? @map("suppressed_at") @db.Timestamptz
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active             Boolean   @default(true)
  version            Int       @default(1)
  metadata           Json      @default("{}")

  @@index([status, nextAttemptAt, priority], map: "idx_email_status_priority")
  @@index([companyId, createdAt], map: "idx_email_company_created")
  @@map("email_queue")
}
```

---

# Capítulo 31 — Tabela `webhook_deliveries`

## 31.1 Descrição

Entregas de webhooks (HTTP POST para URLs externas cadastradas pelo tenant). Mantém histórico completo, retries, e payload assinado (HMAC-SHA256) para que o destinatário verifique autenticidade.

## 31.2 Estrutura SQL

```sql
CREATE TABLE webhook_deliveries (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    webhook_id      BIGINT,                                   -- futuro: tabela webhooks (V1.1)
    event_type      VARCHAR(100) NOT NULL,                    -- 'result.created', 'goal.achieved'
    event_id        UUID         NOT NULL,                    -- idempotency key enviada no header
    url             TEXT         NOT NULL,
    method          VARCHAR(10)  NOT NULL DEFAULT 'POST',
    headers         JSONB        NOT NULL DEFAULT '{}'::jsonb,
    payload         JSONB        NOT NULL,
    payload_size    INTEGER      NOT NULL,
    signature       VARCHAR(128),                             -- HMAC-SHA256 hex
    status          webhook_status NOT NULL DEFAULT 'queued',
    attempts        INTEGER      NOT NULL DEFAULT 0,
    max_attempts    INTEGER      NOT NULL DEFAULT 5,
    next_attempt_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_attempt_at TIMESTAMPTZ,
    last_response_status INTEGER,
    last_response_body TEXT,
    last_error      TEXT,
    delivered_at    TIMESTAMPTZ,
    duration_ms     INTEGER,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_webhook_attempts_nonneg CHECK (attempts >= 0),
    CONSTRAINT chk_webhook_method          CHECK (method IN ('POST','PUT','PATCH')),
    CONSTRAINT chk_webhook_delivered_status CHECK (status <> 'delivered' OR delivered_at IS NOT NULL)
);

CREATE UNIQUE INDEX udx_webhook_uuid      ON webhook_deliveries (uuid);
CREATE UNIQUE INDEX udx_webhook_event_unique ON webhook_deliveries (webhook_id, event_id);
CREATE INDEX idx_webhook_status            ON webhook_deliveries (status, next_attempt_at)
    WHERE status IN ('queued','retry','failed');
CREATE INDEX idx_webhook_company_created   ON webhook_deliveries (company_id, created_at DESC);
CREATE INDEX idx_webhook_event_type        ON webhook_deliveries (company_id, event_type, created_at DESC);
```

## 31.3 Dados de exemplo

```sql
INSERT INTO webhook_deliveries (uuid, company_id, event_type, event_id, url, payload, signature, status, attempts, delivered_at, last_response_status)
VALUES
 ('1a1a1111-aaaa-0000-0000-000000000001', 1, 'result.created', '11111111-0000-0000-0000-000000000001', 'https://erp.techvendas.com.br/webhooks/orion',
  '{"result_id":1,"indicator":"receita-liquida","value":1850.50}'::jsonb, 'hmac-sha256:abc123...', 'delivered', 1, '2025-01-15 14:01:30-03', 200),
 ('1a1a1111-aaaa-0000-0000-000000000002', 1, 'goal.achieved',  '22222222-0000-0000-0000-000000000002', 'https://erp.techvendas.com.br/webhooks/orion',
  '{"goal_id":1,"achieved_pct":1.05,"user_id":1}'::jsonb, 'hmac-sha256:def456...', 'delivered', 1, '2025-01-15 14:01:31-03', 200),
 ('1a1a1111-aaaa-0000-0000-000000000003', 1, 'campaign.started','33333333-0000-0000-0000-000000000003','https://erp.techvendas.com.br/webhooks/orion',
  '{"campaign_id":1,"name":"Vendador de Ouro Janeiro"}'::jsonb, 'hmac-sha256:ghi789...', 'retry', 2, NULL, 500),
 ('1a1a1111-aaaa-0000-0000-000000000004', 2, 'ranking.updated','44444444-0000-0000-0000-000000000004','https://app.mercadosul.com.br/hooks/orion',
  '{"period":"monthly","top_user":"Roberto Alves"}'::jsonb,'hmac-sha256:jkl012...', 'queued', 0, NULL, NULL),
 ('1a1a1111-aaaa-0000-0000-000000000005', 1, 'user.created',  '55555555-0000-0000-0000-000000000005','https://erp.techvendas.com.br/webhooks/orion',
  '{"user_id":3,"email":"mariana.costa@techvendas.com.br"}'::jsonb,'hmac-sha256:mno345...', 'failed', 5, NULL, 404);
```

## 31.4 Prisma

```prisma
model WebhookDelivery {
  id                 BigInt    @id @default(autoincrement())
  uuid               String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId          BigInt    @map("company_id")
  webhookId          BigInt?   @map("webhook_id")
  eventType          String    @map("event_type") @db.VarChar(100)
  eventId            String    @map("event_id") @db.Uuid
  url                String
  method             String    @default("POST") @db.VarChar(10)
  headers            Json      @default("{}")
  payload            Json
  payloadSize        Int       @map("payload_size")
  signature          String?   @db.VarChar(128)
  status             String    @default("queued") @db.VarChar(20)
  attempts           Int       @default(0)
  maxAttempts        Int       @default(5) @map("max_attempts")
  nextAttemptAt      DateTime  @default(now()) @map("next_attempt_at") @db.Timestamptz
  lastAttemptAt      DateTime? @map("last_attempt_at") @db.Timestamptz
  lastResponseStatus Int?      @map("last_response_status")
  lastResponseBody   String?   @map("last_response_body")
  lastError          String?   @map("last_error")
  deliveredAt        DateTime? @map("delivered_at") @db.Timestamptz
  durationMs         Int?      @map("duration_ms")
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active             Boolean   @default(true)
  version            Int       @default(1)
  metadata           Json      @default("{}")

  @@unique([webhookId, eventId], map: "udx_webhook_event_unique")
  @@index([status, nextAttemptAt], map: "idx_webhook_status")
  @@index([companyId, createdAt], map: "idx_webhook_company_created")
  @@map("webhook_deliveries")
}
```

---

# PARTE V — DOMÍNIO TRANSVERSAL / PLATAFORMA

# Capítulo 32 — Tabela `audit_logs`

## 32.1 Descrição

Registro imutável de todas as ações relevantes no Orion. Cada `INSERT`/`UPDATE`/`DELETE` em tabelas de domínio (via trigger `fn_write_audit_log`, Capítulo 7) gera uma linha aqui. Tabela é **append-only**: nunca `UPDATE` ou `DELETE` (RLS nega para todos exceto admin de auditoria).

## 32.2 Estrutura SQL

```sql
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    user_id         BIGINT       REFERENCES users(id),       -- NULL = ação de sistema
    session_id      BIGINT       REFERENCES sessions(id),
    action          audit_action NOT NULL,
    table_name      VARCHAR(100) NOT NULL,
    record_id       BIGINT,
    record_uuid     UUID,
    old_value       JSONB,
    new_value       JSONB,
    changes_count   INTEGER      NOT NULL DEFAULT 0,
    ip_address      VARCHAR(100),
    user_agent      TEXT,
    request_id      VARCHAR(100),
    route           VARCHAR(255),
    method          VARCHAR(10),
    query_params    JSONB,
    body_size       INTEGER,
    duration_ms     INTEGER,
    status_code     INTEGER,
    error_message   TEXT,
    occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_audit_action_values CHECK (action IN ('create','update','delete','restore','login','logout','export','import','config'))
);

CREATE UNIQUE INDEX udx_audit_uuid      ON audit_logs (uuid);
CREATE INDEX idx_audit_company_time     ON audit_logs (company_id, occurred_at DESC);
CREATE INDEX idx_audit_user_time        ON audit_logs (user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_table_record     ON audit_logs (table_name, record_id) WHERE record_id IS NOT NULL;
CREATE INDEX idx_audit_action           ON audit_logs (company_id, action, occurred_at DESC);
CREATE INDEX idx_audit_request           ON audit_logs (request_id) WHERE request_id IS NOT NULL;
CREATE INDEX idx_audit_old_value_gin    ON audit_logs USING gin (old_value);
CREATE INDEX idx_audit_new_value_gin    ON audit_logs USING gin (new_value);
```

## 32.3 Política de imutabilidade

```sql
-- Bloqueia UPDATE e DELETE
CREATE OR REPLACE FUNCTION fn_audit_prevent_modify()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only (table=%, op=%)',
        TG_TABLENAME, TG_OP USING ERRCODE = 'raise_exception';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_no_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION fn_audit_prevent_modify();

CREATE TRIGGER trg_audit_no_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION fn_audit_prevent_modify();
```

## 32.4 Retenção e particionamento

Tabela particionada por mês (Capítulo 38). Após 24 meses, partições antigas são **exportadas para Parquet no S3** e removidas do PostgreSQL (`DETACH PARTITION` + `DROP TABLE`).

## 32.5 Dados de exemplo

```sql
INSERT INTO audit_logs (uuid, company_id, user_id, action, table_name, record_id, old_value, new_value, changes_count, ip_address, route, method, occurred_at)
VALUES
 ('2b2b1111-aaaa-0000-0000-000000000001', 1, 1, 'create','results', 1, NULL,
  '{"id":1,"value":1850.50,"indicator_id":1}'::jsonb, 6, '200.150.10.20','/api/v1/results','POST','2025-01-15 14:00:30-03'),
 ('2b2b1111-aaaa-0000-0000-000000000002', 1, 1, 'update','goals', 1,
  '{"achieved_value":15000.00}'::jsonb, '{"achieved_value":1850.50,"achieved_pct":0.037}'::jsonb, 2, '200.150.10.20','/api/v1/internal/recalc','POST','2025-01-15 14:00:31-03'),
 ('2b2b1111-aaaa-0000-0000-000000000003', 1, 1, 'login','users', 1, NULL, NULL, 0, '200.150.10.20','/api/v1/auth/login','POST','2025-01-15 13:55:00-03'),
 ('2b2b1111-aaaa-0000-0000-000000000004', 1, 2, 'export','goals', NULL, NULL, NULL, 0, '200.150.10.21','/api/v1/goals/export','GET','2025-01-15 15:10:00-03'),
 ('2b2b1111-aaaa-0000-0000-000000000005', 1, 1, 'delete','notifications', 999, '{"id":999}'::jsonb, NULL, 1, '200.150.10.20','/api/v1/notifications/999','DELETE','2025-01-15 15:20:00-03');
```

## 32.6 Prisma

```prisma
model AuditLog {
  id             BigInt    @id @default(autoincrement())
  uuid           String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId      BigInt    @map("company_id")
  userId         BigInt?   @map("user_id")
  sessionId      BigInt?   @map("session_id")
  action         String    @db.VarChar(30)
  tableName      String    @map("table_name") @db.VarChar(100)
  recordId       BigInt?   @map("record_id")
  recordUuid     String?   @map("record_uuid") @db.Uuid
  oldValue       Json?     @map("old_value")
  newValue       Json?     @map("new_value")
  changesCount   Int       @default(0) @map("changes_count")
  ipAddress      String?   @map("ip_address") @db.VarChar(100)
  userAgent      String?   @map("user_agent")
  requestId      String?   @map("request_id") @db.VarChar(100)
  route          String?   @db.VarChar(255)
  method         String?   @db.VarChar(10)
  queryParams    Json?     @map("query_params")
  bodySize       Int?      @map("body_size")
  durationMs     Int?      @map("duration_ms")
  statusCode     Int?      @map("status_code")
  errorMessage   String?   @map("error_message")
  occurredAt     DateTime  @default(now()) @map("occurred_at") @db.Timestamptz
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz
  metadata       Json      @default("{}")

  details        AuditLogDetail[]

  @@index([companyId, occurredAt], map: "idx_audit_company_time")
  @@index([userId, occurredAt], map: "idx_audit_user_time")
  @@index([tableName, recordId], map: "idx_audit_table_record")
  @@index([action, occurredAt], map: "idx_audit_action")
  @@map("audit_logs")
}
```

---

# Capítulo 33 — Tabela `audit_log_details`

## 33.1 Descrição

Detalhamento campo-a-campo das mudanças registradas em `audit_logs`. Permite responder "quem alterou o campo X de A para B em DD/MM?". Populada automaticamente pela trigger `fn_write_audit_log` (Capítulo 7.3).

## 33.2 Estrutura SQL

```sql
CREATE TABLE audit_log_details (
    id              BIGSERIAL PRIMARY KEY,
    audit_log_id    BIGINT       NOT NULL REFERENCES audit_logs(id) ON DELETE CASCADE,
    field_name      VARCHAR(100) NOT NULL,
    change_type     VARCHAR(20)  NOT NULL,   -- set, change, unset
    old_value       JSONB,
    new_value       JSONB,
    old_display     TEXT,                    -- valor formatado p/ exibição
    new_display     TEXT,
    is_sensitive    BOOLEAN      NOT NULL DEFAULT FALSE,  -- mascara o valor (ex: senha, CPF)
    occurred_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT chk_audit_detail_change_type CHECK (change_type IN ('set','change','unset'))
);

CREATE INDEX idx_audit_detail_log   ON audit_log_details (audit_log_id);
CREATE INDEX idx_audit_detail_field ON audit_log_details (field_name, occurred_at DESC);
CREATE INDEX idx_audit_detail_old_gin ON audit_log_details USING gin (old_value);
CREATE INDEX idx_audit_detail_new_gin ON audit_log_details USING gin (new_value);
```

## 33.3 Dados de exemplo

```sql
INSERT INTO audit_log_details (audit_log_id, field_name, change_type, old_value, new_value, is_sensitive)
VALUES
 (2, 'achieved_value', 'change', '15000'::jsonb, '1850.50'::jsonb, FALSE),
 (2, 'achieved_pct',   'change', '0.30'::jsonb,  '0.037'::jsonb,  FALSE),
 (1, 'id',             'set',    NULL,            '1'::jsonb,     FALSE),
 (1, 'value',          'set',    NULL,            '1850.50'::jsonb, FALSE),
 (1, 'indicator_id',   'set',    NULL,            '1'::jsonb,     FALSE);
```

## 33.4 Prisma

```prisma
model AuditLogDetail {
  id            BigInt   @id @default(autoincrement())
  auditLogId    BigInt   @map("audit_log_id")
  fieldName     String   @map("field_name") @db.VarChar(100)
  changeType    String   @map("change_type") @db.VarChar(20)
  oldValue      Json?    @map("old_value")
  newValue      Json?    @map("new_value")
  oldDisplay    String?  @map("old_display")
  newDisplay    String?  @map("new_display")
  isSensitive   Boolean  @default(false) @map("is_sensitive")
  occurredAt    DateTime @default(now()) @map("occurred_at") @db.Timestamptz

  auditLog      AuditLog @relation(fields: [auditLogId], references: [id])

  @@index([auditLogId], map: "idx_audit_detail_log")
  @@index([fieldName, occurredAt], map: "idx_audit_detail_field")
  @@map("audit_log_details")
}
```

---

# Capítulo 34 — Tabela `licenses`

## 34.1 Estrutura SQL

```sql
CREATE TABLE licenses (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    license_key     VARCHAR(255) NOT NULL,
    company_id      BIGINT       REFERENCES companies(id),     -- NULL = ainda não ativada
    plan            license_plan NOT NULL DEFAULT 'free',
    seats_included  INTEGER      NOT NULL DEFAULT 5,
    seats_used      INTEGER      NOT NULL DEFAULT 0,
    branches_included INTEGER    NOT NULL DEFAULT 1,
    branches_used   INTEGER      NOT NULL DEFAULT 0,
    storage_gb      INTEGER      NOT NULL DEFAULT 5,
    api_calls_month INTEGER      NOT NULL DEFAULT 10000,
    modules         JSONB        NOT NULL DEFAULT '[]'::jsonb,
    features        JSONB        NOT NULL DEFAULT '{}'::jsonb, -- { ai: false, custom_indicators: true }
    activation_date DATE,
    expiration_date DATE,
    auto_renew      BOOLEAN      NOT NULL DEFAULT TRUE,
    billing_cycle   VARCHAR(20)  NOT NULL DEFAULT 'monthly',  -- monthly, yearly, lifetime
    billing_amount  DECIMAL(18,2),
    billing_currency iso_currency NOT NULL DEFAULT 'BRL',
    customer_stripe_id VARCHAR(100),
    subscription_stripe_id VARCHAR(100),
    status          license_status NOT NULL DEFAULT 'trial',
    suspended_reason TEXT,
    suspended_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_lic_seats_pos      CHECK (seats_included >= 0 AND seats_used >= 0),
    CONSTRAINT chk_lic_used_le_included CHECK (seats_used <= seats_included OR plan = 'enterprise'),
    CONSTRAINT chk_lic_billing_amount CHECK (plan = 'free' OR billing_amount IS NOT NULL),
    CONSTRAINT chk_lic_dates          CHECK (expiration_date IS NULL OR activation_date IS NULL OR expiration_date >= activation_date),
    CONSTRAINT chk_lic_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_lic_key      ON licenses (license_key);
CREATE UNIQUE INDEX udx_lic_uuid     ON licenses (uuid);
CREATE INDEX idx_lic_company          ON licenses (company_id);
CREATE INDEX idx_lic_status_expires   ON licenses (status, expiration_date) WHERE active = TRUE;
CREATE INDEX idx_lic_stripe           ON licenses (customer_stripe_id) WHERE customer_stripe_id IS NOT NULL;
```

## 34.2 Trigger de atualização de uso

```sql
CREATE OR REPLACE FUNCTION fn_licenses_sync_usage()
RETURNS TRIGGER AS $$
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE active AND deleted_at IS NULL AND status = 'active'),
        COUNT(DISTINCT branch_id) FILTER (WHERE active AND deleted_at IS NULL AND branch_id IS NOT NULL)
    INTO NEW.seats_used, NEW.branches_used
    FROM users
    WHERE company_id = NEW.company_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_licenses_before_update_usage
BEFORE UPDATE ON licenses
FOR EACH ROW
WHEN (NEW.company_id IS NOT NULL)
EXECUTE FUNCTION fn_licenses_sync_usage();
```

## 34.3 Dados de exemplo

```sql
INSERT INTO licenses (uuid, license_key, company_id, plan, seats_included, branches_included, storage_gb, api_calls_month, modules, features, activation_date, expiration_date, billing_amount, status)
VALUES
 ('3b3b1111-aaaa-0000-0000-000000000001','ORN-PRO-2025-0000001', 1, 'pro',        50,  5,  50,  1000000, '["goals","campaigns","dashboards","reports","integrations"]'::jsonb, '{"ai":true,"custom_indicators":true,"white_label":false}'::jsonb,'2024-12-01','2025-12-01', 499.00,'active'),
 ('3b3b1111-aaaa-0000-0000-000000000002','ORN-ENT-2025-0000002', 2, 'enterprise', 500, 50, 500, 10000000, '["goals","campaigns","dashboards","reports","integrations","sso","audit_export"]'::jsonb,'{"ai":true,"custom_indicators":true,"white_label":true}'::jsonb,'2024-11-01','2025-11-01', 4999.00,'active'),
 ('3b3b1111-aaaa-0000-0000-000000000003','ORN-STA-2025-0000003', 3, 'starter',    10,  1,  10,  50000,  '["goals","dashboards","reports"]'::jsonb,'{"ai":false,"custom_indicators":false,"white_label":false}'::jsonb,'2024-09-01','2025-09-01', 99.00,'active'),
 ('3b3b1111-aaaa-0000-0000-000000000004','ORN-FRE-2025-0000004', NULL,'free',     3,   1,  1,   5000,   '["goals","dashboards"]'::jsonb,'{"ai":false,"custom_indicators":false,"white_label":false}'::jsonb, NULL, NULL, NULL, 'trial'),
 ('3b3b1111-aaaa-0000-0000-000000000005','ORN-PRO-2025-0000005', NULL,'pro',       50,  5,  50,  1000000, '["goals","campaigns","dashboards","reports","integrations"]'::jsonb,'{"ai":true,"custom_indicators":true,"white_label":false}'::jsonb, NULL, NULL, 499.00,'trial');
```

## 34.4 Prisma

```prisma
model License {
  id                   BigInt    @id @default(autoincrement())
  uuid                 String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  licenseKey           String    @unique @map("license_key") @db.VarChar(255)
  companyId            BigInt?   @map("company_id")
  plan                 String    @default("free") @db.VarChar(20)
  seatsIncluded        Int       @default(5) @map("seats_included")
  seatsUsed            Int       @default(0) @map("seats_used")
  branchesIncluded     Int       @default(1) @map("branches_included")
  branchesUsed         Int       @default(0) @map("branches_used")
  storageGb            Int       @default(5) @map("storage_gb")
  apiCallsMonth        Int       @default(10000) @map("api_calls_month")
  modules              Json      @default("[]")
  features             Json      @default("{}")
  activationDate       DateTime? @map("activation_date") @db.Date
  expirationDate       DateTime? @map("expiration_date") @db.Date
  autoRenew            Boolean   @default(true) @map("auto_renew")
  billingCycle         String    @default("monthly") @map("billing_cycle") @db.VarChar(20)
  billingAmount        Decimal?  @map("billing_amount") @db.Decimal(18, 2)
  billingCurrency      String    @default("BRL") @map("billing_currency") @db.Char(3)
  customerStripeId     String?   @map("customer_stripe_id") @db.VarChar(100)
  subscriptionStripeId String?   @map("subscription_stripe_id") @db.VarChar(100)
  status               String    @default("trial") @db.VarChar(20)
  suspendedReason      String?   @map("suspended_reason")
  suspendedAt          DateTime? @map("suspended_at") @db.Timestamptz
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt            DateTime? @map("deleted_at") @db.Timestamptz
  createdBy            BigInt?   @map("created_by")
  updatedBy            BigInt?   @map("updated_by")
  active               Boolean   @default(true)
  version              Int       @default(1)
  metadata             Json      @default("{}")

  company              Company?  @relation(fields: [companyId], references: [id])

  @@index([companyId], map: "idx_lic_company")
  @@index([status, expirationDate], map: "idx_lic_status_expires")
  @@map("licenses")
}
```

---

# Capítulo 35 — Tabela `backups`

## 35.1 Estrutura SQL

```sql
CREATE TABLE backups (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    backup_type     backup_type  NOT NULL,
    file_name       TEXT         NOT NULL,
    file_size       BIGINT       NOT NULL,
    file_checksum   CHAR(64),
    storage_path    TEXT         NOT NULL,
    storage_provider VARCHAR(30) NOT NULL DEFAULT 's3',
    storage_region  VARCHAR(30),
    is_encrypted    BOOLEAN      NOT NULL DEFAULT TRUE,
    encryption_algo VARCHAR(30)  NOT NULL DEFAULT 'AES-256-GCM',
    started_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    duration_secs   INTEGER,
    tables_count    INTEGER,
    records_count   BIGINT,
    status          backup_status NOT NULL DEFAULT 'queued',
    triggered_by    VARCHAR(30)  NOT NULL DEFAULT 'system', -- system, user, admin
    triggered_by_user BIGINT,
    notes           TEXT,
    error_message   TEXT,
    expires_at      TIMESTAMPTZ,                             -- purge automático
    purged_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_backups_size_pos CHECK (file_size > 0),
    CONSTRAINT chk_backups_completed_status CHECK (status <> 'completed' OR completed_at IS NOT NULL),
    CONSTRAINT chk_backups_failed_status   CHECK (status <> 'failed' OR error_message IS NOT NULL)
);

CREATE UNIQUE INDEX udx_backups_uuid      ON backups (uuid);
CREATE INDEX idx_backups_company_time      ON backups (company_id, started_at DESC);
CREATE INDEX idx_backups_status            ON backups (status, started_at) WHERE status IN ('queued','running');
CREATE INDEX idx_backups_expires           ON backups (expires_at) WHERE expires_at IS NOT NULL AND purged_at IS NULL;
```

## 35.2 Dados de exemplo

```sql
INSERT INTO backups (uuid, company_id, backup_type, file_name, file_size, storage_path, started_at, completed_at, duration_secs, status, triggered_by)
VALUES
 ('4b4b1111-aaaa-0000-0000-000000000001', 1, 'full',        'orion-1-2025-01-15-0200-full.sql.gz',  45_000_000, 's3://orion-backups/1/2025-01-15/full.sql.gz',  '2025-01-15 02:00:00-03','2025-01-15 02:04:32-03', 272, 'completed','system'),
 ('4b4b1111-aaaa-0000-0000-000000000002', 1, 'incremental', 'orion-1-2025-01-15-0300-incr.sql.gz',   2_300_000, 's3://orion-backups/1/2025-01-15/incr.sql.gz',  '2025-01-15 15:00:00-03','2025-01-15 15:00:45-03',  45, 'completed','system'),
 ('4b4b1111-aaaa-0000-0000-000000000003', 2, 'snapshot',    'orion-2-2025-01-15-snapshot.img',     120_000_000, 's3://orion-backups/2/2025-01-15/snapshot.img','2025-01-15 03:00:00-03','2025-01-15 03:08:15-03', 495, 'completed','system'),
 ('4b4b1111-aaaa-0000-0000-000000000004', 1, 'full',        'orion-1-2025-01-16-0200-full.sql.gz',  46_000_000, 's3://orion-backups/1/2025-01-16/full.sql.gz',  '2025-01-16 02:00:00-03', NULL, NULL, 'running','system'),
 ('4b4b1111-aaaa-0000-0000-000000000005', 3, 'full',        'orion-3-2025-01-15-0200-full.sql.gz',   8_000_000, 's3://orion-backups/3/2025-01-15/full.sql.gz',  '2025-01-15 02:00:00-03','2025-01-15 02:01:12-03',  72, 'failed','system');
```

## 35.3 Prisma

```prisma
model Backup {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  backupType        String    @map("backup_type") @db.VarChar(50)
  fileName          String    @map("file_name")
  fileSize          BigInt    @map("file_size")
  fileChecksum      String?   @map("file_checksum") @db.Char(64)
  storagePath       String    @map("storage_path")
  storageProvider   String    @default("s3") @map("storage_provider") @db.VarChar(30)
  storageRegion     String?   @map("storage_region") @db.VarChar(30)
  isEncrypted       Boolean   @default(true) @map("is_encrypted")
  encryptionAlgo    String    @default("AES-256-GCM") @map("encryption_algo") @db.VarChar(30)
  startedAt         DateTime  @default(now()) @map("started_at") @db.Timestamptz
  completedAt       DateTime? @map("completed_at") @db.Timestamptz
  durationSecs      Int?      @map("duration_secs")
  tablesCount       Int?      @map("tables_count")
  recordsCount      BigInt?   @map("records_count")
  status            String    @default("queued") @db.VarChar(20)
  triggeredBy       String    @default("system") @map("triggered_by") @db.VarChar(30)
  triggeredByUser   BigInt?   @map("triggered_by_user")
  notes             String?
  errorMessage      String?   @map("error_message")
  expiresAt         DateTime? @map("expires_at") @db.Timestamptz
  purgedAt          DateTime? @map("purged_at") @db.Timestamptz
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])

  @@index([companyId, startedAt], map: "idx_backups_company_time")
  @@index([status, startedAt], map: "idx_backups_status")
  @@map("backups")
}
```

---

# Capítulo 36 — Tabela `system_settings`

## 36.1 Descrição

Configurações globais e por tenant em formato chave-valor com tipagem. Permite customizar Orion sem deploy: limites, integrações, aparência, comportamentos. Cada chave tem um schema JSON que valida o valor.

## 36.2 Estrutura SQL

```sql
CREATE TABLE system_settings (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       REFERENCES companies(id),   -- NULL = global
    setting_key     VARCHAR(255) NOT NULL,
    setting_value   JSONB        NOT NULL,
    value_type      VARCHAR(30)  NOT NULL,                   -- string, integer, decimal, boolean, json, secret
    setting_group   VARCHAR(100) NOT NULL,                   -- security, branding, integrations, retention, ...
    description     TEXT,
    is_secret       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_system       BOOLEAN      NOT NULL DEFAULT FALSE,     -- não editável por tenant
    is_readonly     BOOLEAN      NOT NULL DEFAULT FALSE,
    validation_schema JSONB,                                 -- JSON schema do valor
    default_value   JSONB,
    environment     VARCHAR(20)  NOT NULL DEFAULT 'all',     -- dev, staging, prod, all
    effective_from  TIMESTAMPTZ,
    effective_to    TIMESTAMPTZ,
    last_changed_by BIGINT,
    last_changed_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    created_by      BIGINT,
    updated_by      BIGINT,
    deleted_by      BIGINT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_settings_value_type CHECK (value_type IN ('string','integer','decimal','boolean','json','secret')),
    CONSTRAINT chk_settings_env         CHECK (environment IN ('dev','staging','prod','all')),
    CONSTRAINT chk_settings_active_when_not_deleted CHECK (deleted_at IS NULL OR active = FALSE)
);

CREATE UNIQUE INDEX udx_settings_company_key_env ON system_settings (company_id, setting_key, environment) WHERE deleted_at IS NULL;
CREATE INDEX idx_settings_group                  ON system_settings (company_id, setting_group) WHERE deleted_at IS NULL;
CREATE INDEX idx_settings_global                  ON system_settings (setting_key) WHERE company_id IS NULL AND deleted_at IS NULL;
```

## 36.3 Dados de exemplo

```sql
INSERT INTO system_settings (uuid, company_id, setting_key, setting_value, value_type, setting_group, description, is_system)
VALUES
 ('5b5b1111-aaaa-0000-0000-000000000001', NULL, 'security.password_min_length',   '12'::jsonb,    'integer','security','Comprimento mínimo de senha', TRUE),
 ('5b5b1111-aaaa-0000-0000-000000000002', NULL, 'security.session_timeout_min',  '60'::jsonb,    'integer','security','Timeout de sessão em minutos', TRUE),
 ('5b5b1111-aaaa-0000-0000-000000000003', NULL, 'retention.audit_log_days',      '730'::jsonb,   'integer','retention','Dias de retenção de auditoria', TRUE),
 ('5b5b1111-aaaa-0000-0000-000000000004', 1,    'branding.primary_color',        '"#3B82F6"'::jsonb,'string','branding','Cor primária', FALSE),
 ('5b5b1111-aaaa-0000-0000-000000000005', 1,    'integrations.slack_webhook_url','"https://hooks.slack.com/..."'::jsonb,'secret','integrations','Webhook Slack', FALSE);
```

## 36.4 Prisma

```prisma
model SystemSetting {
  id               BigInt    @id @default(autoincrement())
  uuid             String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId        BigInt?   @map("company_id")
  settingKey       String    @map("setting_key") @db.VarChar(255)
  settingValue     Json      @map("setting_value")
  valueType        String    @map("value_type") @db.VarChar(30)
  settingGroup     String    @map("setting_group") @db.VarChar(100)
  description      String?
  isSecret         Boolean   @default(false) @map("is_secret")
  isSystem         Boolean   @default(false) @map("is_system")
  isReadonly       Boolean   @default(false) @map("is_readonly")
  validationSchema Json?     @map("validation_schema")
  defaultValue     Json?     @map("default_value")
  environment      String    @default("all") @db.VarChar(20)
  effectiveFrom    DateTime? @map("effective_from") @db.Timestamptz
  effectiveTo      DateTime? @map("effective_to") @db.Timestamptz
  lastChangedBy    BigInt?   @map("last_changed_by")
  lastChangedAt    DateTime? @map("last_changed_at") @db.Timestamptz
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  createdBy        BigInt?   @map("created_by")
  updatedBy        BigInt?   @map("updated_by")
  deletedBy        BigInt?   @map("deleted_by")
  active           Boolean   @default(true)
  version          Int       @default(1)
  metadata         Json      @default("{}")

  company          Company?  @relation(fields: [companyId], references: [id])

  @@unique([companyId, settingKey, environment], map: "udx_settings_company_key_env")
  @@index([companyId, settingGroup], map: "idx_settings_group")
  @@map("system_settings")
}
```

---

# Capítulo 37 — Tabela `plugin_installations`

## 37.1 Descrição

Instalações de plugins do Orion Marketplace em cada empresa. Rastreia versão instalada, configurações, status e telemetria de uso. O plugin em si vem do catálogo público (tabela `plugins` em DB separado do marketplace); aqui ficam apenas **instâncias** por tenant.

## 37.2 Estrutura SQL

```sql
CREATE TABLE plugin_installations (
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID         NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT       NOT NULL REFERENCES companies(id),
    plugin_slug     VARCHAR(100) NOT NULL,                   -- referencia marketplace
    plugin_version  VARCHAR(30)  NOT NULL,
    marketplace_id  BIGINT,                                  -- id no marketplace
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    icon_url        TEXT,
    category        VARCHAR(50),
    installed_by    BIGINT       NOT NULL REFERENCES users(id),
    installed_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    status          plugin_status NOT NULL DEFAULT 'installed',
    enabled_at      TIMESTAMPTZ,
    disabled_at     TIMESTAMPTZ,
    disabled_reason TEXT,
    configuration   JSONB        NOT NULL DEFAULT '{}'::jsonb,
    permissions     JSONB        NOT NULL DEFAULT '[]'::jsonb, -- ["users.read","goals.write"]
    webhook_url     TEXT,
    last_synced_at  TIMESTAMPTZ,
    last_sync_status VARCHAR(30),
    last_error      TEXT,
    usage_30d       JSONB,                                   -- { api_calls: 1234, errors: 5 }
    billing_plan    VARCHAR(30),                             -- free, paid, trial
    billing_amount  DECIMAL(18,2),
    auto_update     BOOLEAN      NOT NULL DEFAULT FALSE,
    update_available VARCHAR(30),                            -- versão nova disponível
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         INTEGER      NOT NULL DEFAULT 1,
    metadata        JSONB        NOT NULL DEFAULT '{}'::jsonb,

    CONSTRAINT chk_plugin_status_values CHECK (status IN ('installed','enabled','disabled','error','pending_update')),
    CONSTRAINT chk_plugin_enabled_when_enabled CHECK (status <> 'enabled' OR enabled_at IS NOT NULL)
);

CREATE UNIQUE INDEX udx_plugin_install_company_slug ON plugin_installations (company_id, plugin_slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_plugin_install_company_status       ON plugin_installations (company_id, status);
CREATE INDEX idx_plugin_install_update_available     ON plugin_installations (update_available) WHERE update_available IS NOT NULL;
```

## 37.3 Dados de exemplo

```sql
INSERT INTO plugin_installations (uuid, company_id, plugin_slug, plugin_version, name, category, installed_by, status, enabled_at, configuration, permissions, billing_plan)
VALUES
 ('6b6b1111-aaaa-0000-0000-000000000001', 1, 'orion-slack',       '1.4.2', 'Slack Integration','integrations', 1, 'enabled', '2025-01-10 10:00:00-03','{"channel":"#vendas","notify_on":"goal_achieved"}'::jsonb,'["notifications.read","goals.read"]'::jsonb,'free'),
 ('6b6b1111-aaaa-0000-0000-000000000002', 1, 'orion-powerbi-connector','2.0.1','Power BI Connector','integrations',1,'enabled','2025-01-12 09:00:00-03','{"refresh_interval_min":60}'::jsonb,'["results.read","indicators.read"]'::jsonb,'paid'),
 ('6b6b1111-aaaa-0000-0000-000000000003', 1, 'orion-sap-erp',     '3.1.0', 'SAP ERP Bridge',   'integrations', 1, 'error',   '2025-01-14 14:00:00-03','{"endpoint":"https://sap.erp.com","company_code":"1000"}'::jsonb,'["results.write","users.read"]'::jsonb,'paid'),
 ('6b6b1111-aaaa-0000-0000-000000000004', 2, 'orion-advanced-analytics','1.0.5','Advanced Analytics','analytics',4,'enabled','2024-12-01 08:00:00-03','{}'::jsonb,'["results.read","goals.read","rankings.read"]'::jsonb,'paid'),
 ('6b6b1111-aaaa-0000-0000-000000000005', 2, 'orion-whatsapp-bot','0.9.0', 'WhatsApp Bot',     'communication',4,'pending_update','2024-11-20 10:00:00-03','{"phone":"+5511999999999"}'::jsonb,'["notifications.write"]'::jsonb,'trial');
```

## 37.4 Prisma

```prisma
model PluginInstallation {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  pluginSlug        String    @map("plugin_slug") @db.VarChar(100)
  pluginVersion     String    @map("plugin_version") @db.VarChar(30)
  marketplaceId     BigInt?   @map("marketplace_id")
  name              String    @db.VarChar(255)
  description       String?
  iconUrl           String?   @map("icon_url")
  category          String?   @db.VarChar(50)
  installedBy       BigInt    @map("installed_by")
  installedAt       DateTime  @default(now()) @map("installed_at") @db.Timestamptz
  status            String    @default("installed") @db.VarChar(30)
  enabledAt         DateTime? @map("enabled_at") @db.Timestamptz
  disabledAt        DateTime? @map("disabled_at") @db.Timestamptz
  disabledReason    String?   @map("disabled_reason")
  configuration     Json      @default("{}")
  permissions       Json      @default("[]")
  webhookUrl        String?   @map("webhook_url")
  lastSyncedAt      DateTime? @map("last_synced_at") @db.Timestamptz
  lastSyncStatus    String?   @map("last_sync_status") @db.VarChar(30)
  lastError         String?   @map("last_error")
  usage30d          Json?     @map("usage_30d")
  billingPlan       String?   @map("billing_plan") @db.VarChar(30)
  billingAmount     Decimal?  @map("billing_amount") @db.Decimal(18, 2)
  autoUpdate        Boolean   @default(false) @map("auto_update")
  updateAvailable   String?   @map("update_available") @db.VarChar(30)
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  active            Boolean   @default(true)
  version           Int       @default(1)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])

  @@unique([companyId, pluginSlug], map: "udx_plugin_install_company_slug")
  @@index([companyId, status], map: "idx_plugin_install_company_status")
  @@map("plugin_installations")
}
```

---

# PARTE VI — INFRAESTRUTURA AVANÇADA

# Capítulo 38 — Estratégia de Particionamento

## 38.1 Justificativa

Tabelas que crescem linearmente com volume de uso (especialmente `results` e `audit_logs`) ultrapassam **10 milhões de linhas** em clientes enterprise em poucos meses. Sem particionamento, isso causa:

- `VACUUM`/`ANALYZE` lentos.
- Reindexações longas que travam escrita.
- Queries com plano subótimo mesmo com índices bons.
- Backup/restauração monolítica.

O particionamento **declarativo** do PostgreSQL 15+ resolve todos esses problemas dividindo uma tabela lógica em várias físicas ("partições") transparentes para a aplicação.

## 38.2 Tabelas particionadas

| Tabela | Estratégia | Chave | Frequência de criação | Retenção |
|---|---|---|---|---|
| `results` | RANGE por mês | `result_date` | Mensal (job `cron_create_partitions`) | 36 meses |
| `audit_logs` | RANGE por mês | `occurred_at` | Mensal | 24 meses (depois export p/ S3) |
| `audit_log_details` | RANGE por mês (via `occurred_at`) | `occurred_at` | Mensal | 24 meses |
| `email_queue` | RANGE por semana | `created_at` | Semanal | 90 dias |
| `webhook_deliveries` | RANGE por semana | `created_at` | Semanal | 90 dias |
| `sessions` | RANGE por semana | `issued_at` | Semanal | 30 dias |
| `refresh_tokens` | RANGE por semana | `issued_at` | Semanal | 30 dias |
| `notifications` | RANGE por mês | `created_at` | Mensal | 12 meses |

## 38.3 Exemplo completo: `results`

```sql
-- Tabela pai particionada
CREATE TABLE results (
    id              BIGSERIAL,
    uuid            UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id      BIGINT NOT NULL,
    -- ... demais campos (Capítulo 21)
    result_date     DATE NOT NULL,
    -- ...
    PRIMARY KEY (id, result_date)   -- PK deve incluir a chave de partição
) PARTITION BY RANGE (result_date);

-- Partição mensal
CREATE TABLE results_2025_01 PARTITION OF results
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE results_2025_02 PARTITION OF results
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Default partition captura datas fora de qualquer range (sinal de problema!)
CREATE TABLE results_default PARTITION OF results DEFAULT;
```

## 38.4 Subparticionamento por hash (escala massiva)

Para tenants enterprise (> 100M resultados/mês), particionamos **também** por hash de `company_id` dentro de cada mês:

```sql
CREATE TABLE results_2025_01 PARTITION OF results
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01')
    PARTITION BY HASH (company_id);

CREATE TABLE results_2025_01_h0 PARTITION OF results_2025_01
    FOR VALUES WITH (modulus 4, remainder 0);
CREATE TABLE results_2025_01_h1 PARTITION OF results_2025_01
    FOR VALUES WITH (modulus 4, remainder 1);
CREATE TABLE results_2025_01_h2 PARTITION OF results_2025_01
    FOR VALUES WITH (modulus 4, remainder 2);
CREATE TABLE results_2025_01_h3 PARTITION OF results_2025_01
    FOR VALUES WITH (modulus 4, remainder 3);
```

Isso permite **parallel scans** por partição em queries analíticas.

## 38.5 Job automático de criação de partições

```sql
CREATE OR REPLACE FUNCTION fn_ensure_monthly_partition(
    p_table TEXT, p_date DATE
) RETURNS VOID AS $$
DECLARE
    v_part_name TEXT;
    v_start DATE := date_trunc('month', p_date)::date;
    v_end   DATE := (v_start + interval '1 month')::date;
BEGIN
    v_part_name := format('%s_%s', p_table, to_char(v_start, 'YYYY_MM'));
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        v_part_name, p_table, v_start, v_end
    );
END;
$$ LANGUAGE plpgsql;

-- Chamada mensal via pg_cron:
-- SELECT cron.schedule('create_monthly_partitions', '0 0 25 * *', $$SELECT fn_ensure_monthly_partition('results', (date_trunc('month', now()) + interval '1 month')::date)$$);
```

## 38.6 Detach e arquivamento

```sql
-- 1. Detach a partição antiga (continua acessível)
ALTER TABLE results DETACH PARTITION results_2023_01;

-- 2. Exporta para Parquet no S3
-- (executado por job externo usando COPY para CSV + conversão DuckDB)

-- 3. Renomeia para indicar arquivada
ALTER TABLE results_2023_01 RENAME TO results_2023_01_archived;

-- 4. (Opcional) Drop após confirmar upload
-- DROP TABLE results_2023_01_archived;
```

## 38.7 Constraints e índices em partições

- **Constraints** definidas na tabela pai propagam para partições.
- **Índices** criados na pai são automaticamente criados em cada partição.
- **Índices únicos** devem incluir a chave de partição (por isso `udx_results_uuid` é `(uuid, result_date)`).
- Para otimizar queries que filtram `company_id` e `result_date`, o índice líder deve ser `(company_id, result_date)`.

## 38.8 PostgreSQL vs SQLite

SQLite **não suporta** particionamento nativo. Para o Orion local (desktop/offline), usamos:

- **Sharding por tabela** — `results_2025_01`, `results_2025_02`, ... como tabelas físicas separadas.
- **View UNION ALL** — `CREATE VIEW results AS SELECT * FROM results_2025_01 UNION ALL SELECT * FROM results_2025_02 ...`.
- **Trigger INSTEAD OF** na view para rotear INSERTs para a tabela correta.

Isso é encapsulado na camada Prisma via `previewFeatures = ["multiSchema"]` e middlewares.

---

# Capítulo 39 — Estratégia de Índices para Multi-tenant

## 39.1 Princípio fundamental

**Todo índice secundário em tabela multi-tenant deve começar com `company_id`.**

Motivo: sem `company_id` líder, o PostgreSQL busca em todas as empresas e depois filtra, desperdiçando I/O. Com `company_id` líder, o planner faz **index range scan** direto na partição do tenant, lendo apenas as linhas relevantes.

## 39.2 Catálogo de padrões de índice

### Padrão 1: Lookup por tenant + filtro temporal

```sql
CREATE INDEX idx_results_company_user_date
    ON results (company_id, user_id, result_date DESC)
    WHERE deleted_at IS NULL;
```

Atende: `WHERE company_id = ? AND user_id = ? AND result_date BETWEEN ? AND ?`.

### Padrão 2: Lookup por tenant + status (baixa cardinalidade)

```sql
CREATE INDEX idx_users_status
    ON users (company_id, status)
    WHERE deleted_at IS NULL;
```

Atende: `WHERE company_id = ? AND status = 'active'`.

### Padrão 3: Índice parcial para ativos

```sql
CREATE INDEX idx_users_active_partial
    ON users (company_id, id)
    WHERE deleted_at IS NULL AND active = TRUE;
```

Tamanho ~10% do índice total. **Crítico** para tabelas com alto churn de soft delete.

### Padrão 4: Índice GIN para JSONB

```sql
CREATE INDEX idx_audit_new_value_gin ON audit_logs USING gin (new_value);
CREATE INDEX idx_companies_metadata_gin ON companies USING gin (metadata);
```

Atende: `WHERE new_value @> '{"indicator_id": 1}'`.

### Padrão 5: Índice de expressão

```sql
CREATE INDEX idx_users_email_lower ON users (lower(email), company_id);
```

Atende busca case-insensitive: `WHERE lower(email) = 'ana@x.com'`.

### Padrão 6: Índice composto com INCLUDE (covering index)

```sql
CREATE INDEX idx_results_covering
    ON results (company_id, user_id, result_date DESC)
    INCLUDE (value, status)
    WHERE deleted_at IS NULL;
```

Permite **index-only scan** — a query não toca na heap se todos os campos estão no índice.

## 39.3 Catálogo de índices por tabela (resumo)

| Tabela | Índices principais | Justificativa |
|---|---|---|
| `companies` | `cnpj`, `email`, `trade_name` (ativos) | Lookup admin, busca. |
| `branches` | `(company_id, code)` | Validação de código único por tenant. |
| `users` | `(email, company_id)`, `(username, company_id)`, `(company_id, branch_id)`, `(status)` | Login, listagem por filial, filtros. |
| `sessions` | `(user_id, expires_at)` ativos, `token_hash` único | Auth middleware. |
| `refresh_tokens` | `token_hash` único, `(family_id, issued_at)` | Rotação e detecção de reuso. |
| `api_keys` | `key_hash` único, `(company_id)` ativos | Auth M2M. |
| `roles` | `(company_id, slug)` único | Lookup por slug. |
| `indicators` | `(company_id, slug)` único, `(company_id, category_id)` | Listagem por categoria. |
| `goals` | `(company_id, user_id, start_date, end_date)`, `(indicator_id, start_date)` | Dashboard do usuário. |
| `results` | `(company_id, user_id, result_date DESC)`, `(company_id, indicator_id, result_date DESC)` | Performance e dashboards. |
| `campaigns` | `(company_id, status, start_date)` | Listagem por status. |
| `rankings` | `(company_id, period_type, period_start, position)` | Renderização de ranking. |
| `notifications` | `(user_id, created_at DESC)` unread parcial | Badge de notifs não lidas. |
| `audit_logs` | `(company_id, occurred_at DESC)`, `(table_name, record_id)`, GIN em `new_value` | Filtros de auditoria. |
| `email_queue` | `(status, next_attempt_at, priority)` | Worker dequeue. |
| `webhook_deliveries` | `(status, next_attempt_at)` | Worker dequeue. |

## 39.4 Antipadrões a evitar

1. **Índice sem `company_id` líder em tabela multi-tenant** → explode de leituras.
2. **Índice único global em campo tenant-specific** (ex: `email` sem `company_id`) → impede mesma string em tenants diferentes.
3. **Índice em coluna booleana sem `company_id`** → selectivity ~50%, inútil.
4. **Índice em `metadata->>'campo'` sem Gin** → sequential scan disfarçado.
5. **Mais de 7 índices por tabela OLTP** → writes lentos sem benefício real; revisar com `pg_stat_user_indexes`.

## 39.5 Monitoramento e ajuste

```sql
-- Índices não usados em 30 dias (candidatos a drop)
SELECT schemaname, relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Índices duplicados (redundantes)
SELECT pg_size_pretty(sum(pg_relation_size(idx))::bigint) AS size,
       (array_agg(idx))[1]                AS idx1,
       (array_agg(idx))[2]                AS idx2,
       (array_agg(idx))[3]                AS idx3,
       (array_agg(idx))[4]                AS idx4
FROM (
    SELECT indexrelid::regclass AS idx, indrelid::regclass AS rel,
           string_agg(attname, ',' ORDER BY attnum) AS cols
    FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    GROUP BY i.indexrelid, i.indrelid
) s
GROUP BY rel, cols
HAVING count(*) > 1;
```

## 39.6 REINDEX online

Para reconstrução sem lock:

```sql
REINDEX INDEX CONCURRENTLY idx_results_company_user_date;
```

`CONCURRENTLY` é mais lento mas não bloqueia leituras nem escritas. Recomendado em janela de baixa carga.

---

# Capítulo 40 — Materialized Views para Dashboards

## 40.1 Justificativa

Dashboards do Orion agregam milhões de `results` em poucos segundos. Para entregar isso, mantemos **materialized views** pré-computadas, atualizadas por job (`REFRESH MATERIALIZED VIEW CONCURRENTLY`).

## 40.2 Catálogo de MViews

| MView | Tabela base | Refresh | Uso |
|---|---|---|---|
| `mv_goal_progress_daily` | results + goals | a cada 5 min | Dashboard diário de metas |
| `mv_user_ranking_monthly` | results + indicators | diário 02:00 | Tela de ranking mensal |
| `mv_indicator_summary_monthly` | results | diário 02:30 | BI exports |
| `mv_branch_performance_monthly` | results + branches | diário 02:35 | Comparativo entre filiais |
| `mv_campaign_leaderboard` | results + campaigns | horário | Leaderboard de campanhas |
| `mv_audit_summary_daily` | audit_logs | diário 03:00 | Painel de auditoria |
| `mv_active_users_daily` | sessions | diário 03:05 | Adoption/engajamento |

## 40.3 Exemplo: `mv_goal_progress_daily`

```sql
CREATE MATERIALIZED VIEW mv_goal_progress_daily AS
SELECT
    g.company_id,
    g.id            AS goal_id,
    g.user_id,
    g.branch_id,
    g.indicator_id,
    g.goal_type,
    g.start_date,
    g.end_date,
    g.target_value,
    g.weight,
    COALESCE(SUM(CASE WHEN r.status = 'approved' THEN r.value ELSE 0 END), 0) AS achieved_value,
    CASE WHEN g.target_value > 0
         THEN COALESCE(SUM(CASE WHEN r.status = 'approved' THEN r.value ELSE 0 END), 0) / g.target_value
         ELSE 0 END                                                        AS achieved_pct,
    COUNT(r.id)                                                            AS results_count,
    MAX(r.result_date)                                                     AS last_result_date
FROM goals g
LEFT JOIN results r
    ON r.goal_id = g.id
   AND r.deleted_at IS NULL
   AND r.result_date BETWEEN g.start_date AND g.end_date
WHERE g.deleted_at IS NULL
GROUP BY g.company_id, g.id, g.user_id, g.branch_id, g.indicator_id,
         g.goal_type, g.start_date, g.end_date, g.target_value, g.weight;

CREATE UNIQUE INDEX udx_mv_goal_progress_id ON mv_goal_progress_daily (goal_id);
CREATE INDEX idx_mv_gp_company_user         ON mv_goal_progress_daily (company_id, user_id);
CREATE INDEX idx_mv_gp_company_branch       ON mv_goal_progress_daily (company_id, branch_id);

-- Refresh concorrente (requer unique index)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_goal_progress_daily;
```

## 40.4 Exemplo: `mv_user_ranking_monthly`

```sql
CREATE MATERIALIZED VIEW mv_user_ranking_monthly AS
SELECT
    company_id,
    user_id,
    branch_id,
    DATE_TRUNC('month', result_date)::date AS period_start,
    (DATE_TRUNC('month', result_date) + interval '1 month - 1 day')::date AS period_end,
    indicator_id,
    SUM(value)                              AS total_value,
    AVG(value)                              AS avg_value,
    COUNT(*)                                AS records_count,
    RANK() OVER (
        PARTITION BY company_id, indicator_id, DATE_TRUNC('month', result_date)
        ORDER BY SUM(value) DESC
    ) AS position
FROM results
WHERE deleted_at IS NULL AND status = 'approved'
GROUP BY company_id, user_id, branch_id, DATE_TRUNC('month', result_date), indicator_id;

CREATE UNIQUE INDEX udx_mv_ranking_unique
    ON mv_user_ranking_monthly (company_id, user_id, indicator_id, period_start);
CREATE INDEX idx_mv_ranking_company_period
    ON mv_user_ranking_monthly (company_id, period_start, position);
```

## 40.5 Job de refresh

Usando `pg_cron`:

```sql
SELECT cron.schedule(
    'refresh_mviews_5min',
    '*/5 * * * *',
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_goal_progress_daily$$
);

SELECT cron.schedule(
    'refresh_mviews_daily',
    '0 2 * * *',
    $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_ranking_monthly;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_indicator_summary_monthly;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_branch_performance_monthly;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_audit_summary_daily;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_active_users_daily;
    $$
);

SELECT cron.schedule(
    'refresh_mviews_hourly',
    '0 * * * *',
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_campaign_leaderboard$$
);
```

## 40.6 Prisma: leitura de MViews

MViews são somente leitura. No Prisma, mapeamos como `@@map` em model sem operações de escrita:

```prisma
model GoalProgressDaily {
  goalId           BigInt   @map("goal_id")
  companyId        BigInt   @map("company_id")
  userId           BigInt?  @map("user_id")
  branchId         BigInt?  @map("branch_id")
  indicatorId      BigInt   @map("indicator_id")
  goalType         String   @map("goal_type")
  startDate        DateTime @map("start_date") @db.Date
  endDate          DateTime @map("end_date")    @db.Date
  targetValue      Decimal  @map("target_value") @db.Decimal(18, 4)
  weight           Decimal  @db.Decimal(10, 2)
  achievedValue    Decimal  @map("achieved_value") @db.Decimal(18, 4)
  achievedPct      Decimal  @map("achieved_pct")    @db.Decimal(8, 4)
  resultsCount     Int      @map("results_count")
  lastResultDate   DateTime? @map("last_result_date") @db.Date

  @@map("mv_goal_progress_daily")
  @@index([companyId, userId], map: "idx_mv_gp_company_user")
}
```

## 40.7 Refresh sob demanda

Em vez de refresh cron, algumas MViews são invalidadas por trigger e atualizadas on-demand:

```sql
CREATE TABLE mview_refresh_queue (
    id              BIGSERIAL PRIMARY KEY,
    mview_name      VARCHAR(100) NOT NULL,
    company_id      BIGINT,
    priority        SMALLINT     NOT NULL DEFAULT 5,
    enqueued_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    processed_at    TIMESTAMPTZ,
    status          VARCHAR(20)  NOT NULL DEFAULT 'queued'
);

-- Trigger que enfileira refresh após INSERT em results
CREATE OR REPLACE FUNCTION fn_enqueue_mview_refresh()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO mview_refresh_queue (mview_name, company_id)
    VALUES ('mv_goal_progress_daily', NEW.company_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_results_enqueue_refresh
AFTER INSERT ON results
FOR EACH ROW EXECUTE FUNCTION fn_enqueue_mview_refresh();
```

Worker dedicado consome a fila e dá `REFRESH MATERIALIZED VIEW CONCURRENTLY` apenas para tenants que tiveram novos dados.

---

# Capítulo 41 — Stored Procedures Recomendadas

## 41.1 Catálogo

| Procedure | Propósito |
|---|---|
| `sp_recalculate_goal(p_goal_id BIGINT)` | Recalcula `achieved_value` de uma meta. |
| `sp_recalc_user_ranking(p_company_id, p_period_type, p_period_start)` | Recalcula ranking de um período. |
| `sp_distribute_goal_to_children(p_goal_id, p_strategy)` | Distribui meta mensal em diárias. |
| `sp_close_campaign(p_campaign_id)` | Fecha campanha e atribui prêmios. |
| `sp_purge_soft_deleted(p_days INT)` | Purge físico de soft-deletados antigos. |
| `sp_archive_partition(p_table TEXT, p_date DATE)` | Arquiva partição mensal antiga. |
| `sp_user_can(p_user_id, p_permission_slug)` | Verifica permissão (cache em memória). |
| `sp_get_dashboard_data(p_dashboard_id, p_filters JSONB)` | Agrega dados para um dashboard. |
| `sp_send_notification(p_template_code, p_user_ids, p_vars JSONB)` | Enfileira notificações em massa. |
| `sp_rotate_refresh_token(p_old_token_hash)` | Implementa rotação de refresh token. |
| `sp_cleanup_expired_sessions()` | Marca sessões expiradas como inativas. |
| `sp_tenant_export(p_company_id, p_table_list)` | Exporta dados de um tenant (LGPD/GDPR). |

## 41.2 Exemplos detalhados

### `sp_recalculate_goal`

```sql
CREATE OR REPLACE PROCEDURE sp_recalculate_goal(p_goal_id BIGINT)
LANGUAGE plpgsql AS $$
DECLARE
    v_ind_id   BIGINT;
    v_start    DATE;
    v_end      DATE;
    v_agg      VARCHAR(30);
    v_value    DECIMAL(18,4);
    v_target   DECIMAL(18,4);
BEGIN
    SELECT indicator_id, start_date, end_date, target_value
      INTO v_ind_id, v_start, v_end, v_target
    FROM goals WHERE id = p_goal_id;

    IF v_ind_id IS NULL THEN
        RAISE EXCEPTION 'Goal % not found', p_goal_id;
    END IF;

    SELECT aggregation INTO v_agg FROM indicators WHERE id = v_ind_id;

    EXECUTE format(
        'SELECT %s(value) FROM results
         WHERE goal_id = $1 AND deleted_at IS NULL AND status = ''approved''
           AND result_date BETWEEN $2 AND $3',
        CASE v_agg
            WHEN 'sum'   THEN 'SUM'
            WHEN 'avg'   THEN 'AVG'
            WHEN 'max'   THEN 'MAX'
            WHEN 'min'   THEN 'MIN'
            WHEN 'count' THEN 'COUNT'
            ELSE 'SUM'
        END
    ) INTO v_value USING p_goal_id, v_start, v_end;

    UPDATE goals
    SET achieved_value = COALESCE(v_value, 0),
        achieved_pct   = CASE WHEN v_target > 0 THEN COALESCE(v_value, 0) / v_target ELSE 0 END,
        achieved_at    = CASE WHEN v_target > 0 AND v_value >= v_target THEN now() ELSE NULL END,
        updated_at     = now(),
        version        = version + 1
    WHERE id = p_goal_id;
END;
$$;

-- Chamada
CALL sp_recalculate_goal(1);
```

### `sp_recalc_user_ranking`

```sql
CREATE OR REPLACE PROCEDURE sp_recalc_user_ranking(
    p_company_id BIGINT,
    p_period_type goal_type,
    p_period_start DATE
)
LANGUAGE plpgsql AS $$
DECLARE
    v_period_end DATE;
BEGIN
    v_period_end := CASE p_period_type
        WHEN 'daily'    THEN p_period_start
        WHEN 'weekly'   THEN p_period_start + 6
        WHEN 'monthly'  THEN (DATE_TRUNC('month', p_period_start) + interval '1 month - 1 day')::date
        WHEN 'quarterly' THEN p_period_start + interval '3 months - 1 day'
        WHEN 'yearly'   THEN (DATE_TRUNC('year', p_period_start) + interval '1 year - 1 day')::date
    END;

    -- Insere ranking recalculado (substitui se já existia)
    INSERT INTO rankings (
        uuid, company_id, branch_id, user_id, indicator_id,
        period_type, period_start, period_end, score, normalized_score,
        position, previous_position, trend, is_official, calculated_at
    )
    SELECT
        gen_random_uuid(),
        r.company_id,
        r.branch_id,
        r.user_id,
        r.indicator_id,
        p_period_type,
        p_period_start,
        v_period_end,
        r.score,
        CASE WHEN g.target_value > 0 THEN r.score / g.target_value ELSE NULL END,
        ROW_NUMBER() OVER (
            PARTITION BY r.company_id, r.indicator_id, r.branch_id
            ORDER BY r.score DESC
        ),
        NULL, -- previous_position será preenchido abaixo
        'new',
        TRUE,
        now()
    FROM (
        SELECT
            company_id, branch_id, user_id, indicator_id,
            SUM(value) AS score
        FROM results
        WHERE company_id = p_company_id
          AND deleted_at IS NULL
          AND status = 'approved'
          AND result_date BETWEEN p_period_start AND v_period_end
        GROUP BY company_id, branch_id, user_id, indicator_id
    ) r
    LEFT JOIN goals g
        ON g.user_id = r.user_id
       AND g.indicator_id = r.indicator_id
       AND g.goal_type = p_period_type
       AND g.start_date = p_period_start
       AND g.deleted_at IS NULL
    ON CONFLICT (company_id, branch_id, user_id, campaign_id, indicator_id, period_type, period_start)
    WHERE deleted_at IS NULL
    DO UPDATE SET
        score = EXCLUDED.score,
        normalized_score = EXCLUDED.normalized_score,
        previous_position = rankings.position,
        trend = CASE
            WHEN rankings.position IS NULL THEN 'new'
            WHEN EXCLUDED.position < rankings.position THEN 'up'
            WHEN EXCLUDED.position > rankings.position THEN 'down'
            ELSE 'stable'
        END,
        calculated_at = now(),
        version = rankings.version + 1;
END;
$$;
```

### `sp_purge_soft_deleted`

```sql
CREATE OR REPLACE PROCEDURE sp_purge_soft_deleted(p_days INT DEFAULT 90)
LANGUAGE plpgsql AS $$
DECLARE
    t TEXT;
    c INT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name IN (
              'users','branches','goals','results','campaigns','indicators',
              'dashboards','widgets','notifications','file_uploads'
          )
    LOOP
        EXECUTE format(
            'WITH deleted AS (
                DELETE FROM %I
                WHERE deleted_at IS NOT NULL
                  AND deleted_at < now() - ($1 || '' days'')::interval
                RETURNING 1
            )
            SELECT count(*) FROM deleted', t
        ) INTO c USING p_days;

        RAISE NOTICE 'Purged % rows from %', c, t;
    END LOOP;
END;
$$;
```

### `sp_send_notification`

```sql
CREATE OR REPLACE PROCEDURE sp_send_notification(
    p_template_code   VARCHAR,
    p_user_ids        BIGINT[],
    p_variables       JSONB DEFAULT '{}'::jsonb,
    p_channels        JSONB DEFAULT NULL,
    p_scheduled_for   TIMESTAMPTZ DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_template notification_templates%ROWTYPE;
    v_user     BIGINT;
    v_rendered_subject TEXT;
    v_rendered_body    TEXT;
    v_channels JSONB;
BEGIN
    SELECT * INTO v_template
    FROM notification_templates
    WHERE code = p_template_code AND is_active = TRUE
    ORDER BY company_id NULLS FIRST LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template % not found', p_template_code;
    END IF;

    v_channels := COALESCE(p_channels, v_template.default_channels);

    FOREACH v_user IN ARRAY p_user_ids
    LOOP
        INSERT INTO notifications (
            company_id, user_id, template_id, title, message,
            priority, notification_type, channels, scheduled_for,
            created_by
        )
        SELECT
            u.company_id, u.id, v_template.id,
            v_template.subject_template,
            v_template.body_template_text,
            v_template.default_priority,
            v_template.notification_type,
            v_channels,
            p_scheduled_for,
            current_setting('orion.user_id', true)::bigint
        FROM users u
        WHERE u.id = v_user AND u.deleted_at IS NULL AND u.active = TRUE;
    END LOOP;
END;
$$;
```

---

# Capítulo 42 — Migração de Dados entre Versões

## 42.1 Princípios

1. **Migrations sempre forward-only**: nunca escrever `DROP COLUMN` direto. Renomear com prefixo `_deprecated_` e remover após 2 versões.
2. **Online migrations**: usar `CREATE INDEX CONCURRENTLY`, `ALTER TABLE ... ADD COLUMN ... DEFAULT NULL` (sem rewrite), e pg_repack para reorganizações.
3. **Backfill progressivo**: para colunas novas com default computado, popular em batches de 1000 linhas com `LIMIT` + `OFFSET` em loop.
4. **Dual-write durante migração**: em migrations que mudam schema de dados (ex: JSONB → tabela normalizada), manter escrita dupla por 1 release, depois switch de leitura, depois drop do legado.
5. **Versionamento de schema**: tabela `_orion_migrations` rastreia versões aplicadas.

## 42.2 Tabela de controle de migrations

```sql
CREATE TABLE _orion_migrations (
    id              BIGSERIAL PRIMARY KEY,
    version         VARCHAR(30)  NOT NULL UNIQUE,             -- '2025_01_15_001_add_results_partition_idx'
    description     TEXT,
    applied_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    applied_by      VARCHAR(100) NOT NULL DEFAULT current_user,
    duration_ms     INTEGER,
    checksum        CHAR(64),
    rollback_sql    TEXT,                                     -- SQL para reverter (apenas dev/staging)
    is_idempotent   BOOLEAN      NOT NULL DEFAULT FALSE
);
```

## 42.3 Catálogo de migrations planejadas (V1.0 → V1.5)

| Versão | Descrição | Online? | Duração estimada |
|---|---|---|---|
| `2025_01_15_001` | Cria tabela `results` particionada | Sim | 5 min |
| `2025_01_15_002` | Cria índices em `results` | Sim (`CONCURRENTLY`) | 30 min em 10M linhas |
| `2025_01_16_001` | Adiciona `two_factor_secret` em `users` | Sim | < 1 min |
| `2025_01_20_001` | Backfill `companies.license_expires_at` | Sim (batches) | 10 min |
| `2025_02_01_001` | Cria MView `mv_goal_progress_daily` | Sim | 2 min |
| `2025_02_01_002` | Habilita RLS em todas as tabelas | Sim (uma por uma) | 5 min |
| `2025_02_15_001` | Renomeia `users.is_active` → `active` | Sim (view temporária) | 15 min |
| `2025_03_01_001` | Remove `users.is_active` (deprecated) | Sim | 2 min |

## 42.4 Exemplo: migration online adicionando coluna com backfill

```sql
-- Step 1: Add column nullable (instantâneo, sem rewrite)
ALTER TABLE results ADD COLUMN cumulative_value DECIMAL(18,4);

-- Step 2: Backfill em batches
DO $$
DECLARE
    v_batch_size INT := 1000;
    v_affected   INT := 1;
    v_total      INT := 0;
BEGIN
    WHILE v_affected > 0 LOOP
        UPDATE results
        SET cumulative_value = (
            SELECT COALESCE(SUM(r2.value), 0)
            FROM results r2
            WHERE r2.user_id = results.user_id
              AND r2.indicator_id = results.indicator_id
              AND r2.result_date <= results.result_date
              AND r2.deleted_at IS NULL
              AND r2.status = 'approved'
        )
        WHERE cumulative_value IS NULL
          AND id IN (
              SELECT id FROM results WHERE cumulative_value IS NULL LIMIT v_batch_size FOR UPDATE SKIP LOCKED
          );
        GET DIAGNOSTICS v_affected = ROW_COUNT;
        v_total := v_total + v_affected;
        RAISE NOTICE 'Backfilled % rows (total %)', v_affected, v_total;
        PERFORM pg_sleep(0.1);  -- evita saturar CPU
    END LOOP;
END;
$$;

-- Step 3: Add NOT NULL constraint (valida antes de aplicar)
ALTER TABLE results VALIDATE CONSTRAINT results_cumulative_value_check;
ALTER TABLE results ALTER COLUMN cumulative_value SET NOT NULL;

-- Step 4: Add index concurrently
CREATE INDEX CONCURRENTLY idx_results_cumulative
    ON results (user_id, indicator_id, cumulative_value);
```

## 42.5 Estratégia de rollback

Para cada migration, definimos `rollback_sql` apenas em ambientes dev/staging. Em produção, **rollback é forward**: criamos uma nova migration que reverte a lógica.

```sql
-- migration: 2025_03_01_001_drop_users_is_active
-- rollback_sql (somente dev):
-- ALTER TABLE users ADD COLUMN is_active BOOLEAN;
-- UPDATE users SET is_active = active;
```

## 42.6 Prisma Migrate + SQL customizado

O Orion usa **Prisma Migrate** para a maior parte das mudanças, mas injeta SQL customizado para operações online:

```bash
# Gera migration
prisma migrate dev --name add_results_partition --create-only

# Edita o arquivo SQL gerado com CONCURRENTLY, batches etc.
# Aplica
prisma migrate deploy
```

Em `schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres", "multiSchema", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, uuid_ossp, pg_trgm]
}
```

## 42.7 Migração cross-engine (PostgreSQL ↔ SQLite)

Para o Orion **local** (SQLite no desktop do usuário) e **cloud** (PostgreSQL), usamos:

1. **Prisma schema único** com condicionais de tipo (`@db.Timestamptz` vira `DATETIME` em SQLite).
2. **Adapter pattern** na aplicação: interfaces de repositório com 2 implementações.
3. **Sincronização** via tabela `sync_queue` — operações offline enfileiradas em SQLite local, replicadas para PostgreSQL quando online (com resolução de conflitos baseada em `version` + timestamp).

```sql
CREATE TABLE sync_queue (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL,
    table_name      VARCHAR(100) NOT NULL,
    record_uuid     UUID NOT NULL,
    operation       VARCHAR(10) NOT NULL,   -- INSERT, UPDATE, DELETE
    payload         JSONB NOT NULL,
    enqueued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    synced_at       TIMESTAMPTZ,
    conflict_status VARCHAR(20),            -- resolved, pending, manual
    conflict_payload JSONB
);
```

## 42.8 Checklist pré-deploy de migration

- [ ] Rodou em staging com snapshot de produção.
- [ ] Mediu tempo de execução (deve ser < 5 min para janela de manutenção zero).
- [ ] `EXPLAIN ANALYZE` nas queries críticas pós-migration.
- [ ] Backup lógico e snapshot do RDS feitos.
- [ ] Plano de rollback testado.
- [ ] Communication: comunicado enviado a todos os tenants afetados.
- [ ] Monitoramento: alertas de query lenta prontos para ligar.

---

# PARTE VII — SCHEMA PRISMA COMPLETO

# Capítulo 43 — `schema.prisma` Consolidado do Orion

## 43.1 Visão geral

Abaixo, o `schema.prisma` completo do Orion V1.0, consolidando todos os 37 models detalhados nos capítulos anteriores. Este arquivo é diretamente usável pelo Prisma CLI (`prisma generate`, `prisma migrate`). Comentarios inline indicam decisões de design.

```prisma
// ===========================================================================
// ORION — schema.prisma (Logical Database Model V1.0)
// ===========================================================================
// Stack alvo: PostgreSQL 15+ (cloud), SQLite 3.40+ (local/desktop)
// ORM: Prisma 5+ com preview features: multiSchema, postgresqlExtensions
// ===========================================================================

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres", "multiSchema", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  schemas    = ["public"]
  extensions = [pgcrypto, uuid_ossp, pg_trgm, btree_gin]
}

// ---------------------------------------------------------------------------
// ENUMS (mapeados para TEXT + CHECK em SQLite)
// ---------------------------------------------------------------------------
enum UserStatus {
  pending
  active
  suspended
  invited
  inactive
}

enum BranchStatus {
  active
  inactive
  maintenance
  closed
}

enum GoalType {
  daily
  weekly
  monthly
  quarterly
  yearly
  custom
}

enum ResultStatus {
  draft
  pending
  approved
  rejected
  revised
}

enum CampaignStatus {
  draft
  scheduled
  active
  paused
  finished
  canceled
}

enum AwardType {
  points
  money
  product
  badge
  experience
  custom
}

enum NotificationPriority {
  low
  normal
  high
  urgent
}

enum AuditAction {
  create
  update
  delete
  restore
  login
  logout
  export
  import
  config
}

enum LicensePlan {
  free
  starter
  pro
  enterprise
  custom
}

enum LicenseStatus {
  trial
  active
  suspended
  expired
  canceled
}

enum BackupType {
  full
  incremental
  differential
  snapshot
}

enum BackupStatus {
  queued
  running
  completed
  failed
  expired
}

enum EmailStatus {
  queued
  sending
  sent
  failed
  bounced
  suppressed
}

enum WebhookStatus {
  queued
  delivering
  delivered
  failed
  retry
}

enum FilePurpose {
  avatar
  attachment
  import
  export
  logo
  document
  temp
}

enum PluginStatus {
  installed
  enabled
  disabled
  error
  pending_update
}

enum ApiKeyScope {
  read
  write
  admin
  full
}

// ---------------------------------------------------------------------------
// CORE — Identidade, Tenancy, RBAC
// ---------------------------------------------------------------------------

model Company {
  id                  BigInt    @id @default(autoincrement())
  uuid                String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  legalName           String    @map("legal_name") @db.VarChar(255)
  tradeName           String    @map("trade_name") @db.VarChar(255)
  cnpj                String?   @db.VarChar(18)
  stateRegistration   String?   @map("state_registration") @db.VarChar(50)
  taxIdCountry        String?   @map("tax_id_country") @db.VarChar(50)
  phone               String?   @db.VarChar(30)
  mobile              String?   @db.VarChar(30)
  email               String?   @db.VarChar(255)
  website             String?   @db.VarChar(255)
  zipCode             String?   @map("zip_code") @db.VarChar(20)
  address             String?   @db.VarChar(255)
  addressNumber       String?   @map("address_number") @db.VarChar(20)
  complement          String?   @db.VarChar(100)
  district            String?   @db.VarChar(100)
  city                String?   @db.VarChar(100)
  state               String?   @db.VarChar(100)
  country             String    @default("BR") @db.VarChar(100)
  latitude            Decimal?  @db.Decimal(10, 8)
  longitude           Decimal?  @db.Decimal(11, 8)
  logoUrl             String?   @map("logo_url")
  theme               String    @default("orion-light") @db.VarChar(50)
  language            String    @default("pt") @db.Char(2)
  currency            String    @default("BRL") @db.Char(3)
  timezone            String    @default("America/Sao_Paulo") @db.VarChar(50)
  fiscalCalendar      String    @default("january") @map("fiscal_calendar") @db.VarChar(20)
  licenseId           BigInt?   @unique @map("license_id")
  licenseExpiresAt    DateTime? @map("license_expires_at") @db.Timestamptz
  onboardingCompleted Boolean   @default(false) @map("onboarding_completed")
  onboardingStep      String?   @map("onboarding_step") @db.VarChar(50)
  plan                LicensePlan @default(free)
  trialEndsAt         DateTime? @map("trial_ends_at") @db.Timestamptz
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt           DateTime? @map("deleted_at") @db.Timestamptz
  createdBy           BigInt?   @map("created_by")
  updatedBy           BigInt?   @map("updated_by")
  deletedBy           BigInt?   @map("deleted_by")
  active              Boolean   @default(true)
  version             Int       @default(1)
  externalId          String?   @map("external_id") @db.VarChar(100)
  metadata            Json      @default("{}")

  license             License?
  branches            Branch[]
  users               User[]
  indicators          Indicator[]
  indicatorCategories IndicatorCategory[]
  goals               Goal[]
  results             Result[]
  campaigns           Campaign[]
  rankings            Ranking[]
  dashboards          Dashboard[]
  widgets             Widget[]
  notifications       Notification[]
  auditLogs           AuditLog[]
  backups             Backup[]
  systemSettings      SystemSetting[]
  fileUploads         FileUpload[]
  pluginInstallations PluginInstallation[]
  apiKeys             ApiKey[]
  sessions            Session[]
  refreshTokens       RefreshToken[]
  emailQueue          EmailQueue[]
  webhookDeliveries   WebhookDelivery[]
  campaignParticipants CampaignParticipant[]
  awards              Award[]

  @@unique([cnpj], map: "udx_companies_cnpj")
  @@unique([email], map: "udx_companies_email")
  @@unique([externalId], map: "udx_companies_external")
  @@index([tradeName], map: "idx_companies_trade_name")
  @@index([plan, licenseExpiresAt], map: "idx_companies_plan")
  @@map("companies")
}

model Branch {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId       BigInt    @map("company_id")
  code            String    @db.VarChar(50)
  name            String    @db.VarChar(255)
  phone           String?   @db.VarChar(30)
  mobile          String?   @db.VarChar(30)
  managerId       BigInt?   @map("manager_id")
  zipCode         String?   @map("zip_code") @db.VarChar(20)
  address         String?   @db.VarChar(255)
  addressNumber   String?   @map("address_number") @db.VarChar(20)
  complement      String?   @db.VarChar(100)
  district        String?   @db.VarChar(100)
  city            String?   @db.VarChar(100)
  state           String?   @db.VarChar(100)
  country         String    @default("BR") @db.VarChar(100)
  latitude        Decimal?  @db.Decimal(10, 8)
  longitude       Decimal?  @db.Decimal(11, 8)
  operatingHours  Json?     @map("operating_hours")
  status          BranchStatus @default(active)
  isHeadquarters  Boolean   @default(false) @map("is_headquarters")
  openedAt        DateTime? @map("opened_at") @db.Date
  closedAt        DateTime? @map("closed_at") @db.Date
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz
  createdBy       BigInt?   @map("created_by")
  updatedBy       BigInt?   @map("updated_by")
  deletedBy       BigInt?   @map("deleted_by")
  active          Boolean   @default(true)
  version         Int       @default(1)
  externalId      String?   @map("external_id") @db.VarChar(100)
  metadata        Json      @default("{}")

  company         Company   @relation(fields: [companyId], references: [id])
  manager         User?     @relation("BranchManager", fields: [managerId], references: [id])
  users           User[]    @relation("BranchUsers")
  goals           Goal[]
  results         Result[]
  rankings        Ranking[]
  campaigns       Campaign[]

  @@unique([companyId, code], map: "udx_branches_company_code")
  @@index([companyId], map: "idx_branches_company")
  @@index([managerId], map: "idx_branches_manager")
  @@map("branches")
}

model User {
  id                  BigInt    @id @default(autoincrement())
  uuid                String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId           BigInt    @map("company_id")
  branchId            BigInt?   @map("branch_id")
  roleId              BigInt?   @map("role_id")
  employeeCode        String?   @map("employee_code") @db.VarChar(50)
  fullName            String    @map("full_name") @db.VarChar(255)
  displayName         String?   @map("display_name") @db.VarChar(100)
  cpf                 String?   @db.VarChar(14)
  rg                  String?   @db.VarChar(20)
  email               String    @db.VarChar(255)
  phone               String?   @db.VarChar(30)
  mobile              String?   @db.VarChar(30)
  avatarUrl           String?   @map("avatar_url")
  username            String?   @db.VarChar(100)
  passwordHash        String?   @map("password_hash")
  passwordAlgo        String    @default("argon2id") @map("password_algo") @db.VarChar(30)
  passwordChangedAt   DateTime? @map("password_changed_at") @db.Timestamptz
  failedLoginCount    Int       @default(0) @map("failed_login_count")
  lockedUntil         DateTime? @map("locked_until") @db.Timestamptz
  twoFactorEnabled    Boolean   @default(false) @map("two_factor_enabled")
  twoFactorSecret     String?   @map("two_factor_secret")
  twoFactorBackup     Json?     @map("two_factor_backup")
  admissionDate       DateTime? @map("admission_date") @db.Date
  terminationDate     DateTime? @map("termination_date") @db.Date
  lastLogin           DateTime? @map("last_login") @db.Timestamptz
  lastLoginIp         String?   @map("last_login_ip") @db.VarChar(100)
  lastLoginUa         String?   @map("last_login_ua")
  status              UserStatus @default(pending)
  locale              String    @default("pt-BR") @db.VarChar(10)
  timezone            String?   @db.VarChar(50)
  receiveEmails       Boolean   @default(true) @map("receive_emails")
  receivePush         Boolean   @default(true) @map("receive_push")
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt           DateTime? @map("deleted_at") @db.Timestamptz
  createdBy           BigInt?   @map("created_by")
  updatedBy           BigInt?   @map("updated_by")
  deletedBy           BigInt?   @map("deleted_by")
  active              Boolean   @default(true)
  version             Int       @default(1)
  externalId          String?   @map("external_id") @db.VarChar(100)
  metadata            Json      @default("{}")

  company             Company   @relation(fields: [companyId], references: [id])
  branch              Branch?   @relation("BranchUsers", fields: [branchId], references: [id])
  managedBranches     Branch[]  @relation("BranchManager")
  role                Role?     @relation(fields: [roleId], references: [id])
  goals               Goal[]
  results             Result[]
  rankings            Ranking[]
  dashboards          Dashboard[]
  notifications       Notification[]
  sessions            Session[]
  refreshTokens       RefreshToken[]
  auditLogs           AuditLog[]
  apiKeys             ApiKey[]
  fileUploads         FileUpload[]
  campaignParticipants CampaignParticipant[]

  @@unique([email, companyId], map: "udx_users_email_company")
  @@unique([username, companyId], map: "udx_users_username_company")
  @@unique([cpf, companyId], map: "udx_users_cpf_company")
  @@unique([companyId, employeeCode], map: "udx_users_employee_code")
  @@index([companyId, branchId], map: "idx_users_company_branch")
  @@index([roleId], map: "idx_users_role")
  @@index([status], map: "idx_users_status")
  @@index([lastLogin], map: "idx_users_last_login")
  @@map("users")
}

model Session {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  userId            BigInt    @map("user_id")
  sessionTokenHash  String    @map("session_token_hash")
  refreshTokenId    BigInt?   @map("refresh_token_id")
  ipAddress         String?   @map("ip_address") @db.VarChar(100)
  userAgent         String?   @map("user_agent")
  deviceType        String?   @map("device_type") @db.VarChar(30)
  deviceId          String?   @map("device_id") @db.VarChar(100)
  location          Json?
  issuedAt          DateTime  @default(now()) @map("issued_at") @db.Timestamptz
  expiresAt         DateTime  @map("expires_at") @db.Timestamptz
  lastActivityAt    DateTime  @default(now()) @map("last_activity_at") @db.Timestamptz
  revokedAt         DateTime? @map("revoked_at") @db.Timestamptz
  revokedReason     String?   @map("revoked_reason") @db.VarChar(50)
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active            Boolean   @default(true)
  version           Int       @default(1)

  company           Company   @relation(fields: [companyId], references: [id])
  user              User      @relation(fields: [userId], references: [id])
  refreshToken      RefreshToken? @relation(fields: [refreshTokenId], references: [id])

  @@index([userId, expiresAt], map: "idx_sessions_user_active")
  @@index([companyId, expiresAt], map: "idx_sessions_company_active")
  @@index([expiresAt], map: "idx_sessions_expires")
  @@map("sessions")
}

model RefreshToken {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId       BigInt    @map("company_id")
  userId          BigInt    @map("user_id")
  sessionId       BigInt?   @map("session_id")
  tokenHash       String    @map("token_hash")
  familyId        String    @map("family_id") @db.Uuid
  predecessorId   BigInt?   @map("predecessor_id")
  issuedAt        DateTime  @default(now()) @map("issued_at") @db.Timestamptz
  expiresAt       DateTime  @map("expires_at") @db.Timestamptz
  usedAt          DateTime? @map("used_at") @db.Timestamptz
  revokedAt       DateTime? @map("revoked_at") @db.Timestamptz
  revokedReason   String?   @map("revoked_reason") @db.VarChar(50)
  ipAddress       String?   @map("ip_address") @db.VarChar(100)
  userAgent       String?   @map("user_agent")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active          Boolean   @default(true)
  version         Int       @default(1)

  company         Company   @relation(fields: [companyId], references: [id])
  user            User      @relation(fields: [userId], references: [id])
  session         Session?  @relation(fields: [sessionId], references: [id])
  predecessor     RefreshToken? @relation("RefreshTokenChain", fields: [predecessorId], references: [id])
  successors      RefreshToken[] @relation("RefreshTokenChain")

  @@index([userId, expiresAt], map: "idx_refresh_tokens_user_active")
  @@index([familyId, issuedAt], map: "idx_refresh_tokens_family")
  @@index([expiresAt], map: "idx_refresh_tokens_expires")
  @@map("refresh_tokens")
}

model ApiKey {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  userId            BigInt?   @map("user_id")
  name              String    @db.VarChar(100)
  keyPrefix         String    @map("key_prefix") @db.VarChar(20)
  keyHash           String    @map("key_hash")
  scope             ApiKeyScope @default(read)
  allowedIps        Json?     @map("allowed_ips")
  allowedOrigins    Json?     @map("allowed_origins")
  rateLimitPerMin   Int       @default(600) @map("rate_limit_per_min")
  rateLimitPerDay   Int       @default(50000) @map("rate_limit_per_day")
  lastUsedAt        DateTime? @map("last_used_at") @db.Timestamptz
  lastUsedIp        String?   @map("last_used_ip") @db.VarChar(100)
  lastUsedEndpoint  String?   @map("last_used_endpoint") @db.VarChar(255)
  totalRequests     BigInt    @default(0) @map("total_requests")
  issuedAt          DateTime  @default(now()) @map("issued_at") @db.Timestamptz
  expiresAt         DateTime? @map("expires_at") @db.Timestamptz
  revokedAt         DateTime? @map("revoked_at") @db.Timestamptz
  revokedReason     String?   @map("revoked_reason") @db.VarChar(100)
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])
  user              User?     @relation(fields: [userId], references: [id])

  @@index([companyId], map: "idx_api_keys_company_active")
  @@index([keyPrefix], map: "idx_api_keys_prefix")
  @@map("api_keys")
}

model FileUpload {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  userId            BigInt?   @map("user_id")
  purpose           FilePurpose
  originalName      String    @map("original_name") @db.VarChar(500)
  mimeType          String    @map("mime_type") @db.VarChar(100)
  sizeBytes         BigInt    @map("size_bytes")
  storageProvider   String    @default("s3") @map("storage_provider") @db.VarChar(30)
  storageBucket     String    @map("storage_bucket") @db.VarChar(100)
  storageKey        String    @map("storage_key")
  storageRegion     String?   @map("storage_region") @db.VarChar(30)
  checksumSha256    String?   @map("checksum_sha256") @db.Char(64)
  width             Int?
  height            Int?
  durationSecs      Int?      @map("duration_secs")
  pages             Int?
  isImage           Boolean   @default(false) @map("is_image")
  isVirusScanned    Boolean   @default(false) @map("is_virus_scanned")
  isVirusClean      Boolean?  @map("is_virus_clean")
  virusScanAt       DateTime? @map("virus_scan_at") @db.Timestamptz
  virusScanEngine   String?   @map("virus_scan_engine") @db.VarChar(50)
  attachedToTable   String?   @map("attached_to_table") @db.VarChar(100)
  attachedToId      BigInt?   @map("attached_to_id")
  attachedToUuid    String?   @map("attached_to_uuid") @db.Uuid
  urlExpiresAt      DateTime? @map("url_expires_at") @db.Timestamptz
  permanent         Boolean   @default(false)
  expiresAt         DateTime? @map("expires_at") @db.Timestamptz
  purgedAt          DateTime? @map("purged_at") @db.Timestamptz
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])
  user              User?     @relation(fields: [userId], references: [id])

  @@index([companyId, purpose], map: "idx_files_company_purpose")
  @@index([attachedToTable, attachedToId], map: "idx_files_attached")
  @@index([expiresAt], map: "idx_files_expires")
  @@map("file_uploads")
}

model Role {
  id               BigInt    @id @default(autoincrement())
  uuid             String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId        BigInt    @map("company_id")
  name             String    @db.VarChar(100)
  slug             String    @db.VarChar(100)
  description      String?
  isSystem         Boolean   @default(false) @map("is_system")
  isDefault        Boolean   @default(false) @map("is_default")
  level            Int       @default(0)
  color            String?   @db.VarChar(7)
  icon             String?   @db.VarChar(50)
  permissionsCount Int       @default(0) @map("permissions_count")
  usersCount       Int       @default(0) @map("users_count")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  createdBy        BigInt?   @map("created_by")
  updatedBy        BigInt?   @map("updated_by")
  deletedBy        BigInt?   @map("deleted_by")
  active           Boolean   @default(true)
  version          Int       @default(1)
  externalId       String?   @map("external_id") @db.VarChar(100)
  metadata         Json      @default("{}")

  company          Company   @relation(fields: [companyId], references: [id])
  users            User[]
  permissions      RolePermission[]

  @@unique([companyId, slug], map: "udx_roles_company_slug")
  @@index([companyId], map: "idx_roles_company")
  @@map("roles")
}

model Permission {
  id            BigInt    @id @default(autoincrement())
  uuid          String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  module        String    @db.VarChar(100)
  action        String    @db.VarChar(100)
  slug          String    @unique @db.VarChar(200)
  description   String?
  category      String?   @db.VarChar(50)
  isSystem      Boolean   @default(true) @map("is_system")
  isDangerous   Boolean   @default(false) @map("is_dangerous")
  requires2fa   Boolean   @default(false) @map("requires_2fa")
  uiLabelKey    String?   @map("ui_label_key") @db.VarChar(200)
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active        Boolean   @default(true)
  version       Int       @default(1)

  roles         RolePermission[]

  @@unique([module, action], map: "udx_permissions_module_action")
  @@index([module], map: "idx_permissions_module")
  @@map("permissions")
}

model RolePermission {
  id           BigInt   @id @default(autoincrement())
  roleId       BigInt   @map("role_id")
  permissionId BigInt   @map("permission_id")
  scope        String   @default("company") @db.VarChar(30)
  conditions   Json?
  grantedAt    DateTime @default(now()) @map("granted_at") @db.Timestamptz
  grantedBy    BigInt?  @map("granted_by")
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime @updatedAt @map("updated_at") @db.Timestamptz
  active       Boolean  @default(true)
  version      Int      @default(1)

  role         Role         @relation(fields: [roleId], references: [id])
  permission   Permission   @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId, scope], map: "udx_role_permissions")
  @@index([permissionId], map: "idx_rp_perm")
  @@map("role_permissions")
}

// ---------------------------------------------------------------------------
// PERFORMANCE — Indicadores, Metas, Resultados, Campanhas, Rankings
// ---------------------------------------------------------------------------

model IndicatorCategory {
  id               BigInt    @id @default(autoincrement())
  uuid             String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId        BigInt    @map("company_id")
  name             String    @db.VarChar(100)
  slug             String    @db.VarChar(100)
  description      String?
  color            String?   @db.VarChar(7)
  icon             String?   @db.VarChar(50)
  sortOrder        Int       @default(0) @map("sort_order")
  isSystem         Boolean   @default(false) @map("is_system")
  parentId         BigInt?   @map("parent_id")
  indicatorsCount  Int       @default(0) @map("indicators_count")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  createdBy        BigInt?   @map("created_by")
  updatedBy        BigInt?   @map("updated_by")
  deletedBy        BigInt?   @map("deleted_by")
  active           Boolean   @default(true)
  version          Int       @default(1)
  externalId       String?   @map("external_id") @db.VarChar(100)
  metadata         Json      @default("{}")

  company          Company   @relation(fields: [companyId], references: [id])
  parent           IndicatorCategory?  @relation("IndicatorCategoryTree", fields: [parentId], references: [id])
  children         IndicatorCategory[] @relation("IndicatorCategoryTree")
  indicators       Indicator[]

  @@unique([companyId, slug], map: "udx_indcat_company_slug")
  @@index([companyId, parentId], map: "idx_indcat_company_parent")
  @@map("indicator_categories")
}

model Indicator {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  categoryId        BigInt?   @map("category_id")
  code              String?   @db.VarChar(50)
  name              String    @db.VarChar(255)
  slug              String    @db.VarChar(255)
  description       String?
  indicatorType     String    @map("indicator_type") @db.VarChar(30)
  unit              String?   @db.VarChar(30)
  decimalPlaces     Int       @default(2) @map("decimal_places")
  icon              String?   @db.VarChar(100)
  color             String?   @db.VarChar(7)
  formula           String?
  formulaDeps       Json?     @map("formula_deps")
  weight            Decimal   @default(1.0) @db.Decimal(10, 2)
  targetValue       Decimal?  @map("target_value") @db.Decimal(18, 4)
  minValue          Decimal?  @map("min_value") @db.Decimal(18, 4)
  maxValue          Decimal?  @map("max_value") @db.Decimal(18, 4)
  aggregation       String    @default("sum") @db.VarChar(30)
  frequency         String    @default("daily") @db.VarChar(20)
  isRequired        Boolean   @default(false) @map("is_required")
  isCumulative      Boolean   @default(false) @map("is_cumulative")
  allowManualInput  Boolean   @default(true) @map("allow_manual_input")
  allowAttachments  Boolean   @default(true) @map("allow_attachments")
  allowNotes        Boolean   @default(true) @map("allow_notes")
  requiresApproval  Boolean   @default(false) @map("requires_approval")
  showDashboard     Boolean   @default(true) @map("show_dashboard")
  showRanking       Boolean   @default(true) @map("show_ranking")
  showReports       Boolean   @default(true) @map("show_reports")
  sortOrder         Int       @default(0) @map("sort_order")
  isTemplate        Boolean   @default(false) @map("is_template")
  templateId        BigInt?   @map("template_id")
  isActive          Boolean   @default(true) @map("is_active")
  effectiveFrom     DateTime? @map("effective_from") @db.Date
  effectiveTo       DateTime? @map("effective_to") @db.Date
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  deletedBy         BigInt?   @map("deleted_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  externalId        String?   @map("external_id") @db.VarChar(100)
  metadata          Json      @default("{}")

  company           Company            @relation(fields: [companyId], references: [id])
  category          IndicatorCategory? @relation(fields: [categoryId], references: [id])
  goals             Goal[]
  results           Result[]

  @@unique([companyId, slug], map: "udx_indicators_company_slug")
  @@unique([companyId, code], map: "udx_indicators_company_code")
  @@index([companyId, categoryId], map: "idx_indicators_company_cat")
  @@index([companyId, sortOrder], map: "idx_indicators_dashboard")
  @@map("indicators")
}

model Goal {
  id                   BigInt    @id @default(autoincrement())
  uuid                 String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId            BigInt    @map("company_id")
  branchId             BigInt?   @map("branch_id")
  userId               BigInt?   @map("user_id")
  indicatorId          BigInt    @map("indicator_id")
  goalType             GoalType  @map("goal_type")
  startDate            DateTime  @map("start_date") @db.Date
  endDate              DateTime  @map("end_date") @db.Date
  targetValue          Decimal   @map("target_value") @db.Decimal(18, 4)
  minValue             Decimal?  @map("min_value") @db.Decimal(18, 4)
  stretchValue         Decimal?  @map("stretch_value") @db.Decimal(18, 4)
  weight               Decimal   @default(1.0) @db.Decimal(10, 2)
  achievedValue        Decimal?  @map("achieved_value") @db.Decimal(18, 4)
  achievedPct          Decimal?  @map("achieved_pct") @db.Decimal(8, 4)
  achievedAt           DateTime? @map("achieved_at") @db.Timestamptz
  parentGoalId         BigInt?   @map("parent_goal_id")
  notes                String?
  isAutoDistributed    Boolean   @default(false) @map("is_auto_distributed")
  distributionStrategy String?   @map("distribution_strategy") @db.VarChar(30)
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt            DateTime? @map("deleted_at") @db.Timestamptz
  createdBy            BigInt?   @map("created_by")
  updatedBy            BigInt?   @map("updated_by")
  deletedBy            BigInt?   @map("deleted_by")
  active               Boolean   @default(true)
  version              Int       @default(1)
  externalId           String?   @map("external_id") @db.VarChar(100)
  metadata             Json      @default("{}")

  company              Company    @relation(fields: [companyId], references: [id])
  branch               Branch?    @relation(fields: [branchId], references: [id])
  user                 User?      @relation(fields: [userId], references: [id])
  indicator            Indicator  @relation(fields: [indicatorId], references: [id])
  parentGoal           Goal?      @relation("GoalTree", fields: [parentGoalId], references: [id])
  childGoals           Goal[]     @relation("GoalTree")
  results              Result[]

  @@index([companyId, userId, startDate], map: "idx_goals_company_user_date")
  @@index([companyId, branchId, startDate], map: "idx_goals_company_branch_date")
  @@index([indicatorId, startDate], map: "idx_goals_indicator")
  @@index([parentGoalId], map: "idx_goals_parent")
  @@map("goals")
}

model Result {
  id               BigInt    @default(autoincrement())
  uuid             String    @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId        BigInt    @map("company_id")
  branchId         BigInt?   @map("branch_id")
  userId           BigInt    @map("user_id")
  indicatorId      BigInt    @map("indicator_id")
  goalId           BigInt?   @map("goal_id")
  resultDate       DateTime  @map("result_date") @db.Date
  resultTime       String    @default("00:00:00") @map("result_time") @db.Time
  value            Decimal   @db.Decimal(18, 4)
  previousValue    Decimal?  @map("previous_value") @db.Decimal(18, 4)
  cumulativeValue  Decimal?  @map("cumulative_value") @db.Decimal(18, 4)
  notes            String?
  attachments      Json      @default("[]")
  source           String    @default("manual") @db.VarChar(30)
  sourceRef        String?   @map("source_ref") @db.VarChar(100)
  status           ResultStatus @default(draft)
  approvedBy       BigInt?   @map("approved_by")
  approvedAt       DateTime? @map("approved_at") @db.Timestamptz
  rejectedReason   String?   @map("rejected_reason")
  revisionOf       BigInt?   @map("revision_of")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  createdBy        BigInt?   @map("created_by")
  updatedBy        BigInt?   @map("updated_by")
  deletedBy        BigInt?   @map("deleted_by")
  active           Boolean   @default(true)
  version          Int       @default(1)
  metadata         Json      @default("{}")

  company          Company    @relation(fields: [companyId], references: [id])
  branch           Branch?    @relation(fields: [branchId], references: [id])
  user             User       @relation(fields: [userId], references: [id])
  indicator        Indicator  @relation(fields: [indicatorId], references: [id])
  goal             Goal?      @relation(fields: [goalId], references: [id])

  @@unique([uuid, resultDate], map: "udx_results_uuid")
  @@index([companyId, userId, resultDate], map: "idx_results_company_user_date")
  @@index([companyId, indicatorId, resultDate], map: "idx_results_company_ind_date")
  @@index([goalId], map: "idx_results_goal")
  @@map("results")
}

model Campaign {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  branchId          BigInt?   @map("branch_id")
  name              String    @db.VarChar(255)
  slug              String    @db.VarChar(255)
  description       String?
  objective         String?
  rules             Json      @default("{}")
  scoringFormula    String?   @map("scoring_formula")
  indicators        Json      @default("[]")
  startDate         DateTime  @map("start_date") @db.Date
  endDate           DateTime  @map("end_date") @db.Date
  imageUrl          String?   @map("image_url")
  bannerUrl         String?   @map("banner_url")
  color             String?   @db.VarChar(7)
  status            CampaignStatus @default(draft)
  visibility        String    @default("private") @db.VarChar(20)
  maxParticipants   Int?      @map("max_participants")
  participantsCount Int       @default(0) @map("participants_count")
  isFeatured        Boolean   @default(false) @map("is_featured")
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  deletedBy         BigInt?   @map("deleted_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  externalId        String?   @map("external_id") @db.VarChar(100)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])
  branch            Branch?   @relation(fields: [branchId], references: [id])
  participants      CampaignParticipant[]
  awards            Award[]
  rankings          Ranking[]

  @@unique([companyId, slug], map: "udx_campaigns_company_slug")
  @@index([companyId, status, startDate], map: "idx_campaigns_company_status")
  @@map("campaigns")
}

model CampaignParticipant {
  id            BigInt    @id @default(autoincrement())
  uuid          String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  campaignId    BigInt    @map("campaign_id")
  companyId     BigInt    @map("company_id")
  userId        BigInt    @map("user_id")
  branchId      BigInt?   @map("branch_id")
  joinedAt      DateTime  @default(now()) @map("joined_at") @db.Timestamptz
  joinedBy      BigInt?   @map("joined_by")
  status        String    @default("active") @db.VarChar(20)
  withdrawnAt   DateTime? @map("withdrawn_at") @db.Timestamptz
  initialScore  Decimal   @default(0) @map("initial_score") @db.Decimal(18, 4)
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt     DateTime? @map("deleted_at") @db.Timestamptz
  active        Boolean   @default(true)
  version       Int       @default(1)
  metadata      Json      @default("{}")

  campaign      Campaign  @relation(fields: [campaignId], references: [id])
  company       Company   @relation(fields: [companyId], references: [id])
  user          User      @relation(fields: [userId], references: [id])
  branch        Branch?   @relation(fields: [branchId], references: [id])

  @@unique([campaignId, userId], map: "udx_cp_campaign_user")
  @@index([userId, status], map: "idx_cp_user")
  @@map("campaign_participants")
}

model Award {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  campaignId      BigInt    @map("campaign_id")
  companyId       BigInt    @map("company_id")
  name            String    @db.VarChar(255)
  description     String?
  awardType       AwardType @map("award_type")
  points          Int?
  value           Decimal?  @db.Decimal(18, 2)
  imageUrl        String?   @map("image_url")
  badgeCode       String?   @map("badge_code") @db.VarChar(50)
  minPosition     Int?      @map("min_position")
  minScore        Decimal?  @map("min_score") @db.Decimal(18, 4)
  maxRecipients   Int?      @map("max_recipients")
  recipientsCount Int       @default(0) @map("recipients_count")
  isGuaranteed    Boolean   @default(false) @map("is_guaranteed")
  sortOrder       Int       @default(0) @map("sort_order")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz
  createdBy       BigInt?   @map("created_by")
  updatedBy       BigInt?   @map("updated_by")
  deletedBy       BigInt?   @map("deleted_by")
  active          Boolean   @default(true)
  version         Int       @default(1)
  metadata        Json      @default("{}")

  campaign        Campaign  @relation(fields: [campaignId], references: [id])
  company         Company   @relation(fields: [companyId], references: [id])

  @@index([campaignId, sortOrder], map: "idx_awards_campaign")
  @@map("awards")
}

model Ranking {
  id               BigInt    @id @default(autoincrement())
  uuid             String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId        BigInt    @map("company_id")
  branchId         BigInt?   @map("branch_id")
  userId           BigInt    @map("user_id")
  campaignId       BigInt?   @map("campaign_id")
  indicatorId      BigInt?   @map("indicator_id")
  periodType       GoalType  @map("period_type")
  periodStart      DateTime  @map("period_start") @db.Date
  periodEnd        DateTime  @map("period_end") @db.Date
  score            Decimal   @db.Decimal(18, 4)
  normalizedScore  Decimal?  @map("normalized_score") @db.Decimal(8, 4)
  position         Int
  previousPosition Int?      @map("previous_position")
  trend            String?   @db.VarChar(10)
  calculatedAt     DateTime  @default(now()) @map("calculated_at") @db.Timestamptz
  isOfficial       Boolean   @default(false) @map("is_official")
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  active           Boolean   @default(true)
  version          Int       @default(1)
  metadata         Json      @default("{}")

  company          Company   @relation(fields: [companyId], references: [id])
  branch           Branch?   @relation(fields: [branchId], references: [id])
  user             User      @relation(fields: [userId], references: [id])
  campaign         Campaign? @relation(fields: [campaignId], references: [id])

  @@index([companyId, periodType, periodStart, position], map: "idx_rankings_company_period")
  @@index([userId, periodStart], map: "idx_rankings_user")
  @@index([campaignId, position], map: "idx_rankings_campaign")
  @@map("rankings")
}

// ---------------------------------------------------------------------------
// EXPERIÊNCIA — Dashboards, Widgets, Notificações, Filas
// ---------------------------------------------------------------------------

model Dashboard {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId       BigInt    @map("company_id")
  userId          BigInt?   @map("user_id")
  name            String    @db.VarChar(255)
  description     String?
  layout          Json      @default("[]")
  theme           String    @default("default") @db.VarChar(50)
  isDefault       Boolean   @default(false) @map("is_default")
  isShared        Boolean   @default(false) @map("is_shared")
  sharedWith      Json      @default("[]") @map("shared_with")
  filters         Json      @default("{}")
  refreshInterval Int?      @map("refresh_interval")
  lastViewedAt    DateTime? @map("last_viewed_at") @db.Timestamptz
  viewsCount      BigInt    @default(0) @map("views_count")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz
  createdBy       BigInt?   @map("created_by")
  updatedBy       BigInt?   @map("updated_by")
  deletedBy       BigInt?   @map("deleted_by")
  active          Boolean   @default(true)
  version         Int       @default(1)
  externalId      String?   @map("external_id") @db.VarChar(100)
  metadata        Json      @default("{}")

  company         Company   @relation(fields: [companyId], references: [id])
  user            User?     @relation(fields: [userId], references: [id])
  widgets         Widget[]

  @@index([userId, isDefault], map: "idx_dashboards_user")
  @@index([companyId], map: "idx_dashboards_company_shared")
  @@map("dashboards")
}

model Widget {
  id              BigInt    @id @default(autoincrement())
  uuid            String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  dashboardId     BigInt    @map("dashboard_id")
  companyId       BigInt    @map("company_id")
  widgetType      String    @map("widget_type") @db.VarChar(100)
  title           String    @db.VarChar(255)
  description     String?
  configuration   Json      @default("{}")
  dataSource      Json?     @map("data_source")
  position        Json
  isVisible       Boolean   @default(true) @map("is_visible")
  cacheTtl        Int       @default(60) @map("cache_ttl")
  lastRenderedAt  DateTime? @map("last_rendered_at") @db.Timestamptz
  lastError       String?   @map("last_error")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz
  createdBy       BigInt?   @map("created_by")
  updatedBy       BigInt?   @map("updated_by")
  active          Boolean   @default(true)
  version         Int       @default(1)
  metadata        Json      @default("{}")

  dashboard       Dashboard @relation(fields: [dashboardId], references: [id])
  company         Company   @relation(fields: [companyId], references: [id])

  @@index([dashboardId], map: "idx_widgets_dashboard")
  @@index([companyId, widgetType], map: "idx_widgets_type")
  @@map("widgets")
}

model Notification {
  id                  BigInt    @id @default(autoincrement())
  uuid                String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId           BigInt    @map("company_id")
  userId              BigInt    @map("user_id")
  templateId          BigInt?   @map("template_id")
  title               String    @db.VarChar(255)
  message             String
  bodyHtml            String?   @map("body_html")
  priority            NotificationPriority @default(normal)
  notificationType    String    @map("notification_type") @db.VarChar(50)
  category            String?   @db.VarChar(50)
  actionUrl           String?   @map("action_url")
  actionLabel         String?   @map("action_label") @db.VarChar(100)
  icon                String?   @db.VarChar(50)
  imageUrl            String?   @map("image_url")
  channels            Json      @default("[\"in_app\"]")
  channelsStatus      Json      @default("{}") @map("channels_status")
  isRead              Boolean   @default(false) @map("is_read")
  readAt              DateTime? @map("read_at") @db.Timestamptz
  isArchived          Boolean   @default(false) @map("is_archived")
  archivedAt          DateTime? @map("archived_at") @db.Timestamptz
  isActioned          Boolean   @default(false) @map("is_actioned")
  actionedAt          DateTime? @map("actioned_at") @db.Timestamptz
  scheduledFor        DateTime? @map("scheduled_for") @db.Timestamptz
  sentAt              DateTime? @map("sent_at") @db.Timestamptz
  expiresAt           DateTime? @map("expires_at") @db.Timestamptz
  relatedTable        String?   @map("related_table") @db.VarChar(100)
  relatedId           BigInt?   @map("related_id")
  createdAt           DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt           DateTime? @map("deleted_at") @db.Timestamptz
  createdBy           BigInt?   @map("created_by")
  updatedBy           BigInt?   @map("updated_by")
  active              Boolean   @default(true)
  version             Int       @default(1)
  metadata            Json      @default("{}")

  company             Company              @relation(fields: [companyId], references: [id])
  user                User                 @relation(fields: [userId], references: [id])
  template            NotificationTemplate? @relation(fields: [templateId], references: [id])

  @@index([userId, createdAt], map: "idx_notif_user_unread")
  @@index([companyId, notificationType], map: "idx_notif_company_type")
  @@index([scheduledFor], map: "idx_notif_scheduled")
  @@map("notifications")
}

model NotificationTemplate {
  id                 BigInt    @id @default(autoincrement())
  uuid               String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId          BigInt?   @map("company_id")
  code               String    @db.VarChar(100)
  name               String    @db.VarChar(255)
  description        String?
  notificationType   String    @map("notification_type") @db.VarChar(50)
  defaultPriority    NotificationPriority @default(normal) @map("default_priority")
  defaultChannels    Json      @default("[\"in_app\"]") @map("default_channels")
  subjectTemplate    String?   @map("subject_template")
  bodyTemplateText   String?   @map("body_template_text")
  bodyTemplateHtml   String?   @map("body_template_html")
  variablesSchema    Json      @default("{}") @map("variables_schema")
  locale             String    @default("pt-BR") @db.VarChar(10)
  isSystem           Boolean   @default(false) @map("is_system")
  isActive           Boolean   @default(true) @map("is_active")
  version            Int       @default(1)
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt          DateTime? @map("deleted_at") @db.Timestamptz
  createdBy          BigInt?   @map("created_by")
  updatedBy          BigInt?   @map("updated_by")
  metadata           Json      @default("{}")

  notifications      Notification[]

  @@unique([companyId, code, locale], map: "udx_nt_company_code_locale")
  @@index([code, isActive], map: "idx_nt_code")
  @@map("notification_templates")
}

model EmailQueue {
  id                 BigInt    @id @default(autoincrement())
  uuid               String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId          BigInt    @map("company_id")
  notificationId     BigInt?   @map("notification_id")
  templateId         BigInt?   @map("template_id")
  fromEmail          String    @default("no-reply@orion.app") @map("from_email") @db.VarChar(255)
  fromName           String    @default("Orion") @map("from_name") @db.VarChar(100)
  toEmail            String    @map("to_email") @db.VarChar(255)
  toName             String?   @map("to_name") @db.VarChar(255)
  replyTo            String?   @map("reply_to") @db.VarChar(255)
  cc                 Json?
  bcc                Json?
  subject            String    @db.VarChar(500)
  bodyText           String?   @map("body_text")
  bodyHtml           String?   @map("body_html")
  attachments        Json      @default("[]")
  headers            Json      @default("{}")
  tags               Json      @default("[]")
  priority           Int       @default(5) @db.SmallInt
  status             EmailStatus @default(queued)
  attempts           Int       @default(0)
  maxAttempts        Int       @default(5) @map("max_attempts")
  nextAttemptAt      DateTime  @default(now()) @map("next_attempt_at") @db.Timestamptz
  lastAttemptAt      DateTime? @map("last_attempt_at") @db.Timestamptz
  lastError          String?   @map("last_error")
  lastErrorCode      String?   @map("last_error_code") @db.VarChar(30)
  provider           String    @default("ses") @db.VarChar(30)
  providerMessageId  String?   @map("provider_message_id") @db.VarChar(255)
  sentAt             DateTime? @map("sent_at") @db.Timestamptz
  deliveredAt        DateTime? @map("delivered_at") @db.Timestamptz
  openedAt           DateTime? @map("opened_at") @db.Timestamptz
  clickedAt          DateTime? @map("clicked_at") @db.Timestamptz
  bouncedAt          DateTime? @map("bounced_at") @db.Timestamptz
  bounceReason       String?   @map("bounce_reason")
  suppressedAt       DateTime? @map("suppressed_at") @db.Timestamptz
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active             Boolean   @default(true)
  version            Int       @default(1)
  metadata           Json      @default("{}")

  @@index([status, nextAttemptAt, priority], map: "idx_email_status_priority")
  @@index([companyId, createdAt], map: "idx_email_company_created")
  @@map("email_queue")
}

model WebhookDelivery {
  id                 BigInt    @id @default(autoincrement())
  uuid               String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId          BigInt    @map("company_id")
  webhookId          BigInt?   @map("webhook_id")
  eventType          String    @map("event_type") @db.VarChar(100)
  eventId            String    @map("event_id") @db.Uuid
  url                String
  method             String    @default("POST") @db.VarChar(10)
  headers            Json      @default("{}")
  payload            Json
  payloadSize        Int       @map("payload_size")
  signature          String?   @db.VarChar(128)
  status             WebhookStatus @default(queued)
  attempts           Int       @default(0)
  maxAttempts        Int       @default(5) @map("max_attempts")
  nextAttemptAt      DateTime  @default(now()) @map("next_attempt_at") @db.Timestamptz
  lastAttemptAt      DateTime? @map("last_attempt_at") @db.Timestamptz
  lastResponseStatus Int?      @map("last_response_status")
  lastResponseBody   String?   @map("last_response_body")
  lastError          String?   @map("last_error")
  deliveredAt        DateTime? @map("delivered_at") @db.Timestamptz
  durationMs         Int?      @map("duration_ms")
  createdAt          DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  active             Boolean   @default(true)
  version            Int       @default(1)
  metadata           Json      @default("{}")

  @@unique([webhookId, eventId], map: "udx_webhook_event_unique")
  @@index([status, nextAttemptAt], map: "idx_webhook_status")
  @@index([companyId, createdAt], map: "idx_webhook_company_created")
  @@map("webhook_deliveries")
}

// ---------------------------------------------------------------------------
// TRANSVERSAL — Auditoria, Licenças, Backups, Settings, Plugins
// ---------------------------------------------------------------------------

model AuditLog {
  id             BigInt    @id @default(autoincrement())
  uuid           String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId      BigInt    @map("company_id")
  userId         BigInt?   @map("user_id")
  sessionId      BigInt?   @map("session_id")
  action         AuditAction
  tableName      String    @map("table_name") @db.VarChar(100)
  recordId       BigInt?   @map("record_id")
  recordUuid     String?   @map("record_uuid") @db.Uuid
  oldValue       Json?     @map("old_value")
  newValue       Json?     @map("new_value")
  changesCount   Int       @default(0) @map("changes_count")
  ipAddress      String?   @map("ip_address") @db.VarChar(100)
  userAgent      String?   @map("user_agent")
  requestId      String?   @map("request_id") @db.VarChar(100)
  route          String?   @db.VarChar(255)
  method         String?   @db.VarChar(10)
  queryParams    Json?     @map("query_params")
  bodySize       Int?      @map("body_size")
  durationMs     Int?      @map("duration_ms")
  statusCode     Int?      @map("status_code")
  errorMessage   String?   @map("error_message")
  occurredAt     DateTime  @default(now()) @map("occurred_at") @db.Timestamptz
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz
  metadata       Json      @default("{}")

  details        AuditLogDetail[]

  @@index([companyId, occurredAt], map: "idx_audit_company_time")
  @@index([userId, occurredAt], map: "idx_audit_user_time")
  @@index([tableName, recordId], map: "idx_audit_table_record")
  @@index([action, occurredAt], map: "idx_audit_action")
  @@map("audit_logs")
}

model AuditLogDetail {
  id            BigInt   @id @default(autoincrement())
  auditLogId    BigInt   @map("audit_log_id")
  fieldName     String   @map("field_name") @db.VarChar(100)
  changeType    String   @map("change_type") @db.VarChar(20)
  oldValue      Json?    @map("old_value")
  newValue      Json?    @map("new_value")
  oldDisplay    String?  @map("old_display")
  newDisplay    String?  @map("new_display")
  isSensitive   Boolean  @default(false) @map("is_sensitive")
  occurredAt    DateTime @default(now()) @map("occurred_at") @db.Timestamptz

  auditLog      AuditLog @relation(fields: [auditLogId], references: [id])

  @@index([auditLogId], map: "idx_audit_detail_log")
  @@index([fieldName, occurredAt], map: "idx_audit_detail_field")
  @@map("audit_log_details")
}

model License {
  id                   BigInt    @id @default(autoincrement())
  uuid                 String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  licenseKey           String    @unique @map("license_key") @db.VarChar(255)
  companyId            BigInt?   @unique @map("company_id")
  plan                 LicensePlan @default(free)
  seatsIncluded        Int       @default(5) @map("seats_included")
  seatsUsed            Int       @default(0) @map("seats_used")
  branchesIncluded     Int       @default(1) @map("branches_included")
  branchesUsed         Int       @default(0) @map("branches_used")
  storageGb            Int       @default(5) @map("storage_gb")
  apiCallsMonth        Int       @default(10000) @map("api_calls_month")
  modules              Json      @default("[]")
  features             Json      @default("{}")
  activationDate       DateTime? @map("activation_date") @db.Date
  expirationDate       DateTime? @map("expiration_date") @db.Date
  autoRenew            Boolean   @default(true) @map("auto_renew")
  billingCycle         String    @default("monthly") @map("billing_cycle") @db.VarChar(20)
  billingAmount        Decimal?  @map("billing_amount") @db.Decimal(18, 2)
  billingCurrency      String    @default("BRL") @map("billing_currency") @db.Char(3)
  customerStripeId     String?   @map("customer_stripe_id") @db.VarChar(100)
  subscriptionStripeId String?   @map("subscription_stripe_id") @db.VarChar(100)
  status               LicenseStatus @default(trial)
  suspendedReason      String?   @map("suspended_reason")
  suspendedAt          DateTime? @map("suspended_at") @db.Timestamptz
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt            DateTime? @map("deleted_at") @db.Timestamptz
  createdBy            BigInt?   @map("created_by")
  updatedBy            BigInt?   @map("updated_by")
  active               Boolean   @default(true)
  version              Int       @default(1)
  metadata             Json      @default("{}")

  company              Company?  @relation(fields: [companyId], references: [id])

  @@index([status, expirationDate], map: "idx_lic_status_expires")
  @@map("licenses")
}

model Backup {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  backupType        BackupType @map("backup_type")
  fileName          String    @map("file_name")
  fileSize          BigInt    @map("file_size")
  fileChecksum      String?   @map("file_checksum") @db.Char(64)
  storagePath       String    @map("storage_path")
  storageProvider   String    @default("s3") @map("storage_provider") @db.VarChar(30)
  storageRegion     String?   @map("storage_region") @db.VarChar(30)
  isEncrypted       Boolean   @default(true) @map("is_encrypted")
  encryptionAlgo    String    @default("AES-256-GCM") @map("encryption_algo") @db.VarChar(30)
  startedAt         DateTime  @default(now()) @map("started_at") @db.Timestamptz
  completedAt       DateTime? @map("completed_at") @db.Timestamptz
  durationSecs      Int?      @map("duration_secs")
  tablesCount       Int?      @map("tables_count")
  recordsCount      BigInt?   @map("records_count")
  status            BackupStatus @default(queued)
  triggeredBy       String    @default("system") @map("triggered_by") @db.VarChar(30)
  triggeredByUser   BigInt?   @map("triggered_by_user")
  notes             String?
  errorMessage      String?   @map("error_message")
  expiresAt         DateTime? @map("expires_at") @db.Timestamptz
  purgedAt          DateTime? @map("purged_at") @db.Timestamptz
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  createdBy         BigInt?   @map("created_by")
  updatedBy         BigInt?   @map("updated_by")
  active            Boolean   @default(true)
  version           Int       @default(1)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])

  @@index([companyId, startedAt], map: "idx_backups_company_time")
  @@index([status, startedAt], map: "idx_backups_status")
  @@map("backups")
}

model SystemSetting {
  id               BigInt    @id @default(autoincrement())
  uuid             String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId        BigInt?   @map("company_id")
  settingKey       String    @map("setting_key") @db.VarChar(255)
  settingValue     Json      @map("setting_value")
  valueType        String    @map("value_type") @db.VarChar(30)
  settingGroup     String    @map("setting_group") @db.VarChar(100)
  description      String?
  isSecret         Boolean   @default(false) @map("is_secret")
  isSystem         Boolean   @default(false) @map("is_system")
  isReadonly       Boolean   @default(false) @map("is_readonly")
  validationSchema Json?     @map("validation_schema")
  defaultValue     Json?     @map("default_value")
  environment      String    @default("all") @db.VarChar(20)
  effectiveFrom    DateTime? @map("effective_from") @db.Timestamptz
  effectiveTo      DateTime? @map("effective_to") @db.Timestamptz
  lastChangedBy    BigInt?   @map("last_changed_by")
  lastChangedAt    DateTime? @map("last_changed_at") @db.Timestamptz
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt        DateTime? @map("deleted_at") @db.Timestamptz
  createdBy        BigInt?   @map("created_by")
  updatedBy        BigInt?   @map("updated_by")
  deletedBy        BigInt?   @map("deleted_by")
  active           Boolean   @default(true)
  version          Int       @default(1)
  metadata         Json      @default("{}")

  company          Company?  @relation(fields: [companyId], references: [id])

  @@unique([companyId, settingKey, environment], map: "udx_settings_company_key_env")
  @@index([companyId, settingGroup], map: "idx_settings_group")
  @@map("system_settings")
}

model PluginInstallation {
  id                BigInt    @id @default(autoincrement())
  uuid              String    @unique @db.Uuid @default(dbgenerated("gen_random_uuid()"))
  companyId         BigInt    @map("company_id")
  pluginSlug        String    @map("plugin_slug") @db.VarChar(100)
  pluginVersion     String    @map("plugin_version") @db.VarChar(30)
  marketplaceId     BigInt?   @map("marketplace_id")
  name              String    @db.VarChar(255)
  description       String?
  iconUrl           String?   @map("icon_url")
  category          String?   @db.VarChar(50)
  installedBy       BigInt    @map("installed_by")
  installedAt       DateTime  @default(now()) @map("installed_at") @db.Timestamptz
  status            PluginStatus @default(installed)
  enabledAt         DateTime? @map("enabled_at") @db.Timestamptz
  disabledAt        DateTime? @map("disabled_at") @db.Timestamptz
  disabledReason    String?   @map("disabled_reason")
  configuration     Json      @default("{}")
  permissions       Json      @default("[]")
  webhookUrl        String?   @map("webhook_url")
  lastSyncedAt      DateTime? @map("last_synced_at") @db.Timestamptz
  lastSyncStatus    String?   @map("last_sync_status") @db.VarChar(30)
  lastError         String?   @map("last_error")
  usage30d          Json?     @map("usage_30d")
  billingPlan       String?   @map("billing_plan") @db.VarChar(30)
  billingAmount     Decimal?  @map("billing_amount") @db.Decimal(18, 2)
  autoUpdate        Boolean   @default(false) @map("auto_update")
  updateAvailable   String?   @map("update_available") @db.VarChar(30)
  createdAt         DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime? @map("deleted_at") @db.Timestamptz
  active            Boolean   @default(true)
  version           Int       @default(1)
  metadata          Json      @default("{}")

  company           Company   @relation(fields: [companyId], references: [id])

  @@unique([companyId, pluginSlug], map: "udx_plugin_install_company_slug")
  @@index([companyId, status], map: "idx_plugin_install_company_status")
  @@map("plugin_installations")
}

// ---------------------------------------------------------------------------
// MATERIALIZED VIEWS (somente leitura — usadas para dashboards)
// ---------------------------------------------------------------------------

model GoalProgressDaily {
  goalId           BigInt   @map("goal_id")
  companyId        BigInt   @map("company_id")
  userId           BigInt?  @map("user_id")
  branchId         BigInt?  @map("branch_id")
  indicatorId      BigInt   @map("indicator_id")
  goalType         String   @map("goal_type")
  startDate        DateTime @map("start_date") @db.Date
  endDate          DateTime @map("end_date") @db.Date
  targetValue      Decimal  @map("target_value") @db.Decimal(18, 4)
  weight           Decimal  @db.Decimal(10, 2)
  achievedValue    Decimal  @map("achieved_value") @db.Decimal(18, 4)
  achievedPct      Decimal  @map("achieved_pct") @db.Decimal(8, 4)
  resultsCount     Int      @map("results_count")
  lastResultDate   DateTime? @map("last_result_date") @db.Date

  @@map("mv_goal_progress_daily")
  @@index([companyId, userId], map: "idx_mv_gp_company_user")
}

model UserRankingMonthly {
  companyId     BigInt   @map("company_id")
  userId        BigInt   @map("user_id")
  branchId      BigInt?  @map("branch_id")
  periodStart   DateTime @map("period_start") @db.Date
  periodEnd     DateTime @map("period_end") @db.Date
  indicatorId   BigInt   @map("indicator_id")
  totalValue    Decimal  @map("total_value") @db.Decimal(18, 4)
  avgValue      Decimal  @map("avg_value") @db.Decimal(18, 4)
  recordsCount  Int      @map("records_count")
  position      Int

  @@map("mv_user_ranking_monthly")
  @@index([companyId, periodStart, position], map: "idx_mv_ranking_company_period")
}
```

## 43.2 Comandos de bootstrap

```bash
# 1. Gera cliente Prisma
prisma generate

# 2. Cria migration inicial a partir do schema
prisma migrate dev --name init_orion_v1 --create-only

# 3. (Opcional) Edita SQL para adicionar CONCURRENTLY, RLS, etc.

# 4. Aplica no banco
prisma migrate deploy

# 5. Seed
prisma db seed
```

## 43.3 Seed script (`prisma/seed.ts`)

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // 1. Empresa
  const company = await prisma.company.create({
    data: {
      uuid: crypto.randomUUID(),
      legalName: 'TechVendas Comercio Ltda',
      tradeName: 'TechVendas',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techvendas.com.br',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      plan: 'PRO',
    },
  });

  // 2. Licença
  await prisma.license.create({
    data: {
      licenseKey: 'ORN-PRO-2025-0000001',
      companyId: company.id,
      plan: 'PRO',
      seatsIncluded: 50,
      branchesIncluded: 5,
      storageGb: 50,
      apiCallsMonth: 1_000_000,
      activationDate: new Date('2024-12-01'),
      expirationDate: new Date('2025-12-01'),
      billingAmount: 499,
      billingCurrency: 'BRL',
      status: 'ACTIVE',
    },
  });

  // 3. Role admin
  const role = await prisma.role.create({
    data: {
      companyId: company.id,
      name: 'Administrador',
      slug: 'admin',
      isSystem: true,
      level: 100,
      color: '#DC2626',
    },
  });

  // 4. Usuário admin
  const passwordHash = await bcrypt.hash('Orion@2025', { type: 2 });
  await prisma.user.create({
    data: {
      companyId: company.id,
      roleId: role.id,
      fullName: 'Ana Paula Souza',
      email: 'ana.souza@techvendas.com.br',
      passwordHash,
      status: 'ACTIVE',
      employeeCode: 'EMP001',
      admissionDate: new Date('2019-02-10'),
    },
  });

  // 5. Permissões globais
  const perms = await Promise.all(
    ['users.create','users.read','users.update','users.delete',
     'goals.create','goals.read','goals.update','goals.delete',
     'system_settings.update','audit_logs.read']
      .map((slug) => {
        const [module, action] = slug.split('.');
        return prisma.permission.create({ data: { module, action, slug } });
      })
  );

  await prisma.rolePermission.createMany({
    data: perms.map((p) => ({ roleId: role.id, permissionId: p.id, scope: 'company' })),
  });

  console.log('Seed concluído');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

## 43.4 Configuração do `package.json`

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset --force"
  }
}
```

---

# APÊNDICES

# Apêndice A — Resumo de Tabelas (Catálogo Final)

| # | Tabela | Domínio | Capítulo | Volume estimado / Tenant | Particionada? |
|---|---|---|---|---|---|
| 1 | companies | Core | 8 | 1 | Não |
| 2 | branches | Core | 9 | 1–50 | Não |
| 3 | users | Core | 10 | 3–500 | Não |
| 4 | sessions | Core | 11 | 10–5000 (ativo) | Semanal |
| 5 | refresh_tokens | Core | 12 | 10–5000 (ativo) | Semanal |
| 6 | api_keys | Core | 13 | 1–50 | Não |
| 7 | file_uploads | Core | 14 | 100–100000 | Não |
| 8 | roles | Core | 15 | 5–30 | Não |
| 9 | permissions | Core | 16 | ~200 (global) | Não |
| 10 | role_permissions | Core | 17 | 50–1000 | Não |
| 11 | indicator_categories | Performance | 18 | 5–20 | Não |
| 12 | indicators | Performance | 19 | 10–200 | Não |
| 13 | goals | Performance | 20 | 100–50000 | Não |
| 14 | results | Performance | 21 | 10K–10M | Mensal |
| 15 | campaigns | Performance | 22 | 1–100 | Não |
| 16 | campaign_participants | Performance | 23 | 10–5000 | Não |
| 17 | awards | Performance | 24 | 1–50 | Não |
| 18 | rankings | Performance | 25 | 1K–100K | Não |
| 19 | dashboards | Experiência | 26 | 10–500 | Não |
| 20 | widgets | Experiência | 27 | 50–2000 | Não |
| 21 | notifications | Experiência | 28 | 1K–1M | Mensal |
| 22 | notification_templates | Experiência | 29 | 20–100 (global+tenant) | Não |
| 23 | email_queue | Experiência | 30 | 1K–100K (fila) | Semanal |
| 24 | webhook_deliveries | Experiência | 31 | 1K–50K (fila) | Semanal |
| 25 | audit_logs | Transversal | 32 | 10K–10M | Mensal |
| 26 | audit_log_details | Transversal | 33 | 50K–50M | Mensal |
| 27 | licenses | Transversal | 34 | 1 | Não |
| 28 | backups | Transversal | 35 | 100–5000 | Não |
| 29 | system_settings | Transversal | 36 | 50–500 | Não |
| 30 | plugin_installations | Transversal | 37 | 0–20 | Não |
| 31 | _orion_migrations | Meta | 42 | 100–500 | Não |
| 32 | enum_catalog | Meta | 4 | ~500 (global) | Não |
| 33 | mview_refresh_queue | Meta | 40 | Variável | Não |
| 34 | sync_queue | Meta | 42 | Variável | Não |
| 35 | mv_goal_progress_daily | MView | 40 | 100–50000 | Não |
| 36 | mv_user_ranking_monthly | MView | 40 | 1K–100K | Não |
| 37 | mv_indicator_summary_monthly | MView | 40 | 100–5000 | Não |
| 38 | mv_branch_performance_monthly | MView | 40 | 50–500 | Não |
| 39 | mv_campaign_leaderboard | MView | 40 | 10–1000 | Não |
| 40 | mv_audit_summary_daily | MView | 40 | 100–1000 | Não |
| 41 | mv_active_users_daily | MView | 40 | 100–1000 | Não |

# Apêndice B — Tipos ENUM consolidados

| ENUM | Tabela(s) que usa |
|---|---|
| `user_status` | users |
| `branch_status` | branches |
| `goal_type` | goals, rankings |
| `result_status` | results |
| `campaign_status` | campaigns |
| `award_type` | awards |
| `notification_priority` | notifications, notification_templates |
| `notification_channel` | notifications (JSONB array) |
| `audit_action` | audit_logs |
| `license_plan` | licenses, companies |
| `license_status` | licenses |
| `backup_type` | backups |
| `backup_status` | backups |
| `email_status` | email_queue |
| `webhook_status` | webhook_deliveries |
| `file_purpose` | file_uploads |
| `plugin_status` | plugin_installations |
| `api_key_scope` | api_keys |

# Apêndice C — Dicionário de Constraints Universais

| Constraint | Aplicação | Regra |
|---|---|---|
| `chk_<t>_active_when_not_deleted` | Todas as tabelas de domínio | `deleted_at IS NULL OR active = FALSE` |
| `chk_<t>_version_positive` | Todas as tabelas de domínio | `version >= 1` |
| `chk_users_locked_status` | users | lockout coerente com `status` |
| `chk_users_password_when_active` | users | usuário ativo deve ter senha |
| `chk_goals_dates` | goals | `end_date >= start_date` |
| `chk_goals_target_pos` | goals | `target_value > 0` |
| `chk_goals_stretch_gt_target` | goals | stretch >= target |
| `chk_results_status_flow` | results | `approved` implica `approved_by` e `approved_at` |
| `chk_campaigns_dates` | campaigns | datas coerentes |
| `chk_audit_action_values` | audit_logs | ação no enum |
| `chk_lic_seats_pos` | licenses | seats >= 0 |
| `chk_backups_completed_status` | backups | `completed` implica `completed_at` |

# Apêndice D — Scripts de Manutenção

### D.1 Reconstrução mensal de índices

```sql
-- Executa no primeiro domingo de cada mês, 03:00
SELECT cron.schedule(
    'monthly_reindex',
    '0 3 1-7 * 0',
    $$
    REINDEX TABLE CONCURRENTLY results;
    REINDEX TABLE CONCURRENTLY audit_logs;
    REINDEX TABLE CONCURRENTLY notifications;
    $$
);
```

### D.2 Vacuum analise agendado

```sql
SELECT cron.schedule('daily_vacuum', '0 4 * * *', 'VACUUM (ANALYZE) results');
SELECT cron.schedule('weekly_vacuum_full_audit', '0 5 * * 0', 'VACUUM (ANALYZE) audit_logs');
```

### D.3 Detecção de índices inchados (bloat)

```sql
SELECT
    schemaname, relname, indexrelname,
    round(100.0 * idx_scan / NULLIF(idx_scan + idx_blks_read, 0), 2) AS hit_ratio,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

### D.4 Limpeza de partições expiradas

```sql
CREATE OR REPLACE PROCEDURE sp_drop_old_partitions(p_table TEXT, p_months INT)
LANGUAGE plpgsql AS $$
DECLARE
    part RECORD;
BEGIN
    FOR part IN
        SELECT c.relname AS name
        FROM pg_inherits
        JOIN pg_class c ON c.oid = inhrelid
        WHERE inhparent = (p_table)::regclass
          AND c.relname ~ format('%s_\d{4}_\d{2}', p_table)
    LOOP
        IF part.name < to_char(now() - (p_months || ' months')::interval, 'YYYY_MM') THEN
            RAISE NOTICE 'Detaching and dropping %', part.name;
            EXECUTE format('ALTER TABLE %I DETACH PARTITION %I', p_table, part.name);
            EXECUTE format('DROP TABLE IF EXISTS %I', part.name);
        END IF;
    END LOOP;
END;
$$;
```

# Apêndice E — Checklist de Produção

- [ ] PostgreSQL 15+ com `shared_preload_libraries = 'pg_cron,pgcrypto,pg_trgm'`.
- [ ] Roles criadas: `orion_app`, `orion_admin`, `orion_readonly`.
- [ ] RLS habilitada em todas as 30 tabelas multi-tenant.
- [ ] `pg_cron` configurado com 5 jobs (refresh mviews, vacuum, reindex, partition, purge).
- [ ] Backup automático (RDS automated + lógico diário via `pg_dump`).
- [ ] Monitoramento: Datadog/NewRelic com alertas de lock wait, slow query, bloat.
- [ ] Particionamento mensal com 3 meses precriados à frente.
- [ ] Prisma Client com middleware de tenant + auditoria.
- [ ] Secrets (PG password, JWT secret) em AWS Secrets Manager.
- [ ] Soft delete retention configurado por tenant (default 90 dias).
- [ ] Índices GIN em `audit_logs.new_value`, `metadata`.
- [ ] `pg_stat_statements` habilitado para análise de queries.
- [ ] Endpoint de health-check `/health/db` que roda `SELECT 1`.
- [ ] DR testado: restore do backup em outra região < 4h.

---

# Conclusão

O modelo lógico do Orion V1.0 compreende **30 tabelas de domínio** + **4 meta-tabelas** + **7 materialized views**, totalizando 41 estruturas físicas no PostgreSQL.

As decisões-chave foram:

1. **Multi-tenant via `company_id` + RLS** — simples, performático, com isolamento garantido em três camadas.
2. **Soft delete universal** — nenhuma exclusão física em hot paths, retention configurável.
3. **Auditoria automática via triggers** — captura change-data sem acoplar código aplicacional.
4. **Particionamento mensal em tabelas de alto volume** — `results`, `audit_logs`, `notifications`, filas.
5. **Materialized views para dashboards** — dashboards em segundos mesmo com milhões de registros.
6. **Índices compostos com `company_id` líder** — regra inviolável para performance multi-tenant.
7. **Schema Prisma único** — mesma fonte de verdade para PostgreSQL cloud e SQLite local.
8. **Versionamento de registro** — optimistic locking embutido em todas as tabelas.
9. **Campos `metadata` JSONB** — escape hatch controlado para customizações por tenant.
10. **Preparação para V2.0** — schemas `ai_*`, `automation_*`, `dw_*` reservados no catálogo.

Este modelo suporta desde um tenant **free** com 3 usuários até um **enterprise** com 500 filiais, milhões de resultados/mês e bilhões de registros históricos — sem necessidade de remodelagem estrutural.

---

# Próximo Documento

**DOCUMENTO 07 — REGRAS DE NEGÓCIO (BUSINESS RULES DOCUMENT)**

Nele definiremos detalhadamente:

- Cálculo de metas (diária, semanal, mensal, trimestral, anual);
- Cálculo de rankings (por indicador, por campanha, agregado);
- Cálculo de indicadores (fórmulas, dependências, agregações);
- Sistema de pontuação e scoring de campanhas;
- Regras de elegibilidade e distribuição de prêmios;
- Regras de permissão e escopo (company, own_branch, own);
- Regras de exibição de dashboards (permissões, filtros, refresh);
- Regras de notificação (triggers, templates, priorização);
- Regras da IA (quando acionada, limites, custos);
- Regras de auditoria (retenção, exportação, compliance LGPD);
- E todas as regras que determinarão exatamente como o Orion funcionará em produção.

---
**FIM DO DOCUMENTO 06 — LOGICAL DATABASE MODEL (LDM) V1.0**
