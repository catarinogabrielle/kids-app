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
        leftPercent: 8 + Math.random() * 76,
        durationSec: 5.5 + Math.random() * 2.2,
        delaySec,
        sizePx: 80 + Math.random() * 20,
      };
    },
    [currentMission]
  );

  const initBalloons = useCallback(() => {
    const initialList: BalloonItem[] = [];
    for (let i = 0; i < 6; i++) {
      initialList.push(createSingleBalloon(i * 0.75));
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
    <div
      ref={containerRef}
      className="relative flex flex-col w-full h-full bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200 select-none overflow-hidden touch-none"
    >
      {/* HUD Flutuante no Topo: Placar de Missão de Cores */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-2 sm:p-3 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-pink shadow-lg z-30">
        <div
          className={`flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 shadow-inner ${currentMission.badgeBg} ${currentMission.badgeBorder}`}
        >
          <span className="text-2xl sm:text-4xl">
            {currentMission.emoji}
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wider hidden sm:block">
              Missão de Cores
            </span>
            <span className={`text-sm sm:text-2xl font-black ${currentMission.textColor} whitespace-nowrap`}>
              <span className="hidden sm:inline">Pegue 10 </span>{currentMission.name}!
            </span>
          </div>
        </div>

        {/* Bloco da Direita: Contador e Botão de Reset */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Marcadores de Progresso (10 Balões Miniatura - Tablets e Telas Maiores) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-2xl border-2 border-slate-300">
            {[...Array(GOAL)].map((_, idx) => (
              <span
                key={idx}
                className={`text-base sm:text-lg transition-all duration-200 ${
                  idx < targetCount
                    ? "scale-110 opacity-100"
                    : "scale-90 opacity-20 grayscale"
                }`}
              >
                🎈
              </span>
            ))}
            <span className="text-sm sm:text-base font-black text-slate-700 ml-2">
              {targetCount}/{GOAL}
            </span>
          </div>

          {/* Versão Compacta Mobile/Tablet do Contador */}
          <div className="flex md:hidden items-center gap-1.5 bg-amber-100 border-2 border-amber-400 px-3 py-1.5 rounded-xl font-black text-sm text-amber-950 shadow-sm">
            <span>🎈</span>
            <span>{targetCount}/{GOAL}</span>
          </div>

          <button
            onClick={handleReset}
            className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-slate-300 shadow-kid-sm flex-shrink-0"
            title="Recomeçar"
          >
            <RotateCcw size={20} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Nuvens decorativas no Céu */}
      <div className="absolute top-20 left-8 text-6xl opacity-40 animate-float pointer-events-none">
        ☁️
      </div>
      <div className="absolute top-28 right-12 text-6xl opacity-40 animate-float-delayed pointer-events-none">
        ☁️
      </div>
      <div className="absolute top-20 left-1/2 text-5xl opacity-80 pointer-events-none">
        ☀️
      </div>

      {/* Estilo de animação CSS: Balões começam SEMPRE abaixo da tela e sobem até o topo */}
      <style jsx>{`
        @keyframes floatUpFromBottom {
          0% {
            top: 105%;
            transform: translateX(0px) scale(0.95);
            opacity: 0.95;
          }
          50% {
            transform: translateX(16px) scale(1.03);
          }
          100% {
            top: -25%;
            transform: translateX(-14px) scale(1.08);
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

      {/* Renderiza os balões gigantes pelo céu inteiro */}
      {balloons.map((b) => {
        const isTarget = b.missionId === currentMission.id;

        return (
          <div
            key={b.id}
            onPointerDown={(e) => handlePop(b, e)}
            className="balloon-rising absolute cursor-pointer active:scale-125 transition-transform z-20"
            style={{
              left: `${b.leftPercent}%`,
              animationDuration: `${b.durationSec}s`,
              animationDelay: `${b.delaySec}s`,
              width: `${b.sizePx}px`,
              height: `${b.sizePx * 1.25}px`,
            }}
          >
            {/* O Balão 3D Gigante */}
            <div
              className={`relative w-full h-full rounded-full flex flex-col items-center justify-center shadow-xl transition-transform ${
                isTarget ? "ring-4 ring-white/80 animate-pulse-gentle" : ""
              }`}
              style={{
                background: b.colorBg,
                border: `4px solid ${b.borderColor}`,
              }}
            >
              {/* Brilho do Balão */}
              <div className="absolute top-2.5 left-3.5 w-4 h-7 bg-white/45 rounded-full blur-[1px] -rotate-12" />

              {/* Emoji fofinho dentro do balão */}
              <span className="text-4xl sm:text-5xl drop-shadow select-none pointer-events-none">
                {b.emoji}
              </span>

              {/* Estrela brilhante se for o balão da missão */}
              {isTarget && (
                <span className="absolute -top-2 -right-1 text-2xl animate-spin pointer-events-none">
                  ✨
                </span>
              )}

              {/* Nó do balão */}
              <div
                className="absolute -bottom-2 w-4 h-3 rounded-sm"
                style={{ background: b.borderColor }}
              />
              {/* Cordinha */}
              <div className="absolute -bottom-8 w-0.5 h-7 bg-white/85" />
            </div>
          </div>
        );
      })}

      {/* Tela de Vitória da Missão Concluída */}
      {isVictory && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 text-center">
          <span className="text-7xl sm:text-9xl mb-2">🎉🎈🏆</span>
          <div className="text-3xl sm:text-5xl font-black text-kids-purple mb-2">
            MISSÃO CUMPRIDA!
          </div>
          <div className="text-base sm:text-2xl font-bold text-slate-700 mb-6">
            Muito bem, Israel! Você juntou todos os 10 balões{" "}
            {currentMission.name.toLowerCase()}! ⭐
          </div>
          <button
            onClick={handleNextMission}
            className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-xl sm:text-3xl px-8 sm:px-12 py-4 sm:py-5 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3"
          >
            <span>PRÓXIMA COR!</span>
            <ArrowRight size={30} className="stroke-[3]" />
          </button>
        </div>
      )}

      {/* Pílula Flutuante de Dica no Rodapé */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md py-1.5 px-4 sm:py-2 sm:px-6 rounded-full border-3 border-kids-pink shadow-lg flex items-center justify-center gap-2 z-30 pointer-events-none whitespace-nowrap">
        <Sparkles className="text-amber-500 flex-shrink-0" size={18} />
        <span className="text-xs sm:text-base font-black text-slate-800">
          Estoure os balões {currentMission.name.toLowerCase()} {currentMission.emoji}!
        </span>
      </div>
    </div>
  );
}
