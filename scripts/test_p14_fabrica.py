#!/usr/bin/env python3
"""Quick smoke test for P14 — Fábrica de Software pivot."""
import re, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "p14/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except: pass
print("✓ logged in\n")

PAGES = [
    ("/", ["PLATAFORMA INTELIGENTE", "DESENVOLVIMENTO"]),
    ("/fabrica", ["Fábrica", "Pipeline"]),
    ("/fabrica/projetos", ["Projetos"]),
    ("/fabrica/briefings", ["Briefing", "IA"]),
    ("/fabrica/templates", ["Templates", "E-commerce"]),
    # Existing modules still work
    ("/dashboard", ["Dashboard"]),
    ("/metas", ["Metas"]),
    ("/campanhas", ["Campanha"]),
    ("/gamificacao", ["Gamificação"]),
    ("/feedback", ["Feedback"]),
    ("/plugins", ["Marketplace"]),
]

print(f"{'PATH':<28} {'CODE':<5} {'LINKS':<6} {'BTNS':<5} {'PULSE':<6} {'KW':<4}")
print("-" * 75)

issues = []
for path, keywords in PAGES:
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}", headers={"User-Agent": "p14/1.0"})
        with opener.open(req, timeout=15) as resp:
            code = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"{path:<28} ERROR: {e}")
        issues.append(f"{path}: {e}")
        continue

    links = len(re.findall(r'<a\s+[^>]*href', body, re.IGNORECASE))
    buttons = len(re.findall(r'<button', body, re.IGNORECASE))
    has_pulse = "pulse-dot" in body or "animate-pulse" in body
    kw_ok = any(k.lower() in body for k in keywords) if code == 200 else False
    if code != 200: issues.append(f"{path}: HTTP {code}")
    elif not kw_ok: issues.append(f"{path}: missing {keywords}")
    print(f"{path:<28} {code:<5} {links:<6} {buttons:<5} {'✓' if has_pulse else '—':<6} {'✓' if kw_ok else '✗':<4}")

print(f"\n{'✅ ALL OK' if not issues else '⚠ '+str(len(issues))+' issues'}")
for i in issues: print(f"  - {i}")
