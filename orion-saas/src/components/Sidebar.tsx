"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  FolderKanban,
  AppWindow,
  KeyRound,
  CreditCard,
  Repeat,
  Package,
  TicketPercent,
  ListTree,
  Hammer,
  Rocket,
  Tags,
  Bug,
  Bot,
  Cpu,
  Boxes,
  Gauge,
  Server,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  Settings,
  ScrollText,
  Bell,
  Database,
  Trophy,
  ChevronLeft,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    title: "Gerenciamento",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Clientes", href: "/clientes", icon: Users },
      { label: "Projetos", href: "/projetos", icon: FolderKanban },
      { label: "Aplicações", href: "/aplicacoes", icon: AppWindow },
      { label: "Licenças", href: "/licencas", icon: KeyRound, badge: "1.035" },
      { label: "Pagamentos", href: "/pagamentos", icon: CreditCard },
      { label: "Assinaturas", href: "/assinaturas", icon: Repeat },
      { label: "Planos", href: "/planos", icon: Package },
      { label: "Cupons", href: "/cupons", icon: TicketPercent },
      { label: "Campanhas", href: "/campanhas", icon: Trophy },
    ],
  },
  {
    title: "Desenvolvimento",
    items: [
      { label: "File de Projetos", href: "/file-projetos", icon: ListTree, badge: "7" },
      { label: "Builds", href: "/builds", icon: Hammer },
      { label: "Deploys", href: "/deploys", icon: Rocket },
      { label: "Releases", href: "/releases", icon: Tags },
      { label: "Anomalias", href: "/anomalias", icon: Bug, badge: "3" },
    ],
  },
  {
    title: "IA e Automação",
    items: [
      { label: "Agentes de IA", href: "/agentes-ia", icon: Bot },
      { label: "Jobs de IA", href: "/jobs-ia", icon: Cpu },
      { label: "Modelos", href: "/modelos", icon: Boxes },
      { label: "Consumo de IA", href: "/consumo-ia", icon: Gauge },
      { label: "Provedores", href: "/provedores", icon: Server },
    ],
  },
  {
    title: "Suporte",
    items: [
      { label: "Chatbots", href: "/chatbots", icon: MessageSquare },
      { label: "Base de Conhecimento", href: "/base-conhecimento", icon: BookOpen },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Usuários", href: "/usuarios", icon: Users },
      { label: "Funções e Permissões", href: "/funcoes-permissoes", icon: ShieldCheck },
      { label: "Notificações", href: "/notificacoes", icon: Bell },
      { label: "Backups", href: "/backups", icon: Database },
      { label: "Configurações", href: "/configuracoes", icon: Settings },
      { label: "Logs de Auditoria", href: "/logs-auditoria", icon: ScrollText },
    ],
  },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 lg:z-30 h-screen shrink-0 flex flex-col transition-all duration-300 ease-in-out glass-sidebar",
          "border-r border-soft",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center gap-3 h-16 px-4 border-b border-soft shrink-0 hover:bg-chip transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient shrink-0 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-wide brand-text">ORION</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-2">
                SaaS Platform
              </p>
            </div>
          )}
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 scroll-area"
             style={{ maxHeight: "calc(100vh - 64px - 88px)" }}>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          collapsed && "justify-center px-0",
                          isActive
                            ? "text-fg"
                            : "text-muted-fg hover:text-fg hover:bg-chip-hover",
                        )}
                        style={
                          isActive
                            ? { backgroundColor: "rgba(139, 92, 246, 0.12)" }
                            : undefined
                        }
                      >
                        {isActive && (
                          <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full"
                            style={{ backgroundColor: "#8b5cf6" }}
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            isActive
                              ? "text-violet-300"
                              : "text-muted-2 group-hover:text-fg",
                          )}
                        />
                        {!collapsed && (
                          <span className="flex-1 text-left truncate">
                            {item.label}
                          </span>
                        )}
                        {!collapsed && item.badge && (
                          <span className="rounded-md bg-chip border border-soft px-1.5 py-0.5 text-[10px] font-semibold text-fg">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: logout + collapse */}
        <div className="border-t border-soft p-3 space-y-1 shrink-0">
          <Link
            href="/api/auth/logout"
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-fg hover:text-fg hover:bg-chip-hover transition-colors",
              collapsed && "justify-center px-0",
            )}
            title="Sair"
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span>Sair</span>}
          </Link>
          <button
            onClick={onToggleCollapse}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-fg hover:text-fg hover:bg-chip-hover transition-colors",
              collapsed && "justify-center px-0",
            )}
          >
            <ChevronLeft
              className={cn(
                "h-[18px] w-[18px] transition-transform",
                collapsed && "rotate-180",
              )}
            />
            {!collapsed && <span>Recolher menu</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
