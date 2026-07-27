#!/usr/bin/env python3
"""Audit batch 2 — remaining authenticated pages."""
import re, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "audit/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except: pass

PAGES = [
    "/aplicacoes", "/file-projetos", "/builds", "/deploys", "/releases", "/anomalias",
    "/agentes-ia", "/jobs-ia", "/modelos", "/consumo-ia", "/provedores",
    "/plugins", "/plugins/api-keys",
    "/metas", "/indicadores", "/resultados", "/aprovacoes", "/ranking",
    "/campanhas", "/gamificacao", "/gamificacao/leaderboard",
    "/gamificacao/conquistas", "/gamificacao/resgates",
    "/calendario", "/checklist", "/checklist/modelos",
    "/feedback", "/feedback/admin",
    "/clientes", "/licencas", "/pagamentos", "/assinaturas", "/planos", "/cupons",
    "/usuarios", "/funcoes-permissoes", "/notificacoes", "/backups",
    "/configuracoes", "/logs-auditoria", "/privacidade",
    "/workspace/test-token",
    "/api/auth/me",
    "/api/cron/drain?key=orion-cron-secret-2026",
]

print(f"{'PATH':<30} {'CODE':<5} {'LINKS':<6} {'BTNS':<5} {'STATUS'}")
print("-" * 65)
errors = []
for path in PAGES:
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}", headers={"User-Agent": "audit/1.0"})
        with opener.open(req, timeout=15) as resp:
            code = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"{path:<30} ERR: {e}")
        errors.append(f"{path}: {e}")
        continue
    links = len(re.findall(r'<a\s+[^>]*href', body, re.IGNORECASE))
    buttons = len(re.findall(r'<button', body, re.IGNORECASE))
    status = "✓" if code in (200, 401, 404) else f"✗ {code}"
    if code == 500: errors.append(f"{path}: 500 SERVER ERROR")
    print(f"{path:<30} {code:<5} {links:<6} {buttons:<5} {status}")

print(f"\n{'✅ ALL OK' if not errors else '⚠ '+str(len(errors))+' ERRORS'}")
for e in errors: print(f"  ✗ {e}")
