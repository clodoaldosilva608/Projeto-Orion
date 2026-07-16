import { Construction, Sparkles } from 'lucide-react'

export function ComingSoon({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl relative"
        style={{ background: 'linear-gradient(135deg, rgb(99 102 241 / 0.1), rgb(168 85 247 / 0.1))', border: '1px solid rgb(168 85 247 / 0.2)' }}
      >
        <Construction className="w-10 h-10 text-indigo-400" />
        <Sparkles className="w-5 h-5 text-amber-400 absolute -top-2 -right-2" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
      <p className="text-lg max-w-md" style={{ color: 'rgb(var(--text-secondary))' }}>
        {description}
      </p>
      
      <div className="mt-8 px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'rgb(var(--surface-2))', color: 'rgb(var(--text-muted))', border: '1px solid rgb(var(--glass-border))' }}>
        Módulo em desenvolvimento
      </div>
    </div>
  )
}
