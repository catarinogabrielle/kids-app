"use client";

import React from "react";
import { sounds } from "@/utils/soundEngine";
import { HubHeader } from "@/components/TopBar";

export type GameKey =
  | "car"
  | "paint"
  | "puzzle"
  | "blocks"
  | "balloons"
  | "ark"
  | "counting"
  | "train"
  | "tracing"
  | "missingLetter";

interface HomeHubProps {
  onSelectGame: (game: GameKey) => void;
  onOpenParents?: () => void;
}

export function HomeHub({ onSelectGame, onOpenParents }: HomeHubProps) {
  const allActivities = [
    {
      id: "car" as const,
      title: "Pista do Noé",
      sub: "Corrida & Bichinhos",
      emoji: "🚙",
      sideEmoji: "🦁",
      gradient: "from-amber-400 via-orange-500 to-amber-600",
      borderColor: "border-amber-700",
    },
    {
      id: "paint" as const,
      title: "Atelier Bíblico",
      sub: "Colorir & Borracha",
      emoji: "🎨",
      sideEmoji: "🖍️",
      gradient: "from-sky-400 via-blue-500 to-indigo-500",
      borderColor: "border-blue-700",
    },
    {
      id: "puzzle" as const,
      title: "Quebra-Cabeça",
      sub: "Encaixar Peças",
      emoji: "🧩",
      sideEmoji: "⭐",
      gradient: "from-purple-400 via-fuchsia-500 to-pink-500",
      borderColor: "border-purple-700",
    },
    {
      id: "blocks" as const,
      title: "Torre da Fé",
      sub: "Equilíbrio & Física",
      emoji: "🧱",
      sideEmoji: "🏛️",
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      borderColor: "border-emerald-700",
    },
    {
      id: "balloons" as const,
      title: "Balões de Luz",
      sub: "Cores & Reflexo",
      emoji: "🎈",
      sideEmoji: "✨",
      gradient: "from-pink-400 via-rose-500 to-red-500",
      borderColor: "border-rose-700",
    },
    {
      id: "ark" as const,
      title: "Arca de Noé",
      sub: "Pares de Bichinhos",
      emoji: "🛳️",
      sideEmoji: "🐑",
      gradient: "from-teal-400 via-cyan-500 to-blue-600",
      borderColor: "border-teal-700",
    },
    {
      id: "counting" as const,
      title: "Contar Criação",
      sub: "Números 1 a 10",
      emoji: "🔢",
      sideEmoji: "👑",
      gradient: "from-yellow-400 via-amber-500 to-orange-500",
      borderColor: "border-amber-700",
    },
    {
      id: "train" as const,
      title: "Trem 123",
      sub: "Vagões em Ordem",
      emoji: "🚂",
      sideEmoji: "💨",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      borderColor: "border-teal-700",
    },
    {
      id: "tracing" as const,
      title: "Traçar Letras",
      sub: "Alfabeto A a Z",
      emoji: "✍️",
      sideEmoji: "📜",
      gradient: "from-indigo-400 via-purple-500 to-violet-600",
      borderColor: "border-indigo-700",
    },
    {
      id: "missingLetter" as const,
      title: "Letrinha Mágica",
      sub: "Completar Palavras",
      emoji: "🔤",
      sideEmoji: "🕊️",
      gradient: "from-rose-400 via-pink-500 to-fuchsia-600",
      borderColor: "border-rose-700",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-hidden select-none px-2 sm:px-4 py-1 sm:py-2">
      {/* 1. HEADER DO HUB: LOGO + INSTALAR + SOM + TELA CHEIA + PAIS (SEM RETICÊNCIAS) */}
      <HubHeader onOpenParents={onOpenParents} />

      {/* 2. GRADE DOS 10 JOGOS: ASPECTO REAL EQUILIBRADO NO DESKTOP E FULLSCREEN NO MOBILE */}
      <div className="w-full flex-1 min-h-0 flex items-center justify-center p-1 sm:p-2 lg:p-4">
        <div className="w-full max-w-7xl 2xl:max-w-[1440px] h-full flex flex-col justify-center">
          <div className="w-full h-full max-h-[84vh] landscape:max-h-[82vh] sm:max-h-[75vh] sm:h-auto sm:aspect-[5/2.25] grid grid-cols-2 grid-rows-5 landscape:grid-cols-5 landscape:grid-rows-2 sm:grid-cols-5 sm:grid-rows-2 gap-2 sm:gap-3 lg:gap-4">
            {allActivities.map((act) => (
              <button
                key={act.id}
                onClick={() => {
                  sounds.playPop();
                  onSelectGame(act.id);
                }}
                className={`kid-btn group relative w-full h-full rounded-2xl sm:rounded-3xl border-3 sm:border-4 ${act.borderColor} bg-gradient-to-br ${act.gradient} shadow-kid flex flex-col items-center justify-between p-1.5 sm:p-2.5 overflow-hidden active:scale-95 transition-transform duration-100 hover:scale-[1.02]`}
              >
                {/* Brilho Superior Curvo Estilo Brinquedo */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-2xl pointer-events-none" />
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full pointer-events-none" />

                {/* Ícone Central em Medalhão 3D Grande e Proporcional */}
                <div className="relative flex-1 flex items-center justify-center w-full min-h-0 py-0.5">
                  <div className="w-12 h-12 landscape:w-11 landscape:h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl sm:rounded-3xl bg-white/25 backdrop-blur-sm border border-white/50 shadow-inner flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-2xl landscape:text-2xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] select-none">
                      {act.emoji}
                    </span>
                  </div>
                  <span className="absolute bottom-0 right-1/4 translate-x-3 text-xs sm:text-base md:text-xl lg:text-2xl drop-shadow select-none">
                    {act.sideEmoji}
                  </span>
                </div>

                {/* Placa do Título com Contraste Alto e Texto Sem Reticências */}
                <div className="w-full bg-white/95 py-0.5 sm:py-1 px-1 sm:px-2 rounded-xl sm:rounded-2xl border border-white shadow-sm z-10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="font-black text-[10px] landscape:text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-800 tracking-tight leading-tight text-center break-words">
                    {act.title}
                  </span>
                  <span className="hidden sm:inline text-[9px] md:text-[11px] lg:text-xs font-bold text-slate-500 whitespace-nowrap leading-none mt-0.5">
                    {act.sub}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
