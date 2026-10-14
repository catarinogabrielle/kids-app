"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw } from "lucide-react";

interface BalloonItem {
  id: number;
  emoji: string;
  colorBg: string;
  borderColor: string;
  leftPercent: number;
  durationSec: number;
  delaySec: number;
  sizePx: number;
}

const BALLOON_STYLES = [
  { bg: "radial-gradient(circle at 35% 35%, #FF8A8A, #DC2626)", border: "#991B1B" },
  { bg: "radial-gradient(circle at 35% 35%, #FDE047, #D97706)", border: "#92400E" },
  { bg: "radial-gradient(circle at 35% 35%, #6EE7B7, #059669)", border: "#065F46" },
  { bg: "radial-gradient(circle at 35% 35%, #7DD3FC, #0284C7)", border: "#0369A1" },
  { bg: "radial-gradient(circle at 35% 35%, #C084FC, #7E22CE)", border: "#581C87" },
  { bg: "radial-gradient(circle at 35% 35%, #F472B6, #DB2777)", border: "#9D174D" },
];

const EMOJIS = ["⭐", "🦁", "🦖", "🚗", "🛳️", "🐑", "❤️", "👑", "🌈", "🍓", "🎈"];

export function BalloonPopGame() {
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Gera um lote de balões com animação CSS pura (sem React re-render em 60fps)
  useEffect(() => {
    generateBalloons();
  }, []);

  const generateBalloons = () => {
    const list: BalloonItem[] = [];
    for (let i = 0; i < 14; i++) {
      const style = BALLOON_STYLES[i % BALLOON_STYLES.length];
      list.push({
        id: Date.now() + i,
        emoji: EMOJIS[i % EMOJIS.length],
        colorBg: style.bg,
        borderColor: style.border,
        leftPercent: 6 + (i * 6.5) + (Math.random() * 4 - 2),
        durationSec: 4.5 + Math.random() * 3, // 4.5s a 7.5s para subir
        delaySec: (i * 0.45) % 4,
        sizePx: 72 + (i % 3) * 12,
      });
    }
    setBalloons(list);
  };

  const handlePop = (id: number, e: React.PointerEvent<HTMLDivElement> | React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    sounds.playPop();

    let clientX = typeof window !== "undefined" ? window.innerWidth / 2 : 200;
    let clientY = typeof window !== "undefined" ? window.innerHeight / 2 : 300;

    if ("clientX" in e && typeof e.clientX === "number" && e.clientX > 0) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if ("touches" in e && (e as React.TouchEvent).touches?.[0]) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    }

    confetti({
      particleCount: 22,
      spread: 55,
      origin: {
        x: Math.max(0.05, Math.min(0.95, clientX / (typeof window !== "undefined" ? window.innerWidth : 400))),
        y: Math.max(0.05, Math.min(0.95, clientY / (typeof window !== "undefined" ? window.innerHeight : 600))),
      },
    });

    // Remove balão estourado e recria um novo suavemente
    setBalloons((prev) => {
      const remaining = prev.filter((b) => b.id !== id);
      const style = BALLOON_STYLES[Math.floor(Math.random() * BALLOON_STYLES.length)];
      const newBalloon: BalloonItem = {
        id: Date.now() + Math.random(),
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        colorBg: style.bg,
        borderColor: style.border,
        leftPercent: 8 + Math.random() * 80,
        durationSec: 4.8 + Math.random() * 2.5,
        delaySec: 0,
        sizePx: 74 + Math.random() * 18,
      };
      return [...remaining, newBalloon];
    });

    setPoppedCount((c) => {
      const next = c + 1;
      if (next % 10 === 0) {
        sounds.playSuccess();
      }
      return next;
    });
  };

  const handleReset = () => {
    sounds.playBoing();
    setPoppedCount(0);
    generateBalloons();
  };

  return (
    <div className="relative flex flex-col items-center justify-between w-full max-w-4xl mx-auto h-[calc(100vh-80px)] p-2 select-none overflow-hidden">
      {/* Placar de Balões */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-3xl border-4 border-kids-pink shadow-kid z-20">
        <div className="flex items-center gap-2 bg-pink-100 border-2 border-pink-400 px-4 py-1.5 rounded-2xl shadow-inner">
          <span className="text-3xl animate-bounce">🎈</span>
          <span className="text-2xl sm:text-3xl font-black text-pink-900">
            {poppedCount}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 sm:p-3 rounded-2xl border-4 border-slate-300 shadow-kid"
          title="Recomeçar"
        >
          <RotateCcw size={24} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Cenário do Céu: Animação CSS 100% Suave (Zero Travamento) */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full my-2 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200 rounded-4xl border-8 border-kids-blue shadow-2xl overflow-hidden touch-none"
      >
        {/* Nuvens decorativas */}
        <div className="absolute top-8 left-8 text-6xl opacity-40 animate-float pointer-events-none">☁️</div>
        <div className="absolute top-16 right-12 text-6xl opacity-40 animate-float-delayed pointer-events-none">☁️</div>

        {/* Estilo CSS da Animação dos Balões */}
        <style jsx>{`
          @keyframes floatUpSmooth {
            0% {
              transform: translateY(115vh) scale(0.9);
              opacity: 0.95;
            }
            50% {
              transform: translateY(50vh) translateX(12px) scale(1);
            }
            100% {
              transform: translateY(-25vh) translateX(-8px) scale(1.05);
              opacity: 1;
            }
          }
          .balloon-anim {
            animation-name: floatUpSmooth;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            will-change: transform;
          }
        `}</style>

        {/* Balões renderizados com GPU CSS */}
        {balloons.map((b) => (
          <div
            key={b.id}
            onPointerDown={(e) => handlePop(b.id, e)}
            className="balloon-anim absolute cursor-pointer active:scale-125 transition-transform"
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
              className="relative w-full h-full rounded-full flex flex-col items-center justify-center shadow-lg"
              style={{
                background: b.colorBg,
                border: `3px solid ${b.borderColor}`,
              }}
            >
              {/* Brilho do Balão */}
              <div className="absolute top-2 left-3 w-4 h-6 bg-white/40 rounded-full blur-[1px] -rotate-12" />

              {/* Emoji dentro do balão */}
              <span className="text-3xl sm:text-4xl drop-shadow select-none pointer-events-none">
                {b.emoji}
              </span>

              {/* Nó do balão */}
              <div
                className="absolute -bottom-2 w-3.5 h-2.5 rounded-sm"
                style={{ background: b.borderColor }}
              />
              {/* Cordinha */}
              <div className="absolute -bottom-7 w-0.5 h-6 bg-white/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
