"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight, Sparkles } from "lucide-react";

interface Checkpoint {
  id: number;
  label: string;
  xPct: number; // 0 - 100%
  yPct: number; // 0 - 100%
}

interface LetterData {
  letter: string;
  word: string;
  emoji: string;
  colorName: string;
  themeColor: string;
  checkpoints: Checkpoint[];
}

const LETTER_LIST: LetterData[] = [
  {
    letter: "I",
    word: "Israel",
    emoji: "👑",
    colorName: "text-amber-500",
    themeColor: "#F59E0B",
    checkpoints: [
      { id: 1, label: "1", xPct: 50, yPct: 22 },
      { id: 2, label: "2", xPct: 50, yPct: 50 },
      { id: 3, label: "3", xPct: 50, yPct: 78 },
    ],
  },
  {
    letter: "A",
    word: "Arca",
    emoji: "🛳️",
    colorName: "text-blue-500",
    themeColor: "#3B82F6",
    checkpoints: [
      { id: 1, label: "1", xPct: 50, yPct: 20 },
      { id: 2, label: "2", xPct: 32, yPct: 78 },
      { id: 3, label: "3", xPct: 68, yPct: 78 },
      { id: 4, label: "4", xPct: 50, yPct: 52 },
    ],
  },
  {
    letter: "L",
    word: "Leão",
    emoji: "🦁",
    colorName: "text-yellow-600",
    themeColor: "#D97706",
    checkpoints: [
      { id: 1, label: "1", xPct: 36, yPct: 22 },
      { id: 2, label: "2", xPct: 36, yPct: 76 },
      { id: 3, label: "3", xPct: 68, yPct: 76 },
    ],
  },
  {
    letter: "D",
    word: "Dino",
    emoji: "🦖",
    colorName: "text-emerald-600",
    themeColor: "#059669",
    checkpoints: [
      { id: 1, label: "1", xPct: 35, yPct: 22 },
      { id: 2, label: "2", xPct: 35, yPct: 76 },
      { id: 3, label: "3", xPct: 66, yPct: 50 },
    ],
  },
  {
    letter: "C",
    word: "Carro",
    emoji: "🚗",
    colorName: "text-red-500",
    themeColor: "#EF4444",
    checkpoints: [
      { id: 1, label: "1", xPct: 65, yPct: 28 },
      { id: 2, label: "2", xPct: 34, yPct: 50 },
      { id: 3, label: "3", xPct: 65, yPct: 72 },
    ],
  },
  {
    letter: "B",
    word: "Bíblia",
    emoji: "📖",
    colorName: "text-purple-600",
    themeColor: "#9333EA",
    checkpoints: [
      { id: 1, label: "1", xPct: 34, yPct: 22 },
      { id: 2, label: "2", xPct: 34, yPct: 76 },
      { id: 3, label: "3", xPct: 64, yPct: 36 },
      { id: 4, label: "4", xPct: 64, yPct: 62 },
    ],
  },
  {
    letter: "O",
    word: "Ovelha",
    emoji: "🐑",
    colorName: "text-teal-600",
    themeColor: "#0D9488",
    checkpoints: [
      { id: 1, label: "1", xPct: 50, yPct: 22 },
      { id: 2, label: "2", xPct: 32, yPct: 50 },
      { id: 3, label: "3", xPct: 50, yPct: 78 },
      { id: 4, label: "4", xPct: 68, yPct: 50 },
    ],
  },
];

export function LetterTracingGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [passedCheckpoints, setPassedCheckpoints] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastCoordRef = useRef<{ x: number; y: number } | null>(null);

  const current = LETTER_LIST[currentIdx];

  // Configura a resolução exata 1:1 do Canvas de acordo com o tamanho real da tela
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    syncCanvasSize();
    clearCanvas();
    setPassedCheckpoints([]);
    setIsCompleted(false);
    lastCoordRef.current = null;

    const handleResize = () => {
      syncCanvasSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIdx, syncCanvasSize, clearCanvas]);

  // Checa se o dedo tocou em uma estrela guia do contorno
  const checkHitStars = (x: number, y: number, width: number, height: number) => {
    current.checkpoints.forEach((cp) => {
      const starX = (cp.xPct / 100) * width;
      const starY = (cp.yPct / 100) * height;
      const dist = Math.hypot(x - starX, y - starY);

      if (dist < 46 && !passedCheckpoints.includes(cp.id)) {
        sounds.playStar();
        setPassedCheckpoints((prev) => {
          const next = [...prev, cp.id];
          if (next.length === current.checkpoints.length && !isCompleted) {
            setIsCompleted(true);
            sounds.playSuccess();
            confetti({
              particleCount: 110,
              spread: 85,
              origin: { y: 0.5 },
            });
          }
          return next;
        });
      }
    });
  };

  const drawTrace = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    checkHitStars(x, y, rect.width, rect.height);

    ctx.save();

    // Traçado mágica dourado / arco-íris exatamente sob o dedo
    if (lastCoordRef.current) {
      // Linha contínua espessa e suave
      ctx.beginPath();
      ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 32;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.75)"; // Amarelo sol luminoso
      ctx.stroke();

      // Centro branco brilhante
      ctx.beginPath();
      ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = 14;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();
    } else {
      // Ponto de início
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251, 191, 36, 0.85)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }

    // Estrelinhas espalhadas pelo traço
    if (Math.random() > 0.45) {
      ctx.font = "20px sans-serif";
      ctx.fillText("✨", x + (Math.random() * 24 - 12), y + (Math.random() * 24 - 12));
    }

    ctx.restore();
    lastCoordRef.current = { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    lastCoordRef.current = null;
    drawTrace(e.clientX, e.clientY);
    sounds.playChime(680);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || isCompleted) return;
    drawTrace(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    lastCoordRef.current = null;
  };

  const handleReset = () => {
    sounds.playBoing();
    clearCanvas();
    setPassedCheckpoints([]);
    setIsCompleted(false);
    lastCoordRef.current = null;
  };

  const nextLetter = () => {
    sounds.playStar();
    setCurrentIdx((i) => (i + 1) % LETTER_LIST.length);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Barra de Letras no Topo */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-purple shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          {LETTER_LIST.map((item, idx) => (
            <button
              key={item.letter}
              onClick={() => {
                sounds.playPop();
                setCurrentIdx(idx);
              }}
              className={`kid-btn p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 font-black transition-all flex-shrink-0 ${
                currentIdx === idx
                  ? "bg-kids-yellow border-amber-500 scale-105 sm:scale-110 shadow-kid ring-3 sm:ring-4 ring-yellow-300"
                  : "bg-white border-slate-200"
              }`}
            >
              <span className={`text-xl sm:text-3xl font-black ${item.colorName}`}>
                {item.letter}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleReset}
          className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-slate-300 shadow-kid flex-shrink-0"
          title="Recomeçar"
        >
          <RotateCcw size={20} className="stroke-[2.5]" />
        </button>
      </div>

      {/* A PRANCHA MÁGICA DE CONTORNO (Pixel-Perfect 1:1) */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 rounded-3xl sm:rounded-4xl border-6 sm:border-8 border-kids-purple shadow-2xl overflow-hidden cursor-crosshair touch-none select-none flex items-center justify-center"
      >
        {/* Letra Gigante desenhada no fundo em SVG para precisão absoluta */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 400 400" className="w-full h-full max-w-[420px] max-h-[420px] p-4">
            {/* Letra Vazada com Linha Guia Pontilhada */}
            <text
              x="200"
              y="280"
              textAnchor="middle"
              fontSize="290"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              fill="rgba(255, 255, 255, 0.7)"
              stroke={current.themeColor}
              strokeWidth="10"
              strokeDasharray="14 10"
              className="transition-all duration-300"
            >
              {current.letter}
            </text>
          </svg>
        </div>

        {/* Estrelas Guia Numeradas sobre os pontos da letra */}
        <div className="absolute inset-0 pointer-events-none">
          {current.checkpoints.map((cp) => {
            const isPassed = passedCheckpoints.includes(cp.id);

            return (
              <div
                key={cp.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  left: `${cp.xPct}%`,
                  top: `${cp.yPct}%`,
                }}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg transition-transform ${
                    isPassed
                      ? "bg-kids-yellow border-amber-500 text-amber-950 scale-125 ring-4 ring-yellow-400 animate-wiggle"
                      : "bg-white border-kids-purple text-purple-700 animate-pulse-gentle"
                  }`}
                >
                  {isPassed ? "⭐" : cp.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mascote no canto da prancha */}
        <div className="absolute bottom-4 right-4 text-5xl sm:text-6xl animate-bounce pointer-events-none opacity-85">
          {current.emoji}
        </div>

        {/* Canvas onde o Israel desenha com 100% de precisão */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-10 touch-none pointer-events-none"
        />

        {/* Tela de Vitória Quando Israel Termina o Contorno */}
        {isCompleted && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-bounce p-4 text-center">
            <span className="text-8xl sm:text-9xl mb-2">{current.emoji}</span>
            <div className="text-4xl sm:text-6xl font-black text-kids-purple mb-2">
              LETRA {current.letter}!
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mb-6">
              {current.letter} de {current.word}! ⭐
            </div>
            <button
              onClick={nextLetter}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-2xl sm:text-3xl px-8 sm:px-12 py-4 sm:py-5 rounded-4xl border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3 animate-pulse-gentle"
            >
              <span>PRÓXIMA LETRA!</span>
              <ArrowRight size={36} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* Dica no Rodapé com Progresso das Estrelas */}
      <div className="w-full bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-3xl border-4 border-kids-yellow shadow-kid flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500 animate-spin" size={24} />
          <span className="text-base sm:text-lg font-black text-slate-800">
            Siga as estrelinhas da letra {current.letter}!
          </span>
        </div>

        <div className="bg-amber-100 border-2 border-amber-400 px-4 py-1 rounded-2xl flex items-center gap-1.5 font-black text-amber-900 text-base">
          <span>⭐</span>
          <span>
            {passedCheckpoints.length} / {current.checkpoints.length}
          </span>
        </div>
      </div>
    </div>
  );
}
