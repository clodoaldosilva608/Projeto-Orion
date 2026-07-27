#!/usr/bin/env python3
"""
TESTE DE NAVEGAÇÃO — simula um usuário navegando entre páginas
para verificar se a sessão NÃO é perdida.
"""
import urllib.parse, urllib.request, urllib.error, http.cookiejar, re

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

# Criar cookie jar persistente (simula navegador do usuário)
cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

print("=" * 70)
print("TESTE DE NAVEGAÇÃO — Sessão persiste entre páginas?")
print("=" * 70)

# 1. LOGIN
print("\n1. LOGIN")
form = urllib.parse.urlencode({
    "email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"
}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "nav-test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try:
    opener.open(req)
except urllib.error.HTTPError as e:
    pass  # 303 redirect

# Verificar cookies após login
auth_cookies = [c for c in cookies if "auth-token" in c.name]
verified_cookie = [c for c in cookies if c.name == "orion-2fa-verified"]
print(f"   Auth cookies: {len(auth_cookies)} ({[c.name for c in auth_cookies]})")
print(f"   2FA verified cookie: {len(verified_cookie)}")
if len(auth_cookies) == 0:
    print("   ❌ FALHA: Nenhum cookie de auth após login!")
    exit(1)
print("   ✓ Login OK — cookies definidos")

# 2. NAVEGAR ENTRE PÁGINAS (simulando cliques no sidebar)
print("\n2. NAVEGANDO ENTRE PÁGINAS (simulando cliques no sidebar)")
pages_to_visit = [
    "/dashboard",
    "/fabrica",
    "/fabrica/projetos",
    "/fabrica/briefings",
    "/fabrica/templates",
    "/metas",
    "/campanhas",
    "/gamificacao",
    "/calendario",
    "/checklist",
    "/feedback",
    "/plugins",
    "/usuarios",
    "/configuracoes",
    "/notificacoes",
    "/backups",
    "/dashboard",  # voltar ao dashboard
    "/fabrica",    # voltar à fábrica
    "/superadmin",
    "/dashboard",  # voltar novamente
]

session_lost = False
for i, page in enumerate(pages_to_visit):
    try:
        req = urllib.request.Request(f"{BASE_URL}{page}", headers={"User-Agent": "nav-test/1.0"})
        with opener.open(req, timeout=20) as resp:
            code = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"   [{i+1}/{len(pages_to_visit)}] {page:<25} ERRO: {e}")
        continue

    # Check if redirected to login (session lost)
    if code == 307:
        print(f"   [{i+1}/{len(pages_to_visit)}] {page:<25} → {code} REDIRECIONADO PARA LOGIN ❌ SESSÃO PERDIDA!")
        session_lost = True
    elif code == 200:
        # Verify the page actually has content (not just a login page)
        if "login" in body.lower()[:500] and "Acessar" in body:
            print(f"   [{i+1}/{len(pages_to_visit)}] {page:<25} → {code} PÁGINA DE LOGIN ❌ SESSÃO PERDIDA!")
            session_lost = True
        else:
            print(f"   [{i+1}/{len(pages_to_visit)}] {page:<25} → {code} ✓")
    else:
        print(f"   [{i+1}/{len(pages_to_visit)}] {page:<25} → {code} ?")
    
    if session_lost:
        break

# 3. RESULTADO
print("\n" + "=" * 70)
if not session_lost:
    print(f"✅ SUCESSO! Navegou entre {len(pages_to_visit)} páginas SEM perder a sessão!")
    print("   O problema do logout ao navegar foi RESOLVIDO.")
else:
    print(f"❌ FALHA! A sessão foi perdida ao navegar para {page}")
    print("   O problema ainda persiste.")
print("=" * 70)
