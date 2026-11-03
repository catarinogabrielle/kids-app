"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { GameHeader } from "@/components/TopBar";
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

export function CountingGame({ onHome }: { onHome?: () => void }) {
  const [current, setCurrent] = useState<CountChallenge>(() => generateRandomChallenge());
  const [tappedItems, setTappedItems] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wrongShakeNum, setWrongShakeNum] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const handleTapItem = (index: number) => {
    sounds.playScale(index + 1);
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
      <GameHeader
        onHome={onHome}
        title="Contar Criação"
        icon="🔢"
        leftControls={
          <div className="flex items-center gap-1 bg-white/95 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-kids-orange shadow-sm">
            <span className="text-base sm:text-xl">🔢</span>
            <span className="text-xs sm:text-sm font-black text-amber-950">
              Contados: {tappedItems.length} de {current.count}
            </span>
          </div>
        }
        rightControls={
          <div className="flex items-center gap-1">
            <div className="bg-white/95 border border-emerald-500 px-2 py-0.5 rounded-xl text-emerald-950 font-black text-xs shadow-sm">
              ⭐ {score}
            </div>
            <button
              onClick={handleReset}
              className="kid-btn bg-white hover:bg-slate-100 text-slate-700 p-1 sm:p-1.5 rounded-xl border border-slate-300 shadow-sm"
              title="Sortear outro"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        }
      />
      {/* PALCO CENTRAL FULL-SCREEN: Cenário com os Itens Gigantes Proporcionais para Contar */}
      <div className="relative flex-1 min-h-0 w-full p-2 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Nuvens e Sol suave ao fundo */}
        <div className="absolute top-4 left-8 text-4xl sm:text-5xl opacity-50 pointer-events-none animate-float">☁️</div>
        <div className="absolute top-6 right-10 text-4xl sm:text-5xl opacity-50 pointer-events-none animate-float-delayed">☁️</div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-4xl sm:text-6xl opacity-80 pointer-events-none">☀️</div>

        {/* Colinas e Flores no Horizonte Inferior do Cenário */}
        <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-t from-emerald-500/40 to-transparent pointer-events-none flex justify-around items-end pb-2 px-6">
          <span className="text-2xl sm:text-4xl opacity-80">🌸</span>
          <span className="text-xl sm:text-3xl opacity-70">🦋</span>
          <span className="text-2xl sm:text-4xl opacity-80">🌼</span>
          <span className="text-2xl sm:text-4xl opacity-80">🌳</span>
          <span className="text-2xl sm:text-4xl opacity-80">🌸</span>
        </div>

        {/* Banner de Instrução Lúdica */}
        <div className="bg-white/95 backdrop-blur-sm px-4 py-1 rounded-full border-2 border-amber-300 shadow-sm mb-3 z-10">
          <span className="font-black text-xs sm:text-base text-slate-800">
            Toque para contar os {current.name} e escolha o número certo abaixo:
          </span>
        </div>

        {!isSuccess ? (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 max-w-4xl w-full z-10 max-h-full overflow-y-auto scrollbar-none py-2">
            {[...Array(current.count)].map((_, idx) => {
              const isTapped = tappedItems.includes(idx);

              // Escala dinâmica inteligente: quando há poucos itens (1 ou 2), eles crescem como gigantes mágicos!
              const sizeClasses =
                current.count <= 2
                  ? "min-w-[130px] sm:min-w-[190px] md:min-w-[230px] p-5 sm:p-8 rounded-4xl sm:rounded-5xl border-4 sm:border-6 text-7xl sm:text-9xl md:text-[130px]"
                  : current.count <= 4
                  ? "min-w-[100px] sm:min-w-[140px] md:min-w-[170px] p-4 sm:p-6 rounded-3xl sm:rounded-4xl border-3 sm:border-5 text-5xl sm:text-7xl md:text-8xl"
                  : "min-w-[75px] sm:min-w-[100px] md:min-w-[125px] p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-3 sm:border-4 text-4xl sm:text-6xl md:text-7xl";

              return (
                <button
                  key={idx}
                  onClick={() => handleTapItem(idx)}
                  className={`kid-btn relative aspect-square flex items-center justify-center transition-all duration-200 ${sizeClasses} ${
                    isTapped
                      ? "bg-white border-kids-green scale-105 shadow-2xl ring-3 sm:ring-5 ring-green-300 animate-wiggle"
                      : "bg-white/95 border-amber-400 shadow-kid-lg hover:scale-105 active:scale-95 hover:bg-amber-50"
                  }`}
                >
                  <span className="drop-shadow select-none leading-none">{current.emoji}</span>
                  {isTapped && (
                    <span className="absolute -top-3 -right-3 bg-kids-green text-white font-black text-sm sm:text-2xl w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 border-white flex items-center justify-center shadow-lg animate-bounce">
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
            <div className="text-6xl sm:text-9xl mb-2 animate-bounce">{current.emoji}</div>
            <div className="text-2xl sm:text-6xl font-black text-kids-coral drop-shadow mb-1 sm:mb-2">
              {current.count} {current.name}! ⭐
            </div>
            <div className="text-xs sm:text-2xl font-bold text-slate-700 mb-4 sm:mb-6">
              Parabéns, Israel! Você contou direitinho!
            </div>
            <button
              onClick={nextChallenge}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-lg sm:text-3xl px-6 sm:px-12 py-3 sm:py-5 rounded-2xl sm:rounded-4xl border-3 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-2 sm:gap-3"
            >
              <span>CONTAR MAIS!</span>
              <ArrowRight size={24} className="sm:w-7 sm:h-7 stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* DOCK INFERIOR: Opções de Números Proporcionais e Robustos */}
      {!isSuccess && (
        <div className="w-full bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-4 landscape:py-2 border-t-3 sm:border-t-4 border-kids-blue shadow-[0_-8px_25px_rgba(0,0,0,0.12)] z-20 flex-shrink-0">
          <div className="max-w-md sm:max-w-lg mx-auto w-full flex items-center justify-center gap-3 sm:gap-6">
            {current.options.map((num) => {
              const isWrong = wrongShakeNum === num;

              return (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  onClick={() => handleChooseNumber(num)}
                  className={`kid-btn relative overflow-hidden flex-1 h-14 sm:h-20 max-w-[130px] rounded-2xl sm:rounded-3xl border-3 sm:border-5 font-black text-3xl sm:text-5xl flex items-center justify-center transition-all ${
                    isWrong
                      ? "bg-rose-200 border-rose-500 text-rose-950 animate-wiggle"
                      : "kid-btn-yellow shadow-toy-lg"
                  }`}
                >
                  <div className="toy-gloss" />
                  <span className="relative z-10">{num}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
