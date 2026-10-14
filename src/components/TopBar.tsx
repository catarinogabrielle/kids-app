"use client";

import React, { useState, useEffect } from "react";
import { Home, Volume2, VolumeX, Maximize2, Minimize2, Shield } from "lucide-react";
import { sounds } from "@/utils/soundEngine";

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

  const handleToggleFullscreen = () => {
    sounds.playPop();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between z-30 select-none flex-shrink-0">
      {/* Botão de Voltar para Casa (Compacto no Mobile, Gigante no Tablet) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {showHome && onHome && (
          <button
            onClick={() => {
              sounds.playPop();
              onHome();
            }}
            className="kid-btn bg-kids-yellow hover:bg-amber-300 text-amber-950 p-2 sm:p-3 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-amber-500 shadow-kid active:scale-95 transition-transform"
            aria-label="Voltar para a tela inicial"
          >
            <Home size={26} className="sm:w-8 sm:h-8 stroke-[2.5]" />
          </button>
        )}

        {title && (
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/85 backdrop-blur-md px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-2xl border-2 border-white shadow-sm">
            {icon && <span className="text-xl sm:text-3xl">{icon}</span>}
            <span className="font-extrabold text-sm sm:text-2xl text-slate-800 tracking-wide truncate max-w-[170px] sm:max-w-none">
              {title}
            </span>
          </div>
        )}
      </div>

      {/* Botões de Ação da Direita (Som, Tela Cheia, Cantinho dos Pais) */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Alternar Som */}
        <button
          onClick={handleToggleMute}
          className={`kid-btn p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 shadow-kid ${
            isMuted
              ? "bg-gray-200 text-gray-500 border-gray-400"
              : "bg-kids-teal text-white border-teal-600"
          }`}
          title={isMuted ? "Ligar som" : "Desligar som"}
        >
          {isMuted ? <VolumeX size={22} className="sm:w-6 sm:h-6" /> : <Volume2 size={22} className="sm:w-6 sm:h-6 animate-pulse" />}
        </button>

        {/* Tela Cheia (Ideal para Tablet) */}
        <button
          onClick={handleToggleFullscreen}
          className="kid-btn hidden sm:flex bg-kids-blue text-white p-2.5 rounded-2xl border-4 border-blue-600 shadow-kid"
          title="Tela Cheia"
        >
          {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </button>

        {/* Cantinho dos Pais */}
        {onOpenParents && (
          <button
            onClick={() => {
              sounds.playPop();
              onOpenParents();
            }}
            className="kid-btn bg-white/90 text-slate-700 p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 border-slate-300 shadow-kid hover:bg-slate-100"
            title="Cantinho dos Pais"
          >
            <Shield size={22} className="sm:w-6 sm:h-6 text-kids-purple stroke-[2.5]" />
          </button>
        )}
      </div>
    </header>
  );
}
