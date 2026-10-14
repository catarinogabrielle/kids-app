"use client";

import { useEffect } from "react";

export function PWARegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Kids PWA registrado com sucesso!"))
        .catch((err) => console.log("Falha ao registrar PWA:", err));
    }
  }, []);

  return null;
}
