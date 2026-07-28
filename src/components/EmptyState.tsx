import type { LucideIcon } from "lucide-react";

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: LucideIcon; 
  title: string; 
  description: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
      <div className="h-16 w-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-[#6b7280]" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-[#8b8fa3] mb-4 max-w-md">{description}</p>
      {action}
    </div>
  );
}
