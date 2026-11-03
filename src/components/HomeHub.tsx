"use client";

import React from "react";
import { motion } from "framer-motion";
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
      category: "Bíblico",
      gradient: "from-amber-400 via-amber-500 to-orange-500",
      borderColor: "border-amber-600",
      shadowBorder: "#92400e",
    },
    {
      id: "paint" as const,
      title: "Atelier Bíblico",
      sub: "Colorir & Borracha",
      emoji: "🎨",
      category: "Arte",
      gradient: "from-sky-400 via-blue-500 to-indigo-600",
      borderColor: "border-blue-600",
      shadowBorder: "#1e40af",
    },
    {
      id: "puzzle" as const,
      title: "Quebra-Cabeça",
      sub: "Encaixar Peças",
      emoji: "🧩",
      category: "Lógica",
      gradient: "from-purple-400 via-fuchsia-500 to-pink-500",
      borderColor: "border-purple-600",
      shadowBorder: "#6b21a8",
    },
    {
      id: "blocks" as const,
      title: "Torre da Fé",
      sub: "Equilíbrio & Física",
      emoji: "🧱",
      category: "Física",
      gradient: "from-emerald-400 via-teal-500 to-emerald-600",
      borderColor: "border-emerald-600",
      shadowBorder: "#065f46",
    },
    {
      id: "balloons" as const,
      title: "Balões de Luz",
      sub: "Cores & Reflexo",
      emoji: "🎈",
      category: "Cores",
      gradient: "from-pink-400 via-rose-500 to-red-500",
      borderColor: "border-rose-600",
      shadowBorder: "#9f1239",
    },
    {
      id: "ark" as const,
      title: "Arca de Noé",
      sub: "Pares de Bichinhos",
      emoji: "🛳️",
      category: "Memória",
      gradient: "from-teal-400 via-cyan-500 to-blue-600",
      borderColor: "border-teal-600",
      shadowBorder: "#115e59",
    },
    {
      id: "counting" as const,
      title: "Contar Criação",
      sub: "Números 1 a 10",
      emoji: "🔢",
      category: "Números",
      gradient: "from-yellow-400 via-amber-500 to-orange-500",
      borderColor: "border-amber-600",
      shadowBorder: "#92400e",
    },
    {
      id: "train" as const,
      title: "Trem 123",
      sub: "Vagões em Ordem",
      emoji: "🚂",
      category: "Ordem",
      gradient: "from-emerald-400 via-teal-500 to-cyan-600",
      borderColor: "border-teal-600",
      shadowBorder: "#115e59",
    },
    {
      id: "tracing" as const,
      title: "Traçar Letras",
      sub: "Alfabeto A a Z",
      emoji: "✍️",
      category: "Alfabeto",
      gradient: "from-indigo-400 via-purple-500 to-violet-600",
      borderColor: "border-indigo-600",
      shadowBorder: "#3730a3",
    },
    {
      id: "missingLetter" as const,
      title: "Letrinha Mágica",
      sub: "Completar Palavras",
      emoji: "🔤",
      category: "Palavras",
      gradient: "from-rose-400 via-pink-500 to-fuchsia-600",
      borderColor: "border-rose-600",
      shadowBorder: "#9f1239",
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none px-2 sm:px-4 py-1 sm:py-2">
      {/* 1. HEADER DO HUB: LOGO + INSTALAR + SOM + TELA CHEIA + PAIS */}
      <HubHeader onOpenParents={onOpenParents} />

      {/* 2. GRADE DOS 10 JOGOS */}
      <div className="w-full flex-1 min-h-0 flex items-center justify-center p-1 sm:p-2 lg:p-4 z-10">
        <div className="w-full max-w-7xl 2xl:max-w-[1440px] h-full flex flex-col justify-center">
          <div className="w-full h-full max-h-[85vh] landscape:max-h-[75vh] sm:max-h-[78vh] sm:h-auto sm:aspect-[5/2.25] grid grid-cols-2 grid-rows-5 landscape:grid-cols-5 landscape:grid-rows-2 sm:grid-cols-5 sm:grid-rows-2 gap-2 sm:gap-3.5 lg:gap-4">
            {allActivities.map((act) => (
              <motion.button
                key={act.id}
                whileHover={{ scale: 1.035, y: -3 }}
                whileTap={{ scale: 0.94, y: 3 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                onClick={() => {
                  sounds.playPop();
                  onSelectGame(act.id);
                }}
                className={`kid-btn group relative w-full h-full rounded-2xl sm:rounded-3xl border-3 sm:border-4 ${act.borderColor} bg-gradient-to-br ${act.gradient} flex flex-col items-center justify-between p-1.5 sm:p-2.5 overflow-hidden`}
                style={{
                  boxShadow: `0 7px 0 ${act.shadowBorder}, 0 12px 20px -4px rgba(0,0,0,0.22), inset 0 2px 0 rgba(255,255,255,0.5)`,
                }}
              >
                {/* Brilho Gloss Superior Estilo Brinquedo */}
                <div className="toy-gloss" />
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-white/15 rounded-full pointer-events-none" />

                {/* Tag de Categoria Sutil no Topo */}
                <div className="self-start z-10">
                  <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-white/30 text-white border border-white/40 backdrop-blur-xs shadow-xs">
                    {act.category}
                  </span>
                </div>

                {/* Ícone Central Puro e Destacado com Sombra Suave */}
                <div className="relative flex-1 flex items-center justify-center w-full min-h-0 py-0.5 sm:py-1">
                  <span className="text-5xl landscape:text-4xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)] select-none group-hover:scale-115 group-hover:rotate-2 transition-transform duration-200">
                    {act.emoji}
                  </span>
                </div>

                {/* Placa do Título com Contraste Alto e Cantos Arredondados */}
                <div className="w-full bg-white/95 py-1 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl border border-white/80 shadow-xs z-10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="font-black text-[11px] landscape:text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-800 tracking-tight leading-tight text-center break-words">
                    {act.title}
                  </span>
                  <span className="hidden sm:inline text-[9px] md:text-[11px] lg:text-xs font-bold text-slate-500 whitespace-nowrap leading-none mt-0.5">
                    {act.sub}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
