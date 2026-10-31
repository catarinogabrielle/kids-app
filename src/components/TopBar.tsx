"use client";

import React, { useState, useEffect } from "react";
import { Home, Volume2, VolumeX, Maximize2, Minimize2, Shield, Download, Sparkles } from "lucide-react";
import { sounds } from "@/utils/soundEngine";
import { usePWAInstall } from "@/utils/pwaManager";
import { PWAInstallModal } from "@/components/PWAInstallModal";

export function SoundButton() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sounds.getMuted());
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <button
      onClick={handleToggle}
      className={`kid-btn p-1.5 sm:p-2 landscape:p-1 rounded-xl sm:rounded-2xl border-2 sm:border-3 shadow-kid active:scale-95 flex-shrink-0 transition-transform ${
        isMuted
          ? "bg-gray-200 text-gray-500 border-gray-400"
          : "bg-kids-teal text-white border-teal-600"
      }`}
      title={isMuted ? "Ligar som" : "Desligar som"}
      aria-label={isMuted ? "Ligar som" : "Desligar som"}
    >
      {isMuted ? (
        <VolumeX size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
      ) : (
        <Volume2 size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
      )}
    </button>
  );
}

export function HomeButton({ onHome }: { onHome?: () => void }) {
  if (!onHome) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        sounds.playPop();
        onHome();
      }}
      className="kid-btn bg-kids-yellow hover:bg-amber-300 text-amber-950 p-1.5 sm:p-2 landscape:p-1 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-amber-500 shadow-kid active:scale-95 transition-transform flex-shrink-0"
      title="Voltar para o Menu de Jogos"
      aria-label="Voltar para a tela inicial"
    >
      <Home size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4 stroke-[2.5]" />
    </button>
  );
}

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      // Ignora silenciosamente se o navegador restringir tela cheia
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="kid-btn bg-kids-blue hover:bg-blue-600 text-white p-1.5 sm:p-2 landscape:p-1 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-blue-600 shadow-kid active:scale-95 flex-shrink-0 transition-transform"
      title="Tela Cheia"
      aria-label="Alternar modo tela cheia"
    >
      {isFullscreen ? (
        <Minimize2 size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
      ) : (
        <Maximize2 size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
      )}
    </button>
  );
}

/* HEADER UNIFICADO PARA CADA JOGO: UMA LINHA ÚNICA, ZERO DUPLICAÇÃO, ZERO CORTE */
interface GameHeaderProps {
  onHome?: () => void;
  title?: string;
  icon?: string;
  leftControls?: React.ReactNode;
  rightControls?: React.ReactNode;
}

export function GameHeader({
  onHome,
  title,
  icon,
  leftControls,
  rightControls,
}: GameHeaderProps) {
  return (
    <header className="w-full pt-[max(4px,env(safe-area-inset-top))] pb-1 sm:py-3.5 landscape:py-0.5 px-2.5 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-4 z-30 select-none flex-shrink-0 bg-white/90 backdrop-blur-md border-b sm:border-b-2 border-white/70 shadow-sm h-11 sm:h-14 landscape:h-10">
      {/* Lado Esquerdo: Botão Início + Título + Controles Primários do Jogo */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        <HomeButton onHome={onHome} />

        {title && (
          <div className="hidden sm:flex md:flex items-center gap-1 sm:gap-2 bg-white/95 px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
            {icon && <span className="text-sm sm:text-base">{icon}</span>}
            <span className="font-extrabold text-[11px] sm:text-sm text-slate-800 tracking-wide whitespace-nowrap">
              {title}
            </span>
          </div>
        )}

        {leftControls}
      </div>

      {/* Lado Direito: Ações do Jogo + Som */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {rightControls}
        <SoundButton />
      </div>
    </header>
  );
}

/* HEADER PRINCIPAL DO HUB (MUNDINHO MÁGICO): LOGO + AÇÕES SEM COLIDIR */
interface HubHeaderProps {
  onOpenParents?: () => void;
}

export function HubHeader({ onOpenParents }: HubHeaderProps) {
  const { isInstalled, isIOS, canPrompt, showModal, setShowModal, triggerInstall } = usePWAInstall();

  return (
    <>
      <header className="w-full pt-[max(6px,env(safe-area-inset-top))] pb-1 sm:py-3.5 landscape:py-0.5 px-3 sm:px-6 flex items-center justify-between gap-1.5 sm:gap-4 z-30 select-none flex-shrink-0">
        {/* Lado Esquerdo: Marca & Subtítulo (NUNCA TRUNCA COM RETICÊNCIAS) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 min-w-0">
          <span className="text-xl sm:text-3xl drop-shadow select-none">☀️</span>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <h1 className="text-sm sm:text-2xl md:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(15,23,42,0.45)] tracking-wide leading-tight whitespace-nowrap">
                MUNDINHO MÁGICO
              </h1>
              <span className="text-sm sm:text-xl drop-shadow select-none">🌈</span>
            </div>
            {/* Oculta em telas de mobile horizontal para não empurrar os cards */}
            <span className="hidden md:inline-block text-[10px] sm:text-xs font-black text-amber-950 bg-kids-yellow px-2 py-0.5 rounded-full border border-amber-500 shadow-sm uppercase tracking-wider w-fit">
              <Sparkles size={11} className="inline mr-1 text-amber-700" />
              Jogos Bíblicos & Educativos
            </span>
          </div>
        </div>

        {/* Lado Direito: Instalar App + Som + Tela Cheia + Pais */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Botão de Instalar App PWA */}
          {!isInstalled && (
            <button
              onClick={triggerInstall}
              className="kid-btn bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border-2 sm:border-3 border-emerald-700 shadow-kid flex items-center gap-1 font-black text-xs sm:text-sm animate-pulse-gentle active:scale-95"
              title="Instalar Aplicativo Mundinho Mágico"
            >
              <Download size={14} className="sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="hidden sm:inline">INSTALAR APP</span>
              <span className="sm:hidden text-[10px] tracking-wider">APP</span>
            </button>
          )}

          {/* Som */}
          <SoundButton />

          {/* Tela Cheia (apenas tablet / desktop para não espremer o mobile vertical) */}
          <div className="hidden sm:block">
            <FullscreenButton />
          </div>

          {/* Cantinho dos Pais */}
          {onOpenParents && (
            <button
              onClick={() => {
                sounds.playPop();
                onOpenParents();
              }}
              className="kid-btn bg-white/95 text-slate-700 p-1.5 sm:p-2 rounded-xl border-2 sm:border-3 border-slate-300 shadow-kid hover:bg-slate-100 flex-shrink-0 active:scale-95"
              title="Cantinho dos Pais"
              aria-label="Cantinho dos Pais"
            >
              <Shield size={18} className="sm:w-5 sm:h-5 text-kids-purple stroke-[2.5]" />
            </button>
          )}
        </div>
      </header>

      {/* Modal Guiado de Instalação PWA */}
      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isIOS={isIOS}
        canPrompt={canPrompt}
        onNativeInstall={triggerInstall}
      />
    </>
  );
}

/* Compatibilidade com TopBar genérico se necessário */
export function TopBar({
  title,
  icon,
  showHome = true,
  onHome,
  onOpenParents,
}: {
  title?: string;
  icon?: string;
  showHome?: boolean;
  onHome?: () => void;
  onOpenParents?: () => void;
}) {
  if (!showHome && !title) {
    return <HubHeader onOpenParents={onOpenParents} />;
  }

  return <GameHeader onHome={onHome} title={title} icon={icon} />;
}
