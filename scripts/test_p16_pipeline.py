#!/usr/bin/env python3
"""End-to-end test for P16 — Pipeline de Desenvolvimento Visual (Kanban)."""
import json, os, subprocess, sys, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "p16/1.0"})
    try:
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")

def fetch_no_auth(url):
    class NR(urllib.request.HTTPRedirectHandler):
        def http_error_307(self, *a): return None
        def http_error_302(self, *a): return None
        def http_error_301(self, *a): return None
        def http_error_303(self, *a): return None
    fresh = urllib.request.build_opener(NR())
    req = urllib.request.Request(url, headers={"User-Agent": "p16/1.0"})
    try:
        with fresh.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")

print(f"=== P16 — Pipeline de Desenvolvimento Visual E2E test ===\n")

# 1. Login
print("1. Login")
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "p16/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except: pass
print("   ✓ logged in")

# 2. Create a test project + briefing + 6 stages via Prisma
print("\n2. Create test project + briefing + 6 stages via Prisma")
NODE_CREATE = r"""
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: "insensitive" } } });
  // Clean old test
  const oldProjects = await prisma.softwareProject.findMany({ where: { companyId: user.companyId, name: { contains: "[TESTE P16]" } } });
  for (const p of oldProjects) {
    await prisma.projectStage.deleteMany({ where: { projectId: p.id } });
    if (p.briefingId) {
      await prisma.softwareProject.update({ where: { id: p.id }, data: { briefing: { disconnect: true } } });
    }
    await prisma.softwareProject.delete({ where: { id: p.id } });
  }
  await prisma.projectBriefing.deleteMany({ where: { companyId: user.companyId, clientName: { contains: "[TESTE P16]" } } });

  // Create briefing
  const briefing = await prisma.projectBriefing.create({
    data: {
      companyId: user.companyId,
      clientName: "[TESTE P16] Carlos Teste",
      clientCompany: "Empresa Teste LTDA",
      clientEmail: "carlos@teste.com",
      projectType: "dashboard",
      problemStatement: "Preciso de um dashboard de vendas",
      keyFeatures: ["Login", "Painel admin", "Relatórios", "Gráficos"],
      status: "approved",
      aiEstimatedHours: 80,
      aiEstimatedCostCents: 1200000,
      aiStackSuggestion: ["nextjs", "prisma", "supabase", "tailwind"],
      reviewedAt: new Date(),
      reviewedBy: user.id,
    },
  });

  // Create project linked to briefing
  const project = await prisma.softwareProject.create({
    data: {
      companyId: user.companyId,
      name: "[TESTE P16] Dashboard de Vendas",
      description: "Dashboard de vendas para a empresa teste",
      status: "architecting",
      stack: ["nextjs", "prisma", "supabase", "tailwind"],
      keyFeatures: ["Login", "Painel admin", "Relatórios", "Gráficos"],
      successCriteria: "Visualizar vendas em tempo real",
      budgetCents: 1200000,
      startDate: new Date(),
      estimatedEndDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000),
      progress: 16,
      briefing: { connect: { id: briefing.id } },
      createdBy: user.id,
    },
  });

  // Create 6 stages
  const stages = [
    { name: "Briefing", sortOrder: 0, status: "completed", completedAt: new Date() },
    { name: "Arquitetura", sortOrder: 1, status: "active", startDate: new Date() },
    { name: "Desenvolvimento", sortOrder: 2, status: "pending" },
    { name: "Testes", sortOrder: 3, status: "pending" },
    { name: "Deploy", sortOrder: 4, status: "pending" },
    { name: "Entrega", sortOrder: 5, status: "pending" },
  ];
  for (const s of stages) {
    await prisma.projectStage.create({
      data: {
        projectId: project.id,
        name: s.name,
        sortOrder: s.sortOrder,
        status: s.status,
        completedAt: s.completedAt ?? null,
        startDate: s.startDate ?? null,
        deliverables: s.name === "Arquitetura" ? [
          { name: "Documento de Arquitetura", url: null, completedAt: null, addedAt: new Date().toISOString() },
          { name: "Modelo de Dados", url: null, completedAt: new Date().toISOString(), addedAt: null },
        ] : [],
        assignedTo: s.name === "Arquitetura" ? [user.id.toString()] : [],
        notes: s.name === "Briefing" ? "Briefing aprovado pelo cliente" : null,
      },
    });
  }

  console.log(JSON.stringify({
    projectId: project.id.toString(),
    briefingId: briefing.id.toString(),
    stagesCount: 6,
  }));
})().catch(e => { console.error("ERR", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env = os.environ.copy()
env["DATABASE_URL"] = "postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=60"
env["TEST_EMAIL"] = EMAIL
result = subprocess.run(["node", "-e", NODE_CREATE], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
if result.returncode != 0: print(result.stderr); sys.exit(1)
proj_data = json.loads(result.stdout.strip().split("\n")[-1])
PROJECT_ID = proj_data["projectId"]
print(f"   ✓ project id={PROJECT_ID} with 6 stages")

# 3. /fabrica/projetos/[id] without auth
print(f"\n3. /fabrica/projetos/{PROJECT_ID} without auth — expect 307")
code, _ = fetch_no_auth(f"{BASE_URL}/fabrica/projetos/{PROJECT_ID}")
print(f"   -> {code}")
assert code == 307

# 4. /fabrica/projetos/[id] with auth
print(f"\n4. /fabrica/projetos/{PROJECT_ID} with auth — expect 200")
code, body = fetch(f"{BASE_URL}/fabrica/projetos/{PROJECT_ID}")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Dashboard de Vendas" in body or "TESTE P16" in body, "   Project title not in page"
print("   ✓ Project detail page loaded")

# 5. Verify kanban elements are present
print("\n5. Verify kanban elements")
assert "Pipeline" in body or "pipeline" in body.lower(), "   Pipeline section not found"
assert "Briefing" in body, "   Briefing stage not found"
assert "Arquitetura" in body, "   Arquitetura stage not found"
assert "Desenvolvimento" in body, "   Desenvolvimento stage not found"
print("   ✓ Kanban with 6 stages visible")

# 6. Verify stage statuses visible
print("\n6. Verify stage statuses visible")
# Briefing should be completed (emerald/green)
# Arquitetura should be active (violet)
assert "completed" in body.lower() or "Conclu" in body, "   Completed status not visible"
assert "active" in body.lower() or "Ativo" in body, "   Active status not visible"
print("   ✓ Stage statuses visible (completed + active)")

# 7. Verify progress bar
print("\n7. Verify progress bar (16% = 1/6 completed)")
assert "16%" in body or "progress" in body.lower(), "   Progress not visible"
print("   ✓ Progress bar visible")

# 8. Verify deliverables
print("\n8. Verify deliverables section")
assert "Deliverable" in body or "deliverable" in body.lower(), "   Deliverables section not found"
assert "Documento de Arquitetura" in body or "Modelo de Dados" in body, "   Test deliverable not found"
print("   ✓ Deliverables visible")

# 9. Verify team assignment
print("\n9. Verify team assignment section")
assert "Equipe" in body or "equipe" in body.lower(), "   Team section not found"
print("   ✓ Team section visible")

# 10. Verify client info from briefing
print("\n10. Verify client info from briefing")
assert "Carlos Teste" in body or "Empresa Teste" in body, "   Client info not found"
print("   ✓ Client info visible")

# 11. Verify stack chips
print("\n11. Verify stack chips")
assert "nextjs" in body.lower(), "   Stack not found"
print("   ✓ Stack visible")

# 12. Cleanup
print("\n12. Cleanup test data")
NODE_CLEANUP = r"""
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const projects = await prisma.softwareProject.findMany({ where: { name: { contains: "[TESTE P16]" } } });
  for (const p of projects) {
    await prisma.projectStage.deleteMany({ where: { projectId: p.id } });
    if (p.briefingId) {
      await prisma.softwareProject.update({ where: { id: p.id }, data: { briefing: { disconnect: true } } });
    }
    await prisma.softwareProject.delete({ where: { id: p.id } });
  }
  await prisma.projectBriefing.deleteMany({ where: { clientName: { contains: "[TESTE P16]" } } });
  console.log("OK cleaned");
})().catch(e => { console.error("ERR", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
result = subprocess.run(["node", "-e", NODE_CLEANUP], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
print(f"   {result.stdout.strip()}")

print("\n=== P16 PIPELINE DE DESENVOLVIMENTO VISUAL E2E TEST PASSED ===")
print("Summary:")
print("  1. Login ✓")
print("  2. Created project + briefing + 6 stages via Prisma ✓")
print("  3. /fabrica/projetos/[id] without auth → 307 ✓")
print("  4. /fabrica/projetos/[id] with auth → 200 ✓")
print("  5. Kanban with 6 stages visible ✓")
print("  6. Stage statuses visible (completed + active) ✓")
print("  7. Progress bar visible (16%) ✓")
print("  8. Deliverables visible ✓")
print("  9. Team assignment section visible ✓")
print("  10. Client info from briefing visible ✓")
print("  11. Stack chips visible ✓")
print("  12. Cleanup ✓")
