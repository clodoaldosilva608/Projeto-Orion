#!/usr/bin/env python3
"""Audit batch 1 — public + fabrica pages."""
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
    ("/", "PUB"),
    ("/login", "PUB"),
    ("/login/2fa", "PUB"),
    ("/produtos", "PUB"),
    ("/deployments", "PUB"),
    ("/dashboard", "AUTH"),
    ("/fabrica", "AUTH"),
    ("/fabrica/projetos", "AUTH"),
    ("/fabrica/briefings", "AUTH"),
    ("/fabrica/briefings/novo", "AUTH"),
    ("/fabrica/templates", "AUTH"),
    ("/fabrica/licencas", "AUTH"),
    ("/superadmin", "AUTH"),
    ("/tv", "AUTH"),
    ("/tv/ranking", "AUTH"),
    ("/tv/campanhas", "AUTH"),
]

print(f"{'PATH':<30} {'TYPE':<5} {'CODE':<5} {'LINKS':<6} {'BTNS':<5} {'STATUS'}")
print("-" * 70)
errors = []
for path, ptype in PAGES:
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}", headers={"User-Agent": "audit/1.0"})
        with opener.open(req, timeout=15) as resp:
            code = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"{path:<30} {ptype:<5} ERR: {e}")
        errors.append(f"{path}: {e}")
        continue
    links = len(re.findall(r'<a\s+[^>]*href', body, re.IGNORECASE))
    buttons = len(re.findall(r'<button', body, re.IGNORECASE))
    status = "✓" if code in (200, 307, 401) else f"✗ {code}"
    if code == 500: errors.append(f"{path}: 500")
    elif code == 404 and ptype == "AUTH": errors.append(f"{path}: 404")
    print(f"{path:<30} {ptype:<5} {code:<5} {links:<6} {buttons:<5} {status}")

print(f"\n{'✅ ALL OK' if not errors else '⚠ '+str(len(errors))+' ERRORS'}")
for e in errors: print(f"  ✗ {e}")
