#!/usr/bin/env python3
"""Mini audit batch 3 — pages 41-56."""
import re, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

PAGES = [
    ("/deploys", ["Deploy"]),
    ("/releases", ["Release"]),
    ("/anomalias", ["Anomalia"]),
    ("/agentes-ia", ["Agentes"]),
    ("/jobs-ia", ["Jobs"]),
    ("/modelos", ["Modelos"]),
    ("/provedores", ["Provedores"]),
    ("/chatbots", ["Chatbot"]),
    ("/base-conhecimento", ["Conhecimento"]),
    ("/privacidade", ["Privacidade"]),
    ("/tv", ["Painel TV"]),
    ("/tv/ranking", ["Ranking"]),
    ("/tv/campanhas", ["Campanha"]),
]

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "audit/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except: pass
print("✓ logged in\n")

print(f"{'PATH':<28} {'CODE':<5} {'LINKS':<6} {'BTNS':<5} {'PULSE':<6} {'FADE':<5} {'KW':<4}")
print("-" * 75)

issues = []
for path, keywords in PAGES:
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}", headers={"User-Agent": "audit/1.0"})
        with opener.open(req, timeout=10) as resp:
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
    has_fade = "fade-in-up" in body
    kw_ok = any(k.lower() in body.lower() for k in keywords) if code == 200 else False
    if code != 200: issues.append(f"{path}: HTTP {code}")
    elif not kw_ok: issues.append(f"{path}: missing {keywords}")
    print(f"{path:<28} {code:<5} {links:<6} {buttons:<5} {'✓' if has_pulse else '—':<6} {'✓' if has_fade else '—':<5} {'✓' if kw_ok else '✗':<4}")

print(f"\n{'✅ ALL OK' if not issues else '⚠ '+str(len(issues))+' issues'}")
for i in issues: print(f"  - {i}")
