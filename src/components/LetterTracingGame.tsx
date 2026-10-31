"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface Checkpoint {
  id: number;
  label: string;
  x: number; // 0-400
  y: number; // 0-400
}

interface LetterData {
  letter: string;
  word: string;
  emoji: string;
  themeColor: string;
  borderColor: string;
  paths: string[];
  checkpoints: Checkpoint[];
}

const BIBLICAL_ALPHABET: LetterData[] = [
  {
    letter: "A",
    word: "Arca de Noé",
    emoji: "🛳️",
    themeColor: "#3B82F6",
    borderColor: "border-blue-500",
    paths: [
      "M 100 330 L 200 70 L 300 330",
      "M 145 230 L 255 230",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 100, y: 330 },
      { id: 2, label: "2", x: 200, y: 70 },
      { id: 3, label: "3", x: 300, y: 330 },
      { id: 4, label: "4", x: 145, y: 230 },
      { id: 5, label: "5", x: 255, y: 230 },
    ],
  },
  {
    letter: "B",
    word: "Bíblia Sagrada",
    emoji: "📖",
    themeColor: "#9333EA",
    borderColor: "border-purple-500",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 200 70 A 65 65 0 0 1 200 200 L 130 200",
      "M 130 200 L 210 200 A 65 65 0 0 1 210 330 L 130 330",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 70 },
      { id: 2, label: "2", x: 130, y: 330 },
      { id: 3, label: "3", x: 200, y: 70 },
      { id: 4, label: "4", x: 265, y: 135 },
      { id: 5, label: "5", x: 130, y: 200 },
      { id: 6, label: "6", x: 275, y: 265 },
      { id: 7, label: "7", x: 130, y: 330 },
    ],
  },
  {
    letter: "C",
    word: "Criação de Deus",
    emoji: "🌍",
    themeColor: "#10B981",
    borderColor: "border-emerald-500",
    paths: ["M 300 120 A 130 130 0 0 0 80 200 A 130 130 0 0 0 300 280"],
    checkpoints: [
      { id: 1, label: "1", x: 300, y: 120 },
      { id: 2, label: "2", x: 200, y: 70 },
      { id: 3, label: "3", x: 75, y: 200 },
      { id: 4, label: "4", x: 200, y: 330 },
      { id: 5, label: "5", x: 300, y: 280 },
    ],
  },
  {
    letter: "D",
    word: "Davi & Harpa",
    emoji: "👑",
    themeColor: "#F59E0B",
    borderColor: "border-amber-500",
    paths: [
      "M 125 70 L 125 330",
      "M 125 70 L 195 70 A 130 130 0 0 1 195 330 L 125 330",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 125, y: 70 },
      { id: 2, label: "2", x: 125, y: 330 },
      { id: 3, label: "3", x: 195, y: 70 },
      { id: 4, label: "4", x: 325, y: 200 },
      { id: 5, label: "5", x: 195, y: 330 },
    ],
  },
  {
    letter: "E",
    word: "Estrela de Belém",
    emoji: "⭐",
    themeColor: "#EAB308",
    borderColor: "border-yellow-500",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 275 70",
      "M 130 200 L 245 200",
      "M 130 330 L 275 330",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 70 },
      { id: 2, label: "2", x: 130, y: 330 },
      { id: 3, label: "3", x: 275, y: 70 },
      { id: 4, label: "4", x: 245, y: 200 },
      { id: 5, label: "5", x: 275, y: 330 },
    ],
  },
  {
    letter: "F",
    word: "Fé em Deus",
    emoji: "🕊️",
    themeColor: "#06B6D4",
    borderColor: "border-cyan-500",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 275 70",
      "M 130 200 L 245 200",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 70 },
      { id: 2, label: "2", x: 130, y: 330 },
      { id: 3, label: "3", x: 275, y: 70 },
      { id: 4, label: "4", x: 245, y: 200 },
    ],
  },
  {
    letter: "G",
    word: "Golias & Pedrinha",
    emoji: "🛡️",
    themeColor: "#DC2626",
    borderColor: "border-rose-500",
    paths: [
      "M 300 120 A 130 130 0 0 0 80 200 A 130 130 0 0 0 300 280 L 300 210 L 220 210",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 300, y: 120 },
      { id: 2, label: "2", x: 75, y: 200 },
      { id: 3, label: "3", x: 300, y: 280 },
      { id: 4, label: "4", x: 300, y: 210 },
      { id: 5, label: "5", x: 220, y: 210 },
    ],
  },
  {
    letter: "H",
    word: "Harpa Sagrada",
    emoji: "🎵",
    themeColor: "#8B5CF6",
    borderColor: "border-violet-500",
    paths: [
      "M 120 70 L 120 330",
      "M 280 70 L 280 330",
      "M 120 200 L 280 200",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 120, y: 70 },
      { id: 2, label: "2", x: 120, y: 330 },
      { id: 3, label: "3", x: 280, y: 70 },
      { id: 4, label: "4", x: 280, y: 330 },
      { id: 5, label: "5", x: 200, y: 200 },
    ],
  },
  {
    letter: "I",
    word: "Israel Campeão",
    emoji: "👑",
    themeColor: "#F59E0B",
    borderColor: "border-amber-500",
    paths: [
      "M 130 70 L 270 70",
      "M 200 70 L 200 330",
      "M 130 330 L 270 330",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 70 },
      { id: 2, label: "2", x: 270, y: 70 },
      { id: 3, label: "3", x: 200, y: 70 },
      { id: 4, label: "4", x: 200, y: 200 },
      { id: 5, label: "5", x: 200, y: 330 },
      { id: 6, label: "6", x: 130, y: 330 },
      { id: 7, label: "7", x: 270, y: 330 },
    ],
  },
  {
    letter: "J",
    word: "Jesus Bom Pastor",
    emoji: "❤️",
    themeColor: "#EF4444",
    borderColor: "border-red-500",
    paths: [
      "M 140 70 L 280 70",
      "M 230 70 L 230 260 A 70 70 0 0 1 110 260",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 140, y: 70 },
      { id: 2, label: "2", x: 280, y: 70 },
      { id: 3, label: "3", x: 230, y: 70 },
      { id: 4, label: "4", x: 230, y: 260 },
      { id: 5, label: "5", x: 170, y: 330 },
      { id: 6, label: "6", x: 110, y: 260 },
    ],
  },
  {
    letter: "L",
    word: "Leão de Judá",
    emoji: "🦁",
    themeColor: "#D97706",
    borderColor: "border-amber-600",
    paths: ["M 130 70 L 130 330 L 280 330"],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 70 },
      { id: 2, label: "2", x: 130, y: 200 },
      { id: 3, label: "3", x: 130, y: 330 },
      { id: 4, label: "4", x: 280, y: 330 },
    ],
  },
  {
    letter: "M",
    word: "Moisés & o Mar",
    emoji: "📜",
    themeColor: "#0284C7",
    borderColor: "border-sky-600",
    paths: [
      "M 90 330 L 90 70 L 200 240 L 310 70 L 310 330",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 90, y: 330 },
      { id: 2, label: "2", x: 90, y: 70 },
      { id: 3, label: "3", x: 200, y: 240 },
      { id: 4, label: "4", x: 310, y: 70 },
      { id: 5, label: "5", x: 310, y: 330 },
    ],
  },
  {
    letter: "N",
    word: "Noé & Arco-Íris",
    emoji: "🌈",
    themeColor: "#14B8A6",
    borderColor: "border-teal-500",
    paths: [
      "M 110 330 L 110 70 L 290 330 L 290 70",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 110, y: 330 },
      { id: 2, label: "2", x: 110, y: 70 },
      { id: 3, label: "3", x: 290, y: 330 },
      { id: 4, label: "4", x: 290, y: 70 },
    ],
  },
  {
    letter: "O",
    word: "Ovelhinha Perdida",
    emoji: "🐑",
    themeColor: "#10B981",
    borderColor: "border-emerald-500",
    paths: ["M 200 70 A 130 130 0 1 0 200 330 A 130 130 0 1 0 200 70"],
    checkpoints: [
      { id: 1, label: "1", x: 200, y: 70 },
      { id: 2, label: "2", x: 70, y: 200 },
      { id: 3, label: "3", x: 200, y: 330 },
      { id: 4, label: "4", x: 330, y: 200 },
    ],
  },
  {
    letter: "P",
    word: "Peixinho de Jonas",
    emoji: "🐟",
    themeColor: "#38BDF8",
    borderColor: "border-sky-400",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 205 70 A 65 65 0 0 1 205 200 L 130 200",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 70 },
      { id: 2, label: "2", x: 130, y: 330 },
      { id: 3, label: "3", x: 205, y: 70 },
      { id: 4, label: "4", x: 270, y: 135 },
      { id: 5, label: "5", x: 130, y: 200 },
    ],
  },
  {
    letter: "R",
    word: "Rei dos Reis",
    emoji: "👑",
    themeColor: "#A855F7",
    borderColor: "border-purple-500",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 205 70 A 65 65 0 0 1 205 200 L 130 200",
      "M 195 200 L 285 330",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 70 },
      { id: 2, label: "2", x: 130, y: 330 },
      { id: 3, label: "3", x: 205, y: 70 },
      { id: 4, label: "4", x: 270, y: 135 },
      { id: 5, label: "5", x: 130, y: 200 },
      { id: 6, label: "6", x: 285, y: 330 },
    ],
  },
];

export function LetterTracingGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [passedCheckpoints, setPassedCheckpoints] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const lastCoordRef = useRef<{ x: number; y: number } | null>(null);
  const lastSvgCoordRef = useRef<{ x: number; y: number } | null>(null);

  const current = BIBLICAL_ALPHABET[currentIdx];

  // Configura a resolução do Canvas 1:1 com dpr correto
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }, []);

  useEffect(() => {
    syncCanvasSize();
    clearCanvas();
    setPassedCheckpoints([]);
    setIsCompleted(false);
    lastCoordRef.current = null;
    lastSvgCoordRef.current = null;

    const handleResize = () => {
      syncCanvasSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIdx, syncCanvasSize, clearCanvas]);

  // Checa pontos atingidos com interpolação precisa
  const checkCheckpointsAt = (svgX: number, svgY: number) => {
    current.checkpoints.forEach((cp) => {
      const dist = Math.hypot(svgX - cp.x, svgY - cp.y);

      // Tolerância ampla de 52px para dedinhos no mobile
      if (dist < 52 && !passedCheckpoints.includes(cp.id)) {
        sounds.playStar();
        setPassedCheckpoints((prev) => {
          if (prev.includes(cp.id)) return prev;
          const next = [...prev, cp.id];
          if (next.length === current.checkpoints.length && !isCompleted) {
            setIsCompleted(true);
            sounds.playSuccess();
            confetti({
              particleCount: 130,
              spread: 90,
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
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = stage.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    // Coordenadas projetadas 0-400
    const svgX = (localX / rect.width) * 400;
    const svgY = (localY / rect.height) * 400;

    // Interpolação para nunca pular estrelas mesmo em movimentos rápidos
    if (lastSvgCoordRef.current) {
      const p1 = lastSvgCoordRef.current;
      const distance = Math.hypot(svgX - p1.x, svgY - p1.y);
      const steps = Math.max(1, Math.floor(distance / 8));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const interX = p1.x + (svgX - p1.x) * t;
        const interY = p1.y + (svgY - p1.y) * t;
        checkCheckpointsAt(interX, interY);
      }
    } else {
      checkCheckpointsAt(svgX, svgY);
    }
    lastSvgCoordRef.current = { x: svgX, y: svgY };

    ctx.save();

    // Traçado brilhante duplo (núcleo branco + brilho dourado da aliança)
    if (lastCoordRef.current) {
      // 1. Halo Dourado Luminoso
      ctx.beginPath();
      ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
      ctx.lineTo(localX, localY);
      ctx.lineWidth = 36;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.78)";
      ctx.stroke();

      // 2. Núcleo Branco Intenso
      ctx.beginPath();
      ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
      ctx.lineTo(localX, localY);
      ctx.lineWidth = 18;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(localX, localY, 18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251, 191, 36, 0.85)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(localX, localY, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }

    // Partículas de faíscas brilhantes
    if (Math.random() > 0.45) {
      ctx.font = "20px sans-serif";
      ctx.fillText("✨", localX + (Math.random() * 26 - 13), localY + (Math.random() * 26 - 13));
    }

    ctx.restore();
    lastCoordRef.current = { x: localX, y: localY };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDrawing(true);
    lastCoordRef.current = null;
    lastSvgCoordRef.current = null;
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
    lastSvgCoordRef.current = null;
  };

  const handleReset = () => {
    sounds.playBoing();
    clearCanvas();
    setPassedCheckpoints([]);
    setIsCompleted(false);
    lastCoordRef.current = null;
    lastSvgCoordRef.current = null;
  };

  const nextLetter = () => {
    sounds.playStar();
    setCurrentIdx((i) => (i + 1) % BIBLICAL_ALPHABET.length);
  };

  const prevLetter = () => {
    sounds.playPop();
    setCurrentIdx((i) => (i - 1 + BIBLICAL_ALPHABET.length) % BIBLICAL_ALPHABET.length);
  };

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100">
      {/* BARRA SUPERIOR: FAIXA ROLÁVEL COM TODO O ALFABETO BÍBLICO */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-2.5 sm:px-6 py-2 sm:py-2.5 border-b-4 border-kids-purple shadow-md z-20 flex-shrink-0">
        <button
          onClick={prevLetter}
          className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-sm flex-shrink-0"
          title="Letra Anterior"
        >
          <ChevronLeft size={22} className="stroke-[3]" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-0.5 scrollbar-none">
          {BIBLICAL_ALPHABET.map((item, idx) => (
            <button
              key={item.letter}
              onClick={() => {
                sounds.playPop();
                setCurrentIdx(idx);
              }}
              className={`kid-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-3 sm:border-4 font-black transition-all flex-shrink-0 ${
                currentIdx === idx
                  ? "bg-kids-yellow border-amber-500 scale-105 shadow-kid-sm ring-2 sm:ring-4 ring-yellow-300"
                  : "bg-slate-50 border-slate-200 hover:bg-amber-50"
              }`}
            >
              <span className="text-xl sm:text-3xl font-black" style={{ color: item.themeColor }}>
                {item.letter}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={nextLetter}
            className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-sm"
            title="Próxima Letra"
          >
            <ChevronRight size={22} className="stroke-[3]" />
          </button>

          <button
            onClick={handleReset}
            className="kid-btn bg-white hover:bg-slate-100 text-slate-700 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-sm"
            title="Recomeçar Desenho"
          >
            <RotateCcw size={20} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL: PALCO QUADRADO PROPORCIONAL COM PRECISÃO 1:1 */}
      <div className="relative flex-1 min-h-0 w-full p-2 sm:p-4 flex items-center justify-center overflow-hidden">
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative aspect-square h-full max-h-[66vh] sm:max-h-[72vh] max-w-[92vw] rounded-3xl sm:rounded-4xl bg-white border-6 sm:border-8 border-kids-purple shadow-[0_16px_45px_rgba(0,0,0,0.2)] overflow-hidden cursor-crosshair touch-none select-none flex items-center justify-center"
        >
          {/* Letra em Traçado Vetorial SVG Perfeito */}
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Pista guia de fundo larga */}
              {current.paths.map((d, i) => (
                <path
                  key={`bg-${i}`}
                  d={d}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="56"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Linha pontilhada no centro da pista */}
              {current.paths.map((d, i) => (
                <path
                  key={`dash-${i}`}
                  d={d}
                  fill="none"
                  stroke={current.themeColor}
                  strokeWidth="8"
                  strokeDasharray="14 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Checkpoints numerados */}
              {current.checkpoints.map((cp) => {
                const isPassed = passedCheckpoints.includes(cp.id);
                const isNext = !isPassed && cp.id === passedCheckpoints.length + 1;

                return (
                  <g key={cp.id} className="transition-all duration-300">
                    {/* Halo suave sobre o próximo ponto */}
                    {isNext && (
                      <circle
                        cx={cp.x}
                        cy={cp.y}
                        r="32"
                        fill="#FDE047"
                        opacity="0.55"
                        className="animate-pulse"
                      />
                    )}

                    {/* Círculo do Checkpoint */}
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r={isPassed ? "22" : "20"}
                      fill={isPassed ? "#FBBF24" : "#FFFFFF"}
                      stroke={isPassed ? "#D97706" : isNext ? "#9333EA" : "#CBD5E1"}
                      strokeWidth={isPassed || isNext ? "4" : "3"}
                    />

                    {/* Número ou Estrela */}
                    <text
                      x={cp.x}
                      y={cp.y + (isPassed ? 7 : 6.5)}
                      textAnchor="middle"
                      fontSize={isPassed ? "20" : "18"}
                      fontWeight="900"
                      fill={isPassed ? "#78350F" : isNext ? "#6B21A8" : "#94A3B8"}
                      className="select-none"
                    >
                      {isPassed ? "⭐" : cp.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Mascote Bíblico no Canto */}
          <div className="absolute bottom-3 right-3 bg-amber-50/95 border-2 border-amber-300 rounded-2xl px-3 py-1.5 flex items-center gap-2 pointer-events-none shadow-sm">
            <span className="text-3xl sm:text-5xl">{current.emoji}</span>
            <span className="text-xs sm:text-base font-black text-amber-950">
              {current.word}
            </span>
          </div>

          {/* Canvas onde o Israel desenha com precisão 1:1 */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-10 touch-none pointer-events-none"
          />

          {/* Tela de Vitória ao Terminar a Letra */}
          {isCompleted && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-7xl sm:text-9xl mb-2 animate-bounce">{current.emoji}</span>
              <div className="text-3xl sm:text-6xl font-black text-kids-purple mb-1">
                LETRA {current.letter}!
              </div>
              <div className="text-xl sm:text-3xl font-extrabold text-amber-600 mb-6">
                {current.letter} de {current.word}! ⭐
              </div>
              <button
                onClick={nextLetter}
                className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-xl sm:text-3xl px-8 sm:px-12 py-3.5 sm:py-5 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3 active:scale-95"
              >
                <span>PRÓXIMA LETRA!</span>
                <ArrowRight size={28} className="stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BARRA INFERIOR COM PROGRESSO DAS ESTRELAS (COM SAFE AREA BOTTOM) */}
      <div className="w-full bg-white/95 backdrop-blur-md px-3 sm:px-6 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] border-t-4 border-kids-yellow shadow-[0_-8px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2 z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500" size={20} />
          <span className="text-xs sm:text-base font-black text-slate-800">
            Siga os números para desenhar {current.letter} ({current.word})!
          </span>
        </div>

        <div className="bg-amber-100 border-2 border-amber-400 px-3.5 py-1 rounded-xl flex items-center gap-1.5 font-black text-amber-950 text-sm sm:text-base">
          <span>⭐</span>
          <span>
            {passedCheckpoints.length} / {current.checkpoints.length}
          </span>
        </div>
      </div>
    </div>
  );
}
