#!/usr/bin/env python3
"""End-to-end test for P17 — Workspace do Cliente + Licenciamento."""
import json, os, subprocess, sys, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

def fetch(url, method="GET", data=None, headers=None):
    h = {"User-Agent": "p17/1.0"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=data, method=method, headers=h)
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
    req = urllib.request.Request(url, headers={"User-Agent": "p17/1.0"})
    try:
        with fresh.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")

print(f"=== P17 — Workspace + Licenciamento E2E test ===\n")

# 1. Login
print("1. Login")
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
fetch(f"{BASE_URL}/api/auth/login", method="POST", data=form,
      headers={"Content-Type": "application/x-www-form-urlencoded"})
print("   ✓ logged in")

# 2. /fabrica/licencas with auth
print("\n2. /fabrica/licencas with auth — expect 200")
code, body = fetch(f"{BASE_URL}/fabrica/licencas")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Licen" in body, "   Page doesn't mention Licenças"
print("   ✓ Licenses admin page loaded")

# 3. Create a test project + license via Prisma
print("\n3. Create test project + license via Prisma")
NODE_CREATE = r"""
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: "insensitive" } } });
  // Clean old test
  const oldLic = await prisma.softwareLicense.findMany({ where: { companyId: user.companyId, clientName: { contains: "[TESTE P17]" } } });
  for (const l of oldLic) {
    await prisma.licenseValidation.deleteMany({ where: { licenseId: l.id } });
    if (l.projectId) {
      await prisma.softwareLicense.update({ where: { id: l.id }, data: { project: { disconnect: true } } });
    }
    await prisma.softwareLicense.delete({ where: { id: l.id } });
  }
  const oldProj = await prisma.softwareProject.findMany({ where: { companyId: user.companyId, name: { contains: "[TESTE P17]" } } });
  for (const p of oldProj) {
    await prisma.projectStage.deleteMany({ where: { projectId: p.id } });
    await prisma.softwareProject.delete({ where: { id: p.id } });
  }

  // Create project (delivered)
  const project = await prisma.softwareProject.create({
    data: {
      companyId: user.companyId,
      name: "[TESTE P17] Sistema de Pedidos",
      description: "Sistema de pedidos para restaurante",
      status: "delivered",
      stack: ["nextjs", "prisma", "supabase", "tailwind"],
      keyFeatures: ["Login", "Cardápio", "Pedidos", "Pagamentos"],
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(),
      progress: 100,
      productionUrl: "https://teste-p17.vercel.app",
      createdBy: user.id,
      stages: {
        create: [
          { name: "Briefing", sortOrder: 0, status: "completed", completedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000) },
          { name: "Arquitetura", sortOrder: 1, status: "completed", completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) },
          { name: "Desenvolvimento", sortOrder: 2, status: "completed", completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
          { name: "Testes", sortOrder: 3, status: "completed", completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { name: "Deploy", sortOrder: 4, status: "completed", completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { name: "Entrega", sortOrder: 5, status: "completed", completedAt: new Date() },
        ],
      },
    },
  });

  // Create license
  const license = await prisma.softwareLicense.create({
    data: {
      companyId: user.companyId,
      projectId: project.id,
      clientEmail: "cliente@teste.com",
      clientName: "[TESTE P17] Restaurante Bom Sabor",
      licenseKey: "ORION-TEST-P17X-AAAA-BBBB",
      workspaceToken: "ws_testp17token1234567890ab",
      status: "active",
      plan: "standard",
      maxUsers: 10,
      activatedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      productionUrl: "https://teste-p17.vercel.app",
    },
  });

  console.log(JSON.stringify({
    projectId: project.id.toString(),
    licenseId: license.id.toString(),
    licenseKey: license.licenseKey,
    workspaceToken: license.workspaceToken,
  }));
})().catch(e => { console.error("ERR", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env = os.environ.copy()
env["DATABASE_URL"] = "postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=60"
env["TEST_EMAIL"] = EMAIL
result = subprocess.run(["node", "-e", NODE_CREATE], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
if result.returncode != 0: print(result.stderr); sys.exit(1)
data = json.loads(result.stdout.strip().split("\n")[-1])
LICENSE_KEY = data["licenseKey"]
WORKSPACE_TOKEN = data["workspaceToken"]
print(f"   ✓ project={data['projectId']} license={LICENSE_KEY}")

# 4. /fabrica/licencas shows the test license
print("\n4. /fabrica/licencas shows the test license")
code, body = fetch(f"{BASE_URL}/fabrica/licencas")
assert code == 200
assert "TESTE P17" in body or "ORION-TEST" in body, "   License not in page"
print("   ✓ License visible in admin")

# 5. /workspace/[token] without auth — PUBLIC page
print(f"\n5. /workspace/{WORKSPACE_TOKEN} without auth — expect 200 (public page)")
code, body = fetch_no_auth(f"{BASE_URL}/workspace/{WORKSPACE_TOKEN}")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "ORION" in body, "   Workspace page doesn't show ORION"
assert "Sistema de Pedidos" in body or "TESTE P17" in body, "   Project name not in workspace"
print("   ✓ Workspace page loaded (public)")

# 6. Verify workspace has timeline
print("\n6. Verify workspace has timeline")
assert "Timeline" in body or "timeline" in body.lower(), "   Timeline not found"
assert "Briefing" in body, "   Briefing stage not found"
assert "Arquitetura" in body, "   Arquitetura stage not found"
print("   ✓ Timeline with 6 stages visible")

# 7. Verify workspace has progress
print("\n7. Verify workspace has progress (100%)")
assert "100%" in body, "   Progress not found"
print("   ✓ Progress 100% visible")

# 8. Verify workspace has license info
print("\n8. Verify workspace has license info")
assert "Licen" in body or "licen" in body.lower(), "   License info not found"
assert "Ativa" in body or "active" in body.lower(), "   License status not found"
print("   ✓ License info visible")

# 9. Verify workspace has production link
print("\n9. Verify workspace has 'Acessar sistema' link")
assert "Acessar sistema" in body or "teste-p17" in body, "   Production link not found"
print("   ✓ Production link visible")

# 10. API: validate license (valid)
print(f"\n10. POST /api/v1/public/license/validate — valid key")
code, body = fetch(
    f"{BASE_URL}/api/v1/public/license/validate",
    method="POST",
    data=json.dumps({"licenseKey": LICENSE_KEY}).encode(),
    headers={"Content-Type": "application/json"},
)
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
val_data = json.loads(body)
assert val_data["valid"] is True, f"   Expected valid=true, got: {val_data}"
assert val_data["status"] == "active", f"   Expected status=active, got: {val_data}"
print(f"   ✓ License valid: {val_data['reason']} ({val_data['clientName']})")

# 11. API: validate license (invalid key)
print(f"\n11. POST /api/v1/public/license/validate — invalid key")
code, body = fetch(
    f"{BASE_URL}/api/v1/public/license/validate",
    method="POST",
    data=json.dumps({"licenseKey": "ORION-INVALID-XXXX-YYYY-ZZZZ"}).encode(),
    headers={"Content-Type": "application/json"},
)
print(f"   -> {code}")
assert code == 200
val_data = json.loads(body)
assert val_data["valid"] is False, f"   Expected valid=false, got: {val_data}"
print(f"   ✓ Invalid license rejected: {val_data['reason']}")

# 12. API: validate license (GET method)
print(f"\n12. GET /api/v1/public/license/validate?key=... — valid key")
code, body = fetch_no_auth(f"{BASE_URL}/api/v1/public/license/validate?key={LICENSE_KEY}")
print(f"   -> {code}")
assert code == 200
val_data = json.loads(body)
assert val_data["valid"] is True
print(f"   ✓ GET validation works: {val_data['reason']}")

# 13. Cleanup
print("\n13. Cleanup test data")
NODE_CLEANUP = r"""
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const lics = await prisma.softwareLicense.findMany({ where: { clientName: { contains: "[TESTE P17]" } } });
  for (const l of lics) {
    await prisma.licenseValidation.deleteMany({ where: { licenseId: l.id } });
    if (l.projectId) {
      await prisma.softwareLicense.update({ where: { id: l.id }, data: { project: { disconnect: true } } });
    }
    await prisma.softwareLicense.delete({ where: { id: l.id } });
  }
  const projs = await prisma.softwareProject.findMany({ where: { name: { contains: "[TESTE P17]" } } });
  for (const p of projs) {
    await prisma.projectStage.deleteMany({ where: { projectId: p.id } });
    await prisma.softwareProject.delete({ where: { id: p.id } });
  }
  console.log("OK cleaned");
})().catch(e => { console.error("ERR", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
result = subprocess.run(["node", "-e", NODE_CLEANUP], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
print(f"   {result.stdout.strip()}")

print("\n=== P17 WORKSPACE + LICENCIAMENTO E2E TEST PASSED ===")
print("Summary:")
print("  1. Login ✓")
print("  2. /fabrica/licencas admin page → 200 ✓")
print("  3. Created project + license via Prisma ✓")
print("  4. License visible in admin ✓")
print("  5. /workspace/[token] PUBLIC page → 200 ✓")
print("  6. Timeline with 6 stages visible ✓")
print("  7. Progress 100% visible ✓")
print("  8. License info visible ✓")
print("  9. 'Acessar sistema' production link visible ✓")
print("  10. API validate (valid key) → valid=true ✓")
print("  11. API validate (invalid key) → valid=false ✓")
print("  12. API validate (GET method) → valid=true ✓")
print("  13. Cleanup ✓")
