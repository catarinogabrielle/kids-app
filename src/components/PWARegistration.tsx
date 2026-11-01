"use client";

import { useEffect } from "react";

const CURRENT_CACHE_NAME = "mundinho-magico-v22";

export function PWARegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Limpa automaticamente QUALQUER cache antigo do navegador (israel-kids-*, mundinho-magico-v1..v5)
    // Isso garante que o usuário nunca mais precise dar "Clear site data" manualmente para ver as atualizações!
    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          if (key !== CURRENT_CACHE_NAME) {
            caches.delete(key);
          }
        });
      });
    }

    // 2. Registra o Service Worker com bypass de cache HTTP e atualização automática
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
          // Força verificação imediata no servidor
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
