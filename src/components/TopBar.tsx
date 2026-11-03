"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Volume2, VolumeX, Maximize2, Minimize2, Shield, Download, Sparkles } from "lucide-react";
import { sounds } from "@/utils/soundEngine";
import { usePWAInstall } from "@/utils/pwaManager";
import { PWAInstallModal } from "@/components/PWAInstallModal";

export function SoundButton() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sounds.getMuted());

    const handleMuteChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        setIsMuted(customEvent.detail);
      } else {
        setIsMuted(sounds.getMuted());
      }
    };

    window.addEventListener("israel_sound_mute_change", handleMuteChange);
    window.addEventListener("storage", handleMuteChange);
    return () => {
      window.removeEventListener("israel_sound_mute_change", handleMuteChange);
      window.removeEventListener("storage", handleMuteChange);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleToggle}
      className={`kid-btn relative overflow-hidden p-1.5 sm:p-2.5 landscape:p-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 flex-shrink-0 ${
        isMuted
          ? "bg-slate-200 text-slate-500 border-slate-400 shadow-kid-sm"
          : "kid-btn-teal"
      }`}
      title={isMuted ? "Ligar som" : "Desligar som"}
      aria-label={isMuted ? "Ligar som" : "Desligar som"}
    >
      <div className="toy-gloss" />
      {isMuted ? (
        <VolumeX size={16} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4" />
      ) : (
        <Volume2 size={16} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4 stroke-[2.5]" />
      )}
    </motion.button>
  );
}

export function HomeButton({ onHome }: { onHome?: () => void }) {
  if (!onHome) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={(e) => {
        e.stopPropagation();
        sounds.playPop();
        onHome();
      }}
      className="kid-btn kid-btn-amber relative overflow-hidden p-1.5 sm:p-2.5 landscape:p-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 flex-shrink-0"
      title="Voltar para o Menu de Jogos"
      aria-label="Voltar para a tela inicial"
    >
      <div className="toy-gloss" />
      <Home size={16} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4 stroke-[2.7]" />
    </motion.button>
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
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleToggle}
      className="kid-btn kid-btn-blue relative overflow-hidden p-2 sm:p-2.5 landscape:p-1.5 rounded-2xl border-2 sm:border-3 flex-shrink-0"
      title="Tela Cheia"
      aria-label="Alternar modo tela cheia"
    >
      <div className="toy-gloss" />
      {isFullscreen ? (
        <Minimize2 size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4 stroke-[2.5]" />
      ) : (
        <Maximize2 size={18} className="sm:w-5 sm:h-5 landscape:w-4 landscape:h-4 stroke-[2.5]" />
      )}
    </motion.button>
  );
}

/* HEADER UNIFICADO PARA CADA JOGO: UMA LINHA ÚNICA, ZERO DUPLICAÇÃO, ZERO CORTE */
interface GameHeaderProps {
  onHome?: () => void;
  title?: string;
  icon?: string;
  hideTitleOnMobile?: boolean;
  leftControls?: React.ReactNode;
  rightControls?: React.ReactNode;
}

export function GameHeader({
  onHome,
  title,
  icon,
  hideTitleOnMobile = true,
  leftControls,
  rightControls,
}: GameHeaderProps) {
  return (
    <header className="w-full max-w-full overflow-hidden pt-[max(6px,env(safe-area-inset-top))] pb-1 sm:py-3.5 landscape:py-1 px-1.5 sm:px-6 pl-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] flex items-center justify-between gap-1 sm:gap-4 z-30 select-none flex-shrink-0 bg-white/95 backdrop-blur-md border-b-2 sm:border-b-3 border-slate-200/85 shadow-sm min-h-[44px] sm:min-h-[62px] landscape:min-h-[40px]">
      {/* Lado Esquerdo: Botão Início + Título + Controles Primários do Jogo */}
      <div className="flex items-center gap-1 sm:gap-2.5 min-w-0 flex-1 overflow-x-auto scrollbar-none py-0.5">
        <HomeButton onHome={onHome} />

        {title && (
          <div
            className={`${
              hideTitleOnMobile ? "hidden md:flex" : "flex"
            } items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-amber-50 to-white px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border sm:border-2 border-amber-200/80 shadow-sm flex-shrink-0 max-w-[130px] sm:max-w-none`}
          >
            {icon && <span className="text-sm sm:text-xl flex-shrink-0 drop-shadow-sm">{icon}</span>}
            <span className="font-black text-xs sm:text-base text-slate-800 tracking-wide truncate whitespace-nowrap">
              {title}
            </span>
          </div>
        )}

        {leftControls}
      </div>

      {/* Lado Direito: Ações do Jogo + Som - Sempre ancorado e visível */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
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
      <header className="w-full pt-[max(8px,env(safe-area-inset-top))] pb-2 sm:py-3.5 landscape:py-1 px-2.5 sm:px-6 pl-[max(10px,env(safe-area-inset-left))] pr-[max(10px,env(safe-area-inset-right))] flex items-center justify-between gap-1.5 sm:gap-4 z-30 select-none flex-shrink-0 min-h-[48px] sm:min-h-[64px]">
        {/* Lado Esquerdo: Marca & Subtítulo */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 min-w-0">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-amber-600 shadow-toy-sm flex items-center justify-center flex-shrink-0 animate-bounce-subtle">
            <span className="text-lg sm:text-2xl drop-shadow select-none">☀️</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <h1 className="text-sm sm:text-2xl md:text-3xl font-black text-white text-shadow-kid tracking-wide leading-tight whitespace-nowrap">
                MUNDINHO MÁGICO
              </h1>
              <span className="text-sm sm:text-xl drop-shadow select-none animate-wiggle">🌈</span>
            </div>
            {/* Oculta em telas de mobile horizontal para não empurrar os cards */}
            <span className="hidden md:inline-flex items-center text-[10px] sm:text-xs font-black text-amber-950 bg-kids-yellow px-2.5 py-0.5 rounded-full border-2 border-amber-500 shadow-toy-sm uppercase tracking-wider w-fit">
              <Sparkles size={11} className="inline mr-1 text-amber-800" />
              Jogos Bíblicos & Educativos
            </span>
          </div>
        </div>

        {/* Lado Direito: Instalar App + Som + Tela Cheia + Pais */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Botão de Instalar App PWA */}
          {!isInstalled && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={triggerInstall}
              className="kid-btn kid-btn-emerald relative overflow-hidden px-2 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 flex items-center gap-1 font-black text-[10px] sm:text-sm animate-pulse-gentle"
              title="Instalar Aplicativo Mundinho Mágico"
            >
              <div className="toy-gloss" />
              <Download size={14} className="sm:w-5 sm:h-5 stroke-[2.7]" />
              <span className="hidden sm:inline">INSTALAR APP</span>
              <span className="sm:hidden text-[10px] tracking-wider">APP</span>
            </motion.button>
          )}

          {/* Som */}
          <SoundButton />

          {/* Tela Cheia (apenas tablet / desktop para não espremer o mobile vertical) */}
          <div className="hidden sm:block">
            <FullscreenButton />
          </div>

          {/* Cantinho dos Pais */}
          {onOpenParents && (
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                sounds.playPop();
                onOpenParents();
              }}
              className="kid-btn kid-btn-white relative overflow-hidden p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 flex-shrink-0"
              title="Cantinho dos Pais"
              aria-label="Cantinho dos Pais"
            >
              <div className="toy-gloss" />
              <Shield size={16} className="sm:w-5 sm:h-5 text-kids-purple stroke-[2.7]" />
            </motion.button>
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
