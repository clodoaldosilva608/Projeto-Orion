#!/usr/bin/env python3
"""Mini audit — only first 20 pages."""
import re, sys, urllib.parse, urllib.request, urllib.error, http.cookiejar

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

PAGES = [
    ("/", ["ORION"], False),
    ("/login", ["Acessar"], False),
    ("/login/2fa", ["Verificação"], False),
    ("/produtos", ["PagueMenos"], False),
    ("/deployments", ["Deploy"], False),
    ("/dashboard", ["Dashboard"], True),
    ("/metas", ["Metas"], True),
    ("/indicadores", ["Indicadores"], True),
    ("/resultados", ["Resultado"], True),
    ("/aprovacoes", ["Aprov"], True),
    ("/ranking", ["Ranking"], True),
    ("/campanhas", ["Campanha"], True),
    ("/campanhas/nova", ["Nova Campanha"], True),
    ("/gamificacao", ["Gamificação"], True),
    ("/gamificacao/leaderboard", ["Ranking"], True),
    ("/gamificacao/conquistas", ["Conquistas"], True),
    ("/gamificacao/resgates", ["Resgates"], True),
    ("/calendario", ["Calendário"], True),
    ("/calendario/nova", ["Novo Evento"], True),
    ("/checklist", ["Checklist"], True),
]

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "audit/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except: pass
print("✓ logged in\n")

print(f"{'PATH':<28} {'CODE':<5} {'LINKS':<6} {'BTNS':<5} {'PULSE':<6} {'FADE':<5} {'SIDE':<5} {'KW':<4}")
print("-" * 80)

for path, keywords, _ in PAGES:
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
        continue

    links = len(re.findall(r'<a\s+[^>]*href', body, re.IGNORECASE))
    buttons = len(re.findall(r'<button', body, re.IGNORECASE))
    has_pulse = "pulse-dot" in body or "animate-pulse" in body
    has_fade = "fade-in-up" in body
    has_side = "aside" in body.lower() and "ORION" in body and not path.startswith("/tv")
    kw_ok = any(k.lower() in body.lower() for k in keywords) if code == 200 else False
    side = "—" if path.startswith("/tv") else ("✓" if has_side else "✗")
    print(f"{path:<28} {code:<5} {links:<6} {buttons:<5} {'✓' if has_pulse else '—':<6} {'✓' if has_fade else '—':<5} {side:<5} {'✓' if kw_ok else '✗':<4}")

print("\n✅ batch 1 done")
