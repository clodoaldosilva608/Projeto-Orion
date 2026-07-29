/**
 * Vercel API Client — Orion Platform
 *
 * Gerencia subdomínios no projeto Orion Gestão Comercial na Vercel.
 * Para wildcard domains (*.projeto-paguemenos.vercel.app), a Vercel
 * resolve automaticamente — não precisa de API call por tenant.
 * Este módulo é usado apenas para:
 *   1. Verificar status de domínios
 *   2. Adicionar custom domains (ex: cliente.com.br)
 *   3. Remover domínios quando tenant é cancelado
 */

const VERCEL_API = "https://api.vercel.com";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PAGUEMENOS_PROJECT_ID = process.env.PAGUEMENOS_VERCEL_PROJECT_ID;

export const vercelConfigured = Boolean(VERCEL_TOKEN && PAGUEMENOS_PROJECT_ID);

/**
 * Adiciona um domínio ao projeto Orion Gestão Comercial na Vercel.
 * Para subdomínios (*.projeto-paguemenos.vercel.app), se o wildcard
 * já estiver configurado, NÃO é necessário chamar esta função.
 * Use apenas para custom domains (ex: cliente.com.br).
 */
export async function addProjectDomain(domain: string): Promise<{
  ok: boolean;
  domain?: any;
  error?: string;
}> {
  if (!vercelConfigured) {
    return { ok: false, error: "Vercel não configurado (VERCEL_TOKEN ou PAGUEMENOS_VERCEL_PROJECT_ID)" };
  }

  try {
    const resp = await fetch(
      `${VERCEL_API}/v10/projects/${PAGUEMENOS_PROJECT_ID}/domains`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: domain,
          gitBranch: "main",
        }),
      }
    );

    const data = await resp.json();

    if (resp.ok) {
      console.log(`[vercel] ✓ Domínio adicionado: ${domain}`);
      return { ok: true, domain: data };
    }

    // 409 = domínio já existe (não é erro)
    if (resp.status === 409) {
      console.log(`[vercel] Domínio já existe: ${domain}`);
      return { ok: true, domain: { name: domain, alreadyExists: true } };
    }

    return { ok: false, error: data?.error?.message || `HTTP ${resp.status}` };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

/**
 * Verifica status de um domínio no projeto.
 */
export async function getDomainStatus(domain: string): Promise<{
  ok: boolean;
  status?: string;
  verified?: boolean;
  error?: string;
}> {
  if (!vercelConfigured) {
    return { ok: false, error: "Vercel não configurado" };
  }

  try {
    const resp = await fetch(
      `${VERCEL_API}/v9/projects/${PAGUEMENOS_PROJECT_ID}/domains/${domain}`,
      {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      }
    );

    const data = await resp.json();

    if (resp.ok) {
      return {
        ok: true,
        status: data.configStatus || data.status,
        verified: data.verified,
      };
    }

    return { ok: false, error: data?.error?.message || `HTTP ${resp.status}` };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

/**
 * Remove um domínio do projeto (quando tenant é cancelado).
 */
export async function removeProjectDomain(domain: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!vercelConfigured) {
    return { ok: false, error: "Vercel não configurado" };
  }

  try {
    const resp = await fetch(
      `${VERCEL_API}/v9/projects/${PAGUEMENOS_PROJECT_ID}/domains/${domain}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      }
    );

    if (resp.ok) {
      console.log(`[vercel] ✓ Domínio removido: ${domain}`);
      return { ok: true };
    }

    const data = await resp.json();
    return { ok: false, error: data?.error?.message || `HTTP ${resp.status}` };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

/**
 * Gera a URL do subdomínio do tenant.
 *
 * Estratégia:
 * - Se PAGUEMENOS_BASE_URL estiver configurada (ex: https://app.orion.com.br),
 *   usa subdomínio: https://{subdomain}.app.orion.com.br
 * - Se não, usa a URL base do deploy atual do Orion Gestão Comercial
 *   (sem subdomínio — o tenant é identificado pelo JWT no SSO)
 *
 * NOTA: Para subdomínios reais (*.vercel.app), é necessário:
 *   1. Plano Vercel Pro (wildcard domains), OU
 *   2. Domínio customizado com wildcard DNS
 */
export function getTenantUrl(subdomain: string | null): string {
  // Se tem domínio customizado configurado, usa subdomínio
  const baseUrl = process.env.PAGUEMENOS_BASE_URL;
  if (baseUrl) {
    if (!subdomain || subdomain === "paguemenos") {
      return baseUrl;
    }
    // Extrai o domínio base (ex: https://app.orion.com.br → app.orion.com.br)
    try {
      const host = new URL(baseUrl).hostname;
      return `https://${subdomain}.${host}`;
    } catch {
      return baseUrl;
    }
  }

  // Sem domínio customizado: usa URL base do deploy do Orion Gestão Comercial
  // O tenant é identificado pelo JWT no SSO, não pelo subdomínio
  return process.env.PAGUEMENOS_DEPLOY_URL || "https://paguemenos-nine.vercel.app";
}
