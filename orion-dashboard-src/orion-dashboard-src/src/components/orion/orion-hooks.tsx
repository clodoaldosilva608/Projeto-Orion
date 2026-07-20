'use client'

/**
 * Hooks para mutations e toast notifications
 * Conecta a UI com as API routes
 */
import { useState, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

// =====================================================
// TOAST SYSTEM
// =====================================================

type ToastType = 'success' | 'error' | 'warning' | 'info'
type Toast = { id: string; type: ToastType; message: string }

const ToastContext = createContext<{
  toasts: Toast[]
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: string) => void
} | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Fallback for when context isn't available
    return {
      toasts: [],
      addToast: (type: ToastType, message: string) => {
        console.log(`[${type}] ${message}`)
      },
      removeToast: () => {},
    }
  }
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const icons = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[200] space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`flex items-start gap-3 p-3.5 rounded-xl border shadow-lg ${colors[toast.type]}`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[toast.type]}`} />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 opacity-50 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// =====================================================
// MUTATION HOOKS
// =====================================================

export function useMutations() {
  const { addToast } = useToast()

  const mutate = useCallback(async (
    url: string,
    method: 'POST' | 'PATCH' | 'DELETE' = 'POST',
    body?: any,
    successMsg?: string,
    errorMsg?: string
  ) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (successMsg) addToast('success', successMsg)
      return { success: true, data }
    } catch (err) {
      if (errorMsg) addToast('error', errorMsg)
      else addToast('error', 'Erro ao processar operação')
      return { success: false, error: err }
    }
  }, [addToast])

  // Customer mutations
  const createCustomer = (data: any) =>
    mutate('/api/customers', 'POST', data, 'Cliente criado com sucesso!', 'Erro ao criar cliente')

  const toggleCustomerStatus = (id: string, status: string) =>
    mutate(`/api/customers/${id}`, 'PATCH', { status }, 
      status === 'active' ? 'Cliente ativado!' : 'Cliente suspenso!',
      'Erro ao alterar status')

  const deleteCustomer = (id: string) =>
    mutate(`/api/customers/${id}`, 'DELETE', undefined, 'Cliente excluído!', 'Erro ao excluir')

  // Application mutations
  const createApplication = (data: any) =>
    mutate('/api/applications', 'POST', data, 'Aplicação criada!', 'Erro ao criar aplicação')

  const updateAppStatus = (id: string, status: string) =>
    mutate(`/api/applications/${id}`, 'PATCH', { status },
      status === 'published' ? 'Aplicação publicada!' : `Status alterado para: ${status}`,
      'Erro ao alterar status')

  const rollbackApplication = (id: string) =>
    mutate(`/api/applications/${id}`, 'PATCH', { status: 'testing' }, 'Rollback executado!', 'Erro no rollback')

  const deleteApplication = (id: string) =>
    mutate(`/api/applications/${id}`, 'DELETE', undefined, 'Aplicação removida!', 'Erro ao remover')

  // License mutations
  const createLicense = (data: any) =>
    mutate('/api/licenses', 'POST', data, 'Licença gerada!', 'Erro ao gerar licença')

  const suspendLicense = (id: string) =>
    mutate(`/api/licenses/${id}`, 'PATCH', { status: 'suspended', action: 'suspend' }, 'Licença suspensa!', 'Erro ao suspender')

  const activateLicense = (id: string) =>
    mutate(`/api/licenses/${id}`, 'PATCH', { status: 'active', action: 'reactivate' }, 'Licença reativada!', 'Erro ao reativar')

  const renewLicense = (id: string) =>
    mutate(`/api/licenses/${id}`, 'PATCH', { status: 'active', action: 'renew' }, 'Licença renovada!', 'Erro ao renovar')

  const cancelLicense = (id: string) =>
    mutate(`/api/licenses/${id}`, 'PATCH', { status: 'cancelled', action: 'cancel' }, 'Licença cancelada!', 'Erro ao cancelar')

  // Payment mutations
  const refundPayment = (id: string) =>
    mutate(`/api/payments/${id}`, 'PATCH', {}, 'Pagamento reembolsado!', 'Erro ao reembolsar')

  // Ticket mutations
  const resolveTicket = (id: string) =>
    mutate(`/api/tickets/${id}`, 'PATCH', { status: 'resolved' }, 'Chamado resolvido!', 'Erro ao resolver')

  const closeTicket = (id: string) =>
    mutate(`/api/tickets/${id}`, 'PATCH', { status: 'closed' }, 'Chamado fechado!', 'Erro ao fechar')

  // Notification mutations
  const markNotificationRead = (id: string) =>
    mutate('/api/notifications', 'PATCH', { id }, undefined, 'Erro ao marcar notificação')

  const markAllNotificationsRead = () =>
    mutate('/api/notifications', 'PATCH', { markAll: true }, 'Notificações marcadas como lidas!', 'Erro')

  return {
    createCustomer, toggleCustomerStatus, deleteCustomer,
    createApplication, updateAppStatus, rollbackApplication, deleteApplication,
    createLicense, suspendLicense, activateLicense, renewLicense, cancelLicense,
    refundPayment, resolveTicket, closeTicket,
    markNotificationRead, markAllNotificationsRead,
    addToast,
  }
}

// =====================================================
// CONFIRMATION DIALOG HOOK
// =====================================================

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
    variant: 'danger' | 'warning' | 'info'
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info',
  })

  const confirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' = 'danger') => {
    setConfirmState({ open: true, title, message, onConfirm, variant })
  }

  const close = () => setConfirmState(prev => ({ ...prev, open: false }))

  return { confirmState, confirm, close }
}

export function ConfirmDialog({
  state,
  onClose,
}: {
  state: { open: boolean; title: string; message: string; onConfirm: () => void; variant: 'danger' | 'warning' | 'info' }
  onClose: () => void
}) {
  if (!state.open) return null

  const colors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  }

  const icons = {
    danger: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const Icon = icons[state.variant]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${
                state.variant === 'danger' ? 'bg-red-100' : state.variant === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
              }`}>
                <Icon className={`h-5 w-5 ${
                  state.variant === 'danger' ? 'text-red-600' : state.variant === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900">{state.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{state.message}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className={`flex-1 text-white ${colors[state.variant]}`} onClick={() => { state.onConfirm(); onClose() }}>
              Confirmar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

import { Button } from '@/components/ui/button'
