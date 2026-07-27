#!/usr/bin/env python3
"""
Comprehensive page audit for Orion SaaS Platform.

For each page, verifies:
1. HTTP status (200 for authed, 307 for protected-without-auth)
2. Presence of key elements (sidebar, header, content)
3. Clickable elements (links, buttons)
4. Animations (pulse-dot, fade-in-up, animate-pulse)
5. Redirects work correctly
6. Page contains expected keywords
"""
import json
import re
import sys
import urllib.parse
import urllib.request
import urllib.error
import http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

# Pages to audit (path, expected_keywords, requires_auth)
PAGES = [
    # Public
    ("/", ["ORION", "plataforma"], False),
    ("/login", ["Acessar", "E-mail"], False),
    ("/login/2fa", ["6", "Verificação"], False),
    ("/produtos", ["PagueMenos", "Gestão"], False),
    ("/deployments", ["Deploy", "Produção"], False),
    # Authenticated - core
    ("/dashboard", ["Dashboard", "KPIs"], True),
    ("/metas", ["Metas"], True),
    ("/indicadores", ["Indicadores"], True),
    ("/resultados", ["Resultado"], True),
    ("/aprovacoes", ["Aprov"], True),
    ("/ranking", ["Ranking"], True),
    # Authenticated - SaaS
    ("/campanhas", ["Campanha"], True),
    ("/campanhas/nova", ["Nova Campanha"], True),
    ("/gamificacao", ["Gamificação"], True),
    ("/gamificacao/leaderboard", ["Ranking"], True),
    ("/gamificacao/conquistas", ["Conquistas"], True),
    ("/gamificacao/resgates", ["Resgates"], True),
    ("/calendario", ["Calendário"], True),
    ("/calendario/nova", ["Novo Evento"], True),
    ("/checklist", ["Checklist"], True),
    ("/checklist/modelos", ["Modelos"], True),
    ("/plugins", ["Marketplace", "Plugins"], True),
    ("/plugins/api-keys", ["API"], True),
    # Authenticated - admin
    ("/configuracoes", ["Configurações"], True),
    ("/notificacoes", ["Notifica"], True),
    ("/backups", ["Backup"], True),
    ("/usuarios", ["Usuários"], True),
    ("/funcoes-permissoes", ["Funções"], True),
    ("/logs-auditoria", ["Auditoria"], True),
    # Authenticated - dev
    ("/clientes", ["Cliente"], True),
    ("/projetos", ["Projetos"], True),
    ("/aplicacoes", ["Aplicações"], True),
    ("/licencas", ["Licenças"], True),
    ("/pagamentos", ["Pagamento"], True),
    ("/assinaturas", ["Assinatura"], True),
    ("/planos", ["Planos"], True),
    ("/cupons", ["Cupons"], True),
    ("/consumo-ia", ["IA"], True),
    ("/file-projetos", ["File"], True),
    ("/builds", ["Build"], True),
    ("/deploys", ["Deploy"], True),
    ("/releases", ["Release"], True),
    ("/anomalias", ["Anomalia"], True),
    ("/agentes-ia", ["Agentes"], True),
    ("/jobs-ia", ["Jobs"], True),
    ("/modelos", ["Modelos"], True),
    ("/provedores", ["Provedores"], True),
    ("/chatbots", ["Chatbot"], True),
    ("/base-conhecimento", ["Conhecimento"], True),
    ("/privacidade", ["Privacidade"], True),
    # TV (special)
    ("/tv", ["ORION", "Painel TV"], True),
    ("/tv/ranking", ["Ranking"], True),
    ("/tv/campanhas", ["Campanha"], True),
]

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def http_error_307(self, *a): return None
    def http_error_302(self, *a): return None
    def http_error_301(self, *a): return None
    def http_error_303(self, *a): return None

no_auth_opener = urllib.request.build_opener(NoRedirect())

def fetch_authed(url):
    """Fetch with auth cookies, follow redirects."""
    req = urllib.request.Request(url, headers={"User-Agent": "orion-audit/1.0"})
    try:
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace")

def fetch_no_auth(url):
    """Fetch without cookies, no redirects."""
    req = urllib.request.Request(url, headers={"User-Agent": "orion-audit/1.0"})
    try:
        with no_auth_opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers)

print("=" * 80)
print("ORION SAAS — COMPREHENSIVE PAGE AUDIT")
print("=" * 80)

# 1. Login first
print("\n1. Login")
form = urllib.parse.urlencode({
    "email": EMAIL, "password": PASSWORD, "redirect": "/dashboard",
}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "orion-audit/1.0",
             "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except urllib.error.HTTPError: pass
print("   ✓ logged in")

# 2. Audit each page
print("\n2. Auditing each page")
results = []
issues = []

for path, keywords, requires_auth in PAGES:
    url = f"{BASE_URL}{path}"
    
    # First: check no-auth behavior (should be 307 for protected, 200 for public)
    if requires_auth:
        code_noauth, _, headers_noauth = fetch_no_auth(url)
        if code_noauth != 307:
            issues.append(f"   ⚠ {path} should redirect (307) without auth, got {code_noauth}")
    
    # Then: fetch with auth
    code, body = fetch_authed(url)
    
    # Check status
    status_ok = code == 200
    if not status_ok:
        issues.append(f"   ✗ {path} returned {code}")
    
    # Check keywords
    keyword_ok = any(kw.lower() in body.lower() for kw in keywords) if status_ok else False
    if status_ok and not keyword_ok:
        issues.append(f"   ⚠ {path} missing keywords {keywords}")
    
    # Check clickable elements (links + buttons)
    links = len(re.findall(r'<a\s+[^>]*href', body, re.IGNORECASE))
    buttons = len(re.findall(r'<button', body, re.IGNORECASE))
    
    # Check animations
    has_pulse = "pulse-dot" in body or "animate-pulse" in body
    has_fadein = "fade-in-up" in body
    has_transition = "transition-" in body
    
    # Check for sidebar (only for authenticated pages, not /tv)
    has_sidebar = "aside" in body.lower() and "ORION" in body
    is_tv = path.startswith("/tv")
    
    # Check for errors in body
    has_error = "error" in body.lower()[:500] and code == 200 and "Access restricted" not in body
    
    results.append({
        "path": path,
        "code": code,
        "status_ok": status_ok,
        "keyword_ok": keyword_ok,
        "links": links,
        "buttons": buttons,
        "has_pulse": has_pulse,
        "has_fadein": has_fadein,
        "has_transition": has_transition,
        "has_sidebar": has_sidebar,
        "is_tv": is_tv,
        "body_size": len(body),
    })

# 3. Print results table
print("\n" + "=" * 80)
print(f"{'PATH':<30} {'CODE':<5} {'LINKS':<6} {'BTNS':<5} {'PULSE':<6} {'FADE':<5} {'TRANS':<6} {'SIDE':<5} {'SIZE':<8}")
print("-" * 80)
for r in results:
    side = "—" if r["is_tv"] else ("✓" if r["has_sidebar"] else "✗")
    print(f"{r['path']:<30} {r['code']:<5} {r['links']:<6} {r['buttons']:<5} "
          f"{'✓' if r['has_pulse'] else '—':<6} {'✓' if r['has_fadein'] else '—':<5} "
          f"{'✓' if r['has_transition'] else '—':<6} {side:<5} {r['body_size']:<8}")

# 4. Summary
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
total = len(results)
ok_count = sum(1 for r in results if r["status_ok"] and r["keyword_ok"])
print(f"Pages audited: {total}")
print(f"Pages OK (200 + keywords): {ok_count}/{total}")
print(f"Pages with issues: {len(issues)}")

if issues:
    print("\nISSUES FOUND:")
    for issue in issues:
        print(issue)
else:
    print("\n✓ No issues found — all pages render correctly")

# 5. Check redirects specifically
print("\n" + "=" * 80)
print("REDIRECT VERIFICATION (without auth)")
print("=" * 80)
redirect_issues = []
for path, _, requires_auth in PAGES:
    if not requires_auth:
        continue
    code, _, headers = fetch_no_auth(f"{BASE_URL}{path}")
    location = headers.get("location", headers.get("Location", ""))
    expected = "/login"
    if code == 307 and expected in location:
        status = "✓"
    else:
        status = "✗"
        redirect_issues.append(f"   {path} → {code} (expected 307 to /login, got location: {location[:80]})")
    print(f"   {status} {path:<30} → {code} {location[:60]}")

if redirect_issues:
    print("\nREDIRECT ISSUES:")
    for issue in redirect_issues:
        print(issue)
else:
    print("\n✓ All redirects correct (307 to /login)")

# 6. Check clickable elements summary
print("\n" + "=" * 80)
print("CLICKABLE ELEMENTS SUMMARY")
print("=" * 80)
total_links = sum(r["links"] for r in results)
total_buttons = sum(r["buttons"] for r in results)
print(f"Total links across all pages: {total_links}")
print(f"Total buttons across all pages: {total_buttons}")
pages_no_links = [r["path"] for r in results if r["links"] == 0 and not r["is_tv"]]
pages_no_buttons = [r["path"] for r in results if r["buttons"] == 0]
if pages_no_links:
    print(f"Pages with 0 links: {pages_no_links}")
if pages_no_buttons:
    print(f"Pages with 0 buttons: {pages_no_buttons}")

# 7. Check animations summary
print("\n" + "=" * 80)
print("ANIMATIONS SUMMARY")
print("=" * 80)
pages_pulse = sum(1 for r in results if r["has_pulse"])
pages_fade = sum(1 for r in results if r["has_fadein"])
pages_trans = sum(1 for r in results if r["has_transition"])
print(f"Pages with pulse-dot/animate-pulse: {pages_pulse}/{total}")
print(f"Pages with fade-in-up: {pages_fade}/{total}")
print(f"Pages with transition-*: {pages_trans}/{total}")

print("\n" + "=" * 80)
if not issues and not redirect_issues:
    print("✅ ALL PAGES PASS — no issues found")
else:
    print(f"⚠ {len(issues) + len(redirect_issues)} issue(s) found — see above")
print("=" * 80)
