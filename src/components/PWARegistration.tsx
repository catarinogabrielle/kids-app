"use client";

import { useEffect } from "react";

export function PWARegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Limpa automaticamente caches antigos (v1/v2) que prendiam versões antigas
    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== "israel-kids-cache-v3") {
            caches.delete(key);
          }
        });
      });
    }

    // 2. Registra o Service Worker sem cache de script e força verificação de atualizações
    if ("serviceWorker" in navigator) {
      let refreshing = false;

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => {
          // Verifica imediatamente no servidor se há nova versão
          registration.update().catch(() => {});

          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });
        })
        .catch((err) => console.log("Falha ao registrar PWA:", err));
    }
  }, []);

  return null;
}
