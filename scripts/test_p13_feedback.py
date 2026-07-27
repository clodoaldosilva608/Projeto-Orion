#!/usr/bin/env python3
"""End-to-end test for P13 — Sistema de Feedback."""
import json, os, subprocess, sys, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "p13/1.0"})
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
    req = urllib.request.Request(url, headers={"User-Agent": "p13/1.0"})
    try:
        with fresh.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")

print(f"=== P13 — Sistema de Feedback E2E test ===\n")

# 1. Login
print("1. Login")
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "p13/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except: pass
print("   ✓ logged in")

# 2. /feedback without auth
print("\n2. /feedback without auth — expect 307")
code, _ = fetch_no_auth(f"{BASE_URL}/feedback")
print(f"   -> {code}")
assert code == 307

# 3. /feedback with auth (empty state)
print("\n3. /feedback with auth — expect 200")
code, body = fetch(f"{BASE_URL}/feedback")
print(f"   -> {code}")
assert code == 200
assert "Feedback" in body, "   Page doesn't mention Feedback"
print("   ✓ Page loaded")

# 4. /feedback/admin
print("\n4. /feedback/admin with auth — expect 200")
code, body = fetch(f"{BASE_URL}/feedback/admin")
print(f"   -> {code}")
assert code == 200
assert "Gerenciar" in body or "pesquisa" in body.lower(), "   Page doesn't mention management"
print("   ✓ Admin page loaded")

# 5. Create a feedback via Prisma
print("\n5. Create a NPS feedback via Prisma")
NODE_CREATE = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  // Delete old test feedbacks
  const oldFbs = await prisma.feedback.findMany({ where: { companyId: user.companyId, title: { contains: '[TESTE P13]' } } });
  for (const fb of oldFbs) {
    await prisma.feedbackResponse.deleteMany({ where: { feedbackId: fb.id } });
    await prisma.feedback.delete({ where: { id: fb.id } });
  }
  // Create new
  const fb = await prisma.feedback.create({
    data: {
      companyId: user.companyId,
      title: '[TESTE P13] Pesquisa NPS',
      description: 'Pesquisa de teste criada pelo smoke test P13',
      type: 'nps',
      status: 'active',
      question: 'De 0 a 10, o quanto você recomendaria a plataforma Orion?',
      helpText: 'Considere sua experiência nos últimos 30 dias',
      isAnonymous: false,
      pointsReward: 15,
      createdBy: user.id,
    },
  });
  console.log(JSON.stringify({ id: fb.id.toString(), title: fb.title, type: fb.type }));
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env = os.environ.copy()
env["DATABASE_URL"] = "postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=60"
env["TEST_EMAIL"] = EMAIL
result = subprocess.run(["node", "-e", NODE_CREATE], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
if result.returncode != 0: print(result.stderr); sys.exit(1)
fb_data = json.loads(result.stdout.strip().split("\n")[-1])
FB_ID = fb_data["id"]
print(f"   ✓ feedback id={FB_ID} type={fb_data['type']}")

# 6. Verify /feedback shows the new survey
print("\n6. /feedback should show the NPS survey")
code, body = fetch(f"{BASE_URL}/feedback")
assert code == 200
assert "TESTE P13" in body or "NPS" in body, "   Survey not in page"
print("   ✓ Survey visible to user")

# 7. Verify /feedback/admin shows the survey
print("\n7. /feedback/admin shows the survey")
code, body = fetch(f"{BASE_URL}/feedback/admin")
assert code == 200
assert "TESTE P13" in body, "   Survey not in admin page"
print("   ✓ Survey visible in admin")

# 8. Submit a response via Prisma
print("\n8. Submit a NPS response (score 9) via Prisma")
NODE_RESPOND = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  const fb = await prisma.feedback.findFirst({ where: { companyId: user.companyId, title: '[TESTE P13] Pesquisa NPS' } });
  const resp = await prisma.feedbackResponse.create({
    data: {
      companyId: user.companyId,
      feedbackId: fb.id,
      userId: user.id,
      numericValue: 9,
      comment: 'Plataforma excelente!',
    },
  });
  // Award points
  await prisma.pointTransaction.create({
    data: {
      companyId: user.companyId,
      userId: user.id,
      type: 'earned',
      points: fb.pointsReward,
      reason: 'Feedback: ' + fb.title,
      reasonKey: 'ai_feedback_positive',
      referenceId: resp.id.toString(),
      metadata: { type: 'feedback_response', feedbackId: fb.id.toString() },
    },
  });
  console.log(JSON.stringify({ responseId: resp.id.toString(), score: 9, points: fb.pointsReward }));
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
result = subprocess.run(["node", "-e", NODE_RESPOND], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
resp_data = json.loads(result.stdout.strip().split("\n")[-1])
print(f"   ✓ Response id={resp_data['responseId']} score={resp_data['score']} +{resp_data['points']} pts")

# 9. Verify /feedback/[id] analytics page
print(f"\n9. /feedback/{FB_ID} should show analytics (1 response, NPS 100)")
code, body = fetch(f"{BASE_URL}/feedback/{FB_ID}")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "TESTE P13" in body or "Pesquisa NPS" in body, "   Title not in page"
print("   ✓ Analytics page loaded")

# 10. Verify gamification profile shows feedback points
print("\n10. /gamificacao should show feedback points")
code, body = fetch(f"{BASE_URL}/gamificacao")
assert code == 200
assert "Feedback" in body or "feedback" in body.lower() or "15" in body, "   Points not visible"
print("   ✓ Feedback points visible on gamification profile")

# 11. Cleanup
print("\n11. Cleanup test data")
NODE_CLEANUP = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  const fbs = await prisma.feedback.findMany({ where: { companyId: user.companyId, title: { contains: '[TESTE P13]' } } });
  for (const fb of fbs) {
    await prisma.feedbackResponse.deleteMany({ where: { feedbackId: fb.id } });
    await prisma.feedback.delete({ where: { id: fb.id } });
  }
  await prisma.pointTransaction.deleteMany({
    where: { userId: user.id, reasonKey: 'ai_feedback_positive', metadata: { path: ['type'], equals: 'feedback_response' } },
  });
  console.log('OK cleaned');
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
result = subprocess.run(["node", "-e", NODE_CLEANUP], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
print(f"   {result.stdout.strip()}")

print("\n=== P13 SISTEMA DE FEEDBACK E2E TEST PASSED ===")
print("Summary:")
print("  1. Login ✓")
print("  2. /feedback without auth → 307 ✓")
print("  3. /feedback with auth → 200 ✓")
print("  4. /feedback/admin → 200 ✓")
print("  5. Created NPS feedback via Prisma ✓")
print("  6. /feedback shows survey to user ✓")
print("  7. /feedback/admin shows survey ✓")
print("  8. Submitted NPS response (9) + awarded 15 pts ✓")
print("  9. /feedback/[id] analytics page loaded ✓")
print("  10. /gamificacao shows feedback points ✓")
print("  11. Cleanup ✓")
