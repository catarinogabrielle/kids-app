"use client";

import React, { useState } from "react";
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
  const [tab, setTab] = useState<"games" | "learn">("games");

  // Brincadeiras
  const playActivities = [
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
  ];

  // Aprendizado: Números & Alfabeto
  const learnActivities = [
    {
      id: "counting" as const,
      title: "CONTAR!",
      emoji: "🔢",
      sideEmoji: "🦁",
      gradient: "from-amber-400 via-orange-500 to-amber-600",
      borderColor: "border-amber-700",
    },
    {
      id: "train" as const,
      title: "TREM 123!",
      emoji: "🚂",
      sideEmoji: "💨",
      gradient: "from-teal-400 via-emerald-500 to-green-600",
      borderColor: "border-teal-700",
    },
    {
      id: "tracing" as const,
      title: "TRAÇAR A-B-C!",
      emoji: "✍️",
      sideEmoji: "✨",
      gradient: "from-purple-400 via-fuchsia-500 to-pink-500",
      borderColor: "border-purple-700",
    },
    {
      id: "missingLetter" as const,
      title: "LETRA MÁGICA!",
      emoji: "🔤",
      sideEmoji: "🎨",
      gradient: "from-rose-400 via-pink-500 to-red-500",
      borderColor: "border-rose-700",
    },
  ];

  const currentList = tab === "games" ? playActivities : learnActivities;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-5xl mx-auto px-2 sm:px-4 py-1 sm:py-2.5 select-none overflow-hidden">
      {/* Topo com Solzinho e o Título Exato: AS AVENTURAS DO ISRAEL */}
      <div className="relative w-full text-center flex flex-col items-center mb-1 sm:mb-2 flex-shrink-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-3xl sm:text-5xl animate-float">☀️</span>

          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-black text-amber-900 bg-kids-yellow px-2.5 py-0.5 rounded-full border border-amber-400 shadow-sm mb-0.5 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-700" /> Mundinho Mágico <Sparkles size={11} className="text-amber-700" />
            </span>
            <h1 className="text-xl sm:text-4xl font-black text-white drop-shadow-[0_3px_0_rgba(15,23,42,0.4)] tracking-wide">
              AS AVENTURAS DO ISRAEL
            </h1>
          </div>

          <span className="text-3xl sm:text-5xl animate-float-delayed">☁️</span>
        </div>

        {/* Abas Gigantes de Categoria: BRINCAR vs 123 & ABC */}
        <div className="flex items-center gap-2 sm:gap-4 mt-1.5 sm:mt-2.5 bg-white/80 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-white shadow-md">
          <button
            onClick={() => {
              sounds.playPop();
              setTab("games");
            }}
            className={`kid-btn px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base flex items-center gap-1.5 transition-all ${
              tab === "games"
                ? "bg-kids-yellow text-amber-950 border-2 sm:border-3 border-amber-500 shadow-kid scale-105"
                : "bg-transparent text-slate-600 hover:bg-white/50"
            }`}
          >
            <span className="text-lg sm:text-2xl">🧸</span>
            <span>BRINCAR</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              setTab("learn");
            }}
            className={`kid-btn px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base flex items-center gap-1.5 transition-all ${
              tab === "learn"
                ? "bg-kids-teal text-white border-2 sm:border-3 border-teal-700 shadow-kid scale-105"
                : "bg-transparent text-slate-600 hover:bg-white/50"
            }`}
          >
            <span className="text-lg sm:text-2xl">⭐</span>
            <span>NÚMEROS & ABC</span>
          </button>
        </div>
      </div>

      {/* Grade com os Cards de Jogos */}
      <div
        className={`w-full grid gap-2 sm:gap-3.5 my-auto flex-1 min-h-0 items-center ${
          tab === "games"
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 max-w-3xl"
        }`}
      >
        {currentList.map((act) => (
          <button
            key={act.id}
            onClick={() => {
              sounds.playPop();
              onSelectGame(act.id);
            }}
            className={`kid-btn group relative w-full ${
              tab === "games" ? "h-26 sm:h-38 md:h-44" : "h-30 sm:h-44 md:h-50"
            } rounded-2xl sm:rounded-4xl border-3 sm:border-6 ${act.borderColor} bg-gradient-to-br ${act.gradient} shadow-kid-lg flex flex-col items-center justify-between p-2 sm:p-3.5 overflow-hidden active:scale-95 transition-all duration-150`}
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-3xl pointer-events-none" />

            {/* Imagens Grandes */}
            <div className="relative flex items-center justify-center my-auto">
              <span className="text-4xl sm:text-6xl group-hover:scale-120 group-hover:rotate-6 transition-all duration-200 drop-shadow-lg">
                {act.emoji}
              </span>
              <span className="absolute -bottom-1 -right-4 text-2xl sm:text-3xl animate-bounce drop-shadow">
                {act.sideEmoji}
              </span>
            </div>

            {/* Nome da Brincadeira em Botão Branco Fofo */}
            <div className="bg-white/95 px-3 py-1 sm:px-4 sm:py-1 rounded-2xl border-2 sm:border-3 border-white shadow-sm z-10">
              <span className="font-black text-xs sm:text-xl text-slate-800 tracking-wider">
                {act.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
