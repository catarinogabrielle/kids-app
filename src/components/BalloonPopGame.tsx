"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight, Sparkles } from "lucide-react";

interface ColorMission {
  id: string;
  name: string;
  emoji: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  gradient: string;
  borderColor: string;
}

const MISSIONS: ColorMission[] = [
  {
    id: "green",
    name: "Verdes",
    emoji: "🟢",
    textColor: "text-emerald-900",
    badgeBg: "bg-emerald-100",
    badgeBorder: "border-emerald-400",
    gradient: "radial-gradient(circle at 35% 35%, #86EFAC, #16A34A)",
    borderColor: "#14532D",
  },
  {
    id: "yellow",
    name: "Amarelos",
    emoji: "🟡",
    textColor: "text-amber-950",
    badgeBg: "bg-yellow-100",
    badgeBorder: "border-yellow-400",
    gradient: "radial-gradient(circle at 35% 35%, #FEF08A, #CA8A04)",
    borderColor: "#713F12",
  },
  {
    id: "red",
    name: "Vermelhos",
    emoji: "🔴",
    textColor: "text-rose-950",
    badgeBg: "bg-rose-100",
    badgeBorder: "border-rose-400",
    gradient: "radial-gradient(circle at 35% 35%, #FCA5A5, #DC2626)",
    borderColor: "#7F1D1D",
  },
  {
    id: "blue",
    name: "Azuis",
    emoji: "🔵",
    textColor: "text-blue-950",
    badgeBg: "bg-blue-100",
    badgeBorder: "border-blue-400",
    gradient: "radial-gradient(circle at 35% 35%, #93C5FD, #2563EB)",
    borderColor: "#1E3A8A",
  },
  {
    id: "purple",
    name: "Roxos",
    emoji: "🟣",
    textColor: "text-purple-950",
    badgeBg: "bg-purple-100",
    badgeBorder: "border-purple-400",
    gradient: "radial-gradient(circle at 35% 35%, #D8B4FE, #9333EA)",
    borderColor: "#581C87",
  },
];

const EMOJIS = ["⭐", "🦁", "🦖", "🚗", "🛳️", "🐑", "❤️", "👑", "🌈", "🍓", "🎈"];

interface BalloonItem {
  id: number;
  missionId: string;
  emoji: string;
  colorBg: string;
  borderColor: string;
  leftPercent: number;
  durationSec: number;
  delaySec: number;
  sizePx: number;
}

export function BalloonPopGame() {
  const [missionIdx, setMissionIdx] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMission = MISSIONS[missionIdx];
  const GOAL = 10;

  // Cria um único balão balanceando cor da missão e cores aleatórias
  const createSingleBalloon = useCallback(
    (delaySec = 0): BalloonItem => {
      const isTarget = Math.random() < 0.55;
      const chosenColor = isTarget
        ? currentMission
        : MISSIONS[Math.floor(Math.random() * MISSIONS.length)];

      return {
        id: Date.now() + Math.random(),
        missionId: chosenColor.id,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        colorBg: chosenColor.gradient,
        borderColor: chosenColor.borderColor,
        leftPercent: 10 + Math.random() * 72,
        durationSec: 5.5 + Math.random() * 2.2,
        delaySec,
        sizePx: 78 + Math.random() * 16,
      };
    },
    [currentMission]
  );

  const initBalloons = useCallback(() => {
    const initialList: BalloonItem[] = [];
    for (let i = 0; i < 5; i++) {
      initialList.push(createSingleBalloon(i * 0.85));
    }
    setBalloons(initialList);
  }, [createSingleBalloon]);

  useEffect(() => {
    initBalloons();
  }, [initBalloons]);

  const handlePop = (balloon: BalloonItem, e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const isMatch = balloon.missionId === currentMission.id;

    if (isMatch) {
      sounds.playStar();
      sounds.playChime(640 + targetCount * 30);
    } else {
      sounds.playPop();
    }

    const clientX = e.clientX || (typeof window !== "undefined" ? window.innerWidth / 2 : 200);
    const clientY = e.clientY || (typeof window !== "undefined" ? window.innerHeight / 2 : 300);

    confetti({
      particleCount: isMatch ? 36 : 18,
      spread: isMatch ? 70 : 45,
      origin: {
        x: Math.max(0.05, Math.min(0.95, clientX / (typeof window !== "undefined" ? window.innerWidth : 400))),
        y: Math.max(0.05, Math.min(0.95, clientY / (typeof window !== "undefined" ? window.innerHeight : 600))),
      },
    });

    setBalloons((prev) => {
      const remaining = prev.filter((b) => b.id !== balloon.id);
      const newBalloon = createSingleBalloon(0.2);
      return [...remaining, newBalloon];
    });

    if (isMatch) {
      setTargetCount((prev) => {
        const next = prev + 1;
        if (next >= GOAL) {
          sounds.playSuccess();
          setIsVictory(true);
          confetti({
            particleCount: 130,
            spread: 90,
            origin: { y: 0.5 },
          });
        }
        return next;
      });
    }
  };

  const handleNextMission = () => {
    sounds.playStar();
    setIsVictory(false);
    setTargetCount(0);
    setMissionIdx((i) => (i + 1) % MISSIONS.length);
  };

  const handleReset = () => {
    sounds.playBoing();
    setIsVictory(false);
    setTargetCount(0);
    initBalloons();
  };

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Placar de Missão de Cores */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-pink shadow-kid z-20 flex-shrink-0">
        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 shadow-inner ${currentMission.badgeBg} ${currentMission.badgeBorder}`}
        >
          <span className="text-2xl sm:text-3xl animate-bounce">
            {currentMission.emoji}
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wider">
              Missão de Cores
            </span>
            <span className={`text-sm sm:text-xl font-black ${currentMission.textColor}`}>
              Pegue 10 {currentMission.name}!
            </span>
          </div>
        </div>

        {/* Marcadores de Progresso (10 Balões Miniatura) */}
        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-300">
          {[...Array(GOAL)].map((_, idx) => (
            <span
              key={idx}
              className={`text-xs sm:text-base transition-all duration-200 ${
                idx < targetCount
                  ? "scale-110 opacity-100"
                  : "scale-90 opacity-20 grayscale"
              }`}
            >
              🎈
            </span>
          ))}
          <span className="text-xs sm:text-sm font-black text-slate-700 ml-1.5">
            {targetCount}/{GOAL}
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

      {/* Cenário do Céu com Subida Suave dos Balões a partir do Fundo */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200 rounded-3xl sm:rounded-4xl border-6 sm:border-8 border-kids-blue shadow-2xl overflow-hidden touch-none"
      >
        {/* Nuvens decorativas */}
        <div className="absolute top-4 left-6 text-5xl opacity-40 animate-float pointer-events-none">
          ☁️
        </div>
        <div className="absolute top-10 right-10 text-5xl opacity-40 animate-float-delayed pointer-events-none">
          ☁️
        </div>
        <div className="absolute top-4 left-1/2 text-4xl opacity-80 pointer-events-none">
          ☀️
        </div>

        {/* Estilo de animação CSS: Balões começam SEMPRE abaixo do container */}
        <style jsx>{`
          @keyframes floatUpFromBottom {
            0% {
              top: 105%;
              transform: translateX(0px) scale(0.95);
              opacity: 0.95;
            }
            50% {
              transform: translateX(14px) scale(1.02);
            }
            100% {
              top: -25%;
              transform: translateX(-12px) scale(1.06);
              opacity: 1;
            }
          }
          .balloon-rising {
            animation-name: floatUpFromBottom;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            will-change: top, transform;
          }
        `}</style>

        {/* Renderiza os 5 balões espaçados */}
        {balloons.map((b) => {
          const isTarget = b.missionId === currentMission.id;

          return (
            <div
              key={b.id}
              onPointerDown={(e) => handlePop(b, e)}
              className="balloon-rising absolute cursor-pointer active:scale-125 transition-transform"
              style={{
                left: `${b.leftPercent}%`,
                animationDuration: `${b.durationSec}s`,
                animationDelay: `${b.delaySec}s`,
                width: `${b.sizePx}px`,
                height: `${b.sizePx * 1.25}px`,
              }}
            >
              {/* O Balão 3D */}
              <div
                className={`relative w-full h-full rounded-full flex flex-col items-center justify-center shadow-lg transition-transform ${
                  isTarget ? "ring-4 ring-white/60 animate-pulse-gentle" : ""
                }`}
                style={{
                  background: b.colorBg,
                  border: `3.5px solid ${b.borderColor}`,
                }}
              >
                {/* Brilho do Balão */}
                <div className="absolute top-2 left-3 w-4 h-6 bg-white/45 rounded-full blur-[1px] -rotate-12" />

                {/* Emoji fofinho dentro do balão */}
                <span className="text-3xl sm:text-4xl drop-shadow select-none pointer-events-none">
                  {b.emoji}
                </span>

                {/* Estrela brilhante se for o balão da missão */}
                {isTarget && (
                  <span className="absolute -top-2 -right-1 text-xl animate-spin pointer-events-none">
                    ✨
                  </span>
                )}

                {/* Nó do balão */}
                <div
                  className="absolute -bottom-2 w-3.5 h-2.5 rounded-sm"
                  style={{ background: b.borderColor }}
                />
                {/* Cordinha */}
                <div className="absolute -bottom-7 w-0.5 h-6 bg-white/80" />
              </div>
            </div>
          );
        })}

        {/* Tela de Vitória da Missão Concluída */}
        {isVictory && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-bounce p-4 text-center">
            <span className="text-8xl mb-2">🎉🎈🏆</span>
            <div className="text-3xl sm:text-5xl font-black text-kids-purple mb-2">
              MISSÃO CUMPRIDA!
            </div>
            <div className="text-lg sm:text-2xl font-bold text-slate-700 mb-6">
              Muito bem, Israel! Você juntou todos os 10 balões{" "}
              {currentMission.name.toLowerCase()}! ⭐
            </div>
            <button
              onClick={handleNextMission}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-xl sm:text-3xl px-8 sm:px-12 py-3.5 sm:py-5 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3 animate-pulse-gentle"
            >
              <span>PRÓXIMA COR!</span>
              <ArrowRight size={32} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* Dica no rodapé */}
      <div className="w-full bg-white/90 backdrop-blur-md py-1.5 px-3 rounded-2xl border-2 border-kids-pink flex items-center justify-center gap-2 z-20 flex-shrink-0">
        <Sparkles className="text-amber-500 animate-spin" size={18} />
        <span className="text-xs sm:text-sm font-black text-slate-700">
          Dica: Toque nos balões {currentMission.name.toLowerCase()} {currentMission.emoji} para
          vencer o desafio!
        </span>
      </div>
    </div>
  );
}
