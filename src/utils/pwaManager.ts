"use client";

import { useState, useEffect } from "react";
import { sounds } from "@/utils/soundEngine";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const subscribers = new Set<() => void>();

if (typeof window !== "undefined") {
  // Captura o evento nativo de instalação do navegador imediatamente
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    subscribers.forEach((fn) => fn());
  });

  window.addEventListener("appinstalled", () => {
    globalDeferredPrompt = null;
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
    setIsInstalled(isAppInstalled());
    setCanPrompt(!!globalDeferredPrompt);

    const ua = navigator.userAgent || "";
    const isApple = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isApple);

    const update = () => {
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
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const choice = await globalDeferredPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          sounds.playSuccess();
          setIsInstalled(true);
        }
        globalDeferredPrompt = null;
        setCanPrompt(false);
      } catch (err) {
        console.log("Erro ao acionar prompt de instalação:", err);
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
