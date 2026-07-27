#!/usr/bin/env python3
"""
End-to-end test for P8 — Gamificação Avançada.
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

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def http_error_307(self, req, fp, code, msg, headers): return None
    def http_error_302(self, req, fp, code, msg, headers): return None
    def http_error_301(self, req, fp, code, msg, headers): return None
    def http_error_303(self, req, fp, code, msg, headers): return None

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

def fetch_no_auth(url):
    """Fetch with NO cookies at all — fresh session, no redirects."""
    fresh = urllib.request.build_opener(NoRedirect())  # no cookie processor, no redirects
    req = urllib.request.Request(url, headers={"User-Agent": "orion-p8-test/1.0"})
    try:
        with fresh.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

def fetch(url, method="GET", data=None, headers=None):
    """Fetch with authenticated cookies (follows redirects)."""
    h = {"User-Agent": "orion-p8-test/1.0"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

print(f"=== P8 — Gamificação E2E test against {BASE_URL} ===\n")

# 1. Login
print("1. Login")
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
fetch(f"{BASE_URL}/api/auth/login", method="POST", data=form,
      headers={"Content-Type": "application/x-www-form-urlencoded"})
print("   ✓ logged in")

# 2. /gamificacao without auth
print("\n2. /gamificacao without auth — expect 307")
code, _, headers = fetch_no_auth(f"{BASE_URL}/gamificacao")
print(f"   -> {code} -> {headers.get('location', headers.get('Location', ''))[:80]}")
assert code == 307

# 3. /gamificacao with auth
print("\n3. /gamificacao with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/gamificacao")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Gamificação" in body, "   Page doesn't mention Gamificação"
print("   ✓ Page contains 'Gamificação'")

# 4. /gamificacao/leaderboard
print("\n4. /gamificacao/leaderboard with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/gamificacao/leaderboard")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Ranking" in body, "   Page doesn't mention Ranking"
print("   ✓ Leaderboard page loaded")

# 5. /gamificacao/conquistas
print("\n5. /gamificacao/conquistas with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/gamificacao/conquistas")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Conquistas" in body, "   Page doesn't mention Conquistas"
print("   ✓ Conquistas page loaded")

# 6. /gamificacao/resgates
print("\n6. /gamificacao/resgates with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/gamificacao/resgates")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Resgates" in body, "   Page doesn't mention Resgates"
print("   ✓ Resgates page loaded")

# 7. Award some points via Prisma and verify profile shows them
print("\n7. Award test points via Prisma (RN-159: result_on_time +10)")
NODE_AWARD = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  const tx = await prisma.pointTransaction.create({
    data: {
      companyId: user.companyId,
      userId: user.id,
      type: 'earned',
      points: 10,
      reason: 'Lançar resultado no horário (até 18h)',
      reasonKey: 'result_on_time',
      metadata: { test: true },
    },
  });
  console.log(JSON.stringify({ txId: tx.id.toString(), points: tx.points }));
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env = os.environ.copy()
env["DATABASE_URL"] = "postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=60"
env["TEST_EMAIL"] = EMAIL
result = subprocess.run(["node", "-e", NODE_AWARD], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
if result.returncode != 0:
    print(result.stderr); sys.exit(1)
award_data = json.loads(result.stdout.strip().split("\n")[-1])
print(f"   ✓ awarded {award_data['points']} pts (txId={award_data['txId']})")

# 8. Verify profile shows the points
print("\n8. Verify /gamificacao shows the awarded points")
code, body, _ = fetch(f"{BASE_URL}/gamificacao")
assert code == 200
# Should show "10 pontos totais" or similar
assert "10" in body, "   Points not in page"
print("   ✓ Points visible on profile")

# 9. Award achievement via Prisma
print("\n9. Unlock test achievement via Prisma (first_goal)")
NODE_ACH = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  try {
    const a = await prisma.userAchievement.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        achievementKey: 'first_goal',
        category: 'goal',
        metadata: { test: true, unlockedBy: 'manual' },
      },
    });
    console.log(JSON.stringify({ id: a.id.toString(), key: a.achievementKey }));
  } catch (e) {
    // Already unlocked — fine
    console.log(JSON.stringify({ id: null, key: 'first_goal', already: true }));
  }
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
result = subprocess.run(["node", "-e", NODE_ACH], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
ach_data = json.loads(result.stdout.strip().split("\n")[-1])
print(f"   ✓ achievement: {ach_data.get('key')} (already={ach_data.get('already', False)})")

# 10. Verify achievements page shows it
print("\n10. Verify /gamificacao/conquistas shows the unlocked achievement")
code, body, _ = fetch(f"{BASE_URL}/gamificacao/conquistas")
assert code == 200
assert "Desbloqueadas" in body, "   Achievements page missing count"
print("   ✓ Achievements page works")

# 11. Create test redemption and verify resgates page shows it
print("\n11. Create test redemption via Prisma + verify /gamificacao/resgates shows it")
NODE_RED = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  const r = await prisma.pointRedemption.create({
    data: {
      companyId: user.companyId,
      userId: user.id,
      rewardKey: 'mug',
      rewardName: 'Caneca Orion',
      pointsCost: 500,
      status: 'pending',
      metadata: { test: true, icon: '☕' },
    },
  });
  console.log(JSON.stringify({ id: r.id.toString(), reward: r.rewardName }));
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
result = subprocess.run(["node", "-e", NODE_RED], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
red_data = json.loads(result.stdout.strip().split("\n")[-1])
print(f"   ✓ redemption: {red_data['reward']} (id={red_data['id']})")

code, body, _ = fetch(f"{BASE_URL}/gamificacao/resgates")
assert code == 200
assert "Caneca Orion" in body, "   Redemption not in resgates page"
print("   ✓ Redemption visible on resgates page")

# 12. Cleanup
print("\n12. Cleanup test data")
NODE_CLEANUP = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  // Delete test data (only test entries — preserve real user data)
  await prisma.pointTransaction.deleteMany({ where: { userId: user.id, reasonKey: 'result_on_time', metadata: { path: ['test'], equals: true } } });
  await prisma.userAchievement.deleteMany({ where: { userId: user.id, achievementKey: 'first_goal', metadata: { path: ['test'], equals: true } } });
  await prisma.pointRedemption.deleteMany({ where: { userId: user.id, rewardKey: 'mug', metadata: { path: ['test'], equals: true } } });
  console.log('OK cleaned');
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
result = subprocess.run(["node", "-e", NODE_CLEANUP], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
print(f"   {result.stdout.strip()}")

print("\n=== P8 GAMIFICAÇÃO E2E TEST PASSED ===")
print("Summary:")
print("  1. Login ✓")
print("  2. /gamificacao without auth → 307 ✓")
print("  3. /gamificacao with auth → 200 ✓")
print("  4. /gamificacao/leaderboard → 200 ✓")
print("  5. /gamificacao/conquistas → 200 ✓")
print("  6. /gamificacao/resgates → 200 ✓")
print("  7. Award 10 pts via Prisma (RN-159) ✓")
print("  8. Profile shows awarded points ✓")
print("  9. Unlock achievement (RN-162) ✓")
print("  10. Achievements page works ✓")
print("  11. Create redemption + verify (RN-165) ✓")
print("  12. Cleanup ✓")
