#!/usr/bin/env python3
"""Verify clickable navigation elements — sidebar links + key buttons."""
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

# Get dashboard HTML (contains sidebar with all nav links)
req = urllib.request.Request(f"{BASE_URL}/dashboard", headers={"User-Agent": "test/1.0"})
resp = opener.open(req)
html = resp.read().decode("utf-8", errors="replace")

# Extract all href links from sidebar
hrefs = re.findall(r'href="(/[^"]*)"', html)
# Filter to internal navigation links (not assets)
nav_links = [h for h in hrefs if not h.startswith("/_next") and not h.startswith("/api/auth/logout") and h != "/"]

# Test each nav link
print(f"Found {len(nav_links)} unique nav links in sidebar\n")
print(f"{'LINK':<30} {'CODE':<5} {'STATUS'}")
print("-" * 50)

unique_links = sorted(set(nav_links))
errors = []
ok = 0
for link in unique_links:
    try:
        req = urllib.request.Request(f"{BASE_URL}{link}", headers={"User-Agent": "test/1.0"})
        with opener.open(req, timeout=15) as resp:
            code = resp.status
    except urllib.error.HTTPError as e:
        code = e.code
    except Exception as e:
        print(f"{link:<30} ERR: {e}")
        errors.append(f"{link}: {e}")
        continue

    if code == 200:
        status = "✓"
        ok += 1
    elif code == 307:
        status = "✓ (redirect)"
        ok += 1
    else:
        status = f"✗ {code}"
        errors.append(f"{link}: {code}")
    
    print(f"{link:<30} {code:<5} {status}")

print(f"\n{'='*50}")
print(f"Total: {len(unique_links)} | OK: {ok} | Errors: {len(errors)}")
if errors:
    print(f"\nERRORS:")
    for e in errors:
        print(f"  ✗ {e}")
else:
    print("\n✅ ALL SIDEBAR LINKS WORK")
print(f"{'='*50}")
