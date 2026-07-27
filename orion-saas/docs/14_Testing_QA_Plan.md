# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 14

# TESTING & QA PLAN

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Plano de Testes e Garantia de Qualidade
**Cobertura Alvo:** 70% geral · 90% módulos críticos · 100% UCs críticos
**Stack de Testes:** Vitest (unit/integration) · Playwright (E2E) · k6 (performance) · axe-core (a11y) · Stryker (mutation) · fast-check (property-based)

---

## Sumário

- **Parte I — Fundações:** Caps. 1–8 (objetivo, pirâmide, ambientes, isolamento, mocks, factories, data management, parallel exec)
- **Parte II — Unit & Integração:** Caps. 9–12 (padrões, matchers customizados, integração, auth helpers)
- **Parte III — Casos de Teste por UC (Admin/SysAdmin):** Cap. 13 — UC-001 a UC-020
- **Parte IV — Casos de Teste por UC (Executivo/Gerente):** Cap. 14 — UC-021 a UC-040
- **Parte V — Casos de Teste por UC (Supervisor/Vendedor/Auth/LGPD):** Cap. 15 — UC-041 a UC-059
- **Parte VI — E2E:** Caps. 16–18 (estratégia, Page Objects, cenários críticos)
- **Parte VII — Testes Especializados:** Caps. 19–29 (segurança, performance, a11y, cross-browser, PWA, IA, migrações, ERP, visual regression, mutation, property-based)
- **Parte VIII — Processo, Reporting & Checklists:** Caps. 30–39 (CI/CD, dashboards, KPIs, triage, DoD/DoR, checklists, flakiness, apêndices)

---

# PARTE I — FUNDAÇÕES

# Capítulo 1 — Objetivo e Escopo

## 1.1 Objetivo

Este documento define a estratégia completa de testes e qualidade do Projeto Orion: tipos de testes, cobertura exigida, ferramentas, processos de QA, critérios de aceite para release, metodologia de teste para cada um dos 59 casos de uso (UC-001 a UC-059), além de estratégias para testes de segurança, performance, acessibilidade, IA, migrações de banco, integrações ERP/CRM, visual regression, mutation testing e property-based testing.

## 1.2 Escopo

| Aspecto | Incluso | Excluso |
|---------|---------|---------|
| Backend (Next.js API routes / Server Actions) | ✅ Unit, integration, contract | — |
| Frontend (React Server Components + Client) | ✅ Component, integration, E2E, a11y, visual | Testes de design tokens |
| Database (Prisma + PostgreSQL) | ✅ Migration, RLS, constraints | Performance tuning do SGBD |
| Integrações (ERP/CRM/WhatsApp/Email) | ✅ Contract, mock, sandbox | Testes em produção do parceiro |
| IA (LLM) | ✅ Mock de respostas, evals, prompt regression | Treino de modelos |
| Infra (Docker, CI/CD) | ✅ Smoke, deployment | Provisionamento de cloud |
| Mobile/PWA | ✅ A11y, offline, cross-browser | Testes em device farms externos |

## 1.3 Princípios de Teste

1. **Shift-left:** testes são escritos junto com o código (ou antes, via TDD), não depois.
2. **Pirâmide respeitada:** 60% unit / 30% integration / 10% E2E. Inverter a pirâmide é considerado débito técnico.
3. **Testes são código de produção:** recebem code review, lint, type-check e refatoração.
4. **Determinismo acima de tudo:** um teste flaky é tratado como P1 até ser corrigido ou removido.
5. **Isolamento total:** nenhum teste depende de estado deixado por outro.
6. **Multi-tenant first:** todos os testes que tocam banco validam isolamento entre tenants.
7. **Banco real para integração:** mocks para unit; banco PostgreSQL efêmero (Docker) para integration e E2E.
8. **Coverage é buggy, não meta:** 70% é o piso; o teto é "todo caminho crítico coberto por teste que captura regressões reais".

## 1.4 Cobertura Mínima por Módulo

| Módulo | Cobertura Mínima | Justificativa |
|--------|------------------|---------------|
| Core (companies, branches, users) | 90% | Dados mestre, erro aqui corrompe todo o resto |
| Auth & Sessions | 95% | Superfície de ataque principal |
| Licenciamento | 95% | Impacto financeiro direto |
| Auditoria | 90% | Conformidade LGPD |
| Goals & Results | 90% | Núcleo de negócio |
| Rankings & Campaigns | 85% | Cálculos visíveis para cliente |
| AI Module | 75% | Mocks de LLM + evals; tolerância maior pela não-determinismo |
| Notifications | 80% | Fila com retry, idempotência crítica |
| ERP/CRM Integration | 80% | Adapters com mapeamento complexo |
| Dashboard/UI | 60% | Component test + E2E críticos |
| Utils/helpers | 80% | Funções puras, fácil de cobrir |

---

# Capítulo 2 — Pirâmide de Testes

```
            ▲
           / \
          / E2E\          10% (Críticos, ~25 cenários)
         /-------\
        / Integração \    30%
       /---------------\
      /    Unitários    \ 60%
     /--------------------\
```

| Tipo | % Alvo | Ferramenta | Quando usar |
|------|--------|------------|-------------|
| Unitários | 60% | Vitest + jest-mock-extended | Lógica de domínio, serviços, utils, validações |
| Integração | 30% | Vitest + supertest + Testcontainers DB | API routes, repositórios, fluxos multi-tabela |
| E2E | 10% | Playwright | Fluxos completos críticos (login, lançamento, dashboard) |
| Contract | Por integração | Pact | ERP/CRM/WhatsApp contracts |
| Performance | Cenários críticos | k6 | Dashboard, lançamento, ranking, AI chat |
| Segurança | Pentest trimestral | OWASP ZAP, Burp, sqlmap | Staging semanal |
| Acessibilidade | WCAG 2.1 AA | axe-core + manual | Toda página nova |
| Mutation | Mensal em módulos críticos | Stryker | Goals, Results, Auth |
| Property-based | Cálculos puros | fast-check | Rankings, progress %, distribuição de metas |
| Visual regression | Por PR em componentes | Playwright + screenshot diff | UI components, dashboards |
| Cross-browser | Diário em staging | BrowserStack / Playwright | Chrome, Firefox, Safari, Edge, mobile |

## 2.1 Distribuição Numérica Alvo

Considerando base de ~3.500 testes:
- Unitários: ~2.100 arquivos `.test.ts`
- Integração: ~1.050 arquivos `.integration.test.ts`
- E2E: ~250 specs Playwright
- Performance: ~15 scripts k6
- A11y: ~40 specs Playwright com axe
- Contract: ~30 pactos

---

# Capítulo 3 — Ambientes e Infraestrutura de Teste

## 3.1 Ambientes

| Ambiente | URL | Propósito | DB | Reset |
|----------|-----|-----------|-----|-------|
| Local | http://localhost:3000 | Desenvolvimento | `orion_dev` (Docker) | Manual |
| Test (CI) | efêmero por job | Unit + Integration | `orion_test_<job>` em container | Automático por teste |
| Dev | https://dev.orion.com | Desenvolvimento integrado | `orion_dev` compartilhado | Diário 02:00 |
| Staging | https://staging.orion.com | QA pré-produção | `orion_staging` | Sob demanda |
| Production | https://app.orion.com | Cliente | `orion_prod` | Nunca |

## 3.2 docker-compose.test.yml

```yaml
# docker-compose.test.yml
version: '3.9'

services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: orion_test
      POSTGRES_PASSWORD: orion_test
      POSTGRES_DB: orion_test
    ports:
      - "5433:5432"  # porta diferente do dev
    tmpfs:
      - /var/lib/postgresql/data  # RAM para velocidade
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orion_test"]
      interval: 2s
      timeout: 3s
      retries: 20

  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    tmpfs:
      - /data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 2s
      timeout: 3s
      retries: 10

  mailhog-test:
    image: mailhog/mailhog:latest
    ports:
      - "8026:8026"  # UI
      - "1026:1025"  # SMTP

  minio-test:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports:
      - "9001:9001"
      - "9000:9000"
    tmpfs:
      - /data

  mock-erp-test:
    image: wiremock/wiremock:3.5.4
    ports:
      - "8080:8080"
    volumes:
      - ./test/mocks/erp:/home/wiremock
    command: ["--global-response-templating", "--port", "8080"]
```

## 3.3 Setup do banco de teste

```typescript
// test/setup-db.ts
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } },
});

beforeAll(async () => {
  // Aplica migrations no banco de teste
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
    stdio: 'inherit',
  });
  // Aplica seed mínimo
  await seedTestData(prisma);
}, 120_000);

afterAll(async () => {
  await prisma.$disconnect();
});

export async function seedTestData(prisma: PrismaClient) {
  // Companies
  await prisma.company.createMany({
    data: [
      { id: 1, name: 'Empresa A', slug: 'empresa-a', plan: 'enterprise', status: 'active' },
      { id: 2, name: 'Empresa B', slug: 'empresa-b', plan: 'pro', status: 'active' },
      { id: 3, name: 'Empresa Trial', slug: 'empresa-trial', plan: 'trial', status: 'active', trialEndsAt: new Date('2025-12-31') },
    ],
  });
  // Branches
  await prisma.branch.createMany({
    data: [
      { id: 1, companyId: 1, name: 'Matriz SP', code: 'SP01' },
      { id: 2, companyId: 1, name: 'Filial RJ', code: 'RJ01' },
      { id: 3, companyId: 2, name: 'Matriz BH', code: 'BH01' },
    ],
  });
  // Roles & permissions já vêm do seed default
}
```

## 3.4 Variáveis de ambiente de teste

```bash
# .env.test
NODE_ENV=test
DATABASE_URL="postgresql://orion_test:orion_test@localhost:5433/orion_test?schema=public"
REDIS_URL="redis://localhost:6380"
JWT_SECRET="test-secret-min-32-chars-aaaaaaaaaaaaaaaa"
JWT_EXPIRES_IN="1h"
REFRESH_TOKEN_TTL_DAYS=7
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minio"
S3_SECRET_KEY="minio123"
S3_BUCKET="orion-test"
SMTP_HOST="localhost"
SMTP_PORT="1026"
ERP_API_BASE_URL="http://localhost:8080"
LLM_PROVIDER="mock"
RATE_LIMIT_ENABLED="false"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

## 3.5 Vitest config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts', './test/setup-db.ts'],
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['node_modules', 'e2e', 'tests/perf'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary', 'html'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/**/__mocks__/**',
        'test/**',
        'e2e/**',
        'scripts/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1,
        isolate: true,
      },
    },
    reporters: ['default', 'junit', ['json', { outputFile: 'test-results.json' }]],
    outputFile: 'test-results.xml',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test'),
    },
  },
});
```

---

# Capítulo 4 — Test Data Management

## 4.1 Estratégia

- **Dev/Local:** seed com 3 tenants, 30 usuários, 50 metas, 500 resultados (sintético via faker).
- **CI:** banco resetado por job; seed mínimo (3 companies, roles, 1 admin por tenant).
- **Staging:** subset anonimizado de produção semanal (PII mascarada).
- **Produção:** nunca seed; apenas migrations.

## 4.2 Seed determinístico

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/locale/pt_BR';

const prisma = new PrismaClient();
faker.seed(42); // determinismo

async function main() {
  // Companies
  const companies = [];
  for (let i = 1; i <= 3; i++) {
    companies.push(await prisma.company.create({
      data: {
        id: i,
        name: faker.company.name(),
        slug: `empresa-${i}`,
        plan: i === 3 ? 'trial' : i === 1 ? 'enterprise' : 'pro',
        status: 'active',
        timezone: 'America/Sao_Paulo',
        locale: 'pt-BR',
        currency: 'BRL',
      },
    }));
  }

  // Branches
  for (const c of companies) {
    const n = c.id === 1 ? 4 : 2;
    for (let i = 0; i < n; i++) {
      await prisma.branch.create({
        data: {
          companyId: c.id,
          name: `Filial ${i + 1}`,
          code: `${c.slug.substring(0, 2).toUpperCase()}${String(i + 1).padStart(2, '0')}`,
          state: faker.location.state({ abbreviated: true }),
          city: faker.location.city(),
        },
      });
    }
  }

  // Users (5 por empresa)
  for (const c of companies) {
    const branches = await prisma.branch.findMany({ where: { companyId: c.id } });
    for (let i = 0; i < 5; i++) {
      const role = i === 0 ? 'admin' : i === 1 ? 'gerente' : 'vendedor';
      const branch = branches[i % branches.length];
      await prisma.user.create({
        data: {
          companyId: c.id,
          branchId: branch.id,
          name: faker.person.fullName(),
          email: `${role}${c.id}@empresa.com`,
          passwordHash: await bcrypt.hash('Senha@123', 10),
          role: role.toUpperCase(),
          status: 'active',
        },
      });
    }
  }

  // Indicators
  const indicators = ['faturamento', 'clientes_novos', 'ticket_medio', 'vendas_qtd', 'margem'];
  for (const c of companies) {
    for (const name of indicators) {
      await prisma.indicator.create({
        data: {
          companyId: c.id,
          name,
          code: name.toUpperCase(),
          unit: name === 'margem' ? '%' : 'BRL',
          direction: name === 'margem' ? 'up' : 'up',
          active: true,
        },
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
```

## 4.3 Anonimização de produção → staging

```typescript
// scripts/anonymize-for-staging.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.STAGING_SNAPSHOT_URL } } });

async function anonymize() {
  // Users
  const users = await prisma.user.findMany();
  for (const u of users) {
    await prisma.user.update({
      where: { id: u.id },
      data: {
        name: faker.person.fullName(),
        email: `user${u.id}@staging-anon.local`,
        phone: u.phone ? faker.phone.number() : null,
        cpf: u.cpf ? faker.string.numeric(11) : null,
      },
    });
  }
  // Limpa tokens e dados sensíveis
  await prisma.session.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.auditLog.updateMany({ data: { ipAddress: null, userAgent: null } });
}
anonymize();
```

---

# Capítulo 5 — Test Isolation e Parallel Execution

## 5.1 Estratégia de isolamento

| Nível | Estratégia |
|-------|-----------|
| Unit | Mocks completos; estado em memória; `vi.clearAllMocks()` em `beforeEach` |
| Integração | Transação por teste com rollback no `afterEach` |
| E2E | Tenant/empresa dedicado por spec; cleanup no `afterAll` |
| Performance | Banco separado; reset entre runs |

## 5.2 Transação por teste (Integration)

```typescript
// test/helpers/transactional-test.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });

let txClient: Prisma.TransactionClient | null = null;

export function getTestPrisma() {
  if (!txClient) throw new Error('Test prisma not initialized. Wrap test in withTransaction.');
  return txClient;
}

export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    txClient = tx;
    try {
      return await fn();
    } finally {
      txClient = null;
      // Lançar exceção força rollback
      throw new Error('__ROLLBACK__');
    }
  }).catch((e) => {
    if (e?.message === '__ROLLBACK__') return undefined as T;
    throw e;
  });
}

// Uso:
describe('GoalService (integration)', () => {
  it('creates goal', async () => {
    await withTransaction(async () => {
      const service = new GoalService(getTestPrisma());
      const goal = await service.createGoal({ userId: 1, indicatorId: 1, targetValue: 1000 });
      expect(goal.id).toBeDefined();
    });
  });
});
```

## 5.3 Schema-per-test para E2E pesado

```typescript
// test/helpers/schema-isolation.ts
import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const ROOT = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

export async function createIsolatedSchema(): Promise<{ prisma: PrismaClient; schema: string }> {
  const schema = `test_${crypto.randomBytes(4).toString('hex')}`;
  await ROOT.$executeRawUnsafe(`CREATE SCHEMA "${schema}";`);
  await ROOT.$executeRawUnsafe(`SET search_path TO "${schema}", public;`);
  // Aplica migrations no schema
  const url = `${process.env.DATABASE_URL}?schema=${schema}`;
  // ...execSync('prisma migrate deploy')
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  return { prisma, schema };
}

export async function dropSchema(schema: string) {
  await ROOT.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
}
```

## 5.4 Parallel execution

- **Vitest:** `pool: 'threads'` com `isolate: true`; cada worker tem seu contexto.
- **Playwright:** `--shard` divide specs em N shards; rodar em paralelo no CI.
- **k6:** instâncias paralelas com binários diferentes; cada cenário isolado por token de usuário diferente.

## 5.5 Anti-patterns proibidos

- ❌ `beforeAll` que cria estado compartilhado entre `it` blocks.
- ❌ `Date.now()` direto no teste — usar `vi.useFakeTimers()`.
- ❌ Depender de ordem de execução (`test.skip` condicional).
- ❌ Seed global que cresce a cada teste.
- ❌ Banco compartilhado entre devs rodando testes locais simultaneamente.

---

# Capítulo 6 — Estratégia de Mocks e Fixtures

## 6.1 Camadas de mock

```
┌─────────────────────────────────────────────┐
│ Unit test       → mock Prisma, Redis, S3    │
│ Integration     → banco real, mock externos │
│ E2E             → tudo real + mock LLM/ERP  │
│ Performance     → tudo real + LLM mock      │
└─────────────────────────────────────────────┘
```

## 6.2 Prisma mock (jest-mock-extended)

```typescript
// test/setup.ts
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from '@/lib/prisma';

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
```

## 6.3 Fixtures tipadas

```typescript
// test/fixtures/index.ts
import { User, Company, Branch, Goal, Indicator, Result, Campaign } from '@prisma/client';

export const adminUser: User & { role: { name: string; permissions: string[] } } = {
  id: 1,
  companyId: 1,
  branchId: 1,
  roleId: 1,
  email: 'admin@empresa.com',
  name: 'Admin Master',
  passwordHash: '$2a$10$mock',
  status: 'active',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  lastLoginAt: new Date('2025-08-01'),
  role: { name: 'ADMIN', permissions: ['*'] },
} as any;

export const gerenteUser: User & { role: { name: string; permissions: string[] } } = {
  id: 2,
  companyId: 1,
  branchId: 1,
  roleId: 2,
  email: 'gerente@empresa.com',
  name: 'Gerente Silva',
  passwordHash: '$2a$10$mock',
  status: 'active',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  role: { name: 'GERENTE', permissions: ['goals.read', 'goals.write', 'team.read', 'results.approve'] },
} as any;

export const vendedorUser: User & { role: { name: string; permissions: string[] } } = {
  id: 10,
  companyId: 1,
  branchId: 1,
  roleId: 5,
  email: 'vendedor@empresa.com',
  name: 'Vendedor Santos',
  passwordHash: '$2a$10$mock',
  status: 'active',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  role: { name: 'VENDEDOR', permissions: ['goals.read.own', 'results.create.own', 'dashboard.own'] },
} as any;

export const companyA = { id: 1, name: 'Empresa A', slug: 'empresa-a', plan: 'enterprise', status: 'active' } as Company;
export const companyB = { id: 2, name: 'Empresa B', slug: 'empresa-b', plan: 'pro', status: 'active' } as Company;

export const activeLicense = {
  id: 1,
  companyId: 1,
  plan: 'enterprise',
  seats: 50,
  usedSeats: 12,
  status: 'active',
  startedAt: new Date('2025-01-01'),
  expiresAt: new Date('2025-12-31'),
};

export const trialLicense = {
  ...activeLicense,
  id: 2,
  companyId: 3,
  plan: 'trial',
  status: 'trial',
  expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
};

export const expiredLicense = {
  ...activeLicense,
  id: 3,
  companyId: 4,
  status: 'expired',
  expiresAt: new Date('2025-01-01'),
};
```

## 6.4 Mock de serviços externos (Wiremock)

```json
// test/mocks/erp/mappings/erp-get-customers.json
{
  "request": {
    "method": "GET",
    "urlPathPattern": "/api/v1/customers"
  },
  "response": {
    "status": 200,
    "headers": { "Content-Type": "application/json" },
    "jsonBody": {
      "data": [
        { "id": "ERP-001", "name": "Cliente Mock 1", "document": "11111111111" },
        { "id": "ERP-002", "name": "Cliente Mock 2", "document": "22222222222" }
      ],
      "total": 2
    }
  }
}
```

## 6.5 Mock de LLM

```typescript
// test/mocks/llm-mock.ts
import { vi } from 'vitest';

export interface LLMResponse {
  content: string;
  usage: { promptTokens: number; completionTokens: number };
}

const responses: Record<string, LLMResponse[]> = {
  'insights_gerente': [
    { content: 'A equipe apresenta crescimento de 15% no faturamento, com destaque para vendedor Santos. Recomenda-se revisar metas de ticket médio.', usage: { promptTokens: 850, completionTokens: 120 } },
  ],
  'sugestao_vendedor': [
    { content: 'Você está 8% abaixo da meta semanal. Foque em clientes da carteira XYZ para recuperar o ritmo.', usage: { promptTokens: 600, completionTokens: 80 } },
  ],
  'analise_robusta': [
    { content: 'Análise detalhada: 3 indicadores em alerta, 2 em meta. Plano de ação: priorizar reconquista de clientes inativos.', usage: { promptTokens: 1200, completionTokens: 200 } },
  ],
};

export function mockLLM() {
  const calls: { prompt: string; model: string }[] = [];
  vi.mock('@/lib/llm/client', () => ({
    llmComplete: vi.fn(async (prompt: string, model: string) => {
      calls.push({ prompt, model });
      const key = Object.keys(responses).find(k => prompt.includes(k)) || 'insights_gerente';
      return responses[key][0];
    }),
    llmStream: vi.fn(async function* (prompt: string) {
      const key = Object.keys(responses).find(k => prompt.includes(k)) || 'insights_gerente';
      const words = responses[key][0].content.split(' ');
      for (const w of words) {
        yield w + ' ';
        await new Promise(r => setTimeout(r, 10));
      }
    }),
    getCalls: () => calls,
  }));
}

// No teste:
mockLLM();
import { llmComplete } from '@/lib/llm/client';
const result = await llmComplete('Gere insights_gerente para a equipe X', 'gpt-4o');
expect(result.content).toContain('crescimento de 15%');
```

## 6.6 Mock de Redis

```typescript
// test/mocks/redis-mock.ts
import { vi } from 'vitest';

const store = new Map<string, { value: string; expiresAt?: number }>();

export function mockRedis() {
  vi.mock('@/lib/redis', () => ({
    redis: {
      get: vi.fn(async (key: string) => {
        const item = store.get(key);
        if (!item) return null;
        if (item.expiresAt && item.expiresAt < Date.now()) {
          store.delete(key);
          return null;
        }
        return item.value;
      }),
      set: vi.fn(async (key: string, value: string, ttl?: number) => {
        store.set(key, { value, expiresAt: ttl ? Date.now() + ttl * 1000 : undefined });
        return 'OK';
      }),
      del: vi.fn(async (key: string) => {
        return store.delete(key) ? 1 : 0;
      }),
      incr: vi.fn(async (key: string) => {
        const cur = parseInt(store.get(key)?.value || '0', 10);
        const next = cur + 1;
        store.set(key, { value: String(next) });
        return next;
      }),
      expire: vi.fn(async (key: string, ttl: number) => {
        const item = store.get(key);
        if (item) item.expiresAt = Date.now() + ttl * 1000;
        return 1;
      }),
      _reset: () => store.clear(),
    },
  }));
}
```

## 6.7 Mock de email (MailHog)

```typescript
// test/helpers/mail.ts
import axios from 'axios';

const MAILHOG_API = process.env.MAILHOG_API || 'http://localhost:8026/api';

export async function getLastEmail(to?: string) {
  const { data } = await axios.get(`${MAILHOG_API}/v2/search`, {
    params: { kind: 'containing', query: to || '' },
  });
  return data.items?.[0]?.Content?.Body;
}

export async function clearMailbox() {
  await axios.delete(`${MAILHOG_API}/v1/messages`);
}

export async function extractTokenFromEmail(to: string): Promise<string | null> {
  const body = await getLastEmail(to);
  if (!body) return null;
  const match = body.match(/token=([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}
```

---

# Capítulo 7 — Factories e Builders

## 7.1 Factory genérica

```typescript
// test/factories/index.ts
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/locale/pt_BR';

type Overridable<T> = Partial<T>;

export class Factory {
  constructor(private prisma: PrismaClient | Prisma.TransactionClient) {}

  async company(overrides: Overridable<any> = {}) {
    return this.prisma.company.create({
      data: {
        name: overrides.name ?? faker.company.name(),
        slug: overrides.slug ?? faker.string.slug(),
        plan: overrides.plan ?? 'pro',
        status: overrides.status ?? 'active',
        timezone: overrides.timezone ?? 'America/Sao_Paulo',
        locale: overrides.locale ?? 'pt-BR',
        currency: overrides.currency ?? 'BRL',
        ...overrides,
      },
    });
  }

  async branch(companyId: number, overrides: Overridable<any> = {}) {
    return this.prisma.branch.create({
      data: {
        companyId,
        name: overrides.name ?? faker.company.name(),
        code: overrides.code ?? faker.string.alphanumeric(4).toUpperCase(),
        state: overrides.state ?? faker.location.state({ abbreviated: true }),
        city: overrides.city ?? faker.location.city(),
        ...overrides,
      },
    });
  }

  async user(companyId: number, branchId: number, overrides: Overridable<any> = {}) {
    return this.prisma.user.create({
      data: {
        companyId,
        branchId,
        name: overrides.name ?? faker.person.fullName(),
        email: overrides.email ?? faker.internet.email().toLowerCase(),
        passwordHash: overrides.passwordHash ?? await bcrypt.hash('Senha@123', 10),
        role: overrides.role ?? 'VENDEDOR',
        status: overrides.status ?? 'active',
        ...overrides,
      },
    });
  }

  async indicator(companyId: number, overrides: Overridable<any> = {}) {
    return this.prisma.indicator.create({
      data: {
        companyId,
        name: overrides.name ?? 'Faturamento',
        code: overrides.code ?? 'FATURAMENTO',
        unit: overrides.unit ?? 'BRL',
        direction: overrides.direction ?? 'up',
        active: overrides.active ?? true,
        ...overrides,
      },
    });
  }

  async goal(companyId: number, userId: number, indicatorId: number, overrides: Overridable<any> = {}) {
    return this.prisma.goal.create({
      data: {
        companyId,
        userId,
        indicatorId,
        scope: overrides.scope ?? 'individual',
        goalType: overrides.goalType ?? 'monthly',
        targetValue: overrides.targetValue ?? 30000,
        startDate: overrides.startDate ?? new Date('2025-08-01'),
        endDate: overrides.endDate ?? new Date('2025-08-31'),
        status: overrides.status ?? 'active',
        createdBy: overrides.createdBy ?? 1,
        ...overrides,
      },
    });
  }

  async result(companyId: number, userId: number, indicatorId: number, overrides: Overridable<any> = {}) {
    return this.prisma.result.create({
      data: {
        companyId,
        userId,
        indicatorId,
        value: overrides.value ?? 1500.50,
        resultDate: overrides.resultDate ?? new Date('2025-08-15'),
        source: overrides.source ?? 'manual',
        status: overrides.status ?? 'approved',
        notes: overrides.notes ?? null,
        ...overrides,
      },
    });
  }

  async campaign(companyId: number, overrides: Overridable<any> = {}) {
    return this.prisma.campaign.create({
      data: {
        companyId,
        name: overrides.name ?? faker.commerce.productName(),
        startDate: overrides.startDate ?? new Date('2025-08-01'),
        endDate: overrides.endDate ?? new Date('2025-08-31'),
        status: overrides.status ?? 'active',
        type: overrides.type ?? 'ranking',
        ...overrides,
      },
    });
  }

  async license(companyId: number, overrides: Overridable<any> = {}) {
    return this.prisma.license.create({
      data: {
        companyId,
        plan: overrides.plan ?? 'pro',
        seats: overrides.seats ?? 10,
        usedSeats: overrides.usedSeats ?? 1,
        status: overrides.status ?? 'active',
        startedAt: overrides.startedAt ?? new Date('2025-01-01'),
        expiresAt: overrides.expiresAt ?? new Date('2025-12-31'),
        ...overrides,
      },
    });
  }

  async auditLog(companyId: number, userId: number, overrides: Overridable<any> = {}) {
    return this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: overrides.action ?? 'CREATE',
        entity: overrides.entity ?? 'Goal',
        entityId: overrides.entityId ?? 1,
        metadata: overrides.metadata ?? { target: 30000 },
        ipAddress: overrides.ipAddress ?? '127.0.0.1',
        userAgent: overrides.userAgent ?? 'vitest',
        createdAt: overrides.createdAt ?? new Date(),
        ...overrides,
      },
    });
  }

  async notification(userId: number, overrides: Overridable<any> = {}) {
    return this.prisma.notification.create({
      data: {
        userId,
        companyId: overrides.companyId ?? 1,
        type: overrides.type ?? 'goal_50_percent',
        title: overrides.title ?? 'Você atingiu 50% da meta!',
        body: overrides.body ?? 'Continue assim.',
        channel: overrides.channel ?? 'in_app',
        status: overrides.status ?? 'pending',
        ...overrides,
      },
    });
  }
}
```

## 7.2 Builder para metas complexas

```typescript
// test/builders/goal-builder.ts
export class GoalBuilder {
  private goal: any = {
    companyId: 1,
    userId: 1,
    indicatorId: 1,
    scope: 'individual',
    goalType: 'monthly',
    targetValue: 30000,
    startDate: new Date('2025-08-01'),
    endDate: new Date('2025-08-31'),
    status: 'active',
    createdBy: 1,
  };

  forUser(userId: number) { this.goal.userId = userId; return this; }
  forTeam(branchId: number) { this.goal.scope = 'team'; this.goal.branchId = branchId; return this; }
  monthly() { this.goal.goalType = 'monthly'; return this; }
  weekly() { this.goal.goalType = 'weekly'; this.goal.endDate = new Date('2025-08-07'); return this; }
  withTarget(target: number) { this.goal.targetValue = target; return this; }
  forIndicator(id: number) { this.goal.indicatorId = id; return this; }
  active() { this.goal.status = 'active'; return this; }
  paused() { this.goal.status = 'paused'; return this; }
  closed() { this.goal.status = 'closed'; return this; }

  build() { return { ...this.goal }; }
}

// Uso:
const goal = new GoalBuilder().forUser(10).monthly().withTarget(50000).build();
```

## 7.3 Builder para lançamento de resultado

```typescript
// test/builders/result-builder.ts
export class ResultBuilder {
  private result: any = {
    companyId: 1,
    userId: 10,
    indicatorId: 1,
    value: 1500,
    resultDate: new Date('2025-08-15'),
    source: 'manual',
    status: 'approved',
    notes: null,
  };

  forUser(userId: number) { this.result.userId = userId; return this; }
  withValue(value: number) { this.result.value = value; return this; }
  onDate(date: Date) { this.result.resultDate = date; return this; }
  pending() { this.result.status = 'pending'; return this; }
  rejected() { this.result.status = 'rejected'; return this; }
  fromImport() { this.result.source = 'import'; return this; }
  fromERP() { this.result.source = 'erp_sync'; return this; }

  build() { return { ...this.result }; }
}
```

---

# Capítulo 8 — CI/CD Integration

## 8.1 GitHub Actions pipeline

```yaml
# .github/workflows/test.yml
name: Test & QA

on:
  push:
    branches: [main, develop, 'release/**']
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20.11.0'

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run format:check

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-unit
          path: coverage/
      - name: Coverage gate
        run: |
          LINES=$(node -e "const r=require('./coverage/coverage-summary.json'); console.log(r.total.lines.pct)")
          echo "Line coverage: $LINES%"
          if (( $(echo "$LINES < 70" | bc -l) )); then exit 1; fi

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: orion_test
          POSTGRES_PASSWORD: orion_test
          POSTGRES_DB: orion_test
        ports: ['5433:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 2s
          --health-timeout 5s
          --health-retries 20
      redis:
        image: redis:7-alpine
        ports: ['6380:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'npm' }
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://orion_test:orion_test@localhost:5433/orion_test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://orion_test:orion_test@localhost:5433/orion_test
          REDIS_URL: redis://localhost:6380

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e -- --shard=${{ matrix.shard }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    needs: lint-typecheck
    steps:
      - uses: actions/checkout@v4
      - run: npx audit-ci --moderate
      - run: npx semgrep --config=p/owasp-top-ten
      - name: CodeQL
        uses: github/codeql-action/analyze@v3

  visual-regression:
    runs-on: ubuntu-latest
    needs: e2e-tests
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: '${{ env.NODE_VERSION }}', cache: 'npm' }
      - run: npm ci
      - run: npm run test:visual
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diff
          path: __screenshots__/

  performance-baseline:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.test.yml up -d
      - run: npx k6 run tests/perf/dashboard.js --env BASE_URL=http://localhost:3000
      - run: npx k6 run tests/perf/result-entry.js --env BASE_URL=http://localhost:3000
      - name: Compare with baseline
        run: node scripts/compare-perf-baseline.js

  quality-gate:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests, e2e-tests, security-scan, visual-regression]
    steps:
      - run: echo "All quality gates passed — ready to merge"
```

## 8.2 Quality gates (brancho protection)

- ✅ Lint sem erros
- ✅ TypeCheck sem erros
- ✅ Unit ≥ 70% linhas, ≥ 65% branches
- ✅ Integration 100% passing
- ✅ E2E 100% passing (no shard failure)
- ✅ SAST sem critical nem high
- ✅ Visual regression sem diff > 5% em componentes críticos
- ✅ Code review aprovado por 2 devs
- ✅ Performance sem regressão > 10% p95

---

# PARTE II — UNIT & INTEGRAÇÃO

# Capítulo 9 — Testes Unitários: Padrões

## 9.1 Padrão AAA (Arrange-Act-Assert)

```typescript
describe('GoalService.createGoal', () => {
  it('creates goal with valid input', async () => {
    // Arrange
    const input = { userId: 10, indicatorId: 1, goalType: 'monthly' as const, targetValue: 30000, startDate: new Date('2025-08-01'), endDate: new Date('2025-08-31') };
    prismaMock.license.findFirst.mockResolvedValue(activeLicense);
    prismaMock.indicator.findFirst.mockResolvedValue({ id: 1, active: true });
    prismaMock.goal.create.mockResolvedValue({ id: 1, ...input });

    // Act
    const result = await new GoalService(prismaMock).createGoal(input);

    // Assert
    expect(result.id).toBe(1);
    expect(prismaMock.goal.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ targetValue: 30000 }),
    });
  });
});
```

## 9.2 Padrão Table-Driven (paramétrico)

```typescript
describe('GoalService.calculateProgress', () => {
  it.each([
    // [target, achieved, expectedPercent]
    [30000, 0,       0],
    [30000, 15000,   50],
    [30000, 30000,   100],
    [30000, 45000,   150],
    [0,     100,     0],   // meta zero retorna 0
    [30000, -100,    0],   // valor negativo retorna 0
    [null,  100,     0],
  ])('target=%f achieved=%f → %f%%', (target, achieved, expected) => {
    expect(GoalService.calculateProgress(target, achieved)).toBe(expected);
  });
});
```

## 9.3 Padrão "should throw when..."

```typescript
describe('GoalService.createGoal — errors', () => {
  it('throws LICENSE_INVALID when no active license', async () => {
    prismaMock.license.findFirst.mockResolvedValue(null);
    await expect(new GoalService(prismaMock).createGoal(input))
      .rejects.toMatchObject({ code: 'LICENSE_INVALID' });
  });

  it('throws LICENSE_EXPIRED when license past expiration', async () => {
    prismaMock.license.findFirst.mockResolvedValue(expiredLicense);
    await expect(new GoalService(prismaMock).createGoal(input))
      .rejects.toMatchObject({ code: 'LICENSE_EXPIRED' });
  });

  it('throws INDICATOR_INACTIVE when indicator inactive', async () => {
    prismaMock.license.findFirst.mockResolvedValue(activeLicense);
    prismaMock.indicator.findFirst.mockResolvedValue({ id: 1, active: false });
    await expect(new GoalService(prismaMock).createGoal(input))
      .rejects.toMatchObject({ code: 'INDICATOR_INACTIVE' });
  });

  it('throws DATE_RANGE_INVALID when start >= end', async () => {
    const bad = { ...input, startDate: new Date('2025-08-31'), endDate: new Date('2025-08-01') };
    prismaMock.license.findFirst.mockResolvedValue(activeLicense);
    await expect(new GoalService(prismaMock).createGoal(bad))
      .rejects.toMatchObject({ code: 'DATE_RANGE_INVALID' });
  });

  it('throws TARGET_NEGATIVE when target < 0', async () => {
    const bad = { ...input, targetValue: -1000 };
    prismaMock.license.findFirst.mockResolvedValue(activeLicense);
    await expect(new GoalService(prismaMock).createGoal(bad))
      .rejects.toMatchObject({ code: 'TARGET_NEGATIVE' });
  });
});
```

## 9.4 Cobertura por camada

| Camada | Foco | Exemplo |
|--------|------|---------|
| Service | Regras de negócio | `GoalService.createGoal` valida licença, indicador, datas |
| Repository | Queries Prisma | `GoalRepository.findByUser` com filtros |
| Validator | Schemas Zod | `CreateGoalSchema.parse` rejeita payload inválido |
| Middleware | Auth, tenant, rate-limit | `requirePermission('goals.write')` |
| Utils | Funções puras | `formatCurrency`, `dateRange` |
| Hooks (client) | Estado React | `useGoals` com React Testing Library |

---

# Capítulo 10 — Custom Matchers do Vitest

## 10.1 Setup dos matchers

```typescript
// test/matchers.ts
import { expect } from 'vitest';
import { ZodError } from 'zod';

expect.extend({
  toBeValidationError(received, expectedCode?: string) {
    if (!(received instanceof ZodError)) {
      return { pass: false, message: () => `Expected ZodError, got ${typeof received}` };
    }
    if (expectedCode && !received.errors.some(e => e.code === expectedCode)) {
      return { pass: false, message: () => `Expected error code ${expectedCode}` };
    }
    return { pass: true, message: () => 'Validation error thrown as expected' };
  },

  toBeAppError(received, expectedCode: string) {
    const pass = received?.code === expectedCode;
    return {
      pass,
      message: () => pass
        ? `Expected NOT to be AppError ${expectedCode}`
        : `Expected AppError ${expectedCode}, got ${received?.code}`,
    };
  },

  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `Expected ${received} to be within [${floor}, ${ceiling}]`,
    };
  },

  async toBeValidJWT(received: string) {
    const parts = received.split('.');
    if (parts.length !== 3) {
      return { pass: false, message: () => 'JWT must have 3 parts' };
    }
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      if (!payload.sub || !payload.exp || !payload.companyId) {
        return { pass: false, message: () => 'JWT missing required claims' };
      }
      return { pass: true, message: () => 'JWT is valid' };
    } catch {
      return { pass: false, message: () => 'JWT payload not valid base64 JSON' };
    }
  },

  toBeISODate(received: string) {
    const pass = !isNaN(Date.parse(received)) && received.includes('T') && received.includes('Z');
    return { pass, message: () => `Expected ${received} to be ISO date` };
  },

  toHaveTenantScope(received: { where?: any }, expectedCompanyId: number) {
    const where = received?.where ?? {};
    const pass = where.companyId === expectedCompanyId || where.companyId?.equals === expectedCompanyId;
    return {
      pass,
      message: () => `Expected Prisma query to filter companyId=${expectedCompanyId}, got ${JSON.stringify(where)}`,
    };
  },
});

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidationError(code?: string): T;
    toBeAppError(code: string): T;
    toBeWithinRange(floor: number, ceiling: number): T;
    toBeValidJWT(): Promise<T>;
    toBeISODate(): T;
    toHaveTenantScope(companyId: number): T;
  }
}
```

## 10.2 Uso

```typescript
import { CreateGoalSchema } from '@/schemas/goal';

it('rejects negative target', () => {
  expect(() => CreateGoalSchema.parse({ ...validInput, targetValue: -1 }))
    .toThrow();
});

it('creates valid JWT', async () => {
  const token = await generateJWT({ sub: 1, companyId: 1 });
  await expect(token).toBeValidJWT();
});

it('queries with tenant scope', async () => {
  await service.listGoals({ user: adminUser });
  expect(prismaMock.goal.findMany).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ companyId: 1 }),
  }));
});
```

---

# Capítulo 11 — Testes de Integração

## 11.1 Padrão com supertest + transação

```typescript
// test/integration/goals.integration.test.ts
import request from 'supertest';
import { app } from '@/app';
import { getAuthToken } from '../helpers/auth';
import { withTransaction, getTestPrisma } from '../helpers/transactional-test';
import { Factory } from '../factories';

describe('POST /v1/goals (integration)', () => {
  let token: string;
  let factory: Factory;

  beforeEach(async () => {
    await withTransaction(async () => {
      const prisma = getTestPrisma();
      factory = new Factory(prisma);
      const company = await factory.company();
      const branch = await factory.branch(company.id);
      const admin = await factory.user(company.id, branch.id, { role: 'ADMIN' });
      token = await getAuthToken(admin.email);
    });
  });

  it('creates goal when authenticated', async () => {
    const res = await request(app.callback())
      .post('/v1/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: 1, indicatorId: 1, goalType: 'monthly', targetValue: 30000, startDate: '2025-08-01', endDate: '2025-08-31' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('returns 422 for negative target', async () => {
    const res = await request(app.callback())
      .post('/v1/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: 1, indicatorId: 1, goalType: 'monthly', targetValue: -100, startDate: '2025-08-01', endDate: '2025-08-31' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('TARGET_NEGATIVE');
  });

  it('returns 403 for vendedor', async () => {
    const vendedorToken = await getAuthToken('vendedor@empresa.com');
    const res = await request(app.callback())
      .post('/v1/goals')
      .set('Authorization', `Bearer ${vendedorToken}`)
      .send({ /* valid payload */ });
    expect(res.status).toBe(403);
  });
});
```

## 11.2 Testes de repositório com banco real

```typescript
// test/integration/goal-repository.test.ts
import { GoalRepository } from '@/modules/goals/goal.repository';
import { getTestPrisma } from '../helpers/transactional-test';
import { Factory } from '../factories';

describe('GoalRepository', () => {
  let repo: GoalRepository;
  let factory: Factory;

  beforeEach(async () => {
    const prisma = getTestPrisma();
    repo = new GoalRepository(prisma);
    factory = new Factory(prisma);
  });

  it('returns only goals from same tenant', async () => {
    const companyA = await factory.company();
    const companyB = await factory.company();
    const indA = await factory.indicator(companyA.id);
    const indB = await factory.indicator(companyB.id);
    await factory.goal(companyA.id, 1, indA.id, { targetValue: 10000 });
    await factory.goal(companyB.id, 2, indB.id, { targetValue: 20000 });

    const goals = await repo.findByCompany(companyA.id);
    expect(goals).toHaveLength(1);
    expect(goals[0].targetValue).toBe(10000);
  });

  it('filters by date range', async () => {
    const company = await factory.company();
    const ind = await factory.indicator(company.id);
    await factory.goal(company.id, 1, ind.id, { startDate: new Date('2025-08-01'), endDate: new Date('2025-08-31') });
    await factory.goal(company.id, 1, ind.id, { startDate: new Date('2025-09-01'), endDate: new Date('2025-09-30') });

    const augustGoals = await repo.findByDateRange(company.id, new Date('2025-08-01'), new Date('2025-08-31'));
    expect(augustGoals).toHaveLength(1);
  });
});
```

---

# Capítulo 12 — Auth Helpers para Testes

## 12.1 Helper de login programático

```typescript
// test/helpers/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });

export async function getAuthToken(email: string): Promise<string> {
  const user = await prisma.user.findFirst({ where: { email }, include: { role: true } });
  if (!user) throw new Error(`User ${email} not seeded`);
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      companyId: user.companyId,
      token: jwt.sign(
        { sub: user.id, companyId: user.companyId, branchId: user.branchId, role: user.role?.name },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      ),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    },
  });
  return session.token;
}

export async function getAuthTokenForUser(user: { id: number; companyId: number; branchId: number; role: string }): Promise<string> {
  return jwt.sign(
    { sub: user.id, companyId: user.companyId, branchId: user.branchId, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

export async function getExpiredToken(user: { id: number; companyId: number }): Promise<string> {
  return jwt.sign(
    { sub: user.id, companyId: user.companyId },
    process.env.JWT_SECRET!,
    { expiresIn: '-1s' }
  );
}

export async function getMalformedToken(): Promise<string> {
  return 'eyJhbGciOiJIUzI1NiJ9.invalid.payload';
}

export async function getCrossTenantToken(targetCompanyId: number): Promise<string> {
  // Cria token válido mas com companyId que não corresponde ao usuário real
  return jwt.sign(
    { sub: 999, companyId: targetCompanyId, role: 'ADMIN' },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}
```

## 12.2 Helper para Playwright

```typescript
// e2e/helpers/auth.ts
import { test as base, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

type TestFixtures = {
  authedPage: Page;
  loginAs: (email: string) => Promise<void>;
};

export const test = base.extend<TestFixtures>({
  loginAs: async ({ page, baseURL }, use) => {
    await use(async (email: string) => {
      // Login via UI para cenários de teste de login
      await page.goto('/login');
      await page.fill('[data-testid=email]', email);
      await page.fill('[data-testid=password]', 'Senha@123');
      await page.click('[data-testid=login-button]');
      await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
    });
  },
  authedPage: async ({ page, baseURL, context }, use) => {
    // Login programático via API + cookies
    const token = jwt.sign(
      { sub: 1, companyId: 1, branchId: 1, role: 'ADMIN' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    await context.addCookies([
      { name: 'orion_session', value: token, domain: new URL(baseURL!).hostname, path: '/' },
    ]);
    await use(page);
  },
});

export { expect };
```

## 12.3 Setup de usuários de teste por papel

```typescript
// e2e/fixtures/users.ts
export const TEST_USERS = {
  sysadmin: { email: 'sysadmin@orion.local', password: 'Senha@123', role: 'SYSADMIN' },
  admin:    { email: 'admin@empresa.com',    password: 'Senha@123', role: 'ADMIN' },
  gerente:  { email: 'gerente@empresa.com',  password: 'Senha@123', role: 'GERENTE' },
  supervisor: { email: 'supervisor@empresa.com', password: 'Senha@123', role: 'SUPERVISOR' },
  vendedor: { email: 'vendedor@empresa.com', password: 'Senha@123', role: 'VENDEDOR' },
  vendedor2: { email: 'vendedor2@empresa.com', password: 'Senha@123', role: 'VENDEDOR' },
  blocked:  { email: 'blocked@empresa.com',  password: 'Senha@123', role: 'VENDEDOR', status: 'blocked' },
  expired:  { email: 'expired@empresa.com',  password: 'Senha@123', role: 'VENDEDOR', status: 'expired' },
};
```

---

# PARTE III — CASOS DE TESTE POR UC: ADMIN/SYSADMIN (UC-001 a UC-020)

# Capítulo 13 — Casos de Teste UC-001 a UC-020

Convenção de cada caso: **ID** (CT-UCXXX-Y), **Pré-condições**, **Passos**, **Resultado esperado**, **Pós-condições**.

## UC-001 — Ativar licença do sistema

| ID | Cenário | Tipo | Passos resumidos | Resultado esperado |
|----|---------|------|-------------------|-------------------|
| CT-UC001-01 | Ativação com chave válida | Happy | POST `/v1/sysadmin/license/activate` com chave válida não expirada | 201, licença criada, status `active`, expiração registrada |
| CT-UC001-02 | Ativação com chave já utilizada | Error | POST com chave que já tem `activatedAt` preenchido | 409 `LICENSE_ALREADY_USED` |
| CT-UC001-03 | Ativação com chave expirada | Error | POST com chave cuja `expiresAt < now` | 422 `LICENSE_KEY_EXPIRED` |
| CT-UC001-04 | Ativação com chave inexistente | Error | POST com chave aleatória | 404 `LICENSE_KEY_NOT_FOUND` |
| CT-UC001-05 | Ativação sem payload | Edge | POST com body vazio | 422 com lista de campos obrigatórios |
| CT-UC001-06 | Validação de plano — enterprise vs pro | Edge | Ativar chave enterprise em tenant existente pro | Plano atualizado, audit log gerado |

## UC-002 — Configurar instalação inicial (wizard)

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC002-01 | Wizard completo passo-a-passo | Happy | 1) GET `/wizard/status` → `not_started`; 2) POST step1 (empresa); 3) POST step2 (filial); 4) POST step3 (admin); 5) POST step4 (indicadores default) | `wizard_status=completed`, redirect `/dashboard` |
| CT-UC002-02 | Retomar wizard no meio | Edge | Completar step1, fechar, reabrir | Retoma em step2 com dados persistidos |
| CT-UC002-03 | Pular step obrigatório | Error | POST step3 sem step2 concluído | 409 `WIZARD_STEP_OUT_OF_ORDER` |
| CT-UC002-04 | Validação de CNPJ duplicado | Edge | Step1 com CNPJ já existente | 422 `COMPANY_CNPJ_DUPLICATE` |
| CT-UC002-05 | Wizard em tenant já configurado | Error | Acessar `/wizard` em tenant com `setupCompleted=true` | 302 redirect para `/dashboard` |

## UC-003 — Gerenciar módulos e plugins

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC003-01 | Instalar plugin do marketplace | Happy | POST `/v1/admin/plugins/install` com `pluginId=ai-insights` | 201, plugin em `installing`, depois `active` |
| CT-UC003-02 | Ativar plugin em trial | Edge | Instalar plugin com custo em tenant trial | 422 `TRIAL_PLAN_RESTRICTED` |
| CT-UC003-03 | Desinstalar plugin com dados dependentes | Error | Desinstalar plugin de indicadores que tem metas ativas | 409 `PLUGIN_HAS_DEPENDENTS` |
| CT-UC003-04 | Plugin com versão incompatível | Edge | Instalar plugin v2 em runtime v1 | 422 `PLUGIN_INCOMPATIBLE_VERSION` |

## UC-004 — Aplicar atualizações do sistema

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC004-01 | Atualização menor (patch) | Happy | POST `/v1/sysadmin/update` com versão `1.0.1` | 200, migration aplicada, sem downtime |
| CT-UC004-02 | Atualização major com breaking | Edge | Tentar 1.x → 2.0 sem backup prévio | 422 `BACKUP_REQUIRED_FOR_MAJOR` |
| CT-UC004-03 | Rollback após falha | Error | Aplicar update que falha em migration | Auto-rollback para versão anterior, status `failed` registrado |
| CT-UC004-04 | Update concorrente | Edge | Dois admins disparam update simultaneamente | Segundo recebe 409 `UPDATE_IN_PROGRESS` |

## UC-005 — Gerenciar backups e restauração

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC005-01 | Backup manual completo | Happy | POST `/v1/sysadmin/backup` | 202, job enfileirado, arquivo em S3 com hash |
| CT-UC005-02 | Restaurar backup em ambiente isolado | Happy | POST `/v1/sysadmin/restore` com `backupId` em ambiente `restore-test` | Dados restaurados, integridade verificada |
| CT-UC005-03 | Restaurar backup corrompido | Error | Restore de backup com checksum divergente | 422 `BACKUP_CORRUPTED` |
| CT-UC005-04 | Backup incremental | Edge | Disparar backup após anterior | Apenas delta exportado, tempo < 30s |
| CT-UC005-05 | Backup expira por retenção | Edge | Backup com 91 dias em política de 90 dias | Auto-purge, audit log gerado |

## UC-006 — Configurar parâmetros globais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC006-01 | Alterar fuso horário | Happy | PUT `/v1/admin/settings` com `timezone: 'America/New_York'` | 200, configuração salva, timestamps futuros em NY |
| CT-UC006-02 | Alterar moeda com metas existentes | Edge | Mudar moeda de BRL para USD quando há metas em BRL | 422 `CURRENCY_CHANGE_BLOCKED_HAS_GOALS` |
| CT-UC006-03 | Parâmetro inválido | Error | PUT com `timezone: 'Foo/Bar'` | 422 `INVALID_TIMEZONE` |
| CT-UC006-04 | Persistência entre restart | Edge | Alterar setting, reiniciar servidor | Setting persistida em `system_settings` |

## UC-007 — Acessar auditoria global

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC007-01 | Listar logs com filtro de data | Happy | GET `/v1/sysadmin/audit?from=2025-08-01&to=2025-08-31` | 200, lista paginada |
| CT-UC007-02 | Filtro por entidade | Edge | GET `/v1/sysadmin/audit?entity=Goal` | Apenas logs de Goal |
| CT-UC007-03 | Acesso negado a não-sysadmin | Error | GET com token de vendedor | 403 `INSUFFICIENT_PERMISSION` |
| CT-UC007-04 | Detalhe de mudança campo-a-campo | Edge | GET `/v1/sysadmin/audit/:id/details` | Lista de campos alterados com before/after |
| CT-UC007-05 | Exportar logs em CSV | Edge | GET `/v1/sysadmin/audit/export?format=csv` | 200, content-type `text/csv` |

## UC-008 — Gerenciar integrações externas

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC008-01 | Configurar webhook WhatsApp | Happy | POST `/v1/admin/integrations/whatsapp` com token válido | 201, integração `active` |
| CT-UC008-02 | Testar conexão ERP | Edge | POST `/v1/admin/integrations/erp/test` | 200 com `latencyMs` e `ok=true` |
| CT-UC008-03 | Token ERP inválido | Error | Configurar com token expirado | 422 `ERP_AUTH_FAILED` |
| CT-UC008-04 | Webhook sem assinatura HMAC | Error | Receber webhook sem header `X-Signature` | 401 `WEBHOOK_SIGNATURE_MISSING` |
| CT-UC008-05 | Webhook com assinatura inválida | Error | Receber com assinatura divergente | 401 `WEBHOOK_SIGNATURE_INVALID` |

## UC-009 — Revogar sessões ativas

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC009-01 | Revogar sessão específica | Happy | DELETE `/v1/admin/sessions/:id` | 204, sessão marcada `revoked`, próximo request 401 |
| CT-UC009-02 | Revogar todas as sessões de um usuário | Edge | DELETE `/v1/admin/sessions?userId=10` | 204, todas sessões do user revogadas |
| CT-UC009-03 | Listar sessões ativas com IP e device | Edge | GET `/v1/admin/sessions` | 200, lista com `ipAddress`, `userAgent`, `lastActivity` |
| CT-UC009-04 | Revogar sessão inexistente | Error | DELETE com id aleatório | 404 `SESSION_NOT_FOUND` |

## UC-010 — Reiniciar/desligar serviços

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC010-01 | Reiniciar serviço de IA | Happy | POST `/v1/sysadmin/services/ai/restart` | 202, status transita `restarting → active` |
| CT-UC010-02 | Reiniciar em horário de pico | Edge | Reiniciar às 10h com 50 usuários ativos | 422 `RESTART_BLOCKED_PEAK_HOURS` (configurável) |
| CT-UC010-03 | Desligar sem manutenção agendada | Error | POST `/v1/sysadmin/services/shutdown` sem motivo | 422 `SHUTDOWN_REASON_REQUIRED` |

## UC-011 — Cadastrar empresa

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC011-01 | Criar empresa com CNPJ válido | Happy | POST `/v1/admin/companies` com CNPJ válido | 201, empresa criada, license trial gerada |
| CT-UC011-02 | CNPJ duplicado | Error | POST com CNPJ já existente | 409 `COMPANY_CNPJ_DUPLICATE` |
| CT-UC011-03 | CNPJ inválido (dígitos verificadores) | Error | POST com CNPJ `11111111111111` | 422 `INVALID_CNPJ` |
| CT-UC011-04 | Slug conflitante | Edge | POST com slug já usado | 409 `COMPANY_SLUG_DUPLICATE` |
| CT-UC011-05 | Nome com caracteres Unicode | Edge | POST com nome em árabe/chinês | 201, nome persistido em UTF-8 |

## UC-012 — Cadastrar filiais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC012-01 | Criar filial para empresa | Happy | POST `/v1/admin/companies/1/branches` | 201 |
| CT-UC012-02 | Criar filial em empresa de outro tenant | Error | POST com companyId de outra empresa (token de company A) | 404 `COMPANY_NOT_FOUND` (multi-tenant) |
| CT-UC012-03 | Código de filial duplicado na mesma empresa | Error | POST com código já existente | 409 `BRANCH_CODE_DUPLICATE` |
| CT-UC012-04 | Filial sem cidade/estado | Edge | POST sem endereço | 201 (endereço opcional) |
| CT-UC012-05 | Soft delete de filial com metas ativas | Edge | DELETE branch com metas futuras | 409 `BRANCH_HAS_ACTIVE_GOALS` |

## UC-013 — Cadastrar departamentos

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC013-01 | Criar departamento | Happy | POST `/v1/admin/departments` | 201 |
| CT-UC013-02 | Nome duplicado | Error | POST com nome já existente | 409 `DEPARTMENT_NAME_DUPLICATE` |
| CT-UC013-03 | Listar departamentos com usuários count | Edge | GET `?include=userCount` | Array com `userCount` |

## UC-014 — Cadastrar cargos

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC014-01 | Criar cargo | Happy | POST `/v1/admin/roles` com `name` e `permissions` | 201, role criada com hash de permissões |
| CT-UC014-02 | Nome de cargo reservado | Error | POST com name=`ADMIN` | 409 `ROLE_NAME_RESERVED` |
| CT-UC014-03 | Atribuir permissão inexistente | Error | POST com permission `nonexistent.permission` | 422 `PERMISSION_NOT_FOUND` |
| CT-UC014-04 | Editar cargo em uso | Edge | PUT em cargo com 50 usuários | 200, permissões atualizadas propagam via cache invalidation |

## UC-015 — Cadastrar usuários

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC015-01 | Criar usuário com email válido | Happy | POST `/v1/admin/users` | 201, email de convite enviado |
| CT-UC015-02 | Email duplicado | Error | POST com email já existente (mesma empresa) | 409 `USER_EMAIL_DUPLICATE` |
| CT-UC015-03 | Email duplicado em outra empresa | Edge | POST com email existente em companyB | 201 (mesmo email permitido cross-tenant) |
| CT-UC015-04 | Limite de seats excedido | Error | Criar usuário quando `usedSeats >= seats` | 422 `LICENSE_SEATS_EXCEEDED` |
| CT-UC015-05 | Senha fraca | Error | PUT `/users/:id/password` com `123` | 422 `PASSWORD_TOO_WEAK` |
| CT-UC015-06 | Criar usuário sem filial | Edge | POST sem `branchId` | 422 `BRANCH_REQUIRED` |

## UC-016 — Atribuir permissões a cargos

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC016-01 | Adicionar permissão | Happy | POST `/v1/admin/roles/:id/permissions` com `goals.write` | 200, permissão adicionada |
| CT-UC016-02 | Remover permissão crítica em uso | Error | Remover `users.read` de cargo ADMIN | 409 `CRITICAL_PERMISSION_CANNOT_REMOVE` |
| CT-UC016-03 | Bulk update | Edge | PUT com array de 20 permissões | 200, transação atômica |

## UC-017 — Configurar indicadores personalizados

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC017-01 | Criar indicador | Happy | POST `/v1/admin/indicators` | 201 |
| CT-UC017-02 | Fórmula personalizada válida | Edge | POST com `formula: 'valor_a * 0.1 + valor_b'` | 201, fórmula validada |
| CT-UC017-03 | Fórmula com função proibida | Error | POST com `formula: 'eval("...")'` | 422 `FORMULA_FORBIDDEN_FUNCTION` |
| CT-UC017-04 | Inativar indicador com metas ativas | Error | DELETE indicator com metas `active` | 409 `INDICATOR_HAS_ACTIVE_GOALS` |
| CT-UC017-05 | Tipo de unidade inválido | Error | POST com `unit: 'litros'` não suportado | 422 `INVALID_UNIT` |

## UC-018 — Criar categorias de indicadores

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC018-01 | Criar categoria | Happy | POST `/v1/admin/indicator-categories` | 201 |
| CT-UC018-02 | Categoria com indicadores | Edge | POST + relaciona 3 indicadores | 201, relacionamentos criados |
| CT-UC018-03 | Excluir categoria em uso | Error | DELETE categoria com indicadores | 409 `CATEGORY_IN_USE` |

## UC-019 — Configurar temas e identidade visual

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC019-01 | Upload de logo | Happy | POST `/v1/admin/branding/logo` com PNG | 201, arquivo em S3, URL pública assinada |
| CT-UC019-02 | Logo com formato inválido | Error | POST com `.exe` | 422 `INVALID_FILE_TYPE` |
| CT-UC019-03 | Logo maior que 5MB | Error | POST com 8MB | 422 `FILE_TOO_LARGE` |
| CT-UC019-04 | Preview de tema custom | Edge | PUT `/branding` com cores customizadas | 200, CSS variables aplicadas |

## UC-020 — Configurar idiomas e moeda

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC020-01 | Alterar idioma | Happy | PUT `/v1/admin/settings/locale` com `pt-BR` | 200 |
| CT-UC020-02 | Idioma não suportado | Error | PUT com `xx-XX` | 422 `UNSUPPORTED_LOCALE` |
| CT-UC020-03 | Formatação de moeda após mudança | Edge | Mudar para `en-US` e formatar 1500 → `$1,500.00` | Formato correto |
| CT-UC020-04 | Permissão de override por usuário | Edge | Usuário tem preferência pessoal que sobrescreve tenant | Personal vence sobre tenant |

---

# PARTE IV — CASOS DE TESTE POR UC: EXECUTIVO/GERENTE (UC-021 a UC-040)

# Capítulo 14 — Casos de Teste UC-021 a UC-040

## UC-021 — Definir regras de cálculo globais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC021-01 | Definir regra de progresso | Happy | PUT `/v1/admin/calc-rules` com `progressType=weighted` | 200 |
| CT-UC021-02 | Regra com peso inválido | Error | PUT com `weights: [-0.5, 1.5]` | 422 `INVALID_WEIGHT` |
| CT-UC021-03 | Recálculo retroativo | Edge | Alterar regra e disparar `recalculate-all` | Job enfileirado, metas recalculadas, audit log |

## UC-022 — Exportar dados da empresa

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC022-01 | Exportar metas em XLSX | Happy | POST `/v1/admin/export?type=goals&format=xlsx` | 202, job ID retornado, polling retorna URL |
| CT-UC022-02 | Exportar dados pessoais (LGPD) | Happy | POST `/v1/admin/export?type=personal&format=csv` | 202 |
| CT-UC022-03 | Exportação de mais de 1M de linhas | Edge | Export com 1.2M resultados | Job processa em chunks, arquivo zipado em S3 |
| CT-UC022-04 | Tentativa de export cross-tenant | Error | GET `/v1/admin/export/123` onde 123 é de outra empresa | 404 |
| CT-UC022-05 | Rate limit de exportações | Edge | Disparar 6 exports seguidos | 6º retorna 429 `EXPORT_RATE_LIMIT` |

## UC-023 — Visualizar dashboard executivo consolidado

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC023-01 | Dashboard carrega com KPIs | Happy | GET `/v1/executive/dashboard` | 200, payload com `totalRevenue`, `activeGoals`, `topPerformers` |
| CT-UC023-02 | Filtro por filial | Edge | GET `?branchId=2` | Apenas dados da filial 2 |
| CT-UC023-03 | Tenant sem dados no período | Edge | GET `?from=2025-01-01&to=2025-01-02` sem dados | 200 com `data: null` e `hasData: false` |
| CT-UC023-04 | Performance < 500ms p95 | Perf | k6 ramp-up 20 → 50 usuários | p95 < 500ms |
| CT-UC023-05 | Cache invalidation após novo resultado | Edge | Resultado criado, GET dashboard | Cache invalidated, dados atualizados |

## UC-024 — Comparar desempenho entre filiais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC024-01 | Comparação de 3 filiais | Happy | GET `/v1/executive/compare?branches=1,2,3` | 200, tabela comparativa |
| CT-UC024-02 | Filial de outra empresa | Error | Incluir branchId de companyB | 404 `BRANCH_NOT_FOUND` (multi-tenant) |
| CT-UC024-03 | Comparação sem filiais | Edge | GET sem `branches` | 400 `BRANCHES_REQUIRED` |
| CT-UC024-04 | Ranking por indicador | Edge | GET `?indicator=faturamento` | Ordenado por faturamento |

## UC-025 — Acompanhar ranking geral da rede

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC025-01 | Ranking mensal | Happy | GET `/v1/executive/rankings?period=2025-08` | 200, lista ordenada por score |
| CT-UC025-02 | Empate em score | Edge | Dois vendedores com mesmo score | Ordenação secundária por `created_at` |
| CT-UC025-03 | Ranking vazio | Edge | Período sem resultados | 200 com `data: []` |
| CT-UC025-04 | Período futuro | Error | GET `?period=2099-01` | 422 `PERIOD_IN_FUTURE` |

## UC-026 — Solicitar relatórios estratégicos

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC026-01 | Relatório mensal PDF | Happy | POST `/v1/executive/reports?type=monthly` | 202, job ID |
| CT-UC026-02 | Relatório com params inválidos | Error | POST com `period` malformado | 422 `INVALID_PERIOD` |
| CT-UC026-03 | Download após pronto | Edge | GET `/v1/executive/reports/:id/download` | 200 com PDF binário |
| CT-UC026-04 | Download expirado | Error | GET após 7 dias da geração | 404 `REPORT_EXPIRED` |

## UC-027 — Aprovar metas corporativas

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC027-01 | Aprovar meta | Happy | POST `/v1/executive/goals/:id/approve` | 200, status `approved` |
| CT-UC027-02 | Rejeitar com justificativa | Edge | POST `/reject` com `reason` | 200, status `rejected`, audit log |
| CT-UC027-03 | Aprovar meta já aprovada | Error | POST approve em meta `approved` | 409 `GOAL_ALREADY_APPROVED` |
| CT-UC027-04 | Aprovar meta de outra empresa | Error | POST cross-tenant | 404 `GOAL_NOT_FOUND` |

## UC-028 — Consultar auditoria de gestores

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC028-01 | Filtrar por gestor | Happy | GET `/v1/executive/audit?userId=2` | 200, logs do gestor |
| CT-UC028-02 | Filtrar por ação | Edge | GET `?action=DELETE` | Apenas ações de exclusão |
| CT-UC028-03 | Sem permissão | Error | GET com token de vendedor | 403 |

## UC-029 — Cadastrar metas para equipe

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC029-01 | Meta mensal para equipe | Happy | POST `/v1/manager/goals` com `scope=team` e `branchId` | 201, meta criada para N usuários |
| CT-UC029-02 | Distribuição automática igualitária | Edge | POST com `distribute=equal` e 8 vendedores | 8 metas criadas com `targetValue/8` |
| CT-UC029-03 | Distribuição ponderada | Edge | POST com `distribute=weighted` e pesos | Cada meta com valor proporcional |
| CT-UC029-04 | Equipe vazia | Error | POST com `branchId` sem vendedores | 422 `TEAM_EMPTY` |
| CT-UC029-05 | Meta retroativa | Error | POST com `startDate < today` | 422 `GOAL_START_DATE_IN_PAST` |
| CT-UC029-06 | Sobreposição de meta existente | Error | POST com período que sobrepõe meta ativa | 409 `GOAL_PERIOD_OVERLAP` |

## UC-030 — Atribuir metas individuais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC030-01 | Criar meta individual | Happy | POST `/v1/manager/goals` com `scope=individual` e `userId` | 201 |
| CT-UC030-02 | Atribuir meta a usuário de outra filial | Error | `userId` pertence a filial diferente do gerente | 403 `USER_OUT_OF_SCOPE` |
| CT-UC030-03 | Meta acima do teto configurado | Edge | `targetValue` > 10x média histórica | 422 `TARGET_UNREALISTIC` (warning) |
| CT-UC030-04 | Editar meta em andamento | Edge | PUT em meta com 30% de progresso | 200, audit log, recálculo de progresso |

## UC-031 — Criar campanhas comerciais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC031-01 | Criar campanha ranking | Happy | POST `/v1/manager/campaigns` | 201 |
| CT-UC031-02 | Campanha com período inválido | Error | `startDate > endDate` | 422 `INVALID_PERIOD` |
| CT-UC031-03 | Campanha sobreposta | Edge | Criar campanha que sobrepõe outra ativa no mesmo escopo | 409 `CAMPAIGN_OVERLAP` |
| CT-UC031-04 | Campanha para todos os vendedores | Edge | `scope=all` | 201, participantes sincronizados via job |

## UC-032 — Configurar premiações

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC032-01 | Premiação top 3 | Happy | POST `/v1/manager/campaigns/:id/awards` com 3 prêmios | 201 |
| CT-UC032-02 | Premiação duplicada para mesma posição | Error | Dois prêmios para posição 1 | 409 `AWARD_POSITION_DUPLICATE` |
| CT-UC032-03 | Premiação em valor acima do budget | Edge | Award total excede `campaignBudget` | 422 `AWARD_BUDGET_EXCEEDED` |

## UC-033 — Visualizar dashboard da equipe

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC033-01 | Dashboard carrega com team data | Happy | GET `/v1/manager/dashboard` | 200, KPIs da equipe |
| CT-UC033-02 | Vendedor fora da equipe | Error | Acessar dashboard de vendedor de outra filial | 403 |
| CT-UC033-03 | Filtro por supervisor | Edge | GET `?supervisorId=5` | Apenas vendedores do supervisor |

## UC-034 — Aprovar resultados lançados

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC034-01 | Aprovar resultado pendente | Happy | POST `/v1/manager/results/:id/approve` | 200, status `approved` |
| CT-UC034-02 | Rejeitar com motivo | Edge | POST `/reject` com `reason="valor fora do padrão"` | 200, status `rejected`, notificação ao vendedor |
| CT-UC034-03 | Aprovar já aprovado | Error | POST approve em `approved` | 409 `RESULT_ALREADY_APPROVED` |
| CT-UC034-04 | Aprovar resultado fora do escopo | Error | Resultado de vendedor de outra filial | 403 |
| CT-UC034-05 | Aprovação em lote | Edge | POST `/results/batch-approve` com array de IDs | 200, todos aprovados atômicamente |

## UC-035 — Consultar ranking da equipe

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC035-01 | Ranking mensal da equipe | Happy | GET `/v1/manager/rankings?period=2025-08` | 200, lista ordenada |
| CT-UC035-02 | Ranking com vendedor sem resultados | Edge | Vendedor novo sem lançamentos | Aparece com `score=0` no fim |
| CT-UC035-03 | Período sem campanha ativa | Edge | Período fora de campanha | 200 com `campaignId: null` |

## UC-036 — Enviar notificações para equipe

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC036-01 | Notificação in-app para todos | Happy | POST `/v1/manager/notifications` com `audience=all` | 201, N notificações criadas |
| CT-UC036-02 | Notificação com template | Edge | POST com `templateId=goal_reminder` e vars | Template interpolado corretamente |
| CT-UC036-03 | Notificação agendada | Edge | POST com `sendAt=2025-08-31T10:00:00Z` | 201, status `scheduled` |
| CT-UC036-04 | Notificação para canal não configurado | Error | POST com `channel=whatsapp` sem integração | 422 `CHANNEL_NOT_CONFIGURED` |

## UC-037 — Gerar relatórios de desempenho

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC037-01 | Relatório individual de vendedor | Happy | POST `/v1/manager/reports?type=user&userId=10` | 202, job ID |
| CT-UC037-02 | Relatório de equipe completo | Edge | POST com `type=team&include=goals,results,ranking` | 202, PDF com múltiplas seções |
| CT-UC037-03 | Relatório de usuário fora do escopo | Error | `userId` de outra filial | 403 |

## UC-038 — Consultar IA para insights gerenciais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC038-01 | Gerar insights com mock LLM | Happy | POST `/v1/manager/ai/insights` | 200, resposta mockada contém "crescimento" |
| CT-UC038-02 | Streaming de resposta | Edge | GET `/v1/manager/ai/insights/stream` | SSE com chunks incrementais |
| CT-UC038-03 | IA indisponível (fallback) | Error | LLM retorna 500 | 200 com `insights: null` e `message: "IA temporariamente indisponível"` |
| CT-UC038-04 | Rate limit por usuário | Edge | 11ª chamada em 1h | 429 `AI_RATE_LIMIT` |
| CT-UC038-05 | Contexto cross-tenant | Error | Prompt com `companyId` divergente do token | 403 |

## UC-039 — Acompanhar metas do grupo supervisionado

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC039-01 | Listar metas do grupo | Happy | GET `/v1/supervisor/goals` | 200, metas dos vendedores supervisionados |
| CT-UC039-02 | Filtrar por status | Edge | GET `?status=at_risk` | Apenas metas em risco |
| CT-UC039-03 | Supervisor sem grupo | Edge | Supervisor novo sem vendedores | 200 com `data: []` |

## UC-040 — Lançar resultados em lote

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC040-01 | Upload CSV válido | Happy | POST `/v1/supervisor/results/bulk` com CSV 100 linhas | 202, job ID, 100 resultados criados |
| CT-UC040-02 | CSV com coluna faltante | Error | CSV sem `indicator_id` | 422 `CSV_MISSING_COLUMN` |
| CT-UC040-03 | CSV com valor negativo | Error | Linha com `value=-100` | 422, linha rejeitada, demais processadas |
| CT-UC040-04 | CSV com usuário inexistente | Error | `user_id=999` | 422, linha rejeitada com detalhe |
| CT-UC040-05 | Arquivo > 10MB | Error | Upload de 15MB | 413 `FILE_TOO_LARGE` |
| CT-UC040-06 | Importação idempotente | Edge | Re-enviar mesmo CSV com `batchId` | Nenhum resultado duplicado |

---

# PARTE V — CASOS DE TESTE POR UC: VENDEDOR/AUTH/LGPD (UC-041 a UC-059)

# Capítulo 15 — Casos de Teste UC-041 a UC-059

## UC-041 — Visualizar dashboard do grupo

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC041-01 | Dashboard do grupo | Happy | GET `/v1/supervisor/dashboard` | 200, KPIs agregados |
| CT-UC041-02 | Sem vendedores no grupo | Edge | Supervisor novo | 200 com `hasData: false` |
| CT-UC041-03 | Filtrar por período | Edge | GET `?from=2025-08-01&to=2025-08-15` | Apenas dados do período |

## UC-042 — Consultar histórico de vendedores

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC042-01 | Histórico mensal | Happy | GET `/v1/supervisor/users/10/history?period=monthly` | 200, séries temporais |
| CT-UC042-02 | Vendedor fora do escopo | Error | `userId` de outra filial | 403 |
| CT-UC042-03 | Vendedor sem histórico | Edge | Vendedor novo | 200 com `data: []` |

## UC-043 — Reportar feedback ao gerente

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC043-01 | Enviar feedback | Happy | POST `/v1/supervisor/feedback` com `message` | 201, notificação ao gerente |
| CT-UC043-02 | Feedback vazio | Error | POST com `message=""` | 422 `MESSAGE_REQUIRED` |
| CT-UC043-03 | Feedback com anexo | Edge | POST multipart com imagem | 201, anexo em S3 |

## UC-044 — Aprovar resultados pendentes do grupo

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC044-01 | Aprovar resultado do grupo | Happy | POST `/v1/supervisor/results/:id/approve` | 200 |
| CT-UC044-02 | Aprovar resultado fora do grupo | Error | Resultado de vendedor de outro supervisor | 403 |
| CT-UC044-03 | Aprovação em lote do grupo | Edge | POST `/results/batch-approve` com IDs do grupo | 200, todos aprovados |

## UC-045 — Visualizar dashboard pessoal

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC045-01 | Dashboard do vendedor logado | Happy | GET `/v1/user/dashboard` | 200, metas e progresso do próprio usuário |
| CT-UC045-02 | Vendedor sem metas | Edge | Vendedor novo | 200 com `goals: []` e `hasGoals: false` |
| CT-UC045-03 | Acesso cross-tenant | Error | Token de empresa B acessando endpoint | Filtro automático por `companyId` do token |

## UC-046 — Consultar metas do dia/semana/mês

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC046-01 | Metas do dia | Happy | GET `/v1/user/goals?period=daily` | 200, metas ativas do dia |
| CT-UC046-02 | Meta semanal com progresso parcial | Edge | 3 dias de 7 com resultados | `progressPercent: 45` |
| CT-UC046-03 | Meta mensal com 100% atingido | Edge | Meta atingida | `status: achieved`, badge exibido |
| CT-UC046-04 | Meta vencida sem resultado | Edge | Meta mensal passada sem lançamentos | `status: missed` |

## UC-047 — Lançar resultado diário

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC047-01 | Lançar valor válido | Happy | POST `/v1/user/results` com `{indicatorId, value, resultDate}` | 201, progresso recalculado |
| CT-UC047-02 | Lançar valor negativo | Error | POST com `value=-50` | 422 `VALUE_NEGATIVE` |
| CT-UC047-03 | Lançar para data futura | Error | POST com `resultDate > today` | 422 `RESULT_DATE_IN_FUTURE` |
| CT-UC047-04 | Lançar para data muito antiga | Error | POST com `resultDate < today-7d` | 422 `RESULT_DATE_TOO_OLD` |
| CT-UC047-05 | Lançar duplicata (mesma data+indicador) | Error | POST duplicado | 409 `RESULT_ALREADY_EXISTS` |
| CT-UC047-06 | Lançar após meta encerrada | Error | Meta com `status=closed` | 409 `GOAL_CLOSED` |
| CT-UC047-07 | Lançar valor 0 | Edge | POST com `value=0` | 201 (válido: indica zero vendas no dia) |
| CT-UC047-08 | Lançar valor extremo (outlier) | Edge | POST com `value=999999999` | 201, mas flagged para revisão |

## UC-048 — Visualizar ranking individual

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC048-01 | Ranking do vendedor | Happy | GET `/v1/user/ranking?period=monthly` | 200, posição no ranking |
| CT-UC048-02 | Vendedor em primeiro | Edge | Vendedor com maior score | `position: 1`, badge |
| CT-UC048-03 | Vendedor não ranqueado | Edge | Vendedor sem resultados no período | `position: null` |

## UC-049 — Consultar histórico próprio

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC049-01 | Histórico dos últimos 30 dias | Happy | GET `/v1/user/history?days=30` | 200, série temporal |
| CT-UC049-02 | Filtrar por indicador | Edge | GET `?indicatorId=1` | Apenas resultados do indicador |
| CT-UC049-03 | Sem histórico | Edge | Vendedor novo | 200 com `data: []` |

## UC-050 — Participar de campanhas

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC050-01 | Listar campanhas ativas | Happy | GET `/v1/user/campaigns?status=active` | 200, campanhas em andamento |
| CT-UC050-02 | Ver posição em campanha | Edge | GET `/v1/user/campaigns/:id/standing` | 200, posição e prêmio potencial |
| CT-UC050-03 | Campanha encerrada | Edge | GET campanha `ended` | 200 com `finalPosition` |

## UC-051 — Receber notificações

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC051-01 | Listar notificações não lidas | Happy | GET `/v1/user/notifications?unread=true` | 200, lista |
| CT-UC051-02 | Marcar como lida | Edge | PATCH `/v1/user/notifications/:id/read` | 204 |
| CT-UC051-03 | WebSocket push | Edge | Conectar WS, evento `goal_50_percent` | Mensagem recebida em < 1s |
| CT-UC051-04 | Notificação expirada | Edge | Notificação com 30 dias | Auto-arquivada, não listada |

## UC-052 — Consultar premiações recebidas

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC052-01 | Listar prêmios | Happy | GET `/v1/user/awards` | 200, prêmios recebidos |
| CT-UC052-02 | Prêmio pendente de resgate | Edge | Award com `status=pending` | Aparece com botão "Resgatar" |
| CT-UC052-03 | Resgatar prêmio | Edge | POST `/v1/user/awards/:id/redeem` | 200, status `redeemed` |

## UC-053 — Atualizar perfil

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC053-01 | Atualizar nome | Happy | PATCH `/v1/user/profile` com `name` | 200 |
| CT-UC053-02 | Atualizar email | Edge | PATCH com novo email | 200, email de confirmação enviado, email antigo mantido até confirmação |
| CT-UC053-03 | Atualizar avatar | Edge | POST multipart com PNG | 200, URL pública |
| CT-UC053-04 | Nome com XSS | Error | PATCH com `name="<script>alert(1)</script>"` | 200 mas sanitizado para `&lt;script&gt;...` |
| CT-UC053-05 | Nome muito longo | Error | PATCH com 300 chars | 422 `NAME_TOO_LONG` |

## UC-054 — Consultar IA para sugestões pessoais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC054-01 | Sugestão pessoal | Happy | POST `/v1/user/ai/suggestions` | 200, resposta mockada com "8% abaixo da meta" |
| CT-UC054-02 | Sem metas ativas | Edge | Vendedor sem metas | 200 com `suggestions: null` e `message: "Sem metas ativas para análise"` |
| CT-UC054-03 | Rate limit | Error | 6ª chamada em 1h | 429 `AI_RATE_LIMIT` |

## UC-055 — Autenticar no sistema (login/logout)

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC055-01 | Login com credenciais válidas | Happy | POST `/v1/auth/login` com email+senha corretos | 200, `accessToken` + `refreshToken` + cookie `orion_session` |
| CT-UC055-02 | Senha incorreta | Error | POST com senha errada | 401 `INVALID_CREDENTIALS` |
| CT-UC055-03 | Usuário inexistente | Error | POST com email aleatório | 401 `INVALID_CREDENTIALS` (mesma msg, sem leak) |
| CT-UC055-04 | Usuário bloqueado | Error | POST com `status=blocked` | 403 `ACCOUNT_BLOCKED` |
| CT-UC055-05 | 5 tentativas falhas → bloqueio | Edge | 5 POSTs com senha errada | 6º retorna 403 `ACCOUNT_LOCKED` por 15min |
| CT-UC055-06 | Login após expiração de trial | Error | Tenant com `trialEndsAt < today` | 403 `TRIAL_EXPIRED` |
| CT-UC055-07 | Login com licença expirada | Error | Tenant com licença `expired` | 403 `LICENSE_EXPIRED` |
| CT-UC055-08 | Refresh token válido | Happy | POST `/v1/auth/refresh` | 200, novos tokens |
| CT-UC055-09 | Refresh token reuso (token rotation) | Error | Usar refresh token antigo | 401 + revoga família (`familyId`) |
| CT-UC055-10 | Logout | Happy | POST `/v1/auth/logout` | 204, sessão revogada, cookie cleared |
| CT-UC055-11 | Login com MFA | Edge | POST login → 200 com `mfaRequired=true`; POST `/v1/auth/mfa/verify` | Access token após MFA |
| CT-UC055-12 | CSRF token válido | Happy | POST com header `X-CSRF-Token` | 200 |
| CT-UC055-13 | CSRF token ausente | Error | POST sem header CSRF | 403 `CSRF_TOKEN_MISSING` |
| CT-UC055-14 | Brute force rate limit | Perf | 50 logins em 1min do mesmo IP | 429 após 20 |

## UC-056 — Recuperar senha

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC056-01 | Solicitar recuperação | Happy | POST `/v1/auth/forgot-password` | 200, email enviado (mesmo se usuário não existe — anti-enumeration) |
| CT-UC056-02 | Redefinir com token válido | Happy | POST `/v1/auth/reset-password` com token e nova senha | 200, senha atualizada, todas sessões revogadas |
| CT-UC056-03 | Token expirado | Error | POST com token com > 1h | 401 `RESET_TOKEN_EXPIRED` |
| CT-UC056-04 | Token já usado | Error | POST com token reutilizado | 401 `RESET_TOKEN_ALREADY_USED` |
| CT-UC056-05 | Senha fraca | Error | POST com `123456` | 422 `PASSWORD_TOO_WEAK` |
| CT-UC056-06 | Senha igual à anterior | Error | POST com senha atual | 422 `PASSWORD_MUST_DIFFER` |
| CT-UC057-06 | Email não existente | Edge | POST com email aleatório | 200 (anti-enumeration, mas email não enviado) |

## UC-057 — Configurar preferências pessoais

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC057-01 | Alterar tema (dark/light) | Happy | PUT `/v1/user/preferences` com `theme=dark` | 200 |
| CT-UC057-02 | Configurar notificações | Edge | PUT com `notifications: { email: false, push: true, whatsapp: false }` | 200 |
| CT-UC057-03 | Idioma pessoal diferente do tenant | Edge | PUT com `locale=en-US` em tenant `pt-BR` | 200 |

## UC-058 — Solicitar exportação de dados pessoais (LGPD)

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC058-01 | Solicitar exportação | Happy | POST `/v1/user/lgpd/export` | 202, job enfileirado, email com link em até 24h |
| CT-UC058-02 | Segunda solicitação antes de 30 dias | Error | POST novamente em 15 dias | 429 `LGPD_EXPORT_RATE_LIMIT` |
| CT-UC058-03 | Download do arquivo | Edge | GET `/v1/user/lgpd/export/:id/download` | 200, ZIP com JSON/CSV por entidade |
| CT-UC058-04 | Verificação de identidade | Edge | Solicitar exportação exige senha | 200 apenas com senha correta |
| CT-UC058-05 | Link expira em 7 dias | Error | Download após 8 dias | 410 `EXPORT_LINK_EXPIRED` |

## UC-059 — Solicitar anonimização de dados pessoais (LGPD)

| ID | Cenário | Tipo | Passos | Resultado esperado |
|----|---------|------|--------|-------------------|
| CT-UC059-01 | Solicitar anonimização | Happy | POST `/v1/user/lgpd/anonymize` com senha | 202, job agendado em 30 dias (período de carência) |
| CT-UC059-02 | Cancelar anonimização | Edge | POST `/v1/user/lgpd/anonymize/cancel` dentro da carência | 200, job cancelado |
| CT-UC059-03 | Anonimização executa após 30 dias | Edge | Job roda, dados PII anonimizados | `User.name=ANONYMIZED`, `email=user123@anonymized.local`, `cpf=NULL` |
| CT-UC059-04 | Auditoria mantida | Edge | Após anonimização, audit_logs preservados | Logs sem PII, mas com `userId` referenciado |
| CT-UC059-05 | Senha incorreta | Error | POST com senha errada | 401 `INVALID_PASSWORD` |
| CT-UC059-06 | Admin forçar anonimização de outro usuário | Error | POST com token de admin em endpoint de user | 403 |

---

# PARTE VI — E2E COM PLAYWRIGHT

# Capítulo 16 — Estratégia E2E

## 16.1 Configuração

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'e2e-results.xml' }],
    ['list'],
    ['@playwright/test-reporter-allure'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.spec\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /mobile.*\.spec\.ts/,
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      testMatch: /mobile.*\.spec\.ts/,
    },
    {
      name: 'accessibility',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /a11y.*\.spec\.ts/,
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /visual.*\.spec\.ts/,
    },
  ],
});
```

## 16.2 Global setup

```typescript
// e2e/global-setup.ts
import { FullConfig, request } from '@playwright/test';
import { execSync } from 'child_process';

export default async function globalSetup(config: FullConfig) {
  // Reset staging DB
  if (process.env.E2E_RESET_DB === 'true') {
    execSync('npm run db:reset:staging', { stdio: 'inherit' });
    execSync('npm run db:seed:e2e', { stdio: 'inherit' });
  }

  // Warmup: garante que servidor está acessível
  const baseURL = config.projects[0].use?.baseURL;
  for (let i = 0; i < 30; i++) {
    try {
      const ctx = await request.newContext({ baseURL });
      const res = await ctx.get('/api/health');
      if (res.ok()) return;
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Server did not start in 30s');
}
```

---

# Capítulo 17 — Page Objects

## 17.1 Base Page

```typescript
// e2e/pages/base.page.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  protected get testId() {
    return (id: string) => this.page.locator(`[data-testid="${id}"]`);
  }

  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async clickTestId(id: string) {
    await this.testId(id).click();
  }

  async fillTestId(id: string, value: string) {
    await this.testId(id).fill(value);
  }

  async expectTestIdVisible(id: string) {
    await expect(this.testId(id)).toBeVisible();
  }

  async expectTestIdText(id: string, text: string | RegExp) {
    await expect(this.testId(id)).toContainText(text);
  }

  async expectToast(text: string) {
    await expect(this.page.locator('[role=status]')).toContainText(text);
  }

  async expectError(text: string) {
    await expect(this.page.locator('[role=alert]')).toContainText(text);
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
  }
}
```

## 17.2 LoginPage

```typescript
// e2e/pages/login.page.ts
import { BasePage } from './base.page';
import { Page, expect } from '@playwright/test';

export class LoginPage extends BasePage {
  readonly emailInput = this.testId('email');
  readonly passwordInput = this.testId('password');
  readonly submitButton = this.testId('login-button');
  readonly forgotPasswordLink = this.page.getByRole('link', { name: /esqueci/i });
  readonly mfaInput = this.testId('mfa-code');

  async goto() {
    await super.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginWithMFA(email: string, password: string, mfaCode: string) {
    await this.login(email, password);
    await this.mfaInput.fill(mfaCode);
    await this.testId('mfa-verify').click();
  }

  async expectErrorMessage(text: string) {
    await expect(this.page.locator('[role=alert]')).toContainText(text);
  }

  async expectAccountLocked() {
    await this.expectErrorMessage(/bloqueada/i);
  }
}
```

## 17.3 DashboardPage

```typescript
// e2e/pages/dashboard.page.ts
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly quickActionLancar = this.testId('quick-action-lancar');
  readonly kpiFaturamento = this.testId('kpi-faturamento');
  readonly kpiMetas = this.testId('kpi-metas');
  readonly menuMetas = this.testId('menu-metas');
  readonly menuRanking = this.testId('menu-ranking');
  readonly menuCampanhas = this.testId('menu-campanhas');
  readonly userMenu = this.testId('user-menu');
  readonly logoutButton = this.testId('logout');

  async expectLoaded() {
    await this.expectTestIdVisible('dashboard-container');
    await this.page.waitForLoadState('networkidle');
  }

  async getKpiValue(testId: string): Promise<string> {
    return this.testId(testId).textContent() ?? '';
  }

  async goToGoals() {
    await this.menuMetas.click();
    await this.page.waitForURL(/\/goals/);
  }

  async goToRanking() {
    await this.menuRanking.click();
    await this.page.waitForURL(/\/ranking/);
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }
}
```

## 17.4 ResultEntryPage

```typescript
// e2e/pages/result-entry.page.ts
import { BasePage } from './base.page';

export class ResultEntryPage extends BasePage {
  readonly indicatorInput = (code: string) => this.testId(`indicator-${code}`);
  readonly progressPercent = this.testId('progress-percent');
  readonly saveButton = this.testId('save-result');
  readonly cancelButton = this.testId('cancel-result');
  readonly resultDateInput = this.testId('result-date');

  async goto() {
    await super.goto('/results/new');
  }

  async fillIndicator(code: string, value: string) {
    await this.indicatorInput(code).fill(value);
  }

  async expectProgress(percent: number) {
    await this.expectTestIdText('progress-percent', new RegExp(`${percent}%`));
  }

  async save() {
    await this.saveButton.click();
  }

  async expectValidationError(field: string, message: string) {
    await expect(this.page.locator(`[data-testid="error-${field}"]`)).toContainText(message);
  }
}
```

## 17.5 GoalCreationPage

```typescript
// e2e/pages/goal-creation.page.ts
import { BasePage } from './base.page';

export class GoalCreationPage extends BasePage {
  readonly scopeTeamRadio = this.testId('scope-team');
  readonly scopeIndividualRadio = this.testId('scope-individual');
  readonly indicatorSelect = this.testId('indicator-select');
  readonly targetValueInput = this.testId('target-value');
  readonly periodMonthlyRadio = this.testId('period-monthly');
  readonly periodWeeklyRadio = this.testId('period-weekly');
  readonly saveButton = this.testId('save-goal');
  readonly distributeEqualRadio = this.testId('distribute-equal');
  readonly distributeWeightedRadio = this.testId('distribute-weighted');

  async goto() {
    await super.goto('/goals/new');
  }

  async selectIndicator(name: string) {
    await this.indicatorSelect.click();
    await this.page.click(`[data-testid="indicator-option-${name.toLowerCase().replace(/\s/g, '-')}"]`);
  }

  async fill(target: number, scope: 'team' | 'individual') {
    if (scope === 'team') await this.scopeTeamRadio.click();
    else await this.scopeIndividualRadio.click();
    await this.targetValueInput.fill(String(target));
    await this.periodMonthlyRadio.click();
  }

  async save() {
    await this.saveButton.click();
  }
}
```

---

# Capítulo 18 — Cenários E2E Críticos

## 18.1 Login flow

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Login flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('successful login as admin', async ({ page }) => {
    await loginPage.login('admin@empresa.com', 'Senha@123');
    const dashboard = new DashboardPage(page);
    await dashboard.expectLoaded();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('fails with wrong password', async () => {
    await loginPage.login('admin@empresa.com', 'wrongpass');
    await loginPage.expectErrorMessage(/credenciais inválidas/i);
  });

  test('fails with non-existent user (same message)', async () => {
    await loginPage.login('ghost@empresa.com', 'anypass');
    await loginPage.expectErrorMessage(/credenciais inválidas/i);
  });

  test('account locks after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await loginPage.goto();
      await loginPage.login('admin@empresa.com', 'wrong');
    }
    await loginPage.expectAccountLocked();
  });

  test('blocked user cannot login', async () => {
    await loginPage.login('blocked@empresa.com', 'Senha@123');
    await loginPage.expectErrorMessage(/conta bloqueada/i);
  });

  test('redirects to dashboard if already logged in', async ({ page, context }) => {
    // Login uma vez
    await loginPage.login('admin@empresa.com', 'Senha@123');
    await new DashboardPage(page).expectLoaded();
    // Tentar acessar /login novamente
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('logout clears session', async ({ page, context }) => {
    await loginPage.login('admin@empresa.com', 'Senha@123');
    const dashboard = new DashboardPage(page);
    await dashboard.expectLoaded();
    await dashboard.logout();
    await expect(page).toHaveURL(/\/login/);
    // Tentar acessar dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('MFA flow', async ({ page }) => {
    await loginPage.login('mfa@empresa.com', 'Senha@123');
    await loginPage.loginWithMFA('mfa@empresa.com', 'Senha@123', '123456');
    await new DashboardPage(page).expectLoaded();
  });
});
```

## 18.2 Result entry (UC-047)

```typescript
// e2e/results/result-entry.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ResultEntryPage } from '../pages/result-entry.page';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('UC-047: Lançamento de resultado diário', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('vendedor@empresa.com', 'Senha@123');
    await new DashboardPage(page).expectLoaded();
  });

  test('happy path: vendedor submits valid result', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.quickActionLancar.click();

    const entry = new ResultEntryPage(page);
    await entry.expectLoaded();
    await entry.fillIndicator('faturamento', '1250.50');
    await entry.fillIndicator('clientes', '15');
    await entry.expectProgress(42);
    await entry.save();

    await entry.expectToast(/resultado salvo/i);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('edge: zero value accepted', async ({ page }) => {
    await new DashboardPage(page).quickActionLancar.click();
    const entry = new ResultEntryPage(page);
    await entry.fillIndicator('faturamento', '0');
    await entry.save();
    await entry.expectToast(/resultado salvo/i);
  });

  test('error: negative value rejected', async ({ page }) => {
    await new DashboardPage(page).quickActionLancar.click();
    const entry = new ResultEntryPage(page);
    await entry.fillIndicator('faturamento', '-50');
    await entry.save();
    await entry.expectValidationError('faturamento', /valor negativo/i);
  });

  test('error: future date rejected', async ({ page }) => {
    await new DashboardPage(page).quickActionLancar.click();
    const entry = new ResultEntryPage(page);
    await entry.fillIndicator('faturamento', '100');
    await entry.resultDateInput.fill('2099-12-31');
    await entry.save();
    await entry.expectValidationError('result-date', /data futura/i);
  });

  test('edge: progress updates in real-time', async ({ page }) => {
    await new DashboardPage(page).quickActionLancar.click();
    const entry = new ResultEntryPage(page);
    await entry.fillIndicator('faturamento', '500');
    await entry.expectProgress(16);
    await entry.fillIndicator('faturamento', '1500');
    await entry.expectProgress(50);
  });
});
```

## 18.3 Goal creation (UC-029)

```typescript
// e2e/goals/goal-creation.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { GoalCreationPage } from '../pages/goal-creation.page';

test.describe('UC-029: Manager creates team goal', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('gerente@empresa.com', 'Senha@123');
    await new DashboardPage(page).expectLoaded();
  });

  test('happy path: monthly goal for team', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goToGoals();
    await page.click('[data-testid=new-goal]');

    const goalPage = new GoalCreationPage(page);
    await goalPage.fill(30000, 'team');
    await goalPage.selectIndicator('Faturamento');
    await goalPage.save();

    await goalPage.expectToast(/meta criada para \d+ vendedores/i);

    // Verifica na listagem
    await dashboard.goToGoals();
    await expect(page.locator('table')).toContainText('R$ 30.000,00');
  });

  test('error: negative target rejected', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goToGoals();
    await page.click('[data-testid=new-goal]');

    const goalPage = new GoalCreationPage(page);
    await goalPage.fill(-1000, 'team');
    await goalPage.selectIndicator('Faturamento');
    await goalPage.save();
    await goalPage.expectError(/valor negativo/i);
  });

  test('edge: equal distribution across team', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goToGoals();
    await page.click('[data-testid=new-goal]');

    const goalPage = new GoalCreationPage(page);
    await goalPage.fill(40000, 'team');
    await goalPage.selectIndicator('Faturamento');
    await goalPage.distributeEqualRadio.click();
    await goalPage.save();

    await goalPage.expectToast(/meta criada para 8 vendedores/i);
    // Cada um fica com 5000
    await dashboard.goToGoals();
    await expect(page.locator('table')).toContainText('R$ 5.000,00');
  });
});
```

## 18.4 Cross-tenant isolation E2E

```typescript
// e2e/security/cross-tenant.spec.ts
import { test, expect } from '@playwright/test';

test('user from company A cannot access company B data via URL', async ({ page, context }) => {
  // Login como admin da empresa A
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'admin@empresaA.com');
  await page.fill('[data-testid=password]', 'Senha@123');
  await page.click('[data-testid=login-button]');
  await expect(page).toHaveURL(/\/dashboard/);

  // Tenta acessar diretamente URL com ID de empresa B
  await page.goto('/companies/2/users');
  await expect(page.locator('[role=alert]')).toContainText(/não encontrado|acesso negado/i);
  await expect(page).toHaveURL(/\/dashboard/);
});

test('API rejects cross-tenant request', async ({ request, context }) => {
  const cookies = await context.cookies();
  const session = cookies.find(c => c.name === 'orion_session');

  // Tenta buscar usuário de outra empresa
  const res = await request.get('/api/v1/users/100', {
    headers: { Cookie: `orion_session=${session?.value}` },
  });
  expect(res.status()).toBe(404);
});
```

## 18.5 PWA / Offline flow

```typescript
// e2e/pwa/offline.spec.ts
import { test, expect } from '@playwright/test';

test('PWA works offline after first load', async ({ page, context }) => {
  // Login online
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'vendedor@empresa.com');
  await page.fill('[data-testid=password]', 'Senha@123');
  await page.click('[data-testid=login-button]');
  await expect(page).toHaveURL(/\/dashboard/);

  // Aguarda service worker registrar
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  // Vai offline
  await context.setOffline(true);

  // Navega para página cached
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
  await expect(page.locator('[data-testid=offline-indicator]')).toBeVisible();

  // Tenta lançar resultado (deve enfileirar)
  await page.click('[data-testid=quick-action-lancar]');
  await page.fill('[data-testid=indicator-faturamento]', '500');
  await page.click('[data-testid=save-result]');
  await expect(page.locator('[role=status]')).toContainText(/será sincronizado/i);

  // Volta online
  await context.setOffline(false);
  await expect(page.locator('[role=status]')).toContainText(/sincronizado com sucesso/i);
});
```

---

# PARTE VII — TESTES ESPECIALIZADOS

# Capítulo 19 — Testes de Segurança

## 19.1 SAST (Static Analysis)

- **ESLint security plugin** (`eslint-plugin-security`) em CI
- **SonarQube** scan a cada PR
- **CodeQL** semanal
- **Semgrep** com regras OWASP Top 10
- Falhas `critical`/`high` bloqueiam merge

## 19.2 DAST (Dynamic Analysis)

- **OWASP ZAP** scan semanal em staging
- **Burp Suite Professional** pentest trimestral
- **sqlmap** automatizado em endpoints com query params

## 19.3 Testes específicos — SQL Injection

```typescript
// test/security/sql-injection.test.ts
import request from 'supertest';
import { app } from '@/app';
import { getAuthToken } from '../helpers/auth';

const SQL_INJECTION_PAYLOADS = [
  "' OR 1=1 --",
  "'; DROP TABLE users; --",
  "' UNION SELECT * FROM users --",
  "' OR '1'='1",
  "admin'--",
  "' OR SLEEP(5)--",
  "1' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
  "' OR 1=1#",
  "'/**/OR/**/1=1",
  "0x31 OR 1=1",
];

describe('SQL Injection prevention', () => {
  let token: string;
  beforeAll(async () => { token = await getAuthToken('admin@empresa.com'); });

  it.each(SQL_INJECTION_PAYLOADS)('search param: %s', async (payload) => {
    const res = await request(app.callback())
      .get(`/v1/users?search=${encodeURIComponent(payload)}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).not.toHaveProperty('password_hash');
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it.each(SQL_INJECTION_PAYLOADS)('id param: %s', async (payload) => {
    const res = await request(app.callback())
      .get(`/v1/users/${encodeURIComponent(payload)}`)
      .set('Authorization', `Bearer ${token}`);
    // Deve ser 404 (não encontrado) ou 422, nunca 200 com dados
    expect([400, 404, 422]).toContain(res.status);
  });

  it('does not expose stack trace on SQL error', async () => {
    const res = await request(app.callback())
      .get(`/v1/users?sort=invalid_column`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.body).not.toHaveProperty('stack');
    expect(res.body).not.toHaveProperty('query');
  });
});
```

## 19.4 XSS prevention

```typescript
// test/security/xss.test.ts
const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '"><script>alert(1)</script>',
  "javascript:alert(1)",
  '<svg onload=alert(1)>',
  '<iframe src=javascript:alert(1)>',
  '<body onload=alert(1)>',
];

describe('XSS prevention', () => {
  it.each(XSS_PAYLOADS)('user name sanitized: %s', async (payload) => {
    const adminToken = await getAuthToken('admin@empresa.com');
    await request(app.callback())
      .post('/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: payload, email: 'xss@empresa.com', password: 'Senha@123', roleId: 5, branchId: 1 });

    const res = await request(app.callback())
      .get('/v1/users?search=xss')
      .set('Authorization', `Bearer ${adminToken}`);

    const user = res.body.data.find((u: any) => u.email === 'xss@empresa.com');
    expect(user.name).not.toContain('<script>');
    expect(user.name).not.toContain('onerror=');
    expect(user.name).not.toContain('javascript:');
  });

  it('goal notes do not execute scripts in UI', async ({ page }) => {
    await login(page, 'gerente@empresa.com');
    // Cria meta com XSS nas notas
    await request(page.context().request).post('/v1/goals', {
      data: { notes: '<script>window.__xss=true</script>', /* ... */ },
      headers: { Authorization: `Bearer ${token}` },
    });
    await page.goto('/goals/1');
    const xssTriggered = await page.evaluate(() => (window as any).__xss === true);
    expect(xssTriggered).toBe(false);
  });
});
```

## 19.5 CSRF prevention

```typescript
// test/security/csrf.test.ts
describe('CSRF prevention', () => {
  it('rejects POST without CSRF token', async () => {
    const res = await request(app.callback())
      .post('/v1/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* valid */ });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('rejects POST with invalid CSRF token', async () => {
    const res = await request(app.callback())
      .post('/v1/goals')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', 'invalid-token')
      .send({ /* valid */ });
    expect(res.status).toBe(403);
  });

  it('accepts POST with valid CSRF token from cookie', async () => {
    // 1. GET /v1/auth/csrf-token retorna cookie csrf + token
    const csrfRes = await request(app.callback())
      .get('/v1/auth/csrf-token')
      .set('Authorization', `Bearer ${token}`);
    const csrfToken = csrfRes.body.token;
    const cookies = csrfRes.headers['set-cookie'];

    const res = await request(app.callback())
      .post('/v1/goals')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', csrfToken)
      .set('Cookie', cookies)
      .send({ /* valid */ });
    expect(res.status).toBe(201);
  });

  it('CSRF token rotates per session', async () => {
    const t1 = await getCSRFToken(token);
    const t2 = await getCSRFToken(token);
    expect(t1).not.toBe(t2);
  });
});
```

## 19.6 Multi-tenant isolation

```typescript
// test/security/multi-tenant.test.ts
describe('Multi-tenant isolation', () => {
  it('user from company A cannot read company B data via API', async () => {
    const tokenA = await getAuthToken('admin@empresaA.com');
    const userB = await createUser({ companyId: 2, email: 'b@empresaB.com' });

    const res = await request(app.callback())
      .get(`/v1/users/${userB.id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.status).toBe(404);
  });

  it('user from company A cannot list company B goals', async () => {
    const tokenA = await getAuthToken('admin@empresaA.com');
    const res = await request(app.callback())
      .get(`/v1/goals?companyId=2`)
      .set('Authorization', `Bearer ${tokenA}`);
    expect(res.body.data).toEqual([]);
    // Nenhum goal pertence à company 2
    expect(res.body.data.every((g: any) => g.companyId === 1)).toBe(true);
  });

  it('tenant scope is forced at ORM layer', async () => {
    const tokenA = await getAuthToken('admin@empresaA.com');
    // Tentar criar goal com companyId manipulado
    const res = await request(app.callback())
      .post('/v1/goals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ companyId: 2, userId: 10, indicatorId: 1, targetValue: 1000, goalType: 'monthly', startDate: '2025-08-01', endDate: '2025-08-31' });
    // O servidor deve ignorar companyId do body e usar o do token
    expect(res.body.companyId).toBe(1);
  });

  it('RLS at database level prevents cross-tenant even with raw SQL', async () => {
    // Simula bypass de ORM via prisma.$queryRaw
    const prisma = getTestPrisma();
    await prisma.$executeRaw`SET LOCAL ROLE orion_tenant; SET LOCAL orion.company_id = 1;`;
    const goals = await prisma.$queryRaw`SELECT * FROM goals WHERE company_id = 2`;
    expect(goals).toHaveLength(0);
  });

  it('audit log captures tenant context', async () => {
    const tokenA = await getAuthToken('admin@empresaA.com');
    await request(app.callback())
      .post('/v1/goals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ /* valid */ });
    const logs = await prisma.auditLog.findMany({ where: { action: 'CREATE', entity: 'Goal' } });
    expect(logs.every(l => l.companyId === 1)).toBe(true);
  });
});
```

## 19.7 Authentication security

```typescript
// test/security/auth.test.ts
describe('Auth security', () => {
  it('password hashed with bcrypt cost >= 10', async () => {
    const user = await prisma.user.findFirst({ where: { email: 'admin@empresa.com' } });
    expect(user.passwordHash).toMatch(/^\$2[aby]\$10\$/);
  });

  it('JWT secret has >= 32 chars', () => {
    expect(process.env.JWT_SECRET!.length).toBeGreaterThanOrEqual(32);
  });

  it('access token expires in <= 1h', async () => {
    const token = await getAuthToken('admin@empresa.com');
    const decoded: any = jwt.decode(token);
    expect(decoded.exp - decoded.iat).toBeLessThanOrEqual(3600);
  });

  it('refresh token rotation on use', async () => {
    const login = await request(app.callback()).post('/v1/auth/login').send({ email: 'admin@empresa.com', password: 'Senha@123' });
    const oldRefresh = login.body.refreshToken;

    const refresh1 = await request(app.callback()).post('/v1/auth/refresh').send({ refreshToken: oldRefresh });
    expect(refresh1.status).toBe(200);

    // Reuso do refresh antigo deve revogar família
    const refresh2 = await request(app.callback()).post('/v1/auth/refresh').send({ refreshToken: oldRefresh });
    expect(refresh2.status).toBe(401);

    // Novo refresh também revogado
    const refresh3 = await request(app.callback()).post('/v1/auth/refresh').send({ refreshToken: refresh1.body.refreshToken });
    expect(refresh3.status).toBe(401);
  });

  it('brute force protection: 5 attempts → lock 15min', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.callback()).post('/v1/auth/login').send({ email: 'admin@empresa.com', password: 'wrong' });
    }
    const res = await request(app.callback()).post('/v1/auth/login').send({ email: 'admin@empresa.com', password: 'Senha@123' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
  });

  it('rate limit per IP: 20 logins/min', async () => {
    const results = [];
    for (let i = 0; i < 25; i++) {
      results.push(await request(app.callback()).post('/v1/auth/login').send({ email: 'a@b.com', password: 'x' }));
    }
    const rateLimited = results.filter(r => r.status === 429).length;
    expect(rateLimited).toBeGreaterThan(0);
  });
});
```

## 19.8 File upload security

```typescript
describe('File upload security', () => {
  it('rejects executable file types', async () => {
    const res = await uploadFile('malware.exe', 'application/octet-stream');
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('rejects file with double extension', async () => {
    const res = await uploadFile('image.jpg.exe', 'image/jpeg');
    expect(res.status).toBe(422);
  });

  it('validates magic bytes (not just extension)', async () => {
    const buffer = Buffer.from('MZ' + 'fake-exe-content'); // PE header
    const res = await uploadBuffer('image.jpg', 'image/jpeg', buffer);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('FILE_CONTENT_MISMATCH');
  });

  it('scans for malware with ClamAV', async () => {
    const eicar = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
    const res = await uploadBuffer('test.txt', 'text/plain', eicar);
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('MALWARE_DETECTED');
  });

  it('enforces max size 10MB', async () => {
    const big = Buffer.alloc(11 * 1024 * 1024, 'a');
    const res = await uploadBuffer('big.png', 'image/png', big);
    expect(res.status).toBe(413);
  });
});
```

---

# Capítulo 20 — Testes de Performance (k6)

## 20.1 Dashboard loading

```javascript
// tests/perf/dashboard.js
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const dashboardLatency = new Trend('dashboard_latency');
const cacheHitRate = new Rate('cache_hits');

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      env: { SMOKE: 'true' },
    },
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      startTime: '30s',
    },
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 0 },
      ],
      startTime: '4m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    http_req_failed: ['rate<0.01'],
    dashboard_latency: ['p(95)<1500'],
    cache_hits: ['rate>0.6'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const TOKENS = (__ENV.TOKENS || 'token1,token2').split(',');

export default function () {
  const token = TOKENS[__VU % TOKENS.length];

  group('Dashboard executive', () => {
    const res = http.get(`${BASE}/api/v1/executive/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dashboardLatency.add(res.timings.duration);
    cacheHitRate.add(res.headers['X-Cache'] === 'HIT');

    check(res, {
      'status 200': (r) => r.status === 200,
      'has totalRevenue': (r) => r.json('data.totalRevenue') !== undefined,
      'response < 500ms': (r) => r.timings.duration < 500,
      'has cache header': (r) => r.headers['X-Cache'] !== undefined,
    });
  });

  sleep(1);
}
```

## 20.2 Result entry (alta frequência)

```javascript
// tests/perf/result-entry.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    burst: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 200,
      maxVUs: 500,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.005'],
  },
};

export default function () {
  const token = TOKENS[__VU % TOKENS.length];
  const payload = JSON.stringify({
    indicatorId: 1,
    value: Math.random() * 5000,
    resultDate: new Date().toISOString().substring(0, 10),
  });

  const res = http.post(`${BASE}/api/v1/user/results`, payload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-CSRF-Token': __ENV.CSRF_TOKEN,
    },
  });

  check(res, {
    'status 201': (r) => r.status === 201,
    'response < 400ms': (r) => r.timings.duration < 400,
  });

  sleep(0.1); // 10 req/s por VU
}
```

## 20.3 AI chat (latência alta)

```javascript
// tests/perf/ai-chat.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    sustained: {
      executor: 'constant-vus',
      vus: 10,
      duration: '3m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'],
    http_req_failed: ['rate<0.02'],
  },
};

export default function () {
  const res = http.post(`${BASE}/api/v1/manager/ai/insights`,
    JSON.stringify({ context: 'team_performance', period: '2025-08' }),
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  check(res, {
    'status 200': (r) => r.status === 200,
    'has content': (r) => r.json('content')?.length > 50,
    'response < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(5); // 1 req/5s por VU
}
```

## 20.4 Metas de performance

| Endpoint | p50 | p95 | p99 | RPS alvo |
|----------|-----|-----|-----|----------|
| GET /dashboard/executive | 200ms | 500ms | 1s | 50 |
| GET /goals (list) | 100ms | 300ms | 800ms | 100 |
| POST /results | 150ms | 400ms | 1s | 200 |
| GET /rankings | 300ms | 800ms | 2s | 30 |
| POST /ai/insights | 2s | 5s | 10s | 5 |
| GET /notifications | 50ms | 150ms | 400ms | 200 |
| POST /auth/login | 200ms | 500ms | 1s | 20 |
| POST /users | 250ms | 600ms | 1.5s | 10 |

## 20.5 Baseline comparison no CI

```javascript
// scripts/compare-perf-baseline.js
const fs = require('fs');
const baseline = JSON.parse(fs.readFileSync('tests/perf/baseline.json'));
const current = JSON.parse(fs.readFileSync('tests/perf/latest.json'));

const regressions = [];
for (const endpoint of Object.keys(baseline)) {
  const b = baseline[endpoint];
  const c = current[endpoint];
  if (!c) continue;
  const regression = (c.p95 - b.p95) / b.p95;
  if (regression > 0.10) {
    regressions.push({ endpoint, baseline: b.p95, current: c.p95, regression: (regression * 100).toFixed(1) + '%' });
  }
}

if (regressions.length > 0) {
  console.error('Performance regressions detected:');
  console.table(regressions);
  process.exit(1);
}
console.log('No performance regressions.');
```

---

# Capítulo 21 — Testes de Acessibilidade

## 21.1 axe-core automatizado

```typescript
// e2e/a11y/pages.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { url: '/login', name: 'login', auth: false },
  { url: '/dashboard', name: 'dashboard', auth: true },
  { url: '/goals', name: 'goals-list', auth: true },
  { url: '/goals/new', name: 'goals-new', auth: true },
  { url: '/results/new', name: 'results-new', auth: true },
  { url: '/ranking', name: 'ranking', auth: true },
  { url: '/profile', name: 'profile', auth: true },
  { url: '/settings', name: 'settings', auth: true },
];

test.describe('Accessibility', () => {
  for (const { url, name, auth } of PAGES) {
    test(`${name} has no a11y violations`, async ({ page }) => {
      if (auth) {
        await page.goto('/login');
        await page.fill('[data-testid=email]', 'admin@empresa.com');
        await page.fill('[data-testid=password]', 'Senha@123');
        await page.click('[data-testid=login-button]');
      }
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .withOptions({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
        .analyze();

      if (results.violations.length > 0) {
        console.log(JSON.stringify(results.violations, null, 2));
      }
      expect(results.violations).toEqual([]);
    });
  }
});

test('color contrast meets WCAG AA', async ({ page }) => {
  await page.goto('/dashboard');
  const results = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('keyboard navigation: full flow', async ({ page }) => {
  await page.goto('/login');
  await page.keyboard.press('Tab'); // email
  await expect(page.locator('[data-testid=email]')).toBeFocused();
  await page.keyboard.type('admin@empresa.com');
  await page.keyboard.press('Tab'); // password
  await page.keyboard.type('Senha@123');
  await page.keyboard.press('Enter'); // submit
  await expect(page).toHaveURL(/\/dashboard/);
});

test('screen reader landmarks present', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
});
```

## 21.2 Checklist manual de acessibilidade

- [ ] Navegação completa por teclado (Tab, Shift+Tab, Enter, Space, Esc)
- [ ] Focus visible em todos os interativos (outline não removido)
- [ ] Skip link "Pular para conteúdo" presente
- [ ] Contraste mínimo 4.5:1 (texto) e 3:1 (UI components)
- [ ] Leitor de tela (NVDA/VoiceOver) testa fluxos críticos
- [ ] Zoom 200% não quebra layout
- [ ] Não depende apenas de cor para informação (ícones + texto)
- [ ] Formulários com labels associados (`<label for>`)
- [ ] Erros anunciados via `aria-live`
- [ ] Tabelas com `<th scope>` e caption
- [ ] Imagens com `alt` descritivo (ou `alt=""` se decorativas)
- [ ] ARIA roles corretos para widgets customizados
- [ ] Headings hierarquia sem pular níveis (h1 → h2 → h3)
- [ ] Idioma declarado em `<html lang="pt-BR">`
- [ ] `prefers-reduced-motion` respeitado

---

# Capítulo 22 — Cross-browser Testing

## 22.1 Matriz de browsers

| Browser | Versão mínima | Plataforma | Prioridade |
|---------|--------------|------------|-----------|
| Chrome | 110+ | Windows, macOS, Linux, Android | P0 |
| Safari | 16+ | macOS, iOS | P0 |
| Firefox | 110+ | Windows, macOS, Linux | P1 |
| Edge | 110+ | Windows | P1 |
| Samsung Internet | 22+ | Android | P2 |

## 22.2 Playwright cross-browser

```typescript
// playwright.config.ts (já definido com projects)
// Roda em CI:
// npx playwright test --project=chromium-desktop
// npx playwright test --project=firefox-desktop
// npx playwright test --project=webkit-desktop
```

## 22.3 BrowserStack para browsers legados

```typescript
// e2e/cross-browser/legacy.spec.ts
// Roda apenas diariamente em staging
test.describe('Legacy browser compatibility', () => {
  test('login works on Chrome 110', async ({ browser }) => {
    const context = await browser.newContext({ bypassCSP: true });
    const page = await context.newPage();
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'admin@empresa.com');
    await page.fill('[data-testid=password]', 'Senha@123');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
```

## 22.4 Polyfills testados

- `Intl` para formatação de moeda/data
- `fetch` com AbortController (Safari < 15)
- `ResizeObserver` (necessário para alguns componentes)
- `structuredClone` para deep clone

---

# Capítulo 23 — PWA e Offline Testing

## 23.1 Service Worker registration

```typescript
// e2e/pwa/service-worker.spec.ts
test('service worker registers on first visit', async ({ page }) => {
  await page.goto('/login');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  const reg = await page.evaluate(() => navigator.serviceWorker.getRegistration());
  expect(reg).not.toBeNull();
});

test('manifest is valid', async ({ request }) => {
  const manifest = await request.get('/manifest.json');
  expect(manifest.status()).toBe(200);
  const body = await manifest.json();
  expect(body.name).toBeTruthy();
  expect(body.icons.length).toBeGreaterThan(0);
  expect(body.start_url).toBe('/');
  expect(body.display).toMatch(/standalone|fullscreen/);
});
```

## 23.2 Offline scenarios

```typescript
test('app shell cached for offline', async ({ page, context }) => {
  await page.goto('/dashboard');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-testid=offline-indicator]')).toBeVisible();
});

test('form submissions queued offline', async ({ page, context }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'vendedor@empresa.com');
  await page.fill('[data-testid=password]', 'Senha@123');
  await page.click('[data-testid=login-button]');
  await page.waitForURL(/\/dashboard/);

  await context.setOffline(true);
  await page.click('[data-testid=quick-action-lancar]');
  await page.fill('[data-testid=indicator-faturamento]', '500');
  await page.click('[data-testid=save-result]');
  await expect(page.locator('[role=status]')).toContainText(/será sincronizado/i);
  await expect(page.locator('[data-testid=pending-sync-count]')).toContainText('1');

  await context.setOffline(false);
  await expect(page.locator('[role=status]')).toContainText(/sincronizado com sucesso/i);
  await expect(page.locator('[data-testid=pending-sync-count]')).toContainText('0');
});

test('conflict resolution on sync', async ({ page, context }) => {
  // Cenário: usuário edita offline, mas outro usuário editou online
  await page.goto('/results/1/edit');
  await context.setOffline(true);
  await page.fill('[data-testid=value-input]', '2000');
  await page.click('[data-testid=save-result]');

  // Simula mudança no servidor enquanto offline
  await prisma.result.update({ where: { id: 1 }, data: { value: 1800 } });

  await context.setOffline(false);
  await expect(page.locator('[role=alert]')).toContainText(/conflito detectado/i);
  await expect(page.locator('[data-testid=conflict-resolution]')).toBeVisible();
});
```

## 23.3 Background sync

```typescript
test('background sync fires when connection restored', async ({ page, context }) => {
  // ... prepara dados offline
  await context.setOffline(true);
  // ... adiciona 3 itens à fila
  await context.setOffline(false);
  // Aguarda sync completar
  await page.waitForFunction(() => {
    const pending = document.querySelector('[data-testid=pending-sync-count]');
    return pending?.textContent === '0';
  }, null, { timeout: 10_000 });
});
```

---

# Capítulo 24 — Testes de IA (LLM Mocking)

## 24.1 Estratégia

- **Unit/integration:** mock do cliente LLM com respostas determinísticas por chave de prompt.
- **E2E:** interceptor que retorna respostas pré-gravadas.
- **Eval:** suite separada com prompts reais e avaliação humana + heurísticas (ROUGE, BLEU, factuality).
- **Prompt regression:** snapshot dos prompts; diff alerta se prompt mudou.

## 24.2 Mock client (já visto no Cap. 6.5)

## 24.3 Avaliação de qualidade

```typescript
// tests/ai/eval-insights.test.ts
import { describe, it, expect } from 'vitest';
import { AIService } from '@/modules/ai/ai.service';

const TEST_CASES = [
  {
    name: 'insights com crescimento',
    context: { teamGrowth: 0.15, topPerformer: 'Santos', atRiskIndicators: ['ticket_medio'] },
    mustContain: ['crescimento', '15%', 'Santos', 'ticket'],
    mustNotContain: ['dados sensíveis', 'CPF', 'telefone'],
  },
  {
    name: 'sugestão pessoal vendedor',
    context: { userProgress: 0.42, daysRemaining: 3, teamAvg: 0.65 },
    mustContain: ['meta', 'abaixo'],
    mustNotContain: ['outros vendedores', 'comparar com colegas'],
  },
];

describe('AI insights quality', () => {
  for (const tc of TEST_CASES) {
    it(tc.name, async () => {
      const result = await new AIService().generateInsights(tc.context);
      for (const keyword of tc.mustContain) {
        expect(result.content.toLowerCase()).toContain(keyword.toLowerCase());
      }
      for (const forbidden of tc.mustNotContain) {
        expect(result.content.toLowerCase()).not.toContain(forbidden.toLowerCase());
      }
    });
  }
});
```

## 24.4 Prompt regression test

```typescript
// tests/ai/prompt-snapshot.test.ts
import { describe, it, expect } from 'vitest';
import { buildInsightsPrompt } from '@/modules/ai/prompts';
import fs from 'node:fs';

describe('Prompt regression', () => {
  it('insights prompt has not changed', () => {
    const prompt = buildInsightsPrompt({ teamId: 1, period: '2025-08' });
    const snapshot = fs.readFileSync('tests/ai/snapshots/insights-prompt.txt', 'utf8');
    expect(prompt).toBe(snapshot);
  });
});
```

## 24.5 Cost & latency tracking

```typescript
describe('AI cost tracking', () => {
  it('logs token usage per request', async () => {
    const result = await aiService.generateInsights(context);
    expect(result.usage.promptTokens).toBeGreaterThan(0);
    expect(result.usage.completionTokens).toBeGreaterThan(0);
    // Log no banco
    const log = await prisma.aiUsageLog.findFirst({ orderBy: { createdAt: 'desc' } });
    expect(log.tokensIn).toBe(result.usage.promptTokens);
    expect(log.cost).toBeGreaterThan(0);
  });

  it('enforces monthly budget per tenant', async () => {
    // Esgota budget
    await prisma.aiUsageLog.updateMany({ where: { companyId: 1 }, data: { cost: 999 } });
    await expect(aiService.generateInsights(context)).rejects.toMatchObject({ code: 'AI_BUDGET_EXCEEDED' });
  });
});
```

## 24.6 Streaming tests

```typescript
describe('AI streaming', () => {
  it('yields chunks progressively', async () => {
    const chunks: string[] = [];
    for await (const chunk of aiService.streamInsights(context)) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('')).toContain('crescimento');
  });

  it('handles client disconnect mid-stream', async () => {
    const generator = aiService.streamInsights(context);
    await generator.next();
    await generator.return(undefined); // simula disconnect
    // Não deve lançar erro
    expect(true).toBe(true);
  });
});
```

---

# Capítulo 25 — Testes de Migração de Banco

## 25.1 Estratégia

- **Migrate deploy test:** roda `prisma migrate deploy` em DB limpo a cada PR.
- **Migrate up/down test:** valida que `migrate resolve --rolled-back` funciona.
- **Data integrity test:** após migration, dados de teste são consistentes.
- **Snapshot diff:** `prisma migrate diff` comparado com `schema.prisma`.

## 25.2 Migration deploy test

```typescript
// test/migrations/migrate-deploy.test.ts
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

describe('Migration deploy', () => {
  beforeAll(() => {
    execSync('docker compose -f docker-compose.test.yml up -d postgres-test', { stdio: 'inherit' });
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
      stdio: 'inherit',
    });
  });

  it('applies all migrations without error', () => {
    // Se chegou aqui, deploy funcionou
    expect(true).toBe(true);
  });

  it('schema matches prisma schema file', () => {
    const diff = execSync('npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma', { encoding: 'utf8' });
    expect(diff.trim()).toBe('-- No changes');
  });

  it('_prisma_migrations table has all migrations', async () => {
    const prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
    const migrations = await prisma.$queryRaw`SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL`;
    expect(migrations.length).toBeGreaterThan(0);
  });
});
```

## 25.3 Migration rollback test

```typescript
// test/migrations/migrate-rollback.test.ts
describe('Migration rollback', () => {
  it('can rollback last migration', () => {
    // Apply
    execSync('npx prisma migrate deploy');
    // Identify last migration
    const lastMigration = execSync('ls prisma/migrations | tail -1', { encoding: 'utf8' }).trim();
    // Rollback via custom SQL (Prisma não tem down migrations nativas, então usamos script)
    execSync(`node scripts/migration-rollback.js ${lastMigration}`);
    // Verify table removed
    const prisma = new PrismaClient(...);
    expect(async () => await prisma.$queryRaw`SELECT to_regclass('public.new_table')`).resolves.toBeNull();
  });
});
```

## 25.4 Data migration test (backfill)

```typescript
// test/migrations/backfill.test.ts
describe('Backfill: add companyId to results', () => {
  beforeAll(async () => {
    // Setup: cria 1000 resultados sem companyId (simula pre-migration)
    await prisma.result.createMany({
      data: Array.from({ length: 1000 }, (_, i) => ({
        userId: (i % 10) + 1,
        indicatorId: 1,
        value: 1000,
        resultDate: new Date('2025-08-15'),
        // companyId será preenchido pelo backfill
      })),
    });
    // Roda migration com backfill
    execSync('npx prisma migrate deploy');
  });

  it('all results have companyId after backfill', async () => {
    const resultsWithoutCompany = await prisma.result.count({ where: { companyId: null } });
    expect(resultsWithoutCompany).toBe(0);
  });

  it('companyId matches user companyId', async () => {
    const results = await prisma.result.findMany({ include: { user: true }, take: 100 });
    for (const r of results) {
      expect(r.companyId).toBe(r.user.companyId);
    }
  });
});
```

## 25.5 Zero-downtime migration

```typescript
describe('Zero-downtime migration: add column', () => {
  it('add column with default without table lock', async () => {
    // Inicia query longa
    const longQueryPromise = prisma.$queryRaw`SELECT pg_sleep(2) FROM goals LIMIT 1`;
    // Dispara migration em paralelo
    setTimeout(() => execSync('npx prisma migrate deploy'), 100);
    // Query não deve ser bloqueada
    await expect(longQueryPromise).resolves.not.toThrow();
  });
});
```

---

# Capítulo 26 — Testes de Integração com ERP/CRM

## 26.1 Contract testing com Pact

```typescript
// test/contract/erp-consumer.spec.ts
import { Pact } from '@pact-foundation/pact';
import path from 'node:path';
import { ERPAdapter } from '@/modules/integrations/erp/adapter';

const provider = new Pact({
  consumer: 'orion-backend',
  provider: 'erp-senior',
  log: path.resolve(__dirname, 'logs', 'pact.log'),
  dir: path.resolve(__dirname, 'pacts'),
  logLevel: 'warn',
});

describe('ERP contract (consumer side)', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  it('fetches customers', async () => {
    await provider.addInteraction({
      uponReceiving: 'a request for customers',
      withRequest: {
        method: 'GET',
        path: '/api/v1/customers',
        headers: { Authorization: 'Bearer token-erp' },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          data: [{
            id: Matchers.string('ERP-001'),
            name: Matchers.string('Cliente Mock'),
            document: Matchers.string('11111111111'),
          }],
        },
      },
    });

    const adapter = new ERPAdapter(provider.mockService.baseUrl, 'token-erp');
    const customers = await adapter.listCustomers();
    expect(customers[0].id).toBe('ERP-001');
  });
});
```

## 26.2 Adapter unit tests com Wiremock

```typescript
// test/integration/erp-adapter.test.ts
import { ERPAdapter } from '@/modules/integrations/erp/adapter';

describe('ERPAdapter', () => {
  const adapter = new ERPAdapter('http://localhost:8080', 'test-token');

  it('listCustomers returns mapped customers', async () => {
    const customers = await adapter.listCustomers({ since: '2025-08-01' });
    expect(customers).toHaveLength(2);
    expect(customers[0]).toMatchObject({ id: 'ERP-001', name: 'Cliente Mock 1' });
  });

  it('handles ERP 500 error gracefully', async () => {
    // Wiremock mapeado para 500
    await expect(adapter.listCustomers()).rejects.toMatchObject({ code: 'ERP_UNAVAILABLE' });
  });

  it('retries on 503 with exponential backoff', async () => {
    const start = Date.now();
    try {
      await adapter.listCustomers();
    } catch {}
    const elapsed = Date.now() - start;
    // 3 retries com backoff: 100 + 200 + 400 = 700ms mínimo
    expect(elapsed).toBeGreaterThan(700);
  });

  it('maps ERP customer to Orion format', async () => {
    const mapped = adapter.mapCustomer({ id: 'ERP-X', name: 'Foo', document: '123', extra: 'ignored' });
    expect(mapped).toEqual({ externalId: 'ERP-X', name: 'Foo', document: '123' });
    expect(mapped).not.toHaveProperty('extra');
  });
});
```

## 26.3 Sync job test

```typescript
// test/integration/erp-sync.test.ts
describe('ERP sync job', () => {
  it('imports new results from ERP', async () => {
    // Setup: ERP retorna 50 resultados novos
    const result = await erpSyncJob.run({ companyId: 1, since: '2025-08-01' });
    expect(result.imported).toBe(50);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
  });

  it('idempotent: re-running same period imports 0', async () => {
    await erpSyncJob.run({ companyId: 1, since: '2025-08-01' });
    const result = await erpSyncJob.run({ companyId: 1, since: '2025-08-01' });
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(50);
  });

  it('partial failure: 1 bad row, 49 imported', async () => {
    // Wiremock retorna 1 row com valor inválido
    const result = await erpSyncJob.run({ companyId: 1 });
    expect(result.imported).toBe(49);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/invalid value/i);
  });
});
```

## 26.4 Webhook reception test

```typescript
// test/integration/erp-webhook.test.ts
describe('ERP webhook receiver', () => {
  it('accepts valid signed webhook', async () => {
    const body = { event: 'customer.created', data: { id: 'ERP-NEW' } };
    const signature = signHMAC(body, process.env.ERP_WEBHOOK_SECRET!);
    const res = await request(app.callback())
      .post('/v1/webhooks/erp')
      .set('X-ERP-Signature', signature)
      .send(body);
    expect(res.status).toBe(204);
  });

  it('rejects unsigned webhook', async () => {
    const res = await request(app.callback())
      .post('/v1/webhooks/erp')
      .send({ event: 'x' });
    expect(res.status).toBe(401);
  });

  it('idempotent: same event twice → 1 processing', async () => {
    const body = { event: 'customer.created', eventId: 'evt-1', data: { id: 'X' } };
    const sig = signHMAC(body, process.env.ERP_WEBHOOK_SECRET!);
    await request(app.callback()).post('/v1/webhooks/erp').set('X-ERP-Signature', sig).send(body);
    const res2 = await request(app.callback()).post('/v1/webhooks/erp').set('X-ERP-Signature', sig).send(body);
    expect(res2.status).toBe(200); // ack mas não reprocessa
  });
});
```

---

# Capítulo 27 — Visual Regression Testing

## 27.1 Setup

```typescript
// e2e/visual/components.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual regression — UI components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'admin@empresa.com');
    await page.fill('[data-testid=password]', 'Senha@123');
    await page.click('[data-testid=login-button]');
  });

  test('dashboard matches baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      animations: 'disabled',
    });
  });

  test('goals list matches baseline', async ({ page }) => {
    await page.goto('/goals');
    await expect(page.locator('main')).toHaveScreenshot('goals-list.png');
  });

  test('mobile dashboard', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    const page = await context.newPage();
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'admin@empresa.com');
    await page.fill('[data-testid=password]', 'Senha@123');
    await page.click('[data-testid=login-button]');
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('mobile-dashboard.png');
  });

  test('dark theme dashboard', async ({ page, context }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard-dark.png');
  });
});
```

## 27.2 Component-level com Storybook

```typescript
// .storybook/visual.test.ts
import { test, expect } from '@playwright/test';
import glob from 'glob';

const stories = glob.sync('src/**/*.stories.tsx');

test.describe('Storybook visual', () => {
  for (const story of stories) {
    test(story, async ({ page }) => {
      const id = story.replace(/.*\//, '').replace('.stories.tsx', '').toLowerCase();
      await page.goto(`/iframe.html?id=${id}&viewMode=story`);
      await expect(page.locator('#root')).toHaveScreenshot(`${id}.png`);
    });
  }
});
```

## 27.3 Masking dynamic content

```typescript
test('dashboard with masked dynamic data', async ({ page }) => {
  await page.goto('/dashboard');
  // Mascara elementos dinâmicos
  await page.locator('[data-testid=kpi-faturamento]').evaluate(el => el.textContent = 'R$ --');
  await page.locator('[data-testid=clock]').evaluate(el => el.textContent = '--:--');
  await expect(page).toHaveScreenshot('dashboard-masked.png');
});
```

---

# Capítulo 28 — Mutation Testing

## 28.1 Configuração Stryker

```json
// stryker.config.json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "reporters": ["html", "dashboard", "json"],
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/modules/goals/**/*.ts",
    "src/modules/results/**/*.ts",
    "src/modules/auth/**/*.ts",
    "src/modules/rankings/**/*.ts"
  ],
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": 50
  },
  "timeoutMS": 10000,
  "concurrency": 4,
  "ignorePatterns": ["**/*.test.ts", "**/*.spec.ts", "**/__mocks__/**"]
}
```

## 28.2 Execução mensal

```bash
# Roda mutation testing em módulos críticos
npx stryker run

# Output:
# Mutation score: 78.45% (high: 80, low: 60)
# Killed: 234, Survived: 64, Timeout: 12, NoCoverage: 8
```

## 28.3 Interpretação

| Score | Ação |
|-------|------|
| > 80% | Excelente — testes capturam mutações |
| 60-80% | Aceitável — investigar survivors |
| < 60% | Crítico — testes não capturam bugs reais |

## 28.4 Exemplos de mutações e testes que as capturam

```typescript
// Código original
function calculateProgress(target: number, achieved: number): number {
  if (target === 0) return 0;
  return Math.min(achieved / target * 100, 999);
}

// Mutação 1: if (target === 0) → if (target !== 0)
// Capturado por: test('returns 0 for target 0')
// Mutação 2: Math.min → Math.max
// Capturado por: test('caps at 150% when achieved > target')
// Mutação 3: achieved / target → achieved * target
// Capturado por: test('50% when half achieved')
```

---

# Capítulo 29 — Property-based Testing

## 29.1 Setup com fast-check

```typescript
// test/property/goals.property.test.ts
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { GoalService } from '@/modules/goals/goal.service';

describe('GoalService.calculateProgress (property-based)', () => {
  it('progress is always between 0 and 999', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), fc.integer({ min: 0, max: 1_000_000 }), (target, achieved) => {
        const progress = GoalService.calculateProgress(target, achieved);
        return progress >= 0 && progress <= 999;
      })
    );
  });

  it('progress is 0 when target is 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (achieved) => {
        return GoalService.calculateProgress(0, achieved) === 0;
      })
    );
  });

  it('progress is 100 when achieved equals target', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000 }), (target) => {
        return GoalService.calculateProgress(target, target) === 100;
      })
    );
  });

  it('progress is monotonic in achieved (for fixed target > 0)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000 }), fc.integer({ min: 0, max: 999_999 }), fc.integer({ min: 0, max: 999_999 }), (target, a1, a2) => {
        const p1 = GoalService.calculateProgress(target, a1);
        const p2 = GoalService.calculateProgress(target, a1 + a2);
        return p2 >= p1;
      })
    );
  });
});

describe('Ranking distribution (property-based)', () => {
  it('ranking positions are unique and sequential', () => {
    fc.assert(
      fc.property(fc.array(fc.record({ id: fc.integer(), score: fc.float({ min: 0, max: 1000 }) }), { minLength: 1, maxLength: 50 }), (users) => {
        const ranking = rankUsers(users);
        const positions = ranking.map(u => u.position);
        const uniqueSorted = [...new Set(positions)].sort((a, b) => a - b);
        expect(uniqueSorted).toEqual(Array.from({ length: uniqueSorted.length }, (_, i) => i + 1));
      })
    );
  });

  it('higher score has better (lower) position', () => {
    fc.assert(
      fc.property(fc.array(fc.record({ id: fc.integer(), score: fc.float({ min: 0, max: 1000 }) }), { minLength: 2, maxLength: 20 }), (users) => {
        const ranking = rankUsers(users);
        for (let i = 0; i < ranking.length - 1; i++) {
          if (ranking[i].score !== ranking[i + 1].score) {
            expect(ranking[i].position).toBeLessThan(ranking[i + 1].position);
            expect(ranking[i].score).toBeGreaterThan(ranking[i + 1].score);
          }
        }
      })
    );
  });
});

describe('Goal distribution (property-based)', () => {
  it('distributed values sum equals original target', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1_000_000 }),
        fc.integer({ min: 1, max: 50 }),
        (target, count) => {
          const distributed = distributeEqual(target, count);
          const sum = distributed.reduce((a, b) => a + b, 0);
          // Pode haver arredondamento; tolerância de 1 centavo por participante
          expect(Math.abs(sum - target)).toBeLessThanOrEqual(count);
        }
      )
    );
  });

  it('weighted distribution respects weights', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1_000_000 }),
        fc.array(fc.float({ min: 0.1, max: 10 }), { minLength: 2, maxLength: 10 }),
        (target, weights) => {
          const distributed = distributeWeighted(target, weights);
          const ratio0 = distributed[0] / target;
          const expectedRatio0 = weights[0] / weights.reduce((a, b) => a + b, 0);
          expect(Math.abs(ratio0 - expectedRatio0)).toBeLessThan(0.01);
        }
      )
    );
  });
});
```

## 29.2 Quando usar property-based

| Caso | Apropriado? |
|------|-------------|
| Cálculos puros (progress, ranking, distribuição) | ✅ Sim |
| Serialização/parse roundtrip | ✅ Sim |
| Invariantes de domínio (saldo nunca negativo) | ✅ Sim |
| Fluxos com side effects | ❌ Não (use mocks) |
| UI | ❌ Não (use E2E) |

---

# PARTE VIII — PROCESSO, REPORTING & CHECKLISTS

# Capítulo 30 — CI/CD Integration (detalhado)

## 30.1 Pipeline completo

```
┌─────────┐   ┌─────────┐   ┌──────────────┐   ┌──────────┐
│  Push   │ → │  Lint   │ → │  TypeCheck   │ → │  Unit    │
└─────────┘   └─────────┘   └──────────────┘   └──────────┘
                                                    │
                ┌───────────────┐   ┌──────────────┐▼
                │   Visual      │ ← │ Integration  │ ←
                └───────────────┘   └──────────────┘
                                                    │
                ┌───────────┐   ┌──────────────┐   ▼
                │ Security  │   │  E2E (shards)│ ← (paralelo)
                └───────────┘   └──────────────┘
                                                    │
                              ┌──────────────┐     ▼
                              │  Performance │ ← (comparar baseline)
                              └──────────────┘
                                                    │
                              ┌──────────────┐     ▼
                              │ Quality Gate │
                              └──────────────┘
                                                    │
                              ┌──────────────┐     ▼
                              │    Deploy    │ → staging
                              └──────────────┘
```

## 30.2 Branch protection rules

- **main:** require PR + 2 reviews + all checks green
- **develop:** require PR + 1 review + lint + unit + integration
- **release/**: require PR + 2 reviews + full pipeline + manual approval

## 30.3 Test sharding

```yaml
e2e-tests:
  strategy:
    matrix:
      shard: [1/8, 2/8, 3/8, 4/8, 5/8, 6/8, 7/8, 8/8]
  steps:
    - run: npx playwright test --shard=${{ matrix.shard }}
```

## 30.4 Cache de dependências

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/ms-playwright
      .next/cache
      node_modules
    key: ${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

## 30.5 Notificações

- **Slack `#orion-ci`:** todos os jobs failed
- **Slack `#orion-releases`:** deploy para staging/prod
- **Email:** flakiness > 5%, coverage abaixo de 70%
- **GitHub PR comment:** link para relatório Playwright, coverage diff

---

# Capítulo 31 — Test Reporting e Dashboards

## 31.1 Reporters

| Tool | Output | Destino |
|------|--------|---------|
| Vitest default | console | CI log |
| Vitest JUnit | `test-results.xml` | GitHub Actions / Jenkins |
| Vitest JSON | `test-results.json` | Dashboard interno |
| Vitest HTML | `coverage/index.html` | Artifact no CI |
| Playwright HTML | `playwright-report/` | GitHub Pages |
| Playwright JUnit | `e2e-results.xml` | CI |
| Playwright Allure | `allure-results/` | Allure server |
| k6 JSON | `k6-results.json` | Grafana |
| SonarQube | `sonar-project.properties` | SonarCloud |

## 31.2 Dashboard interno

Disponível em `https://staging.orion.com/quality-dashboard`:
- Cobertura por módulo (linha do tempo)
- Tendência de bugs P0/P1/P2
- Tempo de ciclo (PR → merge → prod)
- Build success rate (7/30 dias)
- Deploy frequency
- Test flakiness rate
- Mutação score por módulo
- Performance p95 por endpoint

## 31.3 Allure report

```yaml
- name: Publish Allure report
  uses: simple-elf/allure-report-action@v1.9
  with:
    allure_results: allure-results
    allure_history: allure-history
    keep_reports: 20
```

## 31.4 SonarQube integration

```bash
sonar-scanner \
  -Dsonar.projectKey=orion \
  -Dsonar.sources=src \
  -Dsonar.tests=test,e2e \
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
  -Dsonar.coverage.exclusions=**/*.stories.tsx,**/index.ts \
  -Dsonar.qualitygate.wait=true
```

---

# Capítulo 32 — Métricas de Qualidade (KPIs)

| Métrica | Meta | Alerta |
|---------|------|--------|
| Cobertura de testes (linhas) | ≥ 80% | < 70% |
| Cobertura em módulos críticos | ≥ 90% | < 85% |
| Bugs P0 em produção | 0 por release | > 0 |
| Bugs P1 em produção | < 3 por release | ≥ 5 |
| Defect escape rate | < 5% | ≥ 10% |
| Lead time (PR → produção) | < 3 dias | > 5 dias |
| MTTR (mean time to recover) | < 1h | > 4h |
| Test flakiness | < 2% | ≥ 5% |
| Build success rate | > 95% | < 90% |
| Deploy frequency | ≥ 1/dia | < 3/semana |
| E2E duration | < 15min | > 25min |
| Mutation score (críticos) | > 80% | < 60% |
| Performance p95 dashboard | < 500ms | > 1s |

## 32.1 Defect escape rate

```
DER = (bugs encontrados em produção / total de bugs encontrados) × 100
```

Meta: < 5%. Acima de 10% gera post-mortem obrigatório.

## 32.2 Test flakiness

```
Flakiness = (testes com resultado não-determinístico em últimas 100 runs / total de testes) × 100
```

Identificação: teste que passou E falhou nas últimas 100 runs do mesmo commit.

---

# Capítulo 33 — Bug Triage e SLAs

## 33.1 Severidade

| Nível | Definição | Exemplo | SLA Resposta | SLA Resolução |
|-------|-----------|---------|--------------|---------------|
| P0 - Blocker | Sistema indisponível, dados corrompidos | Login quebrado, DB down | 15min | 1h |
| P1 - Critical | Funcionalidade核心 não funciona | Lançamento de resultado erro 500 | 1h | 4h |
| P2 - Major | Funcionalidade importante com workaround | Ranking não atualiza | 4h | 1 dia |
| P3 - Minor | Bug pequeno, não bloqueia uso | Tooltip desalinhado | 1 dia | 1 semana |
| P4 - Cosmetic | Problema visual | Cor de botão levemente diferente | 1 semana | Próxima release |

## 33.2 Processo de triage

1. Bug reportado via Linear / GitHub Issue com template (passos, esperado, atual, screenshots)
2. QA atribui severidade inicial
3. Daily triage (15min) revisa novos bugs
4. P0/P1 imediatamente ao time de plantão
5. P2/P3 entram no backlog priorizado
6. P4 agrupados para próxima release

## 33.3 Post-mortem (P0/P1)

Template:
- **Resumo:** o que aconteceu
- **Impacto:** usuários afetados, tempo de indisponibilidade
- **Causa raiz:** análise 5 porquês
- **Linha do tempo:** detecção → mitigação → resolução
- **O que funcionou:** monitoramento, alertas, rollback
- **O que falhou:** testes não capturaram, alerta demorou
- **Ações:** melhorias em testes, monitoramento, processo
- **Owner + prazo** para cada ação

---

# Capítulo 34 — Definition of Done (DoD) e Definition of Ready (DoR)

## 34.1 Definition of Done (DoD)

Uma feature só está "Done" quando:

- [ ] Código revisado por 2 pessoas (1 senior preferencialmente)
- [ ] Testes unitários escritos e passando (>70% cobertura do novo código)
- [ ] Testes de integração passando para novos endpoints
- [ ] Teste E2E para fluxo crítico passando
- [ ] Lint sem warnings
- [ ] Type-check sem erros (`tsc --noEmit`)
- [ ] Documentação atualizada (JSDoc, README se aplicável)
- [ ] Performance validada (não degradou > 10% p95)
- [ ] Acessibilidade validada (axe-core sem violações)
- [ ] Security scan sem critical nem high
- [ ] Logs e métricas adicionados (se aplicável)
- [ ] Migration aplicada em staging sem erro
- [ ] Deploy em staging validado pelo QA
- [ ] Critérios de aceite da task verificados

## 34.2 Definition of Ready (DoR)

Uma task está pronta para desenvolvimento quando:

- [ ] Critérios de aceite escritos e validados com PO
- [ ] Wireframe/design pronto (se UI)
- [ ] Casos de teste (CT-UCXXX-NN) mapeados
- [ ] Dependências resolvidas (APIs, designs, decisões)
- [ ] Estimada pelo time (planning poker)
- [ ] Sem bloqueios identificados
- [ ] Acceptance tests (Gherkin) escritos se fluxo crítico

---

# Capítulo 35 — Pre-merge Checklist

Antes de marcar PR como "ready for review":

- [ ] Branch atualizada com `develop` (rebase sem conflito)
- [ ] `npm run lint` sem erros
- [ ] `npm run typecheck` sem erros
- [ ] `npm run test:unit` passando localmente
- [ ] `npm run test:integration` passando (se toca DB)
- [ ] `npm run test:e2e -- --grep <feature>` passando (se fluxo crítico)
- [ ] Novos testes adicionados para novo código
- [ ] Cobertura do novo código > 70%
- [ ] Sem `console.log` esquecidos
- [ ] Sem `TODO`/`FIXME` sem issue vinculada
- [ ] Mensagens de commit seguem conventional commits
- [ ] PR description preenchida com: o que, por que, como testar
- [ ] Screenshots/recordings anexados (se mudança visual)
- [ ] Breaking changes documentados
- [ ] Migration testada em staging
- [ ] Performance impact analisado (se endpoint crítico)

---

# Capítulo 36 — Pre-release Checklist

Antes de promover release para produção:

### Código & Testes
- [ ] Todos os PRs da release merged em `main`
- [ ] Pipeline green nos últimos 3 commits de `main`
- [ ] Cobertura geral ≥ 80%
- [ ] Mutação score em módulos críticos ≥ 80%
- [ ] Sem testes flaky nas últimas 100 runs
- [ ] Performance baseline sem regressão > 10%

### QA Manual
- [ ] Smoke test completo em staging executado
- [ ] Exploratory testing executado nas áreas de mudança
- [ ] Testes de regressão nos 10 fluxos mais críticos
- [ ] Cross-browser test em Chrome/Safari/Firefox
- [ ] Mobile test em iOS Safari e Android Chrome
- [ ] Acessibilidade validada (axe + manual)

### Segurança
- [ ] OWASP ZAP scan sem critical/high
- [ ] SAST sem findings novos
- [ ] Pentest (se release major) concluído sem P0
- [ ] Secrets rotation (se aplicável)

### Banco & Infra
- [ ] Migrations aplicadas em staging sem erro
- [ ] Backup automático executado com sucesso
- [ ] Rollback plan documentado e testado
- [ ] Feature flags configuradas (se release incremental)

### Documentação
- [ ] Changelog atualizado
- [ ] Release notes escritas (incluindo breaking changes)
- [ ] Documentação de API atualizada (OpenAPI)
- [ ] Manual do usuário atualizado (se UI mudou)
- [ ] Runbook de incidentes atualizado

### Comunicação
- [ ] Aviso de manutenção enviado (se downtime necessário)
- [ ] Time de suporte treinado nas novidades
- [ ] Clientes enterprise notificados (se breaking)
- [ ] Rollout plan (canary → 25% → 50% → 100%)

---

# Capítulo 37 — Regression Testing Checklist

Executado a cada release (semanal ou quinzenal):

### Fluxos Críticos (P0)
- [ ] UC-055 Login/logout (todos os papéis)
- [ ] UC-047 Lançamento de resultado diário
- [ ] UC-029 Criação de meta para equipe
- [ ] UC-023 Dashboard executivo
- [ ] UC-025 Ranking geral
- [ ] UC-058 LGPD exportação de dados
- [ ] UC-059 LGPD anonimização

### Fluxos Importantes (P1)
- [ ] UC-002 Wizard de instalação
- [ ] UC-011 Cadastro de empresa
- [ ] UC-015 Cadastro de usuários
- [ ] UC-034 Aprovação de resultados
- [ ] UC-038 IA insights gerenciais
- [ ] UC-040 Lançamento em lote (CSV)
- [ ] UC-005 Backup/restore

### Multi-tenant
- [ ] Isolamento entre 3 tenants distintos
- [ ] RLS ativo em todas as tabelas críticas
- [ ] Cross-tenant via API retorna 404

### Integrações
- [ ] ERP sync executa sem erro
- [ ] Webhook ERP recebe e processa
- [ ] WhatsApp envia notificação de teste
- [ ] Email entrega em MailHog

### Performance
- [ ] Dashboard p95 < 500ms (k6 smoke)
- [ ] Result entry p95 < 400ms (k6 smoke)
- [ ] AI insights p95 < 5s

### Acessibilidade
- [ ] axe-core sem violações em 8 páginas críticas
- [ ] Navegação por teclado em login e dashboard

### Security
- [ ] SQL injection payloads rejeitados (10 payloads)
- [ ] XSS payloads sanitizados (7 payloads)
- [ ] CSRF token enforced
- [ ] Brute force protection ativa

---

# Capítulo 38 — Test Flakiness Management

## 38.1 Identificação

Um teste é marcado como flaky quando:
- Passou E falhou no mesmo commit nas últimas 100 runs do CI
- Tem `retry` habilitado no Playwright e passa na 2ª tentativa com frequência > 5%

## 38.2 Processo

1. **Detectar:** script diário lista testes flaky
2. **Marcar:** adicionar `@flaky` no título + abrir issue
3. **Investigar em 24h:** root cause (timing, ordem, dados compartilhados, rede, fake timers)
4. **Corrigir ou remover:** nunca deixar flaky no CI sem issue
5. **Quarentena:** mover para `test/quarantine/` se não resolvido em 3 dias
6. **Revisar semanalmente:** lista de quarentena é revisada

## 38.3 Padrões anti-flakiness

```typescript
// ❌ Ruim: depende de timing
await page.waitForTimeout(1000);
await expect(page.locator('h1')).toHaveText('Dashboard');

// ✅ Bom: espera por condição
await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 5000 });

// ❌ Ruim: depende de ordem
let createdId: number;
test('create', async () => { createdId = await create(); });
test('update', async () => { await update(createdId); });

// ✅ Bom: cada teste é independente
test('update', async () => {
  const id = await create(); // próprio setup
  await update(id);
});

// ❌ Ruim: data atual
test('filter today', async () => {
  await filter({ date: new Date() }); // muda à meia-noite
});

// ✅ Bom: data fixa via fake timers
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-08-15T12:00:00Z'));

// ❌ Ruim: race condition em async
await Promise.all([save(), refresh()]);
await expect(row).toBeVisible();

// ✅ Bom: espera explícita
await save();
await page.waitForResponse(r => r.url().includes('/save') && r.ok());
await expect(row).toBeVisible();
```

---

# Capítulo 39 — Apêndices

## Apêndice A — Estrutura de diretórios de teste

```
orion/
├── src/
│   └── modules/
│       └── goals/
│           ├── goal.service.ts
│           └── goal.service.test.ts          # unit, junto ao código
├── test/
│   ├── setup.ts                              # setup global vitest
│   ├── setup-db.ts                           # setup banco integração
│   ├── matchers.ts                           # custom matchers
│   ├── fixtures/                             # dados estáticos
│   ├── factories/                            # factory de dados
│   ├── builders/                             # builders complexos
│   ├── helpers/                              # auth, transaction, mail
│   ├── mocks/                                # mocks LLM, Redis, ERP
│   │   └── erp/mappings/                     # wiremock mappings
│   ├── integration/                          # testes de integração
│   ├── security/                             # testes de segurança
│   ├── property/                             # property-based
│   ├── migrations/                           # testes de migration
│   ├── ai/                                   # testes de IA + evals
│   │   └── snapshots/                        # prompts snapshot
│   └── contract/                             # pact contracts
├── e2e/
│   ├── pages/                                # page objects
│   ├── helpers/                              # auth, fixtures
│   ├── auth/                                 # specs de auth
│   ├── results/                              # specs de resultados
│   ├── goals/                                # specs de metas
│   ├── security/                             # specs de segurança E2E
│   ├── pwa/                                  # specs de PWA/offline
│   ├── a11y/                                 # specs de acessibilidade
│   ├── visual/                               # specs de visual regression
│   └── cross-browser/                        # specs cross-browser
├── tests/
│   └── perf/                                 # scripts k6
│       ├── dashboard.js
│       ├── result-entry.js
│       ├── ai-chat.js
│       └── baseline.json
└── .github/
    └── workflows/
        └── test.yml
```

## Apêndice B — Comandos NPM

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:visual": "playwright test --project=visual",
    "test:a11y": "playwright test --project=accessibility",
    "test:perf": "k6 run tests/perf/dashboard.js",
    "test:mutation": "stryker run",
    "test:contract": "vitest run --config vitest.contract.config.ts",
    "test:flaky": "node scripts/detect-flaky.js",
    "coverage": "vitest run --coverage",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "format:check": "prettier --check .",
    "format:write": "prettier --write .",
    "db:reset:test": "docker compose -f docker-compose.test.yml down -v && docker compose -f docker-compose.test.yml up -d && sleep 5 && npx prisma migrate deploy && npm run db:seed:test",
    "db:seed:test": "prisma db seed --env DATABASE_URL=$TEST_DATABASE_URL",
    "db:seed:e2e": "tsx scripts/seed-e2e.ts"
  }
}
```

## Apêndice C — Templates

### C.1 Bug Report Template

```markdown
## Bug: [título curto]

**Severidade:** P0 / P1 / P2 / P3 / P4
**Ambiente:** dev / staging / prod
**URL:** https://...
**Usuário:** email@empresa.com (papel: GERENTE)
**Data/Hora:** 2025-08-15 14:32 BRT

### Passos para reproduzir
1. ...
2. ...
3. ...

### Comportamento esperado
...

### Comportamento atual
...

### Evidências
- Screenshot: [anexo]
- Video: [anexo]
- Console errors: [logs]
- Network: [har file]

### Frequência
- [ ] Sempre (100%)
- [ ] Frequente (>50%)
- [ ] Intermitente (<50%)

### Workaround
[se houver]
```

### C.2 Test Case Template (Gherkin)

```gherkin
Feature: Lançamento de resultado diário (UC-047)

  Scenario: CT-UC047-01 Vendedor lança resultado válido
    Given que estou logado como VENDEDOR
    And existe uma meta mensal ativa para "faturamento"
    When acesso a página de lançamento
    And preencho "faturamento" com "1250.50"
    And clico em "Salvar"
    Then vejo a mensagem "Resultado salvo"
    And o progresso da meta é recalculado para 42%
    And o resultado fica com status "approved"
```

### C.3 PR Template

```markdown
## Descrição
[O quê e por quê]

## Tipo de mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Refactor
- [ ] Doc

## Checklist
- [ ] Lint passa
- [ ] Typecheck passa
- [ ] Testes unitários passando
- [ ] Testes de integração passando (se aplicável)
- [ ] E2E críticos passando (se fluxo crítico)
- [ ] Cobertura > 70% no novo código
- [ ] axe-core sem violações (se UI)
- [ ] Sem console.log
- [ ] PR description completa

## Breaking changes
[lista ou "Nenhuma"]

## Como testar
1. ...
2. ...

## Screenshots / Recordings
[anexos se UI]
```

## Apêndice D — Glossário

| Termo | Definição |
|-------|-----------|
| AAA | Arrange-Act-Assert, padrão de estruturação de teste |
| A11y | Accessibility (11 letras entre A e y) |
| DAST | Dynamic Application Security Testing |
| DoD | Definition of Done |
| DoR | Definition of Ready |
| E2E | End-to-End testing |
| Flaky test | Teste não-determinístico |
| IaC | Infrastructure as Code |
| KPI | Key Performance Indicator |
| LLM | Large Language Model |
| MTTR | Mean Time To Recover |
| Mutation testing | Teste que altera código para validar cobertura real |
| Pact | Contract testing framework |
| Page Object | Pattern de encapsulamento de página em E2E |
| PBT | Property-based testing |
| RLS | Row-Level Security (PostgreSQL) |
| SAST | Static Application Security Testing |
| SLA | Service Level Agreement |
| Smoke test | Teste rápido que valida fluxos críticos |
| TDD | Test-Driven Development |
| Test fixture | Dados estáticos para teste |
| Test double | Objeto que substitui dependência (mock, stub, spy, fake) |
| Wiremock | Servidor mock HTTP |
| WCAG | Web Content Accessibility Guidelines |

## Apêndice E — Referências

- **Vitest:** https://vitest.dev
- **Playwright:** https://playwright.dev
- **k6:** https://k6.io
- **axe-core:** https://github.com/dequelabs/axe-core
- **Stryker:** https://stryker-mutator.io
- **fast-check:** https://fast-check.dev
- **Pact:** https://pact.io
- **Wiremock:** https://wiremock.org
- **OWASP Testing Guide:** https://owasp.org/www-project-web-security-testing-guide
- **WCAG 2.1:** https://www.w3.org/TR/WCAG21
- **Jest mock extended:** https://github.com/marchaos/jest-mock-extended
- **Testcontainers:** https://www.testcontainers.org
- **MailHog:** https://github.com/mailhog/MailHog
- **MinIO:** https://min.io
- **Allure Report:** https://allurereport.org
- **SonarQube:** https://www.sonarsource.com

---

## Histórico de versões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|-----------|
| 1.0 | 2025-01-15 | Eng. de QA | Versão inicial (17KB) |
| 2.0 | 2025-08-15 | Eng. de QA | Expansão completa: 59 UCs com 3+ cenários cada, mocks/factories detalhados, testes de segurança (SQLi/XSS/CSRF/multi-tenant), performance k6 completa, a11y axe-core, cross-browser, PWA/offline, IA (LLM mock), migrações de banco, ERP/CRM com Pact, visual regression, mutation testing, property-based, page objects, CI/CD detalhado, checklists pré-merge/pré-release/regressão |

---

**Fim do Documento 14 — Testing & QA Plan**
