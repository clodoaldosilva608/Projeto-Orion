# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 17

# MASTER PROMPT PARA IAs DE DESENVOLVIMENTO

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Master Prompt para Cursor / Claude Code / Windsurf / Lovable / Copilot

---

# Capítulo 1 — Objetivo

Este documento é o **Master Prompt** consolidado para alimentar IAs de desenvolvimento de código (Cursor, Claude Code, Windsurf, Lovable, Copilot Workspace, Aider, Continue.dev). Contém o contexto completo do projeto, padrões obrigatórios, restrições críticas, instruções específicas para cada tipo de tarefa, anti-patterns, gerenciamento de context window, padrões de chain of thought, few-shot examples, templates por ferramenta, estratégias de validação, prompts de self-review, geração de testes, documentação automática e code review assistido por IA.

**Como usar:** Cole o conteúdo dos Capítulos 2 a 8 no contexto da IA de desenvolvimento. Para tarefas específicas, use os prompts do Capítulo 9 em diante.

**Princípio fundamental:** A IA é um **assistente**, não um substituto do desenvolvedor. Todo código gerado deve ser revisado por humano antes do merge. A IA acelera a implementação, mas a responsabilidade técnica continua sendo do dev.

---

# Capítulo 2 — Contexto do Projeto

```
PROJETO: Orion
TIPO: Plataforma de Gestão Inteligente de Equipes Comerciais
MODELO: Software licenciado, instalável (NÃO é SaaS multi-tenant público; 
        é multi-tenant dentro de uma instalação on-premise OU cloud dedicado)
STACK: Next.js 14+ (App Router), TypeScript strict, Tailwind CSS, 
       Shadcn/UI, Prisma ORM, PostgreSQL (cloud) / SQLite (local), 
       Redis, Electron para desktop, PWA
ARQUITETURA: Clean Architecture + DDD + Modular
              Frontend e Backend no mesmo repositório Next.js
              API Routes do Next.js como controllers

VERSÃO ATUAL: v1.0 (em desenvolvimento)

PRINCÍPIOS OBRIGATÓRIOS:
1. TUDO deve ser configurável pelo admin — nada hardcoded por segmento
2. Multi-tenant: TODO query deve ter company_id do JWT
3. RBAC: TODO endpoint protegido por middleware de permissão
4. Auditoria: TODA alteração em dados sensíveis gera log
5. Soft delete: NUNCA DELETE físico, sempre SET deleted_at
6. Offline-first: PWA deve funcionar sem conexão
7. Performance: p95 < 500ms para endpoints síncronos
8. Segurança: validação Zod em toda entrada, queries parametrizadas
```

---

# Capítulo 3 — Estrutura de Pastas Obrigatória

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Layout de autenticação
│   ├── (dashboard)/              # Layout autenticado
│   │   ├── dashboard/page.tsx
│   │   ├── metas/page.tsx
│   │   ├── resultados/page.tsx
│   │   ├── ranking/page.tsx
│   │   └── campanhas/page.tsx
│   ├── admin/                    # Painel admin (rota separada)
│   ├── api/v1/                   # API Routes versionadas
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── users/route.ts
│   │   ├── goals/route.ts
│   │   └── ...
│   └── layout.tsx
├── modules/                      # Módulos de domínio (UMA responsabilidade cada)
│   ├── auth/
│   ├── companies/
│   ├── branches/
│   ├── users/
│   ├── indicators/
│   ├── goals/
│   ├── results/
│   ├── campaigns/
│   ├── rankings/
│   ├── dashboard/
│   ├── notifications/
│   ├── audit/
│   ├── ai/
│   ├── license/
│   ├── backup/
│   └── updates/
├── shared/                       # Código compartilhado entre módulos
│   ├── components/              # Componentes UI reutilizáveis
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── errors/
├── lib/                          # Setup de libs externas
│   ├── prisma.ts                # Client Prisma
│   ├── redis.ts                 # Client Redis
│   ├── auth.ts                  # Config NextAuth
│   ├── ai.ts                    # Client OpenAI/Anthropic
│   └── logger.ts                # Pino logger
└── tests/
```

**Cada módulo tem a estrutura interna:**
```
modules/goals/
├── components/     # UI React
├── hooks/          # Hooks customizados
├── services/       # Lógica de domínio
├── repositories/   # Acesso a dados via Prisma
├── dto/            # Schemas Zod de input/output
├── types/          # Tipos TypeScript do módulo
├── utils/          # Utilidades específicas
└── tests/          # Testes do módulo
```

---

# Capítulo 4 — Padrões de Código OBRIGATÓRIOS

## 4.1 TypeScript

```typescript
// SEMPRE strict mode, sem 'any', sempre tipar retornos públicos

// PREFIRA union types ao invés de enum:
type GoalType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// USE 'interface' para objetos, 'type' para unions e mapped types
interface CreateGoalInput { ... }
type GoalStatus = 'active' | 'completed' | 'cancelled';

// USE 'as const' para constantes literais
const MODULES = ['auth', 'users', 'goals'] as const;
type Module = typeof MODULES[number];
```

## 4.2 Componente React Padrão

```tsx
'use client'; // APENAS se necessário (interação, hooks, browser API)

import { cn } from '@/shared/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonStyles = cva('inline-flex items-center justify-center rounded-md font-medium transition-colors', {
  variants: {
    variant: {
      primary: 'bg-blue-900 text-white hover:bg-blue-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  loading?: boolean;
}

export function Button({ className, variant, size, loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

## 4.3 API Route Padrão

```typescript
// app/api/v1/goals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/shared/auth/permissions';
import { GoalService } from '@/modules/goals/services/GoalService';
import { createGoalSchema } from '@/modules/goals/dto/CreateGoalDTO';
import { DomainError } from '@/shared/errors/DomainError';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // 1. Autentica
    const user = await requireAuth(req);
    
    // 2. Autoriza
    requirePermission(user, 'goals.create');
    
    // 3. Valida input
    const body = await req.json();
    const input = createGoalSchema.parse(body);
    
    // 4. Executa
    const goal = await GoalService.create({
      ...input,
      companyId: user.companyId, // SEMPRE do JWT, nunca do body
      createdBy: user.id,
    });
    
    // 5. Log
    logger.info('Goal created', { goalId: goal.id, userId: user.id });
    
    // 6. Retorna
    return NextResponse.json(goal, { status: 201 });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode }
      );
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: err.issues } },
        { status: 422 }
      );
    }
    logger.error('Unexpected error creating goal', { error: err });
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requirePermission(user, 'goals.read');
    
    const { searchParams } = new URL(req.url);
    const filters = {
      companyId: user.companyId, // SEMPRE isolar por tenant
      userId: searchParams.get('userId') ? Number(searchParams.get('userId')) : undefined,
      indicatorId: searchParams.get('indicatorId') ? Number(searchParams.get('indicatorId')) : undefined,
      page: Number(searchParams.get('page') || 1),
      limit: Math.min(Number(searchParams.get('limit') || 20), 100),
    };
    
    const result = await GoalService.list(filters);
    return NextResponse.json(result);
  } catch (err) {
    // ...
  }
}
```

## 4.4 Service Padrão

```typescript
// modules/goals/services/GoalService.ts
import { prisma } from '@/lib/prisma';
import { audit } from '@/modules/audit/services/AuditService';
import { DomainError } from '@/shared/errors/DomainError';
import type { CreateGoalInput } from '../dto/CreateGoalDTO';
import type { Goal } from '../types';

export class GoalService {
  static async create(input: CreateGoalInput): Promise<Goal> {
    // 1. Validações de domínio
    const indicator = await prisma.indicator.findFirst({
      where: { id: input.indicatorId, companyId: input.companyId, active: true },
    });
    if (!indicator) throw new DomainError('INDICATOR_NOT_FOUND', 'Indicador não encontrado', 404);
    
    // 2. Verifica licença
    const license = await prisma.license.findFirst({
      where: { companyId: input.companyId, status: 'active' },
    });
    if (!license) throw new DomainError('LICENSE_INVALID', 'Licença inválida', 403);
    
    // 3. Cria
    const goal = await prisma.goal.create({
      data: {
        ...input,
        uuid: crypto.randomUUID(),
        version: 1,
      },
    });
    
    // 4. Auditoria
    await audit.record({
      userId: input.createdBy,
      companyId: input.companyId,
      action: 'create',
      tableName: 'goals',
      recordId: goal.id,
      newValue: goal,
    });
    
    // 5. Evento
    await eventBus.emit('goal.created', { goalId: goal.id, companyId: input.companyId });
    
    return goal;
  }
}
```

## 4.5 Validação Zod

```typescript
// modules/goals/dto/CreateGoalDTO.ts
import { z } from 'zod';

export const createGoalSchema = z.object({
  userId: z.number().int().positive(),
  indicatorId: z.number().int().positive(),
  goalType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  targetValue: z.number().positive('Valor deve ser positivo'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  weight: z.number().min(0).max(10).default(1.0),
  notes: z.string().max(1000).optional(),
}).refine(
  data => data.endDate > data.startDate,
  { message: 'Data final deve ser maior que data inicial', path: ['endDate'] }
);

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
```

---

# Capítulo 5 — Padrões de Banco

## 5.1 Schema Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = ["postgresql", "sqlite"]
  url      = env("DATABASE_URL")
}

model Goal {
  id          BigInt   @id @default(autoincrement())
  uuid        String   @unique @default(uuid())
  companyId   BigInt
  branchId    BigInt?
  userId      BigInt
  indicatorId BigInt
  goalType    String
  startDate   DateTime
  endDate     DateTime
  targetValue Decimal @db.Decimal(18, 4)
  weight      Float   @default(1.0)
  notes       String? @db.Text
  active      Boolean @default(true)
  version     Int     @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  createdBy   BigInt
  updatedBy   BigInt?
  
  company   Company   @relation(fields: [companyId], references: [id])
  branch    Branch?   @relation(fields: [branchId], references: [id])
  user      User      @relation(fields: [userId], references: [id])
  indicator Indicator @relation(fields: [indicatorId], references: [id])
  
  @@index([companyId, userId, indicatorId])
  @@index([companyId, startDate])
  @@map("goals")
}
```

## 5.2 Regras de Banco
- TODA tabela tem: `id`, `uuid`, `companyId`, `createdAt`, `updatedAt`, `deletedAt`, `active`, `version`
- `companyId` em TODA tabela (multi-tenant)
- Soft delete: query sempre filtra `WHERE deleted_at IS NULL`
- Índice composto em consultas frequentes
- `Decimal` para valores monetários (nunca `Float`)
- `BigInt` para IDs (escala)

---

# Capítulo 6 — Regras Críticas (NUNCA Violar)

```
🚫 PROIBIDO:
- DELETE físico (sempre UPDATE deleted_at = NOW())
- Query sem company_id (vaza dados entre tenants)
- Endpoint sem middleware de auth
- Input sem validação Zod
- Senha em texto, log, ou mensagem de erro
- Token JWT exposto no localStorage (use httpOnly cookie)
- Any em TypeScript (use unknown + type guard)
- Component sem 'use client' quando precisa de interação
- Tailwind classes inline duplicadas (extraia para componente)
- Console.log em produção (use logger)
- Hardcoded values por segmento (use configuração)
- Timezone hardcoded (sempre do user/company)
- Date sem timezone (use UTC no banco, converte na UI)

✅ OBRIGATÓRIO:
- Toda função pública tipada
- Todo endpoint com try/catch
- Toda mutation com auditoria
- Todo erro com code + message + statusCode
- Toda query com filtro de tenant
- Todo teste unitário para service
- Todo PR com 2 approvals
- Toda feature com documentação
- Commit conventional (feat/fix/docs/etc.)
```

---

# Capítulo 7 — Componentes UI Padrão

Use shadcn/ui como base. Componentes customizados seguem:

```tsx
// Sempre com cva para variantes
// Sempre com forwardRef quando apropriado
// Sempre com data-testid para E2E
// Sempre acessível (aria-* quando necessário)

<Card data-testid="goal-card">
  <CardHeader>
    <CardTitle>Meta de Faturamento</CardTitle>
  </CardHeader>
  <CardContent>
    <Progress value={75} data-testid="goal-progress" />
    <p className="text-sm text-muted-foreground">
      75% atingido
    </p>
  </CardContent>
</Card>
```

---

# Capítulo 8 — Testes Obrigatórios

```typescript
// TODO service tem teste unitário
// TODO endpoint tem teste de integração
// TODO fluxo crítico tem teste E2E

// Cobertura mínima:
// - Core: 90%
// - Auth: 95%
// - Licenciamento: 95%
// - Demais: 70%
```

---

# Capítulo 9 — Prompts Específicos por Tarefa (20+ Tarefas)

## 9.1 Criar CRUD Completo (Módulo Novo)

```
TASK: Criar módulo "campaigns" (campanhas comerciais)

CONTEXTO: Siga os padrões do projeto Orion (estrutura de pastas, 
Clean Architecture, RBAC, multi-tenant, auditoria).

ENTIDADE: Campaign
- name (string, obrigatório, 1-255)
- description (text, opcional)
- objective (text, opcional)
- startDate (date, obrigatório)
- endDate (date, obrigatório, > startDate)
- rules (JSON)
- status (enum: draft, active, paused, ended, cancelled)
- companyId (do JWT, NUNCA do body)
- participantIds (array de userId)

ENDPOINTS:
- POST /api/v1/campaigns (criar) — perm: campaigns.create
- GET /api/v1/campaigns (listar com paginação) — perm: campaigns.read
- GET /api/v1/campaigns/:id (detalhar) — perm: campaigns.read
- PUT /api/v1/campaigns/:id (atualizar) — perm: campaigns.update
- DELETE /api/v1/campaigns/:id (soft delete) — perm: campaigns.delete
- POST /api/v1/campaigns/:id/participants (adicionar participantes) — perm: campaigns.update

REGRAS:
- Validação Zod em todo input
- Auditoria em toda mutation
- Evento emitido (campaign.created, campaign.ended)
- Não permitir campanha com endDate < startDate
- Não permitir participant de outra empresa
- Status "ended" automático quando endDate passar

GERAR:
1. prisma/schema.prisma — model Campaign e CampaignParticipant
2. modules/campaigns/dto/CreateCampaignDTO.ts
3. modules/campaigns/types/index.ts
4. modules/campaigns/services/CampaignService.ts
5. modules/campaigns/repositories/CampaignRepository.ts
6. app/api/v1/campaigns/route.ts (POST, GET list)
7. app/api/v1/campaigns/[id]/route.ts (GET, PUT, DELETE)
8. app/api/v1/campaigns/[id]/participants/route.ts (POST)
9. modules/campaigns/tests/CampaignService.test.ts
10. tests/integration/campaigns.test.ts
11. app/(dashboard)/campanhas/page.tsx (listagem)
12. app/(dashboard)/campanhas/nova/page.tsx (form criação)
13. modules/campaigns/components/CampaignForm.tsx
14. modules/campaigns/components/CampaignList.tsx
15. modules/campaigns/hooks/useCampaigns.ts

Padrões: TypeScript strict, Tailwind, shadcn/ui, Zod, NextAuth, 
Prisma, audit log, multi-tenant, soft delete.
```

## 9.2 Criar Feature de IA

```
TASK: Adicionar funcionalidade de IA que sugere metas baseadas no histórico

CONTEXTO: Use o módulo IA existente (modules/ai/). Integra com OpenAI GPT-4o-mini.

FLUXO:
1. Gerente acessa "Sugerir Metas" em /metas
2. Sistema coleta histórico de resultados dos últimos 6 meses
3. Envia para IA com prompt: "Baseado nestes resultados históricos, 
   sugira metas realistas para o próximo mês para cada vendedor"
4. IA retorna array de sugestões
5. Gerente revisa, ajusta e aprova
6. Sistema cria metas em lote

ENDPOINT: POST /api/v1/ai/suggest-goals

PROTEÇÕES:
- Limite de 5 chamadas/dia/empresa
- Custo máximo $0.05 por chamada
- Cache de 1h para mesma entrada
- Dados pessoais (CPF, email) NUNCA enviados à IA
- Logs em ai_messages com tokens, custo, feedback

GERAR:
1. modules/ai/services/GoalSuggestionService.ts
2. modules/ai/prompts/suggestGoals.ts (template do prompt)
3. app/api/v1/ai/suggest-goals/route.ts
4. modules/ai/hooks/useSuggestedGoals.ts
5. modules/goals/components/SuggestedGoalsDialog.tsx
6. Testes unitários do service
7. Teste E2E do fluxo completo
```

## 9.3 Refatorar Código Existente

```
TASK: Refatorar modules/users/services/UserService.ts

OBJETIVOS:
1. Reduzir complexidade ciclomática (atualmente 15, alvo < 8)
2. Extrair validações para classe separada
3. Melhorar tipagem (eliminate any)
4. Adicionar testes para branches não cobertas
5. Manter 100% backward compatibility da API pública

REGRAS:
- NUNCA quebrar interface pública
- Toda mudança deve ter teste passando antes e depois
- Commit por etapa (não um PR gigante)
- Documentar mudanças em ADR se arquitetura mudar

PROCESSO:
1. Identifique funções com complexidade > 8
2. Para cada uma, escreva teste que cobre 100% atual
3. Refatore mantendo testes passando
4. Verifique cobertura não diminuiu
5. Rode performance benchmark antes/depois

OUTPUT: Arquivo refatorado + relatório de complexidade antes/depois
```

## 9.4 Debugar Problema

```
TASK: Debugar erro "LICENSE_INVALID" aparecendo randomicamente

CONTEXTO: 
- Sistema em produção
- 3% dos requests falham com LICENSE_INVALID
- Acontece principalmente entre 14h-16h (horário de pico)
- Licenças estão válidas no banco

PASSOS:
1. Verifique logs em Sentry/Datadog filtrando por LICENSE_INVALID
2. Verifique se há race condition na validação de licença
3. Verifique se cache de licença está sendo invalidado prematuramente
4. Verifique connection pool do banco (timeout?)
5. Adicione logging detalhado temporário em LicenseValidator
6. Reproduza localmente com mesmo volume
7. Identifique root cause
8. Proponha fix com teste que reproduz o bug
9. Documente em post-mortem

OUTPUT: 
- Root cause analysis document
- Fix com teste
- PR com revisão de 2 devs
```

## 9.5 Otimizar Performance

```
TASK: Otimizar endpoint GET /api/v1/goals que está lento (p95 = 2.1s, alvo < 500ms)

CONTEXTO:
- Tabela goals tem 500k registros
- Query faz JOIN com users, indicators, branches
- Retorna 20 itens por página
- Sem cache atualmente

ANÁLISE ESPERADA:
1. Rode EXPLAIN ANALYZE na query
2. Identifique Seq Scans que deveriam ser Index Scans
3. Identifique N+1 queries
4. Avalie necessidade de índices compostos
5. Considere cache Redis (TTL 60s)
6. Considere materialized view se for agregação
7. Considere paginação cursor-based se offset > 10000

OUTPUT:
1. Relatório com análise do problema
2. Migration Prisma com novos índices
3. Código otimizado (com cache + query ajustada)
4. Benchmarks antes/depois (k6 ou similar)
5. Plano de monitoramento contínuo
```

## 9.6 Escrever Testes

```
TASK: Escrever testes para modules/goals/services/GoalCalculator.ts

CONTEXTO:
- Arquivo tem 5 funções públicas: calculateProgress, calculateProjection, 
  distributeEqually, distributeWeighted, calculateAchievement
- Cobertura atual: 30%
- Meta: 90%

ESTRATÉGIA:
1. Para cada função, escreva testes para:
   - Happy path (3+ cenários)
   - Edge cases (null, undefined, empty, zero, negative, MAX_SAFE_INTEGER)
   - Error cases (throw DomainError)
2. Use table-driven tests para casos similares
3. Use property-based testing para invariantes matemáticos
4. Mock apenas dependências externas (Prisma, Redis), não lógica interna

PADRÃO AAA:
describe('calculateProgress', () => {
  it('returns 0 when achieved is 0', () => {
    // Arrange
    const input = { achieved: 0, target: 100 };
    // Act
    const result = calculateProgress(input);
    // Assert
    expect(result).toBe(0);
  });
});

OUTPUT: Arquivo de testes + relatório de cobertura antes/depois
```

## 9.7 Documentar Código

```
TASK: Documentar modules/goals/ (JSDoc + README do módulo)

PADRÃO JSDoc:
/**
 * Calcula o progresso de uma meta baseado nos resultados alcançados.
 * 
 * @param input - Dados de entrada (achieved, target, weight)
 * @returns Progresso em porcentagem (0-100)
 * @throws {DomainError} Quando target é menor ou igual a zero
 * 
 * @example
 * ```ts
 * const progress = calculateProgress({ achieved: 75, target: 100, weight: 1 });
 * // returns 75
 * ```
 */
export function calculateProgress(input: CalculateProgressInput): number { ... }

GERAR:
1. JSDoc em todas as funções/classes públicas
2. README.md no módulo com:
   - Visão geral
   - Estrutura de pastas
   - Como usar (exemplos)
   - Dependências
   - Como testar
3. Atualizar docs/ se houver documentação externa
4. ADRs para decisões arquiteturais não-óbvias
```

## 9.8 Code Review Assistido

```
TASK: Revisar PR #123 (implementação de UC-029)

CONTEXTO: Use as guidelines de code review do Documento 15 (Capítulo 8).

VERIFICAR:
1. Funcionalidade: resolve o problema? Edge cases considerados?
2. Arquitetura: está no módulo correto? Respeita camadas?
3. Código: nomes claros? Funções curtas? Sem magic numbers?
4. TypeScript: sem any? Retornos tipados? Sem @ts-ignore?
5. Segurança: input validado? companyId do JWT? Sem secrets?
6. Performance: sem N+1? Paginação? Cache?
7. Manutenibilidade: documentação atualizada? ADR criado?
8. Testes: novos testes? Cobertura não diminuiu?

OUTPUT:
- Lista de comentários com severidade (Bloqueador/Must fix/Should fix/Nice to have/Praise)
- Sugestões de código concreto (não apenas "mude isso")
- Veredito: Approve / Request changes / Reject
```

## 9.9 Migrar para Nova Versão de API

```
TASK: Migrar endpoint de /api/v1/goals para /api/v2/goals com breaking changes

CONTEXTO:
- v1: retorna id como number, targetValue como string
- v2: deve retornar id como string (BigInt JSON-safe), targetValue como number

REGRAS:
- v1 deve continuar funcionando por 12 meses (deprecation)
- v2 deve ser nova rota, não substituir v1
- Migrar tipos compartilhados para evitar duplicação
- Documentar migration guide para consumidores

GERAR:
1. app/api/v2/goals/route.ts (novo)
2. app/api/v2/goals/[id]/route.ts (novo)
3. shared/types/goals.v2.ts (tipos novos)
4. docs/api/v2-migration-guide.md
5. Manter app/api/v1/goals/ com warning de deprecation no header
6. Script para converter responses v1 → v2 (para clientes)
```

## 9.10 Implementar Webhook

```
TASK: Implementar webhook outbound para notificar sistemas externos 
quando um resultado é aprovado

CONTEXTO:
- Empresas podem registrar URLs de webhook
- Eventos: result.approved, result.rejected, goal.completed
- Entrega deve ser assíncrona (não bloquear request original)

REGRAS:
- HMAC-SHA256 signature no header X-Orion-Signature
- Retry exponencial (5 tentativas: 1min, 5min, 30min, 2h, 12h)
- Idempotência via header X-Orion-Event-Id
- Timeout de 30s por tentativa
- Status: pending, delivered, failed
- Logs em webhook_deliveries (com response, status, attempts)

GERAR:
1. prisma/schema.prisma — model Webhook, WebhookDelivery
2. modules/webhooks/services/WebhookService.ts
3. modules/webhooks/services/WebhookDispatcher.ts (BullMQ worker)
4. app/api/v1/webhooks/route.ts (CRUD para registrar webhooks)
5. Testes unitários
6. Testes de integração com Wiremock
```

## 9.11 Implementar Feature Flag

```
TASK: Implementar sistema de feature flags

CONTEXTO:
- Flags globais (admin controla)
- Flags por empresa (override)
- Flags por usuário (casos especiais)

REGRAS:
- Cache Redis (TTL 60s)
- Hook React useFeatureFlag(flag, companyId?)
- Avaliação em server-side (para Server Components)
- Log quando flag muda (auditoria)

GERAR:
1. prisma/schema.prisma — model FeatureFlag
2. shared/featureFlags/flags.ts
3. shared/featureFlags/FlagService.ts
4. shared/hooks/useFeatureFlag.ts
5. app/api/v1/admin/feature-flags/route.ts (CRUD admin)
6. Componente <FeatureFlag flag="ai_insights" fallback={<DisabledMessage />}>
7. Testes
```

## 9.12 Adicionar Internacionalização (i18n)

```
TASK: Adicionar i18n para português (default) e inglês

CONTEXTO:
- Usar next-intl (compatível com App Router)
- Traduções em /messages/pt-BR.json e /messages/en-US.json
- Detectar idioma do usuário em runtime
- Permitir override nas preferências

REGRAS:
- Toda string visível na UI deve ser traduzida
- Validações Zod com mensagens traduzíveis
- Erros de API com mensagens traduzíveis (header Accept-Language)
- Datas/números com Intl APIs
- Fallback para pt-BR se tradução faltar

GERAR:
1. Configuração next-intl
2. /messages/pt-BR.json e /messages/en-US.json (completo)
3. Middleware de detecção de idioma
4. Hook useTranslations (já vem com next-intl)
5. Exemplo de uso em componente
6. Script para validar traduções completas
```

## 9.13 Adicionar Modo Escuro

```
TASK: Implementar dark mode com persistência

CONTEXTO:
- Tailwind CSS com estratégia class-based
- Token mapping (mesmas classes, diferentes valores)
- Toggle no header
- Persistência em localStorage
- Sync com prefers-color-scheme

REGRAS:
- Sem flash de tema errado (FOUC) — use inline script no <head>
- Tema aplicado em SSR baseado em cookie
- Acessível: contraste WCAG AA em ambos temas
- Tema por empresa pode override (mas usuário decide final)

GERAR:
1. app/theme-provider.tsx (next-themes)
2. components/ThemeToggle.tsx
3. tailwind.config.js com darkMode: 'class'
4. CSS variables em :root e .dark
5. Script anti-FOUC em app/layout.tsx
6. Validação de contraste em ambos temas
```

## 9.14 Implementar Real-time com WebSocket

```
TASK: Implementar ranking em tempo real (atualiza quando resultado é lançado)

CONTEXTO:
- Usar Socket.io (compatível com Next.js)
- Apenas usuários autenticados podem conectar
- Isolamento por company_id (room: company:123)
- Eventos: ranking.updated, goal.progress_changed

REGRAS:
- Auth no handshake (JWT)
- Rate limit: 10 msg/s por socket
- Reconexão automática com backoff
- Invalidação de cache quando ranking atualiza

GERAR:
1. lib/socket.ts (servidor Socket.io)
2. shared/hooks/useSocket.ts (cliente)
3. modules/rankings/realtime/RankingRealtime.ts
4. Evento emitido quando resultado é aprovado
5. Componente <RankingLive /> que escuta atualizações
6. Testes de integração
```

## 9.15 Implementar Auditoria Automática

```
TASK: Implementar auditoria automática para TODA mutation via Prisma extension

CONTEXTO:
- Toda mutation (create, update, delete) deve gerar log
- Log em audit_logs (com diff de valores)
- Capturar userId e companyId do contexto (AsyncLocalStorage)

REGRAS:
- Não pode esquecer de logar (automático via extension)
- Diff inteligente (ignora updatedAt, version)
- Performance: log assíncrono (não bloqueia mutation)
- Imutabilidade: logs nunca editados/deletados

GERAR:
1. lib/prisma.ts com extension de auditoria
2. shared/context/auditContext.ts (AsyncLocalStorage)
3. Middleware que popula auditContext
4. Testes que validam log criado em todas as mutations
```

## 9.16 Implementar Cache com Invalidation Inteligente

```
TASK: Implementar cache Redis para queries de dashboard

CONTEXTO:
- Dashboard carrega dados de 5 módulos diferentes
- Cache por empresa + usuário (chave composta)
- Invalidação baseada em eventos (quando resultado é lançado)

REGRAS:
- TTL: 60s (curto, mas suficiente)
- Stale-while-revalidate: serve cache expirado enquanto refaz
- Invalidation: eventBus.on('result.approved', invalidateDashboard)
- Compression: gzip para payloads > 10KB

GERAR:
1. shared/cache/DashboardCache.ts
2. Hook useDashboardData com stale-while-revalidate
3. EventBus listeners para invalidação
4. Métricas de cache hit rate
```

## 9.17 Implementar Paginação Cursor-based

```
TASK: Substituir paginação offset por cursor-based em /api/v1/goals

CONTEXTO:
- Pagina atual: ?page=10&limit=20 (OFFSET 180 LIMIT 20)
- Problema: lento com page > 100 (table scan)
- Solução: cursor-based (?cursor=42&limit=20)

GERAR:
1. shared/utils/pagination.ts (helper)
2. Modificar GoalService.list para suportar cursor
3. Manter backward compatibility (page ainda funciona, mas deprecated)
4. Atualizar hook useGoals para suportar infinite scroll
5. Documentar novo formato no OpenAPI
```

## 9.18 Implementar OAuth2 (Login Social)

```
TASK: Adicionar login via Google e Microsoft

CONTEXTO:
- NextAuth.js já configurado
- Adicionar providers Google e Microsoft
- Permitir vincular conta existente (mesmo email)
- Criar usuário novo se email não existe

REGRAS:
- Token JWT próprio (não usar session do NextAuth)
- Vinculação: se email existe, atualizar provider, não criar novo user
- Logo no login page
- Option de "Continue with Google/Microsoft"

GERAR:
1. lib/auth.ts com providers Google + Microsoft
2. Callbacks para criar/vincular usuário
3. Componente SocialLogin no /login page
4. Documentação de setup (env vars necessárias)
5. Testes E2E para ambos fluxos
```

## 9.19 Implementar Upload de Arquivos

```
TASK: Implementar upload de planilhas Excel para importação em lote de metas

CONTEXTO:
- Usuário baixa template Excel
- Preenche metas (até 1000 linhas)
- Faz upload
- Sistema valida, mostra preview, confirma importação

REGRAS:
- Max 5MB
- Apenas .xlsx (verifica magic bytes, não extensão)
- Virus scan via ClamAV
- Validação linha-a-linha com relatório de erros
- Preview antes de importar definitivamente
- Auditoria de quem importou

GERAR:
1. shared/utils/excelParser.ts (usando ExcelJS)
2. modules/goals/services/GoalImportService.ts
3. app/api/v1/goals/import/route.ts (POST multipart)
4. app/api/v1/goals/import/preview/route.ts (POST com preview)
5. modules/goals/components/ImportDialog.tsx
6. Testes
```

## 9.20 Implementar Two-Factor Authentication (2FA)

```
TASK: Adicionar 2FA via TOTP (Google Authenticator)

CONTEXTO:
- Opcional para todos, obrigatório para admins
- Usar biblioteca otplib
- QR code para setup
- Backup codes (10 códigos de uso único)

REGRAS:
- Setup: user escaneia QR, digita código para confirmar
- Login: após senha, pede código TOTP
- Backup codes: hash bcrypt, invalidar após uso
- Disable 2FA: requer senha + código TOTP
- Auditoria em todas as mudanças de 2FA

GERAR:
1. modules/auth/services/TwoFactorService.ts
2. app/api/v1/auth/2fa/setup/route.ts
3. app/api/v1/auth/2fa/verify/route.ts
4. app/api/v1/auth/2fa/disable/route.ts
5. modules/auth/components/TwoFactorSetup.tsx (com QR code)
6. Modificar login flow para suportar 2FA
7. Testes
```

## 9.21 Implementar Notificações Multi-canal

```
TASK: Implementar sistema de notificações que envia para múltiplos canais

CONTEXTO:
- Canais: in-app, email, push (PWA), WhatsApp (via plugin)
- User configura preferências por tipo de notificação
- Templates com variáveis (Handlebars)
- Fila assíncrona (BullMQ)

REGRAS:
- Idempotência: mesma notificação não enviada 2x
- Retry exponencial para falhas
- Rate limit por user (max 10/hora)
- Preferências respeitadas (user desativou email? não envia)
- Tracking: opened, clicked (para email)

GERAR:
1. prisma/schema.prisma — Notification, NotificationPreference, NotificationTemplate
2. modules/notifications/services/NotificationService.ts
3. modules/notifications/channels/ (InAppChannel, EmailChannel, PushChannel)
4. modules/notifications/templates/ (Handlebars templates)
5. Worker BullMQ para processar fila
6. Hook useNotifications (real-time via WebSocket)
7. Componente NotificationCenter
8. Testes
```

## 9.22 Implementar Relatórios em PDF

```
TASK: Gerar relatório mensal de desempenho em PDF

CONTEXTO:
- Usuário clica em "Exportar PDF"
- Sistema gera relatório com gráficos, tabelas, branding
- Disponível para download em até 30s

REGRAS:
- Usar React PDF (@react-pdf/renderer)
- Template customizável por empresa (logo, cores)
- Máximo 20 páginas
- Dados calculados em background job (BullMQ)
- Notificação quando PDF está pronto

GERAR:
1. modules/reports/components/MonthlyReportPDF.tsx
2. modules/reports/services/ReportService.ts
3. app/api/v1/reports/monthly/route.ts
4. Worker que gera PDF em background
5. Notificação "PDF pronto para download"
6. Testes
```

## 9.23 Implementar Audit Log Viewer

```
TASK: Criar interface para admin visualizar logs de auditoria

CONTEXTO:
- Tabela audit_logs com milhões de registros
- Filtros: usuário, empresa, ação, tabela, período
- Exportação CSV
- Diff visual (antes vs depois)

REGRAS:
- Paginação cursor-based (performance)
- Filtros combináveis
- Visualização de diff (JSON highlight)
- Permissão: audit.read (admin apenas)
- Exportação limitada a 10k registros por vez

GERAR:
1. app/(admin)/admin/auditoria/page.tsx
2. modules/audit/components/AuditLogList.tsx
3. modules/audit/components/AuditLogDetail.tsx (com diff)
4. modules/audit/components/AuditLogFilters.tsx
5. app/api/v1/admin/audit-logs/route.ts (com filtros)
6. Hook useAuditLogs
```

## 9.24 Implementar Busca Full-text

```
TASK: Adicionar busca global (atalho Cmd+K) que busca em metas, campanhas, usuários

CONTEXTO:
- PostgreSQL full-text search (tsvector)
- Indexar: goals.name, campaigns.name, users.name
- Resultados agrupados por tipo
- Atalho Cmd+K abre command palette

REGRAS:
- Busca case-insensitive
- Suporta acentos (unaccent)
- Ranking por relevância (ts_rank)
- Limit 10 resultados por tipo
- Tempo < 200ms

GERAR:
1. Migration: criar tsvector columns + GIN indexes
2. shared/services/SearchService.ts
3. app/api/v1/search/route.ts
4. components/CommandPalette.tsx (Cmd+K)
5. Hook useSearch (com debounce 300ms)
6. Testes
```

## 9.25 Implementar Health Check Avançado

```
TASK: Implementar endpoint /api/v1/health com checks detalhados

CONTEXTO:
- Status do serviço (sempre 200 se processo rodando)
- Status do banco (query simples)
- Status do Redis (ping)
- Status de serviços externos (OpenAI, SMTP, S3)
- Latência de cada check

REGRAS:
- Cache de 10s (evitar sobrecarga)
- Timeout de 5s por check
- Status: healthy, degraded, unhealthy
- Schema consistente para monitoramento

GERAR:
1. app/api/v1/health/route.ts
2. shared/health/HealthCheckService.ts
3. shared/health/checks/ (Database, Redis, OpenAI, SMTP, S3)
4. Script para alertar em degraded
```

---

# Capítulo 10 — Anti-Patterns (O que NÃO fazer)

## 10.1 Anti-patterns de Código

### ❌ Anti-pattern 1: Uso de `any`

```typescript
// ❌ ERRADO — usa any
function processGoal(goal: any) {
  return goal.id + goal.targetValue;
}

// ✅ CORRETO — tipa explicitamente
function processGoal(goal: Goal): number {
  return goal.id + Number(goal.targetValue);
}

// ✅ Ou usa unknown com type guard
function processGoal(goal: unknown): number {
  if (!isGoal(goal)) throw new Error('Invalid goal');
  return goal.id + Number(goal.targetValue);
}
```

### ❌ Anti-pattern 2: Query sem filtro de tenant

```typescript
// ❌ ERRADO — vaza dados entre empresas
const goals = await prisma.goal.findMany();

// ✅ CORRETO — sempre filtra por companyId
const goals = await prisma.goal.findMany({
  where: { companyId: user.companyId, deletedAt: null },
});
```

### ❌ Anti-pattern 3: DELETE físico

```typescript
// ❌ ERRADO — perde dados, quebra auditoria
await prisma.goal.delete({ where: { id } });

// ✅ CORRETO — soft delete
await prisma.goal.update({
  where: { id },
  data: { deletedAt: new Date(), active: false },
});
```

### ❌ Anti-pattern 4: Senha/token em log

```typescript
// ❌ ERRADO — vaza credenciais
logger.info('Login attempt', { email, password });

// ✅ CORRETO — redact dados sensíveis
logger.info('Login attempt', { email: hashEmail(email) });
// Configurar pino redact para sempre redact: ['password', '*.password', 'token', '*.token']
```

### ❌ Anti-pattern 5: Input não validado

```typescript
// ❌ ERRADO — confia no input
export async function POST(req: Request) {
  const body = await req.json();
  const goal = await GoalService.create(body); // sem validação!
}

// ✅ CORRETO — sempre valida com Zod
export async function POST(req: Request) {
  const body = await req.json();
  const input = createGoalSchema.parse(body); // valida
  const goal = await GoalService.create(input);
}
```

### ❌ Anti-pattern 6: Component sem 'use client' quando precisa

```typescript
// ❌ ERRADO — usa useState sem 'use client'
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);  // Erro em Server Component
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ✅ CORRETO — adiciona 'use client'
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### ❌ Anti-pattern 7: N+1 Queries

```typescript
// ❌ ERRADO — 1 + N queries
const goals = await prisma.goal.findMany();
for (const goal of goals) {
  const user = await prisma.user.findUnique({ where: { id: goal.userId } });
}

// ✅ CORRETO — 1 query com include
const goals = await prisma.goal.findMany({
  include: { user: true },
});
```

### ❌ Anti-pattern 8: Estado derivado em useState

```typescript
// ❌ ERRADO — estado derivado
function UserCard({ user }) {
  const [fullName, setFullName] = useState(`${user.firstName} ${user.lastName}`);
  // Se user mudar, fullName não atualiza automaticamente
}

// ✅ CORRETO — derive direto
function UserCard({ user }) {
  const fullName = `${user.firstName} ${user.lastName}`;
}
```

### ❌ Anti-pattern 9: Funções gigantes

```typescript
// ❌ ERRADO — função de 200 linhas com 10 responsabilidades
function processGoal(goal) {
  // validação
  // cálculo
  // persistência
  // notificação
  // auditoria
  // ... 200 linhas
}

// ✅ CORRETO — funções pequenas e nomeadas
function processGoal(goal: Goal): Promise<ProcessedGoal> {
  validateGoal(goal);
  const calculated = calculateGoal(goal);
  const saved = await saveGoal(calculated);
  await notifyGoalProcessed(saved);
  await auditGoal(saved);
  return saved;
}
```

### ❌ Anti-pattern 10: Try-catch genérico que engole erro

```typescript
// ❌ ERRADO — engole erro
try {
  await riskyOperation();
} catch (e) {
  console.log('Error:', e);  // silencioso
  return null;
}

// ✅ CORRETO — trata específico, loga resto
try {
  await riskyOperation();
} catch (e) {
  if (e instanceof DomainError) {
    throw e;  // re-throw específico
  }
  logger.error('Unexpected error', { error: e, operation: 'riskyOperation' });
  throw new DomainError('INTERNAL_ERROR', 'Erro interno', 500);
}
```

## 10.2 Anti-patterns de IA

### ❌ Anti-pattern: Aceitar código da IA sem revisar

```typescript
// IA sugeriu:
const data = await fetch('/api/data').then(r => r.json());
// Sem try-catch, sem validação, sem tipo — NÃO aceitar cegamente
```

### ❌ Anti-pattern: Pedir feature gigante de uma vez

```
// ❌ ERRADO — pedir muito de uma vez
"Fazer todo o módulo de campanhas com frontend, backend, testes, documentação"

// ✅ CORRETO — dividir em tarefas
1. "Criar schema Prisma para Campaign"
2. "Criar DTO e validação Zod para Campaign"
3. "Implementar CampaignService.create()"
4. "Implementar endpoint POST /api/v1/campaigns"
5. "Criar testes unitários para CampaignService"
```

### ❌ Anti-pattern: Não dar contexto suficiente

```
// ❌ ERRADO — vago
"Crie um componente de formulário"

// ✅ CORRETO — específico
"Crie um componente de formulário para criar meta (GoalForm) seguindo:
- Padrões do projeto Orion (Capítulo 4 deste doc)
- Use shadcn/ui (Input, Select, Button)
- Validação com Zod (schema: createGoalSchema)
- Campos: userId (select), indicatorId (select), 
  goalType (radio), targetValue (number), 
  startDate (date), endDate (date), notes (textarea)
- Submissão chama useCreateGoal hook
- Loading state no botão
- Error display por campo"
```

### ❌ Anti-pattern: Confiança cega em respostas

```
IA: "Use esta query SQL que é eficiente"
SELECT * FROM goals WHERE company_id = ? AND ...

// ❌ Não validar:
// - Existe índice em company_id?
// - SELECT * é necessário ou pode usar colunas específicas?
// - Soft delete filter (deleted_at IS NULL)?
// - Há N+1 potential?

// ✅ Validar sempre:
"Antes de aceitar, valide:
1. EXPLAIN ANALYZE a query
2. Verifique índices
3. Confirme filtro de tenant
4. Adicione filtro de soft delete"
```

### ❌ Anti-pattern: Iteração infinita sem convergir

```
// IA sugere código → não funciona → IA sugere outro → não funciona → ...
// Após 3 iterações sem sucesso:
// - PARE
// - Re-leia o problema
// - Talvez abordagem está errada
// - Consulte humano
```

## 10.3 Anti-patterns de Prompting

### ❌ Anti-pattern 1: Prompt vago

```
// ❌ "Faça um componente bom"
// ✅ "Crie um Button com variante primary (bg-blue-900), 
//     size md (h-10 px-4), loading state (mostra spinner)"
```

### ❌ Anti-pattern 2: Muita instrução conflitante

```
// ❌ "Seja conciso mas detalhado, use TypeScript mas JavaScript também"
// ✅ Escolha um caminho
```

### ❌ Anti-pattern 3: Não dar exemplo

```
// ❌ "Siga os padrões do projeto"
// ✅ "Siga os padrões do projeto. Exemplo de componente existente:"
//     [inserir GoalForm.tsx como referência]
```

### ❌ Anti-pattern 4: Pedir sem validar

```
// ❌ Pedir feature, aceitar, commitar
// ✅ Pedir feature, validar, testar, revisar, commitar
```

### ❌ Anti-pattern 5: Context window desperdiçado

```
// ❌ Colear arquivo de 5000 linhas para mudar 1 função
// ✅ Colear apenas a função relevante + tipos que ela usa
```

---

# Capítulo 11 — Context Window Management

## 11.1 O que é Context Window

Context window é o limite de tokens que a IA consegue "lembrar" em uma conversa. Cada IA tem seu limite:

| IA | Context Window | Tokens aproximados |
|----|----------------|--------------------|
| GPT-4o | 128k tokens | ~96k palavras |
| Claude 3.5 Sonnet | 200k tokens | ~150k palavras |
| Claude 3 Opus | 200k tokens | ~150k palavras |
| GPT-4 Turbo | 128k tokens | ~96k palavras |
| Cursor (Claude) | 200k tokens | ~150k palavras |
| Copilot (GPT-4) | 8k tokens | ~6k palavras |

**Problema:** Mesmo com janelas grandes, **IA degrade em qualidade** quando muito contexto é fornecido. Estratégia: incluir apenas o **necessário**.

## 11.2 Estratégias de Otimização

### Estratégia 1: Minimal Context

Inclua apenas:
- Contexto do projeto (Capítulos 2-6 deste doc, ~3k tokens)
- Arquivo(s) relevante(s) à tarefa
- Especificação da tarefa

**Não inclua:**
- Todo o repositório
- Arquivos que não serão modificados
- Documentação não relacionada

### Estratégia 2: Progressive Context

```
Turn 1: "Vou trabalhar em feature X. Pode confirmar que entende o padrão?"
[IA confirma]

Turn 2: "Aqui está o schema Prisma relacionado: [cole schema]"
[IA processa]

Turn 3: "Agora gere o DTO com Zod"
[IA gera]

Turn 4: "Gere o service"
[IA gera, com contexto acumulado]
```

### Estratégia 3: Focused Context

Para cada tarefa, identifique o **mínimo indispensável**:

```
Tarefa: criar GoalService.create()

Contexto necessário:
- Schema Prisma do Goal (model)
- Tipo CreateGoalInput (DTO)
- DomainError class
- AuditService interface
- Exemplo de service existente (ex.: UserService)

Contexto NÃO necessário:
- Toda a documentação de UX
- Componentes React
- Configurações de CI/CD
- Outros módulos
```

### Estratégia 4: Summarization

Para conversas longas, periodicamente peça à IA para resumir:

```
"Antes de continuar, resuma o que fizemos até agora em 5 bullet points."
```

Use o resumo como ponto de partida para nova conversa (limpa context).

### Estratégia 5: File References (em vez de conteúdo)

Em ferramentas que suportam (Cursor, Claude Code), use **referências a arquivos** em vez de colar conteúdo:

```
// Em vez de colar todo o schema.prisma:
@file:prisma/schema.prisma
// IA acessa o arquivo quando precisa
```

## 11.3 Estimativa de Tokens

**Regra prática:** 1 token ≈ 4 caracteres em inglês ≈ 3 caracteres em português.

| Conteúdo | Tokens aproximados |
|----------|---------------------|
| Master Prompt Orion (Caps 2-8) | ~3.000 |
| Schema Prisma completo | ~5.000 |
| Um service médio (200 linhas) | ~1.500 |
| Um componente React (100 linhas) | ~800 |
| Um arquivo de testes (300 linhas) | ~2.000 |
| README do módulo | ~1.000 |

**Orçamento típico para tarefa:**
- Contexto projeto: 3.000 tokens
- Arquivos relevantes: 5.000-10.000 tokens
- Especificação tarefa: 500-1.000 tokens
- **Total:** ~10.000-15.000 tokens (bom para qualquer IA)

## 11.4 Quando o Context Window Enche

Sinais de context cheio:
- IA começa a "esquecer" instruções iniciais
- Respostas ficam genéricas
- IA repete código já descartado
- Erros de "context length exceeded"

**Soluções:**
1. **Resuma e reinicie:** peça resumo, comece nova conversa com resumo
2. **Externalize contexto:** salve em arquivo, referencie (não cole)
3. **Divida a tarefa:** quebre em sub-tarefas independentes
4. **Use ferramenta com janela maior:** Claude (200k) > GPT-4 (128k)

---

# Capítulo 12 — Chain of Thought Patterns

## 12.1 O que é Chain of Thought

Chain of Thought (CoT) é a técnica de fazer a IA **explicar seu raciocínio** antes de dar a resposta final. Isso melhora significativamente a qualidade em tarefas complexas.

## 12.2 Padrão Básico

```
TASK: Debugar erro LICENSE_INVALID

ANTES de propor solução:
1. Liste 3 hipóteses possíveis para a causa raiz
2. Para cada hipótese, descreva como validá-la
3. Identifique qual é mais provável e por quê
4. Proponha fix para a hipótese mais provável
5. Proponha teste que reproduz o bug

DEPOIS de pensar, forneça:
- Root cause analysis
- Fix em código
- Teste que captura o bug
```

## 12.3 Padrão Step-by-Step

```
TASK: Otimizar query de dashboard

PENSAMENTO PASSO-A-PASSO:
1. Identifique a query atual (cole aqui)
2. Rode EXPLAIN ANALYZE mentalmente — quais problemas vê?
3. Liste otimizações possíveis (índices, cache, MV, etc.)
4. Para cada otimização, avalie: effort, impacto, risco
5. Escolha a melhor combinação
6. Implemente

OUTPUT: Query otimizada + justificativa + benchmarks estimados
```

## 12.4 Padrão Devil's Advocate

```
TASK: Implementar feature X

ANTES de implementar:
1. Liste 3 razões pelas quais NÃO deveríamos implementar
2. Liste 3 razões pelas quais SIM deveríamos
3. Avalie: vale a pena? Por quê?
4. Se sim, quais são os riscos e como mitigar?

DEPOIS: Implemente com mitigações em mente
```

## 12.5 Padrão Trade-off Analysis

```
TASK: Escolher entre Redis vs PostgreSQL para cache

PENSAMENTO:
1. Liste prós e contras de Redis
2. Liste prós e contras de PostgreSQL (com materialized views)
3. Para cada critério (performance, custo, complexidade, manutenção):
   - Avalie ambas opções
4. Decida com justificativa

OUTPUT: Decisão + ADR-style document
```

## 12.6 Padrão First Principles

```
TASK: Implementar sistema de permissões

PENSAMENTO FIRST PRINCIPLES:
1. O que é fundamentalmente uma permissão? (não copie soluções existentes)
2. Que problemas precisamos resolver? (RBAC, ABAC, custom?)
3. Quais são as constraints do Orion? (multi-tenant, performance, audit)
4. Dados esses fundamentos, qual a solução mais simples possível?

OUTPUT: Design simples e justificado
```

## 12.7 Exemplo Prático

**Sem CoT:**
```
P: "Como otimizar esta query?"
R: "Adicione um índice em company_id."
```

**Com CoT:**
```
P: "Como otimizar esta query? Use chain of thought."

R: 
"Vou analisar passo-a-passo:

1. **Análise da query:**
   - Filtra por company_id (bom)
   - Filtra por deleted_at IS NULL (bom)
   - Ordena por created_at DESC
   - Faz JOIN com users e indicators
   - Retorna 20 registros

2. **Identificação de problemas:**
   - Possível Seq Scan se não há índice em (company_id, created_at)
   - JOIN pode estar carregando colunas desnecessárias
   - Sem LIMIT explícito pode retornar muitos registros

3. **Hipóteses de otimização:**
   a) Adicionar índice composto (company_id, created_at DESC) — alto impacto, baixo esforço
   b) Usar SELECT com colunas específicas — médio impacto, baixo esforço
   c) Adicionar cache Redis — alto impacto, médio esforço
   d) Materialized view para agregações — alto impacto, alto esforço

4. **Recomendação:**
   Implementar (a) + (b) imediatamente (quick wins). 
   Avaliar (c) se latência ainda for > 500ms.
   (d) apenas se houver necessidade de agregações complexas.

5. **Implementação:**
   [código da migration + query otimizada]"
```

---

# Capítulo 13 — Few-Shot Examples

## 13.1 O que é Few-Shot

Few-shot prompting é fornecer **exemplos concretos** do que se espera antes de pedir a tarefa. A IA aprende o padrão pelos exemplos.

## 13.2 Quando Usar

- Padrão específico do projeto que a IA não conhece
- Formato de output muito específico
- Convenções não-óbvias
- Tarefas repetitivas com variações

## 13.3 Exemplo: Padrão de Service

```
TASK: Criar CampaignService.create() seguindo o mesmo padrão de GoalService

EXEMPLO (GoalService.create):
```typescript
import { prisma } from '@/lib/prisma';
import { audit } from '@/modules/audit/services/AuditService';
import { eventBus } from '@/shared/events/eventBus';
import { DomainError } from '@/shared/errors/DomainError';
import type { CreateGoalInput } from '../dto/CreateGoalDTO';

export class GoalService {
  static async create(input: CreateGoalInput): Promise<Goal> {
    // 1. Validação de domínio
    const indicator = await prisma.indicator.findFirst({
      where: { id: input.indicatorId, companyId: input.companyId, active: true },
    });
    if (!indicator) throw new DomainError('INDICATOR_NOT_FOUND', 'Indicador não encontrado', 404);
    
    // 2. Verificação de licença
    const license = await prisma.license.findFirst({
      where: { companyId: input.companyId, status: 'active' },
    });
    if (!license) throw new DomainError('LICENSE_INVALID', 'Licença inválida', 403);
    
    // 3. Cria com transaction
    const goal = await prisma.$transaction(async (tx) => {
      const created = await prisma.goal.create({
        data: { ...input, uuid: crypto.randomUUID(), version: 1 },
      });
      await audit.record({...}, tx);
      return created;
    });
    
    // 4. Evento
    await eventBus.emit('goal.created', { goalId: goal.id });
    
    return goal;
  }
}
```

AGORA: Crie CampaignService.create() no MESMO padrão.
- Mesma estrutura: validação → licença → create com transaction → evento
- DomainError específicos: CAMPAIGN_NAME_TAKEN, CAMPAIGN_DATE_INVALID
- Evento: campaign.created
```

## 13.4 Exemplo: Padrão de Componente

```
TASK: Criar CampaignCard seguindo padrão de GoalCard

EXEMPLO (GoalCard):
```tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Goal } from '../types';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export function GoalCard({ goal, onEdit, onDelete, className }: GoalCardProps) {
  const progress = Math.min(100, (goal.achievedValue / goal.targetValue) * 100);
  
  return (
    <Card className={className} data-testid="goal-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{goal.indicator.name}</CardTitle>
          <Badge variant={progress >= 100 ? 'success' : 'secondary'}>
            {Math.round(progress)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={progress} data-testid="goal-progress" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Realizado: R$ {goal.achievedValue}</span>
          <span className="font-medium">Meta: R$ {goal.targetValue}</span>
        </div>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
            Editar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

AGORA: Crie CampaignCard no mesmo padrão.
- Mesma estrutura: props com onEdit/onDelete, className, data-testid
- Conteúdo: nome, datas, status badge, progress de participantes ativos
- Botões: Editar, Ver participantes
```

## 13.5 Exemplo: Padrão de Teste

```
TASK: Criar testes para CampaignService no padrão de GoalService

EXEMPLO (GoalService.test.ts):
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoalService } from './GoalService';
import { prismaMock } from '@/test/mocks/prisma';
import { auditMock } from '@/test/mocks/audit';
import { DomainError } from '@/shared/errors/DomainError';

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/modules/audit/services/AuditService', () => ({ audit: auditMock }));

describe('GoalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    const validInput = {
      userId: 1,
      indicatorId: 1,
      companyId: 1,
      createdBy: 1,
      goalType: 'monthly' as const,
      targetValue: 1000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };

    it('creates a goal successfully', async () => {
      // Arrange
      prismaMock.indicator.findFirst.mockResolvedValue({ id: 1, active: true } as any);
      prismaMock.license.findFirst.mockResolvedValue({ status: 'active' } as any);
      prismaMock.$transaction.mockImplementation(async (fn) => fn(prismaMock));
      prismaMock.goal.create.mockResolvedValue({ id: 1, ...validInput } as any);
      
      // Act
      const result = await GoalService.create(validInput);
      
      // Assert
      expect(result.id).toBe(1);
      expect(prismaMock.goal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            indicatorId: 1,
            uuid: expect.any(String),
          }),
        }),
      );
      expect(auditMock.record).toHaveBeenCalled();
    });

    it('throws DomainError when indicator not found', async () => {
      prismaMock.indicator.findFirst.mockResolvedValue(null);
      
      await expect(GoalService.create(validInput)).rejects.toThrow(DomainError);
    });
  });
});
```

AGORA: Crie CampaignService.test.ts no mesmo padrão.
- Mocks no mesmo formato
- Testes: create success, indicator/license not found, name conflict, date invalid
- Use table-driven para cenários de erro
```

## 13.6 Quantos Exemplos Fornecer

| Tipo de tarefa | Nº de exemplos |
|----------------|----------------|
| Padrão bem definido | 1 exemplo |
| Padrão com variações | 2-3 exemplos |
| Convenção complexa | 3-5 exemplos |
| Tarefa simples sem padrão | 0 (zero-shot) |

**Regra:** menos é mais. Se 1 exemplo basta, não dê 5.

---

# Capítulo 14 — Prompt Templates por Ferramenta

## 14.1 Cursor

Cursor tem acesso ao codebase inteiro. Use referências a arquivos em vez de colar conteúdo.

### Template de System Prompt para Cursor

```
Você é um engenheiro de software sênior trabalhando no projeto Orion.

CONTEXTO DO PROJETO (sempre ativo):
- Stack: Next.js 14, TypeScript strict, Tailwind, shadcn/ui, Prisma, PostgreSQL, Redis
- Arquitetura: Clean Architecture + DDD + Modular
- Princípios: multi-tenant (company_id em toda query), RBAC, auditoria, soft delete

PADRÕES OBRIGATÓRIOS:
- TypeScript strict (sem any)
- Zod para validação
- DomainError para erros de domínio
- Auditoria em toda mutation
- Soft delete (nunca DELETE físico)
- data-testid em componentes
- Conventional Commits

ESTRUTURA DE PASTAS:
- app/ (Next.js App Router)
- modules/ (domínio, ex.: modules/goals/)
- shared/ (código compartilhado)
- lib/ (setup de libs)

QUANDO PEDIR PARA GERAR CÓDIGO:
1. Siga os padrões dos arquivos existentes (use @file para referenciar)
2. Sempre adicione testes
3. Tipos TypeScript explícitos
4. Tratamento de erro com DomainError
5. Multi-tenant (company_id do JWT, nunca do body)

QUANDO PEDIR PARA REVISAR CÓDIGO:
- Foque em: bugs, security, performance, padrões
- Sugestões concretas (não "mude isso")
- Severidade: bloqueador / must fix / should fix / nice to have

NUNCA:
- Use `any`
- Faça DELETE físico
- Query sem company_id
- Input sem validação Zod
- Senha em log
```

### Como usar no Cursor

1. **Settings → General → Rules for AI:** cole o system prompt acima
2. **Em conversas:** use `@file` para referenciar arquivos
3. **Cmd+K:** gere código inline com contexto
4. **Cmd+L:** chat lateral com IA
5. **Cmd+I:** composer para mudanças multi-arquivo

### Exemplo de prompt específico

```
@file prisma/schema.prisma @file modules/goals/services/GoalService.ts

Crie um novo módulo "awards" seguindo exatamente o mesmo padrão de goals.

Entidade Award:
- name (string, 1-255)
- description (text, opcional)
- type (enum: money, product, experience, points)
- value (decimal)
- campaignId (FK para campaign)
- awardedTo (FK para user, opcional)
- awardedAt (date, opcional)
- status (enum: pending, awarded, delivered, cancelled)

Endpoints:
- POST /api/v1/awards (criar)
- GET /api/v1/awards (listar)
- GET /api/v1/awards/:id (detalhar)
- PUT /api/v1/awards/:id (atualizar)
- DELETE /api/v1/awards/:id (soft delete)
- POST /api/v1/awards/:id/award (atribuir a usuário)

Gere:
1. Schema Prisma
2. DTO com Zod
3. Service
4. Repository
5. Routes
6. Testes unitários
7. Componente AwardCard (seguindo padrão de GoalCard)
8. Hook useAwards
```

## 14.2 Claude Code (Anthropic CLI)

Claude Code opera via CLI com acesso ao filesystem.

### Template

```
PROJECT: Orion (Next.js 14, TypeScript, Prisma, multi-tenant SaaS)

INSTRUCTIONS:
- Always follow existing patterns (check modules/goals/ as reference)
- TypeScript strict, no `any`
- Zod for all input validation
- DomainError for domain errors
- Audit log for all mutations
- Soft delete only (no physical DELETE)
- Multi-tenant: filter by companyId from JWT, never from request body
- Tests required for all new code
- Conventional commits

WORKING DIRECTORY: /home/user/orion

When asked to create a feature:
1. Read existing similar module first (use `cat` or read tool)
2. Follow same structure: dto/, services/, repositories/, components/, hooks/, tests/
3. Generate all files
4. Suggest tests
5. Suggest commit message

When asked to debug:
1. Read the failing file
2. Identify root cause (think step by step)
3. Propose fix with explanation
4. Add test that captures the bug
5. Suggest verification steps

When asked to refactor:
1. Read the file completely
2. Identify code smells
3. Propose plan (small commits)
4. Execute refactoring preserving behavior
5. Run tests after each step

NEVER:
- Use `any` type
- Skip validation
- Hardcode values
- Use console.log in production
- Skip audit log
- Delete physically
```

### Como usar

```bash
# Instalar
npm install -g @anthropic-ai/claude-code

# Iniciar
claude

# Em sessão interativa:
> read modules/goals/services/GoalService.ts
> create modules/awards/services/AwardService.ts following same pattern

# Ou comando direto:
claude "create AwardService following GoalService pattern"
```

## 14.3 Windsurf (Codeium)

Windsurf é similar ao Cursor, com IA mais integrada ao fluxo.

### Template

```
Projeto: Orion — Plataforma de Gestão Comercial
Stack: Next.js 14 + TypeScript + Tailwind + shadcn/ui + Prisma + PostgreSQL

REGRAS CRÍTICAS:
1. Multi-tenant: toda query Prisma deve ter `where: { companyId: ..., deletedAt: null }`
2. Auth: usar `requireAuth(req)` e `requirePermission(user, 'module.action')`
3. Validação: Zod schema para todo input de API
4. Erros: usar DomainError com code + message + statusCode
5. Auditoria: toda mutation chama `audit.record({...})`
6. Soft delete: nunca DELETE, sempre update deleted_at
7. Testes: AAA pattern, mocks para Prisma/Redis/external

ESTRUTURA DE MÓDULO (sempre siga):
modules/[name]/
├── components/
├── hooks/
├── services/
├── repositories/
├── dto/
├── types/
└── tests/

PADRÕES DE CÓDIGO:
- TypeScript strict (no `any`, use `unknown` + type guard)
- Function declarations (não arrow functions para componentes)
- Named exports (não default exports)
- interface para objetos, type para unions
- as const para constantes literais
- cva para variantes de componentes
- data-testid em todos os componentes testáveis

COMMIT FORMAT (Conventional):
<type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, test, chore, perf, ci
Scopes: auth, users, goals, results, campaigns, ranking, dashboard, ai, audit, license

QUANDO GERAR CÓDIGO:
1. Sempre inclua tipos TypeScript
2. Sempre adicione tratamento de erro
3. Sempre adicione auditoria se for mutation
4. Sempre adicione data-testid em componentes
5. Sugira testes ao final

QUANDO REVISAR:
- Identifique bugs potenciais
- Verifique multi-tenant (company_id em toda query)
- Verifique soft delete
- Verifique validação
- Sugira melhorias de performance
```

### Como usar no Windsurf

1. **Settings → AI → System Prompt:** cole o template
2. **Cascade (Cmd+I):** chat lateral com IA
3. **Inline edit (Cmd+K):** edição com contexto
4. **Predictive:** autocompletar inteligente

## 14.4 GitHub Copilot

Copilot tem context window menor (8k tokens) e funciona inline.

### .github/copilot-instructions.md

Crie um arquivo `.github/copilot-instructions.md` na raiz do repo:

```markdown
# Orion — Copilot Instructions

## Project Context
Orion is a multi-tenant commercial team management platform.
Stack: Next.js 14, TypeScript strict, Tailwind, shadcn/ui, Prisma, PostgreSQL, Redis.

## Code Standards
- TypeScript strict mode (no `any`)
- Use `interface` for objects, `type` for unions
- Use `as const` for literal constants
- Prefer named exports over default exports
- Use `function` declarations for React components (not arrow)

## Patterns
- Multi-tenant: always include `companyId` in Prisma queries
- Soft delete: never use `prisma.X.delete()`, use `prisma.X.update({ data: { deletedAt: new Date() } })`
- Auth: use `requireAuth(req)` then `requirePermission(user, 'module.action')`
- Validation: Zod schemas for all API inputs
- Errors: throw `DomainError` with code, message, statusCode
- Audit: call `audit.record()` for all mutations
- Components: add `data-testid` for E2E testing

## File Structure
- `app/api/v1/[module]/route.ts` — API endpoints
- `modules/[module]/services/` — business logic
- `modules/[module]/dto/` — Zod schemas
- `modules/[module]/repositories/` — Prisma access
- `modules/[module]/components/` — React components
- `modules/[module]/hooks/` — custom hooks

## Examples

### Service pattern:
```typescript
export class GoalService {
  static async create(input: CreateGoalInput): Promise<Goal> {
    const indicator = await prisma.indicator.findFirst({
      where: { id: input.indicatorId, companyId: input.companyId, active: true },
    });
    if (!indicator) throw new DomainError('INDICATOR_NOT_FOUND', 'Not found', 404);
    
    const goal = await prisma.goal.create({
      data: { ...input, uuid: crypto.randomUUID(), version: 1 },
    });
    
    await audit.record({ userId: input.createdBy, action: 'create', tableName: 'goals', recordId: goal.id });
    await eventBus.emit('goal.created', { goalId: goal.id });
    
    return goal;
  }
}
```

### API route pattern:
```typescript
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    requirePermission(user, 'goals.create');
    const input = createGoalSchema.parse(await req.json());
    const goal = await GoalService.create({ ...input, companyId: user.companyId, createdBy: user.id });
    return NextResponse.json(goal, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
```

## Forbidden
- `any` type (use `unknown` + type guard)
- `prisma.X.delete()` (use soft delete)
- `console.log` in production (use `logger`)
- Hardcoded values per segment (use configuration)
- Default exports for components
- Arrow function components
```

### Como usar Copilot

1. **Inline suggestions:** comece a digitar, Copilot sugere (Tab para aceitar)
2. **Copilot Chat (Ctrl+I):** chat com contexto do arquivo
3. **Copilot Workspace:** para tarefas maiores (preview)
4. **Copilot CLI (`gh copilot`):** comandos shell

### Exemplo de uso

```typescript
// Digite:
export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  // Copilot vai sugerir baseado no padrão:
  const indicator = await prisma.indicator.findFirst({
    where: { id: input.indicatorId, companyId: input.companyId, active: true },
  });
  if (!indicator) throw new DomainError('INDICATOR_NOT_FOUND', 'Not found', 404);
  // ...
}
```

## 14.5 Aider (CLI Open-Source)

Aider é CLI open-source que funciona com qualquer modelo.

### .aider.conf.yml

```yaml
# Aider configuration for Orion project

# Default model (Claude 3.5 Sonnet recommended)
model: claude-3-5-sonnet

# Weak model for chat
weak-model: gpt-4o-mini

# Auto-commit changes
auto-commits: true

# Commit message format
commit-message-format: conventional

# Read these files at startup for context
read:
  - docs/conventions.md
  - prisma/schema.prisma

# Ignore these files
ignore:
  - node_modules/
  - .next/
  - dist/
  - coverage/
  - "*.test.ts"
  - "*.spec.ts"

# Git settings
git: true
gitignore: true
```

### Como usar

```bash
# Instalar
pip install aider-chat

# Configurar API key
export ANTHROPIC_API_KEY=sk-ant-...

# Iniciar
aider

# Em sessão:
> read modules/goals/services/GoalService.ts
> create modules/awards/services/AwardService.ts following same pattern

# Ou comando direto:
aider --message "Add AwardService following GoalService pattern" modules/awards/services/AwardService.ts
```

## 14.6 Continue.dev (VS Code Extension)

Continue é open-source e roda localmente ou com APIs.

### config.json (em ~/.continue/config.json)

```json
{
  "models": [
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "YOUR_API_KEY"
    },
    {
      "title": "GPT-4o",
      "provider": "openai",
      "model": "gpt-4o",
      "apiKey": "YOUR_API_KEY"
    }
  ],
  "customCommands": [
    {
      "name": "orion-module",
      "description": "Create new Orion module following patterns",
      "prompt": "Create a new Orion module called {{{input}}} following the same pattern as modules/goals/. Include: Prisma schema, DTO (Zod), Service, Repository, API routes, components, hooks, and tests. Refer to modules/goals/ as reference."
    },
    {
      "name": "orion-test",
      "description": "Generate tests for current file",
      "prompt": "Generate comprehensive tests for the current file following Orion patterns. Use vitest, mocks for Prisma/Redis/external. Cover: happy path, edge cases, error cases. Use AAA pattern."
    }
  ],
  "systemMessage": "You are working on Orion, a multi-tenant commercial management platform. Always follow: TypeScript strict, Zod validation, DomainError for errors, multi-tenant filter (companyId), soft delete, audit log for mutations, data-testid in components."
}
```

---

# Capítulo 15 — Validation Strategies

## 15.1 Por que Validar Output de IA

IA pode:
- Gerar código que não compila
- Usar APIs inexistentes (alucinação)
- Quebrar padrões do projeto
- Introduzir bugs sutis
- Pular tratamento de erro

**Toda saída de IA deve ser validada antes de aceitar.**

## 15.2 Estratégias de Validação

### Estratégia 1: Compilação

```bash
# Após IA gerar código:
pnpm typecheck  # TypeScript compila?
pnpm lint       # ESLint passa?
pnpm test       # Testes passam?
```

Se qualquer um falhar, peça à IA para corrigir (com mensagem de erro específica).

### Estratégia 2: Padrões do Projeto

```bash
# Checklist mental:
□ Usa TypeScript strict (sem any)?
□ Usa Zod para validação de input?
□ Usa DomainError para erros?
□ Tem company_id em queries?
□ Soft delete (não DELETE físico)?
□ Auditoria em mutations?
□ data-testid em componentes?
□ Conventional commit message?
```

### Estratégia 3: Testes

```bash
# Sempre escreva teste que valide o comportamento esperado:
pnpm test -- --watch  # roda em watch enquanto itera com IA
```

### Estratégia 4: Security Review

```bash
# Checklist de segurança:
□ Input validado (Zod)?
□ Sem SQL injection (queries parametrizadas)?
□ Sem XSS (output escapado)?
□ Sem secrets hardcoded?
□ Multi-tenant enforced?
□ Auth/permission check presente?
□ Rate limiting se aplicável?
```

### Estratégia 5: Performance Review

```bash
# Checklist de performance:
□ Sem N+1 queries?
□ Paginação em listagens?
□ Cache onde apropriado?
□ Sem fetch desnecessário em loops?
□ Índices para novas queries?
□ Bundle size não aumentou?
```

### Estratégia 6: Diff Review

```bash
# Sempre revise o diff antes de commitar:
git diff
# Ou use VS Code source control para visualizar mudanças
```

## 15.3 Processo de Iteração

```
1. IA gera código
2. Validação automática (typecheck, lint, test)
   - Falhou? → IA corrige com mensagem de erro específica
   - Passou? → Continua
3. Validação manual (review humano)
   - Problema? → IA ajusta com feedback específico
   - OK? → Continua
4. Testes de regressão (roda testes existentes)
   - Falhou? → IA corrige side effects
   - Passou? → Continua
5. Commit
```

## 15.4 Exemplo Prático de Iteração

```
[Turn 1] Dev: "Crie GoalService.update()"

[IA gera código]
export class GoalService {
  static async update(id: number, input: UpdateGoalInput): Promise<Goal> {
    return await prisma.goal.update({
      where: { id },
      data: input,
    });
  }
}

[Turn 2] Dev: "Revise o código. O que está faltando?"

[IA analisa]
"Faltam:
1. Filtro de companyId (multi-tenant)
2. Soft delete check (deletedAt IS NULL)
3. Auditoria
4. Validação de existência
5. Version increment (optimistic lock)

Versão corrigida:
```typescript
static async update(id: number, companyId: number, input: UpdateGoalInput, userId: number): Promise<Goal> {
  // 1. Verifica existência e tenant
  const existing = await prisma.goal.findFirst({
    where: { id, companyId, deletedAt: null },
  });
  if (!existing) throw new DomainError('GOAL_NOT_FOUND', 'Meta não encontrada', 404);
  
  // 2. Update com optimistic lock
  const updated = await prisma.goal.update({
    where: { id, version: existing.version },
    data: {
      ...input,
      version: { increment: 1 },
      updatedBy: userId,
      updatedAt: new Date(),
    },
  });
  
  // 3. Auditoria
  await audit.record({
    userId,
    companyId,
    action: 'update',
    tableName: 'goals',
    recordId: id,
    oldValue: existing,
    newValue: updated,
  });
  
  // 4. Evento
  await eventBus.emit('goal.updated', { goalId: id, changes: input });
  
  return updated;
}
```"

[Turn 3] Dev: "Agora escreva testes cobrindo: success, not found, optimistic lock conflict, audit log created."
```

---

# Capítulo 16 — Self-Review Prompts

## 16.1 O que é Self-Review

Self-review é pedir à IA para **criticar seu próprio código** antes de apresentar como final. Isso força a IA a identificar problemas que pode ter introduzido.

## 16.2 Padrões de Self-Review

### Padrão 1: Crítica Direta

```
TASK: [tarefa]

Após gerar o código, faça self-review respondendo:

1. Quais são 3 potenciais bugs neste código?
2. Quais edge cases não foram tratados?
3. Que padrões do projeto foram violados (se algum)?
4. Como este código pode falhar em produção?
5. Que melhorias você faria se tivesse mais tempo?

Responda cada pergunta antes de apresentar o código como final.
```

### Padrão 2: Reviewer Perspective

```
TASK: [tarefa]

Após gerar, atue como code reviewer sênior e revise seu próprio código.

Aplique checklist:
□ Funcionalidade: resolve o problema?
□ Multi-tenant: company_id em toda query?
□ Segurança: input validado, sem SQL injection?
□ Performance: sem N+1, paginação?
□ Padrões: TypeScript strict, Zod, DomainError?
□ Testes: cobre happy + edge + error?
□ Manutenibilidade: nomes claros, funções curtas?
□ Auditoria: mutations logadas?

Liste problemas encontrados (se algum) e corrija antes de apresentar final.
```

### Padrão 3: Adversarial Review

```
TASK: [tarefa]

Após gerar o código, imagine que você é um atacante tentando explorar este código.

1. Como exploraria para vazar dados de outra empresa?
2. Como causaria denial of service?
3. Como injetaria dados maliciosos?
4. Como bypassaria auth/permission?
5. Como corromperia auditoria?

Para cada vulnerabilidade encontrada, adicione defesa ao código.
```

### Padrão 4: Seniority Review

```
TASK: [tarefa]

Após gerar, compare com o que um engenheiro staff/principal faria diferente.

1. O código é simples demais? Falta abstração?
2. É complexo demais? Abstração desnecessária?
3. Está acoplado a detalhes que podem mudar?
4. Está testado de forma quebradiça (testes falham com refatoração menor)?
5. Documentação é suficiente para devs novos entenderem?

Ajuste baseado na reflexão.
```

## 16.3 Exemplo Prático

**Sem self-review:**
```
Dev: "Crie login endpoint"
IA: [gera código simples sem 2FA, sem rate limit, sem audit]
Dev: [usa código, tem problemas em produção]
```

**Com self-review:**
```
Dev: "Crie login endpoint. Faça self-review depois."

IA: [gera código simples]
IA: "Self-review:
1. Bug: não há rate limiting → brute force possível
2. Edge case: usuário com 2FA não tratado
3. Padrão: auditoria não registrou login
4. Produção: senhas em texto no log (security)
5. Melhoria: usar constant-time comparison

Corrigido:
[código com rate limit, 2FA, audit, secure logging]"
```

---

# Capítulo 17 — Prompt para Geração de Testes

## 17.1 Prompt Master para Testes

```
TASK: Gerar testes para [arquivo/módulo]

CONTEXTO:
- Framework: Vitest
- Padrão: AAA (Arrange, Act, Assert)
- Mocks: vitest-mock-extended para Prisma, Redis, etc.
- Cobertura alvo: 90% (core), 70% (demais)

ESTRATÉGIA:
1. Identifique funções públicas
2. Para cada função:
   a. Happy path (3+ cenários)
   b. Edge cases (null, undefined, empty, zero, negative, MAX_SAFE_INTEGER, special chars)
   c. Error cases (DomainError thrown with correct code/message/status)
3. Use table-driven tests para casos similares
4. Use property-based testing (fast-check) para invariantes matemáticos
5. Mock apenas dependências externas (Prisma, Redis), não lógica interna

PADRÃO DE TESTE:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceName } from './ServiceName';
import { prismaMock } from '@/test/mocks/prisma';
import { DomainError } from '@/shared/errors/DomainError';

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

describe('ServiceName', () => {
  beforeEach(() => vi.clearAllMocks());
  
  describe('methodName', () => {
    it('does X when Y', async () => {
      // Arrange
      const input = { ... };
      prismaMock.X.findFirst.mockResolvedValue({ ... });
      
      // Act
      const result = await ServiceName.methodName(input);
      
      // Assert
      expect(result).toEqual(expected);
      expect(prismaMock.X.findFirst).toHaveBeenCalledWith(expect.objectContaining({...}));
    });
    
    it.each([
      { scenario: 'null input', input: null, expectedError: 'INVALID_INPUT' },
      { scenario: 'empty string', input: '', expectedError: 'INVALID_INPUT' },
      { scenario: 'not found', input: 999, expectedError: 'NOT_FOUND' },
    ])('throws $expectedError when $scenario', async ({ input, expectedError }) => {
      await expect(ServiceName.methodName(input)).rejects.toMatchObject({
        code: expectedError,
      });
    });
  });
});
```

GERAR:
1. Arquivo de testes [Nome].test.ts
2. Casos de teste organizados por função
3. Mínimo 5 casos por função pública
4. Testes de integração se aplicável
5. Relatório de cobertura estimada

VALIDAÇÃO:
- Rode `pnpm test [arquivo]` para confirmar que passou
- Rode `pnpm test:coverage [arquivo]` para validar cobertura
```

## 17.2 Exemplo de Uso

```
TASK: Gerar testes para modules/goals/services/GoalCalculator.ts

[ia gera GoalCalculator.test.ts com 20+ casos cobrindo:]
- calculateProgress: happy, zero target, negative achieved, > 100% cap, NaN input
- calculateProjection: linear, weighted, with seasonality, insufficient data
- distributeEqually: 3 users, 1 user, 100 users, total = target
- distributeWeighted: weights sum 1, weights sum 0.5, weight 0
- calculateAchievement: above target, below, exactly, with bonuses

[ia também gera property-based tests:]
- distributeEqually: sum of distributed always equals target
- distributeWeighted: weighted distribution preserves proportions
- calculateProgress: always between 0 and 100
```

## 17.3 Anti-patterns em Testes

```
❌ Teste que não valida nada:
expect(result).toBeTruthy();  // vago

✅ Teste específico:
expect(result.id).toBe(42);
expect(result.status).toBe('active');

❌ Teste que depende de ordem:
let sharedState;
it('test 1', () => { sharedState = createThing(); });
it('test 2', () => { use(sharedState); });  // falha se rodar antes

✅ Teste isolado:
it('test 2', () => {
  const thing = createThing();
  use(thing);
});

❌ Mock excessivo:
vi.mock('fs'); vi.mock('path'); vi.mock('console');
// Teste não testa nada real

✅ Mock mínimo:
vi.mock('@/lib/prisma');  // apenas dependências externas
```

---

# Capítulo 18 — Prompt para Documentação Automática

## 18.1 Prompt para JSDoc

```
TASK: Adicionar JSDoc a todas as funções públicas de [arquivo]

PADRÃO:
/**
 * Descrição concisa do que a função faz.
 * 
 * @param paramName - Descrição do parâmetro (tipo inferido do TS)
 * @returns Descrição do retorno
 * @throws {DomainError} Quando [condição]
 * 
 * @example
 * ```ts
 * const result = functionName({ id: 1, name: 'Test' });
 * // result: { id: 1, name: 'Test', createdAt: Date }
 * ```
 * 
 * @see [outros nomes de função relacionados]
 * @since 1.0.0
 */
export function functionName(input: InputType): ReturnType { ... }

REGRAS:
- Descrição começa com verbo no infinitivo
- @param para cada parâmetro (mesmo óbvios)
- @returns sempre (mesmo void)
- @throws para erros esperados
- @example com caso realista
- @since para versionamento semântico
- Não documentar funções privadas (prefix _)
- Não documentar getters/setters triviais

GERAR: Arquivo com JSDoc em todas as funções públicas.
```

## 18.2 Prompt para README de Módulo

```
TASK: Criar README.md para o módulo [nome]

ESTRUTURA:
```markdown
# Módulo [Nome]

## Visão Geral
[1-2 parágrafos explicando o que o módulo faz e por que existe]

## Estrutura
```
modules/[nome]/
├── components/     # Componentes React
├── hooks/          # Hooks customizados
├── services/       # Lógica de domínio
├── repositories/   # Acesso a dados
├── dto/            # Schemas Zod
├── types/          # Tipos TypeScript
├── utils/          # Utilidades
└── tests/          # Testes
```

## Como Usar

### Endpoint principal
```bash
POST /api/v1/[nome]
GET /api/v1/[nome]?page=1&limit=20
GET /api/v1/[nome]/:id
PUT /api/v1/[nome]/:id
DELETE /api/v1/[nome]/:id
```

### Exemplo de uso (Service)
```typescript
import { [Nome]Service } from '@/modules/[nome]/services/[Nome]Service';

const result = await [Nome]Service.create({
  field1: 'value',
  field2: 42,
});
```

### Exemplo de uso (Hook React)
```tsx
import { use[Nomes] } from '@/modules/[nome]/hooks/use[Nomes]';

function MyComponent() {
  const { data, isLoading } = use[Nomes]();
  if (isLoading) return <Skeleton />;
  return <[Nome]List items={data} />;
}
```

## Permissões
| Ação | Permissão |
|------|-----------|
| Criar | [nome].create |
| Listar | [nome].read |
| Atualizar | [nome].update |
| Deletar | [nome].delete |

## Eventos
- `[nome].created` — emitido após criação
- `[nome].updated` — emitido após atualização
- `[nome].deleted` — emitido após soft delete

## Dependências
- Módulo Auth (para requireAuth)
- Módulo Audit (para audit.record)
- Prisma (tabela [nome])

## Como Testar
```bash
pnpm test modules/[nome]
pnpm test:coverage modules/[nome]
```

## Considerações Técnicas
- Multi-tenant: todas queries filtram por companyId
- Soft delete: registros marcados com deleted_at
- Auditoria: todas mutations logadas
- Cache: [explicar estratégia se houver]

## ADRs Relacionados
- [ADR-XXX: Nome](../../docs/decisions/adr-XXX.md)
```

GERAR: README.md completo para o módulo.
```

## 18.3 Prompt para ADR (Architecture Decision Record)

```
TASK: Criar ADR para [decisão]

ESTRUTURA (formato MADR):
```markdown
# ADR-XXX: [Título da Decisão]

- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-YYY
- **Date:** YYYY-MM-DD
- **Deciders:** [nomes]
- **Tags:** [architecture, security, performance, etc.]

## Context and Problem Statement
[Descreva o contexto e o problema que precisa ser resolvido. Por que precisamos decidir?]

## Decision Drivers
- [Driver 1: ex. performance]
- [Driver 2: ex. security]
- [Driver 3: ex. maintainability]

## Considered Options
1. [Opção 1]
2. [Opção 2]
3. [Opção 3]

## Decision Outcome
**Chosen option:** [Opção X], because [justificativa].

### Consequences
- **Positive:** [benefícios]
- **Negative:** [trade-offs]
- **Risks:** [riscos e mitigação]

## Pros and Cons of the Options

### [Opção 1]
- ✅ [pró]
- ✅ [pró]
- ❌ [contra]
- ❌ [contra]

### [Opção 2]
- ✅ [pró]
- ❌ [contra]

## Validation
[Como validar que a decisão foi correta? Métricas, observabilidade, etc.]

## More Information
[Links para docs relacionados, discussões, etc.]
```

GERAR: ADR completo seguindo a estrutura acima.
```

---

# Capítulo 19 — Prompt para Code Review

## 19.1 Prompt para Review de PR

```
TASK: Fazer code review do PR #[N]

CONTEXTO: Siga as guidelines de code review do Documento 15 (Capítulo 8).

ARQUIVOS DO PR:
[cole diff ou liste arquivos modificados]

CHECKLIST DE REVIEW:

### 1. Funcionalidade (5min)
□ Resolve o problema proposto?
□ Edge cases considerados (null, empty, negative, MAX)?
□ Comportamento em erro é apropriado?
□ Testes cobrem caminho feliz + erros + edge cases?
□ Performance foi considerada (N+1, loops)?

### 2. Arquitetura (3min)
□ Mudança está no módulo correto?
□ Não introduz dependência circular?
□ Respeita camadas (component → hook → service → repository)?
□ Não duplica lógica existente?

### 3. Código (5min)
□ Nomes claros e descritivos?
□ Funções curtas (<50 linhas)?
□ Sem magic numbers?
□ Sem comentários óbvios?

### 4. TypeScript (3min)
□ Sem `any`?
□ Retornos de funções tipados?
□ Sem `as` sem type guard?
□ `interface` para objetos, `type` para unions?

### 5. Segurança (5min)
□ Input validado com Zod?
□ Queries têm companyId do JWT?
□ Senhas/tokens não logados?
□ Sem SQL injection?
□ Sem XSS?
□ Secrets em variáveis de ambiente?

### 6. Performance (3min)
□ Sem N+1?
□ Paginação em listagens?
□ Cache onde apropriado?
□ Índices para novas queries?

### 7. Manutenibilidade (2min)
□ Documentação atualizada (JSDoc)?
□ ADR criada se arquitetura mudou?
□ Breaking changes comunicadas?

### 8. Testes (3min)
□ Novas funcionalidades têm testes?
□ Bugs corrigidos têm teste de regressão?
□ Testes não flaky?
□ Cobertura não diminuiu?

OUTPUT:
- Lista de comentários com severidade:
  🔴 Bloqueador (PR não pode mergear)
  🟠 Must fix (deve corrigir antes)
  🟡 Should fix (recomendado)
  🟢 Nice to have (sugestão)
  🔵 Praise (reconhecimento)
- Veredito: Approve / Request changes / Reject
- Resumo executivo (3-5 bullets)
```

## 19.2 Exemplo de Aplicação

```
TASK: Review do PR #123 que adiciona endpoint POST /api/v1/goals/batch

DIFF:
+ export async function POST(req: NextRequest) {
+   const body = await req.json();
+   const goals = await prisma.goal.createMany({ data: body.goals });
+   return NextResponse.json(goals);
+ }

REVIEW:

🔴 Bloqueador:
1. **Sem autenticação:** endpoint não chama `requireAuth(req)`. Qualquer um pode criar metas.
2. **Sem validação:** `body.goals` não validado com Zod. Pode receber dados maliciosos.
3. **Sem company_id:** `createMany` não filtra por tenant. Vaza dados entre empresas.
4. **Sem auditoria:** mutations não logadas.
5. **Sem soft delete check:** pode duplicar metas existentes.

🟠 Must fix:
1. **Rate limiting:** endpoint em lote pode ser abusado. Adicione rate limit (5/min/empresa).
2. **Limite de itens:** `body.goals` pode ter 10000 itens. Limite a 100 por request.
3. **Transaction:** use `prisma.$transaction` para atomicidade (ou rollback parcial).
4. **Partial failure:** se 1 item falhar, todos falham? Defina comportamento.

🟡 Should fix:
1. **Preview endpoint:** adicione POST /api/v1/goals/batch/preview para validação prévia.
2. **Background job:** para > 50 items, processe em background (BullMQ).
3. **Response format:** retorne `{ created: 50, failed: 0, errors: [] }` em vez de array bruto.

🟢 Nice to have:
1. **Idempotency:** suporte a header `Idempotency-Key` para evitar duplicação.
2. **CSV import:** além de JSON, suporte CSV via multipart.

🔵 Praise:
1. Bom uso de `createMany` (eficiente vs loop de `create`).

VEREDITO: **Request changes** (5 bloqueadores devem ser corrigidos)

RESUMO:
- Endpoint tem 5 vulnerabilidades críticas (auth, validation, tenant, audit, soft delete)
- Adicione rate limiting e limite de itens
- Considere background job para lotes grandes
- Após correções, re-submit para review
```

---

# Capítulo 20 — Checklist Antes de Submeter Código

```
□ Rodou `pnpm lint` sem warnings?
□ Rodou `pnpm typecheck` sem erros?
□ Rodou `pnpm test` com 100% passando?
□ Cobertura não diminuiu?
□ Adicionou testes para nova lógica?
□ Documentação atualizada (JSDoc em funções públicas)?
□ Commits seguem Conventional Commits?
□ PR template preenchido?
□ Screenshots/anexos se UI mudou?
□ Performance não degradou (verificou bundle size)?
□ Sem secrets no código (.env apenas)?
□ Multi-tenant validado (testou cross-company)?
□ Auditoria implementada em mutations?
□ Soft delete usado (não DELETE físico)?
□ Zod validation em todo input de API?
□ Error handling com DomainError?
□ data-testid adicionado para E2E?
□ Acessibilidade verificada (axe-core)?
□ IA generated code foi revisado por humano?
□ Self-review foi aplicado?
```

---

# Capítulo 21 — Prompts Específicos Adicionais

## 21.1 Migração de Banco

```
TASK: Criar migration para adicionar coluna `priority` à tabela `goals`

PASSOS:
1. Criar migration: pnpm prisma migrate dev --name add_priority_to_goals
2. Atualizar schema.prisma com campo priority
3. Atualizar tipo Goal
4. Atualizar DTO (Zod) para incluir priority
5. Atualizar service para lidar com priority
6. Atualizar UI para mostrar/editar priority
7. Atualizar testes

REGRAS:
- Migration deve ser reversível (down migration)
- Default value: 'normal' (não quebrar dados existentes)
- Índice se for usado em queries frequentes
- Atualizar seed se necessário

GERAR:
1. prisma/migrations/[timestamp]_add_priority_to_goals/migration.sql
2. Atualização em prisma/schema.prisma
3. Atualizações em código
```

## 21.2 Adicionar Integração Externa

```
TASK: Integrar com WhatsApp Business API para envio de notificações

CONTEXTO:
- Usar WhatsApp Cloud API (Meta)
- Plugin de notificação WhatsApp no marketplace

REGRAS:
- OAuth2 para conectar conta WhatsApp
- Template messages (pré-aprovadas pela Meta)
- Rate limit: 1000 msg/min
- Logs em webhook_deliveries (com status)
- Fallback para SMS se WhatsApp falhar

GERAR:
1. modules/integrations/whatsapp/ (novo módulo)
2. WhatsAppService.ts
3. OAuth2 flow para conectar
4. Webhook para receber status de entrega
5. Templates (Handlebars)
6. Testes com Wiremock
```

## 21.3 Implementar Cache Strategy

```
TASK: Implementar cache para endpoint GET /api/v1/dashboard

CONTEXTO:
- Dashboard agrega dados de 5 módulos
- Cache por company_id + user_id
- TTL: 60s
- Invalidation: quando resultado é lançado

REGRAS:
- Cache-aside pattern
- Stale-while-revalidate
- Cache hit log para métricas
- Graceful degradation se Redis cair

GERAR:
1. shared/cache/DashboardCache.ts
2. Atualizar DashboardService para usar cache
3. EventBus listener para invalidação
4. Métricas (hit rate, miss rate, latency)
5. Testes com Redis mock
```

## 21.4 Refatoração para Microsserviço

```
TASK: Extrair módulo IA para microsserviço separado

CONTEXTO:
- Atualmente em modules/ai/ no monolito Next.js
- Motivo: escalar IA independentemente, custo OpenAI isolado

REGRAS:
- Strangler fig pattern (degradar gradualmente monolito)
- API gateway no monolito redireciona para MS
- Auth compartilhada (JWT mesmo secret)
- Comunicação via HTTP + eventos (Redis pub/sub)
- Database separada para IA (postgres novo schema ou db)

GERAR:
1. Novo repositório orion-ai-service
2. Dockerfile + docker-compose
3. API endpoints (mesma interface do monolito)
4. Migration de dados (se necessário)
5. Plano de rollout (canary, full migration)
6. ADR documentando decisão
```

---

# Capítulo 22 — Contato e Suporte

Para dúvidas sobre padrões não cobertos aqui:
1. Consulte a documentação completa em `/docs` (Documentos 01-17)
2. Verifique ADRs em `/docs/decisions`
3. Pergunte no Slack #orion-dev
4. Último recurso: agende com arquiteto de software

**Lembre-se:** Qualquer desvio dos padrões aqui descritos deve ser justificado em ADR e aprovado por 2 arquitetos.

**Para IA:** Se você é uma IA lendo este documento, siga as regras abaixo:

```
EU SOU UMA IA DE DESENVOLVIMENTO. COMPROMETO-ME A:

1. Seguir TODOS os padrões deste Master Prompt
2. NUNCA usar `any`, NUNCA fazer DELETE físico, NUNCA pular validação
3. Sempre incluir company_id em queries Prisma
4. Sempre adicionar auditoria em mutations
5. Sempre adicionar tratamento de erro com DomainError
6. Sempre sugerir testes após gerar código
7. Sempre fazer self-review antes de apresentar solução final
8. Avisar quando não tenho certeza ou quando contexto é insuficiente
9. Sugerir ADR quando arquitetura mudar
10. Lembrar que código será revisado por humano — ser transparente sobre incertezas
```

---

# Capítulo 23 — Apêndice A — Templates Rápidos

## A.1 Prompt Rápido: Criar Service

```
Crie [Nome]Service no módulo [modulo] seguindo o padrão:

1. Validação de domínio (entidades relacionadas existem e estão ativas)
2. Verificação de licença
3. Transaction com auditoria
4. Evento emitido

Entidade: [Nome]
Campos: [lista]
Permissões: [modulo].create, [modulo].read, [modulo].update, [modulo].delete
```

## A.2 Prompt Rápido: Criar Componente

```
Crie componente [Nome]Component seguindo padrão shadcn/ui:

Props: [lista]
Variantes: [lista]
Estados: default, hover, focus, disabled, loading
Data-testid: [nome-kebab-case]
Acessível: aria-* quando necessário
```

## A.3 Prompt Rápido: Criar Hook

```
Crie hook use[Nome] usando React Query:

Query key: ['[nome]', filters]
QueryFn: chama [Nome]Service.list
StaleTime: 60s
Enabled: baseado em [condição]
Retry: 3x (não retry em 404)
```

## A.4 Prompt Rápido: Criar Teste

```
Crie testes para [Nome]Service:

Framework: Vitest
Padrão: AAA
Mocks: Prisma, Audit, EventBus
Casos: happy (3), edge (5), error (3)
Table-driven para casos similares
```

---

# Capítulo 24 — Apêndice B — Glossário de Termos

| Termo | Significado |
|-------|-------------|
| Master Prompt | Documento consolidado de instruções para IA |
| Context Window | Limite de tokens que IA consegue processar |
| Chain of Thought | Técnica de fazer IA explicar raciocínio |
| Few-shot | Fornecer exemplos no prompt |
| Zero-shot | Pedir sem exemplos |
| Self-review | IA crítica próprio código |
| Anti-pattern | Padrão a evitar |
| Type guard | Função que valida tipo em runtime |
| Brand type | Tipo com marca para distinguir |
| Soft delete | Marcar como deletado sem remover |
| Multi-tenant | Múltiplos clientes em mesma instância |
| Optimistic lock | Controle de concorrência via version |
| Event sourcing | Padrão de armazenar eventos em vez de estado |
| CQRS | Separar commands de queries |
| DDD | Domain-Driven Design |
| Bounded Context | Fronteira de domínio |
| Aggregate Root | Raiz de agregado |
| ADR | Architecture Decision Record |
| DoD | Definition of Done |
| RICE | Reach, Impact, Confidence, Effort |
| MoSCoW | Must, Should, Could, Won't |
| Kano | Modelo de classificação de necessidades |

---

# Capítulo 25 — Apêndice C — Erros Comuns de IA e Como Evitar

## C.1 Alucinação de APIs

**Problema:** IA sugere APIs que não existem.

```typescript
// IA sugeriu (NÃO EXISTE):
const result = await prisma.goal.findManyWithCache({ ... });

// Realidade do Prisma:
const result = await prisma.goal.findMany({ ... });
// Cache deve ser implementado manualmente
```

**Como evitar:**
- Validar APIs com documentação oficial
- Pedir à IA para citar fonte da API
- Testar código gerado

## C.2 Tipos Incorretos

**Problema:** IA assume tipos errados.

```typescript
// IA assumiu:
const id: number = req.body.id;
// Mas id vem como string do body

// Correto:
const id: number = Number(req.body.id);
// Ou melhor: usar Zod que converte
```

## C.3 Esquecimento de Padrões

**Problema:** IA esquece padrões após algumas iterações.

```typescript
// IA começa bem:
const goal = await GoalService.create({ ...input, companyId: user.companyId });

// Após 5 iterações, esquece:
const goal = await GoalService.create({ ...input });  // sem companyId!
```

**Como evitar:**
- Relembre padrões periodicamente
- Use system prompt persistente
- Valide cada output contra checklist

## C.4 Over-engineering

**Problema:** IA adiciona abstrações desnecessárias.

```typescript
// IA criou:
interface IGoalRepository { ... }
class GoalRepository implements IGoalRepository { ... }
class GoalRepositoryMock implements IGoalRepository { ... }
class GoalRepositoryFactory { create(): IGoalRepository { ... } }
// Para um CRUD simples!

// Suficiente:
class GoalRepository { ... }
// Mock com vitest-mock-extended
```

## C.5 Sub-engineering

**Problema:** IA simplifica demais e pula importante.

```typescript
// IA fez:
async function createGoal(input) {
  return prisma.goal.create({ data: input });
}
// Faltou: validação, auth, audit, multi-tenant, error handling
```

**Como evitar:** sempre especificar requisitos completos no prompt.

---

# Conclusão

Este Master Prompt é um documento **vivo**. Toda nova tarefa recorrente deve ter seu prompt template adicionado aqui. Toda nova IA (ferramenta) deve ter seu template específico.

**Princípios fundamentais para uso de IA no desenvolvimento:**

1. **IA é assistente, não substituto** — humano é responsável final
2. **Contexto é rei** — invista tempo em dar contexto bom
3. **Validação é obrigatória** — nunca aceite cegamente
4. **Padrões são inegociáveis** — IA deve seguir padrões do projeto
5. **Iteração é normal** — raramente primeira resposta é perfeita
6. **Documente decisões** — ADRs para mudanças arquiteturais
7. **Teste sempre** — cobertura não pode diminuir
8. **Compartilhe aprendizados** — prompts bons devem ser documentados

**Lembre-se:** Este Master Prompt deve ser suficiente para qualquer IA de desenvolvimento começar a contribuir com o Projeto Orion de forma alinhada aos padrões. Para detalhes completos, consulte os Documentos 01 a 17 do Dossiê Master.

---

## Fim do Master Prompt

Este prompt deve ser suficiente para qualquer IA de desenvolvimento começar a contribuir com o Projeto Orion de forma alinhada aos padrões. Para detalhes completos, consulte os Documentos 01 a 17 do Dossiê Master.

**Última atualização:** Versão 1.0
**Próxima revisão:** A cada release maior (v1.1, v2.0, etc.)
