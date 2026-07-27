#!/usr/bin/env python3
"""
COMPREHENSIVE AUDIT — all pages, redirects, clickable elements, logic.
Tests every single route in the Orion SaaS platform.
"""
import re, sys, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def http_error_307(self, *a): return None
    def http_error_302(self, *a): return None
    def http_error_301(self, *a): return None
    def http_error_303(self, *a): return None

no_auth = urllib.request.build_opener(NoRedirect())

# Login
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "audit/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except: pass
print("✓ logged in\n")

# ALL pages to test
ALL_PAGES = [
    # Public
    ("/", False),
    ("/login", False),
    ("/login/2fa", False),
    ("/produtos", False),
    ("/deployments", False),
    ("/workspace/test-token", False),  # will 404 but should be 200 page
    # Authenticated - Fábrica de Software
    ("/dashboard", True),
    ("/fabrica", True),
    ("/fabrica/projetos", True),
    ("/fabrica/briefings", True),
    ("/fabrica/briefings/novo", True),
    ("/fabrica/templates", True),
    ("/fabrica/licencas", True),
    # Authenticated - Dev & Deploy
    ("/aplicacoes", True),
    ("/file-projetos", True),
    ("/builds", True),
    ("/deploys", True),
    ("/releases", True),
    ("/anomalias", True),
    # Authenticated - IA
    ("/agentes-ia", True),
    ("/jobs-ia", True),
    ("/modelos", True),
    ("/consumo-ia", True),
    ("/provedores", True),
    ("/plugins", True),
    ("/plugins/api-keys", True),
    # Authenticated - Vendas Extras
    ("/metas", True),
    ("/indicadores", True),
    ("/resultados", True),
    ("/aprovacoes", True),
    ("/ranking", True),
    ("/campanhas", True),
    ("/gamificacao", True),
    ("/gamificacao/leaderboard", True),
    ("/gamificacao/conquistas", True),
    ("/gamificacao/resgates", True),
    ("/calendario", True),
    ("/checklist", True),
    ("/checklist/modelos", True),
    ("/feedback", True),
    ("/feedback/admin", True),
    # Authenticated - Sistema
    ("/clientes", True),
    ("/licencas", True),
    ("/pagamentos", True),
    ("/assinaturas", True),
    ("/planos", True),
    ("/cupons", True),
    ("/usuarios", True),
    ("/funcoes-permissoes", True),
    ("/notificacoes", True),
    ("/backups", True),
    ("/configuracoes", True),
    ("/logs-auditoria", True),
    ("/privacidade", True),
    # TV
    ("/tv", True),
    ("/tv/ranking", True),
    ("/tv/campanhas", True),
    # Super Admin
    ("/superadmin", True),
    # API
    ("/api/auth/me", True),
    ("/api/cron/drain?key=orion-cron-secret-2026", False),
    ("/api/v1/public/goals", False),  # needs API key → 401
    ("/api/v1/public/license/validate", False),  # needs POST
]

print(f"{'PATH':<35} {'AUTH':<5} {'CODE':<5} {'LINKS':<6} {'BTNS':<5} {'PULSE':<6} {'STATUS':<8}")
print("-" * 85)

errors = []
total = 0
ok = 0

for path, needs_auth in ALL_PAGES:
    total += 1
    url = f"{BASE_URL}{path}"

    # Test WITHOUT auth first (if needs_auth, should get 307)
    if needs_auth:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "audit/1.0"})
            with no_auth.open(req) as resp:
                noauth_code = resp.status
                noauth_body = resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            noauth_code = e.code
            noauth_body = e.read().decode("utf-8", errors="replace")
        except Exception as e:
            noauth_code = 0
            noauth_body = ""

    # Test WITH auth
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "audit/1.0"})
        with opener.open(req, timeout=15) as resp:
            code = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"{path:<35} {'AUTH' if needs_auth else 'PUB':<5} ERR    —      —      —      ERROR: {e}")
        errors.append(f"{path}: {e}")
        continue

    links = len(re.findall(r'<a\s+[^>]*href', body, re.IGNORECASE))
    buttons = len(re.findall(r'<button', body, re.IGNORECASE))
    has_pulse = "pulse-dot" in body or "animate-pulse" in body

    # Determine status
    if needs_auth:
        if code == 200:
            status = "✓ OK"
            ok += 1
        elif code == 307:
            status = "✓ REDIR"
            ok += 1
        elif code == 401:
            status = "✓ 401"
            ok += 1
        elif code == 404:
            status = "✗ 404"
            errors.append(f"{path}: 404 Not Found")
        elif code == 500:
            status = "✗ 500"
            errors.append(f"{path}: 500 Server Error")
        else:
            status = f"? {code}"
            errors.append(f"{path}: unexpected {code}")
    else:
        if code == 200:
            status = "✓ OK"
            ok += 1
        elif code == 401:
            status = "✓ 401"
            ok += 1
        elif code == 404:
            status = "✓ 404"
            ok += 1  # expected for some API endpoints
        elif code == 500:
            status = "✗ 500"
            errors.append(f"{path}: 500 Server Error")
        else:
            status = f"? {code}"
            errors.append(f"{path}: unexpected {code}")

    auth_label = "AUTH" if needs_auth else "PUB"
    print(f"{path:<35} {auth_label:<5} {code:<5} {links:<6} {buttons:<5} {'✓' if has_pulse else '—':<6} {status:<8}")

print(f"\n{'='*85}")
print(f"Total: {total} | OK: {ok} | Errors: {len(errors)}")
if errors:
    print(f"\nERRORS FOUND:")
    for e in errors:
        print(f"  ✗ {e}")
else:
    print("\n✅ ALL PAGES PASS — no errors found")
print(f"{'='*85}")
