# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 09

# UX/UI DESIGN SYSTEM

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** UX/UI Design System
**Stack:** React 18 + Next.js 14 + Tailwind CSS 3 + shadcn/ui + Radix Primitives
**Tipografia:** Inter (sans) · Noto Serif SC (serif CJK) · JetBrains Mono (mono)
**Cor primária corporativa:** `#1E3A8A` (azul corporativo)

---

# Capítulo 1 — Objetivo e Escopo

Este documento define o Design System completo do Projeto Orion: princípios visuais, paleta de cores, tipografia, espaçamentos, grid, tokens de motion, sombras, raios, e o catálogo exaustivo de componentes com variantes, estados, props, exemplos de código TSX, tokens consumidos e requisitos de acessibilidade (WCAG 2.1 AA).

**Público-alvo:** desenvolvedores frontend, designers de produto, QA de UI, tech writers e PMs. Todo PR que toque em UI deve referenciar este documento.

**Fora de escopo:** design de marketing (landing pages públicas), templates de e-mail transacional (ver Doc 12), branding visual da marca Orion (ver Doc 22).

---

# Capítulo 2 — Princípios de Design

## 2.1 Clareza Acima de Tudo
Cada elemento deve comunicar seu propósito imediatamente. O usuário não deve precisar pensar para entender o que um botão faz. Se um ícone for ambíguo, adicione um rótulo de texto.

## 2.2 Hierarquia Visual Óbvia
Títulos são maiores e mais pesados que o corpo. Ações primárias são mais proeminentes que secundárias. Dados importantes se destacam do contexto. Use **tamanho + peso + cor**, nunca apenas um desses.

## 2.3 Feedback Imediato
Toda interação do usuário deve gerar feedback visual em menos de 100 ms: hover, focus, loading, success, error. Operações > 200 ms devem mostrar spinner; > 1 s devem mostrar progresso determinado quando possível.

## 2.4 Consistência Radical
O mesmo componente se comporta igual em todas as telas. Mesmo espaçamento, mesma cor, mesma animação. Variação visual é **sempre** uma variante declarada, nunca uma sobreposição ad-hoc.

## 2.5 Acessibilidade Nativa
WCAG 2.1 AA em todo o sistema. Contraste mínimo 4.5:1, navegação completa por teclado, suporte a leitores de tela, `prefers-reduced-motion` honrado, focus visible jamais removido sem substituto visível equivalente.

## 2.6 Densidade Informacional
Plataforma B2B de gestão: o usuário passa horas por dia na tela. Otimizamos para densidade responsável — mais informações úteis por unidade de tela sem sacrificar legibilidade. Tabelas compactas, dashboards ricos, formulários em múltiplas colunas no desktop.

---

# Capítulo 3 — Paleta de Cores

## 3.1 Cores Primárias (Tema Claro)

| Token | Hex | Uso |
|-------|-----|-----|
| `--primary` | `#1E3A8A` | Ações primárias, links, ícones principais |
| `--primary-hover` | `#1E40AF` | Hover de botões primários |
| `--primary-active` | `#1E3A8A` | Active/pressed |
| `--primary-light` | `#3B82F6` | Elementos de destaque secundário |
| `--primary-bg` | `#EFF6FF` | Backgrounds de cards destacados |
| `--primary-bg-strong` | `#DBEAFE` | Backgrounds de seleção ativa |

## 3.2 Cores Neutras

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-page` | `#FFFFFF` | Fundo da página |
| `--bg-card` | `#F8FAFC` | Fundo de cards |
| `--bg-stripe` | `#F1F5F9` | Listras de tabela |
| `--bg-hover` | `#F1F5F9` | Hover de linhas/itens |
| `--bg-sunken` | `#E2E8F0` | Campos desabilitados, well |
| `--border` | `#CBD5E1` | Bordas e divisores |
| `--border-strong` | `#94A3B8` | Bordas de foco em estados ativos |
| `--text-primary` | `#0F172A` | Texto principal |
| `--text-muted` | `#475569` | Texto secundário |
| `--text-subtle` | `#64748B` | Texto auxiliar, captions |
| `--text-disabled` | `#94A3B8` | Texto desabilitado |
| `--text-on-primary` | `#FFFFFF` | Texto sobre fundo primário |

## 3.3 Cores Semânticas

| Token | Hex | Hover | Bg light | Uso |
|-------|-----|-------|----------|-----|
| `--success` | `#16A34A` | `#15803D` | `#DCFCE7` | Sucesso, meta atingida |
| `--warning` | `#EA580C` | `#C2410C` | `#FFEDD5` | Atenção, meta próxima do prazo |
| `--danger` | `#DC2626` | `#B91C1C` | `#FEE2E2` | Erro, meta não atingida, exclusão |
| `--info` | `#0891B2` | `#0E7490` | `#CFFAFE` | Informação neutra |
| `--accent` | `#7C3AED` | `#6D28D9` | `#EDE9FE` | Destaque de campanha, gamificação |

## 3.4 Tema Escuro

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-page-dark` | `#0F172A` | Fundo da página |
| `--bg-card-dark` | `#1E293B` | Fundo de cards |
| `--bg-stripe-dark` | `#172033` | Listras |
| `--bg-hover-dark` | `#1E293B` | Hover |
| `--border-dark` | `#334155` | Bordas |
| `--text-primary-dark` | `#F1F5F9` | Texto principal |
| `--text-muted-dark` | `#94A3B8` | Texto secundário |
| `--primary-dark` | `#3B82F6` | Ações primárias (mais luminoso p/ contraste) |
| `--success-dark` | `#22C55E` | — |
| `--warning-dark` | `#F97316` | — |
| `--danger-dark` | `#EF4444` | — |

## 3.5 Contraste Verificado (WCAG AA)

| Combinação | Razão | Resultado |
|------------|-------|-----------|
| `--text-primary` sobre `--bg-page` | 16.8:1 | ✅ AAA |
| `--text-muted` sobre `--bg-page` | 8.6:1 | ✅ AAA |
| `--text-on-primary` sobre `--primary` | 8.6:1 | ✅ AAA |
| `--danger` sobre `--bg-page` | 4.5:1 | ✅ AA |
| `--warning` sobre `--bg-page` | 4.0:1 | ⚠️ AA apenas para > 18px ou bold |
| `--text-subtle` sobre `--bg-page` | 4.7:1 | ✅ AA |

---

# Capítulo 4 — Tipografia

## 4.1 Família Tipográfica

```css
--font-sans: "Inter", "Noto Sans SC", system-ui, -apple-system, sans-serif;
--font-serif: "Noto Serif SC", "Iowan Old Style", Georgia, serif;
--font-mono: "JetBrains Mono", "SF Mono", "Cascadia Code", monospace;
```

- **Primária:** Inter (sans-serif, peso 300–900) — todo o produto.
- **Secundária:** Noto Serif SC (serif CJK) — apenas citações, relatórios impressos e PDFs formais.
- **Monoespaçada:** JetBrains Mono — código, IDs técnicos, dados tabulares financeiros.

## 4.2 Escala Tipográfica

| Token | Tamanho | Peso | Line-height | Letter-spacing | Uso |
|-------|---------|------|-------------|----------------|-----|
| `display-1` | 48px | 800 | 1.1 | -0.02em | Hero de capa de login |
| `display-2` | 36px | 800 | 1.2 | -0.02em | Títulos de dashboard executivo |
| `h1` | 28px | 700 | 1.3 | -0.01em | Títulos de página |
| `h2` | 22px | 700 | 1.4 | -0.01em | Títulos de seção |
| `h3` | 18px | 600 | 1.4 | 0 | Títulos de card |
| `h4` | 16px | 600 | 1.5 | 0 | Subtítulos |
| `body` | 14px | 400 | 1.6 | 0 | Texto corrido (padrão) |
| `body-sm` | 13px | 400 | 1.5 | 0 | Texto secundário em tabelas |
| `caption` | 12px | 400 | 1.4 | 0 | Legendas, captions de tabela |
| `overline` | 11px | 600 | 1.2 | 0.08em | Labels, eyebrows, KPIs |
| `mono-sm` | 12px | 500 | 1.4 | 0 | IDs, código inline |
| `mono-md` | 13px | 500 | 1.5 | 0 | Snippets, dados tabulares |

## 4.3 Uso de Pesos

- **400 (Regular):** corpo de texto, inputs.
- **500 (Medium):** labels de formulário, itens de menu, células de tabela destacadas.
- **600 (Semibold):** títulos de card, valores de KPI, botões.
- **700 (Bold):** títulos de página e seção.
- **800 (Extrabold):** apenas display-1 e display-2.

---

# Capítulo 5 — Espaçamentos, Grid, Raios, Sombras, Z-Index

## 5.1 Escala de Espaçamentos (Base 4px)

| Token | Valor | Tailwind | Uso |
|-------|-------|----------|-----|
| `space-0` | 0 | `0` | — |
| `space-1` | 4px | `1` | Espaçamento mínimo (ícone↔texto inline) |
| `space-2` | 8px | `2` | Padding interno de chips/tags |
| `space-3` | 12px | `3` | Espaçamento entre fields irmãos |
| `space-4` | 16px | `4` | Padding interno de cards, gap padrão |
| `space-5` | 24px | `6` | Espaçamento entre seções de card |
| `space-6` | 32px | `8` | Espaçamento entre cards em grid |
| `space-7` | 48px | `12` | Espaçamento entre blocos grandes |
| `space-8` | 64px | `16` | Espaçamento entre páginas em wizard |

## 5.2 Grid System

- **Desktop (`≥ 1024px`):** 12 colunas, gutter 24px, margem 32px, max-width 1440px.
- **Tablet (`768–1023px`):** 8 colunas, gutter 16px, margem 24px.
- **Mobile (`< 768px`):** 4 colunas, gutter 16px, margem 16px.

```tsx
<div className="grid grid-cols-12 gap-6 px-8 max-w-[1440px] mx-auto">
  <aside className="col-span-3">Sidebar</aside>
  <main className="col-span-9">Conteúdo</main>
</div>
```

## 5.3 Breakpoints (alinhado ao Tailwind)

| Token | Valor | Dispositivo | Container max |
|-------|-------|-------------|---------------|
| `xs` | 0 | Mobile retrato | 100% |
| `sm` | 640px | Mobile grande | 640px |
| `md` | 768px | Tablet | 768px |
| `lg` | 1024px | Desktop pequeno | 1024px |
| `xl` | 1280px | Desktop | 1280px |
| `2xl` | 1536px | Desktop grande | 1440px |

## 5.4 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-none` | 0 | Imagens crop, tabelas com header contínuo |
| `radius-sm` | 4px | Chips, badges, tags |
| `radius-md` | 6px | Inputs, selects, botões pequenos |
| `radius-lg` | 8px | Botões padrão, dropdowns |
| `radius-xl` | 12px | Cards, modais |
| `radius-2xl` | 16px | Cards de dashboard destacados |
| `radius-full` | 9999px | Avatares, switches, pills |

## 5.5 Sombras (Elevação)

| Token | CSS | Uso |
|-------|-----|-----|
| `shadow-none` | none | Elementos flat sobre fundo já elevado |
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Inputs em focus |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)` | Cards padrão |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)` | Hover de card |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.05)` | Dropdowns, popovers |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)` | Modais |
| `shadow-2xl` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Command palette, dialogs críticos |

## 5.6 Z-Index Scale

Camadas estratificadas para evitar conflitos de stacking.

| Token | Valor | Camada |
|-------|-------|--------|
| `z-base` | 0 | Conteúdo padrão |
| `z-dropdown` | 1000 | Dropdowns, popovers |
| `z-sticky` | 1100 | Headers sticky, table headers |
| `z-sidebar` | 1200 | Sidebars fixas |
| `z-overlay` | 1300 | Backdrop de modal/drawer |
| `z-modal` | 1400 | Modal |
| `z-popover` | 1500 | Popover aberto a partir de modal |
| `z-toast` | 1600 | Toasts |
| `z-tooltip` | 1700 | Tooltips (sempre no topo) |
| `z-command` | 1800 | Command palette |
| `z-max` | 9999 | Erros críticos, full-screen takeover |

---

# Capítulo 6 — Tokens de Motion

## 6.1 Durações

| Token | Duração | Uso |
|-------|---------|-----|
| `duration-instant` | 0ms | Mudança de cor sem transição |
| `duration-fast` | 100ms | Click feedback, toggle |
| `duration-normal` | 150ms | Hover, focus |
| `duration-slow` | 250ms | Modal open, drawer slide |
| `duration-slower` | 300ms | Toast, page transition |
| `duration-slowest` | 400ms | Animações complexas (raro) |

## 6.2 Easings

| Token | Curva | Uso |
|-------|-------|-----|
| `ease-out` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Entradas (fade-in, slide-in) |
| `ease-in` | `cubic-bezier(0.4, 0.0, 1, 1)` | Saídas (fade-out) |
| `ease-in-out` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Transições simétricas |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Micro-rebotes (toggle, switch) |

## 6.3 Regras de `prefers-reduced-motion`

Toda animação não-essencial deve ser desativada quando `@media (prefers-reduced-motion: reduce)`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Animações **essenciais** (feedback de loading, indicadores de progresso) permanecem, mas com duração mínima.

---

# Capítulo 7 — Componentes de Formulário

## 7.1 Button

### Descrição
Botão é a unidade fundamental de ação. O Orion define **8 variantes × 3 tamanhos = 24 combinações** oficiais. Qualquer outra variação é proibida em produção.

### Anatomia
1. Container (padding, radius, bg, border)
2. Label (texto, peso 600)
3. Ícone esquerdo (opcional, 20px)
4. Ícone direito (opcional, 20px)
5. Spinner (estado loading)
6. Badge contador (opcional, à direita)

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `primary` | Ação principal da tela (Salvar, Criar, Confirmar) |
| `secondary` | Ação secundária co-existente com primária (Cancelar) |
| `outline` | Alternativa à secundária em fundos coloridos |
| `ghost` | Ação terciária sem chrome visual (Voltar, fechar) |
| `subtle` | Ação inline em densidade alta (filtros rápidos) |
| `danger` | Ação destrutiva (Excluir, Remover) |
| `success` | Confirmação positiva contextual (Aprovar, Concluir) |
| `link` | Ação que parece link mas semanticamente é botão |

### Tamanhos

| Size | Altura | Padding X | Fonte | Ícone |
|------|--------|-----------|-------|-------|
| `sm` | 32px | 12px | 13px / 500 | 16px |
| `md` | 40px | 16px | 14px / 600 | 20px |
| `lg` | 48px | 20px | 16px / 600 | 20px |

### Estados

| Estado | Aparência (primary) |
|--------|---------------------|
| `default` | bg `--primary`, texto branco |
| `hover` | bg `--primary-hover` |
| `active` | bg `--primary-active`, translateY(1px) |
| `focus` | ring 2px `--primary-light` offset 2px |
| `disabled` | opacity 0.5, cursor not-allowed |
| `loading` | label hidden, spinner branco, bg mantido, pointer-events none |
| `error` | não aplicável (use variante `danger`) |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'subtle' \| 'danger' \| 'success' \| 'link'` | `'primary'` | Estilo visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dimensões |
| `loading` | `boolean` | `false` | Exibe spinner e bloqueia cliques |
| `disabled` | `boolean` | `false` | Desabilita o botão |
| `iconLeft` | `ReactNode` | — | Ícone à esquerda do label |
| `iconRight` | `ReactNode` | — | Ícone à direita |
| `fullWidth` | `boolean` | `false` | Ocupa 100% da largura do pai |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo HTML |
| `aria-label` | `string` | — | Quando não há texto visível |

### Exemplo

```tsx
import { Button } from "@/components/ui/button";
import { Save, Trash2, ChevronRight, Loader2 } from "lucide-react";

export function ButtonShowcase() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" size="md" iconLeft={<Save className="size-4" />}>
        Salvar
      </Button>

      <Button variant="secondary" size="md">
        Cancelar
      </Button>

      <Button variant="outline" size="md" iconRight={<ChevronRight className="size-4" />}>
        Próximo
      </Button>

      <Button variant="ghost" size="sm">
        Voltar
      </Button>

      <Button variant="danger" size="md" iconLeft={<Trash2 className="size-4" />}>
        Excluir
      </Button>

      <Button variant="success" size="md">
        Aprovar
      </Button>

      <Button variant="subtle" size="sm">
        Filtro rápido
      </Button>

      <Button variant="link" size="md">
        Esqueci minha senha
      </Button>

      <Button variant="primary" loading iconLeft={<Loader2 className="size-4 animate-spin" />}>
        Salvando…
      </Button>
    </div>
  );
}
```

### Tokens consumidos
`--primary`, `--primary-hover`, `--primary-active`, `--primary-bg`, `--text-on-primary`, `--border`, `--danger`, `--success`, `--shadow-sm`, `radius-lg`, `duration-fast`, `ease-out`.

### Acessibilidade
- `<button>` nativo com `type` explícito.
- Focus ring visível em `:focus-visible`.
- `aria-busy="true"` quando `loading`.
- `aria-disabled="true"` quando `disabled` (não use `disabled` real em todos os casos — às vezes precisamos manter o botão focável para anunciar o motivo).
- Ícone sem texto requer `aria-label`.
- Atalho: em forms, `Enter` no campo submete o botão primário automaticamente.

---

## 7.2 Input

### Descrição
Campo de texto de uma linha. Base de todos os inputs tipados.

### Anatomia
1. Label (acima, peso 500, 13px)
2. Container do input (border, bg, padding)
3. Ícone esquerdo (opcional, 16px)
4. Botão direito (limpar, mostrar senha — opcional)
5. Texto de ajuda (abaixo, 12px, `--text-muted`)
6. Texto de erro (abaixo, 12px, `--danger`)

### Variantes de tipo

| Tipo | Quando usar |
|------|-------------|
| `text` | Texto livre curto |
| `password` | Senhas (com toggle de visibilidade) |
| `email` | E-mail (validação nativa) |
| `number` | Numérico (com step buttons e máscara) |
| `tel` | Telefone (com máscara por locale) |
| `url` | URL |
| `search` | Busca (com ícone e clear) |
| `currency` | Valores monetários (máscara R$) |
| `cpf` / `cnpj` | Documentos brasileiros (máscara) |
| `cep` | CEP |

### Estados

| Estado | Border | Ring | Texto ajuda |
|--------|--------|------|-------------|
| `default` | `--border` | — | `--text-muted` |
| `focus` | `--primary` | 2px `--primary-bg` | — |
| `hover` | `--border-strong` | — | — |
| `disabled` | `--border` | — | — (opacity 0.5) |
| `error` | `--danger` | 2px `#FEE2E2` | `--danger` |
| `success` | `--success` | — | `--success` |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | `string` | — | Rótulo visível acima |
| `helperText` | `string` | — | Texto de ajuda |
| `error` | `string` | — | Mensagem de erro |
| `success` | `boolean` | `false` | Estado de válido |
| `iconLeft` | `ReactNode` | — | Ícone à esquerda |
| `iconRight` | `ReactNode` | — | Ícone/ação à direita |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Altura |
| `fullWidth` | `boolean` | `true` | Largura 100% |
| `required` | `boolean` | `false` | Marca como obrigatório |
| `mask` | `'cpf' \| 'cnpj' \| 'cep' \| 'phone' \| 'currency'` | — | Máscara automática |
| `prefix` | `string` | — | Texto à esquerda (ex.: `R$`) |
| `suffix` | `string` | — | Texto à direita (ex.: `%`, `kg`) |

### Exemplo

```tsx
import { Input } from "@/components/ui/input";
import { Mail, Search, X } from "lucide-react";

export function InputShowcase() {
  return (
    <div className="space-y-4 max-w-md">
      <Input
        label="E-mail corporativo"
        type="email"
        placeholder="voce@empresa.com.br"
        iconLeft={<Mail className="size-4 text-muted" />}
        required
      />

      <Input
        label="Busca"
        type="search"
        placeholder="Buscar cliente por nome ou CNPJ…"
        iconLeft={<Search className="size-4 text-muted" />}
        iconRight={<X className="size-4 text-muted cursor-pointer" />}
      />

      <Input
        label="Valor da meta"
        type="currency"
        mask="currency"
        prefix="R$"
        defaultValue={12500}
        helperText="Valor em reais. Use vírgula para centavos."
      />

      <Input
        label="CNPJ"
        mask="cnpj"
        error="CNPJ inválido. Verifique os 14 dígitos."
        defaultValue="11.222.333/0001-44"
      />
    </div>
  );
}
```

### Tokens consumidos
`--border`, `--border-strong`, `--primary`, `--primary-bg`, `--danger`, `--success`, `--text-primary`, `--text-muted`, `--bg-sunken`, `radius-md`, `duration-normal`.

### Acessibilidade
- `<label>` nativa vinculada via `htmlFor` ↔ `id`.
- `aria-invalid="true"` em erro, `aria-describedby` apontando para helper/error.
- `aria-required="true"` em obrigatórios.
- Focus visível com `:focus-visible` (não remova o outline sem substituto).
- Em `password`, o toggle de visibilidade anuncia `aria-label="Mostrar senha"` / `"Ocultar senha"`.

---

## 7.3 Textarea

### Descrição
Campo de texto multilinha para descrições, observações, comentários.

### Anatomia
1. Label
2. Container (resize vertical habilitado por padrão)
3. Contador de caracteres (canto inferior direito, opcional)
4. Helper / erro

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | `string` | — | — |
| `rows` | `number` | `4` | Linhas visíveis |
| `maxLength` | `number` | — | Ativa contador |
| `showCount` | `boolean` | `false` | Exibe `n/max` |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Comportamento de resize |
| `autoGrow` | `boolean` | `false` | Cresce com o conteúdo até `maxRows` |
| `maxRows` | `number` | `12` | Limite de crescimento automático |

### Exemplo

```tsx
import { Textarea } from "@/components/ui/textarea";

export function TextareaShowcase() {
  return (
    <div className="space-y-4 max-w-lg">
      <Textarea
        label="Observações da venda"
        placeholder="Descreva condições especiais, descontos negociados…"
        rows={4}
        maxLength={500}
        showCount
      />

      <Textarea
        label="Comentário interno"
        autoGrow
        maxRows={8}
        placeholder="O comentário cresce conforme você digita…"
      />
    </div>
  );
}
```

### Acessibilidade
- Mesmas regras de Input.
- Anuncia `aria-multiline="true"`.
- Contador é `aria-hidden` (informação redundante para SR).

---

## 7.4 Select

### Descrição
Dropdown de seleção única. Baseado em Radix Select.

### Anatomia
1. Trigger (input-like com chevron)
2. Dropdown panel (max-height 320px, scroll)
3. Item (com check no selecionado)
4. Grupo com label (opcional)
5. Busca inline para listas > 10 itens

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `default` | Lista ≤ 10 itens |
| `searchable` | Lista > 10 ou dinâmica |
| `creatable` | Permite criar novo item |
| `async` | Carrega opções do servidor |
| `multi` | Seleção múltipla (chips no trigger) |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `options` | `{ value: string; label: string; group?: string }[]` | `[]` | Lista de opções |
| `value` | `string \| string[]` | — | Valor controlado |
| `placeholder` | `string` | `'Selecione…'` | — |
| `searchable` | `boolean` | `false` | Habilita busca |
| `creatable` | `boolean` | `false` | Permite criar |
| `multi` | `boolean` | `false` | Seleção múltipla |
| `loading` | `boolean` | `false` | Mostra spinner no painel |
| `emptyText` | `string` | `'Nenhum resultado'` | Estado vazio da busca |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | — |

### Exemplo

```tsx
import { Select } from "@/components/ui/select";

const branches = [
  { value: "sp", label: "São Paulo - Matriz", group: "Sudeste" },
  { value: "rj", label: "Rio de Janeiro", group: "Sudeste" },
  { value: "poa", label: "Porto Alegre", group: "Sul" },
  { value: "cur", label: "Curitiba", group: "Sul" },
];

export function SelectShowcase() {
  return (
    <div className="space-y-4 max-w-sm">
      <Select
        label="Filial"
        options={branches}
        placeholder="Selecione a filial"
        searchable
      />
      <Select
        label="Período"
        options={[
          { value: "7d", label: "Últimos 7 dias" },
          { value: "30d", label: "Últimos 30 dias" },
          { value: "90d", label: "Últimos 90 dias" },
        ]}
        defaultValue="30d"
      />
    </div>
  );
}
```

### Acessibilidade
- Trigger é `<button>` com `aria-haspopup="listbox"` e `aria-expanded`.
- Items são `role="option"` com `aria-selected`.
- Navegação por teclado: `ArrowDown/Up`, `Home/End`, `Enter`, `Esc` fecha.
- Filtragem por digitação (type-ahead) para selects não-searchable.

---

## 7.5 Checkbox

### Descrição
Seleção binária ou indeterminada.

### Estados

| Estado | Aparência |
|--------|-----------|
| `unchecked` | Quadrado vazio, border `--border` |
| `checked` | Quadrado bg `--primary`, check branco |
| `indeterminate` | Quadrado bg `--primary`, traço horizontal branco |
| `disabled` | opacity 0.5 |
| `error` | border `--danger` |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `checked` | `boolean \| 'indeterminate'` | `false` | Estado controlado |
| `label` | `ReactNode` | — | Rótulo à direita |
| `description` | `string` | — | Texto secundário abaixo do label |
| `error` | `string` | — | Mensagem de erro |
| `indeterminate` | `boolean` | `false` | Estado pai em grupos |

### Exemplo

```tsx
import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxShowcase() {
  return (
    <div className="space-y-3">
      <Checkbox label="Receber notificações por e-mail" defaultChecked />
      <Checkbox
        label="Modo escuro"
        description="Aplica tema escuro em todo o sistema"
        defaultChecked
      />
      <Checkbox label="Concordo com os termos de uso" error="Você precisa aceitar" />
      <Checkbox label="Selecionar todos" indeterminate />
    </div>
  );
}
```

### Acessibilidade
- `<input type="checkbox">` real, escondido visualmente.
- Focus ring visível via `:focus-visible + label`.
- `aria-checked` reflete `true | false | mixed`.
- Espaço de toque mínimo 20×20px (label inclui padding).

---

## 7.6 Radio Group

### Descrição
Seleção única entre opções mutuamente exclusivas.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `options` | `{ value: string; label: string; description?: string; disabled?: boolean }[]` | — | Lista |
| `value` | `string` | — | Controlado |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | — |
| `name` | `string` | — | Nome do grupo (form) |

### Exemplo

```tsx
import { RadioGroup } from "@/components/ui/radio-group";

export function RadioShowcase() {
  return (
    <RadioGroup
      label="Frequência da meta"
      orientation="vertical"
      options={[
        { value: "daily", label: "Diária", description: "Renova todo dia à meia-noite" },
        { value: "weekly", label: "Semanal", description: "Renova toda segunda-feira" },
        { value: "monthly", label: "Mensal", description: "Renova no dia 1º" },
        { value: "quarterly", label: "Trimestral" },
      ]}
      defaultValue="monthly"
    />
  );
}
```

### Acessibilidade
- `role="radiogroup"` no container.
- Cada item é `role="radio"` com `aria-checked`.
- `ArrowDown/Right` move para o próximo, `ArrowUp/Left` para o anterior.

---

## 7.7 Switch

### Descrição
Toggle para configurações binárias (preferências, flags). Difere do checkbox por ser percebido como "ligado/desligado" em vez de "marcado/desmarcado".

### Anatomia
1. Track (44×24px, pill)
2. Thumb (20px círculo, translada 20px)
3. Label (à direita ou esquerda)

### Estados

| Estado | Track | Thumb |
|--------|-------|-------|
| `off` | `--bg-sunken` | branco, esquerda |
| `on` | `--primary` | branco, direita |
| `disabled` | opacity 0.5 | — |
| `focus` | ring 2px `--primary-bg` | — |
| `loading` | track cinza, spinner no thumb | — |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `checked` | `boolean` | `false` | Controlado |
| `label` | `ReactNode` | — | — |
| `description` | `string` | — | — |
| `loading` | `boolean` | `false` | Estado de carregamento |
| `size` | `'sm' \| 'md'` | `'md'` | Track menor em `sm` (32×18px) |

### Exemplo

```tsx
import { Switch } from "@/components/ui/switch";

export function SwitchShowcase() {
  return (
    <div className="space-y-4">
      <Switch label="Notificações push" description="Receber alertas no navegador" defaultChecked />
      <Switch label="Sincronização automática" loading />
      <Switch label="Modo de auditoria detalhada" size="sm" />
    </div>
  );
}
```

### Acessibilidade
- `role="switch"` com `aria-checked`.
- `Space` alterna, `Enter` também.
- Animação respeita `prefers-reduced-motion` (sem transição, muda instantaneamente).

---

## 7.8 Slider

### Descrição
Seleção de valor numérico em intervalo. Suporta um ou dois thumbs (range).

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `min` | `number` | `0` | — |
| `max` | `number` | `100` | — |
| `step` | `number` | `1` | — |
| `value` | `number \| [number, number]` | — | Single ou range |
| `defaultValue` | `number \| [number, number]` | — | — |
| `showTooltip` | `boolean` | `true` | Tooltip com valor ao arrastar |
| `marks` | `{ value: number; label?: string }[]` | — | Marcadores no track |
| `disabled` | `boolean` | `false` | — |

### Exemplo

```tsx
import { Slider } from "@/components/ui/slider";

export function SliderShowcase() {
  return (
    <div className="space-y-8 max-w-md">
      <Slider
        label="Comissão (%)"
        min={0}
        max={20}
        step={0.5}
        defaultValue={5}
        marks={[
          { value: 0, label: "0%" },
          { value: 10, label: "10%" },
          { value: 20, label: "20%" },
        ]}
      />
      <Slider
        label="Faixa de salário (R$)"
        min={1000}
        max={20000}
        step={500}
        defaultValue={[3000, 8000]}
      />
    </div>
  );
}
```

### Acessibilidade
- `role="slider"` com `aria-valuemin/max/now`.
- `ArrowRight/Up` incrementa, `ArrowLeft/Down` decrementa, `Home/End` para extremos.
- Tooltip é `aria-hidden`, valor é anunciado via `aria-valuetext`.

---

## 7.9 DatePicker

### Descrição
Seletor de data com calendário. Baseado em `react-day-picker` + Radix Popover.

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `single` | Uma data |
| `range` | Intervalo (check-in/check-out) |
| `multiple` | Múltiplas datas soltas |
| `month` | Apenas mês/ano |
| `quarter` | Trimestre |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `mode` | `'single' \| 'range' \| 'multiple' \| 'month'` | `'single'` | — |
| `value` | `Date \| DateRange \| Date[]` | — | — |
| `minDate` | `Date` | — | Bloqueia datas anteriores |
| `maxDate` | `Date` | — | Bloqueia datas posteriores |
| `disabledDates` | `Date[]` | — | Datas específicas desabilitadas (feriados) |
| `locale` | `'pt-BR' \| 'en-US' \| 'es-ES'` | `'pt-BR'` | Localização |
| `showQuickPresets` | `boolean` | `false` | Botões "Hoje", "Últimos 7 dias", etc. |
| `format` | `string` | `'dd/MM/yyyy'` | Formato de exibição |

### Exemplo

```tsx
import { DatePicker } from "@/components/ui/date-picker";

export function DatePickerShowcase() {
  return (
    <div className="space-y-4 max-w-sm">
      <DatePicker
        label="Data de fechamento"
        mode="single"
        minDate={new Date()}
        format="dd/MM/yyyy"
      />
      <DatePicker
        label="Período da campanha"
        mode="range"
        showQuickPresets
      />
      <DatePicker
        label="Mês de referência"
        mode="month"
      />
    </div>
  );
}
```

### Acessibilidade
- Trigger é `<button>` com `aria-label` contendo a data atual formatada.
- Calendário é `role="application"` com `role="grid"` interna.
- Navegação: `ArrowKeys` entre dias, `PageUp/Down` muda mês, `Home/End` início/fim da semana.
- Datas desabilitadas têm `aria-disabled="true"`.

---

## 7.10 TimePicker

### Descrição
Seletor de hora. Combina input mascarado com dropdown de slots.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `string` (`'HH:mm'`) | — | — |
| `format` | `'12h' \| '24h'` | `'24h'` | — |
| `step` | `number` (minutos) | `15` | Granularidade do dropdown |
| `min` | `string` | — | Ex.: `'08:00'` |
| `max` | `string` | — | Ex.: `'18:00'` |

### Exemplo

```tsx
import { TimePicker } from "@/components/ui/time-picker";

export function TimePickerShowcase() {
  return (
    <TimePicker
      label="Horário de início da jornada"
      format="24h"
      step={30}
      min="06:00"
      max="22:00"
      defaultValue="09:00"
    />
  );
}
```

### Acessibilidade
- Input editável manualmente ou via dropdown.
- `ArrowUp/Down` incrementa/decrementa a unidade sob o cursor.

---

## 7.11 ColorPicker

### Descrição
Seletor de cor para customização de temas, categorias e etiquetas.

### Anatomia
1. Trigger (swatch + hex)
2. Popover com saturation/luminosity picker
3. Hue slider
4. Alpha slider (opcional)
5. Input hex
6. Presets (paletas predefinidas)

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `string` (hex) | `'#1E3A8A'` | — |
| `alpha` | `boolean` | `false` | Permite transparência |
| `presets` | `{ name: string; colors: string[] }[]` | Paletas Orion | — |
| `format` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | — |

### Exemplo

```tsx
import { ColorPicker } from "@/components/ui/color-picker";

export function ColorPickerShowcase() {
  return (
    <ColorPicker
      label="Cor da categoria"
      defaultValue="#1E3A8A"
      presets={[
        { name: "Orion", colors: ["#1E3A8A", "#3B82F6", "#16A34A", "#EA580C", "#DC2626", "#7C3AED"] },
        { name: "Neutras", colors: ["#0F172A", "#475569", "#94A3B8", "#CBD5E1", "#F1F5F9", "#FFFFFF"] },
      ]}
    />
  );
}
```

### Acessibilidade
- Trigger anuncia a cor atual: `aria-label="Cor atual: azul corporativo, hex 1E3A8A"`.
- Picker tem `role="slider"` para hue e `role="application"` para o saturation grid.

---

## 7.12 FileUpload

### Descrição
Upload de arquivos com drag-and-drop, preview e progresso.

### Anatomia
1. Dropzone (border dashed, ícone, texto, link de seleção)
2. Lista de arquivos (nome, tamanho, preview, progresso, status)
3. Ações por arquivo (visualizar, remover, refazer)

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `default` | Arquivo único, dropzone grande |
| `compact` | Em formulários densos |
| `avatar` | Upload de foto de perfil (circular) |
| `multi` | Múltiplos arquivos com galeria |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `accept` | `string` (MIME) | — | Ex.: `'image/*'` |
| `maxSize` | `number` (bytes) | `5242880` (5MB) | — |
| `maxFiles` | `number` | `1` | — |
| `multiple` | `boolean` | `false` | — |
| `variant` | `'default' \| 'compact' \| 'avatar' \| 'multi'` | `'default'` | — |
| `onUpload` | `(file: File) => Promise<void>` | — | Função de upload |
| `autoUpload` | `boolean` | `true` | Inicia upload ao selecionar |
| `showPreview` | `boolean` | `true` | Thumbnail |

### Exemplo

```tsx
import { FileUpload } from "@/components/ui/file-upload";

export function FileUploadShowcase() {
  return (
    <div className="space-y-6">
      <FileUpload
        label="Logotipo da empresa"
        accept="image/png,image/svg+xml"
        maxSize={1_000_000}
        variant="default"
        onUpload={async (file) => {
          const fd = new FormData();
          fd.append("logo", file);
          await fetch("/api/uploads/logo", { method: "POST", body: fd });
        }}
      />
      <FileUpload
        label="Anexos do contrato"
        multiple
        maxFiles={10}
        maxSize={10_000_000}
        variant="multi"
        accept=".pdf,.doc,.docx"
      />
    </div>
  );
}
```

### Acessibilidade
- Dropzone é `<button>` e também recebe `ondrop`.
- `aria-label="Zona de upload. Clique ou arraste arquivos aqui."`.
- Progresso é `role="progressbar"` com `aria-valuenow`.

---

## 7.13 RichTextEditor

### Descrição
Editor WYSIWYG para descrições longas, comentários formatados e templates de e-mail. Baseado em TipTap.

### Anatomia
1. Toolbar (negrito, itálico, listas, link, imagem, código)
2. Área editável
3. Contador de caracteres (opcional)
4. Status (salvando / salvo)

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `string` (HTML) | — | — |
| `placeholder` | `string` | `'Escreva…'` | — |
| `toolbar` | `'full' \| 'basic' \| 'minimal'` | `'basic'` | — |
| `maxLength` | `number` | — | — |
| `mentions` | `boolean` | `false` | Habilita @menção |
| `uploadImage` | `(file: File) => Promise<string>` | — | URL da imagem |

### Exemplo

```tsx
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function RTEShowcase() {
  return (
    <RichTextEditor
      label="Descrição do produto"
      toolbar="full"
      placeholder="Descreva o produto com formatação rica…"
      maxLength={5000}
      mentions
      uploadImage={async (file) => {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch("/api/uploads/image", { method: "POST", body: fd });
        const { url } = await res.json();
        return url;
      }}
    />
  );
}
```

### Acessibilidade
- Toolbar é `role="toolbar"`, botões têm `aria-label` e `aria-pressed`.
- Área editável é `role="textbox"` com `aria-multiline="true"` e `aria-label`.
- Atalhos: `Cmd/Ctrl+B` bold, `Cmd/Ctrl+I` italic, `Cmd/Ctrl+K` link.

---

# Capítulo 8 — Componentes de Display

## 8.1 Card

### Descrição
Contêiner visual para agrupar conteúdo relacionado. Unidade base de dashboards.

### Anatomia
1. Header (título, subtítulo, ações à direita)
2. Body (padding 24px)
3. Footer (opcional, bg sutil, alinhado à direita)
4. Media (opcional, no topo, full-bleed)

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `default` | Card padrão com shadow-sm |
| `elevated` | Card com shadow-md (destaque) |
| `outlined` | Apenas border, sem shadow |
| `interactive` | Hover eleva shadow e translateY(-2px) |
| `sunken` | Fundo `--bg-sunken`, sem border |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `title` | `ReactNode` | — | — |
| `description` | `ReactNode` | — | Subtítulo |
| `actions` | `ReactNode` | — | Botões/ícones à direita |
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'interactive' \| 'sunken'` | `'default'` | — |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | — |
| `as` | `'div' \| 'article' \| 'section'` | `'div'` | Tag semântica |

### Exemplo

```tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export function CardShowcase() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <Card
        title="Vendas do dia"
        description="Comparado a ontem"
        actions={<Button variant="ghost" size="icon" aria-label="Mais opções"><MoreHorizontal className="size-4" /></Button>}
      >
        <p className="text-3xl font-semibold">R$ 12.500</p>
        <p className="text-sm text-success mt-1">+15% vs ontem</p>
      </Card>

      <Card variant="interactive" title="Meta mensal" description="Dezembro/2024">
        <p className="text-3xl font-semibold">87%</p>
        <p className="text-sm text-muted mt-1">R$ 87k de R$ 100k</p>
      </Card>

      <Card variant="outlined" title="Campanha ativa">
        <p className="text-sm">Black Friday 2024 — encerra em 5 dias</p>
      </Card>
    </div>
  );
}
```

### Tokens consumidos
`--bg-card`, `--border`, `--shadow-sm`, `--shadow-md`, `radius-xl`, `space-5`.

### Acessibilidade
- `interactive` usa `<button>` interno envolvendo conteúdo, ou `role="button"` + `tabindex=0` + handler de teclado.
- `aria-labelledby` aponta para o título.

---

## 8.2 Badge

### Descrição
Rótulo curto de status ou categoria. Sem ícone, apenas texto.

### Variantes

| Variante | Cor |
|----------|-----|
| `neutral` | cinza |
| `primary` | azul |
| `success` | verde |
| `warning` | laranja |
| `danger` | vermelho |
| `info` | ciano |
| `accent` | roxo |

### Tamanhos

| Size | Padding | Fonte |
|------|---------|-------|
| `sm` | 1px 6px | 11px |
| `md` | 2px 8px | 12px |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | ver variantes | `'neutral'` | — |
| `size` | `'sm' \| 'md'` | `'md'` | — |
| `dot` | `boolean` | `false` | Bolinha à esquerda |
| `uppercase` | `boolean` | `false` | Texto em caixa alta |

### Exemplo

```tsx
import { Badge } from "@/components/ui/badge";

export function BadgeShowcase() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="neutral">Rascunho</Badge>
      <Badge variant="primary" dot>Em análise</Badge>
      <Badge variant="success">Aprovado</Badge>
      <Badge variant="warning">Atenção</Badge>
      <Badge variant="danger">Rejeitado</Badge>
      <Badge variant="info">Informativo</Badge>
      <Badge variant="accent">Destaque</Badge>
    </div>
  );
}
```

---

## 8.3 Chip

### Descrição
Elemento removível usado em filtros ativos e seleções múltiplas.

### Anatomia
1. Label
2. Botão remover (X)

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | `string` | — | — |
| `onRemove` | `() => void` | — | Habilita botão X |
| `icon` | `ReactNode` | — | Ícone à esquerda |
| `variant` | `'default' \| 'primary'` | `'default'` | — |

### Exemplo

```tsx
import { Chip } from "@/components/ui/chip";

export function ChipShowcase() {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="Filial: São Paulo" onRemove={() => {}} />
      <Chip label="Status: Aprovado" onRemove={() => {}} variant="primary" />
      <Chip label="Período: Dez/2024" onRemove={() => {}} />
    </div>
  );
}
```

---

## 8.4 Tag

### Descrição
Rótulo estático com ícone, para categorização. Diferente de Chip (removível) e Badge (status).

### Exemplo

```tsx
import { Tag } from "@/components/ui/tag";
import { Tag as TagIcon } from "lucide-react";

<Tag icon={<TagIcon className="size-3" />} variant="primary">Varejo</Tag>
<Tag icon={<TagIcon className="size-3" />} variant="accent">Premium</Tag>
```

---

## 8.5 Avatar

### Descrição
Representação visual de pessoa (foto, iniciais ou ícone fallback).

### Anatomia
1. Imagem circular (ou fallback)
2. Indicador de presença (opcional, borda inferior direita)

### Variantes de tamanho

| Size | Dimensões | Fonte das iniciais |
|------|-----------|---------------------|
| `xs` | 24px | 10px |
| `sm` | 32px | 12px |
| `md` | 40px | 14px |
| `lg` | 56px | 18px |
| `xl` | 96px | 32px |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `src` | `string` | — | URL da imagem |
| `name` | `string` | — | Para gerar iniciais e cor |
| `size` | ver acima | `'md'` | — |
| `presence` | `'online' \| 'busy' \| 'away' \| 'offline'` | — | Bolinha de status |
| `ring` | `boolean` | `false` | Anel colorido (ex.: usuário logado) |

### Exemplo

```tsx
import { Avatar } from "@/components/ui/avatar";

export function AvatarShowcase() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name="Ana Beatriz Costa" size="md" presence="online" />
      <Avatar name="João Pedro" size="md" presence="busy" />
      <Avatar src="/team/maria.jpg" name="Maria Silva" size="md" />
      <Avatar name="Roberto" size="md" ring />
    </div>
  );
}
```

### Acessibilidade
- `<img>` com `alt` contendo o nome.
- Fallback de iniciais: `aria-label={name}` com `role="img"`.
- Indicador de presença é decorativo (`aria-hidden`).

---

## 8.6 Tooltip

### Descrição
Rótulo contextual exibido em hover/focus de um elemento.

### Anatomia
1. Trigger (qualquer elemento)
2. Tooltip (texto, bg dark, texto branco, seta opcional)
3. Posicionamento automático (12 lados)

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `content` | `ReactNode` | — | — |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | — |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | — |
| `delay` | `number` (ms) | `300` | — |
| `duration` | `number` (ms) | `2000` | Tempo visível (se `auto`) |

### Exemplo

```tsx
import { Tooltip } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

<Tooltip content="Esta métrica inclui apenas vendas confirmadas, não canceladas." side="right">
  <Info className="size-4 text-muted cursor-help" />
</Tooltip>
```

### Acessibilidade
- Tooltip abre em hover **e** focus (não apenas hover).
- Texto é curto (máx. 80 caracteres). Para conteúdo longo, use Popover.
- Em touch devices,Tooltip aparece em tap e some em tap fora.

---

## 8.7 Popover

### Descrição
Contêiner flutuante para conteúdo rico (formulários, painéis de configuração). Diferente do Tooltip, é interativo e persistente.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `trigger` | `ReactNode` | — | — |
| `content` | `ReactNode` | — | — |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | — |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | — |
| `modal` | `boolean` | `false` | Se true, fecha ao clicar fora |

### Exemplo

```tsx
import { Popover } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

<Popover
  trigger={<Button variant="outline" iconLeft={<Filter className="size-4" />}>Filtros</Button>}
  content={
    <div className="w-72 space-y-3 p-3">
      <h4 className="font-semibold text-sm">Filtrar por</h4>
      {/* Campos de filtro aqui */}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" size="sm">Limpar</Button>
        <Button variant="primary" size="sm">Aplicar</Button>
      </div>
    </div>
  }
  align="start"
/>
```

### Acessibilidade
- `aria-haspopup="dialog"` no trigger, `aria-expanded` reflete estado.
- Focus trap: Tab cicla dentro do popover, `Esc` fecha e devolve foco ao trigger.

---

## 8.8 Modal (Dialog)

### Descrição
Sobreposição central para tarefas focais: confirmações críticas, formulários curtos, visualização rápida.

### Anatomia
1. Backdrop (overlay)
2. Container (max-width por size)
3. Header (título + close)
4. Body (scroll se > viewport)
5. Footer (ações)

### Tamanhos

| Size | Max-width | Quando usar |
|------|-----------|-------------|
| `sm` | 400px | Confirmações simples |
| `md` | 500px | Diálogos padrão |
| `lg` | 640px | Formulários com vários campos |
| `xl` | 800px | Wizard, DataTable inline |
| `full` | 95vw × 95vh | Preview de relatório, editor rico |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `open` | `boolean` | `false` | Controlado |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `title` | `ReactNode` | — | — |
| `description` | `ReactNode` | — | — |
| `size` | ver acima | `'md'` | — |
| `closeOnOverlay` | `boolean` | `true` | — |
| `closeOnEsc` | `boolean` | `true` | — |
| `hideClose` | `boolean` | `false` | Esconde botão X (use em confirmações destrutivas obrigatórias) |

### Exemplo

```tsx
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ModalShowcase() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>Excluir campanha</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Excluir campanha?"
        description="Esta ação não pode ser desfeita. Todos os dados de resultados vinculados serão mantidos para auditoria."
        size="sm"
      >
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="danger" onClick={() => { /* excluir */ setOpen(false); }}>Excluir definitivamente</Button>
        </div>
      </Modal>
    </>
  );
}
```

### Acessibilidade
- `role="dialog"` com `aria-modal="true"`, `aria-labelledby` e `aria-describedby`.
- Focus trap completo.
- Restauração de foco ao fechar.
- `Esc` fecha (se `closeOnEsc`).
- Scroll lock no body quando aberto.

---

## 8.9 Drawer

### Descrição
Painel lateral que desliza da borda. Para formulários longos, detalhes, configurações sem sair do contexto.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `side` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | — |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Largura (ou altura se top/bottom) |
| `open` | `boolean` | — | — |
| `onOpenChange` | `(open: boolean) => void` | — | — |
| `title` | `ReactNode` | — | — |

### Tamanhos (lado direito)

| Size | Width (desktop) | Width (mobile) |
|------|-----------------|----------------|
| `sm` | 400px | 100% |
| `md` | 540px | 100% |
| `lg` | 720px | 100% |
| `full` | 95vw | 100% |

### Exemplo

```tsx
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DrawerShowcase() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Ver detalhes</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        side="right"
        size="lg"
        title="Detalhes da venda #10245"
      >
        <div className="space-y-6">
          {/* Conteúdo do detalhe */}
        </div>
      </Drawer>
    </>
  );
}
```

### Acessibilidade
- Mesmas regras do Modal.

---

## 8.10 Alert

### Descrição
Mensagem contextual inline (não flutuante). Para feedback persistente na página.

### Variantes

| Variante | Cor | Ícone padrão | Uso |
|----------|-----|--------------|-----|
| `info` | ciano | Info | Informação neutra |
| `success` | verde | CheckCircle | Confirmação |
| `warning` | laranja | AlertTriangle | Atenção |
| `danger` | vermelho | AlertOctagon | Erro |
| `primary` | azul | Bell | Destaque |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | ver acima | `'info'` | — |
| `title` | `ReactNode` | — | — |
| `icon` | `ReactNode` | automático | Customiza ícone |
| `onDismiss` | `() => void` | — | Botão fechar |
| `action` | `ReactNode` | — | Botão de ação (ex.: "Tentar novamente") |

### Exemplo

```tsx
import { Alert } from "@/components/ui/alert";

<Alert variant="warning" title="Campanha expira em 2 dias" action={<Button size="sm" variant="outline">Prorrogar</Button>}>
  A campanha "Black Friday" será encerrada automaticamente em 19/12 às 23h59.
</Alert>

<Alert variant="danger" title="Falha ao sincronizar" onDismiss={() => {}}>
  Não foi possível conectar ao servidor. Verifique sua conexão.
</Alert>
```

---

## 8.11 Toast

### Descrição
Notificação efêmera, não bloqueante, para feedback de ações.

### Anatomia
1. Container (canto superior direito por padrão)
2. Ícone (por variante)
3. Título
4. Descrição (opcional)
5. Ação (opcional, máximo 1 botão)
6. Botão fechar
7. Barra de progresso (opcional, mostra tempo restante)

### Variantes
Mesmas do Alert (`info`, `success`, `warning`, `danger`, `primary`).

### Props (Toast API)

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `title` | `string` | — | — |
| `description` | `string` | — | — |
| `variant` | ver acima | `'info'` | — |
| `duration` | `number` (ms) | `5000` | 0 = persistente |
| `action` | `{ label: string; onClick: () => void }` | — | — |

### API de uso (imperativa)

```tsx
import { toast } from "@/components/ui/toast";

toast.success("Meta salva", { description: "A meta de Janeiro foi atualizada." });
toast.error("Erro ao salvar", { description: "Você não tem permissão para editar esta meta." });
toast.warning("Sessão expirando", { description: "Renove em 5 minutos.", duration: 0 });
toast.info("Novo relatório disponível", { action: { label: "Ver", onClick: () => router.push("/reports") } });
```

### Acessibilidade
- `role="status"` para informativos, `role="alert"` para erros.
- `aria-live="polite"` (info/success/warning) ou `aria-live="assertive"` (danger).
- Não depende apenas de cor — sempre tem ícone e título.

---

## 8.12 Progress

### Descrição
Indicador visual de progresso de uma operação.

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `linear` | Upload, carregamento de página, barra de meta |
| `circular` | Espaços pequenos, refresh de dados |
| `stepper` | Wizard multi-etapas |

### Props (linear)

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `number` (0–100) | — | Indefinido se ausente |
| `max` | `number` | `100` | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Altura |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Cor |
| `showLabel` | `boolean` | `false` | Exibe "45%" |
| `indeterminate` | `boolean` | `false` | Animação contínua |

### Exemplo

```tsx
import { Progress } from "@/components/ui/progress";

<Progress value={67} showLabel variant="success" />
<Progress value={95} variant="warning" />
<Progress indeterminate />
```

### Acessibilidade
- `role="progressbar"` com `aria-valuenow/min/max`.
- Em indeterminado, omite `aria-valuenow`.

---

## 8.13 Spinner

### Descrição
Indicador de carregamento compacto, para espaços pequenos (dentro de botões, linhas de tabela).

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 12/16/20/32px |
| `label` | `string` | `'Carregando'` | Para SR |

### Exemplo

```tsx
import { Spinner } from "@/components/ui/spinner";

<div className="flex items-center gap-2">
  <Spinner size="sm" />
  <span className="text-sm text-muted">Atualizando…</span>
</div>
```

### Acessibilidade
- `role="status"` com `aria-live="polite"`.
- `aria-label` com texto descritivo.

---

## 8.14 Skeleton

### Descrição
Placeholder animado que simula a estrutura do conteúdo durante o carregamento. Preferível a spinner quando se conhece o layout.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `className` | `string` | — | Largura/altura customizadas |
| `variant` | `'text' \| 'rect' \| 'circle'` | `'rect'` | — |
| `lines` | `number` | `1` | Para `text` (múltiplas linhas) |

### Exemplo

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="space-y-3 p-6">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton variant="text" lines={3} />
    </div>
  );
}
```

### Acessibilidade
- `aria-hidden="true"` (decorativo).
- Container pai deve ter `role="status"` e `aria-label="Carregando"`.

---

# Capítulo 9 — Componentes de Navegação

## 9.1 Tabs

### Descrição
Alternar entre visualizações no mesmo contexto.

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `underline` | Padrão, dentro de cards |
| `pills` | Filtros visuais |
| `segmented` | Poucas opções (2–4), mutually exclusive |
| `enclosed` | Tabs como abas de pasta (header de página) |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `tabs` | `{ value: string; label: ReactNode; content: ReactNode; disabled?: boolean; badge?: ReactNode }[]` | — | — |
| `value` | `string` | — | Controlado |
| `variant` | ver acima | `'underline'` | — |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | — |

### Exemplo

```tsx
import { Tabs } from "@/components/ui/tabs";

<Tabs
  variant="enclosed"
  defaultValue="overview"
  tabs={[
    { value: "overview", label: "Visão geral", content: <OverviewTab /> },
    { value: "results", label: "Resultados", content: <ResultsTab />, badge: "24" },
    { value: "participants", label: "Participantes", content: <ParticipantsTab /> },
    { value: "settings", label: "Configurações", content: <SettingsTab />, disabled: !canEdit },
  ]}
/>
```

### Acessibilidade
- `role="tablist"`, cada tab é `role="tab"` com `aria-selected` e `aria-controls`.
- Painéis são `role="tabpanel"` com `aria-labelledby`.
- Navegação: `ArrowLeft/Right` entre tabs, `Home/End` para extremos.

---

## 9.2 Breadcrumb

### Descrição
Caminho hierárquico da página atual. Ajuda o usuário a saber onde está e voltar.

### Anatomia
1. Item raiz (Home)
2. Separador (chevron `/`)
3. Itens intermediários (clicáveis)
4. Página atual (não clicável, `aria-current="page"`)

### Exemplo

```tsx
import { Breadcrumb } from "@/components/ui/breadcrumb";

<Breadcrumb
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Metas", href: "/dashboard/goals" },
    { label: "Vendas SP — Dezembro 2024" }, // último = página atual
  ]}
/>
```

### Acessibilidade
- `nav[aria-label="Breadcrumb"]`.
- Itens são `<a>` ou `<span>` com `aria-current="page"` no último.

---

## 9.3 Pagination

### Descrição
Navegação entre páginas de listas longas.

### Anatomia
1. Botão anterior (`«`)
2. Páginas numeradas (com elipses para > 7)
3. Botão próximo (`»`)
4. Seletor de itens por página (opcional)
5. Contador "1–10 de 248"

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `page` | `number` | `1` | Atual |
| `totalPages` | `number` | — | — |
| `totalItems` | `number` | — | Para contador |
| `pageSize` | `number` | `10` | — |
| `onPageChange` | `(page: number) => void` | — | — |
| `showSizeSelector` | `boolean` | `false` | — |
| `siblingCount` | `number` | `1` | Páginas adjacentes à atual |

### Exemplo

```tsx
import { Pagination } from "@/components/ui/pagination";

<Pagination
  page={3}
  totalPages={25}
  totalItems={248}
  pageSize={10}
  onPageChange={(p) => router.push(`/sales?page=${p}`)}
  showSizeSelector
/>
```

### Acessibilidade
- `nav[aria-label="Paginação"]`.
- Página atual tem `aria-current="page"`.
- Botões prev/next têm `aria-label` descritivo.

---

## 9.4 Sidebar

### Descrição
Navegação principal da aplicação. Fixa em desktop, drawer em mobile.

### Anatomia
1. Logo (topo)
2. Seção de navegação primária
3. Seção de navegação secundária
4. Switcher de filial (opcional)
5. Perfil do usuário (rodapé)

### Variantes

| Variante | Comportamento |
|----------|---------------|
| `fixed` | Largura fixa 256px, sempre visível |
| `collapsible` | Pode recolher para 72px (apenas ícones) |
| `floating` | Não toca as bordas, com margin |
| `drawer` | Em mobile, abre como drawer |

### Item de menu

| Prop | Descrição |
|------|-----------|
| `label` | Texto |
| `icon` | Lucide icon 20px |
| `href` | Rota |
| `badge` | Contador ou status |
| `active` | Highlight atual |
| `children` | Submenu (recursivo) |
| `disabled` | — |

### Exemplo

```tsx
import { Sidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, Target, Users, Trophy, Settings, FileText } from "lucide-react";

<Sidebar
  logo="/orion-logo.svg"
  sections={[
    {
      title: "Principal",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard />, href: "/dashboard" },
        { label: "Metas", icon: <Target />, href: "/goals", badge: "12" },
        { label: "Equipe", icon: <Users />, href: "/team" },
        { label: "Ranking", icon: <Trophy />, href: "/ranking" },
      ],
    },
    {
      title: "Administração",
      items: [
        { label: "Relatórios", icon: <FileText />, href: "/reports" },
        { label: "Configurações", icon: <Settings />, href: "/settings" },
      ],
    },
  ]}
  variant="collapsible"
  user={{
    name: "Ana Beatriz",
    role: "Gerente Comercial",
    avatar: "/avatars/ana.jpg",
  }}
/>
```

### Acessibilidade
- `nav[aria-label="Navegação principal"]`.
- Item ativo: `aria-current="page"`.
- Submenu: `aria-expanded` no trigger, `role="menu"` nos filhos.
- Atalho em mobile: botão hamburguer tem `aria-label="Abrir menu"` / `"Fechar menu"`.

---

## 9.5 Topbar

### Descrição
Barra superior fixa. Contém busca global, notificações, switcher de contexto e perfil.

### Anatomia
1. Trigger de sidebar (mobile)
2. Breadcrumb ou título da página
3. Busca global (Cmd+K)
4. Switcher de filial
5. Notificações (badge)
6. Perfil (avatar + nome)

### Exemplo

```tsx
import { Topbar } from "@/components/ui/topbar";
import { Bell, Search } from "lucide-react";

<Topbar
  left={<Breadcrumb items={[...]} />}
  center={
    <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/40 hover:bg-muted">
      <Search className="size-4" />
      <span className="text-sm text-muted">Buscar ou ir para…</span>
      <kbd className="text-xs px-1.5 py-0.5 bg-muted rounded">⌘K</kbd>
    </button>
  }
  right={
    <>
      <BranchSwitcher />
      <NotificationBell count={3} />
      <UserMenu />
    </>
  }
/>
```

---

## 9.6 Menu

### Descrição
Lista de ações contextual, geralmente aberta a partir de um trigger (kebab, mais opções).

### Anatomia
1. Trigger
2. Panel
3. Items (com ícone, label, atalho)
4. Separadores
5. Group labels

### Props do item

| Prop | Tipo | Descrição |
|------|------|-----------|
| `label` | `string` | — |
| `icon` | `ReactNode` | — |
| `shortcut` | `string` | Ex.: `"⌘D"` |
| `disabled` | `boolean` | — |
| `destructive` | `boolean` | Vermelho |
| `divider` | `boolean` | Renderiza separador antes |
| `group` | `string` | Label de grupo |

### Exemplo

```tsx
import { Menu } from "@/components/ui/menu";
import { Pencil, Copy, Archive, Trash2, Download } from "lucide-react";

<Menu
  trigger={<Button variant="ghost" size="icon" aria-label="Mais ações"><MoreHorizontal /></Button>}
  items={[
    { label: "Editar", icon: <Pencil />, shortcut: "⌘E", onClick: edit },
    { label: "Duplicar", icon: <Copy />, onClick: duplicate },
    { divider: true, label: "Exportar", icon: <Download />, onClick: exportFn },
    { divider: true, label: "Arquivar", icon: <Archive />, onClick: archive },
    { label: "Excluir", icon: <Trash2 />, destructive: true, onClick: remove },
  ]}
/>
```

### Acessibilidade
- `role="menu"`, items são `role="menuitem"`.
- Navegação: `ArrowUp/Down`, `Home/End`, `Esc` fecha.

---

## 9.7 ContextMenu

### Descrição
Menu aberto via right-click em um elemento. Mesma API do Menu, mas trigger é implícito.

### Exemplo

```tsx
import { ContextMenu } from "@/components/ui/context-menu";

<ContextMenu
  items={[...]}
>
  <tr className="cursor-default">
    <td>...</td>
  </tr>
</ContextMenu>
```

### Acessibilidade
- Em desktop, abre via right-click.
- Em touch, abre via long-press.
- Atalho alternativo: `Shift+F10` quando o elemento tem foco.

---

## 9.8 CommandPalette

### Descrição
Busca global e ações rápidas acessíveis via `Cmd+K` / `Ctrl+K`. Componente mais elevado do sistema (`z-command`).

### Anatomia
1. Trigger (overlay fullscreen)
2. Input de busca (autofocus)
3. Grupos de resultados (Ações, Navegação, Pessoas, etc.)
4. Item (ícone, label, descrição, atalho)
5. Footer (atalhos: ↑↓ navegar, ⏎ selecionar, esc fechar)

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `open` | `boolean` | `false` | — |
| `onOpenChange` | `(open) => void` | — | — |
| `commands` | `Command[]` | — | Lista estática |
| `fetchCommands` | `(query: string) => Promise<Command[]>` | — | Busca dinâmica |
| `groups` | `{ name: string; commands: Command[] }[]` | — | Agrupamento |

### Exemplo

```tsx
import { CommandPalette } from "@/components/ui/command-palette";

<CommandPalette
  groups={[
    {
      name: "Navegação",
      commands: [
        { id: "dash", label: "Dashboard", icon: <LayoutDashboard />, shortcut: "G D", action: () => router.push("/dashboard") },
        { id: "goals", label: "Metas", icon: <Target />, shortcut: "G M", action: () => router.push("/goals") },
      ],
    },
    {
      name: "Ações",
      commands: [
        { id: "new-goal", label: "Criar nova meta", icon: <Plus />, shortcut: "C M", action: () => router.push("/goals/new") },
        { id: "new-campaign", label: "Criar campanha", icon: <Megaphone />, action: () => router.push("/campaigns/new") },
      ],
    },
  ]}
  fetchCommands={async (q) => {
    const res = await fetch(`/api/search?q=${q}`);
    return res.json();
  }}
/>
```

### Acessibilidade
- `role="dialog"` com `aria-label="Paleta de comandos"`.
- Lista é `role="listbox"`, items são `role="option"` com `aria-selected`.
- Autofocus no input, focus trap ativo.

---

# Capítulo 10 — Componentes de Dados

## 10.1 Table

### Descrição
Exibição tabular básica. Para dados complexos, use `DataTable`.

### Anatomia
1. Caption (acessível, visualmente escondido ou visível)
2. Header (`<thead>`, bg `--bg-stripe`, sticky opcional)
3. Body (`<tbody>`, linhas alternadas)
4. Footer (`<tfoot>`, opcional, para totais)

### Variantes de densidade

| Densidade | Padding Y | Linha altura | Quando usar |
|-----------|-----------|--------------|-------------|
| `compact` | 8px | 32px | Dashboards densos |
| `default` | 12px | 40px | Padrão |
| `comfortable` | 16px | 48px | Dados sensíveis, leitura prolongada |

### Exemplo

```tsx
import { Table } from "@/components/ui/table";

<Table density="default">
  <Table.Header>
    <Table.Row>
      <Table.Head>Vendedor</Table.Head>
      <Table.Head className="text-right">Vendas</Table.Head>
      <Table.Head className="text-right">Meta</Table.Head>
      <Table.Head>Status</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row hoverable>
      <Table.Cell className="font-medium">Ana Costa</Table.Cell>
      <Table.Cell className="text-right font-mono">R$ 12.500</Table.Cell>
      <Table.Cell className="text-right font-mono">R$ 10.000</Table.Cell>
      <Table.Cell><Badge variant="success">Atingida</Badge></Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

### Acessibilidade
- `<th scope="col">` em cabeçalhos de coluna, `scope="row"` em cabeçalhos de linha.
- `aria-sort` em colunas ordenáveis.
- Não usar `<table>` para layout — apenas dados tabulares reais.

---

## 10.2 DataTable

### Descrição
Tabela avançada com ordenação, filtros, seleção, paginação, expansão de linhas e colunas fixas. Construído sobre TanStack Table.

### Anatomia
1. Toolbar (busca, filtros, ações em massa, exportar)
2. Header com sort
3. Linhas com seleção (checkbox)
4. Linhas expansíveis (detalhe inline)
5. Colunas fixas (sticky left/right)
6. Paginação (footer)

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `columns` | `ColumnDef[]` | — | Definição TanStack |
| `data` | `T[]` | — | — |
| `enableSorting` | `boolean` | `true` | — |
| `enableFiltering` | `boolean` | `true` | — |
| `enableRowSelection` | `boolean` | `false` | — |
| `enableRowExpansion` | `boolean` | `false` | — |
| `stickyHeader` | `boolean` | `true` | — |
| `pageSize` | `number` | `10` | — |
| `emptyState` | `ReactNode` | — | — |
| `loadingState` | `ReactNode` | — | — |

### Exemplo

```tsx
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";

type Sale = { id: string; seller: string; amount: number; status: "ok" | "pending" };

const columns: ColumnDef<Sale>[] = [
  { id: "select", header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected()} />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} /> },
  { accessorKey: "seller", header: "Vendedor", filterFn: "includesString" },
  { accessorKey: "amount", header: "Valor", cell: ({ row }) => formatCurrency(row.original.amount), sortingFn: "alphanumeric" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "ok" ? "success" : "warning"}>{row.original.status === "ok" ? "Aprovada" : "Pendente"}</Badge> },
  { id: "actions", cell: ({ row }) => <Menu trigger={<MoreHorizontal />} items={[...]} /> },
];

export function SalesTable({ data }: { data: Sale[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableRowSelection
      enableSorting
      stickyHeader
      pageSize={20}
      emptyState={<EmptyState title="Nenhuma venda encontrada" description="Ajuste os filtros ou cadastre a primeira venda." />}
      loadingState={<TableSkeleton rows={10} />}
    />
  );
}
```

### Acessibilidade
- `aria-sort="ascending|descending|none"` nos headers ordenáveis.
- Seleção: `aria-selected` nas linhas.
- Botão de expandir: `aria-expanded`.
- Anuncia contagem de selecionados via `aria-live`.

---

## 10.3 Tree

### Descrição
Visualização hierárquica de dados. Para organogramas, categorias aninhadas, estrutura de pastas.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `nodes` | `TreeNode[]` | — | Estrutura recursiva |
| `defaultExpanded` | `string[]` | — | IDs expandidos inicialmente |
| `onSelect` | `(node) => void` | — | — |
| `multiSelect` | `boolean` | `false` | — |
| `showIcons` | `boolean` | `true` | — |
| `loadOnExpand` | `(node) => Promise<TreeNode[]>` | — | Lazy loading |

### Exemplo

```tsx
import { Tree } from "@/components/ui/tree";
import { Folder, FolderOpen, File } from "lucide-react";

<Tree
  nodes={[
    {
      id: "sp",
      label: "São Paulo (Matriz)",
      icon: <Folder />,
      iconOpen: <FolderOpen />,
      children: [
        { id: "sp-varejo", label: "Varejo", icon: <File /> },
        { id: "sp-atacado", label: "Atacado", icon: <File /> },
      ],
    },
    {
      id: "rj",
      label: "Rio de Janeiro",
      icon: <Folder />,
      children: [...],
    },
  ]}
  defaultExpanded={["sp"]}
  onSelect={(node) => console.log(node)}
/>
```

### Acessibilidade
- `role="tree"`, nodes são `role="treeitem"`.
- `aria-expanded` em nós com filhos.
- Navegação completa: `ArrowUp/Down` entre itens, `ArrowRight` expande/move para filho, `ArrowLeft` recolhe/move para pai.

---

## 10.4 List

### Descrição
Lista vertical de itens com layout flexível. Base para notificações, resultados de busca, activity feed.

### Anatomia
1. Container (divisores opcionais entre itens)
2. Item (leading, content, trailing)
3. Leading: avatar/ícone
4. Content: título, descrição, meta
5. Trailing: ação, badge, timestamp

### Exemplo

```tsx
import { List } from "@/components/ui/list";

<List divided>
  <List.Item
    leading={<Avatar name="Ana" size="sm" />}
    title="Ana Costa"
    description="Atingiu 120% da meta de dezembro"
    trailing={<span className="text-xs text-muted">há 2h</span>}
    onClick={() => navigate("/users/ana")}
  />
  <List.Item
    leading={<Avatar name="João" size="sm" />}
    title="João Pedro"
    description="Atualizou 3 oportunidades"
    trailing={<Badge variant="info">Novo</Badge>}
  />
</List>
```

---

## 10.5 Timeline

### Descrição
Sequência cronológica de eventos. Para auditoria, histórico de status, atividade de uma entidade.

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `vertical` | Padrão, em drawer lateral |
| `horizontal` | Stepper de processo |
| `alternate` | Lados alternados (visual) |

### Props do item

| Prop | Tipo | Descrição |
|------|------|-----------|
| `timestamp` | `Date` | — |
| `title` | `ReactNode` | — |
| `description` | `ReactNode` | — |
| `icon` | `ReactNode` | Bolinha custom |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | Cor da bolinha |

### Exemplo

```tsx
import { Timeline } from "@/components/ui/timeline";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

<Timeline
  items={[
    { timestamp: new Date("2024-12-15T10:00"), title: "Meta criada", description: "Por Maria Silva", variant: "info", icon: <Clock /> },
    { timestamp: new Date("2024-12-18T14:30"), title: "Em andamento", description: "50% atingido", variant: "default" },
    { timestamp: new Date("2024-12-20T09:15"), title: "Alerta de ritmo", description: "Projeta 85% no fechamento", variant: "warning", icon: <AlertCircle /> },
    { timestamp: new Date("2024-12-31T18:00"), title: "Meta atingida", description: "102% — R$ 102.500", variant: "success", icon: <CheckCircle2 /> },
  ]}
/>
```

---

## 10.6 Kanban

### Descrição
Visualização de tarefas em colunas por status. Para gestão de oportunidades, pipeline de vendas.

### Anatomia
1. Header de coluna (título + contador)
2. Lista de cards (drag-and-drop)
3. Card (compacto, com prioridade, responsável, deadline)
4. Botão "Adicionar" no rodapé de cada coluna

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `columns` | `KanbanColumn[]` | Definição de colunas |
| `items` | `KanbanItem[]` | Cards |
| `onDragEnd` | `(itemId, fromCol, toCol, newIndex) => void` | — |
| `enableDrag` | `boolean` | — |

### Exemplo

```tsx
import { Kanban } from "@/components/ui/kanban";

<Kanban
  columns={[
    { id: "todo", title: "A fazer", color: "neutral" },
    { id: "doing", title: "Em andamento", color: "primary" },
    { id: "review", title: "Em revisão", color: "warning" },
    { id: "done", title: "Concluído", color: "success" },
  ]}
  items={[
    { id: "1", columnId: "todo", title: "Follow-up Acme Ltda", priority: "high", assignee: "Ana", due: "2024-12-22" },
    { id: "2", columnId: "doing", title: "Proposta TechCorp", priority: "medium", assignee: "João", due: "2024-12-25" },
  ]}
  onDragEnd={(itemId, fromCol, toCol) => moveOpportunity(itemId, toCol)}
/>
```

### Acessibilidade
- Drag-and-drop tem alternativa: menu de ação "Mover para…" em cada card.
- `role="application"` no board, colunas são `role="list"`, cards são `role="listitem"`.

---

## 10.7 Calendar

### Descrição
Visualização calendário mensal/semanal/diária com eventos. Para agenda comercial.

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `month` | Visão padrão |
| `week` | Planejamento semanal |
| `day` | Agenda detalhada |
| `agenda` | Lista de próximos eventos |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `view` | `'month' \| 'week' \| 'day' \| 'agenda'` | `'month'` | — |
| `events` | `CalendarEvent[]` | — | — |
| `onSelectSlot` | `(slot: Date) => void` | — | — |
| `onSelectEvent` | `(event) => void` | — | — |
| `selectable` | `boolean` | `true` | — |
| `locale` | `string` | `'pt-BR'` | — |

### Exemplo

```tsx
import { Calendar } from "@/components/ui/calendar";

<Calendar
  view="month"
  events={[
    { id: "1", title: "Reunião Acme", start: new Date("2024-12-20T10:00"), end: new Date("2024-12-20T11:00"), color: "primary" },
    { id: "2", title: "Fechamento SP", start: new Date("2024-12-20T16:00"), end: new Date("2024-12-20T17:00"), color: "success" },
  ]}
  onSelectSlot={(date) => openEventForm(date)}
  onSelectEvent={(event) => openEventDetail(event.id)}
/>
```

---

## 10.8 GanttChart

### Descrição
Visualização de cronograma de projetos/campanhas em barras horizontais sobre timeline.

### Anatomia
1. Header com escala temporal (dias/semanas/meses)
2. Lista de tarefas (lado esquerdo)
3. Barras de duração (lado direito, alinhadas)
4. Dependências (setas entre barras)
5. Marco de hoje (linha vertical)
6. Marcos (losangos)

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `tasks` | `GanttTask[]` | — | — |
| `dependencies` | `{ from: string; to: string; type: 'FS' \| 'FF' \| 'SS' \| 'SF' }[]` | — | — |
| `viewMode` | `'day' \| 'week' \| 'month' \| 'quarter'` | `'month'` | — |
| `startDate` | `Date` | — | — |
| `endDate` | `Date` | — | — |
| `onTaskChange` | `(task) => void` | — | Drag para reposicionar |

### Exemplo

```tsx
import { GanttChart } from "@/components/ui/gantt";

<GanttChart
  viewMode="month"
  startDate={new Date("2024-12-01")}
  endDate={new Date("2025-03-31")}
  tasks={[
    { id: "t1", name: "Planejamento", start: new Date("2024-12-01"), end: new Date("2024-12-15"), progress: 100, color: "primary" },
    { id: "t2", name: "Capacitação", start: new Date("2024-12-10"), end: new Date("2024-12-20"), progress: 60 },
    { id: "t3", name: "Execução", start: new Date("2024-12-20"), end: new Date("2025-01-31"), progress: 20, color: "success" },
    { id: "t4", name: "Fechamento", start: new Date("2025-01-25"), end: new Date("2025-02-15"), progress: 0 },
  ]}
  dependencies={[
    { from: "t1", to: "t2", type: "FS" },
    { from: "t2", to: "t3", type: "FS" },
    { from: "t3", to: "t4", type: "FS" },
  ]}
/>
```

### Acessibilidade
- Tabela textual alternativa: `<table>` com colunas Tarefa/Início/Fim/Progresso, acessível por leitores de tela.
- Drag tem alternativa: inputs de data nas células da tabela alternativa.

---

# Capítulo 11 — Componentes de Gráficos

Todos os gráficos do Orion usam **Recharts** como base, com tema visual customizado alinhado ao Design System. Cores são tokenizadas via prop `colors` para permitir personalização por empresa.

### Tema compartilhado

```tsx
const chartTheme = {
  colors: {
    primary: "#1E3A8A",
    primaryLight: "#3B82F6",
    success: "#16A34A",
    warning: "#EA580C",
    danger: "#DC2626",
    info: "#0891B2",
    accent: "#7C3AED",
    neutral: "#94A3B8",
  },
  grid: { stroke: "#E2E8F0", strokeDasharray: "3 3" },
  axis: { fontSize: 12, fill: "#475569" },
  tooltip: {
    background: "#0F172A",
    border: "none",
    borderRadius: 8,
    color: "#F1F5F9",
    fontSize: 12,
  },
  animation: { duration: 300, easing: "ease-out" },
};
```

---

## 11.1 LineChart

### Descrição
Evolução temporal de uma ou mais séries. Ideal para tendências.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `data` | `Record<string, any>[]` | — | — |
| `xKey` | `string` | — | Eixo X (geralmente data) |
| `series` | `{ key: string; name: string; color?: string; dashed?: boolean }[]` | — | Múltiplas linhas |
| `height` | `number` | `300` | — |
| `showGrid` | `boolean` | `true` | — |
| `showLegend` | `boolean` | `true` | — |
| `showTooltip` | `boolean` | `true` | — |
| `area` | `boolean` | `false` | Preenche área abaixo da linha |
| `smoothing` | `'linear' \| 'monotone' \| 'step'` | `'monotone'` | Curvatura |

### Exemplo

```tsx
import { LineChart } from "@/components/charts/line-chart";

const data = [
  { month: "Jan", vendas: 45000, meta: 50000 },
  { month: "Fev", vendas: 52000, meta: 50000 },
  { month: "Mar", vendas: 48000, meta: 55000 },
  { month: "Abr", vendas: 61000, meta: 60000 },
  { month: "Mai", vendas: 58000, meta: 60000 },
];

<LineChart
  data={data}
  xKey="month"
  series={[
    { key: "vendas", name: "Vendas realizadas", color: "#1E3A8A" },
    { key: "meta", name: "Meta", color: "#94A3B8", dashed: true },
  ]}
  height={300}
  area
/>
```

### Acessibilidade
- `<svg>` com `role="img"` e `aria-label` descritivo.
- Tabela textual alternativa (`sr-only`) com os mesmos dados.
- Cores não são o único canal de diferenciação (linhas tracejadas para meta).

---

## 11.2 BarChart

### Descrição
Comparação entre categorias. Suporta barras verticais/horizontais e agrupadas/empilhadas.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `data` | `Record<string, any>[]` | — | — |
| `xKey` | `string` | — | — |
| `series` | `{ key: string; name: string; color?: string }[]` | — | — |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | — |
| `stacked` | `boolean` | `false` | — |
| `grouped` | `boolean` | `false` | — |
| `showValues` | `boolean` | `false` | Rótulos nas barras |
| `rounded` | `boolean` | `true` | Topo arredondado |

### Exemplo

```tsx
import { BarChart } from "@/components/charts/bar-chart";

const data = [
  { filial: "SP", vendas: 125000, lucro: 32000 },
  { filial: "RJ", vendas: 98000, lucro: 24000 },
  { filial: "POA", vendas: 76000, lucro: 19000 },
  { filial: "CUR", vendas: 65000, lucro: 15000 },
];

<BarChart
  data={data}
  xKey="filial"
  series={[
    { key: "vendas", name: "Vendas", color: "#1E3A8A" },
    { key: "lucro", name: "Lucro", color: "#16A34A" },
  ]}
  grouped
  showValues
  height={300}
/>
```

---

## 11.3 PieChart

### Descrição
Distribuição proporcional de partes em um todo. Use para no máx. 5–6 fatias; acima disso, use BarChart horizontal.

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `pie` | Pizza clássica |
| `donut` | Rosca (com label central opcional) |
| `semi` | Meia lua (180°) |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `data` | `{ label: string; value: number; color?: string }[]` | — | — |
| `variant` | `'pie' \| 'donut' \| 'semi'` | `'donut'` | — |
| `showLabels` | `boolean` | `true` | Labels externos |
| `centerLabel` | `ReactNode` | — | Texto no centro (donut) |
| `innerRadius` | `number` | `60` | donut |
| `outerRadius` | `number` | `100` | — |

### Exemplo

```tsx
import { PieChart } from "@/components/charts/pie-chart";

<PieChart
  variant="donut"
  data={[
    { label: "Varejo", value: 45, color: "#1E3A8A" },
    { label: "Atacado", value: 30, color: "#3B82F6" },
    { label: "Online", value: 15, color: "#16A34A" },
    { label: "Outros", value: 10, color: "#94A3B8" },
  ]}
  centerLabel={<><div className="text-2xl font-bold">R$ 248k</div><div className="text-xs text-muted">Total</div></>}
/>
```

---

## 11.4 AreaChart

### Descrição
Similar ao LineChart, mas com área preenchida. Bom para volumes cumulativos.

### Exemplo

```tsx
import { AreaChart } from "@/components/charts/area-chart";

<AreaChart
  data={data}
  xKey="month"
  series={[
    { key: "vendas", name: "Vendas", color: "#1E3A8A", gradient: true },
    { key: "meta", name: "Meta", color: "#94A3B8" },
  ]}
  stacked
  height={300}
/>
```

---

## 11.5 ScatterPlot

### Descrição
Relacionamento entre duas variáveis. Para correlação (ex.: número de visitas × vendas).

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `data` | `{ x: number; y: number; size?: number; label?: string; group?: string }[]` | — |
| `xLabel` | `string` | — |
| `yLabel` | `string` | — |
| `showTrendLine` | `boolean` | Linha de regressão |

### Exemplo

```tsx
import { ScatterPlot } from "@/components/charts/scatter-plot";

<ScatterPlot
  data={[
    { x: 12, y: 45, group: "SP" },
    { x: 25, y: 80, group: "SP" },
    { x: 8, y: 30, group: "RJ" },
    { x: 18, y: 55, group: "RJ" },
  ]}
  xLabel="Visitas realizadas"
  yLabel="Vendas fechadas"
  showTrendLine
/>
```

---

## 11.6 Heatmap

### Descrição
Matriz de intensidade. Para atividade por dia/hora, performance por filial × mês.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `data` | `{ row: string; col: string; value: number }[]` | — |
| `rows` | `string[]` | Ordem das linhas |
| `cols` | `string[]` | Ordem das colunas |
| `colorScale` | `string[]` | Paleta do frio ao quente |
| `showValues` | `boolean` | Número em cada célula |
| `min`/`max` | `number` | Limites da escala |

### Exemplo

```tsx
import { Heatmap } from "@/components/charts/heatmap";

<Heatmap
  rows={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]}
  cols={["08h", "10h", "12h", "14h", "16h", "18h"]}
  data={[
    { row: "Seg", col: "14h", value: 95 },
    { row: "Ter", col: "10h", value: 80 },
    // ... demais células
  ]}
  colorScale={["#EFF6FF", "#3B82F6", "#1E3A8A"]}
  showValues
/>
```

---

## 11.7 GaugeChart

### Descrição
Medidor semicircular para um valor percentual. Para KPIs de atingimento.

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `number` (0–100) | — | — |
| `thresholds` | `{ value: number; color: string }[]` | — | Faixas de cor |
| `label` | `ReactNode` | — | — |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | — |

### Exemplo

```tsx
import { GaugeChart } from "@/components/charts/gauge-chart";

<GaugeChart
  value={87}
  thresholds={[
    { value: 70, color: "#DC2626" },
    { value: 90, color: "#EA580C" },
    { value: 100, color: "#16A34A" },
  ]}
  label={<><div className="text-3xl font-bold">87%</div><div className="text-xs text-muted">da meta</div></>}
  size="md"
/>
```

---

## 11.8 Sparkline

### Descrição
Mini-gráfico de linha sem eixos, para embutir em tabelas, cards e listas. Mostra tendência sem detalhes.

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `data` | `number[]` | Série numérica |
| `color` | `string` | — |
| `width` | `number` | padrão 80 |
| `height` | `number` | padrão 24 |
| `showDot` | `boolean` | Último ponto destacado |

### Exemplo

```tsx
import { Sparkline } from "@/components/charts/sparkline";

<Sparkline data={[12, 18, 15, 22, 28, 25, 32]} color="#16A34A" showDot />
```

---

# Capítulo 12 — Componentes Específicos do Orion

## 12.1 KpiCard

### Descrição
Card de indicador chave. Unidade básica de qualquer dashboard do Orion.

### Anatomia
1. Label (overline, `--text-muted`)
2. Valor principal (display-2 ou h1, `--text-primary`)
3. Delta (variação vs período anterior, com seta e cor)
4. Sparkline (tendência mini)
5. Ícone contextual (canto superior direito, opcional)
6. Footer action (link "Ver detalhes", opcional)

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | `string` | — | Ex.: "Vendas do dia" |
| `value` | `string \| number` | — | Ex.: `"R$ 12.500"` |
| `delta` | `{ value: number; direction: 'up' \| 'down'; positive?: boolean }` | — | — |
| `sparkline` | `number[]` | — | Dados para mini-gráfico |
| `icon` | `ReactNode` | — | — |
| `loading` | `boolean` | `false` | — |
| `onClick` | `() => void` | — | Torna card clicável |

### Exemplo

```tsx
import { KpiCard } from "@/components/orion/kpi-card";
import { DollarSign, TrendingUp } from "lucide-react";

<KpiCard
  label="Vendas do dia"
  value="R$ 12.500"
  delta={{ value: 15.2, direction: "up", positive: true }}
  sparkline={[8, 10, 9, 12, 11, 14, 12.5]}
  icon={<DollarSign className="size-5 text-primary" />}
  onClick={() => router.push("/reports/sales/daily")}
/>
```

### Tokens
`--bg-card`, `--shadow-sm`, `--success`, `--danger`, `--text-muted`, `radius-xl`.

### Acessibilidade
- `delta` é anunciado: "Aumento de 15,2 por cento em relação a ontem".
- Cores verde/vermelho acompanham seta `↑`/`↓` (não dependem só de cor).

---

## 12.2 RankingWidget

### Descrição
Lista ranqueada dos melhores/piores performers. Componente central de gamificação.

### Anatomia
1. Header (título, período, ação "ver todos")
2. Tabs (Top 5 / Bottom 5)
3. Lista de items:
   - Posição (1º, 2º, 3º com medalha; demais numeral)
   - Avatar
   - Nome + filial
   - Valor principal
   - Variação (setinha verde/vermelha)
   - Mini barra de progresso relativa ao líder

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `title` | `string` | — | — |
| `period` | `string` | — | Ex.: "Dezembro 2024" |
| `items` | `RankingItem[]` | — | — |
| `mode` | `'top' \| 'bottom' \| 'both'` | `'both'` | — |
| `metric` | `string` | — | Ex.: "Vendas", "Atingimento" |
| `unit` | `string` | — | Ex.: `"R$"`, `"%"` |

### Exemplo

```tsx
import { RankingWidget } from "@/components/orion/ranking-widget";

<RankingWidget
  title="Top vendedores"
  period="Dezembro 2024"
  metric="Atingimento"
  unit="%"
  items={[
    { id: "1", position: 1, name: "Ana Costa", branch: "SP", value: 132, avatar: "/a.jpg", delta: 5 },
    { id: "2", position: 2, name: "João Pedro", branch: "SP", value: 118, avatar: "/j.jpg", delta: -2 },
    { id: "3", position: 3, name: "Maria Silva", branch: "RJ", value: 105, avatar: "/m.jpg", delta: 8 },
    { id: "4", position: 4, name: "Pedro Souza", branch: "POA", value: 92, avatar: "/p.jpg", delta: 0 },
    { id: "5", position: 5, name: "Carla Dias", branch: "RJ", value: 88, avatar: "/c.jpg", delta: -3 },
  ]}
  mode="top"
/>
```

---

## 12.3 GoalProgress

### Descrição
Visualização do progresso de uma meta, com valor atual, valor alvo e projeção.

### Anatomia
1. Título da meta
2. Valor atual / Valor alvo (grande)
3. Barra de progresso com:
   - Preenchimento verde (atingido)
   - Marcador de ritmo esperado (linha vertical tracejada)
   - Projeção (área hachurada até onde deve chegar)
4. Delta vs ritmo esperado ("+5% acima do ritmo")
5. Dias restantes

### Variantes

| Variante | Quando usar |
|----------|-------------|
| `bar` | Padrão, horizontal |
| `circular` | Em cards compactos |
| `stacked` | Meta desdobrada em sub-metas |

### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `current` | `number` | — | Valor atual |
| `target` | `number` | — | Valor alvo |
| `projected` | `number` | — | Projeção no fechamento |
| `expected` | `number` | — | Ritmo esperado hoje |
| `unit` | `string` | — | `"R$"`, `"%"`, `"un"` |
| `daysLeft` | `number` | — | — |
| `variant` | `'bar' \| 'circular' \| 'stacked'` | `'bar'` | — |
| `breakdown` | `{ label: string; value: number }[]` | — | Para `stacked` |

### Exemplo

```tsx
import { GoalProgress } from "@/components/orion/goal-progress";

<GoalProgress
  title="Vendas SP — Dezembro"
  current={87500}
  target={100000}
  projected={98000}
  expected={90000}
  unit="R$"
  daysLeft={11}
  variant="bar"
/>
```

---

## 12.4 CampaignCard

### Descrição
Card resumo de uma campanha comercial. Usado em listas e dashboards de campanhas.

### Anatomia
1. Header (badge de status, nome, menu de ações)
2. Período (data início → fim)
3. Métricas-chave em grid (participantes, atingimento médio, prêmio total)
4. Progresso geral
5. Footer (próxima ação: "Faltam 5 dias" ou "Ver detalhes")

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `campaign` | `Campaign` | Entidade completa |
| `onEdit` | `() => void` | — |
| `onDuplicate` | `() => void` | — |
| `onArchive` | `() => void` | — |

### Exemplo

```tsx
import { CampaignCard } from "@/components/orion/campaign-card";

<CampaignCard
  campaign={{
    id: "c1",
    name: "Black Friday 2024",
    status: "active",
    startDate: "2024-11-25",
    endDate: "2024-12-20",
    participants: 48,
    avgAttainment: 87,
    totalPrize: 25000,
    progress: 65,
  }}
  onEdit={() => router.push(`/campaigns/c1/edit`)}
/>
```

---

## 12.5 NotificationItem

### Descrição
Item de lista de notificações (no sino da topbar ou na página de notificações).

### Anatomia
1. Ícone (por tipo)
2. Título
3. Descrição (truncada em 2 linhas)
4. Timestamp relativo ("há 5 min")
5. Indicador de não-lida (bolinha azul à esquerda)
6. Ações rápidas (arquivar, marcar como lida)

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `notification` | `Notification` | — |
| `onRead` | `() => void` | — |
| `onArchive` | `() => void` | — |
| `onClick` | `() => void` | — |

### Exemplo

```tsx
import { NotificationItem } from "@/components/orion/notification-item";
import { Trophy, AlertTriangle, MessageSquare } from "lucide-react";

<NotificationItem
  notification={{
    id: "n1",
    type: "achievement",
    title: "Você subiu para o 2º lugar no ranking!",
    description: "Apenas 8% atrás do líder. Continue assim!",
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  }}
  icon={<Trophy className="text-accent" />}
  onRead={() => markAsRead("n1")}
  onClick={() => router.push("/ranking")}
/>
```

### Acessibilidade
- `role="listitem"`.
- Item não-lido: `aria-label` prefixado com "Não lida:".
- Timestamp é `<time datetime={iso}>` para que SR leia corretamente.

---

## 12.6 AuditLogEntry

### Descrição
Linha de log de auditoria. Exibida em tabelas e timelines de auditoria.

### Anatomia
1. Avatar do usuário + nome
2. Ação (verb + entidade: "criou meta", "atualizou campanha")
3. Detalhe do que mudou (diff resumido)
4. Timestamp
5. IP / dispositivo (em tooltip)
6. Link para entidade

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `entry` | `AuditLog` | — |
| `showDiff` | `boolean` | Expande alterações campo a campo |
| `onEntityClick` | `() => void` | — |

### Exemplo

```tsx
import { AuditLogEntry } from "@/components/orion/audit-log-entry";

<AuditLogEntry
  entry={{
    id: "log_1",
    user: { id: "u1", name: "Maria Silva", avatar: "/m.jpg" },
    action: "updated",
    entity: { type: "goal", id: "g1", label: "Meta Vendas SP — Dez/2024" },
    changes: [
      { field: "target", from: 80000, to: 100000 },
      { field: "deadline", from: "2024-12-15", to: "2024-12-31" },
    ],
    timestamp: new Date("2024-12-15T14:32:00"),
    ip: "200.143.22.5",
    userAgent: "Chrome 120 / macOS",
  }}
  showDiff
  onEntityClick={() => router.push("/goals/g1")}
/>
```

### Tokens
`--text-muted`, `--text-subtle`, `--danger` (para remoções no diff), `--success` (para adições), `--bg-stripe` (hover).

### Acessibilidade
- Diff announce: "Campo alvo alterado de 80 mil para 100 mil."
- IP e user-agent em `<abbr title="...">` com explicação.

---

# Capítulo 13 — Padrões de Layout

## 13.1 Page Templates

### 13.1.1 Template Dashboard

```tsx
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        actions={
          <>
            <DateRangePicker />
            <BranchSwitcher />
            <Button variant="outline" iconLeft={<Download />}>Exportar</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Vendas" value="R$ 248k" delta={{ value: 12, direction: "up", positive: true }} />
        <KpiCard label="Metas atingidas" value="68%" delta={{ value: -3, direction: "down", positive: false }} />
        <KpiCard label="Vendedores ativos" value="42" />
        <KpiCard label="Ticket médio" value="R$ 5.9k" delta={{ value: 8, direction: "up", positive: true }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2" title="Evolução de vendas"><LineChart ... /></Card>
        <Card title="Top vendedores"><RankingWidget ... /></Card>
      </div>
    </AppShell>
  );
}
```

### 13.1.2 Template List

```tsx
export function ListLayout({ title, columns, data, filters }: ListProps) {
  return (
    <AppShell>
      <PageHeader title={title} actions={<Button iconLeft={<Plus />}>Criar</Button>} />
      <FilterBar>{filters}</FilterBar>
      <Card padding="none">
        <DataTable columns={columns} data={data} pageSize={20} />
      </Card>
    </AppShell>
  );
}
```

### 13.1.3 Template Form

```tsx
export function FormLayout({ title, children, onSave }: FormProps) {
  return (
    <AppShell>
      <PageHeader title={title} actions={
        <>
          <Button variant="secondary" onClick={back}>Cancelar</Button>
          <Button variant="primary" onClick={onSave}>Salvar</Button>
        </>
      } />
      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informações principais">{/* campos */}</Card>
          <Card title="Regras">{/* campos */}</Card>
        </div>
        <div className="space-y-6">
          <Card title="Status">{/* status, datas */}</Card>
          <Card title="Auditabilidade">{/* histórico */}</Card>
        </div>
      </form>
    </AppShell>
  );
}
```

### 13.1.4 Template Detail

```tsx
export function DetailLayout({ title, subtitle, tabs, headerActions }: DetailProps) {
  return (
    <AppShell>
      <Breadcrumb items={[...]} />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h1">{title}</h1>
          <p className="text-muted">{subtitle}</p>
        </div>
        <div className="flex gap-2">{headerActions}</div>
      </div>
      <Tabs variant="enclosed" tabs={tabs} />
    </AppShell>
  );
}
```

### 13.1.5 Template Settings

```tsx
export function SettingsLayout({ sections }: { sections: SettingsSection[] }) {
  return (
    <AppShell>
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3">
          <nav className="space-y-1">
            {sections.map(s => <a href={`#${s.id}`} className="block px-3 py-2 rounded-md hover:bg-muted">{s.title}</a>)}
          </nav>
        </aside>
        <main className="col-span-9 space-y-6">
          {sections.map(s => <section id={s.id} key={s.id}><Card title={s.title}>{s.content}</Card></section>)}
        </main>
      </div>
    </AppShell>
  );
}
```

## 13.2 AppShell

Estrutura base que envolve todas as páginas autenticadas.

```tsx
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## 13.3 Safe Areas e Max-Width

- Conteúdo nunca ultrapassa 1440px (centralizado com `mx-auto`).
- Padding horizontal: 24px (`md`), 32px (`lg`+).
- Em `2xl`, conteúdo centralizado com `max-w-[1440px]` mesmo em telas maiores.

---

# Capítulo 14 — Padrões de Interação

## 14.1 Loading States

### Quando usar cada tipo

| Padrão | Quando | Duração esperada |
|--------|--------|------------------|
| Skeleton | Carregamento inicial de página/seção com layout conhecido | 200ms–3s |
| Spinner inline | Ação curta dentro de botão ou linha | < 1s |
| Progress bar | Upload, processamento em lote, com % conhecido | variável |
| Overlay spinner | Ação bloqueante em uma área específica | 1–5s |
| Optimistic update | Ação que pode ser revertida (like, toggle) | instantâneo |

### Exemplo: Skeleton em lista

```tsx
function UserList({ users, loading }: { users: User[]; loading: boolean }) {
  if (loading) {
    return (
      <div role="status" aria-label="Carregando usuários">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton variant="circle" className="size-10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <List>{users.map(u => <List.Item key={u.id} ... />)}</List>;
}
```

## 14.2 Empty States

Todo list/grid deve ter um empty state. Existem 4 categorias:

### 14.2.1 Sem dados (primeira visita)

```tsx
<EmptyState
  icon={<Target className="size-12" />}
  title="Nenhuma meta criada ainda"
  description="Crie sua primeira meta para começar a acompanhar o desempenho da equipe."
  action={<Button iconLeft={<Plus />}>Criar meta</Button>}
/>
```

### 14.2.2 Sem resultados de filtro

```tsx
<EmptyState
  icon={<SearchX className="size-12" />}
  title="Nenhum resultado encontrado"
  description="Tente ajustar os filtros ou limpar a busca."
  action={<Button variant="secondary" onClick={clearFilters}>Limpar filtros</Button>}
/>
```

### 14.2.3 Erro

```tsx
<EmptyState
  icon={<AlertCircle className="size-12 text-danger" />}
  title="Não foi possível carregar"
  description="Ocorreu um erro ao buscar os dados. Verifique sua conexão."
  action={<Button variant="outline" iconLeft={<RefreshCw />} onClick={retry}>Tentar novamente</Button>}
/>
```

### 14.2.4 Sem permissão

```tsx
<EmptyState
  icon={<Lock className="size-12" />}
  title="Você não tem acesso a esta página"
  description="Solicite permissão ao administrador da empresa para visualizar este conteúdo."
  action={<Button variant="secondary" onClick={() => router.push("/dashboard")}>Voltar ao dashboard</Button>}
/>
```

## 14.3 Error States

### Error Boundary

```tsx
<ErrorBoundary
  fallback={({ error, resetErrorBoundary }) => (
    <EmptyState
      icon={<AlertTriangle className="size-12 text-danger" />}
      title="Algo deu errado"
      description={error.message}
      action={<Button onClick={resetErrorBoundary}>Tentar novamente</Button>}
    />
  )}
>
  <App />
</ErrorBoundary>
```

### Form errors

- Erro de campo: exibir abaixo do input, com ícone e cor `--danger`.
- Erro de submit: toast ou alert no topo do formulário.
- Erro de validação assíncrona (CNPJ, e-mail): exibir inline após blur, com spinner durante a verificação.

```tsx
<Input label="CNPJ" error="CNPJ já cadastrado para outra empresa." />
```

## 14.4 Success Feedback

| Contexto | Padrão |
|----------|--------|
| Salvar formulário | Toast `success` + fechamento de modal/drawer |
| Operação em lote | Toast `success` com contador: "5 registros atualizados" |
| Upload concluído | Toast `success` + atualização da lista de arquivos |
| Atingimento de meta | Confete animado (respeitando `prefers-reduced-motion`) + Toast especial |
| Login | Redirecionamento direto + Toast de boas-vindas |

```tsx
async function handleSave() {
  try {
    await api.post("/goals", data);
    toast.success("Meta salva", { description: "A meta foi criada e os participantes serão notificados." });
    router.push("/goals");
  } catch (err) {
    toast.error("Erro ao salvar", { description: err.message });
  }
}
```

## 14.5 Confirmation Patterns

### Confirmação leve (inline)

Para ações reversíveis: usar `Modal` size `sm` com botão primário na cor do contexto.

### Confirmação destrutiva

```tsx
<ConfirmDialog
  title="Excluir empresa?"
  description="Esta ação removerá a empresa e todos os dados associados (metas, campanhas, resultados). A operação não pode ser desfeita."
  confirmLabel="Excluir definitivamente"
  variant="danger"
  requireText="CONFIRMAR"  // usuário deve digitar CONFIRMAR
>
  <Button variant="danger">Excluir empresa</Button>
</ConfirmDialog>
```

### Confirmação com consequências explicadas

Para ações com impacto em outras pessoas (encerrar campanha, recalcular rankings):

```tsx
<ConfirmDialog
  title="Encerrar campanha?"
  description="A campanha será finalizada imediatamente. Os 48 participantes receberão notificação. O ranking final será congelado e os prêmios serão liberados para aprovação."
  confirmLabel="Encerrar campanha"
  variant="primary"
>
  <Button>Encerrar campanha</Button>
</ConfirmDialog>
```

---

# Capítulo 15 — Guidelines

## 15.1 Microcopy

### Tom de voz
- **Claro e direto**, sem jargão técnico desnecessário.
- **Respeitoso**, nunca culpe o usuário ("Você errou" → "Não foi possível validar").
- **Encorajador** em contextos de gamificação, **sério** em contextos financeiros/auditoria.
- **Conciso**: uma ação = um verbo. "Salvar", não "Salvar alterações feitas no formulário".

### Padrões de mensagens

| Contexto | Exemplo | Anti-padrão |
|----------|---------|-------------|
| Erro de validação | "CNPJ inválido. Verifique os 14 dígitos." | "Erro" |
| Erro de servidor | "Não foi possível salvar. Tente novamente em alguns instantes." | "500 Internal Server Error" |
| Sucesso | "Meta salva." | "Operação realizada com sucesso pelo sistema" |
| Confirmação | "Excluir campanha?" | "Tem certeza que deseja realmente excluir a campanha selecionada?" |
| Empty state | "Nenhuma venda registrada ainda." | "Sem dados" |
| Loading | "Atualizando…" | "Loading…" (inglês) |
| Sem permissão | "Você não tem acesso a esta página." | "403 Forbidden" |

### Botões
- **Primário**: verbo de ação no infinitivo: "Salvar", "Criar", "Enviar", "Aprovar".
- **Secundário**: "Cancelar", "Voltar".
- **Destrutivo**: verbo + adjetivo de certeza: "Excluir definitivamente", "Remover permanentemente".
- Nunca "OK" — sempre um verbo contextual.

### Mensagens de erro

```tsx
// ✅ Bom
<Input
  label="E-mail"
  error="Este e-mail já está cadastrado. Faça login ou use outro endereço."
/>

// ❌ Ruim
<Input label="E-mail" error="E-mail inválido" />  // não diz por quê nem o que fazer
```

## 15.2 Iconografia

### Biblioteca única
**Lucide Icons** em todo o sistema. Não misturar com Heroicons, Phosphor, Material Icons ou ícones custom SVG (exceto logos e ilustrações de marca).

### Tamanhos

| Token | Px | Uso |
|-------|----|-----|
| `size-3` | 12 | Inline em caption |
| `size-4` | 16 | Inline em texto, ícones de botão sm |
| `size-5` | 20 | Ícones de botão md |
| `size-6` | 24 | Ícones de card |
| `size-8` | 32 | Empty states |
| `size-12` | 48 | Empty states grandes |

### Regras
- **Alinhamento**: sempre verticalmente centralizado com o texto (usar `inline-flex items-center`).
- **Espaçamento**: gap de 8px entre ícone e texto (`gap-2`).
- **Cor**: herda `currentColor` por padrão. Para destaque, usar `text-primary` ou cor semântica.
- **Stroke**: 2px (default do Lucide). Não alterar.
- **Ícone sem texto**: SEMPRE ter `aria-label` ou `sr-only` com texto descritivo.

```tsx
// ✅ Bom
<Button iconLeft={<Plus className="size-4" />}>Nova meta</Button>

// ❌ Ruim
<Button><Plus /> Nova meta</Button>  // sem className, sem aria-label, tamanho padrão errado
```

## 15.3 Animação

### Quando animar
- ✅ Feedback de interação (hover, click, focus)
- ✅ Transição de estado (loading → loaded, empty → populated)
- ✅ Entrada/saída de overlays (modal, drawer, toast)
- ✅ Indicadores de progresso

### Quando NÃO animar
- ❌ Conteúdo principal aparecendo na rota inicial (use skeleton)
- ❌ Mudança de valor em inputs controlados
- ❌ Scroll horizontal/vertical natural da página
- ❌ Cores de status em tabelas (mudança instantânea)

### Durações máximas
| Contexto | Máximo |
|----------|--------|
| Hover/focus | 150ms |
| Toggle/switch | 200ms |
| Modal/drawer open | 250ms |
| Toast slide-in | 300ms |
| Page transition | 300ms |
| Animação complexa | 400ms |

### `prefers-reduced-motion`
```tsx
// Exemplo de hook
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// Uso em animações opcionais (confete, transições decorativas)
if (!reducedMotion) {
  fireConfetti();
}
```

## 15.4 Responsividade

### Breakpoints e adaptações

| Breakpoint | Layout | Sidebar | Cards | Tabela |
|------------|--------|---------|-------|--------|
| `xs` (< 640) | Single column | Drawer hamburguer | Stack vertical | Cards em vez de linhas |
| `sm` (640–767) | Single column | Drawer | Grid 2 col | Cards |
| `md` (768–1023) | 2 column | Drawer | Grid 3 col | Tabela com scroll horizontal |
| `lg` (1024–1279) | Multi column | Sidebar fixa | Grid 4 col | Tabela completa |
| `xl` (1280+) | Multi column | Sidebar fixa | Grid 4–6 col | Tabela completa + colunas extras |

### Adaptações obrigatórias
- **Sidebar**: em `< lg`, vira drawer hamburguer aberto pelo botão na topbar.
- **Tabelas**: em `< md`, transformam em card list (cada linha vira um card com label: valor).
- **Filtros**: em `< md`, vão para um modal full-screen ao invés de barra horizontal.
- **Topbar**: em `< md`, esconde texto de busca, mostra apenas ícone.
- **Forms**: em `< lg`, campos em coluna única.
- **Charts**: em `< sm`, charts de largura cheia, altura mínima 240px.

### Touch targets
- Mínimo 44×44px em qualquer elemento interativo.
- Espaçamento mínimo 8px entre targets adjacentes.

## 15.5 Acessibilidade (WCAG 2.1 AA)

### Contraste
- Texto normal: ≥ 4.5:1
- Texto grande (> 18px ou > 14px bold): ≥ 3:1
- Componentes UI (bordas de inputs, ícones): ≥ 3:1

### Navegação por teclado
- Toda funcionalidade acessível por teclado.
- Ordem de tabulação segue ordem visual.
- Focus visible em todos os interativos (nunca `outline: none` sem substituto).
- Skip link no topo: `<a href="#main" class="sr-only focus:not-sr-only">Pular para o conteúdo</a>`.
- Sem atalhos que disparam ações apenas por mouse.

### Focus management
- Ao abrir modal/drawer: foco vai para o primeiro elemento interativo.
- Ao fechar: foco retorna ao trigger.
- Em SPAs: ao navegar, foco vai para o topo da nova página.
- Em rotas com `#hash`: foco vai para a seção.

### Leitores de tela
- Tabelas com `<th scope>`.
- Formulários com `<label>` associado.
- Imagens com `alt` descritivo (vazio `alt=""` se decorativo).
- Mudanças dinâmicas anunciadas via `aria-live`:
  - `polite` para info/success/warning.
  - `assertive` para errors críticos.
- Ícones decorativos: `aria-hidden="true"`.
- Ícones funcionais: `aria-label` no elemento pai.

### ARIA
- Não use ARIA se um elemento HTML nativo resolver.
- `role="button"` em `<div>` clicável: prefira `<button>`.
- `aria-label` apenas quando não houver texto visível.
- `aria-labelledby` para vincular elementos visuais como label.

### Movimento e mídia
- Honrar `prefers-reduced-motion`.
- Vídeos: legendas em PT-BR, transcrição textual.
- Áudio: não autotocar.
- Animações com flashes > 3Hz proibidas (risco de epilepsia fotossensível).

### Testes
- Lighthouse CI no CI/CD com score mínimo 90 em Accessibility.
- Testes manuais com NVDA (Windows) e VoiceOver (macOS) em cada release.
- Teste de navegação apenas por teclado em todos os fluxos críticos.

---

# Capítulo 16 — Temas Personalizados por Empresa

Cada empresa pode personalizar:

| Propriedade | O que substitui | Restrição |
|-------------|-----------------|-----------|
| Cor primária | `--primary`, `--primary-hover`, `--primary-active`, `--primary-light`, `--primary-bg` | Apenas uma cor base; tons derivados via escala HSL |
| Logo (claro) | URL no header e na tela de login | SVG preferencial, max-height 32px |
| Logo (escuro) | URL no header em tema escuro | SVG preferencial, max-height 32px |
| Nome exibido | Texto ao lado do logo | Máx. 20 caracteres |
| Cor de fundo | `--bg-page` (apenas 3 opções: branco, cinza-claro, azul-claro) | Limitado para manter contraste |
| Fonte (opcional) | `--font-sans` | Apenas Inter ou Inter + fonte CJK |

### Aplicação

O tema é injetado via CSS variables no `<html>` ao carregar a aplicação:

```tsx
// app/layout.tsx
export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const theme = await getCompanyTheme(session?.user.companyId);

  return (
    <html
      lang="pt-BR"
      style={{
        "--primary": theme.primaryColor,
        "--primary-hover": adjustColor(theme.primaryColor, -10),
        "--primary-active": adjustColor(theme.primaryColor, -15),
        "--primary-light": adjustColor(theme.primaryColor, 40),
        "--primary-bg": adjustColor(theme.primaryColor, 92),
      } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
```

### Validação de contraste

Ao salvar o tema, o backend valida o contraste da cor escolhida contra branco (texto sobre primário). Se < 4.5:1, a API retorna erro e a UI sugere escurecer a cor.

```tsx
async function validatePrimaryColor(hex: string) {
  const contrast = contrastRatio(hex, "#FFFFFF");
  if (contrast < 4.5) {
    return {
      valid: false,
      suggestion: darkenUntilContrast(hex, 4.5),
      message: "A cor escolhida não tem contraste suficiente com texto branco. Sugerimos escurecer para garantir acessibilidade.",
    };
  }
  return { valid: true };
}
```

---

# Capítulo 17 — Dark Mode

## 17.1 Estratégia

Implementado via classe `dark` no `<html>`, alternada por:
1. Preferência do usuário (toggle na topbar).
2. `prefers-color-scheme` do sistema na primeira visita.
3. Persistência em `localStorage`.

## 17.2 Token mapping

Todas as cores semânticas são redefinidas em `.dark`:

```css
:root {
  --bg-page: #FFFFFF;
  --bg-card: #F8FAFC;
  --text-primary: #0F172A;
  --border: #CBD5E1;
  --primary: #1E3A8A;
}

.dark {
  --bg-page: #0F172A;
  --bg-card: #1E293B;
  --text-primary: #F1F5F9;
  --border: #334155;
  --primary: #3B82F6; /* mais luminoso p/ contraste em fundo escuro */
}
```

## 17.3 Implementação Tailwind

```tsx
// tailwind.config.ts
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: { page: "var(--bg-page)", card: "var(--bg-card)" },
        text: { primary: "var(--text-primary)", muted: "var(--text-muted)" },
        primary: "var(--primary)",
      },
    },
  },
};
```

## 17.4 Toggle

```tsx
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
```

---

# Capítulo 18 — Internacionalização (i18n)

Embora o produto seja em PT-BR por padrão, o Design System é preparado para i18n:

## 18.1 Direção do texto (LTR/RTL)

- Layout usa `flex` (não `flex-row` hardcoded).
- Espaçamentos lógicos: `ps-*` / `pe-*` (padding-inline-start/end) em vez de `pl-*` / `pr-*`.
- Ícones direcionais (setas) são espelhados via `dir="rtl"`.

## 18.2 Formatação

- Datas: `Intl.DateTimeFormat(locale)`.
- Números: `Intl.NumberFormat(locale)`.
- Moeda: `Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' })`.
- Pluralização: `Intl.PluralRules(locale)`.

## 18.3 Strings

Todas as strings de UI passam por `t()` (react-i18next). Componentes não contêm texto hardcoded:

```tsx
<Button>{t("actions.save")}</Button>
```

---

# Capítulo 19 — Entregáveis do Design System

1. **Storybook** — Galeria interativa de todos os componentes com todas as variantes e estados. Acessível em `https://orion.design.empresa.com.br`. Cada componente tem:
   - Documentação Markdown (anexada ao código).
   - Playground com controls.
   - Testes de acessibilidade (addon-a11y).
   - Testes visuais (Chromatic).

2. **Figma Library** — Componentes sincronizados com código via Tokens Studio. Toda mudança de token flui: Figma → JSON → CSS variables → Tailwind.

3. **Tokens JSON** — `/tokens/orion-tokens.json` consumido por Style Dictionary para gerar:
   - CSS variables (`tokens.css`).
   - Tailwind config (`tokens.tailwind.ts`).
   - iOS / Android (futuro).

4. **npm package** — `@orion/design-system` com todos os componentes compilados, types e CSS. Versionado por SemVer.

5. **Documentação viva** — Este documento + Storybook como referência única.

6. **ESLint Plugin** — `eslint-plugin-orion-design-system` regras customizadas:
   - Proíbe uso de cores hex diretas em JSX.
   - Exige `aria-label` em `<Button>` sem children.
   - Proíbe `outline: none` sem `focus-visible` substituto.

7. **Design Tokens CI** — A cada PR que altera `tokens/orion-tokens.json`, o CI:
   - Roda Style Dictionary.
   - Atualiza Figma via API.
   - Gera diff visual no Chromatic.
   - Bloqueia merge se houver regressão de contraste WCAG.

---

# Capítulo 20 — Checklist de Implementação de Componente

Antes de marcar um componente como "pronto para produção", verificar:

### Código
- [ ] Componente em TypeScript com props tipadas.
- [ ] Sem cores hex hardcoded — apenas tokens.
- [ ] Sem espaçamentos hardcoded — apenas escala.
- [ ] Sem animações inline — apenas tokens de motion.
- [ ] Responsivo em todos os breakpoints.
- [ ] Tema claro E escuro testados.
- [ ] Tema customizado (cor primária alternativa) testado.

### Acessibilidade
- [ ] Navegação completa por teclado.
- [ ] Focus visible em todos os interativos.
- [ ] `aria-*` apropriados.
- [ ] `role` correto.
- [ ] Contraste AA verificado.
- [ ] Testado com NVDA e VoiceOver.
- [ ] `prefers-reduced-motion` honrado.

### Documentação
- [ ] Story com todas as variantes.
- [ ] Story com todos os estados.
- [ ] Props table no MDX.
- [ ] Exemplo de código real.
- [ ] Seção de acessibilidade.

### Testes
- [ ] Unit tests (Jest + Testing Library).
- [ ] Visual regression (Chromatic).
- [ ] Teste de acessibilidade (axe).

### Release
- [ ] Adicionado ao `CHANGELOG.md`.
- [ ] Versão bumpada (SemVer).
- [ ] Migration guide (se breaking change).

---

# Apêndice A — Catálogo de Tokens (resumo)

```css
:root {
  /* Color */
  --primary: #1E3A8A;
  --primary-hover: #1E40AF;
  --primary-active: #1E3A8A;
  --primary-light: #3B82F6;
  --primary-bg: #EFF6FF;
  --primary-bg-strong: #DBEAFE;

  --bg-page: #FFFFFF;
  --bg-card: #F8FAFC;
  --bg-stripe: #F1F5F9;
  --bg-hover: #F1F5F9;
  --bg-sunken: #E2E8F0;

  --border: #CBD5E1;
  --border-strong: #94A3B8;

  --text-primary: #0F172A;
  --text-muted: #475569;
  --text-subtle: #64748B;
  --text-disabled: #94A3B8;
  --text-on-primary: #FFFFFF;

  --success: #16A34A;
  --warning: #EA580C;
  --danger: #DC2626;
  --info: #0891B2;
  --accent: #7C3AED;

  /* Typography */
  --font-sans: "Inter", "Noto Sans SC", system-ui, sans-serif;
  --font-serif: "Noto Serif SC", Georgia, serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing (4px base) */
  --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --space-7: 48px; --space-8: 64px;

  /* Radius */
  --radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px;
  --radius-xl: 12px; --radius-2xl: 16px; --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10);

  /* Z-index */
  --z-dropdown: 1000; --z-sticky: 1100; --z-sidebar: 1200;
  --z-overlay: 1300; --z-modal: 1400; --z-popover: 1500;
  --z-toast: 1600; --z-tooltip: 1700; --z-command: 1800;

  /* Motion */
  --duration-fast: 100ms; --duration-normal: 150ms;
  --duration-slow: 250ms; --duration-slower: 300ms;
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

# Apêndice B — Catálogo de Componentes (resumo executivo)

| Categoria | Componente | Variantes | Estados |
|-----------|------------|-----------|---------|
| Form | Button | 8 variantes × 3 tamanhos = 24 | default, hover, focus, active, disabled, loading |
| Form | Input | 10 tipos (text, password, email, number, tel, url, search, currency, cpf/cnpj, cep) | default, focus, hover, disabled, error, success |
| Form | Textarea | — | idem + autoGrow |
| Form | Select | default, searchable, creatable, async, multi | default, open, loading, empty |
| Form | Checkbox | — | unchecked, checked, indeterminate, disabled, error |
| Form | RadioGroup | vertical, horizontal | unchecked, checked, disabled, error |
| Form | Switch | sm, md | off, on, disabled, loading |
| Form | Slider | single, range | default, hover, focus, disabled |
| Form | DatePicker | single, range, multiple, month | default, open, disabled |
| Form | TimePicker | 12h, 24h | default, open |
| Form | ColorPicker | hex, rgb, hsl, + alpha | default, open |
| Form | FileUpload | default, compact, avatar, multi | idle, dragOver, uploading, success, error |
| Form | RichTextEditor | full, basic, minimal | idle, focus, saving, saved |
| Display | Card | default, elevated, outlined, interactive, sunken | default, hover |
| Display | Badge | 7 cores × 2 tamanhos | default |
| Display | Chip | default, primary | default, hover, focus |
| Display | Tag | 7 cores | default |
| Display | Avatar | 5 tamanhos, + presence | default, error (img fail) |
| Display | Tooltip | 4 sides × 3 aligns | hidden, visible |
| Display | Popover | 4 sides × 3 aligns | closed, open |
| Display | Modal | 5 tamanhos | closed, opening, open, closing |
| Display | Drawer | 4 sides × 4 tamanhos | idem |
| Display | Alert | 5 variantes | default, dismiss |
| Display | Toast | 5 variantes | entering, visible, leaving |
| Display | Progress | linear, circular, stepper | determinate, indeterminate |
| Display | Spinner | 4 tamanhos | spinning |
| Display | Skeleton | text, rect, circle | animating |
| Nav | Tabs | underline, pills, segmented, enclosed | default, active, disabled |
| Nav | Breadcrumb | — | default |
| Nav | Pagination | — | default, disabled |
| Nav | Sidebar | fixed, collapsible, floating, drawer | expanded, collapsed |
| Nav | Topbar | — | default |
| Nav | Menu | — | closed, open |
| Nav | ContextMenu | — | closed, open |
| Nav | CommandPalette | — | closed, open, loading, empty |
| Data | Table | 3 densidades | default, hover, loading, empty |
| Data | DataTable | — | idem + sort, filter, select, expand |
| Data | Tree | — | collapsed, expanded, selected |
| Data | List | — | default, hover, selected |
| Data | Timeline | vertical, horizontal, alternate | default |
| Data | Kanban | — | default, dragging |
| Data | Calendar | month, week, day, agenda | default, selected |
| Data | GanttChart | day, week, month, quarter | default, dragging |
| Charts | LineChart | line, area | default, hover |
| Charts | BarChart | vertical, horizontal, stacked, grouped | default, hover |
| Charts | PieChart | pie, donut, semi | default, hover, focused |
| Charts | AreaChart | stacked | default, hover |
| Charts | ScatterPlot | + trendline | default, hover |
| Charts | Heatmap | — | default, hover |
| Charts | GaugeChart | 3 tamanhos | default |
| Charts | Sparkline | + dot | default |
| Orion | KpiCard | bar, circular | default, loading |
| Orion | RankingWidget | top, bottom, both | default, loading |
| Orion | GoalProgress | bar, circular, stacked | default, loading |
| Orion | CampaignCard | — | default, hover |
| Orion | NotificationItem | — | unread, read, archived |
| Orion | AuditLogEntry | — | collapsed, expanded |

**Total:** 47 componentes base + 8 charts + 6 específicos Orion = **61 componentes**.

---

# Apêndice C — Referências

- WCAG 2.1: https://www.w3.org/TR/WCAG21/
- Radix Primitives: https://www.radix-ui.com/primitives
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com
- Recharts: https://recharts.org
- TanStack Table: https://tanstack.com/table
- TipTap: https://tiptap.dev
- Lucide Icons: https://lucide.dev
- Inter Font: https://rsms.me/inter
- Style Dictionary: https://amzn.github.io/style-dictionary

---

**Fim do Documento 09 — UX/UI Design System.**

Para alterações neste documento, abra um PR no repositório `orion-design-system` e referencie o capítulo alterado. Toda mudança de token ou componente requer aprovação do Conselho de Design (2 designers + 1 tech lead frontend).
