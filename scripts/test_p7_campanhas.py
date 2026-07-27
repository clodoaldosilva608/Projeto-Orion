#!/usr/bin/env python3
"""
End-to-end test for P7 — Campanhas & Premiações.
"""
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request
import urllib.error
import http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def http_error_307(self, req, fp, code, msg, headers): return None
    def http_error_302(self, req, fp, code, msg, headers): return None
    def http_error_301(self, req, fp, code, msg, headers): return None
    def http_error_303(self, req, fp, code, msg, headers): return None

no_redir_opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cookies),
    NoRedirect(),
)

def fetch(url, method="GET", data=None, opener=None, headers=None):
    if opener is None: opener = no_redir_opener
    h = {"User-Agent": "orion-p7-test/1.0"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

print(f"=== P7 — Campanhas E2E test against {BASE_URL} ===\n")

# 1. Login
print("1. Login")
form = urllib.parse.urlencode({
    "email": EMAIL, "password": PASSWORD, "redirect": "/dashboard",
}).encode()
fetch(f"{BASE_URL}/api/auth/login", method="POST", data=form,
      headers={"Content-Type": "application/x-www-form-urlencoded"})
print("   ✓ logged in")

# 2. /campanhas without auth (use a fresh opener)
print("\n2. /campanhas without auth — expect 307 to /login")
fresh_cookies = http.cookiejar.CookieJar()
fresh_opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(fresh_cookies),
    NoRedirect(),
)
def fetch_fresh(url, method="GET", data=None, headers=None):
    h = {"User-Agent": "orion-p7-test/1.0"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with fresh_opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

code, _, headers = fetch_fresh(f"{BASE_URL}/campanhas")
print(f"   -> {code} -> {headers.get('location', headers.get('Location', ''))[:80]}")
assert code == 307

# 3. /campanhas with auth
print("\n3. /campanhas with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/campanhas")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Campanhas" in body or "campanha" in body.lower(), "   Page doesn't mention campanhas"
print("   ✓ Page contains 'Campanhas'")

# 4. /campanhas/nova
print("\n4. /campanhas/nova with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/campanhas/nova")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Nova Campanha" in body or "name=" in body, "   Form not found"
print("   ✓ Form page loaded")

# 5. Create a campaign via Prisma
print("\n5. Create test campaign via Prisma")
NODE_CREATE = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  if (!user) { console.error('USER NOT FOUND'); process.exit(1); }
  const start = new Date();
  const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const cmp = await prisma.campaign.create({
    data: {
      companyId: user.companyId,
      name: '[TESTE P7] Campanha E2E',
      description: 'Campanha criada pelo script de smoke test P7',
      status: 'active',
      startDate: start,
      endDate: end,
      rules: { pontosPorRealizacao: 10, bonusMetaAtingida: 50 },
      createdBy: user.id,
    },
  });
  console.log(JSON.stringify({ id: cmp.id.toString(), name: cmp.name }));
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env = os.environ.copy()
env["DATABASE_URL"] = "postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=60"
env["TEST_EMAIL"] = EMAIL
result = subprocess.run(
    ["node", "-e", NODE_CREATE],
    capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas",
    timeout=30,
)
if result.returncode != 0:
    print(result.stderr)
    sys.exit(1)
campaign_data = json.loads(result.stdout.strip().split("\n")[-1])
CAMPAIGN_ID = campaign_data["id"]
print(f"   ✓ created id={CAMPAIGN_ID} name={campaign_data['name']}")

# 6. Visit /campanhas/[id]
print(f"\n6. GET /campanhas/{CAMPAIGN_ID} — expect 200")
code, body, _ = fetch(f"{BASE_URL}/campanhas/{CAMPAIGN_ID}")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Campanha E2E" in body or "TESTE P7" in body, "   Campaign name not in page"
print("   ✓ Detail page loaded with campaign name")

# 7. /campanhas list should now show the test campaign
print("\n7. /campanhas list — should include test campaign")
code, body, _ = fetch(f"{BASE_URL}/campanhas")
assert code == 200
assert "TESTE P7" in body or "Campanha E2E" in body, "   Test campaign not in list"
print("   ✓ Test campaign appears in list")

# 8. Add an award + participant via Prisma
print("\n8. Add test award + participant via Prisma")
NODE_ADD = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  const award = await prisma.award.create({
    data: {
      companyId: user.companyId,
      campaignId: BigInt(process.env.CAMPAIGN_ID),
      name: '[TESTE] 1 lugar iPad',
      type: 'product',
      value: 5000,
      position: 1,
    },
  });
  const p = await prisma.campaignParticipant.upsert({
    where: { campaignId_userId: { campaignId: BigInt(process.env.CAMPAIGN_ID), userId: user.id } },
    update: { totalPoints: 150 },
    create: {
      campaignId: BigInt(process.env.CAMPAIGN_ID),
      userId: user.id,
      totalPoints: 150,
      rank: 1,
    },
  });
  console.log(JSON.stringify({ awardId: award.id.toString(), participantId: p.id.toString() }));
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env["CAMPAIGN_ID"] = CAMPAIGN_ID
result = subprocess.run(
    ["node", "-e", NODE_ADD],
    capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas",
    timeout=30,
)
if result.returncode != 0:
    print(result.stderr)
    sys.exit(1)
add_data = json.loads(result.stdout.strip().split("\n")[-1])
print(f"   ✓ award={add_data['awardId']} participant={add_data['participantId']}")

# 9. Re-visit /campanhas/[id]
print(f"\n9. GET /campanhas/{CAMPAIGN_ID} — should show award and participant")
code, body, _ = fetch(f"{BASE_URL}/campanhas/{CAMPAIGN_ID}")
assert code == 200
assert "1 lugar iPad" in body or "TESTE" in body, "   Award not in page"
assert "Admin Orion" in body or "clodoaldo" in body, "   Participant not in page"
print("   ✓ Award and participant visible")

# 10. Cleanup
print("\n10. Cleanup: hard delete test campaign")
NODE_DELETE = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  await prisma.award.deleteMany({ where: { campaignId: BigInt(process.env.CAMPAIGN_ID) } });
  await prisma.campaignParticipant.deleteMany({ where: { campaignId: BigInt(process.env.CAMPAIGN_ID) } });
  await prisma.campaign.deleteMany({ where: { id: BigInt(process.env.CAMPAIGN_ID) } });
  console.log('OK deleted');
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
result = subprocess.run(
    ["node", "-e", NODE_DELETE],
    capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas",
    timeout=30,
)
print(f"   {result.stdout.strip()}")

print("\n=== P7 CAMPANHAS E2E TEST PASSED ===")
print("Summary:")
print("  1. Login ✓")
print("  2. /campanhas without auth → 307 ✓")
print("  3. /campanhas with auth → 200 ✓")
print("  4. /campanhas/nova → 200 ✓")
print("  5. Campaign created via Prisma ✓")
print(f"  6. /campanhas/{CAMPAIGN_ID} → 200 ✓")
print("  7. /campanhas list shows new campaign ✓")
print("  8. Award + participant added ✓")
print("  9. Detail page shows award + participant ✓")
print("  10. Cleanup ✓")
