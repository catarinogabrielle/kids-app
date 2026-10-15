"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight, Sparkles } from "lucide-react";

interface WagonConfig {
  num: number;
  label: string;
  items: string[];
  emoji: string;
  topColor: string;
  bottomColor: string;
  strokeColor: string;
  textColor: string;
}

const WAGONS_1_5: WagonConfig[] = [
  {
    num: 1,
    label: "1 Leão",
    items: ["🦁"],
    emoji: "🦁",
    topColor: "#FBBF24",
    bottomColor: "#F59E0B",
    strokeColor: "#D97706",
    textColor: "#78350F",
  },
  {
    num: 2,
    label: "2 Dinos",
    items: ["🦖", "🦖"],
    emoji: "🦖",
    topColor: "#34D399",
    bottomColor: "#059669",
    strokeColor: "#047857",
    textColor: "#064E3B",
  },
  {
    num: 3,
    label: "3 Ovelhas",
    items: ["🐑", "🐑", "🐑"],
    emoji: "🐑",
    topColor: "#38BDF8",
    bottomColor: "#0284C7",
    strokeColor: "#0369A1",
    textColor: "#082F49",
  },
  {
    num: 4,
    label: "4 Carros",
    items: ["🚗", "🚗", "🚗", "🚗"],
    emoji: "🚗",
    topColor: "#FB7185",
    bottomColor: "#E11D48",
    strokeColor: "#BE123C",
    textColor: "#4C0519",
  },
  {
    num: 5,
    label: "5 Coroas",
    items: ["👑", "👑", "👑", "👑", "👑"],
    emoji: "👑",
    topColor: "#C084FC",
    bottomColor: "#9333EA",
    strokeColor: "#7E22CE",
    textColor: "#3B0764",
  },
];

const WAGONS_6_10: WagonConfig[] = [
  {
    num: 6,
    label: "6 Balões",
    items: ["🎈", "🎈", "🎈", "🎈", "🎈", "🎈"],
    emoji: "🎈",
    topColor: "#F472B6",
    bottomColor: "#DB2777",
    strokeColor: "#BE185D",
    textColor: "#831843",
  },
  {
    num: 7,
    label: "7 Estrelas",
    items: ["⭐", "⭐", "⭐", "⭐", "⭐", "⭐", "⭐"],
    emoji: "⭐",
    topColor: "#FDE047",
    bottomColor: "#EAB308",
    strokeColor: "#CA8A04",
    textColor: "#713F12",
  },
  {
    num: 8,
    label: "8 Maçãs",
    items: ["🍎", "🍎", "🍎", "🍎", "🍎", "🍎", "🍎", "🍎"],
    emoji: "🍎",
    topColor: "#F87171",
    bottomColor: "#DC2626",
    strokeColor: "#B91C1C",
    textColor: "#450A0A",
  },
  {
    num: 9,
    label: "9 Peixes",
    items: ["🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟", "🐟"],
    emoji: "🐟",
    topColor: "#2DD4BF",
    bottomColor: "#0D9488",
    strokeColor: "#0F766E",
    textColor: "#134E4A",
  },
  {
    num: 10,
    label: "10 Corações",
    items: ["❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️", "❤️"],
    emoji: "❤️",
    topColor: "#818CF8",
    bottomColor: "#4F46E5",
    strokeColor: "#4338CA",
    textColor: "#312E81",
  },
];

/* 1. LOCOMOTIVA CLÁSSICA A VAPOR EM SVG */
function SteamLocomotive({ isMoving }: { isMoving: boolean }) {
  return (
    <div className="relative flex-shrink-0 flex flex-col items-center">
      {/* Vapor saindo da chaminé */}
      <div className="absolute -top-6 left-6 flex items-center gap-1 pointer-events-none opacity-80">
        <span className="text-xl sm:text-2xl">💨</span>
        <span className="text-sm sm:text-base opacity-60">💨</span>
      </div>

      <svg
        viewBox="0 0 170 120"
        className="w-32 h-24 sm:w-44 sm:h-32 drop-shadow-xl overflow-visible select-none"
      >
        <defs>
          <linearGradient id="boilerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="cabGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="goldBrass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Engate traseiro para o primeiro vagão */}
        <path d="M 160 84 L 172 84 L 172 80" stroke="#334155" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Chassi de aço escuro */}
        <rect x="14" y="78" width="150" height="12" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

        {/* Limpa-trilhos (Cowcatcher dianteiro na esquerda) */}
        <polygon points="2,90 16,74 16,90" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
        <line x1="6" y1="88" x2="16" y2="78" stroke="#fecaca" strokeWidth="1.5" />
        <line x1="10" y1="90" x2="16" y2="84" stroke="#fecaca" strokeWidth="1.5" />

        {/* Farol dianteiro aceso com feixe de luz */}
        <polygon points="6,57 0,50 0,72 6,65" fill="#fef08a" opacity="0.4" />
        <rect x="6" y="55" width="12" height="12" rx="3" fill="url(#goldBrass)" stroke="#b45309" strokeWidth="1.5" />
        <circle cx="8" cy="61" r="4" fill="#fef9c3" />

        {/* Caldeira Horizontal Cilíndrica */}
        <rect x="16" y="38" width="82" height="42" rx="8" fill="url(#boilerGrad)" stroke="#7f1d1d" strokeWidth="2.5" />

        {/* Cintas douradas de latão da caldeira */}
        <rect x="38" y="38" width="4" height="42" fill="url(#goldBrass)" />
        <rect x="66" y="38" width="4" height="42" fill="url(#goldBrass)" />

        {/* Chaminé cônica com anel dourado */}
        <polygon points="26,14 44,14 40,38 30,38" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <ellipse cx="35" cy="14" rx="10" ry="3.5" fill="url(#goldBrass)" stroke="#b45309" strokeWidth="1.5" />

        {/* Domo de vapor de latão dourado */}
        <path d="M 60 38 C 60 22 74 22 74 38 Z" fill="url(#goldBrass)" stroke="#b45309" strokeWidth="2" />
        <circle cx="67" cy="22" r="3" fill="#fde047" />

        {/* Cabine alta do maquinista na traseira */}
        <rect x="94" y="16" width="68" height="64" rx="6" fill="url(#cabGrad)" stroke="#7f1d1d" strokeWidth="2.5" />

        {/* Teto curvo da cabine com beiral */}
        <path d="M 90 16 Q 128 6 166 16" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Janela arqueada da cabine */}
        <rect x="104" y="24" width="46" height="30" rx="8" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />

        {/* Maquinista Israel com a coroa */}
        <text x="127" y="46" fontSize="20" textAnchor="middle" dominantBaseline="middle">🧔</text>
        <text x="127" y="30" fontSize="13" textAnchor="middle" dominantBaseline="middle">👑</text>

        {/* Placa dourada com o nome ISRAEL */}
        <rect x="104" y="60" width="48" height="13" rx="3" fill="url(#goldBrass)" stroke="#b45309" strokeWidth="1.5" />
        <text x="128" y="70" fontSize="9" fontWeight="900" fill="#78350f" textAnchor="middle">ISRAEL</text>

        {/* Rodas dianteiras menores */}
        <g className={isMoving ? "animate-spin origin-[34px_92px]" : ""}>
          <circle cx="34" cy="92" r="12" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="34" cy="92" r="4" fill="#dc2626" />
        </g>

        {/* Roda motriz traseira 1 com raios */}
        <g className={isMoving ? "animate-spin origin-[88px_90px]" : ""}>
          <circle cx="88" cy="90" r="16" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="88" cy="90" r="6" fill="#dc2626" />
          <line x1="88" y1="74" x2="88" y2="106" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="72" y1="90" x2="104" y2="90" stroke="#94a3b8" strokeWidth="1.5" />
        </g>

        {/* Roda motriz traseira 2 com raios */}
        <g className={isMoving ? "animate-spin origin-[134px_90px]" : ""}>
          <circle cx="134" cy="90" r="16" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="134" cy="90" r="6" fill="#dc2626" />
          <line x1="134" y1="74" x2="134" y2="106" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="118" y1="90" x2="150" y2="90" stroke="#94a3b8" strokeWidth="1.5" />
        </g>

        {/* Biela motriz de aço ligando as rodas */}
        <line x1="88" y1="90" x2="134" y2="90" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
        <circle cx="88" cy="90" r="3.5" fill="#f59e0b" />
        <circle cx="134" cy="90" r="3.5" fill="#f59e0b" />
      </svg>
    </div>
  );
}

/* 2. VAGÃO DE CARGA EM SVG COM BICHINHOS */
function FreightWagon({
  wagon,
  isPlaced,
  isNext,
  isMoving,
}: {
  wagon: WagonConfig;
  isPlaced: boolean;
  isNext: boolean;
  isMoving: boolean;
}) {
  return (
    <div className="relative flex-shrink-0 flex flex-col items-center">
      {/* Indicador suave sobre o próximo vagão */}
      {isNext && (
        <div className="absolute -top-9 z-20 flex flex-col items-center pointer-events-none">
          <span className="bg-kids-yellow text-amber-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border border-amber-500 shadow-md whitespace-nowrap flex items-center gap-1">
            <Sparkles size={11} className="text-amber-600" />
            Vagão {wagon.num}
          </span>
          <span className="text-base -mt-0.5">👇</span>
        </div>
      )}

      <svg
        viewBox="0 0 130 120"
        className="w-24 h-24 sm:w-34 sm:h-32 drop-shadow-lg overflow-visible select-none"
      >
        <defs>
          <linearGradient id={`wagonGrad-${wagon.num}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={wagon.topColor} />
            <stop offset="100%" stopColor={wagon.bottomColor} />
          </linearGradient>
        </defs>

        {/* Engates nas duas pontas */}
        <path d="M 0 84 L 10 84" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
        <path d="M 120 84 L 130 84" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

        {/* Chassi de aço */}
        <rect x="8" y="78" width="114" height="12" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

        {/* Corpo do Vagão */}
        {isPlaced ? (
          <g>
            {/* Caixa de carga do vagão */}
            <rect
              x="12"
              y="32"
              width="106"
              height="48"
              rx="8"
              fill={`url(#wagonGrad-${wagon.num})`}
              stroke={wagon.strokeColor}
              strokeWidth="3"
            />
            {/* Frisos decorativos */}
            <line x1="12" y1="48" x2="118" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <line x1="12" y1="64" x2="118" y2="64" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />

            {/* Cantoneiras douradas */}
            <rect x="12" y="32" width="6" height="48" rx="2" fill="#fbbf24" opacity="0.8" />
            <rect x="112" y="32" width="6" height="48" rx="2" fill="#fbbf24" opacity="0.8" />

            {/* Medalhão central com o número */}
            <circle cx="65" cy="56" r="16" fill="#ffffff" stroke={wagon.strokeColor} strokeWidth="2.5" />
            <text
              x="65"
              y="63"
              fontSize="18"
              fontWeight="900"
              fill={wagon.textColor}
              textAnchor="middle"
            >
              {wagon.num}
            </text>
          </g>
        ) : (
          <g>
            {/* Vagão fantasma / silhueta para encaixar */}
            <rect
              x="12"
              y="32"
              width="106"
              height="48"
              rx="8"
              fill={isNext ? "rgba(254, 240, 138, 0.3)" : "rgba(241, 245, 249, 0.35)"}
              stroke={isNext ? "#eab308" : "#94a3b8"}
              strokeWidth={isNext ? 3 : 2}
              strokeDasharray={isNext ? "6,4" : "4,4"}
            />
            {/* Círculo do número guia */}
            <circle
              cx="65"
              cy="56"
              r="15"
              fill={isNext ? "#fef08a" : "#f1f5f9"}
              stroke={isNext ? "#ca8a04" : "#cbd5e1"}
              strokeWidth="2"
            />
            <text
              x="65"
              y="63"
              fontSize="17"
              fontWeight="900"
              fill={isNext ? "#854d0e" : "#94a3b8"}
              textAnchor="middle"
            >
              {wagon.num}
            </text>
          </g>
        )}

        {/* Rodas do Vagão */}
        <g className={isMoving ? "animate-spin origin-[34px_90px]" : ""}>
          <circle cx="34" cy="90" r="14" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="34" cy="90" r="5" fill="#64748b" />
        </g>
        <g className={isMoving ? "animate-spin origin-[96px_90px]" : ""}>
          <circle cx="96" cy="90" r="14" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
          <circle cx="96" cy="90" r="5" fill="#64748b" />
        </g>
      </svg>

      {/* Carga dos Bichinhos/Itens colocados no vagão */}
      <div className="absolute top-2 w-22 sm:w-28 flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap pointer-events-none px-0.5">
        {wagon.items.map((item, i) => (
          <span
            key={i}
            className={`text-xs sm:text-base transition-all duration-300 ${
              isPlaced ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function NumberTrainGame() {
  const [level, setLevel] = useState<"1-5" | "6-10">("1-5");
  const wagons = level === "1-5" ? WAGONS_1_5 : WAGONS_6_10;

  const [placedNumbers, setPlacedNumbers] = useState<number[]>([]);
  const [isTrainMoving, setIsTrainMoving] = useState(false);
  const [wrongShakeNum, setWrongShakeNum] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeWagonRef = useRef<HTMLDivElement | null>(null);

  const currentExpectedWagon = wagons[placedNumbers.length] ?? null;
  const expectedNumber = currentExpectedWagon ? currentExpectedWagon.num : null;

  // Auto-scroll suave que mantém o vagão da vez centralizado sem cortar à esquerda
  useEffect(() => {
    if (activeWagonRef.current) {
      activeWagonRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [placedNumbers.length, level]);

  const handlePickNumber = (num: number) => {
    if (isTrainMoving) return;

    if (num === expectedNumber) {
      sounds.playSnap();
      sounds.playChime(620 + num * 35);
      const updated = [...placedNumbers, num];
      setPlacedNumbers(updated);

      if (updated.length === wagons.length) {
        sounds.playWhistle();
        sounds.playSuccess();
        setIsTrainMoving(true);
        confetti({
          particleCount: 130,
          spread: 95,
          origin: { y: 0.5 },
        });
      }
    } else {
      sounds.playBoing();
      setWrongShakeNum(num);
      setTimeout(() => setWrongShakeNum(null), 450);
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
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-teal shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-teal-100 border-2 border-teal-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-inner">
          <span className="text-xl sm:text-2xl">🚂</span>
          <span className="text-xs sm:text-xl font-black text-teal-900">
            Trem dos Números: {placedNumbers.length} / {wagons.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => sounds.playWhistle()}
            className="kid-btn bg-amber-400 hover:bg-amber-500 text-amber-950 px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-amber-600 shadow-kid font-black text-xs sm:text-sm flex items-center gap-1"
            title="Tocar Apito"
          >
            <span>📢</span>
            <span>PIUÍ!</span>
          </button>

          <button
            onClick={handleReset}
            className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-kid flex-shrink-0"
            title="Recomeçar"
          >
            <RotateCcw size={18} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL: O TREM COM ROLAGEM INTELIGENTE SEM CORTES */}
      <div className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-300 rounded-3xl sm:rounded-4xl border-4 sm:border-8 border-kids-blue shadow-2xl p-1.5 sm:p-3 flex flex-col justify-center items-center overflow-hidden">
        {/* Nuvens decorativas estáticas */}
        <div className="absolute top-3 left-6 text-3xl opacity-40 pointer-events-none">☁️</div>
        <div className="absolute top-5 right-8 text-3xl opacity-40 pointer-events-none">☁️</div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-3xl opacity-75 pointer-events-none">☀️</div>

        {/* Cenário com os Trilhos e o Comboio */}
        <div className="relative w-full flex flex-col items-center justify-center my-auto">
          {/* Container de Rolagem: margin: auto evita corte negativo à esquerda */}
          <div
            ref={scrollContainerRef}
            className="relative w-full overflow-x-auto pb-2 scrollbar-none flex items-end justify-start sm:justify-center px-4 sm:px-8"
          >
            <div
              className={`relative flex items-end gap-1.5 sm:gap-2.5 transition-transform duration-1000 mx-auto ${
                isTrainMoving ? "translate-x-full scale-105" : ""
              }`}
            >
              {/* 1. LOCOMOTIVA A VAPOR NA FRENTE */}
              <SteamLocomotive isMoving={isTrainMoving} />

              {/* 2. OS VAGÕES EM SEQUÊNCIA */}
              {wagons.map((w) => {
                const isPlaced = placedNumbers.includes(w.num);
                const isNext = w.num === expectedNumber;

                return (
                  <div
                    key={w.num}
                    ref={isNext ? activeWagonRef : undefined}
                    className="relative flex-shrink-0"
                  >
                    <FreightWagon
                      wagon={w}
                      isPlaced={isPlaced}
                      isNext={isNext}
                      isMoving={isTrainMoving}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trilhos de Madeira com Trilhos de Aço */}
          <div className="w-full h-6 sm:h-7 bg-slate-800 border-t-3 border-slate-950 flex justify-around items-center shadow-lg -mt-1">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="w-2 h-full bg-amber-900 border-x border-amber-950" />
            ))}
          </div>
        </div>

        {/* Vitória: Trem Completo Parte */}
        {isTrainMoving && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-7xl sm:text-8xl mb-1">🚂💨✨</span>
            <div className="text-2xl sm:text-4xl font-black text-kids-teal mb-1">
              TREM COMPLETO!
            </div>
            <div className="text-sm sm:text-xl font-bold text-slate-700 mb-5">
              Muito bem, Israel! Você engatou todos os números na ordem certa! ⭐
            </div>
            <button
              onClick={handleNextLevel}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-lg sm:text-2xl px-6 sm:px-10 py-3 sm:py-4 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-2"
            >
              <span>{level === "1-5" ? "VAMOS DO 6 AO 10!" : "JOGAR DE NOVO!"}</span>
              <ArrowRight size={26} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* BANDEJA DE NÚMEROS ERGONÔMICA */}
      {!isTrainMoving && (
        <div className="w-full bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-yellow shadow-kid flex items-center justify-around gap-1.5 sm:gap-2.5 z-20 flex-shrink-0">
          {wagons.map((w) => {
            const isPlaced = placedNumbers.includes(w.num);
            const isExpected = w.num === expectedNumber;
            const isShaking = wrongShakeNum === w.num;

            return (
              <button
                key={w.num}
                onClick={() => handlePickNumber(w.num)}
                disabled={isPlaced}
                className={`kid-btn flex-1 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 sm:border-3 font-black flex flex-col items-center justify-center transition-all ${
                  isPlaced
                    ? "bg-slate-200 border-slate-300 text-slate-400 opacity-20 cursor-not-allowed scale-90"
                    : isShaking
                    ? "bg-rose-200 border-rose-500 text-rose-900 animate-wiggle scale-105"
                    : isExpected
                    ? "bg-amber-100 border-amber-500 text-amber-950 shadow-kid-lg scale-105 ring-3 ring-yellow-400"
                    : "bg-white border-amber-300 text-amber-950 hover:bg-amber-100 shadow-kid active:scale-95"
                }`}
              >
                <span className="text-xl sm:text-3xl leading-tight">{w.num}</span>
                <span className="text-xs sm:text-lg">{w.emoji}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
