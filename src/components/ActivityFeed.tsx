import {
  FolderPlus,
  BadgeCheck,
  Rocket,
  KeyRound,
  UploadCloud,
  UserPlus,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export type Activity = {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
};

/**
 * Color mapping per spec:
 *  - green for "created"   (project_created)
 *  - purple for "published" (application_published)
 *  - blue for "renewed"     (license_renewed)
 * Other types keep semantic colors (emerald, sky, cyan, amber).
 */
const TYPE_META: Record<
  string,
  { icon: LucideIcon; bg: string; fg: string }
> = {
  project_created: {
    icon: FolderPlus,
    bg: "rgba(16, 185, 129, 0.15)",
    fg: "#34d399",
  },
  payment_approved: {
    icon: BadgeCheck,
    bg: "rgba(16, 185, 129, 0.15)",
    fg: "#34d399",
  },
  application_published: {
    icon: Rocket,
    bg: "rgba(139, 92, 246, 0.15)",
    fg: "#a78bfa",
  },
  license_renewed: {
    icon: KeyRound,
    bg: "rgba(59, 130, 246, 0.15)",
    fg: "#60a5fa",
  },
  deploy_performed: {
    icon: UploadCloud,
    bg: "rgba(14, 165, 233, 0.15)",
    fg: "#38bdf8",
  },
  user_invited: {
    icon: UserPlus,
    bg: "rgba(6, 182, 212, 0.15)",
    fg: "#22d3ee",
  },
  ticket_opened: {
    icon: MessageSquare,
    bg: "rgba(245, 158, 11, 0.15)",
    fg: "#fbbf24",
  },
};

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="glass-card glass-card-hover p-5 lg:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-fg">Atividades Recentes</h3>
        <button className="text-xs font-medium text-violet-300 hover:text-violet-200">
          Ver tudo
        </button>
      </div>

      <ul className="space-y-1 flex-1 max-h-96 overflow-y-auto scroll-area">
        {activities.map((a, i) => {
          const meta = TYPE_META[a.type] ?? {
            icon: MessageSquare,
            bg: "rgba(255,255,255,0.05)",
            fg: "#8b8fa3",
          };
          const Icon = meta.icon;
          return (
            <li key={a.id} className="flex gap-3 py-2.5 relative">
              {i < activities.length - 1 && (
                <span
                  className="absolute left-[18px] top-11 bottom-0 w-px"
                  style={{ background: "var(--border)" }}
                />
              )}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: meta.bg, color: meta.fg }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg">{a.title}</p>
                <p className="text-xs text-muted-2 truncate">
                  {a.description}
                </p>
              </div>
              <span className="text-[11px] text-muted-2 whitespace-nowrap">
                {timeAgo(a.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
