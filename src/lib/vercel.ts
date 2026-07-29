/**
 * Vercel API Client — Orion Platform
 *
 * Gerencia subdomínios no projeto PagueMenos na Vercel.
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
 * Adiciona um domínio ao projeto PagueMenos na Vercel.
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
 * Se o tenant tem subdomain 'clienteA', retorna:
 *   https://clienteA.projeto-paguemenos.vercel.app
 *
 * Para que isso funcione, o projeto PagueMenos na Vercel deve ter
 * o wildcard domain *.projeto-paguemenos.vercel.app configurado.
 */
export function getTenantUrl(subdomain: string | null): string {
  if (!subdomain) {
    return "https://projeto-paguemenos.vercel.app";
  }
  return `https://${subdomain}.projeto-paguemenos.vercel.app`;
}
