# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 10

# API SPECIFICATION

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** API Specification (OpenAPI 3.1)
**Última atualização:** 2025-08-15

---

## Sumário

1. [Objetivo](#capítulo-1--objetivo)
2. [Convenções Gerais](#capítulo-2--convenções-gerais)
3. [Catálogo de Erros Padronizados](#capítulo-3--catálogo-de-erros-padronizados)
4. [Paginação, Filtros, Ordenação e Expansão](#capítulo-4--paginação-filtros-ordenação-e-expansão)
5. [Schemas de Entidades](#capítulo-5--schemas-de-entidades)
6. [Autenticação](#capítulo-6--autenticação)
7. [Empresas](#capítulo-7--empresas)
8. [Filiais](#capítulo-8--filiais)
9. [Usuários](#capítulo-9--usuários)
10. [Papéis e Permissões](#capítulo-10--papéis-e-permissões)
11. [Categorias de Indicadores](#capítulo-11--categorias-de-indicadores)
12. [Indicadores](#capítulo-12--indicadores)
13. [Metas](#capítulo-13--metas)
14. [Resultados](#capítulo-14--resultados)
15. [Campanhas](#capítulo-15--campanhas)
16. [Premiações](#capítulo-16--premiações)
17. [Ranking](#capítulo-17--ranking)
18. [Dashboards e Widgets](#capítulo-18--dashboards-e-widgets)
19. [Notificações](#capítulo-19--notificações)
20. [Logs de Auditoria](#capítulo-20--logs-de-auditoria)
21. [Licenciamento e Backups](#capítulo-21--licenciamento-e-backups)
22. [Webhooks](#capítulo-22--webhooks)
23. [Inteligência Artificial](#capítulo-23--inteligência-artificial)
24. [Rate Limiting](#capítulo-24--rate-limiting)
25. [Versionamento e Depreciação](#capítulo-25--versionamento-e-depreciação)
26. [SDKs Oficiais](#capítulo-26--sdks-oficiais)
27. [Documentação Interativa](#capítulo-27--documentação-interativa)

---

# Capítulo 1 — Objetivo

Este documento especifica, de forma exaustiva, a API REST do Projeto Orion, seguindo o padrão **OpenAPI 3.1**. A API é a interface pública para integrações externas (ERPs, CRMs, WhatsApp, BI, ferramentas de RH) e também a interface interna entre frontend web/mobile e backend.

### 1.1 Escopo

A API cobre todas as funcionalidades da plataforma Orion:

- Autenticação e gestão de identidade (JWT, 2FA, SSO futuramente)
- Gestão multi-tenant (empresas, filiais, usuários, papéis, permissões)
- Núcleo de gestão comercial (indicadores, metas, resultados)
- Gamificação (campanhas, premiações, rankings)
- Visualização (dashboards, widgets, notificações)
- Compliance (auditoria, licenciamento, backups)
- Integrações (webhooks, AI, importações/exportações)

### 1.2 Princípios de Design

| Princípio | Descrição |
|-----------|-----------|
| **RESTful** | Recursos nomeados como substantivos plurais, verbos HTTP com semântica clara |
| **Stateless** | Cada request contém tudo necessário; sem sessão de servidor |
| **Versionado** | Versão major na URL (`/v1/`) |
| **Consistente** | Mesma estrutura de resposta, erro e paginação em todos os endpoints |
| **Previsível** | Erros padronizados com `code`, `message`, `details`, `requestId` |
| **Idempotente** | `GET`, `PUT`, `DELETE` são idempotentes; `POST` suporta `Idempotency-Key` |
| **Seguro por padrão** | TLS 1.2+, JWT assinado, scopes por endpoint |

### 1.3 Conformidade OpenAPI

A especificação completa está disponível em `https://api.orion.com/openapi.yaml` e é validada continuamente nos pipelines de CI. Todos os SDKs oficiais são gerados a partir dessa especificação, garantindo consistência entre plataformas.

---

# Capítulo 2 — Convenções Gerais

## 2.1 URL Base

| Ambiente | URL |
|----------|-----|
| **Produção** | `https://api.orion.suaempresa.com/v1` |
| **Staging** | `https://staging-api.orion.suaempresa.com/v1` |
| **Local (on-premise)** | `https://localhost:3001/v1` |

## 2.2 Formato de Comunicação

- **Request body:** `Content-Type: application/json; charset=utf-8`
- **Response body:** `Content-Type: application/json; charset=utf-8`
- **Upload de arquivos:** `Content-Type: multipart/form-data`
- **Date/timestamp:** ISO 8601 UTC (ex.: `2025-08-15T14:30:00Z`)
- **Date-only:** `YYYY-MM-DD` (ex.: `2025-08-15`)
- **IDs numéricos:** inteiros positivos
- **IDs de string:** prefixados (`usr_`, `brn_`, `ind_`, `web_`, etc.)

## 2.3 Autenticação

Todos os endpoints (exceto `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password` e `/auth/verify-email`) exigem header:

```
Authorization: Bearer <JWT_TOKEN>
```

O JWT é assinado com RS256, tem TTL de 15 minutos e contém claims:

```json
{
  "sub": "usr_10",
  "iss": "orion-auth",
  "aud": "orion-api",
  "company_id": 1,
  "branch_id": 1,
  "role": "admin",
  "scope": ["users:read", "users:write", "indicators:read"],
  "iat": 1692124200,
  "exp": 1692125100,
  "jti": "jti_abc123"
}
```

## 2.4 Multi-tenant

Todo request é automaticamente escopado ao `company_id` extraído do JWT. Não é necessário — nem permitido — passar `companyId` no body ou query. Tentativas de acessar recursos de outra empresa retornam `404 RESOURCE_NOT_FOUND`.

Em endpoints administrativos (admin master SaaS), o header `X-Orion-Admin-Mode: true` libera acesso cross-tenant.

## 2.5 Headers Padrão

### Request headers (enviados pelo cliente)

| Header | Obrigatório | Descrição |
|--------|-------------|-----------|
| `Authorization` | Sim (exceto login) | `Bearer <JWT>` |
| `Content-Type` | Sim | `application/json` |
| `Accept` | Não | `application/json` (padrão) |
| `Accept-Language` | Não | `pt-BR`, `en-US`, `es-ES` |
| `X-Request-Id` | Não | UUID para correlacionar logs (se ausente, backend gera) |
| `X-Idempotency-Key` | Não (recomendado em POST) | UUID para garantir idempotência em 24h |
| `X-Orion-Admin-Mode` | Não | `true` para bypass cross-tenant (admin master) |
| `User-Agent` | Recomendado | Identificação do cliente |

### Response headers (enviados pelo servidor)

| Header | Descrição |
|--------|-----------|
| `X-Request-Id` | UUID do request (para suporte) |
| `X-RateLimit-Limit` | Limite do plano |
| `X-RateLimit-Remaining` | Requests restantes na janela |
| `X-RateLimit-Reset` | Timestamp de reset (epoch) |
| `X-Total-Count` | Total de registros (em listagens) |
| `X-Page-Count` | Total de páginas |
| `Deprecation` | `true` se endpoint deprecado |
| `Sunset` | Data de remoção |
| `Link` | URL da versão sucessora |

## 2.6 Paginação

Endpoints de listagem suportam:

| Parâmetro | Tipo | Default | Máximo | Descrição |
|-----------|------|---------|--------|-----------|
| `page` | integer | 1 | — | Página atual (1-indexed) |
| `limit` | integer | 20 | 100 | Itens por página |
| `sort` | string | `created_at:desc` | — | `campo:direção` (multi: separar por vírgula) |
| `fields` | string | — | — | Sparse fieldsets: `id,name,email` |
| `include` | string | — | — | Expansão de relacionamentos |
| `filter` | string | — | — | Filtro avançado (ver Capítulo 4) |

### Response de listagem (padrão)

```json
{
  "data": [
    { "id": 1, "name": "João Silva" },
    { "id": 2, "name": "Maria Souza" }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "requestId": "req_abc123",
    "timestamp": "2025-08-15T14:30:00Z"
  },
  "links": {
    "self": "/v1/users?page=1&limit=20",
    "first": "/v1/users?page=1&limit=20",
    "prev": null,
    "next": "/v1/users?page=2&limit=20",
    "last": "/v1/users?page=8&limit=20"
  }
}
```

### Headers de paginação

```
X-Total-Count: 145
X-Page-Count: 8
Link: <https://api.orion.com/v1/users?page=2&limit=20>; rel="next",
      <https://api.orion.com/v1/users?page=8&limit=20>; rel="last"
```

## 2.7 Códigos HTTP Utilizados

| Código | Significado | Uso típico |
|--------|-------------|------------|
| 200 | OK | Sucesso em GET, PUT, PATCH |
| 201 | Created | Sucesso em POST que cria recurso |
| 202 | Accepted | Request aceito para processamento assíncrono |
| 204 | No Content | Sucesso em DELETE, sem body |
| 302 | Found | Redirect temporário (raro) |
| 304 | Not Modified | Cache condicional via `If-None-Match` |
| 400 | Bad Request | Sintaxe inválida, payload malformado |
| 401 | Unauthorized | Token ausente, expirado ou inválido |
| 403 | Forbidden | Autenticado, mas sem permissão |
| 404 | Not Found | Recurso não existe ou fora do escopo da empresa |
| 405 | Method Not Allowed | Verbo não suportado para o endpoint |
| 409 | Conflict | Estado inválido (ex.: email duplicado) |
| 410 | Gone | Recurso removido permanentemente |
| 412 | Precondition Failed | `If-Match` / `If-Unmodified-Since` falhou |
| 413 | Payload Too Large | Body excede 1 MB |
| 415 | Unsupported Media Type | Content-Type não suportado |
| 422 | Unprocessable Entity | Validação semântica (ex.: meta negativa) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro não tratado no servidor |
| 502 | Bad Gateway | Upstream inválido |
| 503 | Service Unavailable | Manutenção ou overload |
| 504 | Gateway Timeout | Timeout no upstream |

## 2.8 Estrutura de Erro

Todos os erros seguem **RFC 7807** (Problem Details) com extensões:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "rule": "unique",
        "message": "E-mail já cadastrado"
      },
      {
        "field": "phone",
        "rule": "format",
        "message": "Telefone deve ter formato (XX) XXXXX-XXXX"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2025-08-15T14:30:00Z",
    "documentation": "https://docs.orion.com/api/errors#VALIDATION_ERROR"
  }
}
```

### Campos do erro

| Campo | Tipo | Sempre presente | Descrição |
|-------|------|-----------------|-----------|
| `code` | string | Sim | Código de erro padronizado (ver Capítulo 3) |
| `message` | string | Sim | Mensagem humana legível em pt-BR |
| `details[]` | array | Não | Detalhes por campo (em erros de validação) |
| `requestId` | string | Sim | Para rastreamento em logs/suporte |
| `timestamp` | string | Sim | ISO 8601 UTC |
| `documentation` | string | Não | URL para docs do erro específico |
| `retryAfter` | integer | Não | Segundos para retry (em 429) |
| `traceId` | string | Não | OpenTelemetry trace ID (se habilitado) |

---

# Capítulo 3 — Catálogo de Erros Padronizados

## 3.1 Erros de Autenticação (4xx)

| Code | HTTP | Mensagem padrão | Descrição |
|------|------|------------------|-----------|
| `UNAUTHORIZED` | 401 | Token não fornecido | Header `Authorization` ausente |
| `INVALID_TOKEN` | 401 | Token inválido | JWT malformado, assinatura inválida |
| `EXPIRED_TOKEN` | 401 | Token expirado | `exp` no passado |
| `REVOKED_TOKEN` | 401 | Token revogado | Logout realizado |
| `TENANT_MISMATCH` | 401 | Empresa não corresponde | `company_id` incompatível |
| `2FA_REQUIRED` | 401 | Autenticação 2FA necessária | Login exige TOTP |
| `INVALID_TOTP` | 401 | Código TOTP inválido | 2FA com código errado |
| `ACCOUNT_LOCKED` | 401 | Conta bloqueada | 5 tentativas falhas |
| `ACCOUNT_INACTIVE` | 401 | Conta inativa | Usuário desativado |
| `SSO_REQUIRED` | 401 | Login via SSO obrigatório | Política da empresa |

### Exemplo: 401 INVALID_TOKEN

```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token inválido",
    "requestId": "req_9f2a8c",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

## 3.2 Erros de Autorização (403)

| Code | HTTP | Mensagem padrão |
|------|------|------------------|
| `FORBIDDEN` | 403 | Acesso negado |
| `INSUFFICIENT_SCOPE` | 403 | Permissão insuficiente |
| `ROLE_NOT_ALLOWED` | 403 | Papel não autorizado a esta operação |
| `BRANCH_ACCESS_DENIED` | 403 | Acesso à filial negado |
| `LICENSE_RESTRICTED` | 403 | Plano não inclui este recurso |
| `READ_ONLY_MODE` | 403 | Ambiente em modo somente leitura |

### Exemplo: 403 INSUFFICIENT_SCOPE

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "Permissão insuficiente",
    "details": [
      {
        "required": "users:write",
        "granted": ["users:read"]
      }
    ],
    "requestId": "req_7b1e3d",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

## 3.3 Erros de Recurso (404, 410)

| Code | HTTP | Mensagem padrão |
|------|------|------------------|
| `RESOURCE_NOT_FOUND` | 404 | Recurso não encontrado |
| `ENDPOINT_NOT_FOUND` | 404 | Endpoint não existe |
| `RECORD_NOT_FOUND` | 404 | Registro não existe ou foi removido |
| `TENANT_RESOURCE_NOT_FOUND` | 404 | Recurso não pertence à empresa |
| `RESOURCE_GONE` | 410 | Recurso removido permanentemente |

### Exemplo: 404 RECORD_NOT_FOUND

```json
{
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "Usuário 999 não encontrado",
    "details": [
      {
        "resource": "User",
        "id": 999
      }
    ],
    "requestId": "req_4c8f2a",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

## 3.4 Erros de Validação (400, 422)

| Code | HTTP | Mensagem padrão |
|------|------|------------------|
| `VALIDATION_ERROR` | 422 | Dados inválidos |
| `INVALID_PAYLOAD` | 400 | JSON malformado |
| `MISSING_REQUIRED_FIELD` | 400 | Campo obrigatório ausente |
| `INVALID_FORMAT` | 422 | Formato inválido (email, CPF, etc.) |
| `INVALID_ENUM` | 422 | Valor fora do enum permitido |
| `VALUE_OUT_OF_RANGE` | 422 | Valor fora do intervalo permitido |
| `STRING_TOO_LONG` | 422 | String excede tamanho máximo |
| `DATE_INVALID` | 422 | Data inválida ou fora do período |
| `DUPLICATE_FIELD` | 409 | Campo único duplicado |
| `FOREIGN_KEY_VIOLATION` | 422 | Referência inexistente |
| `BUSINESS_RULE_VIOLATION` | 422 | Regra de negócio violada |
| `CONCURRENT_MODIFICATION` | 409 | Modificação concorrente (ETag mismatch) |
| `STATE_TRANSITION_INVALID` | 409 | Transição de estado não permitida |
| `LICENSE_LIMIT_EXCEEDED` | 422 | Limite da licença excedido |

### Exemplo: 422 VALIDATION_ERROR

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "rule": "email",
        "message": "E-mail em formato inválido"
      },
      {
        "field": "age",
        "rule": "min",
        "value": 16,
        "message": "Idade deve ser maior ou igual a 18"
      }
    ],
    "requestId": "req_a1b2c3",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Exemplo: 409 DUPLICATE_FIELD

```json
{
  "error": {
    "code": "DUPLICATE_FIELD",
    "message": "E-mail já cadastrado",
    "details": [
      {
        "field": "email",
        "value": "joao@empresa.com",
        "conflictingId": 42
      }
    ],
    "requestId": "req_d4e5f6",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Exemplo: 422 LICENSE_LIMIT_EXCEEDED

```json
{
  "error": {
    "code": "LICENSE_LIMIT_EXCEEDED",
    "message": "Limite de usuários da licença excedido",
    "details": [
      {
        "limit": 50,
        "current": 50,
        "resource": "users",
        "plan": "professional"
      }
    ],
    "requestId": "req_g7h8i9",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

## 3.5 Erros de Estado (409)

| Code | HTTP | Mensagem padrão |
|------|------|------------------|
| `CONFLICT` | 409 | Conflito de estado |
| `DUPLICATE_FIELD` | 409 | Campo único duplicado |
| `CONCURRENT_MODIFICATION` | 409 | Modificação concorrente |
| `STATE_TRANSITION_INVALID` | 409 | Transição de estado inválida |
| `CAMPAIGN_ALREADY_ACTIVE` | 409 | Campanha já está ativa |
| `RESULT_ALREADY_APPROVED` | 409 | Resultado já aprovado |

### Exemplo: 409 STATE_TRANSITION_INVALID

```json
{
  "error": {
    "code": "STATE_TRANSITION_INVALID",
    "message": "Transição de estado não permitida",
    "details": [
      {
        "entity": "Campaign",
        "id": 12,
        "from": "ended",
        "to": "active",
        "allowed": ["archived"]
      }
    ],
    "requestId": "req_j1k2l3",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

## 3.6 Erros de Rate Limit (429)

| Code | HTTP | Mensagem padrão |
|------|------|------------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Limite de requests excedido |
| `QUOTA_EXCEEDED` | 429 | Cota mensal excedida |
| `CONCURRENT_REQUEST_LIMIT` | 429 | Muitas requisições concorrentes |

### Exemplo: 429 RATE_LIMIT_EXCEEDED

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de 60 requests por minuto excedido",
    "retryAfter": 45,
    "details": [
      {
        "limit": 60,
        "window": "60s",
        "resetAt": "2025-08-15T14:31:00Z"
      }
    ],
    "requestId": "req_m4n5o6",
    "timestamp": "2025-08-15T14:30:15Z"
  }
}
```

## 3.7 Erros de Servidor (5xx)

| Code | HTTP | Mensagem padrão |
|------|------|------------------|
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |
| `DATABASE_ERROR` | 500 | Erro de banco de dados |
| `UPSTREAM_ERROR` | 502 | Erro em serviço upstream |
| `SERVICE_UNAVAILABLE` | 503 | Serviço indisponível |
| `GATEWAY_TIMEOUT` | 504 | Timeout de gateway |
| `MAINTENANCE_MODE` | 503 | Sistema em manutenção |

### Exemplo: 500 INTERNAL_ERROR

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erro interno do servidor",
    "requestId": "req_p7q8r9",
    "timestamp": "2025-08-15T14:30:00Z",
    "traceId": "trace_xyz789"
  }
}
```

---

# Capítulo 4 — Paginação, Filtros, Ordenação e Expansão

## 4.1 Paginação Detalhada

Conforme Capítulo 2.6. A paginação é 1-indexed. Exemplos:

- Primeira página de 50 itens: `?page=1&limit=50`
- Página 3 com 25 itens: `?page=3&limit=25`
- Última página conhecida: `?page=8&limit=20`

### Cursor-based pagination (opcional)

Para datasets muito grandes (>100k registros), endpoints de auditoria e logs suportam cursor:

```
GET /v1/audit-logs?cursor=eyJpZCI6MTIzNDV9&limit=100
```

```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "limit": 100,
      "hasNext": true,
      "nextCursor": "eyJpZCI6MTI0NDV9",
      "hasPrev": false,
      "prevCursor": null
    }
  }
}
```

## 4.2 Filtros Avançados

Filtros usam sintaxe **RSQL-inspired** com operadores:

| Operador | Significado | Exemplo |
|----------|-------------|---------|
| `eq` | Igual | `name=eq:João` |
| `ne` | Diferente | `status=ne:inactive` |
| `gt` | Maior que | `value=gt:1000` |
| `gte` | Maior ou igual | `value=gte:1000` |
| `lt` | Menor que | `value=lt:5000` |
| `lte` | Menor ou igual | `value=lte:5000` |
| `in` | Em lista | `id=in:1,2,3,5` |
| `nin` | Não em lista | `id=nin:10,20` |
| `like` | Substring | `name=like:Silva` |
| `ilike` | Substring case-insensitive | `name=ilike:silva` |
| `startswith` | Prefixo | `name=startswith:Jo` |
| `endswith` | Sufixo | `email=endswith:@empresa.com` |
| `between` | Intervalo inclusivo | `value=between:1000,5000` |
| `isnull` | É nulo | `deletedAt=isnull:true` |
| `isnotnull` | Não é nulo | `managerId=isnotnull:true` |

### Sintaxe

Filtros são combinados na query string:

```
GET /v1/users?filter=status=eq:active AND branchId=in:1,2&filter=createdAt=gte:2025-01-01
```

Ou agrupados em um único parâmetro:

```
GET /v1/users?filter=(status=eq:active;branchId=in:1,2,3);createdAt=gte:2025-01-01
```

Operadores lógicos: `AND` (`;` ou `AND`), `OR` (`,` ou `OR`).

### Exemplos práticos

1. **Vendedores ativos das filiais 1 e 2:**
   ```
   GET /v1/users?filter=status=eq:active;roleId=eq:5;branchId=in:1,2
   ```

2. **Metas com valor entre 10k e 50k criadas em 2025:**
   ```
   GET /v1/goals?filter=targetValue=between:10000,50000;createdAt=gte:2025-01-01
   ```

3. **Usuários cujo email termina com @empresa.com e não estão inativos:**
   ```
   GET /v1/users?filter=email=endswith:@empresa.com;status=ne:inactive
   ```

4. **Resultados pendentes de aprovação em julho/2025:**
   ```
   GET /v1/results?filter=approved=isnull:true;resultDate=between:2025-07-01,2025-07-31
   ```

## 4.3 Ordenação

Parâmetro `sort` aceita um ou mais campos separados por vírgula, cada um com direção:

- `sort=name:asc` — ascendente
- `sort=createdAt:desc` — descendente
- `sort=branchId:asc,name:asc` — multi-campo

### Campos ordenáveis por entidade

| Entidade | Campos ordenáveis |
|----------|-------------------|
| User | `id`, `name`, `email`, `createdAt`, `lastLoginAt` |
| Branch | `id`, `name`, `code`, `createdAt` |
| Indicator | `id`, `name`, `weight`, `createdAt` |
| Goal | `id`, `targetValue`, `startDate`, `endDate`, `createdAt` |
| Result | `id`, `value`, `resultDate`, `createdAt` |
| Campaign | `id`, `name`, `startDate`, `endDate`, `status` |
| AuditLog | `id`, `createdAt`, `action`, `tableName` |

## 4.4 Expansão de Relacionamentos (`include`)

Por padrão, respostas retornam apenas IDs de relacionados. Use `include` para embeddar:

```
GET /v1/users/10?include=branch,role,company
```

```json
{
  "data": {
    "id": 10,
    "name": "João Silva",
    "email": "joao@empresa.com",
    "branchId": 1,
    "branch": {
      "id": 1,
      "name": "Loja Centro"
    },
    "roleId": 5,
    "role": {
      "id": 5,
      "name": "vendedor",
      "permissions": ["results:read", "results:write"]
    },
    "companyId": 1,
    "company": {
      "id": 1,
      "name": "Perfumes ABC Ltda"
    }
  }
}
```

### Includes aninhados

```
GET /v1/goals?include=user.branch,indicator.category
```

### Limite de includes

Máximo de 5 relacionamentos por request. Acima disso, retorna `400 VALIDATION_ERROR`.

## 4.5 Sparse Fieldsets (`fields`)

Para reduzir payload, selecione apenas os campos necessários:

```
GET /v1/users?fields=id,name,email
```

```json
{
  "data": [
    { "id": 1, "name": "João Silva", "email": "joao@empresa.com" },
    { "id": 2, "name": "Maria Souza", "email": "maria@empresa.com" }
  ]
}
```

## 4.6 Idempotência

Em POST/PUT que criam ou alteram estado, envie `Idempotency-Key`:

```
POST /v1/results
Idempotency-Key: 7c8d9e0f-1234-5678-9abc-def012345678
Content-Type: application/json

{ "userId": 10, "indicatorId": 3, ... }
```

A chave é armazenada por 24h. Re-requests com mesma chave retornam a resposta original (mesmo status e body).

```json
{
  "data": { "id": 42, "value": 1250.50, ... },
  "meta": {
    "idempotent": true,
    "originalRequestId": "req_abc123"
  }
}
```

## 4.7 Concorrência Otimista (ETag)

Endpoints que retornam recurso único incluem header `ETag`:

```
ETag: "v3-1692124200"
```

Em atualizações, envie `If-Match` para garantir que ninguém alterou o recurso:

```
PUT /v1/users/10
If-Match: "v3-1692124200"
```

Se ETag não bater:

```json
{
  "error": {
    "code": "CONCURRENT_MODIFICATION",
    "message": "Recurso modificado por outro cliente",
    "details": [
      {
        "currentETag": "v4-1692124500",
        "providedETag": "v3-1692124200",
        "modifiedBy": "usr_42",
        "modifiedAt": "2025-08-15T14:35:00Z"
      }
    ]
  }
}
```

---

# Capítulo 5 — Schemas de Entidades

Esta seção define os schemas JSON completos de cada entidade. Estes schemas são referenciados nos exemplos de request/response dos capítulos seguintes.

## 5.1 User

```json
{
  "id": 10,
  "uuid": "usr_10a3f8c2",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "phone": "(11) 98765-4321",
  "document": "123.456.789-00",
  "avatarUrl": "https://cdn.orion.com/avatars/usr_10.png",
  "status": "active",
  "branchId": 1,
  "roleId": 5,
  "companyId": 1,
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo",
  "twoFactorEnabled": false,
  "emailVerifiedAt": "2025-01-15T10:00:00Z",
  "lastLoginAt": "2025-08-15T13:45:00Z",
  "lastLoginIp": "200.150.10.20",
  "loginCount": 145,
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-08-15T13:45:00Z",
  "createdBy": 1,
  "deletedAt": null
}
```

### Schema

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | integer | sim | Identificador único |
| `uuid` | string | sim | UUID público `usr_*` |
| `name` | string(120) | sim | Nome completo |
| `email` | string(email) | sim | E-mail único na empresa |
| `phone` | string | não | Telefone formatado |
| `document` | string | não | CPF/CNPJ |
| `avatarUrl` | string(url) | não | URL do avatar |
| `status` | enum | sim | `active`, `inactive`, `locked`, `pending` |
| `branchId` | integer | não | Filial principal |
| `roleId` | integer | sim | Papel |
| `companyId` | integer | sim | Empresa (do JWT) |
| `language` | string | não | `pt-BR` (default), `en-US`, `es-ES` |
| `timezone` | string | não | IANA timezone |
| `twoFactorEnabled` | boolean | sim | 2FA ativo |
| `emailVerifiedAt` | datetime | não | Verificação de email |
| `lastLoginAt` | datetime | não | Último login |
| `lastLoginIp` | string | não | IP do último login |
| `loginCount` | integer | sim | Total de logins |
| `createdAt` | datetime | sim | Criação |
| `updatedAt` | datetime | sim | Última atualização |
| `createdBy` | integer | sim | Criado por |
| `deletedAt` | datetime | não | Soft delete |

## 5.2 Company

```json
{
  "id": 1,
  "uuid": "cmp_1f8a3c2e",
  "name": "Perfumes ABC Ltda",
  "legalName": "Perfumes ABC Comércio Ltda",
  "document": "12.345.678/0001-90",
  "email": "contato@perfumesabc.com.br",
  "phone": "(11) 3333-1000",
  "website": "https://www.perfumesabc.com.br",
  "logoUrl": "https://cdn.orion.com/logos/cmp_1.png",
  "plan": "professional",
  "status": "active",
  "timezone": "America/Sao_Paulo",
  "language": "pt-BR",
  "address": {
    "zipCode": "01000-000",
    "street": "Rua Augusta",
    "number": "100",
    "complement": "Sala 201",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "country": "BR"
  },
  "settings": {
    "fiscalYearStart": "01-01",
    "currency": "BRL",
    "dateFormat": "DD/MM/YYYY",
    "workingDays": [1, 2, 3, 4, 5],
    "workingHours": { "start": "08:00", "end": "18:00" }
  },
  "licenseId": 1,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-08-15T14:00:00Z"
}
```

## 5.3 Branch

```json
{
  "id": 1,
  "uuid": "brn_1a2b3c4d",
  "code": "LOJA-001",
  "name": "Loja Centro",
  "companyId": 1,
  "managerId": 5,
  "phone": "(11) 3333-4444",
  "email": "centro@perfumesabc.com.br",
  "address": {
    "zipCode": "01000-000",
    "street": "Rua Augusta",
    "number": "100",
    "complement": "",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "country": "BR",
    "lat": -23.5505,
    "lng": -46.6333
  },
  "status": "active",
  "operatingHours": {
    "monday": { "open": "08:00", "close": "18:00" },
    "tuesday": { "open": "08:00", "close": "18:00" },
    "wednesday": { "open": "08:00", "close": "18:00" },
    "thursday": { "open": "08:00", "close": "18:00" },
    "friday": { "open": "08:00", "close": "18:00" },
    "saturday": { "open": "08:00", "close": "14:00" },
    "sunday": null
  },
  "userCount": 12,
  "createdAt": "2025-01-05T10:00:00Z",
  "updatedAt": "2025-08-10T15:30:00Z",
  "deletedAt": null
}
```

## 5.4 Role

```json
{
  "id": 5,
  "uuid": "rol_5c8e2f1a",
  "name": "vendedor",
  "label": "Vendedor",
  "description": "Vendedor de loja com acesso a lançar resultados",
  "companyId": 1,
  "scope": "branch",
  "isSystem": false,
  "permissions": [
    "results:read",
    "results:write",
    "indicators:read",
    "goals:read",
    "rankings:read",
    "dashboards:read",
    "notifications:read"
  ],
  "userCount": 24,
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-02-15T11:00:00Z"
}
```

## 5.5 Permission

```json
{
  "code": "users:write",
  "label": "Criar/Editar Usuários",
  "description": "Permite criar, editar e desativar usuários",
  "module": "users",
  "action": "write",
  "resource": "User",
  "isSystem": true
}
```

### Catálogo de Permissões

| Code | Label | Módulo |
|------|-------|--------|
| `users:read` | Listar usuários | users |
| `users:write` | Criar/editar usuários | users |
| `users:delete` | Desativar usuários | users |
| `branches:read` | Listar filiais | branches |
| `branches:write` | Criar/editar filiais | branches |
| `branches:delete` | Desativar filiais | branches |
| `roles:read` | Listar papéis | roles |
| `roles:write` | Criar/editar papéis | roles |
| `roles:delete` | Remover papéis | roles |
| `indicators:read` | Listar indicadores | indicators |
| `indicators:write` | Criar/editar indicadores | indicators |
| `indicators:delete` | Desativar indicadores | indicators |
| `goals:read` | Listar metas | goals |
| `goals:write` | Criar/editar metas | goals |
| `goals:delete` | Remover metas | goals |
| `results:read` | Listar resultados | results |
| `results:write` | Lançar resultados | results |
| `results:approve` | Aprovar/rejeitar resultados | results |
| `results:delete` | Excluir resultados | results |
| `campaigns:read` | Listar campanhas | campaigns |
| `campaigns:write` | Criar/editar campanhas | campaigns |
| `campaigns:delete` | Remover campanhas | campaigns |
| `rankings:read` | Ver rankings | rankings |
| `dashboards:read` | Ver dashboards | dashboards |
| `dashboards:write` | Editar dashboards | dashboards |
| `notifications:read` | Ver notificações | notifications |
| `audit:read` | Ver auditoria | audit |
| `license:read` | Ver licença | license |
| `license:write` | Ativar/renovar licença | license |
| `webhooks:read` | Listar webhooks | webhooks |
| `webhooks:write` | Gerenciar webhooks | webhooks |
| `company:write` | Editar empresa | company |

## 5.6 IndicatorCategory

```json
{
  "id": 2,
  "uuid": "ic_2b3c4d5e",
  "name": "Vendas",
  "label": "Vendas",
  "description": "Indicadores de venda",
  "icon": "shopping-cart",
  "color": "#10B981",
  "companyId": 1,
  "indicatorCount": 8,
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-10T08:00:00Z"
}
```

## 5.7 Indicator

```json
{
  "id": 3,
  "uuid": "ind_3d4e5f6g",
  "name": "Venda de Perfumes",
  "description": "Receita total com vendas de perfumes",
  "type": "currency",
  "categoryId": 2,
  "icon": "flower",
  "color": "#9333EA",
  "unit": "BRL",
  "decimalPlaces": 2,
  "formula": "SUM(sale_items.value WHERE category = 'perfume')",
  "aggregation": "sum",
  "direction": "higher_better",
  "weight": 1.5,
  "targetDefault": 10000,
  "minValue": 0,
  "maxValue": null,
  "showDashboard": true,
  "showRanking": true,
  "showReports": true,
  "isSystem": false,
  "status": "active",
  "version": 3,
  "companyId": 1,
  "createdBy": 1,
  "createdAt": "2025-01-15T09:00:00Z",
  "updatedAt": "2025-08-01T10:00:00Z",
  "deletedAt": null
}
```

### Enum `type`

| Valor | Descrição | Exemplo de value |
|-------|-----------|------------------|
| `currency` | Valor monetário | `1250.50` |
| `number` | Número inteiro | `42` |
| `decimal` | Número decimal | `3.14` |
| `percentage` | Percentual (0-100) | `85.5` |
| `time` | Duração em segundos | `3600` |
| `boolean` | Verdadeiro/falso | `true` |
| `rating` | Nota (1-5 ou 1-10) | `4.5` |

### Enum `direction`

| Valor | Descrição |
|-------|-----------|
| `higher_better` | Maior é melhor |
| `lower_better` | Menor é melhor |
| `target_value` | Meta exata (desvio penaliza) |

## 5.8 Goal

```json
{
  "id": 42,
  "uuid": "gol_42e7f8a9",
  "scope": "user",
  "userId": 10,
  "branchId": 1,
  "indicatorId": 3,
  "goalType": "monthly",
  "startDate": "2025-08-01",
  "endDate": "2025-08-31",
  "targetValue": 30000,
  "minValue": 0,
  "weight": 1.0,
  "status": "active",
  "progress": 41.68,
  "currentValue": 12500.50,
  "achievementPercent": 41.68,
  "notes": "Meta de faturamento de agosto",
  "approved": true,
  "approvedBy": 1,
  "approvedAt": "2025-08-01T10:00:00Z",
  "companyId": 1,
  "createdBy": 1,
  "createdAt": "2025-07-25T14:00:00Z",
  "updatedAt": "2025-08-15T08:00:00Z"
}
```

### Enum `scope`

| Valor | Descrição |
|-------|-----------|
| `user` | Meta individual |
| `branch` | Meta da filial |
| `company` | Meta da empresa |
| `team` | Meta de equipe (custom) |

### Enum `goalType`

| Valor | Descrição |
|-------|-----------|
| `daily` | Diária |
| `weekly` | Semanal |
| `monthly` | Mensal |
| `quarterly` | Trimestral |
| `yearly` | Anual |
| `custom` | Período customizado |

### Enum `status`

| Valor | Descrição |
|-------|-----------|
| `draft` | Rascunho |
| `pending` | Pendente de aprovação |
| `active` | Ativa |
| `paused` | Pausada |
| `completed` | Concluída |
| `cancelled` | Cancelada |
| `failed` | Não atingida |

## 5.9 Result

```json
{
  "id": 1001,
  "uuid": "res_1001f8a9",
  "userId": 10,
  "branchId": 1,
  "indicatorId": 3,
  "goalId": 42,
  "resultDate": "2025-08-15",
  "value": 1250.50,
  "previousValue": 0,
  "accumulatedValue": 12500.50,
  "notes": "Vendas da manhã — 8 perfumes vendidos",
  "attachments": [
    {
      "id": "file_abc123",
      "filename": "comprovante.pdf",
      "size": 245678,
      "mimeType": "application/pdf",
      "url": "https://cdn.orion.com/files/file_abc123.pdf"
    }
  ],
  "source": "manual",
  "status": "pending",
  "approved": null,
  "approvedBy": null,
  "approvedAt": null,
  "rejectionReason": null,
  "companyId": 1,
  "createdBy": 10,
  "createdAt": "2025-08-15T11:30:00Z",
  "updatedAt": "2025-08-15T11:30:00Z"
}
```

### Enum `source`

| Valor | Descrição |
|-------|-----------|
| `manual` | Lançamento manual |
| `import` | Importação CSV |
| `api` | Integração via API |
| `erp` | Sincronização com ERP |
| `ai_estimate` | Estimativa AI |

### Enum `status`

| Valor | Descrição |
|-------|-----------|
| `pending` | Aguardando aprovação |
| `approved` | Aprovado |
| `rejected` | Rejeitado |
| `auto_approved` | Aprovado automaticamente |

## 5.10 Campaign

```json
{
  "id": 12,
  "uuid": "cmp_12a9b8c7",
  "name": "Campanha Dia dos Pais",
  "description": "Quem vender mais perfumes no Dia dos Pais ganha",
  "objective": "Aumentar venda de perfumes",
  "startDate": "2025-08-01",
  "endDate": "2025-08-10",
  "status": "active",
  "type": "ranking",
  "rules": {
    "indicators": [
      { "id": 3, "weight": 1.0 },
      { "id": 5, "weight": 0.5 }
    ],
    "target": "max",
    "minParticipants": 3,
    "tiebreak": "highest_single_day"
  },
  "participantIds": [10, 11, 12, 13],
  "participantCount": 4,
  "branchIds": [1, 2],
  "companyId": 1,
  "createdBy": 1,
  "createdAt": "2025-07-20T10:00:00Z",
  "updatedAt": "2025-08-01T00:00:00Z",
  "startedAt": "2025-08-01T00:00:00Z",
  "endedAt": null
}
```

### Enum `status`

| Valor | Descrição |
|-------|-----------|
| `draft` | Rascunho |
| `scheduled` | Agendada |
| `active` | Ativa |
| `paused` | Pausada |
| `ended` | Encerrada |
| `archived` | Arquivada |
| `cancelled` | Cancelada |

## 5.11 Award

```json
{
  "id": 25,
  "uuid": "awd_25c8d7e6",
  "campaignId": 12,
  "position": 1,
  "title": "1º Lugar — Dia dos Pais",
  "description": "Voucher de R$ 500 + Troféu",
  "type": "voucher",
  "value": 500.00,
  "currency": "BRL",
  "imageUrl": "https://cdn.orion.com/awards/voucher500.png",
  "metadata": {
    "partner": "Amazon",
    "expiryDays": 90,
    "redeemInstructions": "Acesse: https://..."
  },
  "winnerUserId": null,
  "awardedAt": null,
  "companyId": 1,
  "createdAt": "2025-07-20T10:30:00Z",
  "updatedAt": "2025-07-20T10:30:00Z"
}
```

### Enum `type`

| Valor | Descrição |
|-------|-----------|
| `voucher` | Vale-compras |
| `cash` | Dinheiro/bônus |
| `product` | Produto físico |
| `experience` | Experiência (viagem, jantar) |
| `points` | Pontos internos |
| `recognition` | Reconhecimento (badge, troféu) |
| `custom` | Customizado |

## 5.12 Ranking

```json
{
  "position": 1,
  "previousPosition": 2,
  "userId": 10,
  "userName": "João Silva",
  "userAvatar": "https://cdn.orion.com/avatars/usr_10.png",
  "branchId": 1,
  "branchName": "Loja Centro",
  "score": 12500.50,
  "goalAchievement": 125.5,
  "trend": "up",
  "trendValue": 1,
  "results": [
    {
      "indicatorId": 3,
      "indicatorName": "Venda de Perfumes",
      "value": 12500.50,
      "goal": 10000,
      "achievement": 125.5
    }
  ],
  "period": {
    "start": "2025-08-01",
    "end": "2025-08-31"
  },
  "campaignId": null
}
```

## 5.13 Dashboard

```json
{
  "id": 5,
  "uuid": "dsh_5d6e7f8a",
  "name": "Dashboard Comercial",
  "description": "Visão geral de vendas por filial",
  "type": "company",
  "ownerId": 1,
  "isDefault": true,
  "isShared": false,
  "layout": "grid",
  "columns": 3,
  "background": "light",
  "companyId": 1,
  "widgetCount": 6,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-08-10T15:00:00Z"
}
```

## 5.14 Widget

```json
{
  "id": 22,
  "uuid": "wdg_22e7f8a9",
  "dashboardId": 5,
  "type": "line_chart",
  "title": "Vendas Diárias",
  "subtitle": "Últimos 30 dias",
  "position": { "x": 0, "y": 0, "w": 2, "h": 1 },
  "config": {
    "indicatorId": 3,
    "period": "30d",
    "aggregation": "daily",
    "color": "#9333EA",
    "showGoal": true,
    "showTrend": true
  },
  "dataLastUpdated": "2025-08-15T14:00:00Z",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-08-15T14:00:00Z"
}
```

### Enum `type` (Widget)

| Valor | Descrição |
|-------|-----------|
| `line_chart` | Gráfico de linha |
| `bar_chart` | Gráfico de barras |
| `pie_chart` | Pizza |
| `donut_chart` | Rosca |
| `area_chart` | Área |
| `gauge` | Medidor |
| `kpi_card` | Card de KPI |
| `ranking_table` | Tabela de ranking |
| `leaderboard` | Placar |
| `heatmap` | Mapa de calor |
| `counter` | Contador |
| `progress_bar` | Barra de progresso |

## 5.15 Notification

```json
{
  "id": 999,
  "uuid": "ntf_999a8b7c",
  "userId": 10,
  "type": "goal.achieved",
  "category": "success",
  "priority": "high",
  "title": "Meta atingida! 🎉",
  "message": "Você atingiu 125% da meta de Venda de Perfumes em agosto.",
  "data": {
    "goalId": 42,
    "indicatorId": 3,
    "achievementPercent": 125.5
  },
  "actionUrl": "/goals/42",
  "actionLabel": "Ver meta",
  "read": false,
  "readAt": null,
  "archived": false,
  "archivedAt": null,
  "expiresAt": "2025-09-15T00:00:00Z",
  "companyId": 1,
  "createdAt": "2025-08-15T14:00:00Z"
}
```

## 5.16 AuditLog

```json
{
  "id": 5001,
  "uuid": "aud_5001b6c5",
  "userId": 1,
  "userName": "Admin Master",
  "companyId": 1,
  "action": "update",
  "entity": "User",
  "entityId": 10,
  "entityUuid": "usr_10a3f8c2",
  "tableName": "users",
  "changes": {
    "before": { "roleId": 3, "status": "inactive" },
    "after": { "roleId": 5, "status": "active" }
  },
  "ip": "200.150.10.20",
  "userAgent": "Mozilla/5.0 (Orion-Frontend/1.0)",
  "requestId": "req_abc123",
  "sessionId": "ses_xyz789",
  "metadata": {
    "reason": "Reativação após férias"
  },
  "createdAt": "2025-08-15T14:30:00Z"
}
```

### Enum `action`

| Valor | Descrição |
|-------|-----------|
| `create` | Criação |
| `update` | Atualização |
| `delete` | Soft delete |
| `restore` | Restauração |
| `login` | Login |
| `logout` | Logout |
| `failed_login` | Tentativa falha |
| `export` | Exportação |
| `import` | Importação |
| `approve` | Aprovação |
| `reject` | Rejeição |

## 5.17 License

```json
{
  "id": 1,
  "uuid": "lic_1c2d3e4f",
  "companyId": 1,
  "key": "ORION-PRO-XXXX-XXXX-XXXX-XXXX",
  "plan": "professional",
  "status": "active",
  "maxUsers": 50,
  "maxBranches": 5,
  "maxIndicators": 100,
  "maxDashboards": 20,
  "currentUsers": 32,
  "currentBranches": 3,
  "currentIndicators": 18,
  "currentDashboards": 8,
  "startedAt": "2025-01-01T00:00:00Z",
  "expiresAt": "2026-01-01T00:00:00Z",
  "gracePeriodDays": 7,
  "features": [
    "ai_insights",
    "webhooks",
    "api_access",
    "audit_export",
    "custom_indicators",
    "campaigns_unlimited"
  ],
  "activatedAt": "2025-01-01T00:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-08-01T00:00:00Z"
}
```

### Enum `plan`

| Valor | Users | Branches | Indicators | Requests/min |
|-------|-------|----------|------------|--------------|
| `starter` | 10 | 1 | 20 | 60 |
| `professional` | 50 | 5 | 100 | 300 |
| `enterprise` | 500 | 50 | 1000 | 1000 |
| `custom` | Variável | Variável | Variável | Variável |

## 5.18 Backup

```json
{
  "id": 45,
  "uuid": "bkp_45d3e4f5",
  "companyId": 1,
  "type": "automatic",
  "status": "completed",
  "size": 52428800,
  "sizeFormatted": "50 MB",
  "format": "pg_dump",
  "startedAt": "2025-08-15T02:00:00Z",
  "completedAt": "2025-08-15T02:05:30Z",
  "durationSec": 330,
  "tables": ["users", "branches", "indicators", "goals", "results", "campaigns"],
  "downloadUrl": null,
  "downloadExpiresAt": null,
  "retentionDays": 30,
  "expiresAt": "2025-09-14T02:00:00Z",
  "createdBy": null,
  "createdAt": "2025-08-15T02:00:00Z"
}
```

## 5.19 Webhook

```json
{
  "id": 7,
  "uuid": "web_7e4f5a6b",
  "companyId": 1,
  "url": "https://meuapp.com/webhooks/orion",
  "events": [
    "goal.achieved",
    "result.approved",
    "campaign.started",
    "campaign.ended"
  ],
  "secret": "whsec_abc123def456",
  "isActive": true,
  "headers": {
    "X-Custom-Header": "my-value"
  },
  "metadata": {
    "description": "Integração com CRM interno"
  },
  "stats": {
    "totalSent": 145,
    "totalSuccess": 142,
    "totalFailed": 3,
    "lastSentAt": "2025-08-15T13:50:00Z",
    "lastStatus": 200,
    "lastResponseMs": 124
  },
  "createdAt": "2025-07-01T10:00:00Z",
  "updatedAt": "2025-08-15T13:50:00Z"
}
```

## 5.20 Paginação (meta)

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

# Capítulo 6 — Autenticação

## 6.1 POST /auth/login

Autentica usuário e retorna par `accessToken` + `refreshToken`. Suporta 2FA.

### Request body

```json
{
  "login": "joao@empresa.com",
  "password": "MinhaSenh@123",
  "totpCode": "123456",
  "rememberMe": true,
  "deviceId": "device_abc123"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `login` | string | sim | E-mail ou CPF (3-120 chars) |
| `password` | string | sim | 8-72 chars |
| `totpCode` | string | não | 6 dígitos (obrigatório se 2FA ativo) |
| `rememberMe` | boolean | não | Estende refresh token para 30 dias |
| `deviceId` | string | não | Para rastreamento de sessão |

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "joao@empresa.com",
    "password": "MinhaSenh@123"
  }'
```

### Response 200 OK

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTBhM2Y4YzIiLCJpc3MiOiJvcmlvbi1hdXRoIiwiYXVkIjoi b3Jpb24tYXBpIiwiY29tcGFueV9pZCI6MSwiYnJhbmNoX2lkIjoxLCJyb2xlIjoiYWRtaW4iLCJzY29wZSI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiXSwiaWF0IjoxNjkyMTI0MjAwLCJleHAiOjE2OTIxMjUxMDAsImp0aSI6Imp0aV9hYmMxMjMifQ.signature",
    "refreshToken": "ref_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshExpiresIn": 86400,
    "user": {
      "id": 10,
      "uuid": "usr_10a3f8c2",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "roleId": 5,
      "role": "vendedor",
      "branchId": 1,
      "companyId": 1,
      "twoFactorEnabled": false,
      "avatarUrl": "https://cdn.orion.com/avatars/usr_10.png"
    },
    "permissions": [
      "results:read",
      "results:write",
      "indicators:read",
      "goals:read",
      "rankings:read",
      "dashboards:read",
      "notifications:read"
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 200 com 2FA pendente

Se o usuário tem 2FA ativo e não enviou `totpCode`:

```json
{
  "data": {
    "challenge": "totp_required",
    "challengeToken": "chg_xyz789",
    "expiresIn": 300
  },
  "meta": {
    "requestId": "req_def456",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

Cliente deve reenviar login com `totpCode` e `challengeToken`:

```json
{
  "login": "joao@empresa.com",
  "password": "MinhaSenh@123",
  "totpCode": "123456",
  "challengeToken": "chg_xyz789"
}
```

### Response 400 INVALID_PAYLOAD

```json
{
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "JSON malformado",
    "details": [
      { "field": "password", "rule": "required", "message": "Senha é obrigatória" }
    ],
    "requestId": "req_ghi789",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 401 INVALID_CREDENTIALS

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "E-mail ou senha inválidos",
    "requestId": "req_jkl012",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

> ⚠️ Por segurança, a mensagem não diferencia "usuário não existe" de "senha errada".

### Response 401 ACCOUNT_LOCKED

Após 5 tentativas falhas:

```json
{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Conta bloqueada por 15 minutos após 5 tentativas falhas",
    "details": [
      { "attempts": 5, "unlockAt": "2025-08-15T14:45:00Z" }
    ],
    "requestId": "req_mno345",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 401 2FA_REQUIRED

```json
{
  "error": {
    "code": "2FA_REQUIRED",
    "message": "Autenticação 2FA necessária",
    "details": [
      { "methods": ["totp"] }
    ],
    "requestId": "req_pqr678",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 401 INVALID_TOTP

```json
{
  "error": {
    "code": "INVALID_TOTP",
    "message": "Código TOTP inválido",
    "details": [
      { "attemptsRemaining": 2 }
    ],
    "requestId": "req_stu901",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 429 RATE_LIMIT_EXCEEDED

Login é limitado a 5 tentativas por minuto por IP:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Muitas tentativas de login",
    "retryAfter": 60,
    "requestId": "req_vwx234",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 6.2 POST /auth/refresh

Renova access token usando refresh token válido.

### Request body

```json
{
  "refreshToken": "ref_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567"
}
```

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "ref_abc123..."}'
```

### Response 200 OK

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1Ni...",
    "refreshToken": "ref_new_token_xyz...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "refreshExpiresIn": 86400
  },
  "meta": {
    "requestId": "req_yza567",
    "timestamp": "2025-08-15T14:45:00Z"
  }
}
```

> 🔄 Refresh token é rotacionado: o anterior é invalidado.

### Response 401 INVALID_TOKEN

```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Refresh token inválido ou já utilizado",
    "requestId": "req_bcd890",
    "timestamp": "2025-08-15T14:45:00Z"
  }
}
```

### Response 401 EXPIRED_TOKEN

```json
{
  "error": {
    "code": "EXPIRED_TOKEN",
    "message": "Refresh token expirado. Faça login novamente.",
    "requestId": "req_efg123",
    "timestamp": "2025-08-15T14:45:00Z"
  }
}
```

---

## 6.3 POST /auth/logout

Revoga a sessão atual e invalida o refresh token. Requer `Authorization`.

### Request body

```json
{
  "refreshToken": "ref_abc123...",
  "allDevices": false
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `refreshToken` | string | não | Token a revogar (se omitido, revoga só access) |
| `allDevices` | boolean | não | Revoga todas as sessões do usuário |

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "ref_abc123...", "allDevices": true}'
```

### Response 204 No Content

Sem body. Headers:

```
HTTP/1.1 204 No Content
X-Request-Id: req_hij456
```

### Response 401 UNAUTHORIZED

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token não fornecido",
    "requestId": "req_klm789",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 6.4 POST /auth/forgot-password

Inicia fluxo de recuperação de senha. Envia e-mail com token de reset (válido por 1h).

> 📌 Por segurança, retorna 200 mesmo se o e-mail não existir (evita enumeração).

### Request body

```json
{
  "email": "joao@empresa.com",
  "resetUrl": "https://app.orion.com/reset-password?token={token}"
}
```

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@empresa.com"}'
```

### Response 200 OK

```json
{
  "data": {
    "message": "Se o e-mail existir, você receberá instruções em alguns minutos.",
    "expiresIn": 3600
  },
  "meta": {
    "requestId": "req_nop012",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 429 RATE_LIMIT_EXCEEDED

Máximo 3 requests por hora por e-mail:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Muitas solicitações de recuperação. Tente mais tarde.",
    "retryAfter": 3600,
    "requestId": "req_qrs345",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 6.5 POST /auth/reset-password

Reset de senha usando token recebido por e-mail.

### Request body

```json
{
  "token": "rst_abc123def456ghi789",
  "password": "NovaSenh@Forte123",
  "passwordConfirmation": "NovaSenh@Forte123"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `token` | string | sim | Token de reset (recebido por e-mail) |
| `password` | string | sim | 8-72 chars, 1 maiúscula, 1 número, 1 especial |
| `passwordConfirmation` | string | sim | Deve bater com `password` |

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "rst_abc123...",
    "password": "NovaSenh@Forte123",
    "passwordConfirmation": "NovaSenh@Forte123"
  }'
```

### Response 200 OK

```json
{
  "data": {
    "message": "Senha atualizada com sucesso. Faça login.",
    "revokedSessions": 3
  },
  "meta": {
    "requestId": "req_tuv678",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 400 VALIDATION_ERROR

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Senha não atende aos requisitos",
    "details": [
      {
        "field": "password",
        "rule": "min",
        "message": "Senha deve ter no mínimo 8 caracteres"
      },
      {
        "field": "password",
        "rule": "uppercase",
        "message": "Senha deve conter ao menos 1 letra maiúscula"
      }
    ],
    "requestId": "req_wxy901",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 422 BUSINESS_RULE_VIOLATION

Senha já utilizada anteriormente:

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Senha já utilizada nas últimas 5 alterações",
    "requestId": "req_zab234",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 404 RECORD_NOT_FOUND

Token inválido ou expirado:

```json
{
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "Token inválido ou expirado",
    "requestId": "req_cde567",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 6.6 GET /auth/me

Retorna dados do usuário autenticado + contexto (empresa, filial, papel, permissões).

### Exemplo curl

```bash
curl -X GET https://api.orion.suaempresa.com/v1/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

### Parâmetros de query

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `include` | string | — | Expandir `company`, `branch`, `role`, `permissions` |

### Response 200 OK

```json
{
  "data": {
    "id": 10,
    "uuid": "usr_10a3f8c2",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "(11) 98765-4321",
    "document": "123.456.789-00",
    "avatarUrl": "https://cdn.orion.com/avatars/usr_10.png",
    "status": "active",
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "twoFactorEnabled": false,
    "lastLoginAt": "2025-08-15T13:45:00Z",
    "roleId": 5,
    "role": {
      "id": 5,
      "name": "vendedor",
      "label": "Vendedor"
    },
    "branchId": 1,
    "branch": {
      "id": 1,
      "name": "Loja Centro",
      "code": "LOJA-001"
    },
    "companyId": 1,
    "company": {
      "id": 1,
      "name": "Perfumes ABC Ltda",
      "plan": "professional",
      "logoUrl": "https://cdn.orion.com/logos/cmp_1.png"
    },
    "permissions": [
      "results:read",
      "results:write",
      "indicators:read",
      "goals:read",
      "rankings:read",
      "dashboards:read",
      "notifications:read"
    ],
    "settings": {
      "dashboardId": 5,
      "notificationsEmail": true,
      "notificationsPush": true
    }
  },
  "meta": {
    "requestId": "req_fgh890",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 401 UNAUTHORIZED

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token não fornecido",
    "requestId": "req_ijk123",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 6.7 POST /auth/verify-email

Verifica e-mail usando token recebido após cadastro.

### Request body

```json
{
  "token": "vrf_abc123def456"
}
```

### Response 200 OK

```json
{
  "data": {
    "message": "E-mail verificado com sucesso",
    "verifiedAt": "2025-08-15T14:30:00Z"
  }
}
```

---

## 6.8 POST /auth/2fa/enable

Inicia ativação de 2FA. Retorna QR code para app autenticador.

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/auth/2fa/enable \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "otpauth://totp/Orion:joao@empresa.com?secret=JBSWY3DPEHPK3PXP&issuer=Orion",
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgo...",
    "backupCodes": [
      "84021-abc",
      "51902-def",
      "37810-ghi",
      "26593-jkl",
      "94107-mno",
      "63824-pqr",
      "45015-stu",
      "12708-vwx"
    ]
  }
}
```

> ⚠️ `backupCodes` são exibidos uma única vez. Devem ser armazenados pelo cliente.

### Response 400 BUSINESS_RULE_VIOLATION

2FA já ativo:

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "2FA já está ativo",
    "requestId": "req_yza456",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 6.9 POST /auth/2fa/confirm

Confirma ativação de 2FA enviando código TOTP.

### Request body

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "totpCode": "123456"
}
```

### Response 200 OK

```json
{
  "data": {
    "enabled": true,
    "enabledAt": "2025-08-15T14:30:00Z"
  }
}
```

---

## 6.10 DELETE /auth/2fa

Desativa 2FA. Exige senha atual + código TOTP.

### Request body

```json
{
  "password": "MinhaSenh@123",
  "totpCode": "123456"
}
```

### Response 204 No Content

Sem body.

---

# Capítulo 7 — Empresas

## 7.1 GET /companies

Lista empresas. **Acesso restrito a Admin Master SaaS** (header `X-Orion-Admin-Mode: true`).

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens (max 100) |
| `sort` | string | `createdAt:desc` | Ordenação |
| `search` | string | — | Busca por nome/documento |
| `status` | enum | — | `active`, `inactive`, `suspended`, `trial` |
| `plan` | enum | — | `starter`, `professional`, `enterprise`, `custom` |
| `include` | string | — | Expandir `license`, `branches` |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/companies?plan=professional&status=active&limit=10" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "X-Orion-Admin-Mode: true"
```

### Response 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "uuid": "cmp_1f8a3c2e",
      "name": "Perfumes ABC Ltda",
      "legalName": "Perfumes ABC Comércio Ltda",
      "document": "12.345.678/0001-90",
      "email": "contato@perfumesabc.com.br",
      "plan": "professional",
      "status": "active",
      "logoUrl": "https://cdn.orion.com/logos/cmp_1.png",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "uuid": "cmp_2a9b4d3f",
      "name": "Cosméticos XYZ S/A",
      "legalName": "Cosméticos XYZ S.A.",
      "document": "98.765.432/0001-10",
      "email": "ti@cosmeticosxyz.com.br",
      "plan": "professional",
      "status": "active",
      "logoUrl": null,
      "createdAt": "2025-02-15T00:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 23,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "requestId": "req_bcd123",
    "timestamp": "2025-08-15T14:30:00Z"
  },
  "links": {
    "self": "/v1/companies?plan=professional&status=active&page=1&limit=10",
    "next": "/v1/companies?plan=professional&status=active&page=2&limit=10"
  }
}
```

### Response 403 FORBIDDEN

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Acesso restrito a Admin Master",
    "requestId": "req_efg456",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 7.2 GET /companies/{id}

Detalha uma empresa.

### Path parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | integer | sim | ID da empresa |

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `include` | string | — | `license`, `branches`, `stats` |

### Exemplo curl

```bash
curl -X GET https://api.orion.suaempresa.com/v1/companies/1?include=license,stats \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": {
    "id": 1,
    "uuid": "cmp_1f8a3c2e",
    "name": "Perfumes ABC Ltda",
    "legalName": "Perfumes ABC Comércio Ltda",
    "document": "12.345.678/0001-90",
    "email": "contato@perfumesabc.com.br",
    "phone": "(11) 3333-1000",
    "website": "https://www.perfumesabc.com.br",
    "logoUrl": "https://cdn.orion.com/logos/cmp_1.png",
    "plan": "professional",
    "status": "active",
    "timezone": "America/Sao_Paulo",
    "language": "pt-BR",
    "address": {
      "zipCode": "01000-000",
      "street": "Rua Augusta",
      "number": "100",
      "complement": "Sala 201",
      "district": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "country": "BR"
    },
    "settings": {
      "fiscalYearStart": "01-01",
      "currency": "BRL",
      "dateFormat": "DD/MM/YYYY",
      "workingDays": [1, 2, 3, 4, 5],
      "workingHours": { "start": "08:00", "end": "18:00" }
    },
    "license": {
      "id": 1,
      "plan": "professional",
      "status": "active",
      "expiresAt": "2026-01-01T00:00:00Z",
      "currentUsers": 32,
      "maxUsers": 50
    },
    "stats": {
      "userCount": 32,
      "branchCount": 3,
      "indicatorCount": 18,
      "goalCount": 145,
      "campaignCount": 5
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-08-15T14:00:00Z"
  },
  "meta": {
    "requestId": "req_hij789",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 404 RECORD_NOT_FOUND

```json
{
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "Empresa 999 não encontrada",
    "details": [{ "resource": "Company", "id": 999 }],
    "requestId": "req_klm012",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 7.3 PUT /companies/{id}

Atualiza dados da empresa. Exige permissão `company:write`.

### Request body

```json
{
  "name": "Perfumes ABC Ltda",
  "legalName": "Perfumes ABC Comércio Ltda",
  "email": "contato@perfumesabc.com.br",
  "phone": "(11) 3333-1000",
  "website": "https://www.perfumesabc.com.br",
  "logoUrl": "https://cdn.orion.com/logos/cmp_1.png",
  "address": {
    "zipCode": "01000-000",
    "street": "Rua Augusta",
    "number": "100",
    "complement": "Sala 201",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "country": "BR"
  },
  "settings": {
    "fiscalYearStart": "01-01",
    "currency": "BRL",
    "dateFormat": "DD/MM/YYYY",
    "workingDays": [1, 2, 3, 4, 5],
    "workingHours": { "start": "08:00", "end": "18:00" }
  }
}
```

### Exemplo curl

```bash
curl -X PUT https://api.orion.suaempresa.com/v1/companies/1 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{ "name": "Perfumes ABC Ltda", "phone": "(11) 3333-1000", ... }'
```

### Response 200 OK

```json
{
  "data": {
    "id": 1,
    "name": "Perfumes ABC Ltda",
    "phone": "(11) 3333-1000",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": {
    "requestId": "req_nop345",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 422 VALIDATION_ERROR

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "document",
        "rule": "cnpj",
        "message": "CNPJ inválido"
      }
    ],
    "requestId": "req_qrs678",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 403 INSUFFICIENT_SCOPE

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "Permissão insuficiente",
    "details": [{ "required": "company:write", "granted": ["company:read"] }],
    "requestId": "req_tuv901",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 409 CONCURRENT_MODIFICATION

```json
{
  "error": {
    "code": "CONCURRENT_MODIFICATION",
    "message": "Recurso modificado por outro cliente",
    "details": [
      {
        "currentETag": "v5-1692124500",
        "providedETag": "v4-1692124200"
      }
    ],
    "requestId": "req_wxy234",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 7.4 GET /companies/{id}/stats

Retorna estatísticas consolidadas da empresa (contagens, KPIs, tendências).

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/companies/1/stats?period=monthly&from=2025-01-01&to=2025-08-15" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `period` | enum | `monthly` | `daily`, `weekly`, `monthly`, `quarterly`, `yearly` |
| `from` | date | — | Data inicial (ISO) |
| `to` | date | hoje | Data final (ISO) |

### Response 200 OK

```json
{
  "data": {
    "period": { "from": "2025-01-01", "to": "2025-08-15", "granularity": "monthly" },
    "counts": {
      "users": 32,
      "branches": 3,
      "indicators": 18,
      "goals": 145,
      "results": 1280,
      "campaigns": 5
    },
    "kpis": {
      "goalAchievementRate": 78.4,
      "resultsApprovedRate": 92.1,
      "activeCampaigns": 2,
      "avgScorePerUser": 8520.50
    },
    "trends": [
      { "month": "2025-01", "results": 140, "achievement": 65.2 },
      { "month": "2025-02", "results": 158, "achievement": 68.0 },
      { "month": "2025-03", "results": 172, "achievement": 71.5 },
      { "month": "2025-04", "results": 165, "achievement": 70.2 },
      { "month": "2025-05", "results": 180, "achievement": 74.8 },
      { "month": "2025-06", "results": 195, "achievement": 76.3 },
      { "month": "2025-07", "results": 210, "achievement": 78.1 },
      { "month": "2025-08", "results": 60, "achievement": 41.7 }
    ]
  },
  "meta": { "requestId": "req_abc999", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 8 — Filiais

## 8.1 GET /branches

Lista filiais da empresa atual.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens (max 100) |
| `sort` | string | `name:asc` | Ordenação |
| `search` | string | — | Busca por nome/código |
| `status` | enum | — | `active`, `inactive` |
| `managerId` | integer | — | Filtrar por gerente |
| `include` | string | — | `manager`, `users`, `stats` |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/branches?status=active&include=manager,stats" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "uuid": "brn_1a2b3c4d",
      "code": "LOJA-001",
      "name": "Loja Centro",
      "companyId": 1,
      "managerId": 5,
      "manager": {
        "id": 5,
        "name": "Carlos Mendes",
        "email": "carlos@perfumesabc.com.br"
      },
      "phone": "(11) 3333-4444",
      "email": "centro@perfumesabc.com.br",
      "address": {
        "zipCode": "01000-000",
        "street": "Rua Augusta",
        "number": "100",
        "district": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "country": "BR"
      },
      "status": "active",
      "stats": {
        "userCount": 12,
        "goalCount": 45,
        "resultsThisMonth": 87,
        "achievementRate": 82.3
      },
      "createdAt": "2025-01-05T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1, "limit": 20, "total": 3, "totalPages": 1,
      "hasNext": false, "hasPrev": false
    },
    "requestId": "req_b1c2d3",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 401 UNAUTHORIZED

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token não fornecido",
    "requestId": "req_d4e5f6",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 8.2 POST /branches

Cria nova filial. Limite conforme licença (`maxBranches`).

### Request body

```json
{
  "code": "LOJA-002",
  "name": "Loja Shopping",
  "managerId": 8,
  "phone": "(11) 3333-5555",
  "email": "shopping@perfumesabc.com.br",
  "address": {
    "zipCode": "04567-000",
    "street": "Av. Brigadeiro Faria Lima",
    "number": "2000",
    "complement": "Piso 2",
    "district": "Jardim Paulistano",
    "city": "São Paulo",
    "state": "SP",
    "country": "BR"
  },
  "operatingHours": {
    "monday": { "open": "10:00", "close": "22:00" },
    "tuesday": { "open": "10:00", "close": "22:00" },
    "wednesday": { "open": "10:00", "close": "22:00" },
    "thursday": { "open": "10:00", "close": "22:00" },
    "friday": { "open": "10:00", "close": "22:00" },
    "saturday": { "open": "10:00", "close": "22:00" },
    "sunday": { "open": "12:00", "close": "20:00" }
  }
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `code` | string(20) | sim | Único por empresa |
| `name` | string(120) | sim | — |
| `managerId` | integer | não | Usuário existente |
| `phone` | string | não | Formato `(XX) XXXX-XXXX` |
| `email` | string(email) | não | — |
| `address.zipCode` | string | não | CEP válido |
| `address.city` | string | não | — |
| `address.state` | string | não | 2 letras UF |
| `operatingHours` | object | não | Horário por dia da semana |

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/branches \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "code": "LOJA-002",
    "name": "Loja Shopping",
    "managerId": 8,
    "address": { "zipCode": "04567-000", "street": "Av. B. Faria Lima", "number": "2000", "city": "São Paulo", "state": "SP" }
  }'
```

### Response 201 Created

```json
{
  "data": {
    "id": 4,
    "uuid": "brn_4e5f6g7h",
    "code": "LOJA-002",
    "name": "Loja Shopping",
    "companyId": 1,
    "managerId": 8,
    "phone": null,
    "email": null,
    "address": {
      "zipCode": "04567-000",
      "street": "Av. B. Faria Lima",
      "number": "2000",
      "city": "São Paulo",
      "state": "SP",
      "country": "BR"
    },
    "status": "active",
    "userCount": 0,
    "createdAt": "2025-08-15T14:30:00Z",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_g7h8i9", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 409 DUPLICATE_FIELD

```json
{
  "error": {
    "code": "DUPLICATE_FIELD",
    "message": "Código já cadastrado",
    "details": [{ "field": "code", "value": "LOJA-002", "conflictingId": 4 }],
    "requestId": "req_j0k1l2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 422 LICENSE_LIMIT_EXCEEDED

```json
{
  "error": {
    "code": "LICENSE_LIMIT_EXCEEDED",
    "message": "Limite de filiais excedido",
    "details": [{ "limit": 5, "current": 5, "plan": "professional" }],
    "requestId": "req_m3n4o5",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 422 FOREIGN_KEY_VIOLATION

```json
{
  "error": {
    "code": "FOREIGN_KEY_VIOLATION",
    "message": "Gerente informado não existe",
    "details": [{ "field": "managerId", "value": 999 }],
    "requestId": "req_p6q7r8",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 8.3 GET /branches/{id}

Detalha uma filial.

### Response 200 OK

```json
{
  "data": {
    "id": 1,
    "uuid": "brn_1a2b3c4d",
    "code": "LOJA-001",
    "name": "Loja Centro",
    "companyId": 1,
    "managerId": 5,
    "phone": "(11) 3333-4444",
    "email": "centro@perfumesabc.com.br",
    "address": {
      "zipCode": "01000-000",
      "street": "Rua Augusta",
      "number": "100",
      "complement": "",
      "district": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "country": "BR",
      "lat": -23.5505,
      "lng": -46.6333
    },
    "operatingHours": {
      "monday": { "open": "08:00", "close": "18:00" },
      "tuesday": { "open": "08:00", "close": "18:00" },
      "wednesday": { "open": "08:00", "close": "18:00" },
      "thursday": { "open": "08:00", "close": "18:00" },
      "friday": { "open": "08:00", "close": "18:00" },
      "saturday": { "open": "08:00", "close": "14:00" },
      "sunday": null
    },
    "status": "active",
    "userCount": 12,
    "createdAt": "2025-01-05T10:00:00Z",
    "updatedAt": "2025-08-10T15:30:00Z"
  },
  "meta": { "requestId": "req_s9t0u1", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 404 RECORD_NOT_FOUND

```json
{
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "Filial 999 não encontrada",
    "details": [{ "resource": "Branch", "id": 999 }],
    "requestId": "req_v2w3x4",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 8.4 PUT /branches/{id}

Atualiza filial. Exige `branches:write`.

### Request body

```json
{
  "name": "Loja Centro - Atualizada",
  "managerId": 6,
  "phone": "(11) 3333-4444",
  "operatingHours": {
    "monday": { "open": "08:00", "close": "19:00" }
  }
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 1,
    "name": "Loja Centro - Atualizada",
    "managerId": 6,
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_y5z6a7", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 8.5 DELETE /branches/{id}

Desativa filial (soft delete). Não remove se houver usuários/metas ativos vinculados.

### Exemplo curl

```bash
curl -X DELETE "https://api.orion.suaempresa.com/v1/branches/1?reassignTo=2" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Query parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `reassignTo` | integer | não | Filial que receberá usuários/metas transferidos |
| `force` | boolean | não | Força mesmo com vinculações (default: false) |

### Response 204 No Content

Sem body.

### Response 409 CONFLICT

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Filial possui 12 usuários ativos. Use reassignTo ou force=true.",
    "details": [{ "activeUsers": 12, "activeGoals": 45 }],
    "requestId": "req_b8c9d0",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

# Capítulo 9 — Usuários

## 9.1 GET /users

Lista usuários da empresa atual.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens (max 100) |
| `sort` | string | `name:asc` | Ordenação |
| `search` | string | — | Busca por nome/email/documento |
| `branchId` | integer | — | Filtrar por filial |
| `roleId` | integer | — | Filtrar por papel |
| `status` | enum | — | `active`, `inactive`, `locked`, `pending` |
| `twoFactorEnabled` | boolean | — | Filtrar por 2FA |
| `createdAtFrom` | datetime | — | Criados a partir de |
| `createdAtTo` | datetime | — | Criados até |
| `lastLoginFrom` | datetime | — | Último login a partir de |
| `include` | string | — | `branch`, `role`, `company` |
| `fields` | string | — | Sparse fieldsets |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/users?branchId=1&status=active&sort=name:asc&include=role&fields=id,name,email,role" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": [
    {
      "id": 10,
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": { "id": 5, "name": "vendedor", "label": "Vendedor" }
    },
    {
      "id": 11,
      "name": "Maria Souza",
      "email": "maria@empresa.com",
      "role": { "id": 5, "name": "vendedor", "label": "Vendedor" }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1, "limit": 20, "total": 32, "totalPages": 2,
      "hasNext": true, "hasPrev": false
    },
    "requestId": "req_e1f2g3",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 403 INSUFFICIENT_SCOPE

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "Permissão insuficiente",
    "details": [{ "required": "users:read", "granted": [] }],
    "requestId": "req_h4i5j6",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 9.2 POST /users

Cria usuário. Valida limite da licença (`maxUsers`).

### Request body

```json
{
  "name": "Ana Oliveira",
  "email": "ana@empresa.com",
  "phone": "(11) 97777-8888",
  "document": "987.654.321-00",
  "password": "Senh@Inicial123",
  "branchId": 1,
  "roleId": 5,
  "language": "pt-BR",
  "timezone": "America/Sao_Paulo",
  "sendInvite": true,
  "twoFactorRequired": false,
  "avatarUrl": null,
  "metadata": {
    "department": "Vendas",
    "position": "Vendedora"
  }
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `name` | string(120) | sim | — |
| `email` | string(email) | sim | Único por empresa |
| `phone` | string | não | Formato válido |
| `document` | string | não | CPF/CNPJ válido |
| `password` | string | não* | Se `sendInvite=true`, gerada pelo sistema |
| `branchId` | integer | não | Filial existente |
| `roleId` | integer | sim | Papel existente |
| `language` | string | não | `pt-BR` (default) |
| `timezone` | string | não | IANA |
| `sendInvite` | boolean | não | Envia convite por e-mail |
| `twoFactorRequired` | boolean | não | Obriga 2FA no primeiro login |

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/users \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Oliveira",
    "email": "ana@empresa.com",
    "branchId": 1,
    "roleId": 5,
    "sendInvite": true
  }'
```

### Response 201 Created

```json
{
  "data": {
    "id": 12,
    "uuid": "usr_12b9c8d7",
    "name": "Ana Oliveira",
    "email": "ana@empresa.com",
    "phone": null,
    "document": null,
    "status": "pending",
    "branchId": 1,
    "roleId": 5,
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "twoFactorEnabled": false,
    "emailVerifiedAt": null,
    "lastLoginAt": null,
    "createdAt": "2025-08-15T14:30:00Z",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": {
    "requestId": "req_k7l8m9",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 422 LICENSE_LIMIT_EXCEEDED

```json
{
  "error": {
    "code": "LICENSE_LIMIT_EXCEEDED",
    "message": "Limite de usuários da licença excedido",
    "details": [{ "limit": 50, "current": 50, "plan": "professional" }],
    "requestId": "req_n0o1p2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 9.3 GET /users/{id}

Detalha usuário.

### Response 200 OK

```json
{
  "data": {
    "id": 10,
    "uuid": "usr_10a3f8c2",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "(11) 98765-4321",
    "document": "123.456.789-00",
    "avatarUrl": "https://cdn.orion.com/avatars/usr_10.png",
    "status": "active",
    "branchId": 1,
    "roleId": 5,
    "companyId": 1,
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo",
    "twoFactorEnabled": false,
    "emailVerifiedAt": "2025-01-15T10:00:00Z",
    "lastLoginAt": "2025-08-15T13:45:00Z",
    "lastLoginIp": "200.150.10.20",
    "loginCount": 145,
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-08-15T13:45:00Z"
  },
  "meta": { "requestId": "req_q3r4s5", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 403 BRANCH_ACCESS_DENIED

```json
{
  "error": {
    "code": "BRANCH_ACCESS_DENIED",
    "message": "Você não tem acesso à filial deste usuário",
    "details": [{ "userBranchId": 2, "allowedBranchIds": [1] }],
    "requestId": "req_t6u7v8",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 9.4 PUT /users/{id}

Atualiza usuário.

### Request body

```json
{
  "name": "João Silva Santos",
  "phone": "(11) 99999-8888",
  "branchId": 2,
  "roleId": 6,
  "language": "pt-BR",
  "metadata": { "department": "Vendas", "position": "Vendedor Sênior" }
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 10,
    "name": "João Silva Santos",
    "phone": "(11) 99999-8888",
    "branchId": 2,
    "roleId": 6,
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_w9x0y1", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 9.5 DELETE /users/{id}

Desativa usuário (soft delete). Não remove dados históricos.

### Response 204 No Content

Sem body.

### Response 409 CONFLICT

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Usuário possui 5 metas ativas. Reatribua ou conclua antes.",
    "details": [{ "activeGoals": 5, "pendingResults": 3 }],
    "requestId": "req_z2a3b4",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 9.6 POST /users/{id}/reset-password

Admin reset de senha. Gera senha temporária enviada por e-mail.

### Request body

```json
{
  "sendEmail": true,
  "requireChange": true
}
```

### Response 200 OK

```json
{
  "data": {
    "message": "Senha temporária gerada e enviada para o e-mail do usuário",
    "temporaryPassword": null,
    "expiresAt": "2025-08-15T15:30:00Z",
    "requireChange": true
  }
}
```

> Se `sendEmail=false`, retorna `temporaryPassword` no response.

---

## 9.7 POST /users/{id}/unlock

Desbloqueia conta bloqueada por tentativas falhas.

### Response 200 OK

```json
{
  "data": {
    "id": 10,
    "status": "active",
    "unlockedAt": "2025-08-15T14:30:00Z",
    "unlockedBy": 1
  }
}
```

### Response 409 STATE_TRANSITION_INVALID

```json
{
  "error": {
    "code": "STATE_TRANSITION_INVALID",
    "message": "Conta não está bloqueada",
    "details": [{ "currentStatus": "active" }],
    "requestId": "req_c5d6e7",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 9.8 GET /users/{id}/goals

Lista metas do usuário.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `period` | enum | — | `daily`, `weekly`, `monthly`, `quarterly`, `yearly` |
| `status` | enum | — | `active`, `completed`, `failed`, `paused` |
| `indicatorId` | integer | — | Filtrar por indicador |
| `from` | date | — | Data início |
| `to` | date | — | Data fim |

### Response 200 OK

```json
{
  "data": [
    {
      "id": 42,
      "indicatorId": 3,
      "indicatorName": "Venda de Perfumes",
      "goalType": "monthly",
      "startDate": "2025-08-01",
      "endDate": "2025-08-31",
      "targetValue": 30000,
      "currentValue": 12500.50,
      "achievementPercent": 41.68,
      "status": "active"
    }
  ],
  "meta": { "requestId": "req_f8g9h0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 9.9 GET /users/{id}/results

Lista resultados do usuário.

### Response 200 OK

```json
{
  "data": [
    {
      "id": 1001,
      "indicatorId": 3,
      "indicatorName": "Venda de Perfumes",
      "resultDate": "2025-08-15",
      "value": 1250.50,
      "status": "pending",
      "createdAt": "2025-08-15T11:30:00Z"
    }
  ],
  "meta": { "requestId": "req_i1j2k3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 10 — Papéis e Permissões

## 10.1 GET /roles

Lista papéis da empresa.

### Response 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "name": "admin",
      "label": "Administrador",
      "description": "Acesso total ao sistema",
      "scope": "company",
      "isSystem": true,
      "permissions": ["*"],
      "userCount": 2
    },
    {
      "id": 5,
      "name": "vendedor",
      "label": "Vendedor",
      "description": "Vendedor de loja",
      "scope": "branch",
      "isSystem": false,
      "permissions": ["results:read", "results:write", "indicators:read"],
      "userCount": 24
    }
  ],
  "meta": { "requestId": "req_l4m5n6", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 10.2 POST /roles

Cria papel customizado.

### Request body

```json
{
  "name": "gerente_loja",
  "label": "Gerente de Loja",
  "description": "Gerencia uma filial, pode aprovar resultados",
  "scope": "branch",
  "permissions": [
    "users:read",
    "users:write",
    "results:read",
    "results:write",
    "results:approve",
    "goals:read",
    "goals:write",
    "indicators:read",
    "rankings:read",
    "dashboards:read",
    "dashboards:write"
  ]
}
```

### Response 201 Created

```json
{
  "data": {
    "id": 8,
    "uuid": "rol_8d9e0f1a",
    "name": "gerente_loja",
    "label": "Gerente de Loja",
    "description": "Gerencia uma filial, pode aprovar resultados",
    "scope": "branch",
    "isSystem": false,
    "permissions": [
      "users:read", "users:write", "results:read", "results:write",
      "results:approve", "goals:read", "goals:write", "indicators:read",
      "rankings:read", "dashboards:read", "dashboards:write"
    ],
    "userCount": 0,
    "createdAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_o7p8q9", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 INVALID_ENUM

Permissão inexistente:

```json
{
  "error": {
    "code": "INVALID_ENUM",
    "message": "Permissão inválida",
    "details": [{ "field": "permissions", "value": "results:delete", "allowed": ["results:read", "results:write", "results:approve"] }],
    "requestId": "req_r0s1t2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 10.3 PUT /roles/{id}

Atualiza papel. Papéis de sistema não podem ser editados.

### Response 403 FORBIDDEN

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Papéis de sistema não podem ser editados",
    "details": [{ "roleId": 1, "isSystem": true }],
    "requestId": "req_u3v4w5",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 10.4 DELETE /roles/{id}

Remove papel. Não permite se houver usuários vinculados.

### Response 409 CONFLICT

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Papel possui 24 usuários vinculados",
    "details": [{ "userCount": 24 }],
    "requestId": "req_x6y7z8",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 10.5 GET /permissions

Lista todas as permissões disponíveis no sistema.

### Response 200 OK

```json
{
  "data": [
    {
      "code": "users:read",
      "label": "Listar usuários",
      "description": "Permite listar usuários",
      "module": "users",
      "action": "read",
      "resource": "User",
      "isSystem": true
    },
    {
      "code": "users:write",
      "label": "Criar/editar usuários",
      "description": "Permite criar e editar usuários",
      "module": "users",
      "action": "write",
      "resource": "User",
      "isSystem": true
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 32, "totalPages": 2, "hasNext": true, "hasPrev": false },
    "requestId": "req_a9b0c1",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

# Capítulo 11 — Categorias de Indicadores

## 11.1 GET /indicator-categories

Lista categorias de indicadores da empresa.

### Response 200 OK

```json
{
  "data": [
    {
      "id": 1,
      "uuid": "ic_1a2b3c4d",
      "name": "vendas",
      "label": "Vendas",
      "description": "Indicadores relacionados a vendas",
      "icon": "shopping-cart",
      "color": "#10B981",
      "indicatorCount": 8,
      "createdAt": "2025-01-10T08:00:00Z"
    },
    {
      "id": 2,
      "uuid": "ic_2b3c4d5e",
      "name": "atendimento",
      "label": "Atendimento",
      "description": "Indicadores de atendimento ao cliente",
      "icon": "headset",
      "color": "#3B82F6",
      "indicatorCount": 4,
      "createdAt": "2025-01-10T08:00:00Z"
    }
  ],
  "meta": { "requestId": "req_b2c3d4", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 11.2 POST /indicator-categories

### Request body

```json
{
  "name": "logistica",
  "label": "Logística",
  "description": "Indicadores de logística e estoque",
  "icon": "truck",
  "color": "#F59E0B"
}
```

### Response 201 Created

```json
{
  "data": {
    "id": 3,
    "uuid": "ic_3c4d5e6f",
    "name": "logistica",
    "label": "Logística",
    "description": "Indicadores de logística e estoque",
    "icon": "truck",
    "color": "#F59E0B",
    "indicatorCount": 0,
    "createdAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_d4e5f6", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 409 DUPLICATE_FIELD

```json
{
  "error": {
    "code": "DUPLICATE_FIELD",
    "message": "Nome de categoria já existe",
    "details": [{ "field": "name", "value": "vendas" }],
    "requestId": "req_g7h8i9",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

# Capítulo 12 — Indicadores

## 12.1 GET /indicators

Lista indicadores da empresa.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens (max 100) |
| `sort` | string | `name:asc` | Ordenação |
| `search` | string | — | Busca por nome/descrição |
| `categoryId` | integer | — | Filtrar por categoria |
| `type` | enum | — | `currency`, `number`, `decimal`, `percentage`, `time`, `boolean`, `rating` |
| `status` | enum | — | `active`, `inactive` |
| `showDashboard` | boolean | — | Exibe no dashboard |
| `showRanking` | boolean | — | Exibe no ranking |
| `isSystem` | boolean | — | Indicadores de sistema |
| `include` | string | — | `category`, `creator`, `stats` |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/indicators?categoryId=2&status=active&include=category" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": [
    {
      "id": 3,
      "uuid": "ind_3d4e5f6g",
      "name": "Venda de Perfumes",
      "description": "Receita total com vendas de perfumes",
      "type": "currency",
      "categoryId": 2,
      "category": { "id": 2, "name": "vendas", "label": "Vendas" },
      "icon": "flower",
      "color": "#9333EA",
      "unit": "BRL",
      "decimalPlaces": 2,
      "aggregation": "sum",
      "direction": "higher_better",
      "weight": 1.5,
      "showDashboard": true,
      "showRanking": true,
      "showReports": true,
      "isSystem": false,
      "status": "active",
      "version": 3,
      "createdAt": "2025-01-15T09:00:00Z",
      "updatedAt": "2025-08-01T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 18, "totalPages": 1, "hasNext": false, "hasPrev": false },
    "requestId": "req_j0k1l2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 12.2 POST /indicators

Cria indicador personalizado. Valida limite da licença (`maxIndicators`).

### Request body

```json
{
  "name": "Venda de Perfumes",
  "description": "Receita total com vendas de perfumes",
  "type": "currency",
  "categoryId": 2,
  "icon": "flower",
  "color": "#9333EA",
  "unit": "BRL",
  "decimalPlaces": 2,
  "formula": "SUM(sale_items.value WHERE category = 'perfume')",
  "aggregation": "sum",
  "direction": "higher_better",
  "weight": 1.5,
  "targetDefault": 10000,
  "minValue": 0,
  "maxValue": null,
  "showDashboard": true,
  "showRanking": true,
  "showReports": true
}
```

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/indicators \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Venda de Perfumes",
    "type": "currency",
    "categoryId": 2,
    "unit": "BRL",
    "decimalPlaces": 2,
    "direction": "higher_better",
    "weight": 1.5,
    "showDashboard": true
  }'
```

### Response 201 Created

```json
{
  "data": {
    "id": 19,
    "uuid": "ind_19f8a7b6",
    "name": "Venda de Perfumes",
    "description": "Receita total com vendas de perfumes",
    "type": "currency",
    "categoryId": 2,
    "icon": "flower",
    "color": "#9333EA",
    "unit": "BRL",
    "decimalPlaces": 2,
    "formula": null,
    "aggregation": "sum",
    "direction": "higher_better",
    "weight": 1.5,
    "targetDefault": 10000,
    "minValue": 0,
    "maxValue": null,
    "showDashboard": true,
    "showRanking": true,
    "showReports": true,
    "isSystem": false,
    "status": "active",
    "version": 1,
    "companyId": 1,
    "createdBy": 1,
    "createdAt": "2025-08-15T14:30:00Z",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_m3n4o5", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 VALIDATION_ERROR

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      { "field": "color", "rule": "hex_color", "message": "Cor deve estar no formato #RRGGBB" },
      { "field": "decimalPlaces", "rule": "max", "value": 10, "message": "Máximo de casas decimais é 6" }
    ],
    "requestId": "req_p6q7r8",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 12.3 GET /indicators/{id}

Detalha indicador.

### Response 200 OK

```json
{
  "data": {
    "id": 3,
    "uuid": "ind_3d4e5f6g",
    "name": "Venda de Perfumes",
    "description": "Receita total com vendas de perfumes",
    "type": "currency",
    "categoryId": 2,
    "icon": "flower",
    "color": "#9333EA",
    "unit": "BRL",
    "decimalPlaces": 2,
    "formula": "SUM(sale_items.value WHERE category = 'perfume')",
    "aggregation": "sum",
    "direction": "higher_better",
    "weight": 1.5,
    "targetDefault": 10000,
    "minValue": 0,
    "maxValue": null,
    "showDashboard": true,
    "showRanking": true,
    "showReports": true,
    "isSystem": false,
    "status": "active",
    "version": 3,
    "history": [
      { "version": 1, "weight": 1.0, "changedAt": "2025-01-15T09:00:00Z", "changedBy": 1 },
      { "version": 2, "weight": 1.2, "changedAt": "2025-05-10T11:00:00Z", "changedBy": 1 },
      { "version": 3, "weight": 1.5, "changedAt": "2025-08-01T10:00:00Z", "changedBy": 1 }
    ],
    "stats": {
      "goalCount": 12,
      "resultCount": 245,
      "lastResultAt": "2025-08-15T11:30:00Z",
      "avgValue": 825.30
    },
    "createdAt": "2025-01-15T09:00:00Z",
    "updatedAt": "2025-08-01T10:00:00Z"
  },
  "meta": { "requestId": "req_s9t0u1", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 12.4 PUT /indicators/{id}

Atualiza indicador. Cria nova versão para histórico (preserva cálculos passados).

### Request body

```json
{
  "name": "Venda de Perfumes Importados",
  "description": "Receita com perfumes importados (atualizado)",
  "weight": 2.0,
  "color": "#7C3AED"
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 3,
    "name": "Venda de Perfumes Importados",
    "description": "Receita com perfumes importados (atualizado)",
    "weight": 2.0,
    "color": "#7C3AED",
    "version": 4,
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_v2w3x4", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 BUSINESS_RULE_VIOLATION

Tentar alterar `type` de indicador com resultados vinculados:

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Tipo do indicador não pode ser alterado pois há 245 resultados vinculados",
    "details": [{ "currentType": "currency", "requestedType": "number", "resultCount": 245 }],
    "requestId": "req_y5z6a7",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 12.5 DELETE /indicators/{id}

Desativa indicador (soft delete). Dados históricos preservados.

### Response 204 No Content

Sem body.

### Response 409 CONFLICT

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Indicador possui 12 metas ativas. Reatribua antes.",
    "details": [{ "activeGoals": 12 }],
    "requestId": "req_b8c9d0",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 12.6 GET /indicators/{id}/history

Lista versões históricas do indicador.

### Response 200 OK

```json
{
  "data": [
    {
      "version": 3,
      "name": "Venda de Perfumes",
      "weight": 1.5,
      "color": "#9333EA",
      "changedAt": "2025-08-01T10:00:00Z",
      "changedBy": { "id": 1, "name": "Admin Master" },
      "reason": "Ajuste de peso para ranking de agosto"
    },
    {
      "version": 2,
      "name": "Venda de Perfumes",
      "weight": 1.2,
      "color": "#9333EA",
      "changedAt": "2025-05-10T11:00:00Z",
      "changedBy": { "id": 1, "name": "Admin Master" },
      "reason": "Revisão semestral"
    }
  ],
  "meta": { "requestId": "req_e1f2g3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 13 — Metas

## 13.1 GET /goals

Lista metas com filtros avançados.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens (max 100) |
| `sort` | string | `createdAt:desc` | Ordenação |
| `userId` | integer | — | Filtrar por usuário |
| `branchId` | integer | — | Filtrar por filial |
| `indicatorId` | integer | — | Filtrar por indicador |
| `scope` | enum | — | `user`, `branch`, `company`, `team` |
| `goalType` | enum | — | `daily`, `weekly`, `monthly`, `quarterly`, `yearly`, `custom` |
| `status` | enum | — | `draft`, `pending`, `active`, `paused`, `completed`, `failed` |
| `period` | string | — | `2025-08` (mês), `2025-Q3`, `2025` |
| `dateFrom` | date | — | Início do período |
| `dateTo` | date | — | Fim do período |
| `include` | string | — | `user`, `indicator`, `branch` |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/goals?scope=user&goalType=monthly&status=active&period=2025-08&include=user,indicator" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": [
    {
      "id": 42,
      "uuid": "gol_42e7f8a9",
      "scope": "user",
      "userId": 10,
      "user": { "id": 10, "name": "João Silva" },
      "branchId": 1,
      "indicatorId": 3,
      "indicator": { "id": 3, "name": "Venda de Perfumes", "type": "currency", "unit": "BRL" },
      "goalType": "monthly",
      "startDate": "2025-08-01",
      "endDate": "2025-08-31",
      "targetValue": 30000,
      "weight": 1.0,
      "status": "active",
      "progress": 41.68,
      "currentValue": 12500.50,
      "achievementPercent": 41.68,
      "approved": true,
      "createdAt": "2025-07-25T14:00:00Z",
      "updatedAt": "2025-08-15T08:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 32, "totalPages": 2, "hasNext": true, "hasPrev": false },
    "requestId": "req_h4i5j6",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 13.2 POST /goals

Cria meta.

### Request body

```json
{
  "scope": "user",
  "userId": 10,
  "branchId": 1,
  "indicatorId": 3,
  "goalType": "monthly",
  "startDate": "2025-08-01",
  "endDate": "2025-08-31",
  "targetValue": 30000,
  "minValue": 0,
  "weight": 1.0,
  "notes": "Meta de faturamento de agosto",
  "approved": false
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `scope` | enum | sim | `user`, `branch`, `company`, `team` |
| `userId` | integer | cond | Obrigatório se scope=`user` |
| `branchId` | integer | cond | Obrigatório se scope=`branch` |
| `indicatorId` | integer | sim | Indicador ativo |
| `goalType` | enum | sim | — |
| `startDate` | date | sim | ISO 8601 |
| `endDate` | date | sim | Posterior a `startDate` |
| `targetValue` | number | sim | > 0 |
| `minValue` | number | não | Default 0 |
| `weight` | number | não | 0-10 (default 1.0) |
| `notes` | string | não | Até 1000 chars |
| `approved` | boolean | não | Default false |

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/goals \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "user",
    "userId": 10,
    "indicatorId": 3,
    "goalType": "monthly",
    "startDate": "2025-08-01",
    "endDate": "2025-08-31",
    "targetValue": 30000
  }'
```

### Response 201 Created

```json
{
  "data": {
    "id": 43,
    "uuid": "gol_43f8a9b0",
    "scope": "user",
    "userId": 10,
    "branchId": 1,
    "indicatorId": 3,
    "goalType": "monthly",
    "startDate": "2025-08-01",
    "endDate": "2025-08-31",
    "targetValue": 30000,
    "minValue": 0,
    "weight": 1.0,
    "status": "pending",
    "progress": 0,
    "currentValue": 0,
    "achievementPercent": 0,
    "notes": null,
    "approved": false,
    "approvedBy": null,
    "approvedAt": null,
    "createdAt": "2025-08-15T14:30:00Z",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_k7l8m9", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 DATE_INVALID

```json
{
  "error": {
    "code": "DATE_INVALID",
    "message": "Período inválido",
    "details": [{ "field": "endDate", "reason": "must_be_after_start", "startDate": "2025-08-31", "endDate": "2025-08-01" }],
    "requestId": "req_n0o1p2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 409 DUPLICATE_FIELD

```json
{
  "error": {
    "code": "DUPLICATE_FIELD",
    "message": "Já existe meta ativa para este usuário/indicador/período",
    "details": [{ "conflictingGoalId": 42 }],
    "requestId": "req_q3r4s5",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 13.3 POST /goals/batch

Cria metas em lote (para todos os vendedores de uma equipe, por exemplo).

### Request body

```json
{
  "scope": "user",
  "userIds": [10, 11, 12, 13],
  "branchId": 1,
  "indicatorId": 3,
  "goalType": "monthly",
  "startDate": "2025-08-01",
  "endDate": "2025-08-31",
  "targetValue": 30000,
  "weight": 1.0,
  "notes": "Meta de equipe — agosto"
}
```

### Response 201 Created

```json
{
  "data": {
    "batchId": "batch_abc123",
    "created": 4,
    "skipped": 0,
    "failed": 0,
    "goalIds": [43, 44, 45, 46],
    "errors": []
  },
  "meta": { "requestId": "req_t6u7v8", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 207 Multi-Status (parcial)

```json
{
  "data": {
    "batchId": "batch_def456",
    "created": 3,
    "skipped": 1,
    "failed": 0,
    "goalIds": [43, 44, 45],
    "errors": [
      { "userId": 13, "reason": "DUPLICATE_FIELD", "message": "Já possui meta ativa", "conflictingGoalId": 30 }
    ]
  },
  "meta": { "requestId": "req_w9x0y1", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 13.4 PUT /goals/{id}

Atualiza meta.

### Request body

```json
{
  "targetValue": 35000,
  "notes": "Meta revisada — campanha ativa",
  "status": "active"
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 42,
    "targetValue": 35000,
    "notes": "Meta revisada — campanha ativa",
    "status": "active",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_z2a3b4", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 409 STATE_TRANSITION_INVALID

```json
{
  "error": {
    "code": "STATE_TRANSITION_INVALID",
    "message": "Meta concluída não pode ser alterada",
    "details": [{ "currentStatus": "completed", "requestedStatus": "active" }],
    "requestId": "req_c5d6e7",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 13.5 POST /goals/{id}/approve

Aprova meta pendente.

### Response 200 OK

```json
{
  "data": {
    "id": 43,
    "status": "active",
    "approved": true,
    "approvedBy": 1,
    "approvedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_f8g9h0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 13.6 GET /goals/{id}/progress

Retorna progresso detalhado da meta (incluindo breakdown diário/semanal).

### Response 200 OK

```json
{
  "data": {
    "goalId": 42,
    "targetValue": 30000,
    "currentValue": 12500.50,
    "achievementPercent": 41.68,
    "daysElapsed": 15,
    "daysTotal": 31,
    "daysRemaining": 16,
    "expectedProgress": 48.39,
    "deviation": -6.71,
    "forecast": 25834.36,
    "breakdown": [
      { "date": "2025-08-01", "value": 850.00, "accumulated": 850.00 },
      { "date": "2025-08-02", "value": 920.50, "accumulated": 1770.50 },
      { "date": "2025-08-15", "value": 1250.50, "accumulated": 12500.50 }
    ]
  },
  "meta": { "requestId": "req_i1j2k3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 14 — Resultados

## 14.1 GET /results

Lista resultados com filtros.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens (max 100) |
| `sort` | string | `resultDate:desc` | Ordenação |
| `userId` | integer | — | Filtrar por usuário |
| `branchId` | integer | — | Filtrar por filial |
| `indicatorId` | integer | — | Filtrar por indicador |
| `goalId` | integer | — | Filtrar por meta |
| `status` | enum | — | `pending`, `approved`, `rejected`, `auto_approved` |
| `approved` | boolean | — | true/false |
| `source` | enum | — | `manual`, `import`, `api`, `erp`, `ai_estimate` |
| `dateFrom` | date | — | Data início |
| `dateTo` | date | — | Data fim |
| `include` | string | — | `user`, `indicator`, `goal`, `approver` |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/results?status=pending&dateFrom=2025-08-01&dateTo=2025-08-15&include=user,indicator" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": [
    {
      "id": 1001,
      "uuid": "res_1001f8a9",
      "userId": 10,
      "user": { "id": 10, "name": "João Silva" },
      "branchId": 1,
      "indicatorId": 3,
      "indicator": { "id": 3, "name": "Venda de Perfumes", "type": "currency", "unit": "BRL" },
      "goalId": 42,
      "resultDate": "2025-08-15",
      "value": 1250.50,
      "notes": "Vendas da manhã — 8 perfumes vendidos",
      "source": "manual",
      "status": "pending",
      "approved": null,
      "approvedBy": null,
      "approvedAt": null,
      "createdAt": "2025-08-15T11:30:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 87, "totalPages": 5, "hasNext": true, "hasPrev": false },
    "requestId": "req_l4m5n6",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 14.2 POST /results

Lança resultado.

### Request body

```json
{
  "userId": 10,
  "indicatorId": 3,
  "goalId": 42,
  "resultDate": "2025-08-15",
  "value": 1250.50,
  "notes": "Vendas da manhã — 8 perfumes vendidos",
  "attachments": ["file_abc123", "file_def456"],
  "source": "manual"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `userId` | integer | sim | Usuário ativo |
| `indicatorId` | integer | sim | Indicador ativo |
| `goalId` | integer | não | Meta ativa (auto-detectada se omitida) |
| `resultDate` | date | sim | Não pode ser futuro |
| `value` | number | sim | Dentro de min/max do indicador |
| `notes` | string | não | Até 2000 chars |
| `attachments` | array | não | IDs de arquivos |
| `source` | enum | não | Default `manual` |

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/results \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 7c8d9e0f-1234-5678-9abc-def012345678" \
  -d '{
    "userId": 10,
    "indicatorId": 3,
    "resultDate": "2025-08-15",
    "value": 1250.50,
    "notes": "Vendas da manhã"
  }'
```

### Response 201 Created

```json
{
  "data": {
    "id": 1002,
    "uuid": "res_1002a9b8",
    "userId": 10,
    "branchId": 1,
    "indicatorId": 3,
    "goalId": 42,
    "resultDate": "2025-08-15",
    "value": 1250.50,
    "previousValue": 0,
    "accumulatedValue": 13750.50,
    "notes": "Vendas da manhã",
    "attachments": [],
    "source": "manual",
    "status": "pending",
    "approved": null,
    "approvedBy": null,
    "approvedAt": null,
    "createdBy": 1,
    "createdAt": "2025-08-15T14:30:00Z",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": {
    "requestId": "req_o7p8q9",
    "timestamp": "2025-08-15T14:30:00Z",
    "goalProgress": {
      "goalId": 42,
      "currentValue": 13750.50,
      "targetValue": 30000,
      "achievementPercent": 45.83
    }
  }
}
```

### Response 422 VALUE_OUT_OF_RANGE

```json
{
  "error": {
    "code": "VALUE_OUT_OF_RANGE",
    "message": "Valor fora do intervalo permitido",
    "details": [{ "field": "value", "value": -100, "min": 0, "max": null }],
    "requestId": "req_r0s1t2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 422 DATE_INVALID

```json
{
  "error": {
    "code": "DATE_INVALID",
    "message": "Data do resultado não pode ser futura",
    "details": [{ "field": "resultDate", "value": "2025-12-31", "today": "2025-08-15" }],
    "requestId": "req_u3v4w5",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 422 BUSINESS_RULE_VIOLATION

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Já existe resultado para este usuário/indicador/data",
    "details": [{ "existingResultId": 1001, "resultDate": "2025-08-15" }],
    "requestId": "req_x6y7z8",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 14.3 POST /results/batch

Lança resultados em lote (importação).

### Request body

```json
{
  "results": [
    { "userId": 10, "indicatorId": 3, "resultDate": "2025-08-15", "value": 1250.50 },
    { "userId": 11, "indicatorId": 3, "resultDate": "2025-08-15", "value": 980.00 },
    { "userId": 12, "indicatorId": 3, "resultDate": "2025-08-15", "value": 1520.30 },
    { "userId": 13, "indicatorId": 3, "resultDate": "2025-08-15", "value": 740.00 }
  ],
  "onConflict": "skip"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `results[]` | array | sim | Máximo 500 por request |
| `onConflict` | enum | não | `skip`, `overwrite`, `fail` (default: `skip`) |

### Response 201 Created

```json
{
  "data": {
    "batchId": "batch_ghi789",
    "total": 4,
    "created": 4,
    "skipped": 0,
    "failed": 0,
    "resultIds": [1002, 1003, 1004, 1005],
    "errors": []
  },
  "meta": { "requestId": "req_a9b0c1", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 207 Multi-Status (parcial)

```json
{
  "data": {
    "batchId": "batch_jkl012",
    "total": 4,
    "created": 3,
    "skipped": 1,
    "failed": 0,
    "resultIds": [1002, 1003, 1004],
    "errors": [
      { "index": 3, "userId": 13, "resultDate": "2025-08-15", "reason": "DUPLICATE_FIELD", "message": "Já existe resultado" }
    ]
  },
  "meta": { "requestId": "req_b2c3d4", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 413 PAYLOAD_TOO_LARGE

```json
{
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Máximo de 500 resultados por batch",
    "details": [{ "received": 600, "max": 500 }],
    "requestId": "req_e5f6g7",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 14.4 POST /results/{id}/approve

Aprova resultado pendente. Exige `results:approve`.

### Request body

```json
{
  "notes": "Aprovado — conferido com comprovante"
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 1001,
    "status": "approved",
    "approved": true,
    "approvedBy": 1,
    "approvedAt": "2025-08-15T14:30:00Z",
    "notes": "Aprovado — conferido com comprovante"
  },
  "meta": { "requestId": "req_h8i9j0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 409 RESULT_ALREADY_APPROVED

```json
{
  "error": {
    "code": "RESULT_ALREADY_APPROVED",
    "message": "Resultado já aprovado",
    "details": [{ "approvedAt": "2025-08-15T10:00:00Z", "approvedBy": 5 }],
    "requestId": "req_k1l2m3",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 403 INSUFFICIENT_SCOPE

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "Permissão insuficiente",
    "details": [{ "required": "results:approve", "granted": ["results:read"] }],
    "requestId": "req_n4o5p6",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 14.5 POST /results/{id}/reject

Rejeita resultado com justificativa.

### Request body

```json
{
  "reason": "Valor não confere com comprovante",
  "notes": "Recalcular e reenviar"
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 1001,
    "status": "rejected",
    "approved": false,
    "rejectionReason": "Valor não confere com comprovante",
    "approvedBy": 1,
    "approvedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_q7r8s9", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 MISSING_REQUIRED_FIELD

```json
{
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Justificativa é obrigatória para rejeição",
    "details": [{ "field": "reason", "rule": "required" }],
    "requestId": "req_t0u1v2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 14.6 GET /results/export

Exporta resultados em CSV, XLSX ou PDF.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `format` | enum | `csv` | `csv`, `xlsx`, `pdf` |
| `dateFrom` | date | — | Data início |
| `dateTo` | date | — | Data fim |
| `userId` | integer | — | Filtrar por usuário |
| `indicatorId` | integer | — | Filtrar por indicador |
| `status` | enum | — | Status |
| `columns` | string | — | Colunas a incluir |

### Response 200 OK (CSV)

```
HTTP/1.1 200 OK
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="results_2025-08-15.csv"
X-Request-Id: req_w3x4y5

id,userId,userName,indicatorId,indicatorName,resultDate,value,status
1001,10,João Silva,3,Venda de Perfumes,2025-08-15,1250.50,pending
1002,11,Maria Souza,3,Venda de Perfumes,2025-08-15,980.00,approved
```

### Response 202 Accepted (async para PDF grande)

```json
{
  "data": {
    "jobId": "job_exp_abc123",
    "status": "processing",
    "estimatedTimeSec": 30,
    "pollUrl": "/v1/jobs/job_exp_abc123"
  },
  "meta": { "requestId": "req_z6a7b8", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 15 — Campanhas

## 15.1 GET /campaigns

Lista campanhas.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens |
| `sort` | string | `startDate:desc` | Ordenação |
| `status` | enum | — | `draft`, `scheduled`, `active`, `paused`, `ended`, `archived`, `cancelled` |
| `type` | enum | — | `ranking`, `tournament`, `milestone` |
| `period` | string | — | `2025-08` |
| `branchId` | integer | — | Filial participante |
| `participantId` | integer | — | Usuário participante |
| `include` | string | — | `awards`, `participants`, `creator` |

### Response 200 OK

```json
{
  "data": [
    {
      "id": 12,
      "uuid": "cmp_12a9b8c7",
      "name": "Campanha Dia dos Pais",
      "description": "Quem vender mais perfumes no Dia dos Pais ganha",
      "objective": "Aumentar venda de perfumes",
      "startDate": "2025-08-01",
      "endDate": "2025-08-10",
      "status": "active",
      "type": "ranking",
      "participantCount": 4,
      "awardCount": 3,
      "createdAt": "2025-07-20T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1, "hasNext": false, "hasPrev": false },
    "requestId": "req_c9d0e1",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 15.2 POST /campaigns

Cria campanha.

### Request body

```json
{
  "name": "Campanha Dia dos Pais",
  "description": "Quem vender mais perfumes no Dia dos Pais ganha",
  "objective": "Aumentar venda de perfumes",
  "type": "ranking",
  "startDate": "2025-08-01",
  "endDate": "2025-08-10",
  "rules": {
    "indicators": [
      { "id": 3, "weight": 1.0 },
      { "id": 5, "weight": 0.5 }
    ],
    "target": "max",
    "minParticipants": 3,
    "tiebreak": "highest_single_day"
  },
  "participantIds": [10, 11, 12, 13],
  "branchIds": [1, 2],
  "autoStart": true
}
```

### Response 201 Created

```json
{
  "data": {
    "id": 13,
    "uuid": "cmp_13b0c9d8",
    "name": "Campanha Dia dos Pais",
    "description": "Quem vender mais perfumes no Dia dos Pais ganha",
    "objective": "Aumentar venda de perfumes",
    "type": "ranking",
    "startDate": "2025-08-01",
    "endDate": "2025-08-10",
    "status": "scheduled",
    "rules": {
      "indicators": [
        { "id": 3, "weight": 1.0 },
        { "id": 5, "weight": 0.5 }
      ],
      "target": "max",
      "minParticipants": 3,
      "tiebreak": "highest_single_day"
    },
    "participantIds": [10, 11, 12, 13],
    "participantCount": 4,
    "branchIds": [1, 2],
    "companyId": 1,
    "createdBy": 1,
    "createdAt": "2025-08-15T14:30:00Z",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_f2g3h4", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 BUSINESS_RULE_VIOLATION

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Campanha deve ter pelo menos 1 indicador",
    "details": [{ "field": "rules.indicators", "min": 1 }],
    "requestId": "req_i5j6k7",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 15.3 GET /campaigns/{id}

Detalha campanha com ranking ao vivo.

### Response 200 OK

```json
{
  "data": {
    "id": 12,
    "uuid": "cmp_12a9b8c7",
    "name": "Campanha Dia dos Pais",
    "description": "Quem vender mais perfumes no Dia dos Pais ganha",
    "objective": "Aumentar venda de perfumes",
    "startDate": "2025-08-01",
    "endDate": "2025-08-10",
    "status": "active",
    "type": "ranking",
    "rules": {
      "indicators": [
        { "id": 3, "name": "Venda de Perfumes", "weight": 1.0 },
        { "id": 5, "name": "Atendimentos", "weight": 0.5 }
      ],
      "target": "max",
      "minParticipants": 3,
      "tiebreak": "highest_single_day"
    },
    "participants": [
      { "userId": 10, "userName": "João Silva", "branchId": 1, "score": 12500.50, "position": 1 },
      { "userId": 11, "userName": "Maria Souza", "branchId": 1, "score": 9800.00, "position": 2 },
      { "userId": 12, "userName": "Pedro Costa", "branchId": 2, "score": 8500.00, "position": 3 },
      { "userId": 13, "userName": "Ana Lima", "branchId": 2, "score": 7400.00, "position": 4 }
    ],
    "awards": [
      { "id": 25, "position": 1, "title": "1º Lugar", "type": "voucher", "value": 500.00 },
      { "id": 26, "position": 2, "title": "2º Lugar", "type": "voucher", "value": 300.00 },
      { "id": 27, "position": 3, "title": "3º Lugar", "type": "voucher", "value": 150.00 }
    ],
    "stats": {
      "totalScore": 38200.50,
      "avgScore": 9550.13,
      "daysElapsed": 8,
      "daysTotal": 10
    },
    "createdAt": "2025-07-20T10:00:00Z",
    "startedAt": "2025-08-01T00:00:00Z"
  },
  "meta": { "requestId": "req_l8m9n0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 15.4 POST /campaigns/{id}/participants

Adiciona participantes à campanha.

### Request body

```json
{
  "userIds": [14, 15, 16]
}
```

### Response 200 OK

```json
{
  "data": {
    "campaignId": 12,
    "added": 3,
    "skipped": 0,
    "totalParticipants": 7
  },
  "meta": { "requestId": "req_o1p2q3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 409 CAMPAIGN_ALREADY_ACTIVE

```json
{
  "error": {
    "code": "CAMPAIGN_ALREADY_ACTIVE",
    "message": "Não é possível adicionar participantes a campanha ativa",
    "details": [{ "status": "active", "startedAt": "2025-08-01T00:00:00Z" }],
    "requestId": "req_r4s5t6",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 15.5 POST /campaigns/{id}/awards

Define premiações da campanha.

### Request body

```json
{
  "awards": [
    {
      "position": 1,
      "title": "1º Lugar — Dia dos Pais",
      "description": "Voucher de R$ 500 + Troféu",
      "type": "voucher",
      "value": 500.00,
      "currency": "BRL",
      "imageUrl": "https://cdn.orion.com/awards/voucher500.png",
      "metadata": { "partner": "Amazon", "expiryDays": 90 }
    },
    {
      "position": 2,
      "title": "2º Lugar",
      "description": "Voucher de R$ 300",
      "type": "voucher",
      "value": 300.00,
      "currency": "BRL"
    }
  ]
}
```

### Response 201 Created

```json
{
  "data": {
    "campaignId": 12,
    "awardsCreated": 2,
    "awards": [
      { "id": 25, "position": 1, "title": "1º Lugar — Dia dos Pais", "value": 500.00 },
      { "id": 26, "position": 2, "title": "2º Lugar", "value": 300.00 }
    ]
  },
  "meta": { "requestId": "req_u7v8w9", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 15.6 POST /campaigns/{id}/start

Inicia campanha (transição `scheduled` → `active`).

### Response 200 OK

```json
{
  "data": {
    "id": 12,
    "status": "active",
    "startedAt": "2025-08-15T14:30:00Z",
    "participantCount": 4,
    "notificationsSent": 4
  },
  "meta": { "requestId": "req_x0y1z2", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 15.7 POST /campaigns/{id}/end

Encerra campanha manualmente.

### Response 200 OK

```json
{
  "data": {
    "id": 12,
    "status": "ended",
    "endedAt": "2025-08-15T14:30:00Z",
    "winners": [
      { "position": 1, "userId": 10, "awardId": 25, "awardTitle": "1º Lugar — Dia dos Pais" },
      { "position": 2, "userId": 11, "awardId": 26, "awardTitle": "2º Lugar" },
      { "position": 3, "userId": 12, "awardId": 27, "awardTitle": "3º Lugar" }
    ]
  },
  "meta": { "requestId": "req_a3b4c5", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 16 — Premiações

## 16.1 GET /awards

Lista todas as premiações da empresa.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `campaignId` | integer | — | Filtrar por campanha |
| `type` | enum | — | Tipo de prêmio |
| `awarded` | boolean | — | Premiados vs. pendentes |

### Response 200 OK

```json
{
  "data": [
    {
      "id": 25,
      "campaignId": 12,
      "campaignName": "Campanha Dia dos Pais",
      "position": 1,
      "title": "1º Lugar — Dia dos Pais",
      "type": "voucher",
      "value": 500.00,
      "currency": "BRL",
      "winnerUserId": 10,
      "winnerName": "João Silva",
      "awardedAt": "2025-08-10T18:00:00Z"
    }
  ],
  "meta": { "requestId": "req_d6e7f8", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 16.2 POST /awards/{id}/redeem

Marca premiação como resgatada pelo usuário.

### Request body

```json
{
  "redeemCode": "AMZ-XYZ-12345",
  "redeemedAt": "2025-08-15T14:30:00Z"
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 25,
    "status": "redeemed",
    "redeemCode": "AMZ-XYZ-12345",
    "redeemedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_g9h0i1", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 17 — Ranking

## 17.1 GET /rankings

Lista ranking com filtros.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `period` | enum | `monthly` | `daily`, `weekly`, `monthly`, `quarterly`, `yearly` |
| `year` | integer | ano atual | Ano |
| `month` | integer | mês atual | Mês (1-12) |
| `branchId` | integer | — | Filtrar por filial |
| `campaignId` | integer | — | Ranking da campanha |
| `scope` | enum | — | `user`, `branch`, `company` |
| `indicatorId` | integer | — | Ranking por indicador específico |
| `limit` | integer | 50 | Top N (max 200) |
| `include` | string | — | `user`, `branch`, `results` |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/rankings?period=monthly&year=2025&month=8&branchId=1&limit=20" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": [
    {
      "position": 1,
      "previousPosition": 2,
      "userId": 10,
      "userName": "João Silva",
      "userAvatar": "https://cdn.orion.com/avatars/usr_10.png",
      "branchId": 1,
      "branchName": "Loja Centro",
      "score": 12500.50,
      "goalAchievement": 125.5,
      "trend": "up",
      "trendValue": 1,
      "results": [
        { "indicatorId": 3, "indicatorName": "Venda de Perfumes", "value": 12500.50, "goal": 10000, "achievement": 125.5 },
        { "indicatorId": 5, "indicatorName": "Atendimentos", "value": 42, "goal": 50, "achievement": 84.0 }
      ],
      "period": { "start": "2025-08-01", "end": "2025-08-31" },
      "campaignId": null
    },
    {
      "position": 2,
      "previousPosition": 1,
      "userId": 11,
      "userName": "Maria Souza",
      "branchId": 1,
      "branchName": "Loja Centro",
      "score": 9800.00,
      "goalAchievement": 98.0,
      "trend": "down",
      "trendValue": -1,
      "results": [
        { "indicatorId": 3, "indicatorName": "Venda de Perfumes", "value": 9800.00, "goal": 10000, "achievement": 98.0 }
      ]
    }
  ],
  "meta": {
    "period": { "type": "monthly", "year": 2025, "month": 8, "start": "2025-08-01", "end": "2025-08-31" },
    "totalParticipants": 32,
    "lastUpdated": "2025-08-15T14:00:00Z",
    "requestId": "req_j2k3l4",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 17.2 GET /rankings/me

Retorna posição do usuário autenticado.

### Response 200 OK

```json
{
  "data": {
    "position": 1,
    "previousPosition": 2,
    "userId": 10,
    "userName": "João Silva",
    "score": 12500.50,
    "goalAchievement": 125.5,
    "trend": "up",
    "trendValue": 1,
    "results": [
      { "indicatorId": 3, "indicatorName": "Venda de Perfumes", "value": 12500.50, "goal": 10000, "achievement": 125.5 }
    ],
    "neighbors": [
      { "position": 2, "userId": 11, "userName": "Maria Souza", "score": 9800.00 },
      { "position": 3, "userId": 12, "userName": "Pedro Costa", "score": 8500.00 }
    ],
    "period": { "start": "2025-08-01", "end": "2025-08-31" }
  },
  "meta": { "requestId": "req_m5n6o7", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 17.3 GET /rankings/branches

Ranking de filiais.

### Response 200 OK

```json
{
  "data": [
    {
      "position": 1,
      "branchId": 1,
      "branchName": "Loja Centro",
      "branchCode": "LOJA-001",
      "score": 45200.50,
      "avgScorePerUser": 3766.71,
      "userCount": 12,
      "goalAchievement": 92.3,
      "trend": "up"
    },
    {
      "position": 2,
      "branchId": 2,
      "branchName": "Loja Norte",
      "branchCode": "LOJA-002",
      "score": 38100.00,
      "avgScorePerUser": 3175.00,
      "userCount": 12,
      "goalAchievement": 78.5,
      "trend": "down"
    }
  ],
  "meta": { "requestId": "req_p8q9r0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 18 — Dashboards e Widgets

## 18.1 GET /dashboards

Lista dashboards do usuário ou da empresa.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `type` | enum | — | `user`, `company`, `branch` |
| `isDefault` | boolean | — | Apenas default |
| `isShared` | boolean | — | Apenas compartilhados |

### Response 200 OK

```json
{
  "data": [
    {
      "id": 5,
      "uuid": "dsh_5d6e7f8a",
      "name": "Dashboard Comercial",
      "description": "Visão geral de vendas por filial",
      "type": "company",
      "ownerId": 1,
      "isDefault": true,
      "isShared": false,
      "layout": "grid",
      "columns": 3,
      "widgetCount": 6,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-08-10T15:00:00Z"
    }
  ],
  "meta": { "requestId": "req_s1t2u3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 18.2 POST /dashboards

Cria dashboard personalizado.

### Request body

```json
{
  "name": "Meu Dashboard",
  "description": "Acompanhamento pessoal",
  "type": "user",
  "layout": "grid",
  "columns": 2,
  "background": "light",
  "isShared": false
}
```

### Response 201 Created

```json
{
  "data": {
    "id": 8,
    "uuid": "dsh_8e9f0a1b",
    "name": "Meu Dashboard",
    "description": "Acompanhamento pessoal",
    "type": "user",
    "ownerId": 10,
    "isDefault": false,
    "isShared": false,
    "layout": "grid",
    "columns": 2,
    "background": "light",
    "widgetCount": 0,
    "createdAt": "2025-08-15T14:30:00Z",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_v4w5x6", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 18.3 PUT /dashboards/{id}

Atualiza layout do dashboard.

### Request body

```json
{
  "name": "Dashboard Comercial - Atualizado",
  "columns": 4,
  "background": "dark"
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 5,
    "name": "Dashboard Comercial - Atualizado",
    "columns": 4,
    "background": "dark",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_y7z8a9", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 18.4 GET /dashboards/{id}/widgets

Lista widgets do dashboard.

### Response 200 OK

```json
{
  "data": [
    {
      "id": 22,
      "uuid": "wdg_22e7f8a9",
      "dashboardId": 5,
      "type": "line_chart",
      "title": "Vendas Diárias",
      "subtitle": "Últimos 30 dias",
      "position": { "x": 0, "y": 0, "w": 2, "h": 1 },
      "config": {
        "indicatorId": 3,
        "period": "30d",
        "aggregation": "daily",
        "color": "#9333EA",
        "showGoal": true,
        "showTrend": true
      },
      "dataLastUpdated": "2025-08-15T14:00:00Z",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-08-15T14:00:00Z"
    },
    {
      "id": 23,
      "type": "kpi_card",
      "title": "Meta de Agosto",
      "position": { "x": 2, "y": 0, "w": 1, "h": 1 },
      "config": { "goalId": 42, "showProgress": true, "showDelta": true }
    }
  ],
  "meta": { "requestId": "req_b0c1d2", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 18.5 POST /dashboards/{id}/widgets

Adiciona widget ao dashboard.

### Request body

```json
{
  "type": "bar_chart",
  "title": "Vendas por Filial",
  "subtitle": "Comparativo mensal",
  "position": { "x": 0, "y": 1, "w": 2, "h": 1 },
  "config": {
    "indicatorId": 3,
    "period": "monthly",
    "groupBy": "branch",
    "color": "#3B82F6",
    "showLegend": true
  }
}
```

### Response 201 Created

```json
{
  "data": {
    "id": 24,
    "uuid": "wdg_24a9b8c7",
    "dashboardId": 5,
    "type": "bar_chart",
    "title": "Vendas por Filial",
    "subtitle": "Comparativo mensal",
    "position": { "x": 0, "y": 1, "w": 2, "h": 1 },
    "config": {
      "indicatorId": 3,
      "period": "monthly",
      "groupBy": "branch",
      "color": "#3B82F6",
      "showLegend": true
    },
    "createdAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_e3f4g5", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 18.6 GET /dashboards/{id}/widgets/{widgetId}/data

Retorna dados processados do widget (cache de 5 min).

### Response 200 OK

```json
{
  "data": {
    "widgetId": 22,
    "type": "line_chart",
    "series": [
      {
        "name": "Vendas Diárias",
        "color": "#9333EA",
        "points": [
          { "x": "2025-07-16", "y": 850.00 },
          { "x": "2025-07-17", "y": 920.50 },
          { "x": "2025-08-15", "y": 1250.50 }
        ]
      },
      {
        "name": "Meta diária",
        "color": "#10B981",
        "points": [
          { "x": "2025-07-16", "y": 1000.00 },
          { "x": "2025-07-17", "y": 1000.00 },
          { "x": "2025-08-15", "y": 1000.00 }
        ]
      }
    ],
    "summary": {
      "total": 38500.50,
      "avg": 1283.35,
      "max": 1520.30,
      "min": 850.00,
      "trend": "up",
      "trendPercent": 12.5
    },
    "cacheExpiresAt": "2025-08-15T14:35:00Z"
  },
  "meta": { "requestId": "req_h6i7j8", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 19 — Notificações

## 19.1 GET /notifications

Lista notificações do usuário autenticado.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 20 | Itens (max 100) |
| `read` | boolean | — | Lidas vs. não lidas |
| `archived` | boolean | false | Incluir arquivadas |
| `type` | string | — | `goal.achieved`, `result.approved`, etc. |
| `category` | enum | — | `success`, `info`, `warning`, `error` |
| `priority` | enum | — | `low`, `medium`, `high`, `urgent` |
| `dateFrom` | datetime | — | Criadas a partir de |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/notifications?read=false&priority=high&limit=10" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": [
    {
      "id": 999,
      "uuid": "ntf_999a8b7c",
      "type": "goal.achieved",
      "category": "success",
      "priority": "high",
      "title": "Meta atingida! 🎉",
      "message": "Você atingiu 125% da meta de Venda de Perfumes em agosto.",
      "data": {
        "goalId": 42,
        "indicatorId": 3,
        "achievementPercent": 125.5
      },
      "actionUrl": "/goals/42",
      "actionLabel": "Ver meta",
      "read": false,
      "readAt": null,
      "archived": false,
      "expiresAt": "2025-09-15T00:00:00Z",
      "createdAt": "2025-08-15T14:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 10, "total": 23, "totalPages": 3, "hasNext": true, "hasPrev": false },
    "unreadCount": 8,
    "requestId": "req_k9l0m1",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 19.2 POST /notifications/mark-read

Marca notificações específicas como lidas.

### Request body

```json
{
  "ids": [999, 998, 997]
}
```

### Response 200 OK

```json
{
  "data": {
    "marked": 3,
    "unreadRemaining": 5
  },
  "meta": { "requestId": "req_n2o3p4", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 FOREIGN_KEY_VIOLATION

```json
{
  "error": {
    "code": "FOREIGN_KEY_VIOLATION",
    "message": "Notificação 9999 não pertence ao usuário",
    "details": [{ "id": 9999 }],
    "requestId": "req_q5r6s7",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 19.3 POST /notifications/mark-all-read

Marca todas como lidas.

### Response 200 OK

```json
{
  "data": {
    "marked": 8,
    "unreadRemaining": 0
  },
  "meta": { "requestId": "req_t8u9v0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 19.4 DELETE /notifications/{id}

Arquiva notificação.

### Response 204 No Content

Sem body.

---

## 19.5 GET /notifications/unread-count

Retorna contagem de não lidas (para badge).

### Response 200 OK

```json
{
  "data": {
    "unread": 8,
    "byPriority": { "urgent": 1, "high": 3, "medium": 4, "low": 0 }
  },
  "meta": { "requestId": "req_w1x2y3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 19.6 GET /notifications/settings

Retorna preferências de notificação do usuário.

### Response 200 OK

```json
{
  "data": {
    "channels": {
      "inApp": true,
      "email": true,
      "push": false,
      "sms": false
    },
    "categories": {
      "goal.achieved": { "inApp": true, "email": true, "push": true },
      "result.approved": { "inApp": true, "email": true, "push": false },
      "campaign.started": { "inApp": true, "email": false, "push": false },
      "license.expiring": { "inApp": true, "email": true, "push": true }
    },
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "08:00",
      "timezone": "America/Sao_Paulo"
    }
  },
  "meta": { "requestId": "req_z4a5b6", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 20 — Logs de Auditoria

## 20.1 GET /audit-logs

Lista logs de auditoria. Exige permissão `audit:read`.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 50 | Itens (max 200) |
| `sort` | string | `createdAt:desc` | Ordenação |
| `userId` | integer | — | Filtrar por usuário |
| `action` | enum | — | `create`, `update`, `delete`, `login`, etc. |
| `entity` | string | — | `User`, `Branch`, `Goal`, etc. |
| `entityId` | integer | — | ID da entidade |
| `tableName` | string | — | Nome da tabela |
| `dateFrom` | datetime | — | A partir de |
| `dateTo` | datetime | — | Até |
| `ip` | string | — | IP específico |
| `requestId` | string | — | Correlacionar request |
| `cursor` | string | — | Cursor pagination (para datasets grandes) |

### Exemplo curl

```bash
curl -X GET "https://api.orion.suaempresa.com/v1/audit-logs?entity=User&action=update&dateFrom=2025-08-15T00:00:00Z&limit=50" \
  -H "Authorization: Bearer eyJhbGc..."
```

### Response 200 OK

```json
{
  "data": [
    {
      "id": 5001,
      "uuid": "aud_5001b6c5",
      "userId": 1,
      "userName": "Admin Master",
      "companyId": 1,
      "action": "update",
      "entity": "User",
      "entityId": 10,
      "entityUuid": "usr_10a3f8c2",
      "tableName": "users",
      "changes": {
        "before": { "roleId": 3, "status": "inactive" },
        "after": { "roleId": 5, "status": "active" }
      },
      "ip": "200.150.10.20",
      "userAgent": "Mozilla/5.0 (Orion-Frontend/1.0)",
      "requestId": "req_abc123",
      "sessionId": "ses_xyz789",
      "metadata": { "reason": "Reativação após férias" },
      "createdAt": "2025-08-15T14:30:00Z"
    },
    {
      "id": 5000,
      "uuid": "aud_5000a5b4",
      "userId": 10,
      "userName": "João Silva",
      "companyId": 1,
      "action": "login",
      "entity": "User",
      "entityId": 10,
      "ip": "200.150.10.20",
      "userAgent": "Mozilla/5.0 (Orion-Frontend/1.0)",
      "createdAt": "2025-08-15T13:45:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 50, "total": 1240, "totalPages": 25, "hasNext": true, "hasPrev": false },
    "requestId": "req_c7d8e9",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 403 INSUFFICIENT_SCOPE

```json
{
  "error": {
    "code": "INSUFFICIENT_SCOPE",
    "message": "Permissão insuficiente",
    "details": [{ "required": "audit:read", "granted": [] }],
    "requestId": "req_f0g1h2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 20.2 GET /audit-logs/export

Exporta logs em CSV ou PDF.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `format` | enum | `csv` | `csv`, `xlsx`, `pdf` |
| `dateFrom` | datetime | — | A partir de |
| `dateTo` | datetime | — | Até |
| `entity` | string | — | Filtrar entidade |
| `action` | enum | — | Filtrar ação |
| `userId` | integer | — | Filtrar usuário |

### Response 200 OK (CSV)

```
HTTP/1.1 200 OK
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="audit_logs_2025-08-15.csv"

id,timestamp,userId,userName,action,entity,entityId,ip,changes
5001,2025-08-15T14:30:00Z,1,Admin Master,update,User,10,200.150.10.20,"{""before"":{""roleId"":3}}"
5000,2025-08-15T13:45:00Z,10,João Silva,login,User,10,200.150.10.20,
```

### Response 413 PAYLOAD_TOO_LARGE

Período muito extenso:

```json
{
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Período muito extenso. Máximo 90 dias por export.",
    "details": [{ "requestedDays": 365, "maxDays": 90 }],
    "requestId": "req_i3j4k5",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

# Capítulo 21 — Licenciamento e Backups

## 21.1 POST /license/activate

Ativa licença com chave.

### Request body

```json
{
  "key": "ORION-PRO-ABCD-EFGH-IJKL-MNOP",
  "companyName": "Perfumes ABC Ltda",
  "companyDocument": "12.345.678/0001-90"
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 1,
    "uuid": "lic_1c2d3e4f",
    "companyId": 1,
    "key": "ORION-PRO-XXXX-XXXX-XXXX-XXXX",
    "plan": "professional",
    "status": "active",
    "maxUsers": 50,
    "maxBranches": 5,
    "maxIndicators": 100,
    "features": ["ai_insights", "webhooks", "api_access", "audit_export"],
    "startedAt": "2025-01-01T00:00:00Z",
    "expiresAt": "2026-01-01T00:00:00Z",
    "gracePeriodDays": 7,
    "activatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_l6m7n8", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 BUSINESS_RULE_VIOLATION

Chave já ativada:

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Licença já ativada em outra empresa",
    "details": [{ "conflictingCompanyId": 5, "activatedAt": "2025-06-10T00:00:00Z" }],
    "requestId": "req_o9p0q1",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 404 RECORD_NOT_FOUND

Chave inválida:

```json
{
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "Chave de licença inválida",
    "requestId": "req_r2s3t4",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 21.2 GET /license/status

Retorna status atual da licença.

### Response 200 OK

```json
{
  "data": {
    "id": 1,
    "uuid": "lic_1c2d3e4f",
    "plan": "professional",
    "status": "active",
    "maxUsers": 50,
    "maxBranches": 5,
    "maxIndicators": 100,
    "maxDashboards": 20,
    "currentUsers": 32,
    "currentBranches": 3,
    "currentIndicators": 18,
    "currentDashboards": 8,
    "startedAt": "2025-01-01T00:00:00Z",
    "expiresAt": "2026-01-01T00:00:00Z",
    "daysUntilExpiry": 139,
    "gracePeriodDays": 7,
    "features": ["ai_insights", "webhooks", "api_access", "audit_export", "custom_indicators", "campaigns_unlimited"],
    "usage": {
      "users": { "used": 32, "limit": 50, "percent": 64.0 },
      "branches": { "used": 3, "limit": 5, "percent": 60.0 },
      "indicators": { "used": 18, "limit": 100, "percent": 18.0 }
    }
  },
  "meta": { "requestId": "req_u5v6w7", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 200 OK (licença expirando)

```json
{
  "data": {
    "plan": "professional",
    "status": "expiring",
    "expiresAt": "2025-08-22T00:00:00Z",
    "daysUntilExpiry": 7,
    "warningLevel": "high"
  },
  "meta": { "requestId": "req_x8y9z0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 21.3 POST /license/verify

Verifica licença (chamada interna do sistema, heartbeat).

### Response 200 OK

```json
{
  "data": {
    "valid": true,
    "status": "active",
    "expiresAt": "2026-01-01T00:00:00Z",
    "lastVerifiedAt": "2025-08-15T14:30:00Z",
    "nextVerificationAt": "2025-08-16T14:30:00Z"
  },
  "meta": { "requestId": "req_a1b2c3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 21.4 GET /backups

Lista backups da empresa.

### Response 200 OK

```json
{
  "data": [
    {
      "id": 45,
      "uuid": "bkp_45d3e4f5",
      "type": "automatic",
      "status": "completed",
      "size": 52428800,
      "sizeFormatted": "50 MB",
      "format": "pg_dump",
      "startedAt": "2025-08-15T02:00:00Z",
      "completedAt": "2025-08-15T02:05:30Z",
      "durationSec": 330,
      "retentionDays": 30,
      "expiresAt": "2025-09-14T02:00:00Z",
      "downloadUrl": null,
      "createdAt": "2025-08-15T02:00:00Z"
    }
  ],
  "meta": { "requestId": "req_d4e5f6", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 21.5 POST /backups

Cria backup manual. Exige plano `professional` ou superior.

### Request body

```json
{
  "type": "manual",
  "format": "pg_dump",
  "description": "Backup antes da migração de agosto",
  "tables": ["users", "branches", "indicators", "goals", "results"]
}
```

### Response 202 Accepted

```json
{
  "data": {
    "id": 46,
    "uuid": "bkp_46e4f5g6",
    "status": "queued",
    "type": "manual",
    "estimatedTimeSec": 300,
    "pollUrl": "/v1/backups/46",
    "createdAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_g7h8i9", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 403 LICENSE_RESTRICTED

```json
{
  "error": {
    "code": "LICENSE_RESTRICTED",
    "message": "Backup manual disponível apenas a partir do plano professional",
    "details": [{ "currentPlan": "starter", "requiredPlan": "professional" }],
    "requestId": "req_j0k1l2",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 21.6 GET /backups/{id}/download

Gera URL temporária para download do backup.

### Response 200 OK

```json
{
  "data": {
    "id": 45,
    "downloadUrl": "https://cdn.orion.com/backups/bkp_45.sql.gz?token=abc123&expires=1692127800",
    "expiresAt": "2025-08-15T15:30:00Z",
    "sizeFormatted": "50 MB"
  },
  "meta": { "requestId": "req_m3n4o5", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 22 — Webhooks

## 22.1 Eventos Disponíveis

| Evento | Disparado quando | Payload |
|--------|------------------|---------|
| `user.created` | Novo usuário cadastrado | `userId` |
| `user.updated` | Usuário atualizado | `userId`, `changes` |
| `user.deleted` | Usuário desativado | `userId` |
| `branch.created` | Nova filial | `branchId` |
| `branch.updated` | Filial atualizada | `branchId`, `changes` |
| `indicator.created` | Novo indicador | `indicatorId` |
| `indicator.updated` | Indicador atualizado | `indicatorId`, `version` |
| `goal.created` | Nova meta atribuída | `goalId` |
| `goal.updated` | Meta atualizada | `goalId`, `changes` |
| `goal.achieved` | Meta atingida ou superada | `goalId`, `achievementPercent` |
| `goal.failed` | Meta não atingida ao fim do período | `goalId`, `finalPercent` |
| `result.created` | Resultado lançado | `resultId` |
| `result.approved` | Resultado aprovado | `resultId`, `approvedBy` |
| `result.rejected` | Resultado rejeitado | `resultId`, `reason` |
| `campaign.started` | Campanha iniciou | `campaignId` |
| `campaign.ended` | Campanha encerrou | `campaignId`, `winners` |
| `ranking.updated` | Ranking recalculado | `period`, `topUserId` |
| `license.expiring` | Licença expira em 7 dias | `expiresAt` |
| `license.expired` | Licença expirou | `expiredAt` |
| `backup.completed` | Backup concluído | `backupId`, `size` |

## 22.2 Payload Padrão

```json
{
  "event": "goal.achieved",
  "eventId": "evt_abc123def456",
  "timestamp": "2025-08-15T14:30:00Z",
  "companyId": 1,
  "companyName": "Perfumes ABC Ltda",
  "data": {
    "goalId": 42,
    "userId": 10,
    "userName": "João Silva",
    "indicatorId": 3,
    "indicatorName": "Venda de Perfumes",
    "achievementPercent": 110.5,
    "targetValue": 30000,
    "currentValue": 33150.00
  },
  "signature": "sha256=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567"
}
```

## 22.3 Assinatura HMAC

Todo webhook é assinado com HMAC-SHA256 usando segredo configurado pelo cliente. Header:

```
X-Orion-Signature: sha256=abc123def456...
X-Orion-Event: goal.achieved
X-Orion-Event-Id: evt_abc123def456
X-Orion-Delivery: del_xyz789
Content-Type: application/json
User-Agent: Orion-Webhook/1.0
```

### Verificação (exemplo Node.js)

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
```

## 22.4 POST /webhooks

Registra novo webhook.

### Request body

```json
{
  "url": "https://meuapp.com/webhooks/orion",
  "events": [
    "goal.achieved",
    "result.approved",
    "campaign.started",
    "campaign.ended"
  ],
  "headers": {
    "X-Custom-Header": "my-value"
  },
  "metadata": {
    "description": "Integração com CRM interno"
  },
  "isActive": true
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `url` | string(url) | sim | HTTPS obrigatório |
| `events` | array | sim | Pelo menos 1 evento |
| `headers` | object | não | Máximo 10 headers |
| `metadata` | object | não | Até 1KB |
| `isActive` | boolean | não | Default true |

### Response 201 Created

```json
{
  "data": {
    "id": 7,
    "uuid": "web_7e4f5a6b",
    "companyId": 1,
    "url": "https://meuapp.com/webhooks/orion",
    "events": [
      "goal.achieved",
      "result.approved",
      "campaign.started",
      "campaign.ended"
    ],
    "secret": "whsec_abc123def456ghi789jkl012mno345pqr678",
    "isActive": true,
    "headers": { "X-Custom-Header": "my-value" },
    "metadata": { "description": "Integração com CRM interno" },
    "stats": {
      "totalSent": 0,
      "totalSuccess": 0,
      "totalFailed": 0,
      "lastSentAt": null,
      "lastStatus": null
    },
    "createdAt": "2025-08-15T14:30:00Z",
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_p6q7r8", "timestamp": "2025-08-15T14:30:00Z" }
}
```

> ⚠️ `secret` é exibido uma única vez na criação. Armazene com segurança.

### Response 422 VALIDATION_ERROR

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "URL deve ser HTTPS",
    "details": [{ "field": "url", "value": "http://meuapp.com", "rule": "https_required" }],
    "requestId": "req_s9t0u1",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 422 INVALID_ENUM

```json
{
  "error": {
    "code": "INVALID_ENUM",
    "message": "Evento inválido",
    "details": [{ "field": "events", "value": "goal.deleted", "allowed": ["goal.created", "goal.updated", "goal.achieved"] }],
    "requestId": "req_v2w3x4",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 22.5 GET /webhooks

Lista webhooks da empresa.

### Response 200 OK

```json
{
  "data": [
    {
      "id": 7,
      "uuid": "web_7e4f5a6b",
      "url": "https://meuapp.com/webhooks/orion",
      "events": ["goal.achieved", "result.approved"],
      "isActive": true,
      "stats": {
        "totalSent": 145,
        "totalSuccess": 142,
        "totalFailed": 3,
        "lastSentAt": "2025-08-15T13:50:00Z",
        "lastStatus": 200,
        "lastResponseMs": 124
      },
      "createdAt": "2025-07-01T10:00:00Z"
    }
  ],
  "meta": { "requestId": "req_y5z6a7", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 22.6 GET /webhooks/{id}

Detalha webhook.

### Response 200 OK

```json
{
  "data": {
    "id": 7,
    "uuid": "web_7e4f5a6b",
    "companyId": 1,
    "url": "https://meuapp.com/webhooks/orion",
    "events": ["goal.achieved", "result.approved"],
    "isActive": true,
    "headers": { "X-Custom-Header": "my-value" },
    "metadata": { "description": "Integração com CRM interno" },
    "stats": {
      "totalSent": 145,
      "totalSuccess": 142,
      "totalFailed": 3,
      "successRate": 97.93,
      "lastSentAt": "2025-08-15T13:50:00Z",
      "lastStatus": 200,
      "lastResponseMs": 124,
      "lastError": null
    },
    "recentDeliveries": [
      {
        "id": "del_xyz789",
        "event": "goal.achieved",
        "status": 200,
        "responseMs": 124,
        "attempt": 1,
        "deliveredAt": "2025-08-15T13:50:00Z"
      },
      {
        "id": "del_vwx234",
        "event": "goal.achieved",
        "status": 500,
        "responseMs": 5000,
        "attempt": 1,
        "deliveredAt": "2025-08-15T12:30:00Z",
        "error": "Internal Server Error"
      },
      {
        "id": "del_abc456",
        "event": "goal.achieved",
        "status": 200,
        "responseMs": 98,
        "attempt": 2,
        "deliveredAt": "2025-08-15T12:35:00Z"
      }
    ],
    "createdAt": "2025-07-01T10:00:00Z",
    "updatedAt": "2025-08-15T13:50:00Z"
  },
  "meta": { "requestId": "req_b8c9d0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 22.7 PUT /webhooks/{id}

Atualiza webhook.

### Request body

```json
{
  "url": "https://meuapp.com/webhooks/orion-v2",
  "events": ["goal.achieved", "result.approved", "campaign.started", "campaign.ended", "ranking.updated"],
  "isActive": true
}
```

### Response 200 OK

```json
{
  "data": {
    "id": 7,
    "url": "https://meuapp.com/webhooks/orion-v2",
    "events": ["goal.achieved", "result.approved", "campaign.started", "campaign.ended", "ranking.updated"],
    "isActive": true,
    "updatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_e1f2g3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 22.8 POST /webhooks/{id}/test

Envia evento de teste (event: `test.ping`) para validar a configuração.

### Response 200 OK

```json
{
  "data": {
    "delivered": true,
    "status": 200,
    "responseMs": 124,
    "deliveredAt": "2025-08-15T14:30:00Z",
    "payload": {
      "event": "test.ping",
      "eventId": "evt_test_abc123",
      "timestamp": "2025-08-15T14:30:00Z",
      "companyId": 1,
      "data": { "message": "Test webhook from Orion" }
    }
  },
  "meta": { "requestId": "req_h4i5j6", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 BUSINESS_RULE_VIOLATION (entrega falhou)

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Falha na entrega do webhook de teste",
    "details": [
      {
        "status": 0,
        "error": "ECONNREFUSED",
        "responseMs": 50,
        "attempt": 1
      }
    ],
    "requestId": "req_k7l8m9",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 22.9 POST /webhooks/{id}/rotate-secret

Gera novo secret. O anterior é imediatamente invalidado.

### Response 200 OK

```json
{
  "data": {
    "id": 7,
    "secret": "whsec_new_secret_xyz789abc456def123",
    "rotatedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_n0o1p2", "timestamp": "2025-08-15T14:30:00Z" }
}
```

> ⚠️ Atualize o secret no cliente imediatamente após a rotação.

---

## 22.10 GET /webhooks/{id}/deliveries

Lista histórico de entregas.

### Query parameters

| Parâmetro | Tipo | Default | Descrição |
|-----------|------|---------|-----------|
| `page` | integer | 1 | Página |
| `limit` | integer | 50 | Itens (max 200) |
| `event` | string | — | Filtrar por evento |
| `status` | enum | — | `success` (2xx), `failed` (4xx/5xx), `pending` |
| `dateFrom` | datetime | — | A partir de |
| `dateTo` | datetime | — | Até |

### Response 200 OK

```json
{
  "data": [
    {
      "id": "del_xyz789",
      "event": "goal.achieved",
      "eventId": "evt_abc123def456",
      "status": 200,
      "responseMs": 124,
      "attempt": 1,
      "deliveredAt": "2025-08-15T13:50:00Z",
      "requestBody": "{...}",
      "responseBody": "{\"ok\":true}"
    },
    {
      "id": "del_vwx234",
      "event": "goal.achieved",
      "eventId": "evt_def789ghi012",
      "status": 500,
      "responseMs": 5000,
      "attempt": 1,
      "deliveredAt": "2025-08-15T12:30:00Z",
      "error": "Internal Server Error",
      "nextAttemptAt": "2025-08-15T12:35:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 50, "total": 145, "totalPages": 3, "hasNext": true, "hasPrev": false },
    "requestId": "req_q3r4s5",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 22.11 POST /webhooks/{id}/deliveries/{deliveryId}/resend

Reenvia entrega específica (útil após correção no endpoint do cliente).

### Response 202 Accepted

```json
{
  "data": {
    "originalDeliveryId": "del_vwx234",
    "newDeliveryId": "del_resend_abc123",
    "status": "queued",
    "queuedAt": "2025-08-15T14:30:00Z"
  },
  "meta": { "requestId": "req_t6u7v8", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 22.12 DELETE /webhooks/{id}

Remove webhook.

### Response 204 No Content

Sem body.

## 22.13 Retry Policy

- **3 tentativas** com backoff exponencial: 1min, 5min, 30min
- Após 3 falhas consecutivas, webhook é marcado como `auto_disabled`
- Cliente é notificado por e-mail sobre a desativação
- Reativação manual via `PUT /webhooks/{id}` com `isActive: true`

---

# Capítulo 23 — Inteligência Artificial

> 📌 Endpoints AI exigem plano `professional` ou superior e feature `ai_insights` ativa.

## 23.1 POST /ai/chat

Chat com assistente AI do Orion. Tem contexto do usuário (metas, resultados, ranking).

### Request body

```json
{
  "message": "Como estou me saindo este mês comparado ao mês passado?",
  "conversationId": "conv_abc123",
  "context": {
    "period": "monthly",
    "month": "2025-08"
  }
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `message` | string | sim | Mensagem do usuário (até 4000 chars) |
| `conversationId` | string | não | Para manter contexto (auto-gerado se ausente) |
| `context` | object | não | Contexto adicional |

### Exemplo curl

```bash
curl -X POST https://api.orion.suaempresa.com/v1/ai/chat \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Como estou me saindo este mês?",
    "conversationId": "conv_abc123"
  }'
```

### Response 200 OK

```json
{
  "data": {
    "conversationId": "conv_abc123",
    "message": "Você está indo muito bem! 🎉 Em agosto você atingiu 41,7% da meta de Venda de Perfumes (R$ 12.500 de R$ 30.000), com 16 dias restantes no mês. Isso representa um crescimento de 18% em relação a julho, quando você estava em 35,5% no mesmo período. Sua projeção é fechar o mês em R$ 25.834, o que representa 86% da meta. Para atingir a meta, você precisaria vender R$ 1.094 por dia nos próximos 16 dias — média viável considerando seus últimos 7 dias.",
    "suggestions": [
      "Quais produtos mais vendi este mês?",
      "Compare meu desempenho com a equipe",
      "Gere sugestões de metas para setembro"
    ],
    "citations": [
      { "type": "goal", "id": 42, "label": "Meta de Venda de Perfumes - Agosto" },
      { "type": "result", "id": 1001, "label": "Resultado de 15/08" }
    ],
    "tokensUsed": { "input": 850, "output": 220, "total": 1070 },
    "model": "orion-ai-v1"
  },
  "meta": { "requestId": "req_w9x0y1", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 403 LICENSE_RESTRICTED

```json
{
  "error": {
    "code": "LICENSE_RESTRICTED",
    "message": "Recurso AI disponível apenas a partir do plano professional",
    "details": [{ "currentPlan": "starter", "requiredPlan": "professional" }],
    "requestId": "req_z2a3b4",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

### Response 429 QUOTA_EXCEEDED

```json
{
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Cota mensal de AI excedida (1000 mensagens)",
    "details": [{ "used": 1000, "limit": 1000, "resetAt": "2025-09-01T00:00:00Z" }],
    "requestId": "req_c5d6e7",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 23.2 POST /ai/insights

Gera insights automáticos sobre o desempenho da empresa/equipe/usuário.

### Request body

```json
{
  "scope": "user",
  "userId": 10,
  "period": "monthly",
  "month": "2025-08",
  "types": ["trends", "anomalies", "recommendations"]
}
```

### Response 200 OK

```json
{
  "data": {
    "scope": "user",
    "userId": 10,
    "period": { "month": "2025-08", "start": "2025-08-01", "end": "2025-08-31" },
    "insights": [
      {
        "id": "ins_abc123",
        "type": "trend",
        "priority": "positive",
        "title": "Crescimento consistente em vendas",
        "description": "Suas vendas cresceram 18% nos últimos 7 dias comparado à semana anterior. Tendência sugere que você atingirá 86% da meta de agosto.",
        "metric": "growth_rate",
        "value": 18.0,
        "evidence": [
          { "indicatorId": 3, "week1": 8200.00, "week2": 9676.00 }
        ],
        "generatedAt": "2025-08-15T14:30:00Z"
      },
      {
        "id": "ins_def456",
        "type": "anomaly",
        "priority": "warning",
        "title": "Queda de produtividade às segundas",
        "description": "Suas vendas de segunda são 32% menores que a média dos outros dias. Considere estratégias específicas para o início da semana.",
        "metric": "day_of_week_pattern",
        "value": -32.0,
        "evidence": [
          { "day": "monday", "avgSales": 580.00 },
          { "day": "other", "avgSales": 853.00 }
        ],
        "generatedAt": "2025-08-15T14:30:00Z"
      },
      {
        "id": "ins_ghi789",
        "type": "recommendation",
        "priority": "high",
        "title": "Foque em perfumes importados",
        "description": "Perfumes importados representam apenas 15% das suas vendas, mas têm margem 2.3x maior. Recomendamos ampliar o foco neste segmento.",
        "metric": "product_mix",
        "actionUrl": "/indicators/5",
        "generatedAt": "2025-08-15T14:30:00Z"
      }
    ],
    "summary": {
      "totalInsights": 3,
      "positive": 1,
      "warnings": 1,
      "recommendations": 1
    }
  },
  "meta": { "requestId": "req_f8g9h0", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 23.3 POST /ai/suggest-goals

Sugere metas com base em histórico, sazonalidade e benchmarks.

### Request body

```json
{
  "scope": "user",
  "userId": 10,
  "indicatorId": 3,
  "goalType": "monthly",
  "month": "2025-09",
  "strategy": "realistic"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `strategy` | enum | não | `conservative`, `realistic`, `ambitious` (default: `realistic`) |

### Response 200 OK

```json
{
  "data": {
    "userId": 10,
    "indicatorId": 3,
    "period": "2025-09",
    "suggestions": [
      {
        "strategy": "conservative",
        "targetValue": 28000,
        "rationale": "Baseado na média dos últimos 3 meses (R$ 26.500), com crescimento histórico de 6%.",
        "confidence": 0.92,
        "factors": [
          { "name": "media_3m", "value": 26500, "weight": 0.4 },
          { "name": "growth_trend", "value": 1.06, "weight": 0.3 },
          { "name": "seasonality", "value": 1.0, "weight": 0.2 },
          { "name": "benchmark", "value": 28000, "weight": 0.1 }
        ]
      },
      {
        "strategy": "realistic",
        "targetValue": 32000,
        "rationale": "Considera crescimento de 18% observado em agosto e sazonalidade favorável de setembro (mês de primavera).",
        "confidence": 0.78,
        "factors": [
          { "name": "recent_momentum", "value": 1.18, "weight": 0.4 },
          { "name": "seasonality_september", "value": 1.05, "weight": 0.3 },
          { "name": "media_6m", "value": 28000, "weight": 0.2 },
          { "name": "team_benchmark", "value": 30000, "weight": 0.1 }
        ]
      },
      {
        "strategy": "ambitious",
        "targetValue": 38000,
        "rationale": "Desafia o vendedor a superar 120% da meta de agosto. Risco de não atingir: 35%.",
        "confidence": 0.55,
        "factors": [
          { "name": "stretch_factor", "value": 1.20, "weight": 0.5 },
          { "name": "best_month_ever", "value": 35000, "weight": 0.3 },
          { "name": "seasonality_september", "value": 1.05, "weight": 0.2 }
        ]
      }
    ],
    "recommendedStrategy": "realistic",
    "recommendedTargetValue": 32000
  },
  "meta": { "requestId": "req_i1j2k3", "timestamp": "2025-08-15T14:30:00Z" }
}
```

### Response 422 BUSINESS_RULE_VIOLATION

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Dados históricos insuficientes para gerar sugestão (mínimo 3 meses)",
    "details": [{ "availableMonths": 1, "required": 3 }],
    "requestId": "req_l4m5n6",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

---

## 23.4 POST /ai/forecast

Previsão de resultados futuros com base em histórico.

### Request body

```json
{
  "indicatorId": 3,
  "scope": "company",
  "horizonDays": 30,
  "confidence": 0.95
}
```

### Response 200 OK

```json
{
  "data": {
    "indicatorId": 3,
    "horizonDays": 30,
    "forecast": [
      { "date": "2025-08-16", "predicted": 1350.00, "lower": 1100.00, "upper": 1600.00 },
      { "date": "2025-08-17", "predicted": 1380.00, "lower": 1120.00, "upper": 1640.00 },
      { "date": "2025-08-31", "predicted": 1520.00, "lower": 1200.00, "upper": 1840.00 }
    ],
    "total": {
      "predicted": 41200.00,
      "lower": 33500.00,
      "upper": 48900.00
    },
    "confidence": 0.95,
    "model": "prophet-v2",
    "accuracy": { "mape": 8.5, "rmse": 145.3 },
    "factors": ["historical_pattern", "day_of_week", "seasonality", "trend"]
  },
  "meta": { "requestId": "req_o7p8q9", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

## 23.5 GET /ai/usage

Retorna uso da AI (cota mensal).

### Response 200 OK

```json
{
  "data": {
    "period": "2025-08",
    "quota": 1000,
    "used": 247,
    "remaining": 753,
    "percentUsed": 24.7,
    "byEndpoint": {
      "ai.chat": 180,
      "ai.insights": 12,
      "ai.suggest-goals": 45,
      "ai.forecast": 10
    },
    "resetAt": "2025-09-01T00:00:00Z"
  },
  "meta": { "requestId": "req_r0s1t2", "timestamp": "2025-08-15T14:30:00Z" }
}
```

---

# Capítulo 24 — Rate Limiting

## 24.1 Limites por Plano

| Plano | Requests/min | Requests/hora | Requests/dia |
|-------|--------------|---------------|--------------|
| Starter | 60 | 1.000 | 10.000 |
| Professional | 300 | 10.000 | 100.000 |
| Enterprise | 1.000 | 100.000 | 1.000.000 |
| Custom | Variável | Variável | Variável |

## 24.2 Headers de Rate Limit

Todo response inclui:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1692124200
X-RateLimit-Policy: 60;w=60
```

## 24.3 Limites Específicos por Endpoint

| Endpoint | Limite (independente do plano) |
|----------|--------------------------------|
| `POST /auth/login` | 5/min por IP |
| `POST /auth/forgot-password` | 3/hora por e-mail |
| `POST /auth/reset-password` | 5/hora por token |
| `POST /ai/*` | 30/min por usuário |
| `POST /results/batch` | 10/min por empresa |
| `GET /audit-logs/export` | 5/hora por empresa |
| `POST /backups` | 2/dia por empresa |

## 24.4 Resposta 429 RATE_LIMIT_EXCEEDED

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de 60 requests por minuto excedido",
    "retryAfter": 45,
    "details": [
      {
        "limit": 60,
        "window": "60s",
        "resetAt": "2025-08-15T14:31:00Z"
      }
    ],
    "requestId": "req_u3v4w5",
    "timestamp": "2025-08-15T14:30:15Z"
  }
}
```

## 24.5 Quota Mensal (AI)

```json
{
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Cota mensal de AI excedida",
    "details": [
      {
        "used": 1000,
        "limit": 1000,
        "resetAt": "2025-09-01T00:00:00Z"
      }
    ],
    "requestId": "req_x6y7z8",
    "timestamp": "2025-08-15T14:30:00Z"
  }
}
```

## 24.6 Estratégia de Retry

Clientes **devem** implementar backoff exponencial com jitter:

```javascript
async function retryWithBackoff(fn, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fn();
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60');
        const jitter = Math.random() * 1000;
        await sleep(retryAfter * 1000 + jitter);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await sleep(backoff);
    }
  }
}
```

---

# Capítulo 25 — Versionamento e Depreciação

## 25.1 Estratégia de Versionamento

- **Versionamento na URL:** `/v1/`, `/v2/`, etc.
- Versões major exigem bump quando há breaking changes
- Non-breaking changes (novos campos opcionais, novos endpoints) não exigem bump
- Suporte simultâneo a no máximo 2 versões major

### Breaking changes

- Remoção de campo em response
- Mudança de tipo de campo
- Mudança de URL/path
- Mudança de comportamento default
- Mudança de código de erro

### Non-breaking changes

- Adição de novo campo opcional em request/response
- Adição de novo endpoint
- Adição de novo valor em enum
- Mudança de mensagem de erro (mantendo code)

## 25.2 Política de Depreciação

1. **Anúncio:** endpoint marcado como deprecado na doc + header `Deprecation: true` em todas as respostas
2. **Período de graça:** 6 meses com suporte e bug fixes
3. **Sunset:** após 6 meses, endpoint retorna `410 Gone` com redirect para versão sucessora
4. **Remoção:** 12 meses após anúncio, endpoint é removido

### Headers de Deprecação

Endpoints deprecados retornam:

```
Deprecation: true
Sunset: Wed, 15 Aug 2026 00:00:00 GMT
Link: <https://api.orion.com/v2/endpoint>; rel="successor-version"
X-Orion-Deprecation-Notice: Endpoint will be removed on 2026-08-15
```

### Exemplo de resposta com depreciação

```json
{
  "data": {
    "id": 10,
    "name": "João Silva",
    "email": "joao@empresa.com"
  },
  "meta": {
    "requestId": "req_a9b0c1",
    "timestamp": "2025-08-15T14:30:00Z",
    "deprecation": {
      "deprecated": true,
      "sunsetAt": "2026-08-15T00:00:00Z",
      "successorUrl": "/v2/users/10",
      "migrationGuide": "https://docs.orion.com/migration/v1-to-v2"
    }
  }
}
```

## 25.3 Changelog

Mudanças significativas são publicadas em `https://docs.orion.com/api/changelog` e notificadas via:

- E-mail para administradores da empresa
- Webhook `api.changelog` (opcional, deve ser subscrito)
- Dashboard admin: banner de "Novidades da API"

## 25.4 Compatibilidade Retroativa

Clientes **devem** ser tolerantes a:

- Novos campos em responses (ignorar desconhecidos)
- Novos valores em enums (tratar como desconhecido)
- Novos códigos de erro (tratar como erro genérico)
- Reordenação de campos em objetos JSON

Clientes **não devem** depender de:

- Ordem de campos em responses
- Mensagens de erro (usar `code` para lógica, não `message`)
- Valores de `requestId` (apenas para correlação de logs)

---

# Capítulo 26 — SDKs Oficiais

Disponibilizamos SDKs oficiais para JavaScript/TypeScript, Python e PHP, todos gerados automaticamente a partir da especificação OpenAPI.

## 26.1 JavaScript / TypeScript — `@orion/sdk-js`

### Instalação

```bash
npm install @orion/sdk-js
# ou
yarn add @orion/sdk-js
```

### Uso básico

```javascript
import { OrionClient } from '@orion/sdk-js';

const client = new OrionClient({
  baseUrl: 'https://api.orion.suaempresa.com/v1',
  accessToken: '<JWT_ACCESS_TOKEN>',
  refreshToken: '<REFRESH_TOKEN>',
  onTokenRefresh: (tokens) => {
    // Persistir novos tokens
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },
  language: 'pt-BR',
  timeout: 30000,
  retry: { attempts: 3, backoff: 'exponential' }
});

// Login
const { accessToken, refreshToken, user } = await client.auth.login({
  login: 'joao@empresa.com',
  password: 'MinhaSenh@123'
});

// Listar usuários
const users = await client.users.list({
  branchId: 1,
  status: 'active',
  include: ['role'],
  page: 1,
  limit: 20
});

// Criar meta
const goal = await client.goals.create({
  scope: 'user',
  userId: 10,
  indicatorId: 3,
  goalType: 'monthly',
  startDate: '2025-08-01',
  endDate: '2025-08-31',
  targetValue: 30000
});

// Lançar resultado (com idempotência)
const result = await client.results.create({
  userId: 10,
  indicatorId: 3,
  resultDate: '2025-08-15',
  value: 1250.50
}, {
  idempotencyKey: crypto.randomUUID()
});

// Chat com AI
const chat = await client.ai.chat({
  message: 'Como estou me saindo este mês?',
  conversationId: 'conv_abc123'
});

// Tratamento de erro
try {
  await client.users.create({ name: '', email: 'invalid' });
} catch (err) {
  if (err.code === 'VALIDATION_ERROR') {
    err.details.forEach(d => console.error(`${d.field}: ${d.message}`));
  }
}
```

### Webhooks helper

```javascript
import { verifyWebhookSignature } from '@orion/sdk-js/webhooks';

app.post('/webhooks/orion', (req, res) => {
  const signature = req.headers['x-orion-signature'];
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.ORION_WEBHOOK_SECRET
  );
  if (!isValid) return res.status(401).send('Invalid signature');

  const { event, data } = req.body;
  switch (event) {
    case 'goal.achieved':
      notifyCRM(data);
      break;
    case 'result.approved':
      syncERP(data);
      break;
  }
  res.status(200).send('OK');
});
```

---

## 26.2 Python — `orion-sdk-python`

### Instalação

```bash
pip install orion-sdk-python
```

### Uso básico

```python
from orion_sdk import OrionClient
from orion_sdk.exceptions import ValidationError, RateLimitError

client = OrionClient(
    base_url='https://api.orion.suaempresa.com/v1',
    access_token='<JWT_ACCESS_TOKEN>',
    refresh_token='<REFRESH_TOKEN>',
    on_token_refresh=lambda tokens: save_tokens(tokens),
    language='pt-BR',
    timeout=30,
    retry_attempts=3
)

# Login
auth = client.auth.login(
    login='joao@empresa.com',
    password='MinhaSenh@123'
)
print(auth.user.name)

# Listar usuários
users = client.users.list(
    branch_id=1,
    status='active',
    include=['role'],
    page=1,
    limit=20
)
for user in users.data:
    print(f"{user.id}: {user.name} ({user.email})")

# Criar meta
goal = client.goals.create(
    scope='user',
    user_id=10,
    indicator_id=3,
    goal_type='monthly',
    start_date='2025-08-01',
    end_date='2025-08-31',
    target_value=30000
)

# Lançar resultado (com idempotência)
import uuid
result = client.results.create(
    user_id=10,
    indicator_id=3,
    result_date='2025-08-15',
    value=1250.50,
    _idempotency_key=str(uuid.uuid4())
)

# Chat com AI
chat = client.ai.chat(
    message='Como estou me saindo este mês?',
    conversation_id='conv_abc123'
)
print(chat.message)

# Tratamento de erro
try:
    client.users.create(name='', email='invalid')
except ValidationError as err:
    for detail in err.details:
        print(f"{detail.field}: {detail.message}")
except RateLimitError as err:
    print(f"Rate limit. Retry em {err.retry_after}s")
```

### Async support

```python
import asyncio
from orion_sdk import AsyncOrionClient

async def main():
    client = AsyncOrionClient(base_url='...', access_token='...')

    # Requisições concorrentes
    users, goals, results = await asyncio.gather(
        client.users.list(branch_id=1),
        client.goals.list(status='active'),
        client.results.list(date_from='2025-08-01')
    )

asyncio.run(main())
```

### Webhooks helper (FastAPI)

```python
from fastapi import FastAPI, Request, HTTPException
from orion_sdk.webhooks import verify_signature

app = FastAPI()

@app.post('/webhooks/orion')
async def webhook(request: Request):
    body = await request.body()
    signature = request.headers.get('x-orion-signature', '')

    if not verify_signature(body, signature, WEBHOOK_SECRET):
        raise HTTPException(status_code=401, detail='Invalid signature')

    payload = await request.json()
    event = payload['event']
    data = payload['data']

    if event == 'goal.achieved':
        await notify_crm(data)
    elif event == 'result.approved':
        await sync_erp(data)

    return {'status': 'ok'}
```

---

## 26.3 PHP — `orion/sdk-php`

### Instalação

```bash
composer require orion/sdk-php
```

### Uso básico

```php
<?php
require 'vendor/autoload.php';

use Orion\Sdk\OrionClient;
use Orion\Sdk\Exceptions\ValidationException;
use Orion\Sdk\Exceptions\RateLimitException;

$client = new OrionClient([
    'base_url' => 'https://api.orion.suaempresa.com/v1',
    'access_token' => '<JWT_ACCESS_TOKEN>',
    'refresh_token' => '<REFRESH_TOKEN>',
    'on_token_refresh' => function ($tokens) {
        saveTokens($tokens);
    },
    'language' => 'pt-BR',
    'timeout' => 30,
    'retry' => ['attempts' => 3, 'backoff' => 'exponential']
]);

// Login
$auth = $client->auth->login([
    'login' => 'joao@empresa.com',
    'password' => 'MinhaSenh@123'
]);
echo $auth->user->name . PHP_EOL;

// Listar usuários
$users = $client->users->list([
    'branchId' => 1,
    'status' => 'active',
    'include' => ['role'],
    'page' => 1,
    'limit' => 20
]);
foreach ($users->data as $user) {
    echo "{$user->id}: {$user->name} ({$user->email})\n";
}

// Criar meta
$goal = $client->goals->create([
    'scope' => 'user',
    'userId' => 10,
    'indicatorId' => 3,
    'goalType' => 'monthly',
    'startDate' => '2025-08-01',
    'endDate' => '2025-08-31',
    'targetValue' => 30000
]);

// Lançar resultado (com idempotência)
$result = $client->results->create([
    'userId' => 10,
    'indicatorId' => 3,
    'resultDate' => '2025-08-15',
    'value' => 1250.50
], [
    'idempotency_key' => uniqid('', true)
]);

// Chat com AI
$chat = $client->ai->chat([
    'message' => 'Como estou me saindo este mês?',
    'conversationId' => 'conv_abc123'
]);
echo $chat->message . PHP_EOL;

// Tratamento de erro
try {
    $client->users->create(['name' => '', 'email' => 'invalid']);
} catch (ValidationException $e) {
    foreach ($e->details as $detail) {
        echo "{$detail->field}: {$detail->message}\n";
    }
} catch (RateLimitException $e) {
    echo "Rate limit. Retry em {$e->retryAfter}s\n";
}
```

### Webhooks helper (Laravel)

```php
<?php
use Orion\Sdk\Webhooks\SignatureVerifier;

Route::post('/webhooks/orion', function (Request $request) {
    $signature = $request->header('x-orion-signature');
    $body = $request->getContent();

    if (!SignatureVerifier::verify($body, $signature, env('ORION_WEBHOOK_SECRET'))) {
        return response('Invalid signature', 401);
    }

    $payload = $request->json()->all();
    $event = $payload['event'];
    $data = $payload['data'];

    switch ($event) {
        case 'goal.achieved':
            NotifyCrm::dispatch($data);
            break;
        case 'result.approved':
            SyncErp::dispatch($data);
            break;
    }

    return response()->json(['status' => 'ok']);
});
```

---

## 26.4 Recursos Comuns aos SDKs

Todos os SDKs oficiais oferecem:

| Recurso | Descrição |
|---------|-----------|
| **Auto-refresh de token** | Renova access token automaticamente quando expira |
| **Retry com backoff** | Retentativa automática em 429 e 5xx |
| **Idempotência** | Helpers para gerar e reusar `Idempotency-Key` |
| **Paginação automática** | Iteradores que percorrem todas as páginas |
| **Tipagem forte** | TypeScript e Python com tipos gerados |
| **Validação local** | Validação de schema antes de enviar request |
| **Logs estruturados** | Integrável com pino (Node), logging (Python), Monolog (PHP) |
| **Métricas** | Contadores de requests, latência, erros |
| **Webhook verifier** | Helper para verificar assinatura HMAC |
| **OpenTelemetry** | Tracing distribuído opcional |

### Paginação automática (JS)

```javascript
for await (const user of client.users.listAll({ status: 'active' })) {
  console.log(user.name);
  if (user.id > 1000) break; // pode parar a qualquer momento
}
```

### Paginação automática (Python)

```python
for user in client.users.list_all(status='active'):
    print(user.name)
    if user.id > 1000:
        break
```

---

## 26.5 Community SDKs (não oficiais)

A comunidade mantém SDKs para outras linguagens, mas sem garantia de suporte oficial:

- **Go** — `github.com/community/orion-go`
- **Ruby** — `orion-sdk-ruby` (gem)
- **Java** — `io.github.community:orion-sdk-java`
- **C# / .NET** — `Orion.Sdk.NET`
- **Rust** — `orion-sdk-rs`

---

# Capítulo 27 — Documentação Interativa

## 27.1 Recursos Disponíveis

| Recurso | URL | Descrição |
|---------|-----|-----------|
| **Swagger UI** | `https://api.orion.com/docs` | Documentação interativa (teste online) |
| **ReDoc** | `https://api.orion.com/redoc` | Documentação legível e impressa |
| **Postman Collection** | `https://api.orion.com/postman.json` | Importação para Postman |
| **Insomnia Collection** | `https://api.orion.com/insomnia.json` | Importação para Insomnia |
| **OpenAPI Spec** | `https://api.orion.com/openapi.yaml` | Especificação OpenAPI 3.1 |
| **Changelog** | `https://docs.orion.com/api/changelog` | Histórico de mudanças |
| **Migration Guides** | `https://docs.orion.com/api/migrations` | Guias de migração entre versões |
| **Status Page** | `https://status.orion.com` | Status em tempo real da API |
| **Community Forum** | `https://community.orion.com` | Fórum de desenvolvedores |
| **Support** | `api-support@orion.com` | Suporte por e-mail (SLA conforme plano) |

## 27.2 Sandbox / Test Environment

Cada empresa pode criar até 3 ambientes sandbox gratuitos:

- Dados isolados (não afetam produção)
- Rate limit dobrado para testes
- Reset automático a cada 30 dias
- Acesso via `https://sandbox-api.orion.com/v1`

### Criar sandbox

```bash
curl -X POST https://api.orion.suaempresa.com/v1/sandboxes \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Testes de Integração",
    "basedOn": "production",
    "expiresInDays": 30
  }'
```

### Response 201 Created

```json
{
  "data": {
    "id": "snd_abc123",
    "name": "Testes de Integração",
    "baseUrl": "https://sandbox-api.orion.com/v1",
    "apiKey": "snd_key_xyz789...",
    "expiresAt": "2025-09-14T14:30:00Z",
    "createdAt": "2025-08-15T14:30:00Z"
  }
}
```

## 27.3 Postman Collection — Estrutura

A collection oficial inclui:

- **Variáveis:** `{{baseUrl}}`, `{{accessToken}}`, `{{refreshToken}}`, `{{companyId}}`
- **Scripts de pré-request:** Auto-injeção de `Authorization`, `X-Request-Id`, `Idempotency-Key`
- **Scripts de teste:** Validação de schema, extração automática de tokens
- **Environments:** Production, Staging, Sandbox
- **Pasta por domínio:** Auth, Users, Indicators, Goals, Results, Campaigns, etc.

## 27.4 Health Check

### GET /health

Endpoint público (sem auth) para verificar disponibilidade.

```json
{
  "status": "ok",
  "version": "1.4.2",
  "uptime": 86400,
  "timestamp": "2025-08-15T14:30:00Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "queue": "ok",
    "ai": "ok",
    "storage": "ok"
  }
}
```

### GET /health/ready

Verifica se o serviço está pronto para receber tráfego (para load balancers).

### GET /health/live

Verifica se o processo está vivo (para Kubernetes liveness probe).

## 27.5 Métricas Públicas

### GET /metrics

Retorna métricas Prometheus (autenticado):

```
# HELP orion_http_requests_total Total HTTP requests
# TYPE orion_http_requests_total counter
orion_http_requests_total{method="GET",endpoint="/v1/users",status="200"} 45230
orion_http_requests_total{method="POST",endpoint="/v1/auth/login",status="200"} 1240
orion_http_requests_total{method="POST",endpoint="/v1/auth/login",status="401"} 87

# HELP orion_http_request_duration_seconds Request duration
# TYPE orion_http_request_duration_seconds histogram
orion_http_request_duration_seconds_bucket{endpoint="/v1/users",le="0.1"} 42100
orion_http_request_duration_seconds_bucket{endpoint="/v1/users",le="0.5"} 45000
orion_http_request_duration_seconds_bucket{endpoint="/v1/users",le="1.0"} 45200

# HELP orion_rate_limit_hits_total Rate limit hits
# TYPE orion_rate_limit_hits_total counter
orion_rate_limit_hits_total{plan="professional"} 12
```

---

# Apêndice A — Exemplos de Integração Completos

## A.1 Integração ERP → Orion (sincronização de vendas)

Script Python que sincroniza vendas do ERP com resultados no Orion:

```python
import asyncio
from datetime import date
from orion_sdk import AsyncOrionClient

async def sync_erp_to_orion(erp_sales):
    client = AsyncOrionClient(
        base_url='https://api.orion.suaempresa.com/v1',
        access_token=get_orion_token()
    )

    # Mapeia vendas do ERP para formato Orion
    results = []
    for sale in erp_sales:
        results.append({
            'userId': map_erp_user_to_orion(sale.user_id),
            'indicatorId': 3,  # Venda de Perfumes
            'resultDate': sale.date.isoformat(),
            'value': sale.amount,
            'source': 'erp',
            'notes': f'Sync ERP - pedido {sale.order_id}'
        })

    # Envia em batch (máx 500 por request)
    batch_size = 500
    for i in range(0, len(results), batch_size):
        batch = results[i:i + batch_size]
        response = await client.results.create_batch(
            results=batch,
            on_conflict='skip'
        )
        print(f"Batch {i//batch_size + 1}: {response.created} created, {response.skipped} skipped")

asyncio.run(sync_erp_to_orion(fetch_erp_sales(date.today())))
```

## A.2 Webhook → Slack (notificação de meta atingida)

Serviço Node.js que recebe webhook do Orion e notifica no Slack:

```javascript
const express = require('express');
const crypto = require('crypto');
const { WebClient } = require('@slack/web-api');

const app = express();
const slack = new WebClient(process.env.SLACK_TOKEN);

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.post('/webhooks/orion', async (req, res) => {
  const signature = req.headers['x-orion-signature'];
  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.ORION_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;

  if (event === 'goal.achieved') {
    await slack.chat.postMessage({
      channel: '#vendas',
      text: `:tada: *${data.userName}* atingiu ${data.achievementPercent}% da meta de ${data.indicatorName}!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:tada: *Meta Atingida!*\n\n*Vendedor:* ${data.userName}\n*Indicador:* ${data.indicatorName}\n*Atingimento:* ${data.achievementPercent}%\n*Valor:* R$ ${data.currentValue.toLocaleString('pt-BR')}`
          }
        }
      ]
    });
  }

  res.status(200).send('OK');
});

app.listen(3000);
```

## A.3 Dashboard externo (BI) consumindo ranking

Aplicação React que exibe ranking ao vivo:

```jsx
import { useEffect, useState } from 'react';
import { OrionClient } from '@orion/sdk-js';

const client = new OrionClient({
  baseUrl: 'https://api.orion.suaempresa.com/v1',
  accessToken: localStorage.getItem('orion_token')
});

export function LiveRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await client.rankings.list({
        period: 'monthly',
        year: 2025,
        month: 8,
        limit: 20,
        include: ['user', 'results']
      });
      setRanking(response.data);
      setLoading(false);
    }
    load();

    // Polling a cada 30 segundos
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Vendedor</th>
          <th>Score</th>
          <th>Atingimento</th>
          <th>Tendência</th>
        </tr>
      </thead>
      <tbody>
        {ranking.map(entry => (
          <tr key={entry.userId}>
            <td>{entry.position}</td>
            <td>{entry.userName}</td>
            <td>R$ {entry.score.toLocaleString('pt-BR')}</td>
            <td>{entry.goalAchievement}%</td>
            <td>{entry.trend === 'up' ? '↑' : entry.trend === 'down' ? '↓' : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

# Apêndice B — Glossário

| Termo | Significado |
|-------|-------------|
| **JWT** | JSON Web Token, padrão de autenticação stateless |
| **Refresh Token** | Token de longa duração usado para renovar access tokens |
| **TOTP** | Time-based One-Time Password, padrão de 2FA |
| **HMAC** | Hash-based Message Authentication Code |
| **ETag** | Entity Tag, para concorrência otimista |
| **Idempotency-Key** | Header para garantir idempotência em POST |
| **Soft delete** | Marcação como removido sem exclusão física |
| **Multi-tenant** | Arquitetura onde múltiplas empresas compartilham a mesma instância |
| **Scope** | Escopo de atuação de uma meta/papel (user, branch, company) |
| **Sparse fieldsets** | Seleção de apenas alguns campos para reduzir payload |
| **Cursor pagination** | Paginação baseada em cursor ao invés de offset |
| **Backoff exponencial** | Estratégia de retry com espera crescente |
| **Idempotência** | Propriedade onde múltiplas execuções produzem mesmo resultado |
| **OpenAPI** | Especificação padrão para descrever APIs REST |
| **Backpressure** | Mecanismo para lidar com sobrecarga de requisições |

---

# Apêndice C — Referências

- [OpenAPI Specification 3.1](https://spec.openapis.org/oas/v3.1.0)
- [RFC 7807 — Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc7807)
- [RFC 6749 — OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 7519 — JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [RFC 6238 — TOTP](https://datatracker.ietf.org/doc/html/rfc6238)
- [RFC 7232 — Conditional Requests (ETag)](https://datatracker.ietf.org/doc/html/rfc7232)
- [JSON API — Specification](https://jsonapi.org/)
- [REST API Design Best Practices](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)

---

**Fim do Documento 10 — API Specification**

*Documento mantido em conjunto com a especificação OpenAPI em `openapi.yaml`. Qualquer divergência entre este documento e a especificação OpenAPI deve ser tratada como bug e reportada via issue no repositório `orion/api-specs`.*
