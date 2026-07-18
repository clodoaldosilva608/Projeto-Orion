// ================================================================
// ORION - Licensing helpers (FASE 12)
// Funções PURAS de validação de chave de licença.
// Extraídas de licensing.actions.ts para serem testáveis de forma
// isolada (sem Prisma / Supabase).
// ================================================================

export const LICENSE_KEY_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

/** Normaliza a entrada do usuário (trim + uppercase). */
export function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase()
}

/** Retorna true se a chave estiver no formato XXXX-XXXX-XXXX. */
export function isValidLicenseKey(key: string): boolean {
  return LICENSE_KEY_REGEX.test(normalizeLicenseKey(key))
}
