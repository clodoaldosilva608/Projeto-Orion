import { ShieldCheck, Database, UserCheck, Mail } from 'lucide-react'

export const metadata = {
  title: 'Orion — Política de Privacidade',
  description: 'Como o Orion coleta, utiliza e protege seus dados pessoais (LGPD).',
}

const sections = [
  {
    icon: Database,
    title: 'Como coletamos seus dados',
    items: [
      'Dados fornecidos no cadastro: nome, e-mail, empresa e dados de acesso (login via Supabase/Auth).',
      'Dados de uso gerados pela plataforma: metas, indicadores, resultados, campanhas e auditoria.',
      'Dados técnicos: endereço IP, tipo de dispositivo e logs de acesso, para segurança e estabilidade.',
    ],
  },
  {
    icon: UserCheck,
    title: 'Finalidade do tratamento',
    items: [
      'Operar a plataforma e disponibilizar as funcionalidades contratadas.',
      'Calcular metas, rankings e relatórios de desempenho comercial.',
      'Garantir a segurança, prevenir fraudes e cumprir obrigações legais.',
      'Comunicar atualizações, alertas e suporte relacionados ao serviço.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Seus direitos (LGPD)',
    items: [
      'Confirmação da existência de tratamento e acesso aos seus dados.',
      'Correção de dados incompletos, inexatos ou desatualizados.',
      'Eliminação dos dados tratados com consentimento, quando aplicável.',
      'Revogação do consentimento e oposição a determinados tratamentos.',
      'Portabilidade dos dados a outro fornecedor de serviço ou produto.',
    ],
  },
  {
    icon: Mail,
    title: 'Contato do Encarregado (DPO)',
    items: [
      'Para exercer seus direitos ou esclarecer dúvidas sobre privacidade,',
      'entre em contato com o Encarregado de Dados (DPO) pelo e-mail:',
      'dpo@orion.app',
    ],
  },
]

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgb(var(--glass-bg))' }}
          >
            <ShieldCheck className="h-5 w-5" style={{ color: 'rgb(var(--orion-indigo))' }} />
          </div>
          <h1 className="text-2xl font-bold text-white">Política de Privacidade</h1>
        </div>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Esta página descreve, em linguagem simples, como o Orion coleta, utiliza e protege
          seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018 — LGPD).
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <section key={section.title} className="glass-card rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: 'rgb(var(--orion-indigo))' }} />
                <h2 className="text-base font-semibold text-white">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgb(var(--text-secondary))' }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
        Última atualização: 2026. Esta política pode ser revisada periodicamente. Alterações
        relevantes serão comunicadas aos usuários.
      </p>
    </div>
  )
}
