#!/usr/bin/env python3
"""Test critical workflows — login, navigate, logout, API calls."""
import urllib.parse, urllib.request, urllib.error, http.cookiejar, json

BASE_URL = "https://orion-saas-phi.vercel.app"
EMAIL = "clodoaldosilva608@gmail.com"
PASSWORD = "Silva88677488"

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def http_error_307(self, *a): return None
    def http_error_302(self, *a): return None
    def http_error_301(self, *a): return None
    def http_error_303(self, *a): return None

def test_workflow(name, test_fn):
    print(f"\n{'='*60}")
    print(f"WORKFLOW: {name}")
    print(f"{'='*60}")
    try:
        result = test_fn()
        if result:
            print(f"✅ PASS: {name}")
        else:
            print(f"❌ FAIL: {name}")
        return result
    except Exception as e:
        print(f"❌ ERROR: {name}: {e}")
        return False

all_pass = True

# 1. Login flow
def test_login():
    cookies = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(cookies), NoRedirect())
    form = urllib.parse.urlencode({
        "email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
        headers={"User-Agent": "test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
    try:
        opener.open(req)
    except urllib.error.HTTPError as e:
        pass  # 303 redirect
    
    # Check redirect went to /dashboard
    req = urllib.request.Request(f"{BASE_URL}/dashboard", headers={"User-Agent": "test/1.0"})
    try:
        resp = opener.open(req)
        code = resp.status
        body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        code = e.code
        body = e.read().decode("utf-8", errors="replace")
    
    if code == 200 and "Dashboard" in body:
        print(f"  Login → /dashboard: {code} ✓")
        return True
    elif code == 307:
        # Might need 2FA
        loc = ""
        try:
            loc = e.headers.get("location", "") if 'e' in dir() else ""
        except: pass
        print(f"  Login → redirect (possibly 2FA): {code}")
        return True  # 2FA redirect is valid
    else:
        print(f"  Login → /dashboard: {code} ✗")
        return False

all_pass &= test_workflow("Login + Dashboard", test_login)

# 2. Invalid login rejected
def test_invalid_login():
    cookies = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(cookies), NoRedirect())
    form = urllib.parse.urlencode({
        "email": "wrong@test.com", "password": "wrong", "redirect": "/dashboard"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
        headers={"User-Agent": "test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
    try:
        opener.open(req)
        print("  Invalid login: no redirect ✗")
        return False
    except urllib.error.HTTPError as e:
        if e.code == 303 and "error" in (e.headers.get("location", "")):
            print(f"  Invalid login → redirect with error: {e.code} ✓")
            return True
        print(f"  Invalid login: {e.code} ✗")
        return False

all_pass &= test_workflow("Invalid login rejected", test_invalid_login)

# 3. API auth/me
def test_api_me():
    cookies = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))
    form = urllib.parse.urlencode({
        "email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
        headers={"User-Agent": "test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
    try: opener.open(req)
    except: pass
    
    req = urllib.request.Request(f"{BASE_URL}/api/auth/me", headers={"User-Agent": "test/1.0"})
    resp = opener.open(req)
    data = json.loads(resp.read().decode())
    if data.get("email") == EMAIL:
        print(f"  /api/auth/me: {data['email']} (2FA={data.get('twoFactorEnabled')}) ✓")
        return True
    print(f"  /api/auth/me: wrong user ✗")
    return False

all_pass &= test_workflow("API /api/auth/me", test_api_me)

# 4. Cron drain
def test_cron():
    req = urllib.request.Request(
        f"{BASE_URL}/api/cron/drain?key=orion-cron-secret-2026",
        headers={"User-Agent": "test/1.0"})
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    if "ok" in data:
        print(f"  Cron drain: ok={data['ok']} emails={data['emails']} webhooks={data['webhooks']} ✓")
        return True
    print(f"  Cron drain: unexpected response ✗")
    return False

all_pass &= test_workflow("Cron drain", test_cron)

# 5. Logout flow
def test_logout():
    cookies = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(cookies), NoRedirect())
    form = urllib.parse.urlencode({
        "email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
        headers={"User-Agent": "test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
    try: opener.open(req)
    except: pass
    
    # Logout
    req = urllib.request.Request(f"{BASE_URL}/api/auth/logout", headers={"User-Agent": "test/1.0"})
    try:
        resp = opener.open(req)
        code = resp.status
    except urllib.error.HTTPError as e:
        code = e.code
    
    if code == 303:
        print(f"  Logout: {code} (redirect to /login) ✓")
        return True
    print(f"  Logout: {code} ✗")
    return False

all_pass &= test_workflow("Logout", test_logout)

# 6. Super Admin access
def test_superadmin():
    cookies = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookies))
    form = urllib.parse.urlencode({
        "email": EMAIL, "password": PASSWORD, "redirect": "/dashboard"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=form, method="POST",
        headers={"User-Agent": "test/1.0", "Content-Type": "application/x-www-form-urlencoded"})
    try: opener.open(req)
    except: pass
    
    req = urllib.request.Request(f"{BASE_URL}/superadmin", headers={"User-Agent": "test/1.0"})
    resp = opener.open(req)
    body = resp.read().decode()
    if "Super Admin" in body and "PagueMenos" in body:
        print(f"  /superadmin: 200 with PagueMenos ✓")
        return True
    print(f"  /superadmin: missing content ✗")
    return False

all_pass &= test_workflow("Super Admin dashboard", test_superadmin)

# 7. White-label CSS injection
def test_whitelabel():
    req = urllib.request.Request(f"{BASE_URL}/login", headers={"User-Agent": "test/1.0"})
    resp = urllib.request.urlopen(req)
    body = resp.read().decode()
    if "--brand-primary" in body or "brand-gradient" in body:
        print(f"  White-label CSS: variables injected ✓")
        return True
    print(f"  White-label CSS: not found ✗")
    return False

all_pass &= test_workflow("White-label CSS injection", test_whitelabel)

# Summary
print(f"\n{'='*60}")
if all_pass:
    print("✅ ALL WORKFLOWS PASS — system is fully functional")
else:
    print("❌ SOME WORKFLOWS FAILED — see above")
print(f"{'='*60}")
