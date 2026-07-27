"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegister — DISABLED temporarily.
 * 
 * The SW was causing session loss issues by intercepting RSC navigation
 * requests. Disabled until we can ensure it doesn't interfere with
 * Next.js App Router client-side navigation.
 * 
 * When re-enabling, make sure the SW does NOT intercept requests that
 * have `RSC: 1` header (Next.js RSC payload requests).
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Unregister any existing service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        console.log("[Orion] Unregistering SW:", registration.scope);
        registration.unregister();
      });
    }).catch(() => {});
  }, []);

  return null;
}
