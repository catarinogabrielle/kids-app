"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { GameHeader } from "@/components/TopBar";
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

interface PopBurst {
  id: number;
  x: number;
  y: number;
  emoji: string;
  isMatch: boolean;
}

export function BalloonPopGame({ onHome }: { onHome?: () => void }) {
  const [missionIdx, setMissionIdx] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [popBursts, setPopBursts] = useState<PopBurst[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMission = MISSIONS[missionIdx];
  const GOAL = 10;

  // Cria um único balão que SEMPRE nasce abaixo da tela (top: 110%)
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

  // Inicializa balões já distribuídos pelo céu com offsets negativos
  const initBalloons = useCallback(() => {
    const initialList: BalloonItem[] = [];
    for (let i = 0; i < 6; i++) {
      const duration = 5.5 + Math.random() * 2.0;
      // Delay negativo inicia a animação como se já estivesse rodando há X segundos
      // Isso espalha os balões pelo céu imediatamente, sem piscar no topo nem esperar no rodapé!
      const startOffset = -(i * 1.1 + Math.random() * 0.8);
      const isTarget = i % 2 === 0;
      const chosenColor = isTarget
        ? currentMission
        : MISSIONS[Math.floor(Math.random() * MISSIONS.length)];

      initialList.push({
        id: Date.now() + Math.random() + i,
        missionId: chosenColor.id,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        colorBg: chosenColor.gradient,
        borderColor: chosenColor.borderColor,
        leftPercent: 8 + (i * 14) + Math.random() * 4,
        durationSec: duration,
        delaySec: startOffset,
        sizePx: 80 + Math.random() * 20,
      });
    }
    setBalloons(initialList);
  }, [currentMission]);

  useEffect(() => {
    initBalloons();
  }, [initBalloons]);

  const handlePop = (balloon: BalloonItem, e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const isMatch = balloon.missionId === currentMission.id;

    if (isMatch) {
      sounds.playSparkle();
      sounds.playScale((targetCount % 8) + 1);
    } else {
      sounds.playPop();
    }

    const clientX = e.clientX || (typeof window !== "undefined" ? window.innerWidth / 2 : 200);
    const clientY = e.clientY || (typeof window !== "undefined" ? window.innerHeight / 2 : 300);

    // Efeito visual instantâneo de explosão no local do toque
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const burstX = clientX - rect.left;
      const burstY = clientY - rect.top;
      const burstId = Date.now() + Math.random();
      setPopBursts((prev) => [...prev, { id: burstId, x: burstX, y: burstY, emoji: balloon.emoji, isMatch }]);
      setTimeout(() => {
        setPopBursts((prev) => prev.filter((p) => p.id !== burstId));
      }, 450);
    }

    confetti({
      particleCount: isMatch ? 36 : 18,
      spread: isMatch ? 70 : 45,
      origin: {
        x: Math.max(0.05, Math.min(0.95, clientX / (typeof window !== "undefined" ? window.innerWidth : 400))),
        y: Math.max(0.05, Math.min(0.95, clientY / (typeof window !== "undefined" ? window.innerHeight : 600))),
      },
    });

    // Remove o balão estourado e nasce um novo SEMPRE no rodapé (delay = 0, top: 110%)
    setBalloons((prev) => {
      const remaining = prev.filter((b) => b.id !== balloon.id);
      const newBalloon = createSingleBalloon(0);
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
    <div className="flex flex-col w-full h-full select-none overflow-hidden">
      <GameHeader
        onHome={onHome}
        title="Balões de Luz"
        icon="🎈"
        hideTitleOnMobile={true}
        leftControls={
          <div className={`flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl border shadow-inner ${currentMission.badgeBg} ${currentMission.badgeBorder}`}>
            <span className="text-base sm:text-xl">{currentMission.emoji}</span>
            <span className={`text-xs sm:text-sm font-black ${currentMission.textColor} whitespace-nowrap`}>
              Pegue 10 {currentMission.name}!
            </span>
          </div>
        }
        rightControls={
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-amber-100 border border-amber-400 px-2 py-0.5 rounded-xl font-black text-xs text-amber-950 shadow-sm">
              <span>🎈</span>
              <span>{targetCount}/{GOAL}</span>
            </div>

            <button
              onClick={handleReset}
              className="kid-btn bg-white hover:bg-slate-100 text-slate-700 p-1 sm:p-1.5 rounded-xl border border-slate-300 shadow-sm"
              title="Recomeçar"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        }
      />
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full h-full bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200 select-none overflow-hidden touch-none"
      >
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

      {/* Estilo de animação CSS: Balões começam SEMPRE abaixo da tela (top: 110%) e sobem até o topo */}
      <style jsx>{`
        @keyframes floatUpFromBottom {
          0% {
            top: 108%;
            transform: translateX(0px) scale(0.95);
            opacity: 0.95;
          }
          50% {
            transform: translateX(18px) scale(1.02);
          }
          100% {
            top: -25%;
            transform: translateX(-16px) scale(1.06);
            opacity: 1;
          }
        }
        .balloon-rising {
          top: 110%;
          animation-name: floatUpFromBottom;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-fill-mode: both;
          will-change: top, transform;
        }
      `}</style>

      {/* Explosões visuais táteis de balões estourados com pontos flutuantes */}
      {popBursts.map((p) => (
        <div
          key={p.id}
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center animate-ping"
          style={{ left: `${p.x}px`, top: `${p.y}px` }}
        >
          <span className="text-6xl drop-shadow select-none">💥</span>
          {p.isMatch && (
            <span className="text-lg font-black text-amber-500 bg-white/95 px-2 py-0.5 rounded-full border border-amber-400 shadow-md whitespace-nowrap">
              +1 ⭐
            </span>
          )}
        </div>
      ))}

      {/* Renderiza os balões gigantes pelo céu inteiro */}
      {balloons.map((b) => {
        const isTarget = b.missionId === currentMission.id;

        return (
          <div
            key={b.id}
            onPointerDown={(e) => handlePop(b, e)}
            className="balloon-rising absolute cursor-pointer active:scale-125 transition-transform z-20"
            style={{
              top: "110%",
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
      <div className="absolute bottom-1.5 sm:bottom-3 landscape:bottom-1 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md py-1 px-3 sm:py-2 sm:px-6 rounded-full border-2 sm:border-3 border-kids-pink shadow-lg flex items-center justify-center gap-1.5 z-30 pointer-events-none whitespace-nowrap landscape-dock-compact">
        <Sparkles className="text-amber-500 flex-shrink-0" size={16} />
        <span className="text-[11px] sm:text-base font-black text-slate-800">
          Estoure os balões {currentMission.name.toLowerCase()} {currentMission.emoji}!
        </span>
      </div>
      </div>
    </div>
  );
}
