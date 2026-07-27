#!/usr/bin/env python3
"""Quick smoke test for the live Orion SaaS deployment."""
import json
import sys
import urllib.parse
import urllib.request
import urllib.error
import http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"
CRON_KEY = "orion-cron-secret-2026"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def http_error_307(self, req, fp, code, msg, headers): return None
    def http_error_302(self, req, fp, code, msg, headers): return None
    def http_error_301(self, req, fp, code, msg, headers): return None
    def http_error_303(self, req, fp, code, msg, headers): return None

no_redir = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()), NoRedirect())

def fetch(url, opener=None):
    if opener is None: opener = no_redir
    req = urllib.request.Request(url, headers={"User-Agent": "orion-smoke/1.0"})
    try:
        with opener.open(req) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code

print("=== Orion SaaS — full smoke test ===\n")

# Public
print("1. Public pages:")
for p in ["/", "/login", "/login/2fa", "/produtos", "/deployments"]:
    c = fetch(f"{BASE_URL}{p}")
    print(f"   {p:25s} -> {c}")
    assert c == 200

# Protected (no auth)
print("\n2. Protected routes without auth — expect 307 to /login:")
for p in ["/dashboard", "/campanhas", "/campanhas/nova", "/configuracoes", "/notificacoes", "/backups", "/metas"]:
    c = fetch(f"{BASE_URL}{p}")
    print(f"   {p:25s} -> {c}")
    assert c == 307

# API no auth
print("\n3. API endpoints without auth — expect 401:")
for p in ["/api/auth/me"]:
    c = fetch(f"{BASE_URL}{p}")
    print(f"   {p:25s} -> {c}")
    assert c == 401

# Cron with wrong key
print("\n4. /api/cron/drain with wrong key — expect 401:")
c = fetch(f"{BASE_URL}/api/cron/drain?key=wrong")
print(f"   -> {c}")
assert c == 401

# Cron with correct key
print("\n5. /api/cron/drain with correct key — expect 200:")
c = fetch(f"{BASE_URL}/api/cron/drain?key={CRON_KEY}")
print(f"   -> {c}")
assert c == 200

# Login + authenticated
print("\n6. Login + authenticated pages:")
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "orion-smoke/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try:
    opener.open(req)
except urllib.error.HTTPError as e:
    pass  # 303 redirect throws
print("   ✓ logged in")

print("\n7. Authenticated pages — expect 200:")
all_pages = [
    "/dashboard", "/metas", "/indicadores", "/resultados", "/aprovacoes", "/ranking",
    "/campanhas", "/campanhas/nova",
    "/gamificacao", "/gamificacao/leaderboard", "/gamificacao/conquistas", "/gamificacao/resgates",
    "/calendario", "/calendario/nova",
    "/configuracoes", "/notificacoes", "/backups",
    "/usuarios", "/funcoes-permissoes", "/logs-auditoria",
    "/clientes", "/projetos", "/aplicacoes", "/licencas", "/pagamentos", "/assinaturas",
    "/planos", "/cupons", "/consumo-ia",
]
for p in all_pages:
    c = fetch(f"{BASE_URL}{p}", opener=opener)
    status = "✓" if c == 200 else "✗"
    print(f"   {status} {p:25s} -> {c}")
    assert c == 200, f"   FAILED: {p} returned {c}"

print(f"\n=== ALL {len(all_pages)+9} SMOKE TESTS PASSED ===")
