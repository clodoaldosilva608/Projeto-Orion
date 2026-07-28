import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /kill-sw
 *
 * Returns an HTML page that runs JavaScript in the browser to:
 * 1. Unregister ALL service workers
 * 2. Clear ALL caches
 * 3. Clear localStorage and sessionStorage
 * 4. Clear ALL cookies
 * 5. Redirect to /login
 *
 * This is the nuclear option for killing a stuck Service Worker.
 */
export async function GET() {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Orion — Limpando cache...</title>
<style>
body { font-family: Arial, sans-serif; background: #0f111a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
.box { text-align: center; max-width: 400px; padding: 2rem; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(139,92,246,0.2); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
p { color: #8b8fa3; font-size: 0.85rem; margin: 0.25rem 0; }
.ok { color: #10b981; }
.err { color: #ef4444; }
</style>
</head>
<body>
<div class="box">
<div class="spinner" id="spinner"></div>
<h1>Orion — Limpando cache e Service Worker</h1>
<div id="status"></div>
</div>
<script>
(async function() {
  var status = document.getElementById('status');
  function log(msg, cls) {
    var p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = msg;
    status.appendChild(p);
  };

  try {
    // 1. Unregister ALL service workers
    if ('serviceWorker' in navigator) {
      var registrations = await navigator.serviceWorker.getRegistrations();
      log('Service Workers encontrados: ' + registrations.length);
      for (var i = 0; i < registrations.length; i++) {
        await registrations[i].unregister();
        log('SW desregistrado: ' + registrations[i].scope, 'ok');
      }
    } else {
      log('Service Worker nao suportado', 'ok');
    }

    // 2. Clear ALL caches
    if ('caches' in window) {
      var keys = await caches.keys();
      log('Caches encontrados: ' + keys.length);
      for (var i = 0; i < keys.length; i++) {
        await caches.delete(keys[i]);
        log('Cache removido: ' + keys[i], 'ok');
      }
    }

    // 3. Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    log('Storage limpo', 'ok');

    // 4. Clear cookies
    document.cookie.split(';').forEach(function(c) {
      var eqPos = c.indexOf('=');
      var name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + location.hostname;
    });
    log('Cookies limpos', 'ok');

    // 5. Unregister SW again after clearing
    if ('serviceWorker' in navigator) {
      var regs2 = await navigator.serviceWorker.getRegistrations();
      for (var i = 0; i < regs2.length; i++) {
        await regs2[i].unregister();
      }
    }

    // 6. Redirect
    log('Redirecionando para login...', '');
    setTimeout(function() {
      window.location.href = '/login';
    }, 1500);

  } catch(e) {
    log('Erro: ' + e.message, 'err');
    setTimeout(function() {
      window.location.href = '/login';
    }, 3000);
  }
})();
</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
