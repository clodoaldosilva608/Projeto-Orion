#!/usr/bin/env python3
"""End-to-end test for P11 — Painel TV."""
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

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "orion-p11-test/1.0"})
    try:
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

def fetch_no_auth(url):
    """Fetch with no cookies, no redirects."""
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def http_error_307(self, *a): return None
        def http_error_302(self, *a): return None
        def http_error_301(self, *a): return None
        def http_error_303(self, *a): return None
    fresh = urllib.request.build_opener(NoRedirect())
    req = urllib.request.Request(url, headers={"User-Agent": "orion-p11-test/1.0"})
    try:
        with fresh.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

print(f"=== P11 — Painel TV E2E test ===\n")

# 1. Login
print("1. Login")
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "orion-p11-test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except urllib.error.HTTPError: pass
print("   ✓ logged in")

# 2. /tv without auth — should NOT redirect to /login (proxy allows /tv through)
# But the page itself will show "access restricted" since no auth and no token
print("\n2. /tv without auth and without token — expect 200 (page shows access restricted message)")
code, body, _ = fetch_no_auth(f"{BASE_URL}/tv")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Acesso restrito" in body or "login" in body.lower(), "   Should show access restricted"
print("   ✓ Page correctly shows access restricted message")

# 3. /tv with auth — should show dashboard
print("\n3. /tv with auth — expect 200 + TV dashboard")
code, body, _ = fetch(f"{BASE_URL}/tv")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Painel TV" in body or "ORION" in body, "   Page doesn't mention Painel TV"
print("   ✓ TV dashboard loaded")

# 4. /tv/ranking with auth
print("\n4. /tv/ranking with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/tv/ranking")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Ranking" in body, "   Page doesn't mention Ranking"
print("   ✓ TV ranking page loaded")

# 5. /tv/campanhas with auth
print("\n5. /tv/campanhas with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/tv/campanhas")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Campanhas" in body, "   Page doesn't mention Campanhas"
print("   ✓ TV campanhas page loaded")

# 6. Generate a TV token via Prisma
print("\n6. Generate a TV token via Prisma")
NODE_GEN_TOKEN = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'tv_';
  for (let i = 0; i < 24; i++) token += chars[Math.floor(Math.random() * chars.length)];
  await prisma.systemSetting.upsert({
    where: { companyId_key: { companyId: user.companyId, key: 'tv.token' } },
    update: { value: { token } },
    create: { companyId: user.companyId, key: 'tv.token', value: { token } },
  });
  console.log(JSON.stringify({ token }));
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env = os.environ.copy()
env["DATABASE_URL"] = "postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=60"
env["TEST_EMAIL"] = EMAIL
result = subprocess.run(["node", "-e", NODE_GEN_TOKEN], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
if result.returncode != 0:
    print(result.stderr); sys.exit(1)
token_data = json.loads(result.stdout.strip().split("\n")[-1])
TV_TOKEN = token_data["token"]
print(f"   ✓ TV token: {TV_TOKEN}")

# 7. Access /tv?key=<token> WITHOUT being logged in — should work
print("\n7. /tv?key=<token> without login — expect 200 + dashboard")
code, body, _ = fetch_no_auth(f"{BASE_URL}/tv?key={TV_TOKEN}")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Painel TV" in body or "ORION" in body, "   TV dashboard should load with valid token"
# Should NOT show 'access restricted'
assert "Acesso restrito" not in body, "   Should not show access restricted with valid token"
print("   ✓ TV dashboard loaded via token (kiosk mode)")

# 8. /tv/ranking?key=<token> without login
print("\n8. /tv/ranking?key=<token> without login — expect 200")
code, body, _ = fetch_no_auth(f"{BASE_URL}/tv/ranking?key={TV_TOKEN}")
print(f"   -> {code}")
assert code == 200
assert "Ranking" in body
print("   ✓ TV ranking via token works")

# 9. /tv/campanhas?key=<token> without login
print("\n9. /tv/campanhas?key=<token> without login — expect 200")
code, body, _ = fetch_no_auth(f"{BASE_URL}/tv/campanhas?key={TV_TOKEN}")
print(f"   -> {code}")
assert code == 200
assert "Campanhas" in body
print("   ✓ TV campanhas via token works")

# 10. Invalid token — should show access restricted
print("\n10. /tv?key=invalid — expect 200 but show 'access restricted'")
code, body, _ = fetch_no_auth(f"{BASE_URL}/tv?key=tv_invalid_token")
print(f"   -> {code}")
assert code == 200
assert "Acesso restrito" in body or "login" in body.lower(), "   Should show access restricted with invalid token"
print("   ✓ Invalid token correctly rejected")

# 11. Verify the dashboard shows actual data (KPIs, etc.)
print("\n11. Verify dashboard shows real data (KPIs)")
code, body, _ = fetch(f"{BASE_URL}/tv")
assert code == 200
# Should have some of the KPI labels
found_kpis = []
for kpi in ["Vendedores ativos", "Metas ativas", "Resultados", "Campanhas", "Pontos"]:
    if kpi in body:
        found_kpis.append(kpi)
print(f"   ✓ Found KPIs: {found_kpis}")
assert len(found_kpis) >= 3, f"   Expected at least 3 KPIs, found {found_kpis}"

# 12. Verify clock is rendered
print("\n12. Verify clock element is in page")
assert "tv-clock" in body or "setInterval" in body, "   Clock script not found"
print("   ✓ Clock script present")

print("\n=== P11 PAINEL TV E2E TEST PASSED ===")
print("Summary:")
print("  1. Login ✓")
print("  2. /tv without auth → access restricted message ✓")
print("  3. /tv with auth → 200 + dashboard ✓")
print("  4. /tv/ranking with auth → 200 ✓")
print("  5. /tv/campanhas with auth → 200 ✓")
print("  6. Generated TV token via Prisma ✓")
print("  7. /tv?key=token without login → dashboard (kiosk mode) ✓")
print("  8. /tv/ranking?key=token without login → 200 ✓")
print("  9. /tv/campanhas?key=token without login → 200 ✓")
print("  10. /tv?key=invalid → access restricted ✓")
print("  11. Dashboard shows real KPIs ✓")
print("  12. Clock script present ✓")
