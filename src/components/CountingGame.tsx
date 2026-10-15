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
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Placar e Botão de Reset */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-orange shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-100 border-2 border-amber-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-inner">
          <span className="text-xl sm:text-2xl">🔢</span>
          <span className="text-xs sm:text-xl font-black text-amber-900">
            Contados: {tappedItems.length} de {current.count} {current.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 border-2 border-emerald-400 px-2.5 py-1 rounded-xl text-emerald-950 font-black text-xs sm:text-sm">
            ⭐ {score}
          </div>

          <button
            onClick={handleReset}
            className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-kid flex-shrink-0"
            title="Sortear outro"
          >
            <RotateCcw size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Cenário com os Itens para Contar (O Israel pode tocar em cada um!) */}
      <div className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-200 rounded-3xl sm:rounded-4xl border-4 sm:border-8 border-kids-yellow shadow-2xl p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden">
        {/* Nuvens suaves estáticas */}
        <div className="absolute top-3 left-4 text-3xl opacity-40 pointer-events-none">☁️</div>
        <div className="absolute top-6 right-6 text-3xl opacity-40 pointer-events-none">☁️</div>

        {!isSuccess ? (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-lg z-10 max-h-full overflow-y-auto scrollbar-none py-1">
            {[...Array(current.count)].map((_, idx) => {
              const isTapped = tappedItems.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleTapItem(idx)}
                  className={`kid-btn relative p-2 sm:p-4 rounded-2xl sm:rounded-3xl border-3 sm:border-4 transition-all duration-200 ${
                    isTapped
                      ? "bg-white border-kids-green scale-105 shadow-kid-lg ring-3 sm:ring-4 ring-green-300"
                      : "bg-white/85 border-amber-300 shadow-kid active:scale-95"
                  }`}
                >
                  <span className="text-4xl sm:text-6xl">{current.emoji}</span>
                  {isTapped && (
                    <span className="absolute -top-2 -right-2 bg-kids-green text-white font-black text-[11px] sm:text-sm w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center shadow">
                      {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Vitória */
          <div className="flex flex-col items-center justify-center text-center z-20 p-2">
            <div className="text-6xl sm:text-8xl mb-1">{current.emoji}</div>
            <div className="text-3xl sm:text-5xl font-black text-kids-coral drop-shadow mb-1">
              {current.count}! ⭐
            </div>
            <div className="text-sm sm:text-lg font-bold text-slate-700 mb-4">
              Parabéns, Israel! São {current.count} {current.name}!
            </div>
            <button
              onClick={nextChallenge}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-lg sm:text-2xl px-6 sm:px-10 py-3 sm:py-4 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-2"
            >
              <span>MAIS!</span>
              <ArrowRight size={24} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* Opções de Números Grandes no Rodapé */}
      {!isSuccess && (
        <div className="w-full bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-blue shadow-kid flex items-center justify-around gap-2 sm:gap-3 z-20 flex-shrink-0">
          {current.options.map((num) => {
            const isWrong = wrongShakeNum === num;

            return (
              <button
                key={num}
                onClick={() => handleChooseNumber(num)}
                className={`kid-btn flex-1 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 font-black text-2xl sm:text-4xl transition-all ${
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
      )}
    </div>
  );
}
