import { createClient } from '@supabase/supabase-js'

/**
 * Cliente administrativo do Supabase (usa a service_role key).
 * Deve ser usado APENAS em Server Actions/Server Components — nunca no cliente.
 * Necessário para operações privilegiadas como invitar usuários por e-mail.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'As variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY são necessárias para o cliente administrativo.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  })
}
