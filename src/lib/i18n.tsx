"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Locale = "pt" | "en";

type Dict = Record<string, string>;

const pt: Dict = {
  "nav.dashboard": "Dashboard",
  "nav.fabrica": "Fábrica",
  "nav.projetos": "Projetos",
  "nav.briefings": "Briefings",
  "nav.templates": "Templates",
  "nav.clientes": "Clientes",
  "nav.licencas": "Licenças",
  "nav.licencas_sw": "Licenças SW",
  "nav.pagamentos": "Pagamentos",
  "nav.assinaturas": "Assinaturas",
  "nav.planos": "Planos",
  "nav.cupons": "Cupons",
  "nav.metas": "Metas",
  "nav.campanhas": "Campanhas",
  "nav.gamificacao": "Gamificação",
  "nav.calendario": "Calendário",
  "nav.checklist": "Checklist",
  "nav.feedback": "Feedback",
  "nav.treinamentos": "Treinamentos",
  "nav.documentos": "Documentos",
  "nav.marketplace": "Marketplace",
  "nav.usuarios": "Usuários",
  "nav.funcoes": "Funções e Permissões",
  "nav.notificacoes": "Notificações",
  "nav.backups": "Backups",
  "nav.configuracoes": "Configurações",
  "nav.logs": "Logs de Auditoria",
  "nav.sair": "Sair",
  "nav.recolher": "Recolher menu",
  "common.salvar": "Salvar",
  "common.cancelar": "Cancelar",
  "common.novo": "Novo",
  "common.excluir": "Excluir",
  "common.editar": "Editar",
  "common.buscar": "Buscar",
  "common.carregando": "Carregando...",
  "login.entrar": "Entrar",
  "login.email": "E-mail",
  "login.senha": "Senha",
  "login.acessar": "Acessar painel",
  "login.recuperar": "Recuperar acesso",
  "login.credenciais": "Entre com suas credenciais de administrador.",
  "fab.titulo": "Fábrica de Software",
  "fab.desc": "Plataforma Inteligente de Desenvolvimento de Software",
  "fab.novo_projeto": "Novo Projeto",
  "fab.pipeline": "Pipeline de Projetos",
};

const en: Dict = {
  "nav.dashboard": "Dashboard",
  "nav.fabrica": "Factory",
  "nav.projetos": "Projects",
  "nav.briefings": "Briefings",
  "nav.templates": "Templates",
  "nav.clientes": "Clients",
  "nav.licencas": "Licenses",
  "nav.licencas_sw": "SW Licenses",
  "nav.pagamentos": "Payments",
  "nav.assinaturas": "Subscriptions",
  "nav.planos": "Plans",
  "nav.cupons": "Coupons",
  "nav.metas": "Goals",
  "nav.campanhas": "Campaigns",
  "nav.gamificacao": "Gamification",
  "nav.calendario": "Calendar",
  "nav.checklist": "Checklist",
  "nav.feedback": "Feedback",
  "nav.treinamentos": "Training",
  "nav.documentos": "Documents",
  "nav.marketplace": "Marketplace",
  "nav.usuarios": "Users",
  "nav.funcoes": "Roles & Permissions",
  "nav.notificacoes": "Notifications",
  "nav.backups": "Backups",
  "nav.configuracoes": "Settings",
  "nav.logs": "Audit Logs",
  "nav.sair": "Logout",
  "nav.recolher": "Collapse menu",
  "common.salvar": "Save",
  "common.cancelar": "Cancel",
  "common.novo": "New",
  "common.excluir": "Delete",
  "common.editar": "Edit",
  "common.buscar": "Search",
  "common.carregando": "Loading...",
  "login.entrar": "Login",
  "login.email": "Email",
  "login.senha": "Password",
  "login.acessar": "Access panel",
  "login.recuperar": "Recover access",
  "login.credenciais": "Enter your admin credentials.",
  "fab.titulo": "Software Factory",
  "fab.desc": "Intelligent Software Development Platform",
  "fab.novo_projeto": "New Project",
  "fab.pipeline": "Project Pipeline",
};

const dicts: Record<Locale, Dict> = { pt, en };

type I18nContext = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (l: Locale) => void;
};

const Ctx = createContext<I18nContext>({
  locale: "pt",
  t: (k) => k,
  setLocale: () => {},
});

export function useI18n() {
  return useContext(Ctx);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("orion-locale") as Locale | null;
    if (saved === "pt" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("orion-locale", l);
  };

  const t = (key: string): string => {
    return dicts[locale][key] ?? dicts.pt[key] ?? key;
  };

  return (
    <Ctx.Provider value={{ locale, t, setLocale }}>
      {children}
    </Ctx.Provider>
  );
}
