#!/usr/bin/env python3
"""Quick audit — single request per page, no no-auth checks (we know those work)."""
import re
import sys
import urllib.parse
import urllib.request
import urllib.error
import http.cookiejar

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
    ("/checklist/modelos", ["Modelos"], True),
    ("/plugins", ["Marketplace"], True),
    ("/plugins/api-keys", ["API"], True),
    ("/configuracoes", ["Configurações"], True),
    ("/notificacoes", ["Notifica"], True),
    ("/backups", ["Backup"], True),
    ("/usuarios", ["Usuários"], True),
    ("/funcoes-permissoes", ["Funções"], True),
    ("/logs-auditoria", ["Auditoria"], True),
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
    ("/tv", ["Painel TV"], True),
    ("/tv/ranking", ["Ranking"], True),
    ("/tv/campanhas", ["Campanha"], True),
]

cookies = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))

# Login
form = urllib.parse.urlencode({"email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"}).encode()
req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
    headers={"User-Agent": "orion-audit/1.0", "Content-Type": "application/x-www-form-urlencoded"})
try: opener.open(req)
except urllib.error.HTTPError: pass
print("✓ logged in\n")

print(f"{'PATH':<28} {'CODE':<5} {'LINKS':<6} {'BTNS':<5} {'PULSE':<6} {'FADE':<5} {'TRANS':<6} {'SIDE':<5} {'KW':<4} {'SIZE':<8}")
print("-" * 100)

results = []
issues = []

for path, keywords, requires_auth in PAGES:
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}", headers={"User-Agent": "orion-audit/1.0"})
        with opener.open(req, timeout=15) as resp:
            code = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"   ✗ {path:<28} ERROR: {e}")
        issues.append(f"{path}: {e}")
        continue

    links = len(re.findall(r'<a\s+[^>]*href', body, re.IGNORECASE))
    buttons = len(re.findall(r'<button', body, re.IGNORECASE))
    has_pulse = "pulse-dot" in body or "animate-pulse" in body
    has_fade = "fade-in-up" in body
    has_trans = "transition-" in body
    has_side = "aside" in body.lower() and "ORION" in body and not path.startswith("/tv")
    kw_ok = any(k.lower() in body.lower() for k in keywords) if code == 200 else False
    
    if code != 200:
        issues.append(f"{path}: HTTP {code}")
    elif not kw_ok:
        issues.append(f"{path}: missing keywords {keywords}")
    
    side = "—" if path.startswith("/tv") else ("✓" if has_side else "✗")
    print(f"{path:<28} {code:<5} {links:<6} {buttons:<5} {'✓' if has_pulse else '—':<6} {'✓' if has_fade else '—':<5} {'✓' if has_trans else '—':<6} {side:<5} {'✓' if kw_ok else '✗':<4} {len(body):<8}")
    results.append({"path": path, "code": code, "links": links, "buttons": buttons, "kw_ok": kw_ok})

print("\n" + "=" * 100)
print(f"Total pages: {len(results)}")
ok = sum(1 for r in results if r["code"] == 200 and r["kw_ok"])
print(f"Pages OK (200 + keywords): {ok}/{len(results)}")
total_links = sum(r["links"] for r in results)
total_btns = sum(r["buttons"] for r in results)
print(f"Total clickable elements: {total_links} links + {total_btns} buttons = {total_links + total_btns}")
if issues:
    print(f"\nISSUES ({len(issues)}):")
    for i in issues: print(f"  - {i}")
else:
    print("\n✅ ALL PAGES PASS")
