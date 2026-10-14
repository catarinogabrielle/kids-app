"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight } from "lucide-react";

interface WordChallenge {
  id: string;
  missingLetter: string;
  restOfWord: string;
  options: string[];
  emoji: string;
  color: string;
  svgIllustration: (isColored: boolean) => React.ReactNode;
}

const wordChallenges: WordChallenge[] = [
  {
    id: "leao",
    missingLetter: "L",
    restOfWord: "E Ã O",
    options: ["L", "M", "B"],
    emoji: "🦁",
    color: "from-amber-400 to-yellow-500",
    svgIllustration: (isColored: boolean) => (
      <svg viewBox="0 0 300 240" className="w-full h-full max-h-[40vh] transition-all duration-500 select-none">
        {/* Juba do Leão */}
        <circle
          cx="150"
          cy="120"
          r="80"
          fill={isColored ? "#F59E0B" : "#FFFFFF"}
          stroke="#1E293B"
          strokeWidth="6"
        />
        {/* Rosto do Leão */}
        <circle
          cx="150"
          cy="120"
          r="54"
          fill={isColored ? "#FDE047" : "#FFFFFF"}
          stroke="#1E293B"
          strokeWidth="5"
        />
        {/* Olhinhos felizes */}
        <circle cx="132" cy="112" r="8" fill="#1E293B" />
        <circle cx="135" cy="110" r="3" fill="#FFFFFF" />
        <circle cx="168" cy="112" r="8" fill="#1E293B" />
        <circle cx="171" cy="110" r="3" fill="#FFFFFF" />
        {/* Nariz */}
        <polygon points="144,126 156,126 150,135" fill={isColored ? "#EF4444" : "#1E293B"} />
        {/* Sorriso */}
        <path d="M 138 138 Q 150 148 162 138" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Orelhas */}
        <circle cx="95" cy="75" r="20" fill={isColored ? "#F59E0B" : "#FFFFFF"} stroke="#1E293B" strokeWidth="4" />
        <circle cx="205" cy="75" r="20" fill={isColored ? "#F59E0B" : "#FFFFFF"} stroke="#1E293B" strokeWidth="4" />
      </svg>
    ),
  },
  {
    id: "dino",
    missingLetter: "D",
    restOfWord: "I N O",
    options: ["D", "T", "G"],
    emoji: "🦖",
    color: "from-emerald-400 to-green-600",
    svgIllustration: (isColored: boolean) => (
      <svg viewBox="0 0 300 240" className="w-full h-full max-h-[40vh] transition-all duration-500 select-none">
        {/* Corpo do Dino */}
        <path
          d="M 110 170 C 90 100 170 50 220 80 C 250 95 260 130 230 150 C 260 170 270 210 230 230 C 180 240 120 230 110 170 Z"
          fill={isColored ? "#10B981" : "#FFFFFF"}
          stroke="#1E293B"
          strokeWidth="6"
        />
        {/* Barriga */}
        <path
          d="M 140 160 Q 180 220 220 190 Q 200 150 140 160"
          fill={isColored ? "#A7F3D0" : "#FFFFFF"}
          stroke="#1E293B"
          strokeWidth="4"
        />
        {/* Olho e Sorriso */}
        <circle cx="210" cy="98" r="8" fill="#1E293B" />
        <circle cx="212" cy="96" r="3" fill="#FFFFFF" />
        <path d="M 215 118 Q 230 128 225 110" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Espinhos */}
        <polygon points="160,70 170,50 180,72" fill={isColored ? "#F59E0B" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
        <polygon points="135,80 145,60 155,82" fill={isColored ? "#F59E0B" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "carro",
    missingLetter: "C",
    restOfWord: "A R R O",
    options: ["C", "F", "P"],
    emoji: "🚗",
    color: "from-red-400 to-rose-600",
    svgIllustration: (isColored: boolean) => (
      <svg viewBox="0 0 300 240" className="w-full h-full max-h-[40vh] transition-all duration-500 select-none">
        {/* Chassi do Carro */}
        <path
          d="M 50 140 L 80 85 Q 90 70 110 70 L 190 70 Q 210 70 220 85 L 250 140 L 265 140 Q 275 140 275 155 L 275 180 Q 275 190 265 190 L 35 190 Q 25 190 25 180 L 25 155 Q 25 140 35 140 Z"
          fill={isColored ? "#EF4444" : "#FFFFFF"}
          stroke="#1E293B"
          strokeWidth="6"
        />
        {/* Janelas */}
        <rect x="90" y="80" width="45" height="45" rx="6" fill={isColored ? "#BAE6FD" : "#FFFFFF"} stroke="#1E293B" strokeWidth="4" />
        <rect x="145" y="80" width="55" height="45" rx="6" fill={isColored ? "#BAE6FD" : "#FFFFFF"} stroke="#1E293B" strokeWidth="4" />
        {/* Farol */}
        <circle cx="265" cy="155" r="12" fill={isColored ? "#FBBF24" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
        {/* Rodas */}
        <circle cx="85" cy="190" r="26" fill={isColored ? "#1E293B" : "#FFFFFF"} stroke="#1E293B" strokeWidth="5" />
        <circle cx="85" cy="190" r="10" fill={isColored ? "#94A3B8" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
        <circle cx="215" cy="190" r="26" fill={isColored ? "#1E293B" : "#FFFFFF"} stroke="#1E293B" strokeWidth="5" />
        <circle cx="215" cy="190" r="10" fill={isColored ? "#94A3B8" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "arca",
    missingLetter: "A",
    restOfWord: "R C A",
    options: ["A", "O", "E"],
    emoji: "🛳️",
    color: "from-blue-400 to-sky-600",
    svgIllustration: (isColored: boolean) => (
      <svg viewBox="0 0 300 240" className="w-full h-full max-h-[40vh] transition-all duration-500 select-none">
        {/* Casco */}
        <path
          d="M 60 140 L 95 195 Q 150 205 205 195 L 240 140 Z"
          fill={isColored ? "#92400E" : "#FFFFFF"}
          stroke="#1E293B"
          strokeWidth="6"
        />
        {/* Cabine */}
        <rect x="110" y="100" width="80" height="42" rx="6" fill={isColored ? "#D97706" : "#FFFFFF"} stroke="#1E293B" strokeWidth="4" />
        <polygon points="95,102 150,65 205,102" fill={isColored ? "#DC2626" : "#FFFFFF"} stroke="#1E293B" strokeWidth="4" />
        {/* Bichinhos espiando */}
        <text x="122" y="128" fontSize="20">🦒</text>
        <text x="152" y="128" fontSize="20">🦁</text>
      </svg>
    ),
  },
  {
    id: "israel",
    missingLetter: "I",
    restOfWord: "S R A E L",
    options: ["I", "U", "Y"],
    emoji: "👑",
    color: "from-purple-400 to-amber-500",
    svgIllustration: (isColored: boolean) => (
      <svg viewBox="0 0 300 240" className="w-full h-full max-h-[40vh] transition-all duration-500 select-none">
        {/* Coroa Dourada do Campeão Israel */}
        <polygon
          points="60,170 80,90 120,130 150,60 180,130 220,90 240,170"
          fill={isColored ? "#FBBF24" : "#FFFFFF"}
          stroke="#1E293B"
          strokeWidth="6"
        />
        {/* Joias da coroa */}
        <circle cx="80" cy="90" r="10" fill={isColored ? "#EF4444" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
        <circle cx="150" cy="60" r="12" fill={isColored ? "#38BDF8" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
        <circle cx="220" cy="90" r="10" fill={isColored ? "#10B981" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
        <circle cx="150" cy="140" r="14" fill={isColored ? "#EC4899" : "#FFFFFF"} stroke="#1E293B" strokeWidth="3" />
      </svg>
    ),
  },
];

export function MissingLetterGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const current = wordChallenges[currentIdx];

  const handlePickLetter = (letter: string) => {
    if (isCompleted) return;

    if (letter === current.missingLetter) {
      sounds.playSuccess();
      setIsCompleted(true);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    } else {
      sounds.playBoing();
    }
  };

  const handleNext = () => {
    sounds.playStar();
    setCurrentIdx((i) => (i + 1) % wordChallenges.length);
    setIsCompleted(false);
  };

  const handleReset = () => {
    sounds.playBoing();
    setIsCompleted(false);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Topo com Placar e Botão de Reset */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-coral shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-rose-100 border-2 border-rose-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-inner">
          <span className="text-2xl sm:text-3xl animate-bounce">🔤</span>
          <span className="text-base sm:text-2xl font-black text-rose-900">
            Letra Mágica
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

      {/* Cenário: DESENHO QUE GANHA COR AO COLOCAR A LETRA CERTA */}
      <div className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 rounded-3xl sm:rounded-4xl border-6 sm:border-8 border-kids-coral shadow-2xl p-2 sm:p-4 flex flex-col items-center justify-between overflow-hidden">
        {/* A Ilustração (Começa em traço preto/branco e explode em cor com a resposta certa!) */}
        <div className={`relative flex-1 min-h-0 w-full flex items-center justify-center p-1 sm:p-2 transition-transform duration-500 ${isCompleted ? "scale-105" : ""}`}>
          {current.svgIllustration(isCompleted)}
        </div>

        {/* Palavra com o Espaço da Letra que Falta */}
        <div className="bg-white/95 px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-yellow shadow-kid flex items-center gap-2 sm:gap-3 z-10 flex-shrink-0">
          {/* Caixa da Letra que Falta */}
          <div
            className={`w-12 h-14 sm:w-16 sm:h-18 rounded-xl sm:rounded-2xl border-3 sm:border-4 flex items-center justify-center font-black text-3xl sm:text-5xl transition-all ${
              isCompleted
                ? "bg-kids-green text-white border-emerald-700 scale-105 shadow-kid animate-wiggle"
                : "bg-amber-100 text-amber-950 border-dashed border-amber-500 animate-pulse-gentle"
            }`}
          >
            {isCompleted ? current.missingLetter : "?"}
          </div>

          {/* Resto da Palavra */}
          <span className="font-black text-2xl sm:text-4xl text-slate-800 tracking-wider">
            {current.restOfWord}
          </span>
        </div>

        {/* Botão de Próxima Palavra ao Completar */}
        {isCompleted && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center animate-bounce p-4 text-center">
            <span className="text-7xl sm:text-8xl mb-2">{current.emoji}</span>
            <div className="text-3xl sm:text-4xl font-black text-kids-coral mb-3">
              PARABÉNS, ISRAEL! ⭐
            </div>
            <button
              onClick={handleNext}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-xl sm:text-2xl px-8 py-3.5 sm:py-4 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3 animate-pulse-gentle"
            >
              <span>MAIS PALAVRAS!</span>
              <ArrowRight size={28} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* Caixa de Letras Gigantes para o Israel Escolher */}
      {!isCompleted && (
        <div className="w-full bg-white/95 backdrop-blur-md p-2 sm:p-3 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-blue shadow-kid flex items-center justify-around gap-2 sm:gap-3 z-20 flex-shrink-0">
          {current.options.map((letter) => (
            <button
              key={letter}
              onClick={() => handlePickLetter(letter)}
              className="kid-btn flex-1 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border-3 sm:border-4 bg-kids-yellow border-amber-600 hover:bg-amber-300 active:scale-95 shadow-kid text-3xl sm:text-5xl font-black text-amber-950 transition-transform"
            >
              {letter}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
