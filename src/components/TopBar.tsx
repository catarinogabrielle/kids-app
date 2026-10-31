"use client";

import React, { useState, useEffect } from "react";
import { Home, Volume2, VolumeX, Maximize2, Minimize2, Shield, Download } from "lucide-react";
import { sounds } from "@/utils/soundEngine";
import { usePWAInstall } from "@/utils/pwaManager";
import { PWAInstallModal } from "@/components/PWAInstallModal";

interface TopBarProps {
  title?: string;
  icon?: string;
  showHome?: boolean;
  onHome?: () => void;
  onOpenParents?: () => void;
}

export function TopBar({
  title,
  icon,
  showHome = true,
  onHome,
  onOpenParents,
}: TopBarProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isInstalled, isIOS, showModal, setShowModal, triggerInstall } = usePWAInstall();

  useEffect(() => {
    setIsMuted(sounds.getMuted());
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const handleToggleFullscreen = async () => {
    sounds.playPop();
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen({ navigationUI: "hide" } as FullscreenOptions);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Ignora silenciosamente se o navegador restringir modo de tela cheia
    }
  };

  const isHub = !showHome && !title;

  if (isHub) {
    return (
      <>
        <div className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-3.5 z-40 flex items-center gap-1 sm:gap-2 pointer-events-auto">
          {/* Botão de Instalar App PWA */}
          {!isInstalled && (
            <button
              onClick={triggerInstall}
              className="kid-btn bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-emerald-700 shadow-kid flex items-center gap-1 sm:gap-1.5 font-black text-xs sm:text-sm animate-pulse-gentle active:scale-95"
              title="Instalar Aplicativo Mundinho Mágico"
            >
              <Download size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="hidden sm:inline">INSTALAR APP</span>
              <span className="sm:hidden">INSTALAR</span>
            </button>
          )}

          {/* Alternar Som */}
          <button
            onClick={handleToggleMute}
            className={`kid-btn p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 shadow-kid ${
              isMuted
                ? "bg-gray-200 text-gray-500 border-gray-400"
                : "bg-kids-teal text-white border-teal-600"
            }`}
            title={isMuted ? "Ligar som" : "Desligar som"}
          >
            {isMuted ? <VolumeX size={18} className="sm:w-5 sm:h-5" /> : <Volume2 size={18} className="sm:w-5 sm:h-5" />}
          </button>

          {/* Tela Cheia */}
          <button
            onClick={handleToggleFullscreen}
            className="kid-btn bg-kids-blue text-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-blue-600 shadow-kid"
            title="Tela Cheia"
          >
            {isFullscreen ? <Minimize2 size={18} className="sm:w-5 sm:h-5" /> : <Maximize2 size={18} className="sm:w-5 sm:h-5" />}
          </button>

          {/* Cantinho dos Pais */}
          {onOpenParents && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenParents();
              }}
              className="kid-btn bg-white/95 text-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-kid hover:bg-slate-100"
              title="Cantinho dos Pais"
            >
              <Shield size={18} className="sm:w-5 sm:h-5 text-kids-purple stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Modal de Instalação Guiada */}
        <PWAInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          isIOS={isIOS}
        />
      </>
    );
  }

  return (
    <>
      <header className="w-full px-2 sm:px-4 py-1 sm:py-1.5 landscape:py-0.5 flex items-center justify-between z-30 select-none flex-shrink-0 landscape-compact-topbar">
        {/* Botão de Voltar para Casa (Compacto no Mobile, Gigante no Tablet) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {showHome && onHome && (
            <button
              onClick={() => {
                sounds.playPop();
                onHome();
              }}
              className="kid-btn bg-kids-yellow hover:bg-amber-300 text-amber-950 p-1 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-amber-500 shadow-kid active:scale-95 transition-transform"
              aria-label="Voltar para a tela inicial"
            >
              <Home size={20} className="sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>
          )}

          {title && (
            <div className="flex items-center gap-1 sm:gap-2 bg-white/90 backdrop-blur-md px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl border-2 border-white shadow-sm">
              {icon && <span className="text-base sm:text-2xl">{icon}</span>}
              <span className="font-extrabold text-xs sm:text-xl text-slate-800 tracking-wide truncate max-w-[160px] sm:max-w-none">
                {title}
              </span>
            </div>
          )}
        </div>

        {/* Botões de Ação da Direita (Instalar, Som, Tela Cheia, Cantinho dos Pais) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Botão de Instalar App no Header dos Jogos */}
          {!isInstalled && (
            <button
              onClick={triggerInstall}
              className="kid-btn bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 sm:p-2 sm:px-2.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-emerald-700 shadow-kid flex items-center gap-1 font-black text-xs sm:text-sm"
              title="Instalar Aplicativo"
            >
              <Download size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="hidden sm:inline">INSTALAR</span>
            </button>
          )}

          {/* Alternar Som */}
          <button
            onClick={handleToggleMute}
            className={`kid-btn p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 shadow-kid ${
              isMuted
                ? "bg-gray-200 text-gray-500 border-gray-400"
                : "bg-kids-teal text-white border-teal-600"
            }`}
            title={isMuted ? "Ligar som" : "Desligar som"}
          >
            {isMuted ? <VolumeX size={18} className="sm:w-5 sm:h-5" /> : <Volume2 size={18} className="sm:w-5 sm:h-5" />}
          </button>

          {/* Tela Cheia */}
          <button
            onClick={handleToggleFullscreen}
            className="kid-btn bg-kids-blue text-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-blue-600 shadow-kid"
            title="Tela Cheia"
          >
            {isFullscreen ? <Minimize2 size={18} className="sm:w-5 sm:h-5" /> : <Maximize2 size={18} className="sm:w-5 sm:h-5" />}
          </button>

          {/* Cantinho dos Pais */}
          {onOpenParents && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenParents();
              }}
              className="kid-btn bg-white/95 text-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-kid hover:bg-slate-100"
              title="Cantinho dos Pais"
            >
              <Shield size={18} className="sm:w-5 sm:h-5 text-kids-purple stroke-[2.5]" />
            </button>
          )}
        </div>
      </header>

      {/* Modal de Instalação Guiada */}
      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isIOS={isIOS}
      />
    </>
  );
}
