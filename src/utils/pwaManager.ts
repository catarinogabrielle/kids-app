"use client";

import { useState, useEffect } from "react";
import { sounds } from "@/utils/soundEngine";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent | null;
  }
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const subscribers = new Set<() => void>();

if (typeof window !== "undefined") {
  // Inicializa caso o script do <head> já tenha capturado
  if (window.__pwaPrompt) {
    globalDeferredPrompt = window.__pwaPrompt;
  }

  window.addEventListener("pwa-prompt-ready", () => {
    if (window.__pwaPrompt) {
      globalDeferredPrompt = window.__pwaPrompt;
      subscribers.forEach((fn) => fn());
    }
  });

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.__pwaPrompt = globalDeferredPrompt;
    subscribers.forEach((fn) => fn());
  });

  window.addEventListener("appinstalled", () => {
    globalDeferredPrompt = null;
    window.__pwaPrompt = null;
    subscribers.forEach((fn) => fn());
  });

  window.addEventListener("pwa-installed", () => {
    globalDeferredPrompt = null;
    window.__pwaPrompt = null;
    subscribers.forEach((fn) => fn());
  });
}

export function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

export function usePWAInstall() {
  const [canPrompt, setCanPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const promptObj = globalDeferredPrompt || window.__pwaPrompt || null;
    if (promptObj) {
      globalDeferredPrompt = promptObj;
    }

    setIsInstalled(isAppInstalled());
    setCanPrompt(!!globalDeferredPrompt);

    const ua = navigator.userAgent || "";
    const isApple = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isApple);

    const update = () => {
      const p = globalDeferredPrompt || window.__pwaPrompt || null;
      if (p) globalDeferredPrompt = p;
      setIsInstalled(isAppInstalled());
      setCanPrompt(!!globalDeferredPrompt);
    };

    subscribers.add(update);
    return () => {
      subscribers.delete(update);
    };
  }, []);

  const triggerInstall = async () => {
    sounds.playStar();
    const promptToUse = globalDeferredPrompt || window.__pwaPrompt;

    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        if (choice && choice.outcome === "accepted") {
          sounds.playSuccess();
          setIsInstalled(true);
        }
        globalDeferredPrompt = null;
        window.__pwaPrompt = null;
        setCanPrompt(false);
      } catch (err) {
        console.log("Erro ao acionar prompt nativo:", err);
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return {
    isInstalled,
    canPrompt,
    isIOS,
    showModal,
    setShowModal,
    triggerInstall,
  };
}
