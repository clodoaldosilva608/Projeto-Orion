import Link from "next/link";
import DashboardLayout from "../dashboard/layout";
import { PageHeader, PageButton, Badge } from "@/components/ui-parts";
import { Calendar, Plus, ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import {
  listCalendarEventsAction,
  getCalendarStatsAction,
} from "@/lib/calendario-actions";
import { getEventColor } from "@/lib/calendario-helpers";
import { CalendarFilters, DeleteEventButton } from "./CalendarClient";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  holiday: "Feriado",
  commemorative: "Comemorativa",
  campaign_deadline: "Prazo de Campanha",
  company_event: "Evento Empresa",
  meeting: "Reunião",
  training: "Treinamento",
  other: "Outro",
};

const SCOPE_LABEL: Record<string, string> = {
  company: "Empresa",
  branch: "Filial",
  team: "Equipe",
  personal: "Pessoal",
};

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function toISODate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;
  const typeFilter = (params.type as string) || "all";
  const scopeFilter = (params.scope as string) || "all";

  const [{ data: events, error }, { data: stats }] = await Promise.all([
    listCalendarEventsAction({ year, month, type: typeFilter, scope: scopeFilter }),
    getCalendarStatsAction(year, month),
  ]);

  const eventList = events ?? [];

  // Group events by day
  const eventsByDay = new Map<string, typeof eventList>();
  for (const e of eventList) {
    const dateKey = toISODate(new Date(e.startDate));
    if (!eventsByDay.has(dateKey)) eventsByDay.set(dateKey, []);
    eventsByDay.get(dateKey)!.push(e);
  }

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // Build cells: leading blanks + days
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month - 1, d));
  // Trailing blanks to fill last week
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const todayKey = toISODate(today);

  // Previous/next month links
  const prevMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const buildQuery = (y: number, m: number) =>
    `?year=${y}&month=${m}&type=${typeFilter}&scope=${scopeFilter}`;

  // Upcoming events (next 5 from today)
  const upcomingEvents = eventList
    .filter((e: any) => new Date(e.startDate) >= new Date(today.toDateString()))
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <PageHeader
          title="Calendário Comercial"
          description="Feriados, datas comemorativas, eventos da empresa e prazos de campanhas."
          icon={Calendar}
          action={
            <Link href="/calendario/nova">
              <PageButton>
                <Plus className="h-4 w-4" />
                Novo Evento
              </PageButton>
            </Link>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Total no mês</div>
            <div className="text-2xl font-bold text-white mt-1">{stats?.total ?? 0}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Oficiais</div>
            <div className="text-2xl font-bold text-red-300 mt-1">{stats?.official ?? 0}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Personalizados</div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats?.custom ?? 0}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[#8b8fa3] uppercase tracking-wide">Feriados</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{stats?.byType?.holiday ?? 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar grid (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-card p-5">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <Link
                  href={`/calendario${buildQuery(prevMonth.year, prevMonth.month)}`}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-[#8b8fa3] hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                <h3 className="text-base font-semibold text-white">
                  {MONTH_NAMES[month - 1]} {year}
                </h3>
                <Link
                  href={`/calendario${buildQuery(nextMonth.year, nextMonth.month)}`}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-[#8b8fa3] hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Weekday header */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="text-center text-[10px] font-semibold uppercase tracking-wide text-[#6b7280] py-1">
                    {w}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((date, idx) => {
                  if (!date) return <div key={idx} className="aspect-square rounded-lg bg-white/[0.01]" />;
                  const dateKey = toISODate(date);
                  const dayEvents = eventsByDay.get(dateKey) ?? [];
                  const isToday = dateKey === todayKey;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-lg p-1.5 flex flex-col gap-0.5 transition-colors ${
                        isToday
                          ? "bg-violet-500/15 ring-1 ring-violet-400/40"
                          : isWeekend
                          ? "bg-white/[0.02]"
                          : "bg-white/[0.03] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className={`text-xs font-medium ${isToday ? "text-violet-300" : isWeekend ? "text-[#6b7280]" : "text-[#c4c8d8]"}`}>
                        {date.getDate()}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                        {dayEvents.slice(0, 3).map((e: any) => (
                          <div
                            key={e.id}
                            className="text-[9px] leading-tight px-1 py-0.5 rounded truncate font-medium"
                            style={{ backgroundColor: `${e.color}22`, color: e.color }}
                            title={e.title}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-[#8b8fa3]">+{dayEvents.length - 3}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Filters */}
            <CalendarFilters
              year={year}
              month={month}
              type={typeFilter}
              scope={scopeFilter}
            />

            {/* Upcoming events */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-semibold text-white">Próximos eventos</h3>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-[#8b8fa3]">
                  Nenhum evento próximo.
                </div>
              ) : (
                <ul className="divide-y divide-white/[0.04]">
                  {upcomingEvents.map((e: any) => (
                    <li key={e.id} className="px-5 py-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-1 h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: e.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{e.title}</div>
                          <div className="text-xs text-[#8b8fa3] mt-0.5">
                            {new Date(e.startDate).toLocaleDateString("pt-BR", {
                              weekday: "short", day: "2-digit", month: "short",
                            })}
                            {e.location && (
                              <span className="ml-2 inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {e.location}
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <span
                              className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                              style={{ backgroundColor: `${e.color}22`, color: e.color }}
                            >
                              {TYPE_LABEL[e.type] ?? e.type}
                            </span>
                            {e.isOfficial && (
                              <span className="ml-1 text-[10px] text-[#6b7280]">· oficial</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Legend */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Legenda</h3>
              <ul className="space-y-2">
                {Object.entries(TYPE_LABEL).map(([key, label]) => (
                  <li key={key} className="flex items-center gap-2 text-xs text-[#c4c8d8]">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getEventColor(key) }}
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* All events list for the month */}
        <div className="glass-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Todos os eventos — {MONTH_NAMES[month - 1]} {year}
            </h3>
            <span className="text-xs text-[#6b7280]">{eventList.length} eventos</span>
          </div>
          {error ? (
            <div className="px-5 py-8 text-center text-sm text-red-300">{error}</div>
          ) : eventList.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#8b8fa3]">
              Nenhum evento neste mês. {""}
              <Link href="/calendario/nova" className="text-violet-300 hover:text-violet-200">
                Criar evento
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#8b8fa3] uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Evento</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Escopo</th>
                  <th className="px-5 py-3 font-medium">Local</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {eventList.map((e: any) => (
                  <tr key={e.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-sm text-[#c4c8d8]">
                      {new Date(e.startDate).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "short", weekday: "short",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-white">{e.title}</div>
                      {e.description && (
                        <div className="text-xs text-[#8b8fa3] line-clamp-1 mt-0.5">{e.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex rounded-md px-2 py-1 text-[11px] font-semibold"
                        style={{ backgroundColor: `${e.color}22`, color: e.color }}
                      >
                        {TYPE_LABEL[e.type] ?? e.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">
                      {SCOPE_LABEL[e.scope] ?? e.scope}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#8b8fa3]">{e.location ?? "—"}</td>
                    <td className="px-5 py-3 text-right">
                      {!e.isOfficial && !e.isCampaign && (
                        <DeleteEventButton id={e.id} title={e.title} />
                      )}
                      {e.isOfficial && <span className="text-xs text-[#6b7280]">oficial</span>}
                      {e.isCampaign && <span className="text-xs text-violet-300">campanha</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
