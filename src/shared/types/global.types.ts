// ================================================================
// ORION - Tipos Globais
// ================================================================

// Resposta padrão da API
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  message?: string
  meta?: PaginationMeta
}

// Paginação
export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Parâmetros de paginação
export interface PaginationParams {
  page?: number
  perPage?: number
  search?: string
  orderBy?: string
  orderDir?: 'asc' | 'desc'
}

// Usuário autenticado (contexto da sessão)
export interface AuthUser {
  id: string         // UUID do supabase
  email: string
  companyId: bigint
  branchId?: bigint
  roleId?: bigint
  name: string
  avatarUrl?: string
}

// Contexto do tenant (injetado via middleware)
export interface TenantContext {
  companyId: bigint
  userId: bigint
  requestId: string
}

// Status de operação genérico
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error'

// Erro padronizado
export interface OrionError {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}
