"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegister — registers /sw.js on the client.
 * Logs to console for debugging but never throws in unsupported environments.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Only register in production to avoid caching dev assets.
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => {
          // Silent fail — service worker is optional.
          console.warn("[Orion] SW registration failed:", err);
        });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
