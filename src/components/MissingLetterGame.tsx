"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight, Sparkles } from "lucide-react";

interface WordChallenge {
  id: string;
  missingLetter: string;
  restOfWord: string;
  fullName: string;
  options: string[];
  emoji: string;
  hint: string;
  bgGradient: string;
  borderColor: string;
}

const wordChallenges: WordChallenge[] = [
  {
    id: "leao",
    missingLetter: "L",
    restOfWord: "E Ã O",
    fullName: "LEÃO",
    options: ["L", "M", "B"],
    emoji: "🦁",
    hint: "Rei da Floresta!",
    bgGradient: "from-amber-400 via-yellow-500 to-amber-600",
    borderColor: "border-amber-600",
  },
  {
    id: "dino",
    missingLetter: "D",
    restOfWord: "I N O",
    fullName: "DINO",
    options: ["D", "T", "G"],
    emoji: "🦖",
    hint: "Grande Dinossauro!",
    bgGradient: "from-emerald-400 via-green-500 to-teal-600",
    borderColor: "border-emerald-600",
  },
  {
    id: "carro",
    missingLetter: "C",
    restOfWord: "A R R O",
    fullName: "CARRO",
    options: ["C", "F", "P"],
    emoji: "🚗",
    hint: "Vrum Vrum!",
    bgGradient: "from-rose-400 via-red-500 to-rose-600",
    borderColor: "border-rose-600",
  },
  {
    id: "arca",
    missingLetter: "A",
    restOfWord: "R C A",
    fullName: "ARCA",
    options: ["A", "O", "E"],
    emoji: "🛳️",
    hint: "A Arca de Noé!",
    bgGradient: "from-sky-400 via-blue-500 to-indigo-600",
    borderColor: "border-blue-600",
  },
  {
    id: "israel",
    missingLetter: "I",
    restOfWord: "S R A E L",
    fullName: "ISRAEL",
    options: ["I", "U", "Y"],
    emoji: "👑",
    hint: "O Pequeno Campeão!",
    bgGradient: "from-purple-400 via-fuchsia-500 to-amber-500",
    borderColor: "border-purple-600",
  },
  {
    id: "ovelha",
    missingLetter: "O",
    restOfWord: "V E L H A",
    fullName: "OVELHA",
    options: ["O", "A", "U"],
    emoji: "🐑",
    hint: "Mééé! Tão fofinha!",
    bgGradient: "from-teal-400 via-cyan-500 to-emerald-500",
    borderColor: "border-teal-600",
  },
  {
    id: "peixe",
    missingLetter: "P",
    restOfWord: "E I X E",
    fullName: "PEIXE",
    options: ["P", "B", "T"],
    emoji: "🐟",
    hint: "Glub glub no mar!",
    bgGradient: "from-cyan-400 via-sky-500 to-blue-600",
    borderColor: "border-cyan-600",
  },
  {
    id: "maca",
    missingLetter: "M",
    restOfWord: "A Ç Ã",
    fullName: "MAÇÃ",
    options: ["M", "N", "W"],
    emoji: "🍎",
    hint: "Frutinha gostosa!",
    bgGradient: "from-red-400 via-rose-500 to-red-600",
    borderColor: "border-red-600",
  },
  {
    id: "sol",
    missingLetter: "S",
    restOfWord: "O L",
    fullName: "SOL",
    options: ["S", "C", "Z"],
    emoji: "☀️",
    hint: "Brilha no céu azul!",
    bgGradient: "from-yellow-300 via-amber-400 to-orange-500",
    borderColor: "border-amber-500",
  },
  {
    id: "bola",
    missingLetter: "B",
    restOfWord: "O L A",
    fullName: "BOLA",
    options: ["B", "D", "P"],
    emoji: "⚽",
    hint: "Gol do Israel!",
    bgGradient: "from-emerald-400 via-teal-500 to-green-600",
    borderColor: "border-emerald-600",
  },
  {
    id: "biblia",
    missingLetter: "B",
    restOfWord: "Í B L I A",
    fullName: "BÍBLIA",
    options: ["B", "P", "R"],
    emoji: "📖",
    hint: "Palavra de Deus!",
    bgGradient: "from-indigo-400 via-purple-500 to-violet-600",
    borderColor: "border-indigo-600",
  },
  {
    id: "uva",
    missingLetter: "U",
    restOfWord: "V A",
    fullName: "UVA",
    options: ["U", "O", "I"],
    emoji: "🍇",
    hint: "Uvinhas docinhas!",
    bgGradient: "from-purple-400 via-violet-500 to-pink-600",
    borderColor: "border-purple-600",
  },
  {
    id: "gato",
    missingLetter: "G",
    restOfWord: "A T O",
    fullName: "GATO",
    options: ["G", "C", "J"],
    emoji: "🐱",
    hint: "Miau miau!",
    bgGradient: "from-orange-400 via-amber-500 to-yellow-600",
    borderColor: "border-orange-600",
  },
  {
    id: "trem",
    missingLetter: "T",
    restOfWord: "R E M",
    fullName: "TREM",
    options: ["T", "D", "P"],
    emoji: "🚂",
    hint: "Piuí nos trilhos!",
    bgGradient: "from-blue-400 via-indigo-500 to-slate-600",
    borderColor: "border-blue-600",
  },
  {
    id: "estrela",
    missingLetter: "E",
    restOfWord: "S T R E L A",
    fullName: "ESTRELA",
    options: ["E", "A", "I"],
    emoji: "⭐",
    hint: "Brilha na noite!",
    bgGradient: "from-yellow-300 via-amber-400 to-yellow-500",
    borderColor: "border-yellow-600",
  },
  {
    id: "rei",
    missingLetter: "R",
    restOfWord: "E I",
    fullName: "REI",
    options: ["R", "L", "S"],
    emoji: "🤴",
    hint: "Rei do castelo!",
    bgGradient: "from-amber-400 via-yellow-500 to-purple-600",
    borderColor: "border-amber-600",
  },
  {
    id: "coracao",
    missingLetter: "C",
    restOfWord: "O R A Ç Ã O",
    fullName: "CORAÇÃO",
    options: ["C", "K", "S"],
    emoji: "❤️",
    hint: "Muito amor e carinho!",
    bgGradient: "from-pink-400 via-rose-500 to-red-600",
    borderColor: "border-rose-600",
  },
  {
    id: "fogo",
    missingLetter: "F",
    restOfWord: "O G O",
    fullName: "FOGO",
    options: ["F", "V", "P"],
    emoji: "🔥",
    hint: "Quentinho e brilhante!",
    bgGradient: "from-amber-500 via-orange-500 to-red-600",
    borderColor: "border-orange-600",
  },
];

export function MissingLetterGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongShakeLetter, setWrongShakeLetter] = useState<string | null>(null);

  const current = wordChallenges[currentIdx];

  const handlePickLetter = (letter: string) => {
    if (isCompleted) return;

    if (letter === current.missingLetter) {
      sounds.playSuccess();
      setIsCompleted(true);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    } else {
      sounds.playBoing();
      setWrongShakeLetter(letter);
      setTimeout(() => setWrongShakeLetter(null), 450);
    }
  };

  const handleNext = () => {
    sounds.playStar();
    setCurrentIdx((i) => (i + 1) % wordChallenges.length);
    setIsCompleted(false);
    setWrongShakeLetter(null);
  };

  const handleReset = () => {
    sounds.playBoing();
    setIsCompleted(false);
    setWrongShakeLetter(null);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Topo com Placar e Botão de Reset */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-coral shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-rose-100 border-2 border-rose-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-inner">
          <span className="text-xl sm:text-2xl">🔤</span>
          <span className="text-sm sm:text-xl font-black text-rose-900">
            Letra Mágica: {currentIdx + 1} / {wordChallenges.length}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-kid flex-shrink-0"
          title="Recomeçar"
        >
          <RotateCcw size={18} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Cenário: CARTÃO VISUAL DE ALTA QUALIDADE COM ÍCONE REAL */}
      <div className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 rounded-3xl sm:rounded-4xl border-4 sm:border-8 border-kids-coral shadow-2xl p-2 sm:p-4 flex flex-col items-center justify-between overflow-hidden">
        {/* Cartão de Exibição do Ícone */}
        <div className="relative flex-1 min-h-0 w-full max-h-[40vh] flex items-center justify-center p-1 sm:p-2">
          <div
            className={`relative w-44 h-44 sm:w-60 sm:h-60 rounded-3xl sm:rounded-4xl border-4 sm:border-6 ${
              current.borderColor
            } bg-gradient-to-br ${current.bgGradient} shadow-kid-lg flex flex-col items-center justify-center transition-all duration-300 ${
              isCompleted ? "scale-105" : "scale-100"
            }`}
          >
            {/* Brilho de fundo */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20 rounded-t-3xl pointer-events-none" />

            {/* Ícone Gigante de Alta Fidelidade */}
            <span
              className={`text-7xl sm:text-9xl transition-transform duration-300 drop-shadow-xl select-none ${
                isCompleted ? "scale-110" : "scale-100"
              }`}
            >
              {current.emoji}
            </span>

            {/* Dica da Palavra */}
            <div className="mt-2 bg-white/90 px-3 py-0.5 rounded-full border border-white/60 shadow-sm">
              <span className="text-[11px] sm:text-xs font-black text-slate-800 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" /> {current.hint}
              </span>
            </div>
          </div>
        </div>

        {/* Palavra com o Espaço da Letra que Falta */}
        <div className="bg-white/95 px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-yellow shadow-kid flex items-center gap-2 sm:gap-3 z-10 flex-shrink-0">
          {/* Caixa da Letra que Falta */}
          <div
            className={`w-11 h-13 sm:w-16 sm:h-18 rounded-xl sm:rounded-2xl border-3 sm:border-4 flex items-center justify-center font-black text-2xl sm:text-5xl transition-all ${
              isCompleted
                ? "bg-kids-green text-white border-emerald-700 scale-105 shadow-kid"
                : "bg-amber-100 text-amber-950 border-dashed border-amber-500"
            }`}
          >
            {isCompleted ? current.missingLetter : "?"}
          </div>

          {/* Resto da Palavra */}
          <span className="font-black text-xl sm:text-4xl text-slate-800 tracking-wider">
            {current.restOfWord}
          </span>
        </div>

        {/* Modal de Vitória ao Completar a Palavra */}
        {isCompleted && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-7xl sm:text-8xl mb-1">{current.emoji}</span>
            <div className="text-2xl sm:text-4xl font-black text-kids-coral mb-1">
              {current.fullName}! ⭐
            </div>
            <div className="text-sm sm:text-lg font-bold text-slate-700 mb-4">
              Muito bem, Israel! Você completou a palavra!
            </div>
            <button
              onClick={handleNext}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-lg sm:text-2xl px-6 sm:px-10 py-3 sm:py-4 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-2"
            >
              <span>MAIS PALAVRAS!</span>
              <ArrowRight size={24} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* Caixa de Letras Grandes para o Israel Escolher */}
      {!isCompleted && (
        <div className="w-full bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-blue shadow-kid flex items-center justify-around gap-2 sm:gap-3 z-20 flex-shrink-0">
          {current.options.map((letter) => {
            const isWrong = wrongShakeLetter === letter;

            return (
              <button
                key={letter}
                onClick={() => handlePickLetter(letter)}
                className={`kid-btn flex-1 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 font-black text-2xl sm:text-4xl transition-all ${
                  isWrong
                    ? "bg-rose-200 border-rose-500 text-rose-950 animate-wiggle"
                    : "bg-kids-yellow border-amber-500 hover:bg-amber-300 text-amber-950 shadow-kid active:scale-95"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
