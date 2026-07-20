/**
 * Componentes auxiliares do Orion Platform
 * - Lifecycle visualizer (aplicação e licença)
 * - Trial countdown banner
 * - Development process tracker
 * - Security panel
 * - Module integration status
 * - Customer journey tracker
 */
'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle2, Circle, Clock, AlertCircle, XCircle, Lock, Shield,
  Server, Cloud, Database, Cpu, HardDrive, Zap, CreditCard, Bell,
  FileText, GitBranch, Layers, Rocket, Key, Users, Activity,
  Building2, Globe, Mail, ArrowRight, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// =====================================================
// 1. APPLICATION LIFECYCLE VISUALIZER (10 estados)
// Conforme Doc 29, Seção 5
// =====================================================

const APP_LIFECYCLE_STAGES = [
  { key: 'requested', label: 'Solicitada', icon: FileText },
  { key: 'analysis', label: 'Em Análise', icon: Activity },
  { key: 'planning', label: 'Planejamento', icon: Layers },
  { key: 'development', label: 'Desenvolvimento', icon: GitBranch },
  { key: 'validation', label: 'Validação', icon: CheckCircle2 },
  { key: 'homologation', label: 'Homologação', icon: Shield },
  { key: 'publishing', label: 'Publicação', icon: Rocket },
  { key: 'available', label: 'Disponível', icon: CheckCircle2 },
  { key: 'updates', label: 'Atualizações', icon: RefreshCw },
  { key: 'archived', label: 'Arquivada', icon: Archive },
]

function Archive(props: any) {
  return <Lock {...props} />
}

export function AppLifecycleVisualizer({ currentStatus }: { currentStatus: string }) {
  // Map current status to lifecycle stage
  const statusMap: Record<string, number> = {
    draft: 0, backlog: 1, development: 3, testing: 4,
    homologation: 5, published: 7, updated: 8, archived: 9,
  }
  const currentStage = statusMap[currentStatus] ?? 0

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-slate-500" />
          Ciclo de Vida da Aplicação
        </CardTitle>
        <CardDescription className="text-xs">10 estágios conforme processo oficial</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-emerald-500 transition-all duration-500"
            style={{ width: `calc(${(currentStage / (APP_LIFECYCLE_STAGES.length - 1)) * 100}% - 2rem)` }}
          />
          {/* Stages */}
          <div className="relative flex justify-between">
            {APP_LIFECYCLE_STAGES.map((stage, index) => {
              const Icon = stage.icon
              const isCompleted = index < currentStage
              const isCurrent = index === currentStage
              const isPending = index > currentStage
              return (
                <div key={stage.key} className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                      isCurrent ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                      'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`text-[9px] text-center font-medium leading-tight max-w-[60px] ${
                    isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 2. LICENSE LIFECYCLE VISUALIZER (8 estados)
// Conforme Doc 29, Seção 6
// =====================================================

const LICENSE_LIFECYCLE_STAGES = [
  { key: 'created', label: 'Criada' },
  { key: 'paid', label: 'Pagamento Confirmado' },
  { key: 'active', label: 'Ativa' },
  { key: 'renewal', label: 'Renovação' },
  { key: 'suspended', label: 'Suspensa' },
  { key: 'reactivated', label: 'Reativada' },
  { key: 'cancelled', label: 'Cancelada' },
  { key: 'expired', label: 'Expirada' },
]

export function LicenseLifecycleVisualizer({ currentStatus }: { currentStatus: string }) {
  const statusMap: Record<string, number> = {
    created: 0, pending: 1, active: 2, suspended: 4, cancelled: 6, expired: 7,
  }
  const currentStage = statusMap[currentStatus] ?? 0

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
          <Key className="h-4 w-4 text-slate-500" />
          Ciclo de Vida da Licença
        </CardTitle>
        <CardDescription className="text-xs">8 estágios com auditoria completa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {LICENSE_LIFECYCLE_STAGES.map((stage, index) => {
            const isCompleted = index < currentStage
            const isCurrent = index === currentStage
            return (
              <div
                key={stage.key}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  isCurrent ? 'bg-blue-50 text-blue-700 border border-blue-200 ring-2 ring-blue-100' :
                  'bg-slate-50 text-slate-400 border border-slate-100'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isCurrent ? (
                  <Clock className="h-3 w-3 animate-pulse" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                {stage.label}
                {index < LICENSE_LIFECYCLE_STAGES.length - 1 && (
                  <ArrowRight className="h-3 w-3 ml-1 opacity-30" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 3. TRIAL COUNTDOWN BANNER
// Conforme Doc 29, Seção 12
// =====================================================

export function TrialBanner({ daysLeft, trialEndsAt }: { daysLeft: number; trialEndsAt: Date }) {
  const isUrgent = daysLeft <= 3
  const isWarning = daysLeft <= 7 && daysLeft > 3

  const bgClass = isUrgent ? 'bg-red-50 border-red-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
  const textClass = isUrgent ? 'text-red-900' : isWarning ? 'text-amber-900' : 'text-blue-900'
  const subTextClass = isUrgent ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-blue-700'
  const btnClass = isUrgent ? 'bg-red-600 hover:bg-red-700' : isWarning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border ${bgClass}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isUrgent ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'} text-white flex-shrink-0`}>
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <p className={`text-sm font-semibold ${textClass}`}>
            {isUrgent ? `⚠️ Trial expira em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}!` :
             isWarning ? `⏰ Restam ${daysLeft} dias do seu período de trial` :
             `Trial ativo — ${daysLeft} dias restantes`}
          </p>
          <p className={`text-xs ${subTextClass} mt-0.5`}>
            Expira em {new Date(trialEndsAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}. Contrate um plano para continuar usando.
          </p>
        </div>
      </div>
      <Button size="sm" className={`${btnClass} text-white flex-shrink-0`}>
        <CreditCard className="h-4 w-4 mr-1.5" />
        Contratar Plano
      </Button>
    </motion.div>
  )
}

// =====================================================
// 4. DEVELOPMENT PROCESS TRACKER (10 passos)
// Conforme Doc 29, Seção 7
// =====================================================

const DEV_PROCESS_STEPS = [
  { key: 'project_creation', label: 'Criação do Projeto', icon: FileText },
  { key: 'complexity', label: 'Classificação de Complexidade', icon: Layers },
  { key: 'architecture', label: 'Definição da Arquitetura', icon: GitBranch },
  { key: 'tasks', label: 'Geração de Tarefas', icon: CheckCircle2 },
  { key: 'development', label: 'Desenvolvimento', icon: Code },
  { key: 'testing', label: 'Testes', icon: Shield },
  { key: 'homologation', label: 'Homologação', icon: CheckCircle2 },
  { key: 'build', label: 'Build', icon: Cpu },
  { key: 'publishing', label: 'Publicação', icon: Rocket },
  { key: 'delivery', label: 'Entrega', icon: CheckCircle2 },
]

function Code(props: any) {
  return <GitBranch {...props} />
}

export function DevelopmentTracker({ currentStep, complexity }: { currentStep: number; complexity: string }) {
  const progress = (currentStep / (DEV_PROCESS_STEPS.length - 1)) * 100

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-slate-500" />
              Processo de Desenvolvimento
            </CardTitle>
            <CardDescription className="text-xs">10 etapas • Complexidade: {complexity}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {currentStep + 1}/{DEV_PROCESS_STEPS.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-1.5" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {DEV_PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            return (
              <div
                key={step.key}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                  isCompleted ? 'bg-emerald-50' : isCurrent ? 'bg-blue-50 ring-2 ring-blue-100' : 'bg-slate-50'
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  isCompleted ? 'bg-emerald-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className={`text-[9px] text-center font-medium leading-tight ${
                  isCompleted ? 'text-emerald-700' : isCurrent ? 'text-blue-700' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 5. SECURITY PANEL
// Conforme Doc 29, Seção 14
// =====================================================

export function SecurityPanel({ mfaEnabled }: { mfaEnabled: boolean }) {
  const securityItems = [
    { label: 'MFA (2FA)', status: mfaEnabled, icon: Shield },
    { label: 'JWT Sessions', status: true, icon: Key },
    { label: 'Criptografia AES-256', status: true, icon: Lock },
    { label: 'HTTPS/TLS 1.3', status: true, icon: Globe },
    { label: 'Logs de Auditoria', status: true, icon: FileText },
    { label: 'Controle de Sessão', status: true, icon: Activity },
    { label: 'Proteção Anti-Compartilhamento', status: true, icon: Users },
  ]

  const activeCount = securityItems.filter(s => s.status).length

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500" />
              Painel de Segurança
            </CardTitle>
            <CardDescription className="text-xs">{activeCount}/{securityItems.length} medidas ativas</CardDescription>
          </div>
          <Badge variant="outline" className={`text-xs ${activeCount === securityItems.length ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {activeCount === securityItems.length ? 'Protegido' : 'Atenção'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {securityItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.status ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <Icon className={`h-3.5 w-3.5 ${item.status ? 'text-emerald-600' : 'text-amber-600'}`} />
              </div>
              <span className="text-xs font-medium text-slate-700 flex-1">{item.label}</span>
              {item.status ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// =====================================================
// 6. MODULE INTEGRATION STATUS (12 módulos)
// Conforme Doc 29, Seção 19
// =====================================================

const MODULES = [
  { name: 'Landing Page', icon: Globe, status: 'operational' },
  { name: 'CRM', icon: Users, status: 'operational' },
  { name: 'Stripe', icon: CreditCard, status: 'operational' },
  { name: 'License Service', icon: Key, status: 'degraded' },
  { name: 'Customer Portal', icon: Building2, status: 'operational' },
  { name: 'Admin Portal', icon: Server, status: 'operational' },
  { name: 'AI Gateway', icon: Zap, status: 'operational' },
  { name: 'Notification Service', icon: Bell, status: 'operational' },
  { name: 'Build Service', icon: Cpu, status: 'operational' },
  { name: 'Deployment Service', icon: Rocket, status: 'operational' },
  { name: 'Audit Service', icon: FileText, status: 'operational' },
  { name: 'Identity Service', icon: Shield, status: 'operational' },
]

export function ModuleIntegrationStatus() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-500" />
              Integração entre Módulos
            </CardTitle>
            <CardDescription className="text-xs">12 módulos do ecossistema Orion</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            11/12 Operacionais
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            const isOperational = mod.status === 'operational'
            return (
              <div
                key={mod.name}
                className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${
                  isOperational ? 'border-slate-100 bg-white hover:bg-slate-50' : 'border-amber-200 bg-amber-50/50'
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 ${isOperational ? 'bg-slate-100' : 'bg-amber-100'}`}>
                  <Icon className={`h-3.5 w-3.5 ${isOperational ? 'text-slate-500' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-700 truncate">{mod.name}</p>
                  <div className="flex items-center gap-1">
                    <div className={`h-1.5 w-1.5 rounded-full ${isOperational ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-[9px] text-slate-500">{isOperational ? 'OK' : 'Degradado'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 7. CUSTOMER JOURNEY TRACKER (5 etapas)
// Conforme Doc 29, Seção 4
// =====================================================

const JOURNEY_STEPS = [
  { key: 'discovery', label: 'Descoberta', icon: Globe, desc: 'Visitou a Landing Page' },
  { key: 'license', label: 'Escolha de Licença', icon: Key, desc: 'Selecionou um plano' },
  { key: 'payment', label: 'Pagamento', icon: CreditCard, desc: 'Pagamento confirmado via Stripe' },
  { key: 'account', label: 'Criação da Conta', icon: Mail, desc: 'Convite aceito e senha definida' },
  { key: 'project', label: 'Cadastro do Projeto', icon: FileText, desc: 'Informações do projeto enviadas' },
]

export function CustomerJourneyTracker({ currentStep }: { currentStep: number }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          Jornada do Cliente
        </CardTitle>
        <CardDescription className="text-xs">5 etapas do onboarding</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {JOURNEY_STEPS.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                    isCurrent ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  {index < JOURNEY_STEPS.length - 1 && (
                    <div className={`w-0.5 h-6 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <p className={`text-sm font-medium ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                  {isCurrent && (
                    <Badge variant="outline" className="mt-1 text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                      Etapa Atual
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 8. DISTRIBUTION DETAILS (URL assinada, token, etc)
// Conforme Doc 29, Seção 10
// =====================================================

export function DistributionDetails({ download }: {
  download: {
    downloadToken: string
    status: string
    deviceInfo: string | null
    ipAddress: string | null
    downloadedAt: Date | null
    expiresAt: Date
    applicationName: string
  }
}) {
  const requirements = [
    { label: 'URL Assinada', status: true },
    { label: 'Autenticação Obrigatória', status: true },
    { label: 'Token de Uso Único', status: true },
    { label: 'Expiração Automática', status: true },
    { label: 'Auditoria do Download', status: true },
  ]

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-500" />
          Distribuição Segura
        </CardTitle>
        <CardDescription className="text-xs">5 requisitos de segurança atendidos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 rounded-lg bg-slate-50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Token:</span>
            <span className="font-mono text-slate-700">{download.downloadToken.substring(0, 20)}...</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">IP:</span>
            <span className="font-mono text-slate-700">{download.ipAddress || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Expira em:</span>
            <span className="font-medium text-slate-700">{new Date(download.expiresAt).toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <Separator />
        <div className="space-y-1.5">
          {requirements.map((req) => (
            <div key={req.label} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs text-slate-600">{req.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 9. AUDIT LOG VIEWER
// Conforme Doc 29, Seção 14
// =====================================================

export function AuditLogViewer({ logs }: { logs: Array<{ action: string; entity: string; ipAddress: string | null; createdAt: Date }> }) {
  const actionConfig: Record<string, { label: string; color: string }> = {
    login: { label: 'Login', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    download: { label: 'Download', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    publish: { label: 'Publicação', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    suspend: { label: 'Suspensão', color: 'bg-red-50 text-red-700 border-red-200' },
    create: { label: 'Criação', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    update: { label: 'Atualização', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          Logs de Auditoria
        </CardTitle>
        <CardDescription className="text-xs">Registro completo de ações do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {logs.map((log, idx) => {
            const config = actionConfig[log.action] || actionConfig.create
            return (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                  {config.label}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700">{log.entity}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                    {log.ipAddress && ` • IP: ${log.ipAddress}`}
                  </p>
                </div>
              </div>
            )
          })}
          {logs.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">Nenhum log de auditoria</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// 10. NEW PROJECT FORM (Cadastro do Projeto)
// Conforme Doc 29, Seção 4, Etapa 5
// =====================================================

export function NewProjectForm() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          Cadastrar Novo Projeto
        </CardTitle>
        <CardDescription className="text-xs">Etapa 5 da Jornada do Cliente — informe os dados para iniciar o desenvolvimento</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Nome da Empresa *</label>
            <Input placeholder="Ex: Farmácia São João" className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Nicho de Atuação *</label>
            <Input placeholder="Ex: Farmácia, Varejo, Saúde..." className="h-9 text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Objetivo da Aplicação *</label>
          <Input placeholder="Ex: Substituir planilhas por sistema digital" className="h-9 text-sm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Funcionalidades Desejadas</label>
          <Textarea placeholder="Descreva as funcionalidades que você precisa..." rows={3} className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">Informações Complementares</label>
          <Textarea placeholder="Any additional context..." rows={2} className="text-sm" />
        </div>
        <Button className="w-full" size="sm">
          <Rocket className="h-4 w-4 mr-1.5" />
          Iniciar Desenvolvimento
        </Button>
      </CardContent>
    </Card>
  )
}

// Import needed components
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
