import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-[#8b8fa3] hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <span className="text-sm font-bold brand-text">ORION</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-invert">
        <h1 className="text-3xl font-bold text-white mb-2">Termos de Uso</h1>
        <p className="text-xs text-[#6b7280] mb-8">Última atualização: Julho 2026</p>

        <div className="space-y-6 text-sm text-[#c4c8d8] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta na plataforma Orion ("Plataforma"), você concorda com estes Termos de Uso ("Termos"). Se não concordar, não use a Plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Descrição do Serviço</h2>
            <p>A Orion é uma plataforma SaaS multi-tenant que oferece software de gestão comercial e ferramentas de desenvolvimento. O serviço inclui:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Acesso a módulos de software (ex: Orion Gestão Comercial)</li>
              <li>Período de teste gratuito de 14 dias</li>
              <li>Planos pagos com cobrança mensal via Stripe</li>
              <li>Isolamento de dados entre tenants</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Período de Teste (Trial)</h2>
            <p>Ao se cadastrar, você recebe automaticamente um período de teste de 14 dias com acesso completo às funcionalidades do plano gratuito. Durante o trial:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nenhum cartão de crédito é exigido</li>
              <li>Você pode cancelar a qualquer momento</li>
              <li>Ao expirar, o acesso será bloqueado até a assinatura de um plano</li>
              <li>Seus dados serão preservados por 90 dias após a expiração</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Assinaturas e Pagamentos</h2>
            <p>Após o período de teste, você deve assinar um plano pago para continuar usando a Plataforma. Os pagamentos são processados pelo Stripe. Você autoriza cobranças recorrentes mensais no valor do plano escolhido.</p>
            <p className="mt-2">Você pode cancelar sua assinatura a qualquer momento pelo painel ou entrando em contato com o suporte. O cancelamento não reembolsa o período já pago.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Responsabilidades do Usuário</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fornecer informações verdadeiras no cadastro</li>
              <li>Manter a confidencialidade de suas credenciais</li>
              <li>Não usar a Plataforma para atividades ilegais</li>
              <li>Não tentar acessar dados de outros tenants</li>
              <li>Respeitar os limites do plano contratado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Privacidade e LGPD</h2>
            <p>Tratamos seus dados conforme nossa <Link href="/privacidade" className="text-violet-300 underline">Política de Privacidade</Link> e a LGPD (Lei nº 13.709/2018). Você pode solicitar acesso, retificação ou exclusão de seus dados a qualquer momento.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Limitação de Responsabilidade</h2>
            <p>A Plataforma é fornecida "como está". Não garantimos disponibilidade contínua (SLA aplicável apenas ao plano Enterprise). Não nos responsabilizamos por perda de dados decorrente de falhas técnicas, exceto em caso de dolo ou negligência grave.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Encerramento da Conta</h2>
            <p>Você pode encerrar sua conta a qualquer momento. Podemos encerrar ou suspender contas que violem estes Termos, sem aviso prévio.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">9. Alterações dos Termos</h2>
            <p>Podemos atualizar estes Termos a qualquer momento. Notificaremos usuários ativos sobre alterações significativas por email. O uso continuado após a atualização constitui aceitação.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">10. Contato</h2>
            <p>Em caso de dúvidas: <a href="mailto:suporte@orion.com" className="text-violet-300 underline">suporte@orion.com</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
