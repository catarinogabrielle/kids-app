"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight, Sparkles } from "lucide-react";

interface Checkpoint {
  id: number;
  label: string;
  x: number; // Coordenadas no viewBox 400x400
  y: number;
}

interface LetterData {
  letter: string;
  word: string;
  emoji: string;
  colorName: string;
  themeColor: string;
  paths: string[];
  checkpoints: Checkpoint[];
}

const LETTER_LIST: LetterData[] = [
  {
    letter: "I",
    word: "Israel",
    emoji: "👑",
    colorName: "text-amber-500",
    themeColor: "#F59E0B",
    paths: ["M 200 75 L 200 325"],
    checkpoints: [
      { id: 1, label: "1", x: 200, y: 75 },
      { id: 2, label: "2", x: 200, y: 200 },
      { id: 3, label: "3", x: 200, y: 325 },
    ],
  },
  {
    letter: "A",
    word: "Arca",
    emoji: "🛳️",
    colorName: "text-blue-500",
    themeColor: "#3B82F6",
    paths: [
      "M 100 325 L 200 75 L 300 325",
      "M 145 225 L 255 225",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 100, y: 325 },
      { id: 2, label: "2", x: 200, y: 75 },
      { id: 3, label: "3", x: 300, y: 325 },
      { id: 4, label: "4", x: 145, y: 225 },
      { id: 5, label: "5", x: 255, y: 225 },
    ],
  },
  {
    letter: "L",
    word: "Leão",
    emoji: "🦁",
    colorName: "text-yellow-600",
    themeColor: "#D97706",
    paths: ["M 130 75 L 130 325 L 275 325"],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 75 },
      { id: 2, label: "2", x: 130, y: 200 },
      { id: 3, label: "3", x: 130, y: 325 },
      { id: 4, label: "4", x: 275, y: 325 },
    ],
  },
  {
    letter: "D",
    word: "Dino",
    emoji: "🦖",
    colorName: "text-emerald-600",
    themeColor: "#059669",
    paths: [
      "M 130 75 L 130 325",
      "M 130 75 L 190 75 A 125 125 0 0 1 190 325 L 130 325",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 75 },
      { id: 2, label: "2", x: 130, y: 325 },
      { id: 3, label: "3", x: 190, y: 75 },
      { id: 4, label: "4", x: 315, y: 200 },
      { id: 5, label: "5", x: 190, y: 325 },
    ],
  },
  {
    letter: "C",
    word: "Carro",
    emoji: "🚗",
    colorName: "text-red-500",
    themeColor: "#EF4444",
    paths: ["M 296 120 A 125 125 0 0 0 75 200 A 125 125 0 0 0 296 280"],
    checkpoints: [
      { id: 1, label: "1", x: 296, y: 120 },
      { id: 2, label: "2", x: 200, y: 75 },
      { id: 3, label: "3", x: 75, y: 200 },
      { id: 4, label: "4", x: 200, y: 325 },
      { id: 5, label: "5", x: 296, y: 280 },
    ],
  },
  {
    letter: "B",
    word: "Bíblia",
    emoji: "📖",
    colorName: "text-purple-600",
    themeColor: "#9333EA",
    paths: [
      "M 130 75 L 130 325",
      "M 130 75 L 190 75 A 62.5 62.5 0 0 1 190 200 L 130 200",
      "M 130 200 L 200 200 A 62.5 62.5 0 0 1 200 325 L 130 325",
    ],
    checkpoints: [
      { id: 1, label: "1", x: 130, y: 75 },
      { id: 2, label: "2", x: 130, y: 325 },
      { id: 3, label: "3", x: 190, y: 75 },
      { id: 4, label: "4", x: 252, y: 138 },
      { id: 5, label: "5", x: 130, y: 200 },
      { id: 6, label: "6", x: 262, y: 262 },
      { id: 7, label: "7", x: 130, y: 325 },
    ],
  },
  {
    letter: "O",
    word: "Ovelha",
    emoji: "🐑",
    colorName: "text-teal-600",
    themeColor: "#0D9488",
    paths: ["M 200 75 A 125 125 0 1 0 200 325 A 125 125 0 1 0 200 75"],
    checkpoints: [
      { id: 1, label: "1", x: 200, y: 75 },
      { id: 2, label: "2", x: 75, y: 200 },
      { id: 3, label: "3", x: 200, y: 325 },
      { id: 4, label: "4", x: 325, y: 200 },
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

  const current = LETTER_LIST[currentIdx];

  // Configura a resolução exata 1:1 do Canvas de acordo com o palco quadrado
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

  // Checa se o toque atingiu uma estrela guia do contorno (coordenadas 0-400)
  const checkHitStars = (svgX: number, svgY: number) => {
    current.checkpoints.forEach((cp) => {
      const dist = Math.hypot(svgX - cp.x, svgY - cp.y);

      // Tolerância ampla de 48px ideal para dedinhos de 4 anos
      if (dist < 48 && !passedCheckpoints.includes(cp.id)) {
        sounds.playStar();
        setPassedCheckpoints((prev) => {
          const next = [...prev, cp.id];
          if (next.length === current.checkpoints.length && !isCompleted) {
            setIsCompleted(true);
            sounds.playSuccess();
            confetti({
              particleCount: 120,
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

    // Converte para o sistema 400x400
    const svgX = (localX / rect.width) * 400;
    const svgY = (localY / rect.height) * 400;

    checkHitStars(svgX, svgY);

    ctx.save();

    // Traçado dourado / arco-íris luminoso sob o dedo
    if (lastCoordRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
      ctx.lineTo(localX, localY);
      ctx.lineWidth = 36;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.75)";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
      ctx.lineTo(localX, localY);
      ctx.lineWidth = 16;
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(localX, localY, 18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251, 191, 36, 0.85)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(localX, localY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }

    if (Math.random() > 0.45) {
      ctx.font = "20px sans-serif";
      ctx.fillText("✨", localX + (Math.random() * 24 - 12), localY + (Math.random() * 24 - 12));
    }

    ctx.restore();
    lastCoordRef.current = { x: localX, y: localY };
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

      {/* ÁREA CENTRAL COM O PALCO QUADRADO PROPORCIONAL UNIFICADO */}
      <div className="relative flex-1 min-h-0 w-full my-1 sm:my-2 flex items-center justify-center overflow-hidden">
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative aspect-square w-full max-w-[330px] sm:max-w-[420px] max-h-[48vh] sm:max-h-[55vh] rounded-3xl sm:rounded-4xl bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 border-4 sm:border-8 border-kids-purple shadow-2xl overflow-hidden cursor-crosshair touch-none select-none flex items-center justify-center"
        >
          {/* Letra em Traçado Vetorial SVG Perfeito com Checkpoints Integrados */}
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Pista guia de fundo larga e acolchoada */}
              {current.paths.map((d, i) => (
                <path
                  key={`bg-${i}`}
                  d={d}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="54"
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

              {/* Checkpoints desenhados diretamente no SVG para alinhamento 1:1 perfeito */}
              {current.checkpoints.map((cp) => {
                const isPassed = passedCheckpoints.includes(cp.id);
                const isNext = !isPassed && cp.id === (passedCheckpoints.length + 1);

                return (
                  <g key={cp.id} className="transition-all duration-300">
                    {/* Halo de destaque suave sobre o próximo ponto a ser seguido */}
                    {isNext && (
                      <circle
                        cx={cp.x}
                        cy={cp.y}
                        r="30"
                        fill="#FDE047"
                        opacity="0.5"
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

                    {/* Número ou Estrela do Checkpoint */}
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

          {/* Mascote no canto do palco */}
          <div className="absolute bottom-2.5 right-2.5 text-3xl sm:text-5xl pointer-events-none opacity-85">
            {current.emoji}
          </div>

          {/* Canvas onde o Israel desenha com precisão 1:1 */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-10 touch-none pointer-events-none"
          />

          {/* Tela de Vitória Quando Israel Termina o Contorno */}
          {isCompleted && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-6xl sm:text-8xl mb-2">{current.emoji}</span>
              <div className="text-2xl sm:text-5xl font-black text-kids-purple mb-1">
                LETRA {current.letter}!
              </div>
              <div className="text-lg sm:text-2xl font-extrabold text-amber-600 mb-4 sm:mb-5">
                {current.letter} de {current.word}! ⭐
              </div>
              <button
                onClick={nextLetter}
                className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-lg sm:text-2xl px-6 sm:px-10 py-3 sm:py-4 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-2"
              >
                <span>PRÓXIMA LETRA!</span>
                <ArrowRight size={26} className="stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dica no Rodapé com Progresso das Estrelas */}
      <div className="w-full bg-white/95 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-yellow shadow-kid flex items-center justify-between gap-2 z-20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-500" size={20} />
          <span className="text-xs sm:text-base font-black text-slate-800">
            Siga as estrelinhas da letra {current.letter}!
          </span>
        </div>

        <div className="bg-amber-100 border-2 border-amber-400 px-3 py-1 rounded-xl flex items-center gap-1.5 font-black text-amber-900 text-sm">
          <span>⭐</span>
          <span>
            {passedCheckpoints.length} / {current.checkpoints.length}
          </span>
        </div>
      </div>
    </div>
  );
}
