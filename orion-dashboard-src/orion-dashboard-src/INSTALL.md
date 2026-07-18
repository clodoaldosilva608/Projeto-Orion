# Dependências necessárias

## Para Next.js existente

Se você já tem um projeto Next.js com shadcn/ui configurado, instale apenas:

```bash
npm install bcryptjs @types/bcryptjs framer-motion lucide-react
```

## Componentes shadcn/ui necessários

```bash
npx shadcn@latest add button card badge avatar separator
```

## Para projeto novo (do zero)

```bash
# Criar projeto Next.js
npx create-next-app@latest orion-app --typescript --tailwind --app

# Entrar no diretório
cd orion-app

# Instalar shadcn/ui
npx shadcn@latest init

# Adicionar componentes
npx shadcn@latest add button card badge avatar separator

# Instalar dependências do Orion
npm install bcryptjs @types/bcryptjs framer-motion lucide-react
npm install prisma @prisma/client --save-dev

# Copiar arquivos deste ZIP para o projeto
# - prisma/schema.prisma
# - prisma/seed.ts
# - src/app/page.tsx
# - src/lib/db.ts
# - src/lib/orion-data.ts
# - src/components/orion/orion-dashboard.tsx

# Configurar banco
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts

# Rodar
npm run dev
```
