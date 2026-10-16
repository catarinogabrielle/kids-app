"use client";

import React from "react";
import { sounds } from "@/utils/soundEngine";
import { Sparkles } from "lucide-react";

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
}

export function HomeHub({ onSelectGame }: HomeHubProps) {
  // Todos os 10 jogos juntos na tela principal (sem abas escondidas)
  const allActivities = [
    {
      id: "car" as const,
      title: "VRUM!",
      emoji: "🚗",
      sideEmoji: "🦁",
      gradient: "from-amber-400 via-orange-500 to-amber-600",
      borderColor: "border-amber-700",
    },
    {
      id: "paint" as const,
      title: "PINTAR!",
      emoji: "🎨",
      sideEmoji: "🖍️",
      gradient: "from-sky-400 via-blue-500 to-indigo-500",
      borderColor: "border-blue-700",
    },
    {
      id: "puzzle" as const,
      title: "ENCAIXAR!",
      emoji: "🧩",
      sideEmoji: "🦖",
      gradient: "from-purple-400 via-fuchsia-500 to-pink-500",
      borderColor: "border-purple-700",
    },
    {
      id: "blocks" as const,
      title: "MONTAR!",
      emoji: "🧱",
      sideEmoji: "💥",
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      borderColor: "border-emerald-700",
    },
    {
      id: "balloons" as const,
      title: "BALÕES!",
      emoji: "🎈",
      sideEmoji: "⭐",
      gradient: "from-pink-400 via-rose-500 to-red-500",
      borderColor: "border-rose-700",
    },
    {
      id: "ark" as const,
      title: "A ARCA!",
      emoji: "🛳️",
      sideEmoji: "🐑",
      gradient: "from-teal-400 via-cyan-500 to-blue-600",
      borderColor: "border-teal-700",
    },
    {
      id: "counting" as const,
      title: "CONTAR!",
      emoji: "🔢",
      sideEmoji: "🦁",
      gradient: "from-yellow-400 via-amber-500 to-orange-500",
      borderColor: "border-amber-700",
    },
    {
      id: "train" as const,
      title: "TREM 123!",
      emoji: "🚂",
      sideEmoji: "💨",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      borderColor: "border-teal-700",
    },
    {
      id: "tracing" as const,
      title: "TRAÇAR ABC!",
      emoji: "✍️",
      sideEmoji: "✨",
      gradient: "from-indigo-400 via-purple-500 to-violet-600",
      borderColor: "border-indigo-700",
    },
    {
      id: "missingLetter" as const,
      title: "PALAVRAS!",
      emoji: "🔤",
      sideEmoji: "👑",
      gradient: "from-rose-400 via-pink-500 to-fuchsia-600",
      borderColor: "border-rose-700",
    },
  ];

  return (
    <div className="flex flex-col justify-between w-full h-full px-2.5 sm:px-6 pt-1 pb-2.5 sm:pb-5 select-none overflow-hidden">
      {/* Cabeçalho Integrado: AS AVENTURAS DO ISRAEL */}
      <div className="relative w-full text-center flex items-center justify-center gap-2 sm:gap-4 mb-1.5 sm:mb-3 flex-shrink-0">
        <span className="text-2xl sm:text-4xl drop-shadow">☀️</span>

        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-black text-amber-950 bg-kids-yellow px-3 py-0.5 rounded-full border-2 border-amber-500 shadow-sm uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-amber-700" /> Mundinho Mágico <Sparkles size={11} className="text-amber-700" />
          </span>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,0.45)] tracking-wide leading-tight">
            AS AVENTURAS DO ISRAEL
          </h1>
        </div>

        <span className="text-2xl sm:text-4xl drop-shadow">☁️</span>
      </div>

      {/* Grade Tela Cheia 100% Responsiva: Ocupa toda a largura e altura da tela (2x5 no Mobile, 5x2 no Tablet/Desktop) */}
      <div className="w-full flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-5 grid-rows-5 sm:grid-rows-2 gap-2 sm:gap-4">
        {allActivities.map((act) => (
          <button
            key={act.id}
            onClick={() => {
              sounds.playPop();
              onSelectGame(act.id);
            }}
            className={`kid-btn group relative w-full h-full rounded-2xl sm:rounded-4xl border-3 sm:border-5 ${act.borderColor} bg-gradient-to-br ${act.gradient} shadow-kid-lg flex flex-col items-center justify-between p-1.5 sm:p-3.5 overflow-hidden active:scale-95 transition-all duration-150`}
          >
            {/* Brilho Superior Estilo App Infantil */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-2xl pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />

            {/* Ícone Gigante Centralizado */}
            <div className="relative flex-1 flex items-center justify-center w-full">
              <span className="text-4xl sm:text-6xl md:text-7xl group-hover:scale-115 group-hover:rotate-6 transition-all duration-200 drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]">
                {act.emoji}
              </span>
              <span className="absolute bottom-0 right-1/4 translate-x-6 text-xl sm:text-3xl group-hover:scale-110 transition-transform duration-200 drop-shadow">
                {act.sideEmoji}
              </span>
            </div>

            {/* Placa do Nome da Brincadeira */}
            <div className="w-[92%] bg-white/95 py-0.5 sm:py-1.5 px-2 rounded-xl sm:rounded-2xl border-2 border-white shadow-md z-10 flex items-center justify-center">
              <span className="font-black text-xs sm:text-base md:text-lg text-slate-800 tracking-wider truncate">
                {act.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
