import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  X,
  Star,
  Rocket,
  ShieldCheck,
  Lock,
  RefreshCw,
  Users,
  Cloud,
  Database,
  Layout,
  KeyRound,
  Bell,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TRUST_ICONS = [
  "Desenvolvido com IA",
  "Aplicações Web e Mobile",
  "Licenciamento automático",
  "Hospedagem e manutenção",
  "Painel exclusivo de clientes",
  "Suporte especializado",
];

const STEPS = [
  { n: "1", emoji: "🛒", title: "Escolha seu plano", desc: "Selecione a licença que melhor atende ao seu negócio." },
  { n: "2", emoji: "📝", title: "Conte sua ideia", desc: "Responda um briefing simples sobre o que você precisa." },
  { n: "3", emoji: "🤖", title: "Nossa IA inicia o projeto", desc: "Arquitetura, planejamento e desenvolvimento com Inteligência Artificial." },
  { n: "4", emoji: "✅", title: "Especialistas validam tudo", desc: "Cada projeto passa por revisão e testes antes da entrega." },
  { n: "5", emoji: "🚀", title: "Receba seu aplicativo", desc: "Seu aplicativo fica disponível na sua Dashboard." },
  { n: "6", emoji: "📈", title: "Continue evoluindo", desc: "Atualizações, métricas e novas funcionalidades sempre que precisar." },
];

const SOLUTIONS = [
  { emoji: "❤️", title: "Saúde" },
  { emoji: "💰", title: "Finanças" },
  { emoji: "🎓", title: "Educação" },
  { emoji: "🛒", title: "Comércio" },
  { emoji: "💪", title: "Fitness" },
  { emoji: "🚚", title: "Logística" },
  { emoji: "🏢", title: "Empresas" },
];

const INCLUDED = [
  { icon: Layout, title: "Arquitetura profissional", desc: "Estrutura robusta, escalável e segura." },
  { icon: Sparkles, title: "Interface moderna", desc: "Design responsivo e experiência incrível." },
  { icon: Users, title: "Painel administrativo", desc: "Gestão completa do seu aplicativo." },
  { icon: Lock, title: "Login seguro", desc: "Autenticação segura e controle de acesso." },
  { icon: KeyRound, title: "Licenciamento automático", desc: "Controle de uso e renovações automáticas." },
  { icon: RefreshCw, title: "Atualizações contínuas", desc: "Seu sistema sempre moderno e atualizado." },
  { icon: Cloud, title: "Hospedagem em nuvem", desc: "Alta disponibilidade, performance e SLA." },
  { icon: Database, title: "Backup & segurança", desc: "Seus dados sempre protegidos." },
];

const DASHBOARD_CHECKS = [
  "Downloads e instalações",
  "Projetos e aplicações",
  "Licenças e validade",
  "Suporte e chamados",
  "Pagamentos e faturas",
  "Relatórios e métricas",
  "Atualizações e versões",
  "Histórico completo",
];

const SECURITY = [
  { icon: Lock, label: "Criptografia SSL em todas as camadas" },
  { icon: RefreshCw, label: "Backups automáticos e redundantes" },
  { icon: Users, label: "Controle de acesso e permissões" },
  { icon: ShieldCheck, label: "Downloads protegidos e monitorados" },
  { icon: Database, label: "Auditoria completa e relatórios seguros" },
  { icon: Check, label: "Conformidade com as melhores práticas" },
];

const COMPARISON = {
  trad: [
    "Alto custo e prazos longos",
    "Processos manuais e burocráticos",
    "Pouca transparência",
    "Sem acompanhamento contínuo",
    "Dificuldade para escalar",
  ],
  orion: [
    "IA especializada acelerando tudo",
    "Processos automatizados e inteligentes",
    "Total transparência e controle",
    "Acompanhamento completo na Dashboard",
    "Licenciamento, atualizações e escalabilidade",
  ],
};

const TESTIMONIALS = [
  {
    text: "O Orion entregou nosso aplicativo 3x mais rápido do que imaginávamos. A IA realmente faz a diferença no desenvolvimento.",
    name: "Juliana Ferreira",
    role: "CEO, HealthPlus",
  },
  {
    text: "A plataforma é completa! Dashboard incrível, suporte rápido e atualizações constantes. Superou nossas expectativas.",
    name: "Rafael Mendes",
    role: "Diretor, LogiTech",
  },
  {
    text: "Profissionais altamente qualificados e tecnologia de ponta. Nosso projeto ficou perfeito!",
    name: "Carla Souza",
    role: "Fundadora, EduSmart",
  },
];

const FAQ = [
  {
    q: "Quanto tempo leva para meu aplicativo ficar pronto?",
    a: "Na maioria dos casos, uma aplicação fica pronta para homologação em poucas horas após o briefing inicial. O deploy em produção é feito em 1 clique assim que você aprova.",
  },
  {
    q: "Como funciona o pagamento e a renovação?",
    a: "O pagamento é processado de forma segura via Stripe. A renovação da licença é automática e você pode cancelar a qualquer momento pelo painel.",
  },
  {
    q: "Meu código-fonte é meu?",
    a: "Sim. O código-fonte gerado para o seu projeto é seu. Você pode solicitar exportação a qualquer momento.",
  },
  {
    q: "Posso solicitar alterações após a entrega?",
    a: "Sim. O plano inclui atualizações contínuas e você pode solicitar novas funcionalidades pela Dashboard a qualquer momento.",
  },
  {
    q: "Como funciona a licença do meu aplicativo?",
    a: "A Orion emite licenças por cliente, com validade e limites de uso configuráveis. A renovação pode ser manual ou automática.",
  },
];

export default function LandingPage() {
  return (
    // force-dark: landing page is always dark (per spec) regardless of theme toggle
    <div className="force-dark min-h-screen bg-[#0a0b1e]">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0b1e]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold brand-text">ORION</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-[#8b8fa3]">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#solucoes" className="hover:text-white transition-colors">Soluções</a>
            <a href="#diferenciais" className="hover:text-white transition-colors">Diferenciais</a>
            <a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 h-9 text-sm font-medium text-white hover:bg-white/10"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg brand-gradient px-4 h-9 text-sm font-semibold text-white hover:opacity-95"
            >
              Teste 14 dias grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left text */}
            <div className="fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                PLATAFORMA INTELIGENTE DE DESENVOLVIMENTO DE SOFTWARE
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
                <span className="text-white">Gerenciamos todo o ciclo de vida do seu </span>
                <span className="hero-text-gradient">software</span>
                <span className="text-white"> — da ideia à </span>
                <span className="hero-text-gradient">evolução contínua</span>
                <span className="text-white">.</span>
              </h1>
              <p className="mt-6 text-base lg:text-lg text-[#8b8fa3] leading-relaxed max-w-xl">
                Briefing inteligente com IA. Arquitetura gerada automaticamente.
                Templates reutilizáveis. Pipeline de desenvolvimento parcialmente
                automatizado. Especialistas garantem a qualidade final.
                Tudo em uma plataforma unificada.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg brand-gradient-strong px-6 h-12 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:opacity-95"
                >
                  <Rocket className="h-4 w-4" />
                  Começar 14 dias grátis
                </Link>
                <Link
                  href="/produtos"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 h-12 text-sm font-semibold text-white hover:bg-white/10"
                >
                  <Play className="h-4 w-4" />
                  Ver produtos disponíveis
                </Link>
              </div>
              {/* Trust icons */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
                {TRUST_ICONS.map((t) => (
                  <div key={t} className="flex items-center gap-2 text-xs text-[#8b8fa3]">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{t}</span>
                  </div>
                ))}
              </div>
              {/* Social proof */}
              <div className="mt-8 flex items-center gap-5">
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-[#8b8fa3] mt-1">
                    <span className="text-white font-semibold">4.9/5</span> média de avaliações
                  </p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <p className="text-lg font-bold text-white">+1.200</p>
                  <p className="text-xs text-[#8b8fa3]">ideias criadas</p>
                </div>
                <div className="flex -space-x-2">
                  {["JM", "RA", "CS", "LF"].map((n, i) => (
                    <div
                      key={n}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white border-2 border-[#0a0b1e] ${
                        ["bg-violet-500", "bg-indigo-500", "bg-fuchsia-500", "bg-sky-500"][i]
                      }`}
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — dashboard mockup */}
            <div className="relative fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="absolute -inset-4 bg-gradient-to-tr from-violet-600/20 via-fuchsia-500/10 to-indigo-600/20 rounded-3xl blur-2xl" />
              <div className="relative glass-card p-4 shadow-2xl">
                {/* fake header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg brand-gradient">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">ORION</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-7 w-7 rounded-md bg-white/5 flex items-center justify-center">
                      <Bell className="h-3.5 w-3.5 text-[#8b8fa3]" />
                    </div>
                    <div className="h-7 w-7 rounded-full brand-gradient flex items-center justify-center text-[10px] font-bold text-white">
                      AO
                    </div>
                  </div>
                </div>
                {/* KPI mini row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { l: "Clientes", v: "1.248", c: "text-emerald-400" },
                    { l: "Projetos", v: "342", c: "text-emerald-400" },
                    { l: "MRR", v: "R$ 286k", c: "text-emerald-400" },
                  ].map((k) => (
                    <div key={k.l} className="rounded-lg bg-white/[0.03] border border-white/5 p-2.5">
                      <p className="text-[10px] text-[#6b7280]">{k.l}</p>
                      <p className="text-sm font-bold text-white">{k.v}</p>
                      <p className={`text-[9px] ${k.c}`}>▲ +12%</p>
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-white">Receita 12 meses</span>
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  </div>
                  <svg viewBox="0 0 280 80" className="w-full h-16">
                    <defs>
                      <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 60 C 30 55, 50 45, 80 42 C 110 39, 130 48, 160 38 C 190 28, 210 22, 240 18 C 260 15, 270 12, 280 10 L 280 80 L 0 80 Z"
                      fill="url(#heroArea)"
                    />
                    <path
                      d="M 0 60 C 30 55, 50 45, 80 42 C 110 39, 130 48, 160 38 C 190 28, 210 22, 240 18 C 260 15, 270 12, 280 10"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                {/* App list */}
                <div className="space-y-1.5">
                  {[
                    { n: "Orion Gestão", s: "Publicado", t: "bg-emerald-500/15 text-emerald-300" },
                    { n: "BioSaúde", s: "Em Testes", t: "bg-amber-500/15 text-amber-300" },
                    { n: "FIManager", s: "Homologação", t: "bg-sky-500/15 text-sky-300" },
                  ].map((a) => (
                    <div key={a.n} className="flex items-center justify-between rounded-md bg-white/[0.02] px-2.5 py-1.5">
                      <span className="text-[11px] text-white font-medium">{a.n}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${a.t}`}>{a.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">Como funciona</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Apenas 6 passos para tirar sua ideia do papel
          </h2>
        </div>
        <div className="relative">
          {/* horizontal connecting line */}
          <div className="hidden lg:block absolute top-[44px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 stagger">
            {STEPS.map((s) => (
              <div key={s.n} className="relative flex flex-col items-center text-center">
                <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 border-violet-500/30 bg-[#0f111a] mb-4">
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white shadow-lg">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-xs text-[#8b8fa3] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Soluções */}
      <section id="solucoes" className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">O que desenvolvemos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Soluções para todos os nichos
          </h2>
          <p className="mt-3 text-[#8b8fa3]">Modelos prontos para os principais mercados — e muito mais.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 stagger">
          {SOLUTIONS.map((s) => (
            <div
              key={s.title}
              className="glass-card glass-card-hover p-5 flex flex-col items-center text-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-2xl">
                {s.emoji}
              </div>
              <p className="text-sm font-medium text-white">{s.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tudo incluído */}
      <section id="recursos" className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">Tudo incluído no seu projeto</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Tudo que você precisa em um único lugar
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
          {INCLUDED.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass-card glass-card-hover p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-[#8b8fa3] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dashboard showcase */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/10 rounded-3xl blur-2xl" />
            <div className="relative glass-card p-5 shadow-2xl">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-amber-400/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { l: "Licenças", v: "1.035" },
                  { l: "Apps", v: "278" },
                  { l: "Uso IA", v: "24.5k" },
                ].map((k) => (
                  <div key={k.l} className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                    <p className="text-[10px] text-[#6b7280]">{k.l}</p>
                    <p className="text-lg font-bold text-white">{k.v}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                <div className="flex items-end justify-between gap-1 h-24">
                  {[40, 55, 48, 70, 62, 85, 75, 92, 80, 100, 88, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-violet-600 to-fuchsia-400"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">Sua operação, em um único lugar</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Acompanhe tudo na sua Dashboard exclusiva
            </h2>
            <p className="mt-4 text-[#8b8fa3] leading-relaxed">
              Depois de entregue, você tem total controle do seu projeto e do seu
              aplicativo em um painel completo e intuitivo.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-y-2.5 gap-x-6">
              {DASHBOARD_CHECKS.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm text-white/90">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-lg brand-gradient px-6 h-12 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-95"
            >
              Ver dashboard ao vivo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="glass-card p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl brand-gradient shadow-lg shadow-violet-500/30 mb-4">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">Segurança é prioridade</p>
              <h2 className="text-2xl font-bold text-white">
                Seu projeto protegido desde o primeiro dia
              </h2>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {SECURITY.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-white/90">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais / Comparação */}
      <section id="diferenciais" className="max-w-5xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">Por que escolher o Orion?</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            A diferença que faz seu projeto acontecer
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
          {/* VS badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full brand-gradient-strong text-sm font-bold text-white shadow-lg">
            VS
          </div>
          {/* Tradicional */}
          <div className="glass-card p-6 lg:p-8 border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                <X className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Desenvolvimento tradicional</h3>
            </div>
            <ul className="space-y-3">
              {COMPARISON.trad.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm">
                  <X className="mt-0.5 h-4 w-4 text-red-400 shrink-0" />
                  <span className="text-[#8b8fa3]">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Orion */}
          <div className="glass-card p-6 lg:p-8 border-violet-500/30 relative">
            <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
              <Sparkles className="h-3 w-3" />
              Recomendado
            </span>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Projeto Orion</h3>
            </div>
            <ul className="space-y-3">
              {COMPARISON.orion.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">Quem já transformou ideias em realidade</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Clientes que confiam no Orion
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass-card p-6 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-white/90 leading-relaxed flex-1">“{t.text}”</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-[#8b8fa3]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ + CTA */}
      <section id="faq" className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* FAQ */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">Dúvidas frequentes</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Perguntas frequentes
            </h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="glass-card p-5 group">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 text-sm font-semibold text-white">
                    {f.q}
                    <span className="text-violet-300 group-open:rotate-45 transition-transform text-lg leading-none">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-[#8b8fa3] leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="relative">
            <div className="glass-card p-8 lg:p-10 h-full flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 brand-gradient opacity-10" />
              <div className="absolute -top-10 -right-10 text-[120px] opacity-10">🚀</div>
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 mb-2">Pronto para começar?</p>
                <h2 className="text-3xl font-bold text-white">
                  Sua próxima aplicação começa agora.
                </h2>
                <p className="mt-4 text-[#8b8fa3]">
                  Você traz a ideia. O Orion cuida de todo o resto.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {["Processo 100% online", "Assinatura segura via Stripe", "Suporte especializado"].map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-white/90">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                        <Check className="h-3 w-3" />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="mt-8 inline-flex items-center gap-2 rounded-lg brand-gradient-strong px-6 h-12 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:opacity-95"
                >
                  <Rocket className="h-4 w-4" />
                  Começar meu projeto agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold brand-text">ORION</span>
              </div>
              <p className="text-sm text-[#8b8fa3] max-w-xs leading-relaxed">
                A plataforma inteligente para desenvolver, publicar e gerenciar
                aplicações com Inteligência Artificial.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {["in", "gh", "tw"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-[#8b8fa3] hover:text-white hover:bg-white/10"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Plataforma</p>
              <ul className="space-y-2 text-sm text-[#8b8fa3]">
                <li><a href="#recursos" className="hover:text-white">Recursos</a></li>
                <li><a href="#como-funciona" className="hover:text-white">Como funciona</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Soluções</p>
              <ul className="space-y-2 text-sm text-[#8b8fa3]">
                <li><a href="#solucoes" className="hover:text-white">Para nichos</a></li>
                <li><a href="#" className="hover:text-white">Para empresas</a></li>
                <li><a href="#" className="hover:text-white">Agências</a></li>
                <li><a href="#" className="hover:text-white">IA & Automação</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Suporte</p>
              <ul className="space-y-2 text-sm text-[#8b8fa3]">
                <li><a href="#" className="hover:text-white">Central de ajuda</a></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Status do sistema</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#6b7280]">
              © {new Date().getFullYear()} Projeto Orion. Todos os direitos reservados.
            </p>
            <p className="text-xs text-[#6b7280]">
              Feito com <span className="text-red-400">❤</span> para transformar ideias em realidade
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
