"use client";
import { useState, useEffect } from "react";
import { LayoutGrid, TrendingUp, Users, DollarSign, Activity, AlertTriangle, Clock, Cpu, Database, Save, RotateCcw, GripVertical } from "lucide-react";

type Widget = { id: string; title: string; icon: any; color: string; size: "small" | "medium" | "large" };

const DEFAULT_WIDGETS: Widget[] = [
  { id: "kpi-clients", title: "Clientes Ativos", icon: Users, color: "#8b5cf6", size: "small" },
  { id: "kpi-revenue", title: "Receita Mensal", icon: DollarSign, color: "#10b981", size: "small" },
  { id: "kpi-projects", title: "Projetos Ativos", icon: TrendingUp, color: "#3b82f6", size: "small" },
  { id: "kpi-ia", title: "Uso de IA", icon: Cpu, color: "#f59e0b", size: "small" },
  { id: "chart-revenue", title: "Gráfico de Receita", icon: Activity, color: "#10b981", size: "large" },
  { id: "chart-projects", title: "Projetos por Status", icon: LayoutGrid, color: "#8b5cf6", size: "medium" },
  { id: "alerts", title: "Alertas", icon: AlertTriangle, color: "#ef4444", size: "medium" },
  { id: "system", title: "Status do Sistema", icon: Database, color: "#06b6d4", size: "medium" },
  { id: "activity", title: "Atividades Recentes", icon: Clock, color: "#6366f1", size: "large" },
];

export function DragDropDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem("orion-widget-order");
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder) as string[];
        const reordered = order.map(id => DEFAULT_WIDGETS.find(w => w.id === id)).filter(Boolean) as Widget[];
        const missing = DEFAULT_WIDGETS.filter(w => !order.includes(w.id));
        setWidgets([...reordered, ...missing]);
      } catch {}
    }
  }, []);

  function handleDragStart(id: string) { setDraggedId(id); }
  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (draggedId === targetId || !draggedId) return;
    const draggedIdx = widgets.findIndex(w => w.id === draggedId);
    const targetIdx = widgets.findIndex(w => w.id === targetId);
    if (draggedIdx < 0 || targetIdx < 0) return;
    const newWidgets = [...widgets];
    [newWidgets[draggedIdx], newWidgets[targetIdx]] = [newWidgets[targetIdx], newWidgets[draggedIdx]];
    setWidgets(newWidgets);
  }
  function handleDragEnd() { setDraggedId(null); }
  function save() {
    localStorage.setItem("orion-widget-order", JSON.stringify(widgets.map(w => w.id)));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  function reset() {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem("orion-widget-order");
  }

  const sizeClass = { small: "col-span-1", medium: "col-span-2", large: "col-span-3" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={save} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg brand-gradient text-xs font-semibold text-white"><Save className="h-3.5 w-3.5" />{saved ? "Salvo!" : "Salvar layout"}</button>
        <button onClick={reset} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs text-[#8b8fa3] hover:text-white"><RotateCcw className="h-3.5 w-3.5" />Restaurar padrão</button>
        <span className="text-xs text-[#6b7280] ml-2">Arraste os cards para reordenar</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((w) => {
          const Icon = w.icon;
          return (
            <div key={w.id} draggable onDragStart={() => handleDragStart(w.id)} onDragOver={(e) => handleDragOver(e, w.id)} onDragEnd={handleDragEnd} className={`glass-card p-5 cursor-move transition-all ${draggedId === w.id ? "opacity-50 scale-95" : ""} ${sizeClass[w.size]}`}>
              <div className="flex items-center gap-2 mb-3">
                <GripVertical className="h-4 w-4 text-[#6b7280]" />
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${w.color}22`, color: w.color }}><Icon className="h-4 w-4" /></div>
                <h3 className="text-sm font-semibold text-white">{w.title}</h3>
              </div>
              <div className="h-32 rounded-lg bg-white/[0.02] flex items-center justify-center">
                <span className="text-xs text-[#6b7280]">Widget content here</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
