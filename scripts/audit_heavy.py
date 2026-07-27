#!/usr/bin/env python3
"""Check for 500 errors on data-heavy pages + verify content."""
import re, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except: pass

# Pages that do heavy DB queries — most likely to 500
HEAVY_PAGES = [
    ("/fabrica", ["Fábrica", "Pipeline", "PLATAFORMA"]),
    ("/fabrica/projetos", ["Projetos"]),
    ("/fabrica/briefings", ["Briefing"]),
    ("/fabrica/templates", ["Templates", "E-commerce"]),
    ("/fabrica/licencas", ["Licen"]),
    ("/superadmin", ["Super Admin", "PagueMenos"]),
    ("/dashboard", ["Dashboard"]),
    ("/gamificacao", ["Gamifica", "nvel", "Nivel"]),
    ("/campanhas", ["Campanha"]),
    ("/calendario", ["Calend"]),
    ("/checklist", ["Checklist"]),
    ("/feedback", ["Feedback"]),
    ("/plugins", ["Marketplace", "Plugin"]),
    ("/configuracoes", ["Configura"]),
    ("/backups", ["Backup"]),
    ("/notificacoes", ["Notifica"]),
]

print(f"{'PAGE':<25} {'CODE':<5} {'SIZE':<8} {'CONTENT'}")
print("-" * 70)
errors = []
for path, keywords in HEAVY_PAGES:
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}", headers={"User-Agent": "test/1.0"})
        with opener.open(req, timeout=20) as resp:
            code = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"{path:<25} ERR: {e}")
        errors.append(f"{path}: {e}")
        continue

    size = len(body)
    # Check if any keyword is in body (case insensitive, handle HTML entities)
    body_lower = body.lower()
    found_kw = any(kw.lower() in body_lower for kw in keywords)
    
    if code == 500:
        status = "✗ 500 ERROR"
        errors.append(f"{path}: 500 Server Error")
    elif code == 200 and found_kw:
        status = "✓ OK"
    elif code == 200 and not found_kw:
        status = "⚠ no keywords"
        errors.append(f"{path}: 200 but keywords {keywords} not found")
    else:
        status = f"? {code}"
        errors.append(f"{path}: unexpected {code}")
    
    print(f"{path:<25} {code:<5} {size:<8} {status}")

print(f"\n{'✅ ALL OK' if not errors else '⚠ '+str(len(errors))+' ISSUES'}")
for e in errors: print(f"  {e}")
