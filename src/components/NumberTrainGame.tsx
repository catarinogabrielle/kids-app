"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight } from "lucide-react";

interface WagonConfig {
  num: number;
  label: string;
  items: string[];
  colorBg: string;
  borderColor: string;
  textColor: string;
}

const WAGONS_1_5: WagonConfig[] = [
  {
    num: 1,
    label: "1 Leão",
    items: ["🦁"],
    colorBg: "bg-amber-400",
    borderColor: "border-amber-600",
    textColor: "text-amber-950",
  },
  {
    num: 2,
    label: "2 Dinos",
    items: ["🦖", "🦖"],
    colorBg: "bg-emerald-500",
    borderColor: "border-emerald-700",
    textColor: "text-white",
  },
  {
    num: 3,
    label: "3 Ovelhas",
    items: ["🐑", "🐑", "🐑"],
    colorBg: "bg-sky-400",
    borderColor: "border-sky-600",
    textColor: "text-sky-950",
  },
  {
    num: 4,
    label: "4 Carros",
    items: ["🚗", "🚗", "🚗", "🚗"],
    colorBg: "bg-rose-500",
    borderColor: "border-rose-700",
    textColor: "text-white",
  },
  {
    num: 5,
    label: "5 Coroas",
    items: ["👑", "👑", "👑", "👑", "👑"],
    colorBg: "bg-purple-500",
    borderColor: "border-purple-700",
    textColor: "text-white",
  },
];

const WAGONS_6_10: WagonConfig[] = [
  {
    num: 6,
    label: "6 Balões",
    items: ["🎈", "🎈", "🎈", "🎈", "🎈", "🎈"],
    colorBg: "bg-pink-400",
    borderColor: "border-pink-600",
    textColor: "text-pink-950",
  },
  {
    num: 7,
    label: "7 Estrelas",
    items: ["⭐", "⭐", "⭐", "⭐", "⭐", "⭐", "⭐"],
    colorBg: "bg-yellow-400",
    borderColor: "border-yellow-600",
    textColor: "text-amber-950",
  },
  {
    num: 8,
    label: "8 Maçãs",
    items: ["🍎", "🍎", "🍎", "🍎", "🍎", "🍎", "🍎", "🍎"],
    colorBg: "bg-red-500",
    borderColor: "border-red-700",
    textColor: "text-white",
  },
  {
    num: 9,
    label: "9 Peixes",
    items: ["🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟"],
    colorBg: "bg-teal-400",
    borderColor: "border-teal-600",
    textColor: "text-teal-950",
  },
  {
    num: 10,
    label: "10 Corações",
    items: ["❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️"],
    colorBg: "bg-indigo-500",
    borderColor: "border-indigo-700",
    textColor: "text-white",
  },
];

export function NumberTrainGame() {
  const [level, setLevel] = useState<"1-5" | "6-10">("1-5");
  const wagons = level === "1-5" ? WAGONS_1_5 : WAGONS_6_10;

  const [placedNumbers, setPlacedNumbers] = useState<number[]>([]);
  const [isTrainMoving, setIsTrainMoving] = useState(false);
  const [wrongShakeNum, setWrongShakeNum] = useState<number | null>(null);

  // Próximo número esperado na ordem (1 -> 2 -> 3 -> 4 -> 5)
  const currentExpectedWagon = wagons[placedNumbers.length] ?? null;
  const expectedNumber = currentExpectedWagon ? currentExpectedWagon.num : null;

  const handlePickNumber = (num: number) => {
    if (isTrainMoving) return;

    if (num === expectedNumber) {
      sounds.playSnap();
      sounds.playChime(600 + num * 40);
      const updated = [...placedNumbers, num];
      setPlacedNumbers(updated);

      if (updated.length === wagons.length) {
        sounds.playWhistle();
        sounds.playSuccess();
        setIsTrainMoving(true);
        confetti({
          particleCount: 120,
          spread: 95,
          origin: { y: 0.5 },
        });
      }
    } else {
      // Tremidinha no número clicado e aviso sonoro suave
      sounds.playBoing();
      setWrongShakeNum(num);
      setTimeout(() => setWrongShakeNum(null), 500);
    }
  };

  const handleReset = () => {
    sounds.playBoing();
    setPlacedNumbers([]);
    setIsTrainMoving(false);
    setWrongShakeNum(null);
  };

  const handleNextLevel = () => {
    sounds.playStar();
    setLevel((l) => (l === "1-5" ? "6-10" : "1-5"));
    setPlacedNumbers([]);
    setIsTrainMoving(false);
    setWrongShakeNum(null);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-5xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Placar e Botões */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-teal shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-teal-100 border-2 border-teal-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-inner">
          <span className="text-2xl sm:text-3xl animate-bounce">🚂</span>
          <span className="text-base sm:text-2xl font-black text-teal-900">
            Trem: {placedNumbers.length} / {wagons.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => sounds.playWhistle()}
            className="kid-btn bg-amber-400 hover:bg-amber-500 text-amber-950 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-amber-600 shadow-kid font-black text-xs sm:text-base flex items-center gap-1"
            title="Tocar Apito"
          >
            <span>📢</span>
            <span>PIUÍ!</span>
          </button>

          <button
            onClick={handleReset}
            className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-slate-300 shadow-kid"
            title="Recomeçar"
          >
            <RotateCcw size={20} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL: O TREM GIGANTE ANIMADO COM TRILHOS */}
      <div className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-300 rounded-3xl sm:rounded-4xl border-6 sm:border-8 border-kids-blue shadow-2xl p-1.5 sm:p-4 flex flex-col justify-end items-center overflow-hidden">
        {/* Nuvens no céu */}
        <div className="absolute top-4 left-10 text-6xl opacity-40 animate-float pointer-events-none">☁️</div>
        <div className="absolute top-10 right-16 text-6xl opacity-40 animate-float-delayed pointer-events-none">☁️</div>
        <div className="absolute top-6 left-1/2 text-5xl opacity-80 pointer-events-none">☀️</div>

        {/* O Comboio do Trem (Locomotiva + Vagões Gigantes) */}
        <div className="relative w-full overflow-x-auto pb-4 scrollbar-none flex justify-center">
          <div
            className={`relative flex items-end gap-2 sm:gap-3 transition-transform duration-1000 px-4 ${
              isTrainMoving ? "translate-x-full scale-105" : ""
            }`}
          >
            {/* 1. LOCOMOTIVA GIGANTE NA FRENTE */}
            <div className="relative flex flex-col items-center flex-shrink-0 z-10">
              {/* Fumaça animada subindo da chaminé */}
              <div className="flex gap-2 -mb-3 animate-bounce">
                <span className="text-4xl opacity-80">💨</span>
                <span className="text-3xl opacity-60">💨</span>
              </div>

              {/* Cabine da Locomotiva */}
              <div className="w-28 h-32 sm:w-36 sm:h-40 bg-gradient-to-b from-red-500 to-rose-700 border-4 sm:border-6 border-red-950 rounded-3xl shadow-2xl flex flex-col items-center justify-between p-2">
                <div className="flex items-center gap-1">
                  <span className="text-3xl sm:text-4xl">🧔</span>
                  <span className="text-xl sm:text-2xl animate-pulse">👑</span>
                </div>

                <div className="bg-yellow-300 px-3 py-1 rounded-full border-2 border-amber-600 font-black text-xs sm:text-sm text-amber-950 shadow">
                  PIUÍÍÍ!
                </div>

                {/* Farol dianteiro aceso */}
                <div className="w-6 h-6 bg-yellow-200 rounded-full border-3 border-amber-500 shadow-lg animate-pulse" />
              </div>

              {/* Rodas de ferro da locomotiva */}
              <div className="flex gap-3 -mt-4">
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 bg-slate-900 rounded-full border-3 border-amber-400 flex items-center justify-center ${
                    isTrainMoving ? "animate-spin" : ""
                  }`}
                  style={{ animationDuration: "1s" }}
                >
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                <div
                  className={`w-9 h-9 sm:w-11 sm:h-11 bg-slate-900 rounded-full border-3 border-amber-400 flex items-center justify-center ${
                    isTrainMoving ? "animate-spin" : ""
                  }`}
                  style={{ animationDuration: "1s" }}
                >
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>

            {/* 2. OS VAGÕES GIGANTES COM QUANTIDADES ILUSTRADAS */}
            {wagons.map((w) => {
              const isPlaced = placedNumbers.includes(w.num);
              const isNext = w.num === expectedNumber;

              return (
                <div key={w.num} className="relative flex flex-col items-center flex-shrink-0">
                  {/* Seta e balãozinho orientando qual vagão colocar agora */}
                  {isNext && (
                    <div className="absolute -top-12 z-20 flex flex-col items-center animate-bounce">
                      <span className="bg-kids-yellow text-amber-950 text-xs sm:text-sm font-black px-3 py-1 rounded-full border-2 border-amber-500 shadow-md whitespace-nowrap">
                        Coloque o {w.num}!
                      </span>
                      <span className="text-2xl -mt-1">👇</span>
                    </div>
                  )}

                  {/* Vagão */}
                  <div
                    className={`w-20 h-28 sm:w-26 sm:h-36 rounded-3xl border-4 sm:border-6 flex flex-col items-center justify-between p-1.5 transition-all ${
                      isPlaced
                        ? `${w.colorBg} ${w.borderColor} shadow-kid-lg scale-105 animate-wiggle`
                        : isNext
                        ? "bg-yellow-100/90 border-dashed border-amber-500 ring-4 ring-yellow-400 animate-pulse-gentle scale-105"
                        : "bg-white/60 border-dashed border-slate-400 opacity-60"
                    }`}
                  >
                    {/* Carga de bichinhos ou objetos correspondente à quantidade */}
                    <div className="w-full flex-1 flex flex-wrap items-center justify-center gap-0.5 p-1 overflow-hidden">
                      {w.items.map((it, i) => (
                        <span
                          key={i}
                          className={`text-base sm:text-xl transition-all duration-300 ${
                            isPlaced ? "scale-100 opacity-100" : "scale-90 opacity-25 grayscale"
                          }`}
                        >
                          {it}
                        </span>
                      ))}
                    </div>

                    {/* Número do Vagão */}
                    <div
                      className={`w-full py-1 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-4xl ${
                        isPlaced
                          ? `${w.textColor} bg-black/10`
                          : isNext
                          ? "text-amber-950 opacity-80"
                          : "text-slate-400 opacity-40"
                      }`}
                    >
                      {w.num}
                    </div>
                  </div>

                  {/* Rodas do vagão */}
                  <div className="flex gap-2 sm:gap-4 -mt-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-900 rounded-full border-2 border-slate-700 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-900 rounded-full border-2 border-slate-700 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trilhos de Trem de Madeira Firme */}
        <div className="w-full h-6 bg-slate-800 border-t-4 border-slate-950 flex justify-around items-center">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-2.5 h-full bg-amber-900 border-x border-amber-950" />
          ))}
        </div>

        {/* Vitória: Trem Parte! */}
        {isTrainMoving && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-bounce p-4 text-center">
            <span className="text-8xl mb-2">🚂💨✨</span>
            <div className="text-3xl sm:text-5xl font-black text-kids-teal mb-2">
              TREM COMPLETO!
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-700 mb-6">
              Muito bem, Israel! Você colocou todos os números na ordem certa! ⭐
            </div>
            <button
              onClick={handleNextLevel}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-2xl sm:text-3xl px-8 sm:px-12 py-4 sm:py-5 rounded-4xl border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3 animate-pulse-gentle"
            >
              <span>{level === "1-5" ? "VAMOS DO 6 AO 10!" : "JOGAR DE NOVO!"}</span>
              <ArrowRight size={36} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* BANDEJA DE NÚMEROS TÁTEIS NO RODAPÉ */}
      {!isTrainMoving && (
        <div className="w-full bg-white/95 backdrop-blur-md p-1.5 sm:p-3 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-yellow shadow-kid flex items-center justify-around gap-1.5 sm:gap-3 z-20 flex-shrink-0">
          {wagons.map((w) => {
            const isPlaced = placedNumbers.includes(w.num);
            const isExpected = w.num === expectedNumber;
            const isShaking = wrongShakeNum === w.num;

            return (
              <button
                key={w.num}
                onClick={() => handlePickNumber(w.num)}
                disabled={isPlaced}
                className={`kid-btn flex-1 py-2 sm:py-5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 font-black text-2xl sm:text-5xl transition-all ${
                  isPlaced
                    ? "bg-slate-200 border-slate-300 text-slate-400 opacity-25 cursor-not-allowed scale-90"
                    : isShaking
                    ? "bg-rose-200 border-rose-500 text-rose-900 animate-wiggle scale-105"
                    : isExpected
                    ? `${w.colorBg} ${w.borderColor} ${w.textColor} shadow-kid-lg scale-110 ring-4 ring-yellow-400 animate-wiggle`
                    : "bg-white border-amber-300 text-amber-950 hover:bg-amber-100 shadow-kid active:scale-95"
                }`}
              >
                {w.num}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
