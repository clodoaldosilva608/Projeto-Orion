#!/usr/bin/env python3
"""
Pague Menos — Teste de Funcionalidade e Login
Baseado na tarefa do Manus: "Teste de Funcionalidade e Login no Sistema Pague Menos"

Testa:
1. Página de login carrega corretamente
2. Login com credenciais admin funciona
3. Redirect para /dashboard após login
4. Páginas principais carregam após login
5. Logout funciona
6. Página /produtos mostra o Pague Menos
7. Página /deployments mostra o deploy do Pague Menos
8. Login com credenciais inválidas rejeita
9. Sessão persiste após login
10. Acesso a página protegida sem login redireciona
"""
import urllib.parse
import urllib.request
import urllib.error
import http.cookiejar
import re

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def http_error_307(self, *a): return None
    def http_error_302(self, *a): return None
    def http_error_301(self, *a): return None
    def http_error_303(self, *a): return None

def fetch(url, cookies=None, no_redirect=False):
    if cookies is None:
        cookies = http.cookiejar.CookieJar()
    handlers = [urllib.request.HTTPCookieProcessor(cookies)]
    if no_redirect:
        handlers.append(NoRedirect())
    opener = urllib.request.build_opener(*handlers)
    req = urllib.request.Request(url, headers={"User-Agent": "paguemenos-test/1.0"})
    try:
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers), cookies
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers), cookies

def post_form(url, data, cookies=None, no_redirect=False):
    if cookies is None:
        cookies = http.cookiejar.CookieJar()
    handlers = [urllib.request.HTTPCookieProcessor(cookies)]
    if no_redirect:
        handlers.append(NoRedirect())
    opener = urllib.request.build_opener(*handlers)
    form = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=form, method="POST",
        headers={"User-Agent": "paguemenos-test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
    try:
        with opener.open(req) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace"), dict(resp.headers), cookies
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="replace"), dict(e.headers), cookies

print("=" * 70)
print("PAGUE MENOS — TESTE DE FUNCIONALIDADE E LOGIN")
print("=" * 70)

issues = []

# 1. Página de login carrega
print("\n1. Página de login carrega corretamente")
code, body, _, _ = fetch(f"{BASE_URL}/login")
print(f"   GET /login → {code}")
if code == 200 and "Acessar" in body:
    print("   ✓ Login page loaded with form")
else:
    issues.append("Login page didn't load or form not found")

# 2. Login com credenciais admin
print("\n2. Login com credenciais admin")
code, body, headers, cookies = post_form(
    f"{BASE_URL}/api/auth/login",
    {"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"},
    no_redirect=True,
)
location = headers.get("location", headers.get("Location", ""))
print(f"   POST /api/auth/login → {code}")
print(f"   Location: {location[:80]}")
if code == 303 and "/dashboard" in location:
    print("   ✓ Login redirect to /dashboard")
else:
    issues.append(f"Login failed: {code} location={location}")

# 3. Acesso a /dashboard após login
print("\n3. Acesso a /dashboard após login")
code, body, _, _ = fetch(f"{BASE_URL}/dashboard", cookies=cookies)
print(f"   GET /dashboard → {code}")
if code == 200 and ("Dashboard" in body or "ORION" in body):
    print("   ✓ Dashboard accessible after login")
else:
    issues.append(f"Dashboard not accessible: {code}")

# 4. Páginas principais carregam
print("\n4. Páginas principais carregam após login")
main_pages = ["/metas", "/indicadores", "/resultados", "/campanhas", "/fabrica", "/fabrica/projetos"]
for page in main_pages:
    code, body, _, _ = fetch(f"{BASE_URL}{page}", cookies=cookies)
    status = "✓" if code == 200 else "✗"
    print(f"   {status} {page} → {code}")
    if code != 200:
        issues.append(f"{page} returned {code}")

# 5. Página /produtos mostra Pague Menos
print("\n5. Página /produtos mostra o Pague Menos")
code, body, _, _ = fetch(f"{BASE_URL}/produtos", cookies=cookies)
print(f"   GET /produtos → {code}")
if code == 200 and ("PagueMenos" in body or "Pague Menos" in body or "paguemenos" in body.lower()):
    print("   ✓ Pague Menos found in produtos page")
else:
    issues.append("Pague Menos not found in produtos page")

# 6. Página /deployments mostra deploy do Pague Menos
print("\n6. Página /deployments mostra deploy do Pague Menos")
code, body, _, _ = fetch(f"{BASE_URL}/deployments", cookies=cookies)
print(f"   GET /deployments → {code}")
if code == 200 and ("PagueMenos" in body or "pague" in body.lower()):
    print("   ✓ Pague Menos deploy found")
else:
    issues.append("Pague Menos deploy not found")

# 7. Login com credenciais inválidas rejeita
print("\n7. Login com credenciais inválidas rejeita")
code, body, headers, _ = post_form(
    f"{BASE_URL}/api/auth/login",
    {"email": "invalid@test.com", "password": "wrong", "redirect": "/dashboard"},
    no_redirect=True,
)
location = headers.get("location", headers.get("Location", ""))
print(f"   POST /api/auth/login (invalid) → {code}")
print(f"   Location: {location[:80]}")
if code == 303 and "/login" in location and "error" in location:
    print("   ✓ Invalid login correctly rejected")
else:
    issues.append(f"Invalid login not rejected: {code} location={location}")

# 8. Acesso a página protegida sem login redireciona
print("\n8. Acesso a página protegida sem login redireciona")
code, body, headers, _ = fetch(f"{BASE_URL}/dashboard", no_redirect=True)
location = headers.get("location", headers.get("Location", ""))
print(f"   GET /dashboard (no auth) → {code}")
print(f"   Location: {location[:80]}")
if code == 307 and "/login" in location:
    print("   ✓ Correctly redirected to /login")
else:
    issues.append(f"Protected page not redirected: {code}")

# 9. Logout funciona
print("\n9. Logout funciona")
code, body, headers, _ = fetch(f"{BASE_URL}/api/auth/logout", cookies=cookies, no_redirect=True)
print(f"   GET /api/auth/logout → {code}")
# After logout, dashboard should redirect to login
code, body, headers, _ = fetch(f"{BASE_URL}/dashboard", cookies=cookies, no_redirect=True)
location = headers.get("location", headers.get("Location", ""))
print(f"   GET /dashboard (after logout) → {code}")
if code == 307 and "/login" in location:
    print("   ✓ Logout successful — dashboard now redirects to login")
else:
    issues.append(f"Logout didn't work: {code} location={location}")

# 10. 2FA page exists
print("\n10. Página /login/2fa existe")
code, body, _, _ = fetch(f"{BASE_URL}/login/2fa")
print(f"   GET /login/2fa → {code}")
if code == 200 and ("Verificação" in body or "2FA" in body or "6" in body):
    print("   ✓ 2FA page loaded")
else:
    issues.append("2FA page not loaded correctly")

# Summary
print("\n" + "=" * 70)
print("RESUMO DO TESTE")
print("=" * 70)
if not issues:
    print("✅ TODOS OS TESTES PASSARAM — Sistema Pague Menos funcionando corretamente")
else:
    print(f"⚠ {len(issues)} issue(s) encontrada(s):")
    for i, issue in enumerate(issues, 1):
        print(f"   {i}. {issue}")
print("=" * 70)
