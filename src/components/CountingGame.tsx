"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight } from "lucide-react";

interface CountChallenge {
  id: number;
  emoji: string;
  count: number;
  options: number[];
  name: string;
}

const challenges: CountChallenge[] = [
  { id: 1, emoji: "🦁", count: 3, options: [2, 3, 4], name: "Leõezinhos" },
  { id: 2, emoji: "🚗", count: 4, options: [3, 4, 5], name: "Carrinhos" },
  { id: 3, emoji: "🛳️", count: 2, options: [1, 2, 3], name: "Arcas de Noé" },
  { id: 4, emoji: "🦖", count: 5, options: [4, 5, 6], name: "Dinos" },
  { id: 5, emoji: "🐑", count: 3, options: [1, 3, 4], name: "Ovelhinhas" },
  { id: 6, emoji: "🚒", count: 1, options: [1, 2, 3], name: "Bombeiros" },
];

export function CountingGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [tappedItems, setTappedItems] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const current = challenges[currentIdx];

  const handleTapItem = (index: number) => {
    sounds.playPop();
    if (!tappedItems.includes(index)) {
      setTappedItems((prev) => [...prev, index]);
    }
  };

  const handleChooseNumber = (num: number) => {
    if (isSuccess) return;

    if (num === current.count) {
      sounds.playSuccess();
      setIsSuccess(true);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    } else {
      sounds.playBoing();
    }
  };

  const nextChallenge = () => {
    sounds.playStar();
    setCurrentIdx((i) => (i + 1) % challenges.length);
    setTappedItems([]);
    setIsSuccess(false);
  };

  const handleReset = () => {
    sounds.playBoing();
    setTappedItems([]);
    setIsSuccess(false);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Placar e Botão de Reset */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-orange shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-100 border-2 border-amber-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-inner">
          <span className="text-2xl sm:text-3xl animate-bounce">🔢</span>
          <span className="text-base sm:text-2xl font-black text-amber-900">
            Contar: {tappedItems.length} / {current.count}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-slate-300 shadow-kid flex-shrink-0"
          title="Recomeçar"
        >
          <RotateCcw size={20} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Cenário com os Itens para Contar (O Israel pode tocar em cada um!) */}
      <div className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-200 rounded-3xl sm:rounded-4xl border-6 sm:border-8 border-kids-yellow shadow-2xl p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden">
        {/* Nuvens suaves */}
        <div className="absolute top-4 left-6 text-4xl opacity-40 animate-float pointer-events-none">☁️</div>
        <div className="absolute top-8 right-8 text-4xl opacity-40 animate-float-delayed pointer-events-none">☁️</div>

        {!isSuccess ? (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 max-w-lg z-10">
            {[...Array(current.count)].map((_, idx) => {
              const isTapped = tappedItems.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleTapItem(idx)}
                  className={`kid-btn relative p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 transition-all duration-200 ${
                    isTapped
                      ? "bg-white border-kids-green scale-110 shadow-kid-lg ring-3 sm:ring-4 ring-green-300"
                      : "bg-white/80 border-amber-300 shadow-kid hover:scale-105"
                  }`}
                >
                  <span className="text-5xl sm:text-7xl">{current.emoji}</span>
                  {isTapped && (
                    <span className="absolute -top-2.5 -right-2.5 bg-kids-green text-white font-black text-xs sm:text-base w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center shadow">
                      {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Vitória */
          <div className="flex flex-col items-center justify-center text-center z-20 animate-bounce">
            <div className="text-7xl sm:text-9xl mb-2">{current.emoji}</div>
            <div className="text-4xl sm:text-5xl font-black text-kids-coral drop-shadow mb-2">
              {current.count}! ⭐
            </div>
            <button
              onClick={nextChallenge}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-xl sm:text-3xl px-8 py-3.5 sm:py-4 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3 animate-pulse-gentle"
            >
              <span>MAIS!</span>
              <ArrowRight size={30} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* Opções de Números Gigantes no Rodapé */}
      {!isSuccess && (
        <div className="w-full bg-white/95 backdrop-blur-md p-2 sm:p-3 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-blue shadow-kid flex items-center justify-around gap-2 sm:gap-3 z-20 flex-shrink-0">
          {current.options.map((num) => (
            <button
              key={num}
              onClick={() => handleChooseNumber(num)}
              className="kid-btn flex-1 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border-3 sm:border-4 bg-kids-yellow border-amber-600 hover:bg-amber-300 active:scale-95 shadow-kid text-3xl sm:text-5xl font-black text-amber-950 transition-all"
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
