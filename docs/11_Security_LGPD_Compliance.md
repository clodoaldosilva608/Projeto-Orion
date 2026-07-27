# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 11

# SECURITY & LGPD COMPLIANCE

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Segurança e Conformidade LGPD
**Classificação:** Confidencial — Uso Interno
**Última revisão:** 2025-01-15

---

## Sumário

1. Objetivo e Escopo
2. Princípios de Segurança e Modelo de Ameaças
3. Autenticação — Política de Senhas Completa
4. JWT — Estrutura, Claims, Rotação, Blacklisting
5. 2FA — Implementação TOTP, Backup Codes, Recuperação
6. OAuth 2.0 / OIDC — Google e Microsoft
7. Autorização (RBAC) — Matriz Completa de Permissões
8. Criptografia — AES-256, TLS 1.3, Key Rotation
9. Controles OWASP Top 10 (com implementação)
10. Headers de Segurança, CSP, CORS
11. Rate Limiting e Proteção contra Abuso
12. Segurança Multi-tenant (RLS)
13. LGPD — Direitos do Titular (18 direitos)
14. DPIA — Data Protection Impact Assessment
15. Auditoria e Logs
16. Incident Response Playbook
17. Pen Test Checklist
18. Preparação SOC 2 / ISO 27001
19. Backup e Disaster Recovery
20. Segurança Física, Operacional e Suply Chain
21. Apêndices

---

# Capítulo 1 — Objetivo e Escopo

Este documento define a estratégia completa de segurança do Projeto Orion, plataforma SaaS multi-tenant de gestão comercial. Cobre autenticação, autorização, criptografia, proteção contra ataques OWASP, conformidade com a LGPD (Lei 13.709/2018), auditoria, resposta a incidentes, pen testing e preparação para certificações SOC 2 e ISO 27001.

## 1.1 Escopo Técnico

| Camada | Cobertura |
|---|---|
| Aplicação (Next.js, API REST/GraphQL) | Capítulos 3-11 |
| Banco de dados (PostgreSQL 16) | Capítulos 8, 12 |
| Infraestrutura cloud (AWS/GCP) | Capítulos 8, 16, 19 |
| Desktop (Electron) | Capítulo 20 |
| Mobile (PWA / React Native v2) | Capítulos 5, 6 |
| Integrações (webhooks, APIs externas) | Capítulos 8, 10 |
| IA (LLM gateway) | Capítulo 8, 11 |

## 1.2 Stakeholders

- **DPO (Encarregado de Dados):** responsável legal pela LGPD
- **CISO:** responsável técnico por segurança
- **Engineering Lead:** implementa controles
- **DevOps/SRE:** opera e monitora
- **Legal/Compliance:** revisa políticas
- **Auditor externo:** valida controles (SOC 2 / ISO)

## 1.3 Ciclo de Vida do Documento

- Revisão semestral obrigatória
- Revisão imediata após incidentes críticos
- Versionamento semântico (MAJOR.MINOR.PATCH)
- Aprovação tripartite: CISO + DPO + Engineering Lead

---

# Capítulo 2 — Princípios de Segurança e Modelo de Ameaças

## 2.1 Princípios Fundamentais

### 2.1.1 Defesa em Profundidade
Múltiplas camadas de proteção: rede (WAF, firewall), aplicação (validação, authz), banco (RLS, TDE), dados (criptografia aplicação). Falha de uma camada não compromete o sistema.

### 2.1.2 Menor Privilégio
Cada usuário, serviço e processo tem apenas os privilégios mínimos necessários. Aplicado a:
- Usuários finais (RBAC granular)
- Serviços backend (service accounts com escopo restrito)
- Acesso a produção (just-in-time, time-boxed)
- Banco de dados (roles PostgreSQL separadas por função: `app_read`, `app_write`, `migration`)

### 2.1.3 Fail-Safe Defaults
Em caso de falha, o sistema nega acesso (default deny). Exemplos:
- Token expirado → 401 (não renova automaticamente)
- Erro ao validar permissão → 403 (não permite)
- RLS falha ao setar `company_id` → query retorna vazio

### 2.1.4 Segurança por Design
Segurança é considerada desde o design (threat modeling em cada RFC), nunca adicionada depois. Toda feature nova passa por:
1. Threat model (STRIDE)
2. Revisão de security champion
3. Testes de segurança automatizados (SAST, DAST, SCA)
4. Pen test antes de go-live (para features críticas)

### 2.1.5 Auditoria Completa
Toda ação sensível é registrada e auditável (imutável, com hash encadeado para detecção de tampering).

### 2.1.6 Zero Trust
Nunca confiar, sempre verificar. Mesmo dentro da VPC, comunicação é mTLS. Tokens JWT validados em cada hop.

### 2.1.7 Privacy by Design
Minimização de dados coletados, propósito explícito, retenção limitada, transparência.

## 2.2 Modelo de Ameaças (STRIDE)

| Ameaça | Categoria | Controle Primário |
|---|---|---|
| Atacante externo rouba credenciais por phishing | Spoofing | 2FA obrigatório para admins, FIDO2 opcional |
| Atacante explora SQL injection | Tampering | Prisma ORM parametrizado, SAST em CI |
| Vendedor acessa dados de outra empresa | Info Disclosure | RLS + validação aplicação |
| Funcionário mal-intencionado vende base | Info Disclosure | Just-in-time prod access, DLP, audit logs imutáveis |
| Token JWT roubado e reusado | Spoofing | Rotação de refresh token, short-lived access tokens |
| Atacante DDoS API | DoS | Cloudflare/WAF, rate limit, autoscale |
| Supply chain: dependência maliciosa | Elevation of Privilege | Dependabot, npm audit, SBOM, Sigstore |
| LLM vaza dados via prompt injection | Info Disclosure | Guardrails, PII filter, sandbox de tool calling |
| Insider altera logs de auditoria | Tampering | Append-only com hash chain, WORM storage |

---

# Capítulo 3 — Autenticação — Política de Senhas Completa

## 3.1 Política de Senhas

### 3.1.1 Requisitos Mínimos (NIST SP 800-63B alinhado)

| Requisito | Valor | Justificativa |
|---|---|---|
| Comprimento mínimo | 12 caracteres | NIST recomenda ≥8, adotamos 12 para sensibilidade financeira |
| Comprimento máximo | 128 caracteres | Evita DoS em bcrypt |
| Maiúsculas | ≥1 | Complexidade |
| Minúsculas | ≥1 | Complexidade |
| Dígitos | ≥1 | Complexidade |
| Especiais | ≥1 de `!@#$%^&*()-_=+[]{};:,.?` | Complexidade |
| Unicode | Permitido (emojis, acentos) | Conformidade NIST |
| Senhas vazadas | Bloqueadas (HIBP API + lista local 10k) | Prevenção credential stuffing |
| Histórico | Últimas 5 não podem repetir | Prevenção reuso |
| Senha = email/username | Bloqueado | Senhas triviais |
| Sequências | `1234`, `abcd`, `qwerty` bloqueadas | Senhas fracas |
| Repetição de caractere | ≥4 iguais consecutivos bloqueado | Ex: `aaaa1234` |

### 3.1.2 Implementação — Validação com Zod

```typescript
// src/lib/auth/password-policy.ts
import { z } from 'zod';
import { isPasswordPwned } from './hibp';
import { getUserPasswordHistory } from './password-history';

const SEQUENCES = ['1234', '2345', '3456', '4567', '5678', '6789',
                   'abcd', 'bcde', 'cdef', 'qwerty', 'asdf', 'zxcv'];
const SPECIALS = '!@#$%^&*()-_=+[]{};:,.?';

export const passwordSchema = z.string()
  .min(12, 'Senha deve ter no mínimo 12 caracteres')
  .max(128, 'Senha deve ter no máximo 128 caracteres')
  .refine(p => /[A-Z]/.test(p), 'Senha deve conter ao menos 1 maiúscula')
  .refine(p => /[a-z]/.test(p), 'Senha deve conter ao menos 1 minúscula')
  .refine(p => /[0-9]/.test(p), 'Senha deve conter ao menos 1 dígito')
  .refine(p => new RegExp(`[${escapeRegExp(SPECIALS)}]`).test(p),
          `Senha deve conter ao menos 1 especial: ${SPECIALS}`)
  .refine(p => !/(.)\1{3,}/.test(p),
          'Senha não pode ter 4+ caracteres repetidos consecutivos')
  .refine(p => !SEQUENCES.some(s => p.toLowerCase().includes(s)),
          'Senha contém sequência comum');

export async function validatePassword(
  password: string,
  context: { userId?: number; email: string; username: string }
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // 1. Schema validation
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    errors.push(...parsed.error.issues.map(i => i.message));
  }

  // 2. Não pode ser igual a email ou username
  if (password.toLowerCase().includes(context.email.toLowerCase()) ||
      password.toLowerCase().includes(context.username.toLowerCase())) {
    errors.push('Senha não pode conter email ou usuário');
  }

  // 3. Verificar contra HIBP (Have I Been Pwned)
  if (await isPasswordPwned(password)) {
    errors.push('Senha encontrada em vazamentos conhecidos. Escolha outra.');
  }

  // 4. Histórico (apenas em troca, não em criação)
  if (context.userId) {
    const history = await getUserPasswordHistory(context.userId, 5);
    for (const oldHash of history) {
      if (await bcrypt.compare(password, oldHash)) {
        errors.push('Senha igual a uma das últimas 5. Escolha outra.');
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

### 3.1.3 Implementação — HIBP (k-anonymity)

```typescript
// src/lib/auth/hibp.ts
import crypto from 'crypto';

export async function isPasswordPwned(password: string): Promise<boolean> {
  const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'User-Agent': 'Orion-Security/1.0' },
  });
  if (!response.ok) return false; // fail-open em indisponibilidade

  const text = await response.text();
  const lines = text.split('\n');
  for (const line of lines) {
    const [s, count] = line.trim().split(':');
    if (s === suffix && parseInt(count) > 0) return true;
  }
  return false;
}
```

### 3.1.4 Armazenamento — bcrypt

- Algoritmo: **bcrypt** (Blowfish-based)
- Cost factor: **12** (~250ms por hash em hardware moderno; ajustado anualmente)
- Salt: único por senha, embutido no hash bcrypt
- Jamais armazenar em texto, MD5, SHA1, SHA256 puro (sem salt) ou PBKDF2 com < 600k iterações

```typescript
import bcrypt from 'bcrypt';

const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // Constant-time comparison interna do bcrypt
  return bcrypt.compare(plain, hash);
}
```

### 3.1.5 Migração de Hash (Argon2id futuro)

Planejado para v2.0: troca para **Argon2id** (vencedor Password Hashing Competition), mantendo bcrypt legacy via re-hash on login:

```typescript
export async function verifyAndUpgrade(plain: string, stored: string): Promise<boolean> {
  if (stored.startsWith('$argon2id$')) {
    return argon2verify(stored, plain);
  }
  if (stored.startsWith('$2')) {
    const ok = await bcrypt.compare(plain, stored);
    if (ok) {
      const newHash = await argon2id(plain);
      await updateUserHash(userId, newHash); // upgrade transparente
    }
    return ok;
  }
  return false;
}
```

### 3.1.6 Reset de Senha

| Atributo | Valor |
|---|---|
| Token | 32 bytes aleatórios (base64url) |
| Hashing armazenado | SHA-256 com pepper |
| Validade | 1 hora |
| Uso | Único (invalidado após uso) |
| Requer | E-mail confirmado OU pergunta de segurança (legacy) |
| Notificação | Email ao titular após reset |

```typescript
export async function generateResetToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  const pepper = process.env.TOKEN_PEPPER!;
  const hash = crypto.createHmac('sha256', pepper).update(token).digest('hex');

  await db.passwordReset.upsert({
    where: { userId },
    create: { userId, tokenHash: hash, expiresAt: addHours(new Date(), 1) },
    update: { tokenHash: hash, expiresAt: addHours(new Date(), 1), usedAt: null },
  });

  await sendEmail({
    to: user.email,
    template: 'password-reset',
    context: { resetUrl: `https://app.orion.com/reset?token=${token}` },
  });
  return token; // só para testes; em prod não retorna
}

export async function consumeResetToken(token: string, newPassword: string) {
  const hash = hashToken(token);
  const reset = await db.passwordReset.findFirst({
    where: { tokenHash: hash, usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!reset) throw new InvalidTokenError();

  const { valid, errors } = await validatePassword(newPassword, { email: user.email, username: user.username });
  if (!valid) throw new PasswordPolicyError(errors);

  await db.$transaction([
    db.user.update({ where: { id: reset.userId }, data: { password: await hashPassword(newPassword) } }),
    db.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    db.passwordHistory.create({ data: { userId: reset.userId, hash: stored } }),
    // Revoga todas as sessões ativas
    db.session.deleteMany({ where: { userId: reset.userId } }),
    db.refreshToken.deleteMany({ where: { userId: reset.userId } }),
  ]);

  await sendEmail({ to: user.email, template: 'password-changed' });
  await audit.log({ action: 'password.reset', userId: reset.userId });
}
```

### 3.1.7 Expiração de Senha

- Administradores: **90 dias**
- Demais usuários: **180 dias** (opcional, recomendado)
- Notificação: 14, 7, 3, 1 dias antes
- Bloqueio pós-expiração: usuário deve fazer reset antes de continuar

### 3.1.8 Bloqueio de Conta

| Trigger | Ação |
|---|---|
| 5 tentativas inválidas consecutivas | Bloqueio 15 min |
| 10 tentativas inválidas em 24h | Bloqueio 24h + notifica admin |
| 3 bloqueios em 7 dias | Exige reset de senha |
| 100 tentativas falhas por IP em 1h | IP ban (Cloudflare WAF) |
| Login de país não usual (geolocation IP) | Challenge 2FA mesmo se opcional |

Implementação com Redis (janela deslizante):

```typescript
// src/lib/auth/account-lockout.ts
const REDIS = redisClient();

export async function recordFailedAttempt(email: string, ip: string) {
  const emailKey = `lockout:email:${email}`;
  const ipKey = `lockout:ip:${ip}`;

  const pipeline = REDIS.multi();
  pipeline.incr(emailKey);
  pipeline.expire(emailKey, 24 * 3600); // 24h window
  pipeline.incr(ipKey);
  pipeline.expire(ipKey, 3600); // 1h window
  const [[, emailCount], _, [, ipCount]] = await pipeline.exec() as any;

  if (ipCount >= 100) {
    await blockIp(ip, 3600); // 1h no WAF
  }
  if (emailCount >= 10) {
    await lockAccount(email, 24 * 3600);
    await notifyAdmin('account.locked', { email, reason: '10 failed attempts/24h' });
  } else if (emailCount >= 5) {
    await lockAccount(email, 15 * 60);
  }
}

export async function isAccountLocked(email: string): Promise<{ locked: boolean; until?: Date }> {
  const ttl = await REDIS.ttl(`lockout:locked:${email}`);
  if (ttl > 0) return { locked: true, until: new Date(Date.now() + ttl * 1000) };
  return { locked: false };
}
```

---

# Capítulo 4 — JWT — Estrutura, Claims, Rotação, Blacklisting

## 4.1 Estrutura do Token

JWT é dividido em 3 partes separadas por `.`: `header.payload.signature`.

### 4.1.1 Header
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "orion-signing-key-2025-01"
}
```

### 4.1.2 Payload (Claims)

| Claim | Descrição | Exemplo |
|---|---|---|
| `iss` | Emissor | `https://api.orion.com` |
| `sub` | Subject (user ID) | `10` |
| `aud` | Audiência | `orion-app` |
| `exp` | Expiração (Unix ts) | `1692125100` |
| `nbf` | Not before | `1692124200` |
| `iat` | Emitido em | `1692124200` |
| `jti` | ID único do token (UUID v4) | `a1b2c3d4-...` |
| `email` | Email do usuário | `joao@empresa.com` |
| `companyId` | Tenant | `1` |
| `branchId` | Filial padrão | `1` |
| `role` | Cargo | `gerente` |
| `permissions` | Lista de permissões | `["goals.read","results.create"]` |
| `sessionId` | ID da sessão | `sess_abc123` |
| `2fa` | Se 2FA validado nesta sessão | `true` |
| `ver` | Versão do schema do token | `1` |

Exemplo completo:
```json
{
  "iss": "https://api.orion.com",
  "sub": 10,
  "aud": "orion-app",
  "iat": 1692124200,
  "exp": 1692125100,
  "nbf": 1692124200,
  "jti": "f4a7b8c9-1d2e-3f4a-5b6c-7d8e9f0a1b2c",
  "email": "joao@farmaciasaojoao.com.br",
  "companyId": 1,
  "branchId": 1,
  "role": "gerente",
  "permissions": ["goals.read","goals.create","results.read","results.create","results.approve"],
  "sessionId": "sess_8f7e6d5c4b3a",
  "2fa": true,
  "ver": 1
}
```

### 4.1.3 Signature
```
RS256: base64url(header) + "." + base64url(payload), assinado com RSA-PSS private key (2048-bit mínimo, recomendado 3072)
```

## 4.2 Configuração

| Parâmetro | Access Token | Refresh Token |
|---|---|---|
| Validade | 15 minutos | 7 dias |
| Algoritmo | RS256 | RS256 |
| Rotação | N/A | A cada uso (novo + revoga anterior) |
| Storage (web) | Memória + httpOnly cookie SameSite=Strict | httpOnly cookie Secure SameSite=Strict |
| Storage (mobile) | iOS Keychain / Android Keystore | Mesmo |
| Revogação | Blacklist Redis (jti) | Whitelist Redis |

## 4.3 Rotação de Refresh Token

Toda vez que um access token expira, o cliente envia o refresh token para `/auth/refresh`. O servidor:
1. Valida assinatura e expiração
2. Verifica se está na whitelist Redis (`refresh:{jti}` existe)
3. Verifica se NÃO está na blacklist (`revoked:{jti}` não existe)
4. Emite novo access token + novo refresh token
5. Revoga o refresh token antigo (adiciona à blacklist com TTL = expiração original)
6. Adiciona novo refresh token à whitelist
7. Detecta reuso: se `refresh:{jti}` foi revogado mas ainda aparece na blacklist, significa que um atacante está reusando → revoga TODA a família de tokens (todos os refresh tokens da mesma sessão)

```typescript
// src/lib/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const PRIVATE_KEY = await loadKeyFromKMS('jwt-signing-private');
const PUBLIC_KEY = await loadKeyFromKMS('jwt-signing-public');

export async function issueTokens(user: AuthenticatedUser, session: Session) {
  const accessJti = randomUUID();
  const refreshJti = randomUUID();
  const now = Math.floor(Date.now() / 1000);

  const accessToken = jwt.sign({
    iss: 'https://api.orion.com',
    sub: user.id,
    aud: 'orion-app',
    iat: now, exp: now + 900, nbf: now,
    jti: accessJti,
    email: user.email,
    companyId: user.companyId,
    branchId: user.branchId,
    role: user.role,
    permissions: user.permissions,
    sessionId: session.id,
    '2fa': session.twoFactorVerified,
    ver: 1,
  }, PRIVATE_KEY, { algorithm: 'RS256', keyid: 'orion-2025-01' });

  const refreshToken = jwt.sign({
    iss: 'https://api.orion.com',
    sub: user.id,
    aud: 'orion-app',
    iat: now, exp: now + 7 * 86400,
    jti: refreshJti,
    sessionId: session.id,
    family: session.familyId, // para detectar reuso
    type: 'refresh',
  }, PRIVATE_KEY, { algorithm: 'RS256', keyid: 'orion-2025-01' });

  // Whitelist do refresh
  await REDIS.set(`refresh:${refreshJti}`, JSON.stringify({ userId: user.id, sessionId: session.id }),
                  'EX', 7 * 86400);

  return { accessToken, refreshToken, accessJti, refreshJti };
}

export async function rotateRefreshToken(oldRefreshToken: string) {
  let payload: any;
  try {
    payload = jwt.verify(oldRefreshToken, PUBLIC_KEY, { algorithms: ['RS256'] });
  } catch (e) {
    throw new InvalidTokenError();
  }
  if (payload.type !== 'refresh') throw new InvalidTokenError();

  const exists = await REDIS.get(`refresh:${payload.jti}`);
  if (!exists) {
    // Reuso detectado! Revoga família inteira
    await revokeFamily(payload.family);
    throw new TokenReuseError('Possible token theft detected. All sessions revoked.');
  }

  // Move para blacklist
  const ttl = payload.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await REDIS.set(`revoked:${payload.jti}`, '1', 'EX', ttl);
    await REDIS.del(`refresh:${payload.jti}`);
  }

  // Emite novo par
  const user = await getUserById(payload.sub);
  const session = await getSession(payload.sessionId);
  return issueTokens(user, session);
}

async function revokeFamily(familyId: string) {
  // Procura todos os refresh tokens da família e revoga
  const members = await REDIS.smembers(`family:${familyId}`);
  for (const jti of members) {
    await REDIS.del(`refresh:${jti}`);
    await REDIS.set(`revoked:${jti}`, '1', 'EX', 7 * 86400);
  }
  await REDIS.del(`family:${familyId}`);
  await audit.log({ action: 'security.token_reuse_detected', familyId });
}
```

## 4.4 Blacklisting de Access Tokens

Access tokens são stateless por natureza. Para suportar logout/revogação imediata:

- Logout: adiciona `jti` ao Redis com TTL = `exp - now`
- Middleware de auth verifica blacklist a cada request
- Admin pode revogar por `userId` (adiciona todos os `jti` da sessão à blacklist)
- Comprometimento: rotaciona chave de assinatura (força re-login de todos)

```typescript
// src/middleware/auth.ts
export async function authenticate(req: Request): Promise<AuthenticatedUser> {
  const token = extractBearerToken(req);
  if (!token) throw new UnauthorizedError();

  let payload: any;
  try {
    payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
  } catch (e) {
    throw new UnauthorizedError('Invalid token');
  }

  // Blacklist check
  const revoked = await REDIS.get(`revoked:${payload.jti}`);
  if (revoked) throw new UnauthorizedError('Token revoked');

  // Session still active?
  const sessionActive = await REDIS.get(`session:${payload.sessionId}`);
  if (!sessionActive) throw new UnauthorizedError('Session ended');

  return {
    id: payload.sub,
    email: payload.email,
    companyId: payload.companyId,
    branchId: payload.branchId,
    role: payload.role,
    permissions: payload.permissions,
    sessionId: payload.sessionId,
    twoFactorVerified: payload['2fa'] === true,
  };
}

export async function revokeToken(jti: string, exp: number) {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl <= 0) return;
  await REDIS.set(`revoked:${jti}`, '1', 'EX', ttl);
}
```

## 4.5 Rotação de Chaves (Key Rotation)

- Chaves RS256 armazenadas em KMS (AWS KMS / GCP KMS / HashiCorp Vault)
- Duas chaves ativas simultaneamente durante janela de rotação (grace period)
- `kid` no header identifica qual chave usar para verificar
- JWKS endpoint: `GET /.well-known/jwks.json` retorna chaves públicas
- Rotação a cada 90 dias (chave anterior fica válida por mais 7 dias para tokens em circulation)

```typescript
// src/lib/auth/key-rotation.ts
export async function rotateSigningKey() {
  const { privateKey, publicKey, kid } = await KMS.generateKeyPair('RSA-3072');
  const newKid = `orion-${new Date().toISOString().slice(0,7)}`;

  // Salva nova chave como PRIMARY, antiga como SECONDARY (grace)
  await REDIS.hset('jwt:keys', newKid, JSON.stringify({ private: privateKey, public: publicKey, status: 'primary' }));
  await REDIS.hset('jwt:keys', getCurrentKid(), JSON.stringify({ ..., status: 'secondary' }));

  // Programa remoção da secundária após 7 dias
  await REDIS.set(`jwt:cleanup:${getCurrentKid()}`, '1', 'EX', 7 * 86400);

  // Atualiza JWKS cache
  await REDIS.del('jwks:cache');
  await audit.log({ action: 'security.key_rotated', newKid });
}
```

## 4.6 Endpoint JWKS

```
GET /.well-known/jwks.json

Response:
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "orion-2025-01",
      "n": "...base64url...",
      "e": "AQAB"
    },
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "orion-2024-12",
      "n": "...base64url...",
      "e": "AQAB"
    }
  ]
}
```

---

# Capítulo 5 — 2FA — Implementação TOTP, Backup Codes, Recuperação

## 5.1 Obrigatoriedade por Cargo

| Cargo | 2FA |
|---|---|
| Administrador Master | Obrigatório |
| Administrador da Empresa | Obrigatório |
| Diretor | Obrigatório |
| Gerente | Recomendado (configurável por empresa) |
| Supervisor | Opcional |
| Vendedor | Opcional |

## 5.2 Implementação TOTP (RFC 6238)

### 5.2.1 Setup Flow

1. Usuário habilita 2FA em "Meu Perfil > Segurança"
2. Backend gera `secret` aleatório (20 bytes, base32)
3. Backend monta `otpauth://` URL e retorna QR code
4. Usuário escaneia com Google Authenticator / Authy / Microsoft Authenticator / 1Password
5. Usuário insere código TOTP atual para confirmar setup
6. Backend valida, marca 2FA como habilitado e gera backup codes

```typescript
// src/lib/auth/totp.ts
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import crypto from 'crypto';

authenticator.options = {
  step: 30,           // 30 segundos
  window: 1,          // ±1 step (tolera 30s de drift)
  digits: 6,
};

export async function start2FASetup(userId: number) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user.twoFactorEnabled) throw new ConflictError('2FA already enabled');

  // Secret aleatório de 20 bytes → base32
  const secret = authenticator.generateSecret();
  const ephemeralToken = randomUUID(); // confirma setup em 10 min

  // Armazena secret temporário (não ativo até confirmação)
  await REDIS.set(`2fa:setup:${userId}`, JSON.stringify({ secret, ephemeralToken }), 'EX', 600);

  const otpauthUrl = authenticator.keyuri(user.email, 'Orion', secret);
  const qrDataUrl = await qrcode.toDataURL(otpauthUrl, { width: 240 });

  return { secret, qrDataUrl, otpauthUrl, ephemeralToken };
}

export async function confirm2FASetup(userId: number, token: string, ephemeralToken: string) {
  const stored = await REDIS.get(`2fa:setup:${userId}`);
  if (!stored || JSON.parse(stored).ephemeralToken !== ephemeralToken) {
    throw new InvalidTokenError();
  }
  const { secret } = JSON.parse(stored);

  if (!authenticator.verify({ token, secret })) {
    throw new InvalidTokenError('Invalid TOTP code');
  }

  // Criptografa secret antes de salvar (AES-256-GCM)
  const encryptedSecret = await encryptWithKMS(secret, 'totp-secret');

  const backupCodes = await generateBackupCodes(userId);

  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: encryptedSecret,
      twoFactorEnabledAt: new Date(),
    },
  });

  await REDIS.del(`2fa:setup:${userId}`);
  await audit.log({ action: '2fa.enabled', userId });
  await sendEmail({ to: user.email, template: '2fa-enabled' });

  return { backupCodes }; // mostrados uma única vez
}

export async function verify2FA(userId: number, token: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user.twoFactorEnabled) return true;

  // Rate limit: 5 tentativas por 5 min
  const key = `2fa:attempts:${userId}`;
  const attempts = await REDIS.incr(key);
  if (attempts === 1) await REDIS.expire(key, 300);
  if (attempts > 5) {
    await lockAccount(user.email, 15 * 60);
    throw new TooManyAttemptsError();
  }

  const secret = await decryptWithKMS(user.twoFactorSecret, 'totp-secret');

  // Tenta TOTP
  if (authenticator.verify({ token, secret })) {
    await REDIS.del(key);
    return true;
  }

  // Tenta backup code
  if (await consumeBackupCode(userId, token)) {
    await REDIS.del(key);
    return true;
  }

  return false;
}
```

### 5.2.2 Backup Codes

- 10 códigos de uso único
- 8 caracteres alfanuméricos (ex: `A4B7C2D9`) — fácil digitação
- Hashed com bcrypt cost 8 (mais rápido que senha)
- Mostrados uma única vez no setup
- Usuário pode regenerar (invalida anteriores)
- Quando usado, decrementa contador; alerta em <3 restantes

```typescript
import { randomBytes } from 'crypto';

export async function generateBackupCodes(userId: number): Promise<string[]> {
  const codes: string[] = [];
  const hashes: { codeHash: string; usedAt: Date | null }[] = [];

  for (let i = 0; i < 10; i++) {
    const code = randomBytes(4).toString('hex').toUpperCase().slice(0, 8); // 8 chars
    codes.push(code);
    hashes.push({ codeHash: await bcrypt.hash(code, 8), usedAt: null });
  }

  // Substitui anteriores
  await db.twoFactorBackupCode.deleteMany({ where: { userId } });
  await db.twoFactorBackupCode.createMany({
    data: hashes.map(h => ({ userId, codeHash: h.codeHash })),
  });

  return codes;
}

export async function consumeBackupCode(userId: number, code: string): Promise<boolean> {
  const candidates = await db.twoFactorBackupCode.findMany({
    where: { userId, usedAt: null },
  });

  for (const c of candidates) {
    if (await bcrypt.compare(code, c.codeHash)) {
      await db.twoFactorBackupCode.update({
        where: { id: c.id },
        data: { usedAt: new Date() },
      });
      const remaining = candidates.length - 1;
      if (remaining < 3) {
        await notifyUser(userId, `Você tem ${remaining} backup codes restantes. Regenere em breve.`);
      }
      await audit.log({ action: '2fa.backup_code_used', userId });
      return true;
    }
  }
  return false;
}
```

### 5.2.3 Recuperação de 2FA

Se usuário perde o dispositivo e os backup codes:

| Situação | Procedimento |
|---|---|
| Tem backup codes | Usa um código → desativa 2FA ou reconfigura |
| Perdeu tudo | Contato admin (master) → reset 2FA manual |
| Admin master perdeu | Contato DPO/CISO → reset via recovery key (shamir secret sharing) |

Processo de reset admin:

```typescript
// src/api/routes/admin/2fa-reset.ts
@RequirePermissions('users.reset_2fa')
@Post('/admin/users/:id/2fa-reset')
async reset2FA(@Param('id') userId: number, @Body() body: Reset2FADto) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user.role === 'system.admin') {
    throw new ForbiddenError('Cannot reset 2FA for system admin via this endpoint');
  }

  // Exige confirmação por email enviado ao usuário
  const confirmToken = randomUUID();
  await REDIS.set(`2fa:reset-pending:${userId}`, JSON.stringify({
    requestedBy: req.user.id,
    confirmToken,
    expiresAt: Date.now() + 86400000, // 24h
  }), 'EX', 86400);

  await sendEmail({
    to: user.email,
    template: '2fa-reset-confirmation',
    context: { confirmUrl: `https://app.orion.com/confirm-2fa-reset?token=${confirmToken}` },
  });

  return { message: 'Confirmation email sent to user. Reset completes after they click the link.' };
}

@Get('/confirm-2fa-reset')
async confirmReset(@Query('token') token: string) {
  const pending = await findPendingByToken(token);
  if (!pending) throw new InvalidTokenError();

  await db.user.update({
    where: { id: pending.userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });
  await db.twoFactorBackupCode.deleteMany({ where: { userId: pending.userId } });
  await db.session.deleteMany({ where: { userId: pending.userId } }); // força re-login
  await audit.log({ action: '2fa.reset_completed', userId: pending.userId, requestedBy: pending.requestedBy });
  await REDIS.del(`2fa:reset-pending:${pending.userId}`);
}
```

### 5.2.4 Recovery via Shamir Secret Sharing (Master Admin)

Para o caso extremo do admin master perder 2FA e backup codes:

- Secret de recover (32 bytes) é dividido em 5 shares via Shamir (threshold 3)
- Cada share é dado a um membro do board (CEO, CTO, CISO, DPO, Auditor externo)
- Recuperação exige presença física de 3 dos 5
- Cada share é armazenado em hardware security module (YubiKey) do respectivo membro
- Procedimento documentado em `runbooks/security/master-recovery.md`

### 5.2.5 FIDO2 / WebAuthn (Roadmap v2.0)

Suporte a security keys (YubiKey, Titan) e platform authenticators (Touch ID, Windows Hello) via WebAuthn. Mais resistente a phishing que TOTP.

---

# Capítulo 6 — OAuth 2.0 / OIDC — Google e Microsoft

## 6.1 Provedores Suportados (v1.0)

- Google (consumer e Workspace)
- Microsoft (Azure AD / Entra ID, contas corporativas)
- Apple Sign-In (roadmap v2.0)

## 6.2 Fluxo Authorization Code com PKCE

### 6.2.1 Diagrama Google

```
┌─────────┐                                         ┌──────────┐
│ Browser │                                         │  Orion   │
│  (App)  │                                         │   API    │
└────┬────┘                                         └────┬─────┘
     │                                                   │
     │ 1. Click "Entrar com Google"                      │
     ├──────────────────────────────────────────────────>│
     │ 2. Generate code_verifier + code_challenge (S256) │
     │ 3. Redirect to Google Auth URL                    │
     │<──────────────────────────────────────────────────┤
     │                                                   │
     │ 4. User authenticates + grants                    │
     ├───────────────────────────────────────────────────>│ Google
     │                                                   │  Auth
     │ 5. Redirect to /auth/google/callback              │  Server
     │    with ?code=xxx&state=yyy                       │
     │<──────────────────────────────────────────────────┤
     │                                                   │
     │ 6. Send code + state + code_verifier              │
     ├──────────────────────────────────────────────────>│
     │                                                   │ 7. Exchange code + code_verifier
     │                                                   │    for access_token + id_token
     │                                                   ├────────────────────────────>│ Google
     │                                                   │                              │ Token
     │                                                   │ 8. Receive tokens            │ Endpoint
     │                                                   │<────────────────────────────┤
     │                                                   │
     │                                                   │ 9. Verify id_token JWT signature
     │                                                   │    Fetch userinfo (email, name, picture)
     │                                                   │ 10. Find or create Orion user
     │                                                   │ 11. Issue Orion JWT (access + refresh)
     │ 12. Set cookies + redirect to dashboard           │
     │<──────────────────────────────────────────────────┤
```

### 6.2.2 Implementação Google

```typescript
// src/lib/auth/oauth/google.ts
import { generators } from 'openid-client';
import { googleClient } from './client';

export async function initiateGoogleLogin(req: Request, res: Response) {
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  const state = generators.state();
  const nonce = generators.nonce();

  // Persiste em cookie httpOnly para callback
  res.cookie('oauth_cv', codeVerifier, {
    httpOnly: true, secure: true, sameSite: 'strict',
    maxAge: 10 * 60 * 1000, // 10 min
  });
  res.cookie('oauth_state', state, { ...sameOpts });
  res.cookie('oauth_nonce', nonce, { ...sameOpts });

  const url = googleClient.authorizationUrl({
    scope: 'openid email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state, nonce,
    prompt: 'select_account',
  });

  res.redirect(url);
}

export async function handleGoogleCallback(req: Request, res: Response) {
  const { code, state } = req.query;
  const cv = req.cookies.oauth_cv;
  const savedState = req.cookies.oauth_state;
  const nonce = req.cookies.oauth_nonce;

  if (state !== savedState) throw new OAuthError('State mismatch (CSRF?)');

  const tokenSet = await googleClient.callback(
    'https://api.orion.com/auth/google/callback',
    { code, state },
    { code_verifier: cv, nonce }
  );

  const claims = tokenSet.claims(); // validates signature, exp, aud, nonce
  const userinfo = await googleClient.userinfo(tokenSet.access_token!);

  // Find or create user
  const user = await findOrCreateOAuthUser({
    provider: 'google',
    providerUserId: claims.sub,
    email: claims.email!,
    emailVerified: claims.email_verified ?? false,
    name: claims.name,
    avatarUrl: claims.picture,
  });

  // If new user: needs companyId assignment (admin invites)
  if (!user.companyId) {
    const pendingInvitation = await db.invitation.findFirst({
      where: { email: user.email, status: 'pending' },
    });
    if (!pendingInvitation) {
      // Return to onboarding "ask your admin to invite you"
      return res.redirect(`${APP_URL}/no-invitation`);
    }
    await acceptInvitation(user.id, pendingInvitation);
  }

  // Issue Orion tokens
  const session = await createSession(user, { provider: 'google', ip: req.ip, userAgent: req.headers['user-agent'] });
  const { accessToken, refreshToken } = await issueTokens(user, session);

  res.cookie('access_token', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 86400 * 1000 });
  res.clearCookie('oauth_cv'); res.clearCookie('oauth_state'); res.clearCookie('oauth_nonce');

  await audit.log({ action: 'auth.login.oauth', userId: user.id, meta: { provider: 'google' } });
  res.redirect(`${APP_URL}/dashboard`);
}
```

### 6.2.3 Diagrama Microsoft (Azure AD / Entra ID)

Mesmo fluxo Authorization Code + PKCE, mas com particularidades:

- `tenant` configurável: `common` (qualquer Microsoft account), `organizations` (qualquer Work/School), `consumers` (Live/Hotmail), ou GUID específico do tenant do cliente
- Para clientes Enterprise com Azure AD: recomendamos Azure AD application registration com `multi-tenant: yes`
- Scopes: `openid profile email User.Read`
- Endpoint de discovery: `https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration`

```typescript
// src/lib/auth/oauth/microsoft.ts
import { Issuer, Client } from 'openid-client';

export async function createMicrosoftClient(tenant = 'common'): Promise<Client> {
  const issuer = await Issuer.discover(`https://login.microsoftonline.com/${tenant}/v2.0`);
  return new issuer.Client({
    client_id: process.env.MS_CLIENT_ID!,
    client_secret: process.env.MS_CLIENT_SECRET!,
    redirect_uris: ['https://api.orion.com/auth/microsoft/callback'],
    response_types: ['code'],
  });
}

export async function initiateMicrosoftLogin(req: Request, res: Response) {
  // Para empresas Enterprise, tenant vem da query (?tenant=xxx)
  const tenant = req.query.tenant as string || 'common';
  const client = await createMicrosoftClient(tenant);

  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  const state = generators.state();
  const nonce = generators.nonce();

  res.cookie('oauth_cv', codeVerifier, cookieOpts(10));
  res.cookie('oauth_state', state, cookieOpts(10));
  res.cookie('oauth_nonce', nonce, cookieOpts(10));
  res.cookie('oauth_tenant', tenant, cookieOpts(10));

  const url = client.authorizationUrl({
    scope: 'openid profile email User.Read',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state, nonce,
    prompt: 'select_account',
  });

  res.redirect(url);
}
```

### 6.2.4 Account Linking

Cenário: usuário já existe com senha e quer adicionar login via Google.

```typescript
@RequireAuth
@Post('/me/link-google')
async linkGoogle(@Req() req: Request) {
  // Same OAuth flow, but in callback check that req.cookies.link_user_id is set
  // Then update existing user with provider=google, providerUserId=sub
  // Don't create new user
}
```

Regras:
- Email já existe com mesmo email verificado → link automático
- Email existe mas não verificado → exige login com senha primeiro
- Email não existe → cria novo usuário (com companyId pendente convite)
- Email existe mas pertence a outro provedor → oferece "link accounts"

### 6.2.5 Detecção de Ataques OAuth

- **State mismatch** → bloqueia (CSRF)
- **Nonce mismatch** → bloqueia (token replay)
- **Email não verificado no provedor** → não linka automaticamente
- **Domain mismatch** → se empresa tem SSO restrito a `@empresa.com`, bloqueia outros
- **Aud mismatch** → rejeita token emitido para outro client_id

---

# Capítulo 7 — Autorização (RBAC) — Matriz Completa

## 7.1 Modelo

Role-Based Access Control com permissões granulares por módulo e ação.

```
User → Role → Permissions
              ├── module.action
              ├── users.create
              ├── users.read
              └── ...
```

## 7.2 Permissões Granulares

Cada módulo tem 7 ações padrão:
- `create`, `read`, `update`, `delete`, `export`, `import`, `configure`

Permissões especiais:
- `audit.read` — acesso a logs de auditoria
- `license.manage` — gestão de licenças
- `system.admin` — acesso total ao sistema
- `users.reset_2fa` — reset de 2FA de outro usuário
- `security.impersonate` — impersonation (apenas system.admin)
- `ai.query` — uso do chat IA
- `ai.admin` — configuração de IA e visualização de custos
- `integrations.manage` — configuração de integrações
- `webhooks.manage` — gestão de webhooks

## 7.3 Hierarquia de Roles

```
system.admin (Master)
    ↓ herda
admin.empresa
    ↓ herda
diretor
    ↓ herda
gerente
    ↓ herda
supervisor
    ↓ herda
vendedor
```

Roles herdam permissões de roles inferiores (somatório).

## 7.4 Matriz Completa de Permissões por Cargo

Legenda: ✓ = tem | ✗ = não tem | ✓* = opcional (configurável por empresa)

| Módulo.Ação | Vendedor | Supervisor | Gerente | Diretor | Admin Empresa | Admin Master |
|---|---|---|---|---|---|---|
| **dashboard** | | | | | | |
| dashboard.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| dashboard.configure | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **users** | | | | | | |
| users.read | ✓* (próprio) | ✓* (supervisionados) | ✓ (filial) | ✓ (empresa) | ✓ (empresa) | ✓ (global) |
| users.create | ✗ | ✗ | ✓ (filial) | ✓ (empresa) | ✓ (empresa) | ✓ (global) |
| users.update | ✗ | ✓* (supervisionados) | ✓ (filial) | ✓ (empresa) | ✓ (empresa) | ✓ (global) |
| users.delete | ✗ | ✗ | ✗ | ✓ (empresa) | ✓ (empresa) | ✓ (global) |
| users.export | ✗ | ✗ | ✓* | ✓ | ✓ | ✓ |
| users.import | ✗ | ✗ | ✗ | ✓* | ✓ | ✓ |
| users.configure | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| users.reset_2fa | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **goals** | | | | | | |
| goals.read | ✓ (próprias) | ✓ (equipe) | ✓ (filial) | ✓ (empresa) | ✓ (empresa) | ✓ |
| goals.create | ✗ | ✓* (equipe) | ✓ (filial) | ✓ (empresa) | ✓ | ✓ |
| goals.update | ✗ | ✓* (equipe) | ✓ (filial) | ✓ (empresa) | ✓ | ✓ |
| goals.delete | ✗ | ✗ | ✓* | ✓ | ✓ | ✓ |
| goals.export | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ |
| goals.import | ✗ | ✗ | ✓* | ✓ | ✓ | ✓ |
| goals.configure | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **results** | | | | | | |
| results.read | ✓ (próprios) | ✓ (equipe) | ✓ (filial) | ✓ (empresa) | ✓ | ✓ |
| results.create | ✓ (próprios) | ✓ (supervisionados) | ✓ | ✓ | ✓ | ✓ |
| results.update | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ |
| results.delete | ✗ | ✗ | ✓* | ✓ | ✓ | ✓ |
| results.approve | ✗ | ✓ (equipe) | ✓ (filial) | ✓ (empresa) | ✓ | ✓ |
| results.reject | ✗ | ✓ (equipe) | ✓ (filial) | ✓ (empresa) | ✓ | ✓ |
| results.export | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ |
| results.import | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ |
| **campaigns** | | | | | | |
| campaigns.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| campaigns.create | ✗ | ✗ | ✓* | ✓ | ✓ | ✓ |
| campaigns.update | ✗ | ✗ | ✓* | ✓ | ✓ | ✓ |
| campaigns.delete | ✗ | ✗ | ✓* | ✓ | ✓ | ✓ |
| campaigns.configure | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **indicators** | | | | | | |
| indicators.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| indicators.create | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| indicators.update | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| indicators.delete | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| indicators.configure | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| **branches** | | | | | | |
| branches.read | ✓ (própria) | ✓ (própria) | ✓ (própria) | ✓ (todas) | ✓ | ✓ |
| branches.create | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| branches.update | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| branches.delete | ✗ | ✗ | ✗ | ✗ | ✓* | ✓ |
| **rankings** | | | | | | |
| rankings.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| rankings.export | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ |
| **reports** | | | | | | |
| reports.read | ✓ (próprios) | ✓ (equipe) | ✓ (filial) | ✓ (empresa) | ✓ | ✓ |
| reports.create | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ |
| reports.export | ✗ | ✓* | ✓ | ✓ | ✓ | ✓ |
| **notifications** | | | | | | |
| notifications.read | ✓ (próprias) | ✓ (próprias) | ✓ (próprias) | ✓ (próprias) | ✓ | ✓ |
| notifications.send | ✗ | ✓* (equipe) | ✓ (filial) | ✓ (empresa) | ✓ | ✓ |
| **audit** | | | | | | |
| audit.read | ✗ | ✗ | ✗ | ✓* | ✓ | ✓ |
| audit.export | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **ai** | | | | | | |
| ai.query | ✓* | ✓* | ✓* | ✓* | ✓ | ✓ |
| ai.admin | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **integrations** | | | | | | |
| integrations.manage | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| webhooks.manage | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| **licenses** | | | | | | |
| license.manage | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **system** | | | | | | |
| system.admin | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| security.impersonate | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| billing.manage | ✗ | ✗ | ✗ | ✗ | ✓* | ✓ |

## 7.5 Validação no Backend

Toda rota protegida tem middleware que verifica em 3 camadas:

1. **Autenticação** (token válido)
2. **Autorização** (permissão presente)
3. **Posse** (recurso pertence à empresa/filial do usuário)

```typescript
// src/middleware/require-permissions.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('permissions', ctx.getHandler());
    if (!required) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as AuthenticatedUser;
    if (!user) throw new ForbiddenException();

    const hasAll = required.every(p => user.permissions.includes(p));
    if (!hasAll) throw new ForbiddenException(`Missing: ${required.join(', ')}`);
    return true;
  }
}

// Uso:
@RequirePermissions('goals.create')
@Post('/goals')
async createGoal(@Body() dto: CreateGoalDto, @Req() req: Request) {
  // Posse: filial do objetivo deve ser do usuário
  if (dto.branchId && !req.user.branchIds.includes(dto.branchId)) {
    throw new ForbiddenException('Branch not in user scope');
  }
  return this.goalsService.create({ ...dto, companyId: req.user.companyId, createdBy: req.user.id });
}
```

## 7.6 Posse e Scoped Access

Validação de posse em cada query (defesa em profundidade com RLS):

```typescript
// Vendedor só pode ver próprios resultados
async findResults(user: AuthenticatedUser, filters: ResultFilter) {
  let scopedWhere: any = { companyId: user.companyId };

  switch (user.role) {
    case 'vendedor':
      scopedWhere.userId = user.id;
      break;
    case 'supervisor':
      scopedWhere.userId = { in: await getSubordinateIds(user.id) };
      break;
    case 'gerente':
      scopedWhere.branchId = user.branchId;
      break;
    case 'diretor':
    case 'admin.empresa':
    case 'system.admin':
      // sem filtro adicional (companyId já vem do user)
      break;
  }

  return db.result.findMany({ where: { ...scopedWhere, ...filters } });
}
```

## 7.7 Custom Roles (v2.0)

Empresas poderão criar roles customizadas herdando de uma das 5 roles base. Persistido em `roles` com `parentRoleId` e `permissions` (override). Matriz acima é o default imutável.

---

# Capítulo 8 — Criptografia — AES-256, TLS 1.3, Key Rotation

## 8.1 Dados em Trânsito

### 8.1.1 TLS 1.3

- **Obrigatório** TLS 1.3 (RFC 8446)
- TLS 1.2 aceito apenas para clientes legacy (depreciação 2026)
- TLS 1.0/1.1/SSL: desabilitados (fogo no CloudFront/ALB)
- **Cipher suites aceitas (TLS 1.3):**
  - `TLS_AES_256_GCM_SHA384`
  - `TLS_AES_128_GCM_SHA256`
  - `TLS_CHACHA20_POLY1305_SHA256`
- **Cipher suites aceitas (TLS 1.2 legacy):**
  - `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
  - `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256`
  - `TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256`
- Renegociação desabilitada
- Compression desabilitada (CRIME/BREACH)
- 0-RTT habilitado só para idempotentes (GET)

### 8.1.2 HSTS

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Domínio `orion.com` submetido à HSTS preload list do Chrome.

### 8.1.3 Certificate Pinning

Aplicativo Electron e mobile usam pinning para:
- `api.orion.com` (certificado público + backup)
- SPKI hash do certificado

```typescript
// Electron (ses.webRequest.onCertificateTrust)
const PINS = [
  'sha256/abcdef...', // primário
  'sha256/123456...',  // backup (rotação)
];
session.defaultSession.webRequest.onCertificateTrust((event, url, certificate, callback) => {
  const certPins = extractPins(certificate);
  if (PINS.some(pin => certPins.includes(pin))) {
    callback(true);
  } else {
    callback(false);
  }
});
```

### 8.1.4 mTLS Interno

Serviços backend se comunicam via mTLS dentro da VPC (zero trust). Service mesh Istio ou Linkerd emite certificados via SPIFFE/SPIRE.

## 8.2 Dados em Repouso

### 8.2.1 Disk Encryption

- **Banco PostgreSQL:** Transparent Disk Encryption (TDE) ou EBS encryption (AWS) / Persistent Disk encryption (GCP)
- **Redis:** disk persistence encryptada (`requirepass` + `tls-port`)
- **S3 / GCS:** SSE-KMS (chave gerenciada pelo KMS, rotação anual)
- **Backups:** AES-256-GCM com chave derivada via KMS

### 8.2.2 Column-Level Encryption (Aplicação)

Colunas sensíveis criptografadas em aplicação com AES-256-GCM antes de salvar:

| Tabela.Coluna | Conteúdo | Algoritmo |
|---|---|---|
| `users.cpf` | CPF | AES-256-GCM |
| `users.rg` | RG | AES-256-GCM |
| `companies.cnpj` | CNPJ | AES-256-GCM |
| `licenses.license_key` | Chave licença | AES-256-GCM |
| `users.phone` | Telefone | AES-256-GCM |
| `users.picture_url` (PII?) | Foto | SSE-S3 (não ALE) |
| `webhook_subscriptions.secret` | Secret webhook | AES-256-GCM |
| `oauth_accounts.access_token` | Token OAuth | AES-256-GCM |
| `email_queue.body` | Corpo email | AES-256-GCM |

### 8.2.3 Implementação AES-256-GCM

```typescript
// src/lib/crypto/aes.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recomendado para GCM

export interface EncryptedPayload {
  v: 1;                       // versão do schema
  k: string;                  // KMS key ID usado
  iv: string;                 // base64 IV
  ct: string;                 // base64 ciphertext
  tag: string;                // base64 auth tag
}

export async function encrypt(plaintext: string, kmsKeyId = 'orion-app-data-key'): Promise<EncryptedPayload> {
  // Envelope encryption: KMS gera data key, usamos localmente, descartamos
  const { plaintextKey, ciphertextKey } = await KMS.generateDataKey({
    keyId: kmsKeyId,
    keySpec: 'AES_256',
  });

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, plaintextKey, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Limpa plaintextKey da memória
  plaintextKey.fill(0);

  return {
    v: 1,
    k: ciphertextKey.toString('base64'),
    iv: iv.toString('base64'),
    ct: ct.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export async function decrypt(payload: EncryptedPayload): Promise<string> {
  // Decifra data key via KMS
  const { plaintextKey } = await KMS.decrypt({
    ciphertextBlob: Buffer.from(payload.k, 'base64'),
  });

  const decipher = crypto.createDecipheriv(ALGORITHM,
    plaintextKey,
    Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));

  try {
    const plain = Buffer.concat([
      decipher.update(Buffer.from(payload.ct, 'base64')),
      decipher.final(),
    ]).toString('utf8');
    plaintextKey.fill(0);
    return plain;
  } catch (e) {
    plaintextKey.fill(0);
    throw new DecryptionError('Authentication failed - tampered ciphertext');
  }
}
```

### 8.2.4 Prisma Custom Type

```typescript
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }

datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

type EncryptedString = String @db.Text;

model User {
  id             BigInt   @id @default(autoincrement())
  companyId      BigInt
  name           String
  email          String   @unique
  password       String
  cpf            EncryptedString?  // armazena JSON {v,k,iv,ct,tag}
  rg             EncryptedString?
  phone          EncryptedString?
  // ...
}
```

```typescript
// src/lib/db/middleware.ts — Prisma middleware para auto-encrypt
prisma.$use(async (params, next) => {
  if (params.model === 'User' && (params.action === 'create' || params.action === 'update')) {
    for (const field of ['cpf', 'rg', 'phone']) {
      if (params.args.data[field] && typeof params.args.data[field] === 'string') {
        params.args.data[field] = await encrypt(params.args.data[field]);
      }
    }
  }
  const result = await next(params);
  // Auto-decrypt on read
  if (params.action === 'findUnique' || params.action === 'findMany') {
    const decryptRow = async (row: any) => {
      if (!row) return row;
      for (const field of ['cpf', 'rg', 'phone']) {
        if (row[field] && typeof row[field] === 'object') {
          row[field] = await decrypt(row[field]);
        }
      }
    };
    if (Array.isArray(result)) await Promise.all(result.map(decryptRow));
    else await decryptRow(result);
  }
  return result;
});
```

## 8.3 Hashes

| Tipo | Algoritmo | Salt |
|---|---|---|
| Senhas | bcrypt cost 12 | Embutido |
| Token de reset | HMAC-SHA256 com pepper | N/A |
| Backup codes 2FA | bcrypt cost 8 | Embutido |
| Arquivos de backup | SHA-256 | N/A |
| IDs públicos (PII) | HMAC-SHA256 (k-anon) | App secret |
| E-mail (para HIBP) | SHA-1 (uppercase) | N/A |

## 8.4 Key Rotation

### 8.4.1 Estratégia

| Chave | Local | Rotação | Estratégia |
|---|---|---|---|
| JWT signing (RS256) | KMS | 90 dias | 2 chaves ativas (grace 7d) |
| AES-256 column encryption (DEK) | Derivada do KMS CMK | A cada uso (envelope) | Per-item |
| AES-256 master (CMK) | KMS | 365 dias | Re-encrypt após rotação |
| TLS certificate | ACM (AWS) / Let's Encrypt | 90 dias | Automático |
| DB TDE master | RDS / Cloud SQL | 365 dias | Automático cloud |
| Refresh token signing | Mesma JWT | 90 dias | Mesma estratégia |
| OAuth client secrets | Google/MS console | 180 dias | Manual, com overlap |
| Webhook signing secret | App config | 180 dias | Rotate + notifica consumers |

### 8.4.2 Re-encrypt após Rotação de CMK

```typescript
// scripts/rotate-cmk.ts
export async function reEncryptAllWithNewCMK(oldKeyId: string, newKeyId: string) {
  const batchSize = 1000;
  let offset = 0;
  while (true) {
    const users = await db.user.findMany({
      where: { cpf: { not: null } },
      select: { id: true, cpf: true },
      skip: offset, take: batchSize,
    });
    if (users.length === 0) break;

    for (const u of users) {
      const plaintext = await decrypt(u.cpf as any);
      const newPayload = await encrypt(plaintext, newKeyId);
      await db.user.update({ where: { id: u.id }, data: { cpf: newPayload as any } });
    }
    offset += batchSize;
    console.log(`Re-encrypted ${offset} records...`);
  }
}
```

## 8.5 Segredos

- **HashiCorp Vault** (prod cloud) ou **AWS Secrets Manager** (alternativa)
- **Doppler** ou **Sealed Secrets** (GitOps on-prem)
- Rotação automática para DB credentials, API keys
- Access log de todos os `read` de segredos
- Segredos nunca em código, commits, variáveis de ambiente em texto plano
- Pre-commit hook bloqueia patterns como `sk-`, `AKIA`, `ghp_`

---

# Capítulo 9 — Controles OWASP Top 10 (com Implementação)

OWASP Top 10 (2021): A01 a A10. Cada controle abaixo descreve implementação concreta no Orion.

## 9.1 A01 — Broken Access Control

**Risco:** Usuário acessa dados de outro tenant, ou função não autorizada.

**Implementações:**
- RBAC granular (Capítulo 7) com middleware `@RequirePermissions`
- RLS PostgreSQL (Capítulo 12) — defesa em profundidade
- Validação de posse em cada query (`companyId: req.user.companyId`)
- Defaults deny em todos os endpoints
- Testes automatizados: para cada endpoint, testar cross-tenant access
- `Centralized Access Control Library` (sem `if (user.role === 'admin')` espalhado)

```typescript
// Anti-pattern (PROIBIDO):
if (user.role === 'admin') { allowAdminAction(); }

// Pattern correto:
@RequirePermissions('system.admin')
@Post('/admin/dangerous-action')
async dangerousAction() { ... }
```

## 9.2 A02 — Cryptographic Failures

**Risco:** Dados sensíveis expostos (sem criptografia, com algoritmo fraco).

**Implementações:**
- TLS 1.3 obrigatório (Capítulo 8)
- AES-256-GCM coluna a coluna para PII
- bcrypt cost 12 para senhas
- Sem dados sensíveis em logs (PII redaction pipeline)
- Sem secrets em código (Vault)
- SAST verifica hardcoded secrets (SonarQube, GitHub secret scanning)

## 9.3 A03 — Injection (SQL, NoSQL, OS, LDAP)

**Risco:** Atacante executa código malicioso via input não sanitizado.

**Implementações:**
- Prisma ORM: queries parametrizadas automaticamente
- Zod schemas para validação de input em cada endpoint
- Proibido concatenar strings SQL (lint rule `no-restricted-syntax`)
- `JSON.parse` validado por schema (não `eval`, não `Function`)
- Command spawn com array (não string): `exec('ls ' + userInput)` → `execFile('ls', [userInput])`

```typescript
// PROIBIDO:
await prisma.$queryRaw(`SELECT * FROM users WHERE name = '${name}'`);

// CORRETO:
await prisma.$queryRaw`SELECT * FROM users WHERE name = ${name}`;

// Melhor:
await prisma.user.findMany({ where: { name } });
```

## 9.4 A04 — Insecure Design

**Risco:** Falta de threat modeling, padrões inseguros.

**Implementações:**
- Threat model STRIDE para cada feature nova (template em `docs/threat-models/`)
- Security design review obrigatória para RFCs que tocam auth, PII, pagamentos
- Abuse case analysis: "Como um usuário malicioso abusaria disso?"
- Rate limiting em endpoints sensíveis
- Limites de recursos por tenant (max goals, max users, etc.)

## 9.5 A05 — Security Misconfiguration

**Risco:** Defaults inseguros, headers faltando, stack traces expostos.

**Implementações:**
- Headers de segurança (Capítulo 10) em todas as respostas
- Stack traces desabilitados em produção (`NODE_ENV=production`)
- Debug endpoints desabilitados (`/debug`, `/__coverage`)
- `x-powered-by` removido
- Directory listing desabilitado
- S3 buckets privados por default (sem public read)
- DB sem acesso público (security groups restritos)
- Imagens Docker sem root user
- Scan de configuração: **Lynis**, **kube-bench**, **Checkov**

## 9.6 A06 — Vulnerable and Outdated Components

**Risco:** Dependências com CVEs conhecidos.

**Implementações:**
- Dependabot habilitado (PRs automáticos para updates)
- `npm audit` em CI (falha em high/critical)
- Snyk para análise de licenças e vulns
- Renovate Bot para updates de versões major
- SBOM (Software Bill of Materials) gerado via `cyclonedx` a cada release
- Container scan com **Trivy** antes do push (falha em critical)
- Sigstore / Cosign para assinatura de imagens
- Patch SLA: Critical 24h, High 7d, Medium 30d, Low 90d

## 9.7 A07 — Identification and Authentication Failures

**Risco:** Credenciais fracas, sessões não expiradas, credential stuffing.

**Implementações:**
- Política de senhas forte (Capítulo 3)
- 2FA obrigatório para admins (Capítulo 5)
- Rate limiting em `/auth/login` (5/min/IP, 10/h/email)
- Lockout de conta (Capítulo 3.1.8)
- Session timeout: 30 min inatividade (configurável), 8h máximo
- Refresh token rotation com detecção de reuso (Capítulo 4.3)
- Logout invalida tokens (blacklist)
- Credential stuffing: HIBP check on signup + periodic
- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`

## 9.8 A08 — Software and Data Integrity Failures

**Risco:** Builds comprometidos, updates não assinados, deserialização insegura.

**Implementações:**
- Pipelines CI/CD isolados (GitHub Actions OIDC, sem long-lived tokens)
- Imagens Docker assinadas (Cosign)
- Binários Electron assinados (Authenticode Windows, notarization macOS)
- Releases via GitHub Releases com SHA256 checksums
- Deserialização: apenas `JSON.parse` validado por Zod
- Anti-tampering: hash chain em audit logs (Capítulo 15)
- Subresource Integrity (SRI) em scripts externos

## 9.9 A09 — Security Logging and Monitoring Failures

**Risco:** Ataques não detectados, logs insuficientes ou apagados.

**Implementações:**
- Logs de auditoria imutáveis (Capítulo 15)
- Logs estruturados JSON → ELK / Loki
- Alertas em tempo real (Capítulo 9.4 do doc 13)
- SIEM (Security Information Event Management) — correlation rules
- UEBA (User Entity Behavior Analytics) para detectar anomalias
- Retenção: 5 anos audit logs, 90 dias app logs, 1 ano error logs
- Pagamento de bug bounty (HackerOne) para reports externos

## 9.10 A10 — Server-Side Request Forgery (SSRF)

**Risco:** Atacante faz servidor fazer requests para recursos internos.

**Implementações:**
- Whitelist de hosts permitidos para outbound requests
- Bloquear ranges RFC 1918, link-local, loopback, cloud metadata (169.254.169.254)
- DNS pinning: resolve hostname uma vez, valida IP antes de conectar
- Timeout curto (5s) para requests de webhook/integrações
- Sandboxed HTTP client (sem follow redirects para internal)
- Webhook URL validation: não permite `localhost`, `0.0.0.0`, IPs privados, hex encoded

```typescript
// src/lib/http/safe-fetch.ts
import { lookup } from 'dns/promises';
import { isIP } from 'net';

const BLOCKED_RANGES = [
  /^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./,
  /^127\./, /^0\./, /^169\.254\./, /^::1$/, /^fc/, /^fd/,
];

export async function safeFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Protocol not allowed');
  }

  // Resolve DNS uma vez
  const addresses = await lookup(parsed.hostname, { all: true });
  for (const addr of addresses) {
    const ip = isIP(addr.address) ? addr.address : null;
    if (ip && BLOCKED_RANGES.some(r => r.test(ip) || ip === '169.254.169.254')) {
      throw new Error(`Blocked internal IP: ${ip}`);
    }
  }

  return fetch(url, { ...opts, redirect: 'manual', signal: AbortSignal.timeout(5000) });
}
```

---

# Capítulo 10 — Headers de Segurança, CSP, CORS

## 10.1 Headers HTTP Padrão

Todas as respostas (API e frontend) incluem:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{nonce}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.orion.com wss://api.orion.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
Cache-Control: no-store, no-cache, must-revalidate (para respostas com dados)
X-Permitted-Cross-Domain-Policies: none
```

## 10.2 CSP com Nonces

Cada request HTML recebe um nonce único (base64 22 chars) injetado em `<script>` tags:

```typescript
// src/middleware/csp.ts
import crypto from 'crypto';

export function cspMiddleware(req: Request, res: Response, next: NextFunction) {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.orion.com wss://api.orion.com https://*.sentry.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');
  next();
}
```

## 10.3 CORS

```typescript
// src/middleware/cors.ts
import cors from 'cors';

const ALLOWED_ORIGINS = new Set([
  'https://app.orion.com',
  'https://admin.orion.com',
  'https://staging.orion.com',
  'http://localhost:3000', // dev
]);

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin / curl
    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'X-RateLimit-Remaining'],
  maxAge: 600,
};
```

CORS para tenant custom domain (v2.0): cada empresa pode ter `app.empresa.com.br` apontando para Orion. Origin validado dinamicamente via DB lookup `tenant_domains`.

## 10.4 CSRF Protection

Para endpoints que usam cookie de sessão (não Bearer token):

```typescript
// Double-submit cookie pattern
export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new ForbiddenError('CSRF token mismatch');
  }
  next();
}

// Generate on session start
app.get('/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('base64url');
  res.cookie('csrf-token', token, {
    httpOnly: false, // accessible by JS to send in header
    secure: true,
    sameSite: 'strict',
  });
  res.json({ token });
});
```

---

# Capítulo 11 — Rate Limiting e Proteção contra Abuso

## 11.1 Limites por Endpoint

| Endpoint | Limite | Janela | Escopo | Penalidade |
|---|---|---|---|---|
| `/auth/login` | 5 | 1 min | IP | 15 min lockout |
| `/auth/login` | 10 | 24h | email | 24h lockout |
| `/auth/forgot-password` | 3 | 1h | IP | 1h block |
| `/auth/reset-password` | 5 | 1h | IP | 1h block |
| `/auth/refresh` | 30 | 1 min | user | 5 min block |
| `/api/*` geral | 100-1000 | 1 min | user | throttle |
| `/api/export/*` | 10 | 1h | user | 24h block |
| `/api/ai/chat` | 20 | 1 min | user | throttle |
| `/api/ai/insights/daily` | 1 | 1h | tenant | 429 |
| `/api/upload` | 10 | 1 min | user | 429 |
| File upload size | 25 MB | per file | — | 413 |
| Webhook delivery | 100/s | — | per webhook | exponential backoff |

## 11.2 Implementação (Redis sliding window)

```typescript
// src/lib/rate-limit.ts
export async function rateLimit(opts: {
  key: string; limit: number; windowSec: number; scope: string;
}): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowStart = now - opts.windowSec * 1000;
  const redisKey = `ratelimit:${opts.scope}:${opts.key}`;

  const pipeline = REDIS.multi();
  pipeline.zremrangebyscore(redisKey, 0, windowStart); // remove antigos
  pipeline.zadd(redisKey, now, `${now}-${Math.random()}`); // adiciona atual
  pipeline.zcount(redisKey, windowStart, now);
  pipeline.expire(redisKey, opts.windowSec);
  const results = await pipeline.exec() as any;
  const count = results[2][1];

  if (count > opts.limit) {
    return { allowed: false, remaining: 0, resetAt: now + opts.windowSec * 1000 };
  }
  return { allowed: true, remaining: opts.limit - count, resetAt: now + opts.windowSec * 1000 };
}

// Middleware
export function rateLimitMiddleware(opts: { limit: number; windowSec: number; scope: string }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id ?? req.ip;
    const result = await rateLimit({
      key: identifier,
      limit: opts.limit,
      windowSec: opts.windowSec,
      scope: opts.scope,
    });
    res.setHeader('X-RateLimit-Limit', opts.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt / 1000));
    if (!result.allowed) {
      return res.status(429).json({
        error: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      });
    }
    next();
  };
}
```

## 11.3 CAPTCHA

- hCaptcha (privacy-friendly) ou Cloudflare Turnstile
- Mostrado após 3 tentativas falhas de login
- Obrigatório em signup público
- Obrigatório em forgot-password

## 11.4 Proteção Brute Force Adicional

- IP ban automático após 100 tentativas falhas em 1h (Cloudflare WAF rule)
- Geoblocking opcional por empresa (bloqueia países não autorizados)
- Device fingerprinting (FingerprintJS) para detectar bots
- Bot management (Cloudflare): challenge page para tráfego suspeito

---

# Capítulo 12 — Segurança Multi-tenant (RLS)

## 12.1 Estratégia

Shared database com discriminador (`company_id` em todas as tabelas de domínio). Isolamento garantido por:

1. **Aplicação:** toda query inclui `companyId: req.user.companyId`
2. **RLS PostgreSQL:** mesmo se aplicação esquecer, banco bloqueia
3. **Audit log:** detecção de tentativas de cross-tenant

## 12.2 Row-Level Security

```sql
-- Habilita RLS em todas as tabelas com company_id
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- (repetir para todas as 30+ tabelas de domínio)

-- Política padrão: só vê linhas da empresa da sessão
CREATE POLICY tenant_isolation ON users
  USING (company_id = current_setting('app.current_company_id', true)::bigint);

CREATE POLICY tenant_isolation ON goals
  USING (company_id = current_setting('app.current_company_id', true)::bigint);

-- Force: mesmo owner respeita RLS (sem bypass)
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE goals FORCE ROW LEVEL SECURITY;
```

## 12.3 Aplicação Seta Context

Toda conexão com banco seta `app.current_company_id` baseado no JWT:

```typescript
// src/lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function withTenant<T>(
  companyId: number,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SET LOCAL app.current_company_id = ${companyId.toString()}`;
    return fn(tx);
  });
}

// Em middleware de auth:
app.use(async (req, res, next) => {
  if (req.user) {
    res.locals.db = await createTenantConnection(req.user.companyId);
  }
  next();
});

async function createTenantConnection(companyId: number) {
  const tx = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SET LOCAL app.current_company_id = ${companyId.toString()}`;
    return tx;
  });
  return tx;
}
```

## 12.4 Validation in Application

Mesmo com RLS, todo query é validado em aplicação:

```typescript
const user = await prisma.user.findFirst({
  where: {
    id: userId,
    companyId: req.user.companyId  // ← sempre!
  }
});
```

## 12.5 Testes de Isolamento

```typescript
// tests/security/tenant-isolation.test.ts
describe('Tenant isolation', () => {
  it('should not allow user from company A to read company B data', async () => {
    const userA = await login(testUsers.companyA_admin);
    const userBGoal = await createGoal(testUsers.companyB_admin, { name: 'Secret' });

    const response = await request(app)
      .get(`/api/goals/${userBGoal.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`);

    expect(response.status).toBe(404); // não 403 (não revela existência)
  });

  it('should not allow direct SQL to bypass', async () => {
    const userA = await login(testUsers.companyA_admin);
    const result = await prisma.$queryRaw`
      SELECT count(*) FROM goals WHERE company_id = ${testUsers.companyB.companyId}
    `;
    // RLS deve bloquear: retorna 0 mesmo com company_id explícito de outra empresa
    expect(result[0].count).toBe(0);
  });
});
```

## 12.6 Pen-test Multi-tenant

- Trimestral: red team testa bypass de tenant
- Bug bounty: categoria "Tenant bypass" tem bounty máximo
- Fuzzing automatizado: para cada endpoint, tentar IDs de outras empresas

---

# Capítulo 13 — LGPD — Direitos do Titular (18 direitos)

A LGPD (Lei 13.709/2018) confere ao titular de dados pessoais 18 direitos (consolidação de arts. 18, 20 e 22). Para cada direito, indicamos a implementação técnica no Orion.

| # | Direito (art.) | Descrição | Implementação Orion | SLA |
|---|---|---|---|---|
| 1 | Confirmação (art. 18, I) | Saber se seus dados são tratados | UC-058 endpoint `GET /api/me/data` | 15 dias |
| 2 | Acesso (art. 18, II) | Receber cópia dos dados | UC-058 exporta JSON completo | 15 dias |
| 3 | Correção (art. 18, III) | Corrigir dados incompletos/inexatos | Tela "Meu Perfil" + UC-060 | Imediato |
| 4 | Anonimização (art. 18, IV) | Tornar dados anônimos | UC-059 mantém histórico comercial | 15 dias |
| 5 | Eliminação (art. 18, V) | Apagar dados ("direito ao esquecimento") | UC-059 soft delete + purge 30d | 15 dias |
| 6 | Portabilidade (art. 18, VI) | Receber em formato estruturado | UC-058 JSON + CSV | 30 dias |
| 7 | Informação de compartilhamento (art. 18, VII) | Saber com quem dados são compartilhados | Política de Privacidade + UC-061 | Imediato |
| 8 | Informação de não consentimento (art. 18, VIII) | Saber se recusou consentimento | Tela "Consentimentos" | Imediato |
| 9 | Revogação de consentimento (art. 8º, §5º) | Retirar consentimento | Tela "Consentimentos" → revoke | Imediato |
| 10 | Oposição (art. 18, §2º) | Opõe-se a tratamento por legítimo interesse | UC-062 solicita oposição | 15 dias |
| 11 | Decisão automatizada (art. 20) | Não ser alvo de decisão automatizada | IA é human-in-the-loop, opt-out IA | Imediato |
| 12 | Revisão de decisão automatizada (art. 20, §1º) | Pedir revisão humana | UC-063 — fluxo manual | 15 dias |
| 13 | Petição contra controlador (art. 18, §6º) | Reclamar à ANPD | Link direto ANPD + suporte | Imediato |
| 14 | Informação sobre uso (art. 9º) | Saber claramente para que serve dados | Política de Privacidade acessível | Imediato |
| 15 | Informação de finalidade específica (art. 9º) | Cada coleta com propósito | Just-in-time notices (banners) | Imediato |
| 16 | Informação de retenção (art. 16) | Saber por quanto tempo | Política de Retenção pública | Imediato |
| 17 | Informação de medidas de segurança (art. 48) | Saber como dados são protegidos | Política de Segurança pública | Imediato |
| 18 | Notificação de incidente (art. 48) | Ser notificado em caso de incidente | Incident response playbook (Cap. 16) | 2 dias úteis ANPD |

## 13.1 Implementação Detalhada — UC-058 (Portabilidade)

```typescript
// src/api/routes/me/data-export.ts
@RequireAuth
@Post('/me/data-export')
async exportMyData(@Req() req: Request) {
  const userId = req.user.id;
  const exportId = await db.dataExportRequest.create({
    data: {
      userId,
      status: 'pending',
      requestedAt: new Date(),
      format: 'json',
    },
  });

  // Job assíncrono (pode demorar para usuários com muito histórico)
  await exportQueue.add('export-user-data', { userId, exportId: exportId.id }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  return { message: 'Sua exportação será processada. Você receberá email com link de download em até 15 dias.', exportId: exportId.id };
}

// worker
async function exportUserData(userId: number, exportId: number) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const data: UserDataExport = {
    meta: {
      format: 'Orion Data Export v1',
      generatedAt: new Date().toISOString(),
      user: { id: user.id, email: user.email, name: user.name },
    },
    profile: await db.user.findUnique({ where: { id: userId } }),
    sessions: await db.session.findMany({ where: { userId } }),
    goals: await db.goal.findMany({ where: { userId } }),
    results: await db.result.findMany({ where: { userId } }),
    campaigns: await db.campaignParticipant.findMany({
      where: { userId },
      include: { campaign: true },
    }),
    awards: await db.award.findMany({ where: { userId } }),
    notifications: await db.notification.findMany({ where: { userId } }),
    auditLogs: await db.auditLog.findMany({ where: { userId } }),
    consents: await db.consent.findMany({ where: { userId } }),
  };

  const json = JSON.stringify(data, null, 2);
  const key = `exports/user-${userId}-${exportId}.json`;
  await s3.putObject({ Bucket: 'orion-exports', Key: key, Body: json, ServerSideEncryption: 'aws:kms' });

  // URL pré-assinada válida por 7 dias
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: 'orion-exports', Key: key }), { expiresIn: 7 * 86400 });

  await sendEmail({
    to: user.email,
    template: 'data-export-ready',
    context: { downloadUrl: url, expiresInDays: 7 },
  });

  await db.dataExportRequest.update({
    where: { id: exportId },
    data: { status: 'completed', completedAt: new Date(), downloadUrl: url },
  });

  await audit.log({ action: 'lgpd.data_exported', userId });
}
```

## 13.2 Implementação — UC-059 (Eliminação / Anonimização)

```typescript
@RequireAuth
@Post('/me/delete-account')
async deleteMyAccount(@Req() req: Request, @Body() body: { reason?: string }) {
  const userId = req.user.id;

  // Confirmação por senha ou 2FA
  if (!await verifyPassword(body.password, user.password)) {
    throw new UnauthorizedError('Password confirmation required');
  }

  // Marca para anonimização em 30 dias (cooling-off)
  await db.user.update({
    where: { id: userId },
    data: {
      deletionRequestedAt: new Date(),
      deletionScheduledFor: addDays(new Date(), 30),
      deletionReason: body.reason,
    },
  });

  // Revoga sessões
  await db.session.deleteMany({ where: { userId } });
  await db.refreshToken.deleteMany({ where: { userId } });

  await sendEmail({ to: user.email, template: 'account-deletion-scheduled', context: { days: 30 } });
  await audit.log({ action: 'lgpd.deletion_requested', userId, meta: { reason: body.reason } });

  return { message: 'Conta marcada para eliminação em 30 dias. Você pode cancelar antes.' };
}

// Cron job diário
async function processScheduledDeletions() {
  const users = await db.user.findMany({
    where: {
      deletionScheduledFor: { lte: new Date() },
      deletionCancelledAt: null,
    },
  });

  for (const user of users) {
    await anonymizeUser(user.id);
  }
}

async function anonymizeUser(userId: number) {
  const anonymousId = `anon_${randomUUID()}`;
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        name: 'Usuário Anonimizado',
        email: `${anonymousId}@anonymized.local`,
        cpf: null,
        rg: null,
        phone: null,
        pictureUrl: null,
        password: null,
        twoFactorSecret: null,
        twoFactorEnabled: false,
        status: 'ANONYMIZED',
        anonymizedAt: new Date(),
      },
    }),
    db.session.deleteMany({ where: { userId } }),
    db.refreshToken.deleteMany({ where: { userId } }),
    db.twoFactorBackupCode.deleteMany({ where: { userId } }),
    db.notification.deleteMany({ where: { userId } }),
    // Mantém: results, goals, campaigns (com userId anonimizado, sem identificar pessoa)
    db.result.updateMany({ where: { userId }, data: { userId: null, anonymousId } }),
    // Audit logs: preserva com hashedUserId (imutável, obrigação legal)
    db.auditLog.updateMany({ where: { userId }, data: { userId: null, anonymizedUserId: anonymousId } }),
  ]);

  await audit.log({ action: 'lgpd.user_anonymized', meta: { anonymousId } });
}
```

## 13.3 Matriz de Bases Legais

| Operação | Base Legal (art.) | Consentimento? |
|---|---|---|
| Cadastro de usuários | Execução de contrato (art. 7º, V) | Não |
| Coleta de dados de desempenho | Execução de contrato | Não |
| Auditoria e logs | Cumprimento de obrigação legal (art. 7º, II) | Não |
| IA analítica | Consentimento (art. 7º, I) — opt-in | Sim |
| Marketing | Consentimento explícito | Sim |
| Cookies não essenciais | Consentimento | Sim |
| Compartilhamento com parceiros (CRM) | Consentimento específico | Sim |

## 13.4 Registro de Consentimentos

```sql
CREATE TABLE consents (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  purpose VARCHAR(100) NOT NULL,  -- 'ai_analytics', 'marketing', 'cookies_non_essential'
  status VARCHAR(20) NOT NULL,    -- 'granted' | 'revoked'
  granted_at TIMESTAMP,
  revoked_at TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  policy_version VARCHAR(20),     -- 'privacy_v1.2_2025-01-15'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON consents(user_id, purpose, status);
```

## 13.5 Política de Retenção

| Tipo de Dado | Período | Após | Ação |
|---|---|---|---|
| Usuário ativo | Indefinido | Desativação | Anonimiza em 2 anos |
| Logs de auditoria | 5 anos | Criação | Purge |
| Logs de sistema | 90 dias | Criação | Purge |
| Logs de erro | 1 ano | Criação | Purge |
| Backups | 30 dias | Criação | Purge |
| Sessões inativas | 30 dias | Última atividade | Purge |
| Dados de licenciamento expirada | 90 dias | Expiração | Purge com notificação |
| Consents revogados | 5 anos | Revogação | Mantém para defesa legal |
| AI conversation logs | 90 dias | Criação | Purge |
| Emails transacionais | 1 ano | Envio | Purge |

## 13.6 DPO

- Designado formalmente pela empresa controladora
- Contato: `dpo@orion.com.br` + formulário web na Política de Privacidade
- Canal de comunicação com ANPD
- Responsável por: DPIA, manter ROPA (Registro de Operações), investigar incidentes
- DPO não pode ter conflito de interesses com outras funções

---

# Capítulo 14 — DPIA — Data Protection Impact Assessment

DPIA (Avaliação de Impacto à Proteção de Dados Pessoais — art. 38 LGPD) é obrigatória quando tratamento apresenta risco alto ao titular. No Orion, DPIA é exigida para:

- Novas features que processam PII em escala
- Uso de IA para decisões que afetem titulares
- Compartilhamento de dados com terceiros
- Transferência internacional de dados
- Novas integrações com sistemas externos

## 14.1 Template DPIA

```markdown
# DPIA — [Nome da Feature]

## 1. Identificação
- Projeto: Orion
- Feature: [nome]
- Data: [YYYY-MM-DD]
- Responsável: [nome]
- DPO: [nome]

## 2. Descrição do Tratamento
- Natureza dos dados: [pessoais, sensíveis, crianças...]
- Finalidade: [descrição clara]
- Base legal: [art. 7º ...]
- Titulares: [clientes, funcionários, prospects...]
- Volume estimado: [número de titulares]

## 3. Necessidade e Proporcionalidade
- Por que esses dados são necessários?
- Há alternativa com menos dados?
- Há alternativa com dados anonimizados?

## 4. Avaliação de Riscos
| Risco | Probabilidade | Impacto | Severidade | Mitigação |
|---|---|---|---|---|
| Vazamento de PII | Baixa | Alto | Alto | AES-256 + RLS + audit |
| Acesso indevido interno | Média | Alto | Alto | Just-in-time access, audit |
| Perda de dados | Baixa | Alto | Médio | Backup 3-2-1 |
| Uso para finalidade não autorizada | Média | Médio | Médio | Consent management |

## 5. Medidas de Segurança
- Técnicas: [lista]
- Organizacionais: [lista]
- Contratuais: [DPA com subprocessors]

## 6. Consulta
- Titulares foram consultados? [Sim/Não/Como]
- DPO foi consultado? [Sim, em DD/MM/YYYY]

## 7. Decisão
- Risco residual aceitável? [Sim/Não]
- Assinatura DPO: ___
- Aprovação CISO: ___
- Data: ___
```

## 14.2 DPIA Realizada — Módulo IA

DPIA-001 | Data: 2025-01-10 | Status: Aprovada

**Descrição:** Chat IA processa perguntas em linguagem natural sobre dados comerciais. Dados enviados a LLM externo (OpenAI/Anthropic).

**Dados enviados ao LLM:**
- Dados comerciais agregados (faturamento, metas, ranking) — não pessoais individualizados
- Pergunta do usuário
- NUNCA: CPF, RG, emails, dados de outras empresas

**Riscos identificados:**
1. LLM retornar dados de outra empresa (cross-tenant leak) — mitigado por RLS no RAG
2. Prompt injection exfiltrar dados — mitigado por guardrails e PII filter
3. Hallucination fornecer dados errados — mitigado por explicabilidade e disclaimer
4. Vendor retém dados — mitigado por contrato zero-retention

**Medidas:**
- Consentimento explícito opt-in (tela "Ativar IA")
- Anonimização de nomes de vendedores antes do envio (substituídos por IDs)
- Filtro de PII antes do prompt (regex + NER)
- Logs de todas as interações (90 dias)
- Direito de oposição via UC-062

**Decisão:** Risco residual MÉDIO, aceitável com consentimento explícito.

## 14.3 Registro de DPIAs

Mantido em `docs/dpia/` versionado. Histórico de DPIAs:

| ID | Feature | Data | Status |
|---|---|---|---|
| DPIA-001 | Módulo IA (Chat) | 2025-01-10 | Aprovada |
| DPIA-002 | Importação via Excel | 2025-01-15 | Aprovada |
| DPIA-003 | Integração WhatsApp | 2025-02-01 | Pendente |
| DPIA-004 | Geolocalização de vendedores | 2025-03-01 | Rejeitada (modificar) |

---

# Capítulo 15 — Auditoria e Logs

## 15.1 Logs de Auditoria (Negócio)

Toda alteração em dados sensíveis gera log imutável com hash encadeado:

```json
{
  "id": 123456,
  "userId": 5,
  "companyId": 1,
  "action": "update",
  "tableName": "goals",
  "recordId": 42,
  "oldValue": {"targetValue": 25000},
  "newValue": {"targetValue": 30000},
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-08-15T14:30:00Z",
  "previousHash": "abc123...",
  "hash": "def456..."
}
```

`hash = SHA256(previousHash + JSON(canonicalPayload))`. Permite detectar tampering (recomputar todos os hashes a partir de um ponto confiável).

### 15.1.1 Ações Auditadas

- Create, Update, Delete em todas as tabelas de domínio
- Login, logout, failed login
- Aprovação/rejeição de resultados
- Alteração de permissões
- Acesso a dados sensíveis (CPF, relatórios exportados)
- Configurações de IA, integrações, webhooks
- Exportações de dados
- Impersonation (início e fim)

### 15.1.2 Implementação (Prisma Middleware)

```typescript
// src/lib/db/audit.ts
prisma.$use(async (params, next) => {
  const result = await next(params);

  const auditableActions = ['create', 'update', 'delete'];
  const auditableModels = ['User', 'Goal', 'Result', 'Campaign', 'License', 'Permission'];

  if (auditableActions.includes(params.action) && auditableModels.includes(params.model)) {
    const req = AsyncLocalStorageContext.getRequest();
    if (!req?.user) return result;

    const oldValue = params.action === 'update'
      ? await getOriginalRecord(params.model, params.args.where)
      : null;

    await auditLog({
      userId: req.user.id,
      companyId: req.user.companyId,
      action: params.action,
      tableName: params.model,
      recordId: result?.id ?? params.args.where?.id,
      oldValue,
      newValue: result,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  return result;
});

async function auditLog(entry: AuditEntry) {
  const last = await db.auditLog.findFirst({ orderBy: { id: 'desc' } });
  const previousHash = last?.hash ?? 'GENESIS';
  const canonical = JSON.stringify({
    previousHash,
    userId: entry.userId,
    action: entry.action,
    tableName: entry.tableName,
    recordId: entry.recordId,
    timestamp: entry.timestamp.toISOString(),
  });
  const hash = crypto.createHash('sha256').update(canonical).digest('hex');

  await db.auditLog.create({ data: { ...entry, previousHash, hash } });
}
```

## 15.2 Logs de Sistema (Técnico)

Estrutura JSON, enviados para ELK / Loki:

```json
{
  "level": "info",
  "timestamp": "2025-08-15T14:30:00.123Z",
  "service": "orion-api",
  "version": "1.0.0",
  "environment": "production",
  "message": "Goal created",
  "meta": {
    "userId": 5,
    "companyId": 1,
    "goalId": 42,
    "requestId": "req_abc123",
    "durationMs": 45
  }
}
```

## 15.3 PII Redaction

Antes de logar, dados sensíveis são redacted:

```typescript
const PII_PATTERNS = [
  { regex: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, replacement: '[CPF]' },
  { regex: /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g, replacement: '[RG]' },
  { regex: /\b\d{14}\b/g, replacement: '[CNPJ]' },
  { regex: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, replacement: '[EMAIL]' },
  { regex: /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, replacement: '[CARD]' },
  { regex: /\b(?:\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/g, replacement: '[PHONE]' },
];

export function redactPII(input: string): string {
  return PII_PATTERNS.reduce((acc, { regex, replacement }) => acc.replace(regex, replacement), input);
}
```

## 15.4 Retenção

| Tipo | Período | Local |
|---|---|---|
| Audit logs (negócio) | 5 anos | PostgreSQL + WORM S3 |
| App logs | 90 dias | Loki / ELK |
| Error logs | 1 ano | Sentry + ELK |
| Access logs (nginx/ALB) | 90 dias | S3 + Athena |
| AI conversation logs | 90 dias | PostgreSQL |

## 15.5 Monitoramento e Alertas

- Múltiplas tentativas de login falhas (>5 em 5min) → alerta Slack
- Acesso de IP incomum (país diferente do usual) → alerta
- Exportação massiva de dados (>1000 registros por usuário em 1h) → alerta
- Tentativa de cross-tenant access → alerta + bloqueio
- Uso de permissões privilegiadas (system.admin, security.impersonate) → alerta
- Acesso fora de horário comercial (configurável) → alerta
- Mudança em configurações de segurança (RLS, MFA, rate limits) → alerta

---

# Capítulo 16 — Incident Response Playbook

## 16.1 Classificação de Severidade

| Severidade | Definição | Exemplos | SLA Resposta |
|---|---|---|---|
| SEV-1 (Crítica) | Vazamento de dados em larga escala, sistema fora do ar | Vazamento de base, RLS quebrado | 15 min |
| SEV-2 (Alta) | Vazamento limitado, funcionalidade crítica comprometida | 1 tenant vazou, auth quebrada | 1h |
| SEV-3 (Média) | Vulnerabilidade sem exploração ativa | CVE high em produção | 4h |
| SEV-4 (Baixa) | Questão de segurança sem impacto imediato | Configuração subótima | 24h |

## 16.2 Papéis

- **Incident Commander (IC):** coordena resposta, comunicação
- **Comms Lead:** comunicação interna/externa, ANPD, clientes
- **Tech Lead:** investigação técnica, contenção, erradicação
- **DPO:** notificação ANPD, comunicação com titulares
- **Legal:** avaliação de obrigações contratuais
- **CISO:** autorizações (shutdown, public disclosure)

## 16.3 Playbook Detalhado — Vazamento de Dados

### Fase 1: Detecção (0-1h)

```markdown
### Sinais de detecção
- Alerta SIEM: spike de queries em tabelas PII
- Report externo (researcher, cliente, mídia)
- Post em fórum/Reddit/PasteBin com dados Orion
- Acesso anômalo de service account
- Erro 500 com stack trace exposta

### Ações imediatas
1. Acionar on-call (PagerDuty: SEV-1)
2. IC cria canal #incident-XXX no Slack
3. Iniciar timer de "tempo desde detecção"
4. Registrar tudo em incident log
5. NÃO apagar logs/evidências (preservar)
6. Snapshot de instâncias afetadas (para forense)
```

### Fase 2: Contenção (1-4h)

```markdown
### Isolamento
- Bloquear credenciais comprometidas (revoga tokens, reset senhas)
- Bloquear IPs suspeitos (WAF)
- Isolar hosts comprometidos (terminate, snapshot para forense)
- Desabilitar features afetadas (kill switch)
- Reiniciar chaves JWT (força re-login global)
- Re-encryptar dados expostos (após backup forense)

### Comunicação inicial (interna)
- Email a board: "Incidente de segurança em investigação"
- Slack #security-incidents: detalhes técnicos
- Status page: "Investigando incidente de segurança"
```

### Fase 3: Erradicação (4-24h)

```markdown
### Root cause analysis
- Forense nos snapshots
- Replay dos logs (quem acessou o quê, quando)
- Identificação do vetor (Phishing? Vuln? Insider? Misconfig?)

### Fixes
- Aplicar patch da vuln
- Reset de todas as credenciais potencialmente comprometidas
- Atualizar chaves de criptografia
- Revisar e fortalecer controles relacionados
- Deploy de fix em todos os ambientes
```

### Fase 4: Recuperação (24-72h)

```markdown
### Restauração
- Restaurar serviços em ordem de criticidade
- Monitorar 24/7 por 1 semana para reincidência
- Validar integridade dos dados (comparações, hashes)
- Smoke tests automatizados

### Comunicação externa
- Notificação ANPD (até 2 dias úteis da detecção)
- Notificação titulares afetados (prazo razoável)
- Public disclosure (para incidentes graves, blog post)
```

### Fase 5: Pós-Incidente (1-2 semanas)

```markdown
### Post-mortem (blameless)
- Documento em docs/postmortems/YYYY-MM-DD-incident.md
- Timeline detalhada
- Root cause
- O que funcionou
- O que não funcionou
- Action items (com owner e data)

### Melhorias
- Implementar action items (trackeados em Jira)
- Atualizar threat model
- Atualizar playbook com lições
- Treinar equipe em novos procedimentos
- Bug bounty payout se aplicável
```

## 16.4 Templates de Comunicação

### 16.4.1 Notificação ANPD (template)

```
À ANPD — Autoridade Nacional de Proteção de Dados

NOTIFICAÇÃO DE INCIDENTE DE SEGURANÇA
(Art. 48 da LGPD e Resolução CD/ANPD nº 15/2024)

1. CONTROLADOR
Empresa: [Razão Social]
CNPJ: [XX.XXX.XXX/0001-XX]
DPO: [Nome], contato: dpo@orion.com.br

2. DESCRIÇÃO DO INCIDENTE
Natureza: [vazamento / acesso indevido / perda / alteração]
Data de detecção: [DD/MM/YYYY HH:MM]
Data de ocorrência estimada: [DD/MM/YYYY HH:MM]

3. DADOS PESSOAIS AFETADOS
[Categoria: identificadores, profissionais, etc.]
[Quantidade estimada de titulares]
[Quantidade de registros]

4. MEDIDAS TÉCNICAS DE SEGURANÇA ADOTADAS
[Lista: criptografia, RLS, etc.]

5. CAUSA RAIZ (se conhecida)
[Descrição técnica]

6. RISCO AO TITULAR
[Análise: alto/médio/baixo + justificativa]

7. MEDIDAS TOMADAS E A TOMAR
[Contenção, erradicação, recuperação]

8. MEDIDAS QUE O TITULAR PODE TOMAR
[Troca de senha, monitorar contas, etc.]

9. COMUNICAÇÃO AOS TITULARES
[Data e meio]

Assinado,
[DPO]
```

### 16.4.2 Notificação a Titulares (email template)

```
Assunto: Notificação de Incidente de Segurança — Ação Recomendada

Prezado(a) [Nome],

Em [DD/MM/YYYY], identificamos um incidente de segurança que pode ter
exposto alguns de seus dados pessoais. Tomamos as medidas imediatas
para conter o incidente e estamos notificando você em conformidade
com a LGPD.

DADOS POTENCIALMENTE AFETADOS:
- [Lista específica: nome, email, cargo...]

DADOS NÃO AFETADOS:
- Senhas (sempre criptografadas)
- CPF/CNPJ (criptografados em repouso)

O QUE FAZEMOS:
- Contivemos o incidente em [HH:MM]
- Reiniciamos todas as senhas como precaução
- Notificamos a ANPD

O QUE VOCÊ DEVE FAZER:
1. Acesse https://app.orion.com/reset-password e troque sua senha
2. Ative autenticação de dois fatores
3. Monitore atividades suspeitas em sua conta
4. Em caso de dúvida, contate dpo@orion.com.br

Lamentamos o ocorrido. Segurança dos seus dados é nossa prioridade.

Atenciosamente,
[DPO]
Orion
```

## 16.5 Tabletop Exercises

Mensalmente: exercício de simulação (tabletop) com cenário hipotético:
- Janeiro: phishing attack em admin master
- Fevereiro: ransomware em servidor de backup
- Março: insider exfiltrando dados
- Abril: CVE critical em dependência
- Maio: cloud provider outage
- Junho: LLM prompt injection exfiltrando dados

Cada exercício avalia:
- Tempo de detecção
- Tempo de contenção
- Qualidade da comunicação
- Effectiveness dos runbooks

---

# Capítulo 17 — Pen Test Checklist

## 17.1 Frequência

| Tipo | Frequência | Responsável |
|---|---|---|
| Pentest externo completo | Anual | Empresa terceira credenciada |
| Pentest antes de major release | Por release | Equipe interna red team |
| Pentest multi-tenant | Trimestral | Equipe interna |
| Pentest em novas integrações | Por integração | Equipe interna |
| Bug bounty contínuo | Contínuo | HackerOne |

## 17.2 Escopo Padrão

### 17.2.1 Auth & Session
- [ ] Bypass de login
- [ ] Brute force (com e sem rate limit)
- [ ] JWT manipulation (alg=none, kid injection)
- [ ] Refresh token reuso
- [ ] Session fixation
- [ ] Cookie theft via XSS
- [ ] OAuth state/nonce bypass
- [ ] 2FA bypass (race condition, brute TOTP)
- [ ] Backup code brute force
- [ ] Password reset poisoning

### 17.2.2 Authorization
- [ ] IDOR (Insecure Direct Object Reference) em todos os endpoints CRUD
- [ ] Cross-tenant access (RLS bypass)
- [ ] Privilege escalation vertical (vendedor → admin)
- [ ] Privilege escalation horizontal (vendedor A → vendedor B)
- [ ] Force browsing para rotas admin
- [ ] API endpoint discovery
- [ ] Mass assignment (atributos role, companyId no body)
- [ ] JWT tampering (alterar role/permissions)

### 17.2.3 Input Validation
- [ ] SQL injection (todas as queries com input do usuário)
- [ ] NoSQL injection (se aplicável)
- [ ] Command injection (file upload, integrations)
- [ ] LDAP injection (não usado, mas validar)
- [ ] XSS reflected (todos os parâmetros refletidos)
- [ ] XSS stored (todos os campos que renderizam HTML)
- [ ] XXE (se houver parsing XML)
- [ ] SSRF (webhooks, image proxy, OAuth callbacks)
- [ ] Path traversal (file serving, uploads)
- [ ] Open redirect (parâmetros redirect_uri)
- [ ] Template injection (SSTI)
- [ ] Deserialization (qualquer input JSON.parse)

### 17.2.4 Cryptography
- [ ] TLS configuration (sslscan)
- [ ] Cipher suites aceitas
- [ ] HSTS presente
- [ ] Certificate pinning (mobile/desktop)
- [ ] Senhas com bcrypt cost 12
- [ ] JWT com RS256 (não HS256)
- [ ] AES-256-GCM para PII (verificar IV, tag)
- [ ] Random number generation (crypto.randomBytes)

### 17.2.5 Business Logic
- [ ] Race conditions (criar 2x com mesmo ID)
- [ ] Time-based attacks (TTO em优惠券)
- [ ] Negative quantity / amount
- [ ] Integer overflow em metas
- [ ] Logic bypass em workflows de aprovação
- [ ] Rate limit bypass (paralelismo, IP rotation)

### 17.2.6 Configuration
- [ ] Directory listing
- [ ] Default credentials
- [ ] Debug endpoints (/debug, /__coverage)
- [ ] Stack traces em erros 500
- [ ] Source maps expostos
- [ ] .env/.git expostos
- [ ] Backup files (.bak, .old)
- [ ] HTTP methods (TRACE, PUT, DELETE)
- [ ] CORS permissivo
- [ ] CSP ausente ou fraca

### 17.2.7 Infrastructure
- [ ] Portas abertas desnecessárias
- [ ] S3 buckets públicos
- [ ] DB acessível pela internet
- [ ] Redis sem auth
- [ ] Metadata service exposto (169.254.169.254)
- [ ] Kubernetes dashboard exposto
- [ ] Container escape (se aplicável)

### 17.2.8 Third-Party
- [ ] Dependências com CVEs (npm audit, Snyk)
- [ ] Subresource Integrity em scripts externos
- [ ] Webhook signatures verificadas
- [ ] OAuth client secrets vazados
- [ ] API keys em código

## 17.3 Ferramentas Recomendadas

| Categoria | Ferramenta |
|---|---|
| DAST | OWASP ZAP, Burp Suite Pro |
| SAST | SonarQube, Semgrep, CodeQL |
| SCA | Snyk, Dependabot, Trivy |
| Container scan | Trivy, Grype |
| Infra scan | Nuclei, Lynis, kube-bench |
| Fuzzing | ffuf, wfuzz, Burp Intruder |
| Auth test | JWT.io, jwt_tool |
| SQLi | sqlmap |
| XSS | XSStrike |
| SSL/TLS | sslscan, testssl.sh |
| Recon | subfinder, amass, httpx |

## 17.4 Critérios de Aceitação

| Severidade | Definição | SLA Fix |
|---|---|---|
| Critical | RCE, SQLi, auth bypass, vazamento PII | 24h |
| High | IDOR, privilege escalation, XSS stored | 7 dias |
| Medium | XSS reflected, CSRF, info disclosure | 30 dias |
| Low | Missing headers, verbose errors | 90 dias |

Relatório de pen test deve incluir:
- Executive summary
- Findings com CVSS
- Evidências (screenshots, payloads, HTTP requests)
- Recomendações
- Retest após fixes

---

# Capítulo 18 — Preparação SOC 2 / ISO 27001

## 18.1 SOC 2 Type II

**Trust Services Criteria (TSC):** Security, Availability, Processing Integrity, Confidentiality, Privacy.

### 18.1.1 Controles Comuns (Common Criteria)

| CC | Descrição | Implementação Orion |
|---|---|---|
| CC1 | Control Environment | Code of conduct, ethics training anual |
| CC2 | Communication | Política de segurança pública, treinamento onboarding |
| CC3 | Risk Assessment | Risk register, annual risk assessment, DPIA |
| CC4 | Monitoring Activities | Continuous monitoring, audit log review, KPIs |
| CC5 | Control Activities | RBAC, change management, segregation of duties |
| CC6 | Logical and Physical Access | RBAC + MFA, RLS, just-in-time prod access, badge access |
| CC7 | System Operations | Incident response, backups, DR drills |
| CC8 | Change Management | Git PRs, CI/CD, code review, environment segregation |
| CC9 | Risk Mitigation | Vendor assessment, BCP, business continuity |

### 18.1.2 Preparação

1. **Gap assessment** (3-6 meses antes): auditor interno identifica gaps vs SOC 2 framework
2. **Remediation**: implementar controles faltantes
3. **Pre-audit**: auditor terceiro (Baker Tilly, Schellman, AICPA firm) faz readiness assessment
4. **Observation period**: 6-12 meses coletando evidências
5. **Audit formal**: auditor emite opinião
6. **Renovação anual**

### 18.1.3 Evidências a Coletar

- Logs de acesso (produção, código, infra)
- Logs de auditoria (RLS, auth changes)
- Tickets de change management (Jira)
- PRs com review aprovado (GitHub)
- Treinamento de segurança (assinaturas)
- Background checks (funcionários)
- Vendor assessments (subprocessadores)
- Incident response records
- Backup restore tests
- DR drill records
- Vulnerability scans (mensais)
- Pen test reports (anuais)

## 18.2 ISO 27001

**Padrão:** ISMS (Information Security Management System).

### 18.2.1 Estrutura

- Cláusulas 4-10: contexto, liderança, planejamento, suporte, operação, performance, melhoria
- Anexo A: 93 controles em 4 domínios (organizacionais, pessoas, físicos, tecnológicos)

### 18.2.2 Statement of Applicability (SoA)

Documento que lista quais dos 93 controles do Anexo A se aplicam ao Orion, justificando inclusões e exclusões.

Exemplo de entrada:
| Controle | Aplicável? | Justificativa | Implementação |
|---|---|---|---|
| A.5.1 Políticas de segurança | Sim | Obrigatório | Doc 11 + Doc 20 |
| A.5.7 Threat intelligence | Sim | Defesa em profundidade | Feed MISP, MDR |
| A.5.23 Segurança cloud services | Sim | SaaS em AWS | Cloud custodia, AWS config |
| A.5.30 ICT readiness for business continuity | Sim | Disponibilidade | BCP, DR, RTO/RPO definidos |
| A.6.3 Security awareness | Sim | Todo staff | Treinamento anual |
| A.8.16 Monitoring activities | Sim | Detecção | SIEM, alertas |
| A.8.23 Web filtering | Sim | Prevenção | Cloudflare gateway |
| A.8.28 Secure coding | Sim | Dev secure | SAST, code review, OWASP |

### 18.2.3 Risk Assessment Methodology

- **Assets:** identificados em inventário (data, software, hardware, pessoas)
- **Threats:** STRIDE + setor (indústria: ataques típicos)
- **Vulnerabilities:** scan contínuo + threat modeling
- **Risk = Likelihood × Impact** (matriz 5×5)
- **Treatment:** Accept / Mitigate / Transfer / Avoid
- **Risk register:** mantido em GRC tool (Drata, Vanta)

## 18.3 Diferenças SOC 2 vs ISO 27001

| Aspecto | SOC 2 | ISO 27001 |
|---|---|---|
| Foco | Controles operacionais | ISMS (sistema de gestão) |
| Tipo | Attestation (opinião) | Certification |
| Auditoria | Anual | Anual (surveillance + recertification trienal) |
| Geografia | EUA (reconhecido global)) | Global |
| Output | Report | Certificate |
| Duração | 6-12m observation | 3y cycle |

Orion busca **ambos** (SOC 2 Type II em 2025-Q3, ISO 27001 em 2026-Q1).

## 18.4 Outros Frameworks

- **PCI DSS:** não aplicável (não processamos cartões diretamente, usa Stripe)
- **HIPAA:** não aplicável (não saúde)
- **GDPR:** aplicável (clientes EU)
- **CCPA/CPRA:** aplicável (clientes Califórnia)
- **LGPD:** aplicável (Brasil, foco principal)

---

# Capítulo 19 — Backup e Disaster Recovery

## 19.1 Estratégia 3-2-1

- **3** cópias dos dados
- **2** mídias diferentes (disco + cloud)
- **1** cópia offsite (outra região cloud)

## 19.2 RTO e RPO

| Cenário | RTO | RPO |
|---|---|---|
| Falha de container | 5 min | 0 (stateless) |
| Falha de disco | 1h | 1h |
| Falha de servidor | 4h | 4h |
| Desastre regional | 24h | 24h |
| Falha de provedor cloud | 48h | 24h |

## 19.3 Backups

### 19.3.1 Banco de Dados

- **Full backup diário** (02h UTC) → snapshot RDS → S3 cross-region
- **Incremental (WAL)** contínuo → point-in-time recovery (PITR) até 35 dias
- **Retenção:** 30 dias diários + 12 snapshots mensais (1 ano) + 4 snapshots anuais (7 anos para compliance)

### 19.3.2 Storage (S3)

- **Versioning habilitado** em todos os buckets
- **Cross-region replication** para bucket de backups
- **MFA delete** em buckets críticos (requer token físico)

### 19.3.3 Redis

- **RDB snapshot diário** + **AOF** (append-only file) com fsync everysec
- Não é persistência primária (dados críticos estão no PostgreSQL)

### 19.3.4 Configuração (Vault, KMS, etc.)

- Backup diário automático dos secrets
- Stored em HSM (não recuperável sem processo formal)

## 19.4 Testes de Restauração

- Backup restaurado semanalmente em ambiente isolado (sandbox)
- Verificação de integridade automatizada (hash, count de registros)
- Drill de disaster recovery trimestral (com cronômetro)
- Resultados documentados: tempo real vs SLA

## 19.5 Plano de Recuperação

### Passo 1: Provisionar Nova Infra
- Cloud: Terraform aplica em nova região (cold standby)
- On-Premise: instalar em novo servidor

### Passo 2: Restaurar Backup
- Restaurar último backup do PostgreSQL
- Restaurar arquivos do S3 (replicado)
- Re-emitir chaves JWT (forçar re-login)
- Restaurar secrets do Vault

### Passo 3: Atualizar DNS
- Apontar para nova infraestrutura
- TTL baixo (60s) para propagação rápida
- Health check antes de cortar tráfego

### Passo 4: Validar
- Smoke tests automatizados
- Verificar contagem de registros
- Verificar último log de auditoria (continuidade)
- Comunicação a clientes

## 19.6 Business Continuity Plan (BCP)

- Documentado em `docs/bcp/`
- Contatos de emergência (board, DPO, key vendors)
- Critérios para declarar desastre (vs incidente)
- Procedimentos alternativos manuais (se sistema indisponível >4h)
- Treinamento anual de BCP

---

# Capítulo 20 — Segurança Física, Operacional e Supply Chain

## 20.1 Acesso ao Código

- Repositório privado (GitHub Enterprise Cloud)
- 2FA obrigatório para todos os desenvolvedores (TOTP ou hardware key)
- Branch protection: `main` exige 2 reviews + CI green
- CODEOWNERS por diretório (revisão obrigatória por especialista)
- Commits assinados (GPG ou Sigstore Gitsign)
- Push protection habilitado (GitHub blocks secrets)
- Pre-commit hooks: detect-secrets, npm audit

## 20.2 Acesso à Produção

- **Princípio:** default-deny; acesso just-in-time aprovado
- **Quem:** apenas SRE/DevOps designados (lista <10 pessoas)
- **Como:** VPN + bastion host (Teleport ou AWS Session Manager)
- **Sessões gravadas:** teleconsole / asciinema
- **Duração:** máximo 4h, renovação exige re-aprovação
- **Auditoria:** toda sessão logada + review semanal
- **Break-glass:** conta de emergência em HSM (uso aciona CISO alert)

## 20.3 Segredos

- HashiCorp Vault (cloud) ou AWS Secrets Manager
- Rotação automática a cada 90 dias (DB creds, API keys)
- Audit log de todos os `read` (quem, quando, qual segredo)
- Dynamic secrets (DB credentials geradas por request com TTL 1h)
- Não há segredos long-lived em CI/CD (GitHub Actions OIDC)

## 20.4 Segurança Física (escritório)

- Data centers: AWS/GCP (responsabilidade do provedor)
- Escritório Orion: controle de acesso por cartão + CCTV
- Visitantes: acompanhados, sem acesso a areas técnicas
- Workstations: disk encryption (FileVault/BitLocker), screen lock 5min
- Dispositivos móveis: MDM (Jamf/Intune), remote wipe
- Política clean desk (sem docs sensíveis expostos)
- Shred de documentos físicos

## 20.5 Pessoas

- Background check no hiring (cv, antecedentes, referências)
- NDA assinado
- Treinamento de segurança obrigatório no onboarding
- Treinamento anual de refresh
- Phishing simulation trimestral (KnowBe4 ou similar)
- Awareness program (campanhas mensais)
- Offboarding checklist (revoga acessos em <24h)

## 20.6 Supply Chain / Third-Party Risk

### 20.6.1 Vendor Assessment

Antes de integrar vendor:
1. Preencher questionário de segurança (SIG, CAIQ)
2. Review de certificações (SOC 2, ISO 27001)
3. DPA — Data Processing Agreement assinado
4. Avaliação de impacto (subprocessador afeta LGPD?)
5. Aprovação do CISO + Legal

### 20.6.2 Subprocessadores (Registro Público)

Lista pública em `orion.com/subprocessadores`:
- AWS (hosting)
- Cloudflare (CDN/WAF)
- SendGrid (email)
- Stripe (pagamentos)
- OpenAI (LLM)
- Anthropic (LLM)
- Sentry (error tracking)
- Datadog (monitoring)

Clientes podem opor-se a novos subprocessadores (notificação 30 dias antes).

### 20.6.3 SBOM (Software Bill of Materials)

- Gerado a cada release via `cyclonedx`
- Armazenado em `dist/sbom.json`
- Disponível para clientes Enterprise mediante NDA
- Alertas automáticos de CVEs em dependências

### 20.6.4 Sigstore / Cosign

- Imagens Docker assinadas com Cosign
- Verificação no cluster Kubernetes via Kyverno/OPA
- Rejeita imagens não assinadas

```bash
# Assinatura
cosign sign --key awskms:///alias/orion-signing orion/app:1.0.0

# Verificação no cluster
cosign verify --key awskms:///alias/orion-signing orion/app:1.0.0
```

---

# Capítulo 21 — Apêndices

## A.1 Glossário

| Termo | Definição |
|---|---|
| 2FA | Two-Factor Authentication |
| AES-GCM | Advanced Encryption Standard — Galois/Counter Mode |
| ANPD | Autoridade Nacional de Proteção de Dados (Brasil) |
| CMK | Customer Master Key (KMS) |
| CSP | Content Security Policy |
| CSRF | Cross-Site Request Forgery |
| DLP | Data Loss Prevention |
| DPIA | Data Protection Impact Assessment |
| DPO | Data Protection Officer (Encarregado) |
| DEK | Data Encryption Key |
| HSTS | HTTP Strict Transport Security |
| HSM | Hardware Security Module |
| IDOR | Insecure Direct Object Reference |
| JWKS | JSON Web Key Set |
| JWT | JSON Web Token |
| KMS | Key Management Service |
| LGPD | Lei Geral de Proteção de Dados |
| mTLS | mutual TLS |
| OIDC | OpenID Connect |
| PII | Personally Identifiable Information |
| PKCE | Proof Key for Code Exchange |
| RLS | Row-Level Security |
| SBOM | Software Bill of Materials |
| SAST | Static Application Security Testing |
| SCA | Software Composition Analysis |
| SOC | Service Organization Control |
| SPIFFE | Secure Production Identity Framework for Everyone |
| SSN | Shamir Secret Sharing |
| STRIDE | Spoofing/Tampering/Repudiation/Info Disclosure/DoS/Elevation |
| TOTP | Time-based One-Time Password |
| WAF | Web Application Firewall |
| WORM | Write Once Read Many |

## A.2 Referências

- OWASP Top 10 (2021): https://owasp.org/Top10/
- OWASP ASVS 4.0 (Application Security Verification Standard)
- NIST SP 800-63B (Digital Identity Guidelines)
- NIST SP 800-53 (Security Controls)
- CIS Critical Security Controls v8
- RFC 6238 (TOTP)
- RFC 8446 (TLS 1.3)
- RFC 7519 (JWT)
- RFC 7636 (PKCE)
- LGPD Lei 13.709/2018
- ANPD Resoluções
- ISO/IEC 27001:2022
- ISO/IEC 27002:2022
- AICPA SOC 2 Trust Services Criteria
- Cloud Security Alliance (CSA) Cloud Controls Matrix

## A.3 Change Log

| Versão | Data | Mudanças | Autor |
|---|---|---|---|
| 1.0.0 | 2025-01-15 | Versão inicial expandida (Fase 2) | Eng. de Segurança |
| 0.9.0 | 2024-12-01 | Rascunho inicial | Eng. de Segurança |

## A.4 Aprovações

| Papel | Nome | Data | Assinatura |
|---|---|---|---|
| CISO | _______ | ___ | ___ |
| DPO | _______ | ___ | ___ |
| Engineering Lead | _______ | ___ | ___ |
| Legal | _______ | ___ | ___ |

---

**Fim do Documento 11 — Security & LGPD Compliance**
