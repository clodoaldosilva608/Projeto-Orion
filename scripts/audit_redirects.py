#!/usr/bin/env python3
"""Test redirects — every protected page should redirect to /login without auth."""
import urllib.request, urllib.error

BASE_URL = "https://orion-saas-phi.vercel.app"

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def http_error_307(self, *a): return None
    def http_error_302(self, *a): return None
    def http_error_301(self, *a): return None
    def http_error_303(self, *a): return None

opener = urllib.request.build_opener(NoRedirect())

PROTECTED = [
    "/dashboard", "/fabrica", "/fabrica/projetos", "/fabrica/briefings",
    "/fabrica/templates", "/fabrica/licencas", "/superadmin",
    "/metas", "/indicadores", "/resultados", "/aprovacoes", "/ranking",
    "/campanhas", "/gamificacao", "/calendario", "/checklist", "/feedback",
    "/plugins", "/plugins/api-keys", "/usuarios", "/configuracoes",
    "/notificacoes", "/backups", "/logs-auditoria",
    "/clientes", "/licencas", "/pagamentos", "/assinaturas", "/planos",
    "/tv", "/tv/ranking", "/tv/campanhas",
]

print(f"{'PATH':<30} {'CODE':<5} {'REDIRECT':<50} {'STATUS'}")
print("-" * 90)
errors = []
for path in PROTECTED:
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}", headers={"User-Agent": "redirect-test/1.0"})
        with opener.open(req) as resp:
            code = resp.status
            location = resp.headers.get("location", "")
    except urllib.error.HTTPError as e:
        code = e.code
        location = e.headers.get("location", "")
    except Exception as e:
        print(f"{path:<30} ERR: {e}")
        errors.append(f"{path}: {e}")
        continue

    if code == 307 and "/login" in location:
        status = "✓"
    elif code == 307 and "/login/2fa" in location:
        status = "✓ (2fa)"
    elif code == 200:
        status = "✗ NO REDIRECT"
        errors.append(f"{path}: should redirect but got 200")
    else:
        status = f"? {code}"
        errors.append(f"{path}: unexpected {code}")

    print(f"{path:<30} {code:<5} {location[:50]:<50} {status}")

print(f"\n{'✅ ALL REDIRECTS OK' if not errors else '⚠ '+str(len(errors))+' ERRORS'}")
for e in errors: print(f"  ✗ {e}")
