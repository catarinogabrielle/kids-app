"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight } from "lucide-react";

interface ItemType {
  emoji: string;
  name: string;
}

const ITEM_POOL: ItemType[] = [
  { emoji: "🦁", name: "Leõezinhos" },
  { emoji: "🚗", name: "Carrinhos" },
  { emoji: "🦖", name: "Dinossauros" },
  { emoji: "🐑", name: "Ovelhinhas" },
  { emoji: "🛳️", name: "Arcas de Noé" },
  { emoji: "🚒", name: "Caminhões de Bombeiro" },
  { emoji: "👑", name: "Coroas do Rei" },
  { emoji: "🍎", name: "Maçãs Gostosas" },
  { emoji: "🎈", name: "Balões Coloridos" },
  { emoji: "🐟", name: "Peixinhos do Mar" },
  { emoji: "⭐", name: "Estrelinhas" },
  { emoji: "🐶", name: "Cachorrinhos" },
  { emoji: "🐱", name: "Gatinhos" },
  { emoji: "✈️", name: "Aviõezinhos" },
  { emoji: "🍓", name: "Morangos" },
  { emoji: "🐵", name: "Macaquinhos" },
  { emoji: "🚜", name: "Tratores" },
  { emoji: "🍇", name: "Uvinhas" },
  { emoji: "🍦", name: "Sorvetes" },
  { emoji: "🚀", name: "Foguetes" },
  { emoji: "🚂", name: "Trenzinhos" },
  { emoji: "⚽", name: "Bolas de Futebol" },
];

interface CountChallenge {
  emoji: string;
  count: number;
  options: number[];
  name: string;
}

function generateRandomChallenge(prevEmoji?: string, prevCount?: number): CountChallenge {
  const availableItems = ITEM_POOL.filter((it) => it.emoji !== prevEmoji);
  const item = availableItems[Math.floor(Math.random() * availableItems.length)] || ITEM_POOL[0];

  let count = Math.floor(Math.random() * 8) + 1;
  if (count === prevCount) {
    count = (count % 8) + 1;
  }

  const optionsSet = new Set<number>([count]);
  while (optionsSet.size < 3) {
    const delta = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 2) + 1);
    const candidate = count + delta;
    if (candidate >= 1 && candidate <= 10) {
      optionsSet.add(candidate);
    } else {
      const fallback = Math.floor(Math.random() * 8) + 1;
      optionsSet.add(fallback);
    }
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    emoji: item.emoji,
    count,
    name: item.name,
    options,
  };
}

export function CountingGame() {
  const [current, setCurrent] = useState<CountChallenge>(() => generateRandomChallenge());
  const [tappedItems, setTappedItems] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wrongShakeNum, setWrongShakeNum] = useState<number | null>(null);
  const [score, setScore] = useState(0);

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
      setScore((s) => s + 1);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    } else {
      sounds.playBoing();
      setWrongShakeNum(num);
      setTimeout(() => setWrongShakeNum(null), 450);
    }
  };

  const nextChallenge = () => {
    sounds.playStar();
    setCurrent((prev) => generateRandomChallenge(prev.emoji, prev.count));
    setTappedItems([]);
    setIsSuccess(false);
    setWrongShakeNum(null);
  };

  const handleReset = () => {
    sounds.playBoing();
    setCurrent((prev) => generateRandomChallenge(prev.emoji, prev.count));
    setTappedItems([]);
    setIsSuccess(false);
    setWrongShakeNum(null);
  };

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden bg-gradient-to-b from-sky-400 via-sky-100 to-emerald-300">
      {/* PALCO CENTRAL FULL-SCREEN: Cenário com os Itens Gigantes para Contar */}
      <div className="relative flex-1 min-h-0 w-full p-3 sm:p-6 pt-16 sm:pt-20 flex flex-col items-center justify-center overflow-hidden">
        {/* HUD Flutuante no Topo */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-30">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md border-3 sm:border-4 border-kids-orange px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-2xl shadow-lg">
            <span className="text-2xl sm:text-3xl">🔢</span>
            <span className="text-sm sm:text-2xl font-black text-amber-950">
              Contados: {tappedItems.length} de {current.count} {current.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/95 backdrop-blur-md border-3 sm:border-4 border-emerald-500 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-emerald-950 font-black text-sm sm:text-xl shadow-lg">
              ⭐ {score}
            </div>

            <button
              onClick={handleReset}
              className="kid-btn bg-white/95 hover:bg-slate-100 text-slate-700 p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 border-slate-300 shadow-lg flex-shrink-0"
              title="Sortear outro"
            >
              <RotateCcw size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Nuvens suaves estáticas */}
        <div className="absolute top-16 left-8 text-5xl opacity-40 pointer-events-none">☁️</div>
        <div className="absolute top-20 right-10 text-5xl opacity-40 pointer-events-none">☁️</div>

        {!isSuccess ? (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 max-w-4xl w-full z-10 max-h-full overflow-y-auto scrollbar-none py-2">
            {[...Array(current.count)].map((_, idx) => {
              const isTapped = tappedItems.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleTapItem(idx)}
                  className={`kid-btn relative p-3.5 sm:p-6 rounded-3xl sm:rounded-4xl border-4 transition-all duration-200 ${
                    isTapped
                      ? "bg-white border-kids-green scale-105 shadow-2xl ring-4 ring-green-300"
                      : "bg-white/90 border-amber-400 shadow-kid-lg active:scale-95"
                  }`}
                >
                  <span className="text-5xl sm:text-7xl md:text-8xl">{current.emoji}</span>
                  {isTapped && (
                    <span className="absolute -top-2.5 -right-2.5 bg-kids-green text-white font-black text-sm sm:text-lg w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                      {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Vitória Full-Screen */
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-4">
            <div className="text-7xl sm:text-9xl mb-2">{current.emoji}</div>
            <div className="text-4xl sm:text-6xl font-black text-kids-coral drop-shadow mb-2">
              {current.count} {current.name}! ⭐
            </div>
            <div className="text-base sm:text-2xl font-bold text-slate-700 mb-6">
              Parabéns, Israel! Você contou direitinho!
            </div>
            <button
              onClick={nextChallenge}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-xl sm:text-3xl px-8 sm:px-12 py-4 sm:py-5 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3"
            >
              <span>CONTAR MAIS!</span>
              <ArrowRight size={30} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* DOCK INFERIOR FULL-WIDTH: Opções de Números Gigantes (com Safe Area) */}
      {!isSuccess && (
        <div className="w-full bg-white/95 backdrop-blur-md px-3 sm:px-6 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] border-t-4 border-kids-blue shadow-[0_-8px_25px_rgba(0,0,0,0.12)] z-20 flex-shrink-0">
          <div className="max-w-4xl mx-auto w-full flex items-center justify-around gap-3 sm:gap-5">
            {current.options.map((num) => {
              const isWrong = wrongShakeNum === num;

              return (
                <button
                  key={num}
                  onClick={() => handleChooseNumber(num)}
                  className={`kid-btn flex-1 py-3 sm:py-5 rounded-2xl sm:rounded-3xl border-4 font-black text-3xl sm:text-5xl transition-all ${
                    isWrong
                      ? "bg-rose-200 border-rose-500 text-rose-950 animate-wiggle"
                      : "bg-kids-yellow border-amber-500 hover:bg-amber-300 text-amber-950 shadow-kid active:scale-95"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
