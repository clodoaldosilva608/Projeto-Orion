import type { ApiResponse, PaginationMeta } from '@/shared/types/global.types'

/**
 * Cria uma resposta de sucesso padronizada
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: PaginationMeta
): ApiResponse<T> {
  return { data, error: null, message, meta }
}

/**
 * Cria uma resposta de erro padronizada
 */
export function errorResponse(error: string, message?: string): ApiResponse<null> {
  return { data: null, error, message }
}

/**
 * Calcula metadados de paginação
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number
): PaginationMeta {
  const totalPages = Math.ceil(total / perPage)
  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Sanitiza parâmetros de paginação recebidos via query string
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const perPage = Math.min(100, Math.max(1, Number(searchParams.get('per_page') ?? 20)))
  const search = searchParams.get('search') ?? undefined
  const orderBy = searchParams.get('order_by') ?? 'created_at'
  const orderDir = (searchParams.get('order_dir') ?? 'desc') as 'asc' | 'desc'

  return { page, perPage, skip: (page - 1) * perPage, search, orderBy, orderDir }
}

/**
 * Formata moeda brasileira
 */
export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Formata percentual
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Retorna siglas iniciais do nome (para avatares)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Delay (útil para testes e debounce)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
