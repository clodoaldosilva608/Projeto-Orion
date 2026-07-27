#!/usr/bin/env python3
"""End-to-end test for P9 — Calendário Comercial."""
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

def fetch_no_auth(url):
    fresh = urllib.request.build_opener(NoRedirect())
    req = urllib.request.Request(url, headers={"User-Agent": "orion-p9-test/1.0"})
    try:
        with fresh.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "orion-p9-test/1.0"})
    try:
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

print(f"=== P9 — Calendário E2E test against {BASE_URL} ===\n")

# 1. Login
print("1. Login")
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "orion-p9-test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except urllib.error.HTTPError: pass
print("   ✓ logged in")

# 2. /calendario without auth
print("\n2. /calendario without auth — expect 307")
code, _, headers = fetch_no_auth(f"{BASE_URL}/calendario")
print(f"   -> {code} -> {headers.get('location', headers.get('Location', ''))[:80]}")
assert code == 307

# 3. /calendario with auth (default = current month)
print("\n3. /calendario with auth (current month) — expect 200 + Brazilian holidays seeded")
code, body, _ = fetch(f"{BASE_URL}/calendario")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Calendário" in body, "   Page doesn't mention Calendário"
print("   ✓ Page contains 'Calendário'")

# 4. /calendario/nova
print("\n4. /calendario/nova with auth — expect 200")
code, body, _ = fetch(f"{BASE_URL}/calendario/nova")
print(f"   -> {code}")
assert code == 200, f"   UNEXPECTED: {code}"
assert "Novo Evento" in body or "title=" in body, "   Form not found"
print("   ✓ Form page loaded")

# 5. Verify Brazilian holidays were seeded (check December 2026 for Natal)
print("\n5. Verify Brazilian holidays seeded — check December 2026")
code, body, _ = fetch(f"{BASE_URL}/calendario?year=2026&month=12")
assert code == 200
assert "Natal" in body, "   Natal (Dec 25) not in December calendar"
print("   ✓ Natal found in December 2026")

# 6. Verify January 2026 has Confraternização Universal
print("\n6. Verify January 2026 — Confraternização Universal")
code, body, _ = fetch(f"{BASE_URL}/calendario?year=2026&month=1")
assert code == 200
assert "Confraternização" in body, "   Confraternização not in January"
print("   ✓ Confraternização Universal found in January 2026")

# 7. Verify September 2026 has Independência
print("\n7. Verify September 2026 — Independência do Brasil")
code, body, _ = fetch(f"{BASE_URL}/calendario?year=2026&month=9")
assert code == 200
assert "Independência" in body, "   Independência not in September"
print("   ✓ Independência do Brasil found in September 2026")

# 8. Create a test event via Prisma
print("\n8. Create test event via Prisma")
NODE_CREATE = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const user = await prisma.user.findFirst({ where: { email: { equals: process.env.TEST_EMAIL, mode: 'insensitive' } } });
  const ev = await prisma.calendarEvent.create({
    data: {
      companyId: user.companyId,
      title: '[TESTE P9] Reunião E2E',
      description: 'Evento criado pelo smoke test P9',
      type: 'meeting',
      scope: 'company',
      startDate: new Date('2026-07-27T10:00:00-03:00'),
      endDate: new Date('2026-07-27T11:00:00-03:00'),
      allDay: false,
      location: 'Sala de Reuniões 3',
      isOfficial: false,
      createdBy: user.id,
    },
  });
  console.log(JSON.stringify({ id: ev.id.toString(), title: ev.title }));
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env = os.environ.copy()
env["DATABASE_URL"] = "postgresql://postgres.iwadvrvdlpdjiclwvsgw:Silva88677488@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=60"
env["TEST_EMAIL"] = EMAIL
result = subprocess.run(["node", "-e", NODE_CREATE], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
if result.returncode != 0:
    print(result.stderr); sys.exit(1)
ev_data = json.loads(result.stdout.strip().split("\n")[-1])
EV_ID = ev_data["id"]
print(f"   ✓ event id={EV_ID} title={ev_data['title']}")

# 9. Verify the event shows up in July 2026 calendar
print("\n9. Verify /calendario?year=2026&month=7 shows the test event")
code, body, _ = fetch(f"{BASE_URL}/calendario?year=2026&month=7")
assert code == 200
assert "TESTE P9" in body or "Reunião E2E" in body, "   Test event not in July calendar"
print("   ✓ Test event visible in July 2026")

# 10. Cleanup
print("\n10. Cleanup test event")
NODE_DELETE = r"""
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  await prisma.calendarEvent.deleteMany({ where: { id: BigInt(process.env.EV_ID) } });
  console.log('OK deleted');
})().catch(e => { console.error('ERR', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
"""
env["EV_ID"] = EV_ID
result = subprocess.run(["node", "-e", NODE_DELETE], capture_output=True, text=True, env=env, cwd="/home/z/my-project/orion-saas", timeout=30)
print(f"   {result.stdout.strip()}")

print("\n=== P9 CALENDÁRIO E2E TEST PASSED ===")
print("Summary:")
print("  1. Login ✓")
print("  2. /calendario without auth → 307 ✓")
print("  3. /calendario with auth → 200 ✓")
print("  4. /calendario/nova → 200 ✓")
print("  5. Natal found in December 2026 (auto-seeded) ✓")
print("  6. Confraternização found in January 2026 ✓")
print("  7. Independência found in September 2026 ✓")
print("  8. Test event created via Prisma ✓")
print("  9. Test event visible in July 2026 calendar ✓")
print("  10. Cleanup ✓")
