'use server'

import { createClient } from '@/shared/lib/supabase-server'
import { redirect } from 'next/navigation'
import type { LoginCredentials, RegisterData } from '@/modules/auth/types/auth.types'

/**
 * Login com email e senha via Supabase
 */
export async function loginAction(credentials: LoginCredentials) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { data, error: null }
}

/**
 * Logout - invalida sessão no Supabase
 */
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/**
 * Registro de nova empresa + usuário admin
 */
export async function registerAction(registerData: RegisterData) {
  const supabase = await createClient()

  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: registerData.email,
    password: registerData.password,
    options: {
      data: {
        name: registerData.name,
        company_name: registerData.companyName,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Criar empresa e usuário no banco via API route
  if (authData.user) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseId: authData.user.id,
        name: registerData.name,
        email: registerData.email,
        companyName: registerData.companyName,
        cnpj: registerData.cnpj,
      }),
    })

    if (!response.ok) {
      const body = await response.json()
      return { error: body.error ?? 'Erro ao criar empresa' }
    }
  }

  return { data: authData, error: null }
}

/**
 * Solicitar redefinição de senha
 */
export async function resetPasswordAction(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
