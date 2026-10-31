"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { Paintbrush, PaintBucket, Camera, RotateCcw, Sparkles, Eraser } from "lucide-react";

type ColorTemplate = "ark" | "dino" | "fire" | "daniel" | "blank";
type ToolMode = "bucket" | "brush" | "eraser" | "stamp";

interface Stamp {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export function PaintingGame() {
  const [template, setTemplate] = useState<ColorTemplate>("daniel");
  const [selectedColor, setSelectedColor] = useState("#F59E0B");
  const [toolMode, setToolMode] = useState<ToolMode>("bucket");
  const [selectedStamp, setSelectedStamp] = useState("⭐");
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [brushSize, setBrushSize] = useState(16);
  const [eraserSize, setEraserSize] = useState(32);
  const [isDrawing, setIsDrawing] = useState(false);
  const [partColors, setPartColors] = useState<Record<string, string>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Paleta de 12 cores vibrantes de livro de colorir (incluindo Dourado, Pele/Areia e Branco)
  const colors = [
    { name: "Vermelho", hex: "#EF4444" },
    { name: "Laranja", hex: "#FF9F1C" },
    { name: "Dourado Leão", hex: "#F59E0B" },
    { name: "Amarelo Sol", hex: "#FDE047" },
    { name: "Areia / Pele", hex: "#FDBA74" },
    { name: "Verde Limão", hex: "#10B981" },
    { name: "Verde Folha", hex: "#16A34A" },
    { name: "Azul Céu", hex: "#38BDF8" },
    { name: "Azul Real", hex: "#2563EB" },
    { name: "Roxo", hex: "#9B5DE5" },
    { name: "Rosa", hex: "#FF70A6" },
    { name: "Marrom", hex: "#854D0E" },
  ];

  const stampsList = ["⭐", "🐾", "🦁", "🦖", "❤️", "👑", "🌈", "🚗"];

  useEffect(() => {
    clearCanvas();
    setPartColors({});
    setStamps([]);
  }, [template]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClearAll = () => {
    sounds.playBoing();
    clearCanvas();
    setPartColors({});
    setStamps([]);
  };

  const handlePartClick = (partId: string) => {
    if (toolMode === "bucket") {
      sounds.playPop();
      setPartColors((prev) => ({
        ...prev,
        [partId]: selectedColor,
      }));
    } else if (toolMode === "eraser") {
      sounds.playEraser();
      setPartColors((prev) => ({
        ...prev,
        [partId]: "#FFFFFF",
      }));
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const x = cssX * scaleX;
    const y = cssY * scaleY;

    if (toolMode === "stamp") {
      sounds.playPop();
      setStamps((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), emoji: selectedStamp, x: cssX, y: cssY },
      ]);
      return;
    }

    if (toolMode === "eraser") {
      sounds.playEraser();
      setIsDrawing(true);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = eraserSize * scaleX;
      return;
    }

    if (toolMode === "brush") {
      sounds.playPop();
      setIsDrawing(true);
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize * scaleX;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (toolMode !== "brush" && toolMode !== "eraser")) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    if (toolMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserSize * scaleX;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = brushSize * scaleX;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSaveArtwork = async () => {
    sounds.playCamera();
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 800;
    tempCanvas.height = 600;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 800, 600);

    if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 0, 0, 800, 600);
    }

    ctx.font = "44px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    stamps.forEach((s) => {
      ctx.fillText(
        s.emoji,
        (s.x / (canvasRef.current?.clientWidth || 1)) * 800,
        (s.y / (canvasRef.current?.clientHeight || 1)) * 600
      );
    });

    const dataUrl = tempCanvas.toDataURL("image/png");

    try {
      const existing = localStorage.getItem("israel_saved_paintings");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(dataUrl);
      localStorage.setItem("israel_saved_paintings", JSON.stringify(list.slice(0, 20)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col justify-between w-full h-full select-none overflow-hidden bg-white">
      {/* HUD Superior do Estúdio: Seleção de Desenhos + Foto/Limpar */}
      <div className="w-full flex items-center justify-between gap-1 sm:gap-3 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-2 sm:px-4 py-1.5 sm:py-2 border-b-4 border-blue-700 shadow-md z-20 flex-shrink-0">
        {/* 5 Modelos de Desenho Grandes */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {[
            { id: "daniel", emoji: "🦁", label: "Rei Leão" },
            { id: "ark", emoji: "🛳️", label: "Arca" },
            { id: "dino", emoji: "🦖", label: "Dino" },
            { id: "fire", emoji: "🚒", label: "Bombeiro" },
            { id: "blank", emoji: "📄", label: "Livre" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playPop();
                setTemplate(t.id as ColorTemplate);
              }}
              className={`kid-btn px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 flex items-center gap-1.5 transition-all ${
                template === t.id
                  ? "bg-kids-yellow border-amber-600 scale-105 shadow-kid ring-2 ring-yellow-200 text-amber-950"
                  : "bg-white/90 border-white text-slate-700 hover:bg-white"
              }`}
            >
              <span className="text-xl sm:text-2xl">{t.emoji}</span>
              <span className="hidden md:inline font-black text-xs sm:text-sm">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Ações Rápidas: Foto e Limpar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleSaveArtwork}
            className="kid-btn bg-kids-coral hover:bg-rose-500 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-rose-800 shadow-kid flex items-center gap-1.5"
            title="Salvar Foto!"
          >
            <Camera size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
            <span className="hidden sm:inline font-black text-xs sm:text-sm">FOTO</span>
          </button>

          <button
            onClick={handleClearAll}
            className="kid-btn bg-white/95 hover:bg-slate-100 text-slate-800 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-slate-300 shadow-kid flex items-center gap-1"
            title="Limpar"
          >
            <RotateCcw size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
            <span className="hidden sm:inline font-black text-xs sm:text-sm">LIMPAR</span>
          </button>
        </div>
      </div>

      {/* PRANCHA DE PINTURA TELA CHEIA (Ilustrações Vetoriais de Livro de Colorir Profissional) */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full h-full bg-white overflow-hidden touch-none flex items-center justify-center"
      >
        {/* TEMPLATE 1: A GRANDE ARCA DE NOÉ (100% Vetorial de Livro de Colorir) */}
        {template === "ark" && (
          <svg
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full select-none overflow-visible"
          >
            {/* Céu Estendido */}
            <rect
              x="-1000"
              y="-1000"
              width="3000"
              height="1365"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />

            {/* Arco-Íris de 4 Faixas */}
            <path
              d="M -30 330 A 280 260 0 0 1 530 330"
              stroke={partColors["rainbow1"] || "#FFFFFF"}
              strokeWidth="26"
              fill="none"
              onClick={() => handlePartClick("rainbow1")}
              className="cursor-pointer"
            />
            <path d="M -43 330 A 293 273 0 0 1 543 330" stroke="#1E293B" strokeWidth="5" fill="none" pointerEvents="none" />
            <path d="M -17 330 A 267 247 0 0 1 517 330" stroke="#1E293B" strokeWidth="5" fill="none" pointerEvents="none" />

            <path
              d="M -4 330 A 254 234 0 0 1 504 330"
              stroke={partColors["rainbow2"] || "#FFFFFF"}
              strokeWidth="26"
              fill="none"
              onClick={() => handlePartClick("rainbow2")}
              className="cursor-pointer"
            />
            <path d="M 9 330 A 241 221 0 0 1 491 330" stroke="#1E293B" strokeWidth="5" fill="none" pointerEvents="none" />

            <path
              d="M 22 330 A 228 208 0 0 1 478 330"
              stroke={partColors["rainbow3"] || "#FFFFFF"}
              strokeWidth="26"
              fill="none"
              onClick={() => handlePartClick("rainbow3")}
              className="cursor-pointer"
            />
            <path d="M 35 330 A 215 195 0 0 1 465 330" stroke="#1E293B" strokeWidth="5" fill="none" pointerEvents="none" />

            <path
              d="M 48 330 A 202 182 0 0 1 452 330"
              stroke={partColors["rainbow4"] || "#FFFFFF"}
              strokeWidth="26"
              fill="none"
              onClick={() => handlePartClick("rainbow4")}
              className="cursor-pointer"
            />
            <path d="M 61 330 A 189 169 0 0 1 439 330" stroke="#1E293B" strokeWidth="5" fill="none" pointerEvents="none" />

            {/* Sol Sorridente com Raios */}
            <g>
              <circle
                cx="68"
                cy="72"
                r="42"
                fill={partColors["sun"] || "#FFFFFF"}
                stroke="#1E293B"
                strokeWidth="6"
                onClick={() => handlePartClick("sun")}
                className="cursor-pointer"
              />
              <g stroke="#1E293B" strokeWidth="5" strokeLinecap="round" pointerEvents="none">
                <line x1="68" y1="14" x2="68" y2="22" />
                <line x1="68" y1="122" x2="68" y2="130" />
                <line x1="10" y1="72" x2="18" y2="72" />
                <line x1="118" y1="72" x2="126" y2="72" />
                <line x1="26" y1="30" x2="33" y2="37" />
                <line x1="103" y1="107" x2="110" y2="114" />
                <line x1="110" y1="30" x2="103" y2="37" />
                <line x1="33" y1="107" x2="26" y2="114" />
              </g>
              <circle cx="54" cy="64" r="4.5" fill="#1E293B" pointerEvents="none" />
              <circle cx="82" cy="64" r="4.5" fill="#1E293B" pointerEvents="none" />
              <path d="M 54 80 Q 68 94 82 80" stroke="#1E293B" strokeWidth="4.5" fill="none" strokeLinecap="round" pointerEvents="none" />
            </g>

            {/* Pombinha da Paz em Vetor no Céu */}
            <g>
              <path
                d="M 165 78 C 175 62 200 62 212 74 C 225 65 242 72 232 88 C 222 102 185 104 170 92 L 152 98 L 158 84 Z"
                fill={partColors["dove"] || "#FFFFFF"}
                stroke="#1E293B"
                strokeWidth="5"
                strokeLinejoin="round"
                onClick={() => handlePartClick("dove")}
                className="cursor-pointer"
              />
              <path
                d="M 188 76 C 182 50 208 42 214 68"
                fill={partColors["doveWing"] || "#FFFFFF"}
                stroke="#1E293B"
                strokeWidth="5"
                strokeLinejoin="round"
                onClick={() => handlePartClick("doveWing")}
                className="cursor-pointer"
              />
              <circle cx="222" cy="76" r="3" fill="#1E293B" pointerEvents="none" />
              <path d="M 234 78 L 246 75 L 236 84" fill="#1E293B" pointerEvents="none" />
            </g>

            {/* Nuvem Fofinha Direita */}
            <path
              d="M 355 72 Q 375 38 412 52 Q 450 38 468 68 Q 498 78 485 110 Q 465 128 410 124 Q 355 128 342 102 Q 332 78 355 72 Z"
              fill={partColors["cloud"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("cloud")}
              className="cursor-pointer"
            />

            {/* Telhado Ondulado da Arca */}
            <path
              d="M 85 182 L 250 88 L 415 182 Z"
              fill={partColors["roof"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("roof")}
              className="cursor-pointer"
            />
            {/* Beiral do Telhado */}
            <rect
              x="78"
              y="175"
              width="344"
              height="16"
              rx="8"
              fill={partColors["roofTrim"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("roofTrim")}
              className="cursor-pointer"
            />

            {/* Cabine Principal da Arca */}
            <rect
              x="102"
              y="191"
              width="296"
              height="96"
              rx="8"
              fill={partColors["cabin"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("cabin")}
              className="cursor-pointer"
            />

            {/* Janela 1 (Esquerda) + Girafinha Vetorial */}
            <path
              d="M 124 287 L 124 228 A 32 32 0 0 1 188 228 L 188 287 Z"
              fill={partColors["win1"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              onClick={() => handlePartClick("win1")}
              className="cursor-pointer"
            />
            <g pointerEvents="none">
              <ellipse cx="156" cy="252" rx="16" ry="18" fill={partColors["giraffe"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="4" />
              <line x1="148" y1="234" x2="145" y2="222" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
              <line x1="164" y1="234" x2="167" y2="222" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
              <circle cx="145" cy="220" r="3.5" fill="#1E293B" />
              <circle cx="167" cy="220" r="3.5" fill="#1E293B" />
              <circle cx="150" cy="248" r="2.8" fill="#1E293B" />
              <circle cx="162" cy="248" r="2.8" fill="#1E293B" />
              <path d="M 150 258 Q 156 264 162 258" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>

            {/* Porta Central + Leãozinho Vetorial */}
            <path
              d="M 212 287 L 212 222 A 38 38 0 0 1 288 222 L 288 287 Z"
              fill={partColors["door"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              onClick={() => handlePartClick("door")}
              className="cursor-pointer"
            />
            <g pointerEvents="none">
              <circle cx="250" cy="252" r="24" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" strokeDasharray="6 3" />
              <circle cx="250" cy="252" r="16" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
              <circle cx="244" cy="248" r="2.8" fill="#1E293B" />
              <circle cx="256" cy="248" r="2.8" fill="#1E293B" />
              <polygon points="247,254 253,254 250,259" fill="#1E293B" />
            </g>

            {/* Janela 2 (Direita) + Elefantinho Vetorial */}
            <path
              d="M 312 287 L 312 228 A 32 32 0 0 1 376 228 L 376 287 Z"
              fill={partColors["win2"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              onClick={() => handlePartClick("win2")}
              className="cursor-pointer"
            />
            <g pointerEvents="none">
              <circle cx="326" cy="252" r="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3.5" />
              <circle cx="362" cy="252" r="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3.5" />
              <circle cx="344" cy="252" r="15" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
              <circle cx="338" cy="248" r="2.5" fill="#1E293B" />
              <circle cx="350" cy="248" r="2.5" fill="#1E293B" />
              <path d="M 344 254 Q 344 270 352 268" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" />
            </g>

            {/* Casco Superior da Arca (Com vigas e escotilhas) */}
            <path
              d="M 22 282 Q 250 296 478 282 L 452 348 Q 250 362 48 348 Z"
              fill={partColors["hullUpper"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("hullUpper")}
              className="cursor-pointer"
            />
            {/* 4 Escotilhas Redondas */}
            {[115, 205, 295, 385].map((cx, i) => (
              <circle
                key={i}
                cx={cx}
                cy="318"
                r="14"
                fill={partColors[`porthole${i}`] || "#FFFFFF"}
                stroke="#1E293B"
                strokeWidth="5"
                onClick={() => handlePartClick(`porthole${i}`)}
                className="cursor-pointer"
              />
            ))}

            {/* Casco Inferior da Arca */}
            <path
              d="M 48 348 Q 250 362 452 348 L 412 418 Q 250 436 88 418 Z"
              fill={partColors["hull"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("hull")}
              className="cursor-pointer"
            />
            <line x1="160" y1="354" x2="170" y2="424" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />
            <line x1="250" y1="356" x2="250" y2="428" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />
            <line x1="340" y1="354" x2="330" y2="424" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />

            {/* Ondas do Mar em Camadas */}
            <path
              d="M -1000 398 Q -75 372 0 398 T 150 398 T 300 398 T 450 398 T 600 398 L 2000 398 L 2000 450 L -1000 450 Z"
              fill={partColors["sea1"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sea1")}
              className="cursor-pointer"
            />
            <path
              d="M -1000 442 Q -75 418 0 442 T 150 442 T 300 442 T 450 442 T 600 442 L 2000 442 L 2000 1500 L -1000 1500 Z"
              fill={partColors["sea"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sea")}
              className="cursor-pointer"
            />

            {/* Peixinho e Baleia Vetoriais no Mar */}
            <g>
              <path
                d="M 95 468 C 115 450 145 450 160 468 C 145 486 115 486 95 468 Z M 95 468 L 75 454 L 75 482 Z"
                fill={partColors["fish"] || "#FFFFFF"}
                stroke="#1E293B"
                strokeWidth="5"
                strokeLinejoin="round"
                onClick={() => handlePartClick("fish")}
                className="cursor-pointer"
              />
              <circle cx="144" cy="464" r="3" fill="#1E293B" pointerEvents="none" />
            </g>
            <g>
              <path
                d="M 340 475 C 340 442 405 442 415 468 C 430 468 442 458 448 448 L 458 462 L 446 476 C 435 485 355 488 340 475 Z"
                fill={partColors["whale"] || "#FFFFFF"}
                stroke="#1E293B"
                strokeWidth="5"
                strokeLinejoin="round"
                onClick={() => handlePartClick("whale")}
                className="cursor-pointer"
              />
              <circle cx="362" cy="464" r="3.5" fill="#1E293B" pointerEvents="none" />
            </g>
          </svg>
        )}

        {/* TEMPLATE 2: SUPER DINO T-REX AMIGO (100% Vetorial de Livro de Colorir) */}
        {template === "dino" && (
          <svg
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full select-none overflow-visible"
          >
            {/* Céu Estendido */}
            <rect
              x="-1000"
              y="-1000"
              width="3000"
              height="1365"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />

            {/* Vulcão Pré-histórico com Lava e Fumaça */}
            <path
              d="M 285 68 Q 305 38 340 48 Q 375 35 395 62 Q 410 85 375 95 L 305 95 Q 270 88 285 68 Z"
              fill={partColors["smoke"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("smoke")}
              className="cursor-pointer"
            />
            <polygon
              points="230,365 305,120 375,120 455,365"
              fill={partColors["mountain"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinejoin="round"
              onClick={() => handlePartClick("mountain")}
              className="cursor-pointer"
            />
            <path
              d="M 305 120 L 375 120 L 388 165 Q 370 185 355 162 Q 340 190 322 162 Q 305 182 292 165 Z"
              fill={partColors["lava"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("lava")}
              className="cursor-pointer"
            />

            {/* Gramado Pré-histórico Estendido */}
            <rect
              x="-1000"
              y="365"
              width="3000"
              height="1500"
              fill={partColors["grass"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("grass")}
              className="cursor-pointer"
            />

            {/* Sol */}
            <circle
              cx="65"
              cy="68"
              r="42"
              fill={partColors["sun"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sun")}
              className="cursor-pointer"
            />

            {/* Cristas Dorsais do Dino */}
            {[
              "M 155 76 L 178 36 L 204 72 Z",
              "M 122 114 L 132 72 L 160 102 Z",
              "M 105 168 L 96 128 L 130 148 Z",
              "M 96 232 L 74 202 L 112 208 Z",
              "M 76 296 L 48 272 L 88 274 Z",
            ].map((pts, idx) => (
              <path
                key={idx}
                d={pts}
                fill={partColors["spikes"] || "#FFFFFF"}
                stroke="#1E293B"
                strokeWidth="6"
                strokeLinejoin="round"
                onClick={() => handlePartClick("spikes")}
                className="cursor-pointer"
              />
            ))}

            {/* Perna Traseira Esquerda (Fundo) */}
            <path
              d="M 225 345 C 245 345 262 385 255 425 L 275 425 C 282 435 278 446 265 446 L 210 446 Z"
              fill={partColors["legBack"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("legBack")}
              className="cursor-pointer"
            />

            {/* Corpo Esculpido, Cauda e Cabeça do Dino */}
            <path
              d="M 145 165 C 122 110 165 58 235 62 C 305 65 348 92 348 135 C 348 168 312 185 262 185 C 292 218 308 275 292 335 C 275 392 218 415 155 405 C 95 405 32 375 18 325 C 12 302 35 298 52 312 C 78 332 108 332 122 295 C 128 250 132 205 145 165 Z"
              fill={partColors["dinoBody"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("dinoBody")}
              className="cursor-pointer"
            />

            {/* Barriguinha Listrada do Dino */}
            <path
              d="M 232 192 C 285 212 298 282 278 342 C 262 378 232 392 208 382 C 228 325 228 252 232 192 Z"
              fill={partColors["belly"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinejoin="round"
              onClick={() => handlePartClick("belly")}
              className="cursor-pointer"
            />
            <line x1="232" y1="238" x2="282" y2="238" stroke="#1E293B" strokeWidth="4.5" pointerEvents="none" />
            <line x1="228" y1="278" x2="290" y2="278" stroke="#1E293B" strokeWidth="4.5" pointerEvents="none" />
            <line x1="224" y1="318" x2="284" y2="318" stroke="#1E293B" strokeWidth="4.5" pointerEvents="none" />
            <line x1="218" y1="354" x2="268" y2="354" stroke="#1E293B" strokeWidth="4.5" pointerEvents="none" />

            {/* Manchinhas Fofas do Dino */}
            <circle
              cx="162"
              cy="245"
              r="18"
              fill={partColors["spots"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("spots")}
              className="cursor-pointer"
            />
            <circle
              cx="142"
              cy="295"
              r="14"
              fill={partColors["spots"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("spots")}
              className="cursor-pointer"
            />
            <circle
              cx="178"
              cy="322"
              r="12"
              fill={partColors["spots"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("spots")}
              className="cursor-pointer"
            />

            {/* Perna Principal do Dino com Garrinhas */}
            <path
              d="M 148 338 C 185 338 205 378 198 428 L 222 428 C 230 438 225 450 212 450 L 142 450 C 135 450 132 438 138 422 C 132 385 130 352 148 338 Z"
              fill={partColors["legFront"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("legFront")}
              className="cursor-pointer"
            />

            {/* Bracinho Fofo do Dino */}
            <path
              d="M 222 222 C 258 218 282 232 278 250 C 274 264 248 262 218 250 Z"
              fill={partColors["arm"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinejoin="round"
              onClick={() => handlePartClick("arm")}
              className="cursor-pointer"
            />

            {/* Olho Expressivo, Narina e Sorriso com Dentinhos */}
            <circle cx="235" cy="108" r="20" fill="#FFFFFF" stroke="#1E293B" strokeWidth="5.5" pointerEvents="none" />
            <circle cx="240" cy="108" r="10" fill="#1E293B" pointerEvents="none" />
            <circle cx="244" cy="103" r="3.5" fill="#FFFFFF" pointerEvents="none" />
            <circle cx="318" cy="105" r="4.5" fill="#1E293B" pointerEvents="none" />
            <path d="M 248 148 Q 295 168 338 142" stroke="#1E293B" strokeWidth="6" fill="none" strokeLinecap="round" pointerEvents="none" />
            <polygon points="268,154 276,168 284,156" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />
            <polygon points="295,156 303,169 311,154" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />

            {/* Ovinho de Dino no Ninho */}
            <ellipse
              cx="415"
              cy="420"
              rx="36"
              ry="46"
              fill={partColors["egg"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              onClick={() => handlePartClick("egg")}
              className="cursor-pointer"
            />
            <circle cx="405" cy="402" r="8" fill={partColors["eggSpot"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="4" onClick={() => handlePartClick("eggSpot")} className="cursor-pointer" />
            <circle cx="426" cy="422" r="10" fill={partColors["eggSpot"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="4" onClick={() => handlePartClick("eggSpot")} className="cursor-pointer" />
            <path
              d="M 365 442 Q 415 475 465 442 Q 445 428 415 435 Q 385 428 365 442 Z"
              fill={partColors["nest"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("nest")}
              className="cursor-pointer"
            />
          </svg>
        )}

        {/* TEMPLATE 3: SUPER CAMINHÃO DE BOMBEIROS (100% Vetorial de Livro de Colorir) */}
        {template === "fire" && (
          <svg
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full select-none overflow-visible"
          >
            {/* Céu Estendido */}
            <rect
              x="-1000"
              y="-1000"
              width="3000"
              height="1365"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />

            {/* Estrada de Asfalto Estendida */}
            <rect
              x="-1000"
              y="365"
              width="3000"
              height="1500"
              fill={partColors["road"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("road")}
              className="cursor-pointer"
            />

            {/* Sol e Nuvem */}
            <circle
              cx="75"
              cy="68"
              r="38"
              fill={partColors["sun"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sun")}
              className="cursor-pointer"
            />
            <path
              d="M 165 65 Q 185 38 215 48 Q 245 38 262 62 Q 285 70 272 95 Q 255 110 210 106 Q 165 110 155 88 Q 145 70 165 65 Z"
              fill={partColors["cloud"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              onClick={() => handlePartClick("cloud")}
              className="cursor-pointer"
            />

            {/* Base Giratória e Escada Telescópica */}
            <path
              d="M 335 152 L 355 120 L 425 120 L 445 152 Z"
              fill={partColors["turntable"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinejoin="round"
              onClick={() => handlePartClick("turntable")}
              className="cursor-pointer"
            />
            <rect
              x="175"
              y="82"
              width="290"
              height="38"
              rx="8"
              fill={partColors["ladder"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              onClick={() => handlePartClick("ladder")}
              className="cursor-pointer"
            />
            {[210, 250, 290, 330, 370, 410, 445].map((lx) => (
              <line key={lx} x1={lx} y1="82" x2={lx} y2="120" stroke="#1E293B" strokeWidth="5" pointerEvents="none" />
            ))}

            {/* Giroflex / Sirene Luminosa */}
            <rect x="95" y="138" width="54" height="14" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="5" pointerEvents="none" />
            <path
              d="M 102 138 C 102 98 142 98 142 138 Z"
              fill={partColors["siren"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("siren")}
              className="cursor-pointer"
            />
            <line x1="122" y1="88" x2="122" y2="74" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" pointerEvents="none" />
            <line x1="90" y1="100" x2="78" y2="90" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" pointerEvents="none" />
            <line x1="154" y1="100" x2="166" y2="90" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" pointerEvents="none" />

            {/* Cabine Frontal do Caminhão */}
            <path
              d="M 28 360 L 28 215 Q 28 152 88 152 L 195 152 L 195 360 Z"
              fill={partColors["truckCabin"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("truckCabin")}
              className="cursor-pointer"
            />

            {/* Farol e Para-choque Dianteiro */}
            <path
              d="M 18 285 L 40 285 L 40 325 L 18 325 A 10 10 0 0 1 18 285 Z"
              fill={partColors["headlight"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              onClick={() => handlePartClick("headlight")}
              className="cursor-pointer"
            />
            <rect
              x="14"
              y="335"
              width="52"
              height="24"
              rx="8"
              fill={partColors["bumper"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("bumper")}
              className="cursor-pointer"
            />

            {/* Janela da Cabine + Bombeiro Vetorial com Capacete */}
            <path
              d="M 52 262 L 52 205 Q 52 178 82 178 L 168 178 L 168 262 Z"
              fill={partColors["window"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinejoin="round"
              onClick={() => handlePartClick("window")}
              className="cursor-pointer"
            />
            <g pointerEvents="none">
              <circle cx="115" cy="232" r="20" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4.5" />
              <path d="M 90 218 C 92 195 138 195 140 218 L 148 222 L 82 222 Z" fill={partColors["helmet"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="4.5" />
              <circle cx="108" cy="232" r="3" fill="#1E293B" />
              <circle cx="122" cy="232" r="3" fill="#1E293B" />
              <path d="M 108 242 Q 115 248 122 242" stroke="#1E293B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </g>

            {/* Carroceria Traseira do Caminhão */}
            <rect
              x="195"
              y="152"
              width="275"
              height="208"
              rx="12"
              fill={partColors["truckBody"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7.5"
              onClick={() => handlePartClick("truckBody")}
              className="cursor-pointer"
            />

            {/* Faixa Refletiva Lateral */}
            <rect
              x="28"
              y="285"
              width="442"
              height="24"
              fill={partColors["stripe"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              onClick={() => handlePartClick("stripe")}
              className="cursor-pointer"
            />

            {/* Compartimento de Equipamentos e Carretel de Mangueira */}
            <rect
              x="218"
              y="178"
              width="115"
              height="92"
              rx="8"
              fill={partColors["tank"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              onClick={() => handlePartClick("tank")}
              className="cursor-pointer"
            />
            <line x1="218" y1="202" x2="333" y2="202" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />
            <line x1="218" y1="224" x2="333" y2="224" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />
            <line x1="218" y1="246" x2="333" y2="246" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />

            {/* Carretel Redondo de Mangueira */}
            <circle
              cx="398"
              cy="224"
              r="42"
              fill={partColors["hoseReel"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("hoseReel")}
              className="cursor-pointer"
            />
            <circle cx="398" cy="224" r="26" fill="none" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />
            <circle cx="398" cy="224" r="12" fill="#FFFFFF" stroke="#1E293B" strokeWidth="5" pointerEvents="none" />

            {/* 3 Rodas Gigantes Detalhadas */}
            {[
              { id: "wheel1", cx: 112 },
              { id: "wheel2", cx: 278 },
              { id: "wheel3", cx: 405 },
            ].map((w) => (
              <g key={w.id}>
                <circle
                  cx={w.cx}
                  cy="372"
                  r="52"
                  fill={partColors[w.id] || "#FFFFFF"}
                  stroke="#1E293B"
                  strokeWidth="8"
                  onClick={() => handlePartClick(w.id)}
                  className="cursor-pointer"
                />
                <circle
                  cx={w.cx}
                  cy="372"
                  r="26"
                  fill={partColors[`${w.id}Rim`] || "#FFFFFF"}
                  stroke="#1E293B"
                  strokeWidth="5.5"
                  onClick={() => handlePartClick(`${w.id}Rim`)}
                  className="cursor-pointer"
                />
                <circle cx={w.cx} cy="372" r="9" fill="#1E293B" pointerEvents="none" />
              </g>
            ))}
          </svg>
        )}

        {/* TEMPLATE 4: O REI LEÃO DA SAVANA (Ilustração Principal Super Detalhada!) */}
        {template === "daniel" && (
          <svg
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full select-none overflow-visible"
          >
            {/* Céu da Savana Estendido */}
            <rect
              x="-1000"
              y="-1000"
              width="3000"
              height="1360"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />

            {/* Sol Radiante da Manhã */}
            <circle
              cx="68"
              cy="68"
              r="40"
              fill={partColors["sun"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sun")}
              className="cursor-pointer"
            />
            <g stroke="#1E293B" strokeWidth="5" strokeLinecap="round" pointerEvents="none">
              <line x1="68" y1="14" x2="68" y2="22" />
              <line x1="68" y1="114" x2="68" y2="122" />
              <line x1="14" y1="68" x2="22" y2="68" />
              <line x1="114" y1="68" x2="122" y2="68" />
              <line x1="28" y1="28" x2="35" y2="35" />
              <line x1="101" y1="101" x2="108" y2="108" />
              <line x1="108" y1="28" x2="101" y2="35" />
              <line x1="35" y1="101" x2="28" y2="108" />
            </g>

            {/* Nuvem Fofinha no Céu */}
            <path
              d="M 368 62 Q 388 32 422 45 Q 455 32 472 58 Q 496 68 484 96 Q 468 112 418 108 Q 368 112 356 88 Q 346 68 368 62 Z"
              fill={partColors["cloud"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              onClick={() => handlePartClick("cloud")}
              className="cursor-pointer"
            />

            {/* Colinas Suaves da Savana ao Fundo */}
            <path
              d="M -1000 365 Q 80 285 240 345 T 600 325 L 2000 365 L 2000 450 L -1000 450 Z"
              fill={partColors["hills"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("hills")}
              className="cursor-pointer"
            />

            {/* Gramado da Savana Estendido */}
            <path
              d="M -1000 365 Q 250 345 600 365 L 2000 365 L 2000 1500 L -1000 1500 Z"
              fill={partColors["floor"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("floor")}
              className="cursor-pointer"
            />

            {/* Pedra / Rocha à Esquerda */}
            <path
              d="M 18 425 C 12 385 45 362 82 372 C 110 378 122 402 115 425 Z"
              fill={partColors["rock"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("rock")}
              className="cursor-pointer"
            />

            {/* 1. CAUDA LONGA E TUFO DO LEÃO (À Direita do Corpo) */}
            <path
              d="M 332 398 C 398 402 442 356 432 288 C 428 265 408 268 412 294 C 418 342 384 378 326 376 Z"
              fill={partColors["tail"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("tail")}
              className="cursor-pointer"
            />
            <path
              d="M 418 286 C 392 262 406 218 442 212 C 464 232 462 272 432 292 Z"
              fill={partColors["tailTuft"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("tailTuft")}
              className="cursor-pointer"
            />
            <path d="M 426 276 Q 434 248 440 232" stroke="#1E293B" strokeWidth="4" fill="none" strokeLinecap="round" pointerEvents="none" />

            {/* 2. COXAS TRASEIRAS SENTADAS DO LEÃO */}
            <path
              d="M 168 328 C 112 336 98 395 128 432 L 188 432 Z"
              fill={partColors["hindLegL"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("hindLegL")}
              className="cursor-pointer"
            />
            <path
              d="M 332 328 C 388 336 402 395 372 432 L 312 432 Z"
              fill={partColors["hindLegR"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("hindLegR")}
              className="cursor-pointer"
            />

            {/* Patas Traseiras Redondas */}
            <ellipse
              cx="132"
              cy="434"
              rx="32"
              ry="18"
              fill={partColors["hindPawL"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("hindPawL")}
              className="cursor-pointer"
            />
            <line x1="120" y1="422" x2="120" y2="446" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />
            <line x1="138" y1="422" x2="138" y2="446" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />

            <ellipse
              cx="368"
              cy="434"
              rx="32"
              ry="18"
              fill={partColors["hindPawR"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("hindPawR")}
              className="cursor-pointer"
            />
            <line x1="362" y1="422" x2="362" y2="446" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />
            <line x1="380" y1="422" x2="380" y2="446" stroke="#1E293B" strokeWidth="4" pointerEvents="none" />

            {/* 3. CORPO FORTE E PEITO PELUDO DO LEÃO */}
            <path
              d="M 168 272 C 152 332 156 402 174 438 L 326 438 C 344 402 348 332 332 272 Z"
              fill={partColors["lionBody"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("lionBody")}
              className="cursor-pointer"
            />

            {/* Pelagem Fofa do Peito */}
            <path
              d="M 198 282 C 198 268 302 268 302 282 C 312 336 278 378 250 392 C 222 378 188 336 198 282 Z"
              fill={partColors["chest"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinejoin="round"
              onClick={() => handlePartClick("chest")}
              className="cursor-pointer"
            />

            {/* 4. PERNAS DIANTEIRAS E PATAS FOFAS COM DEDINHOS */}
            <path
              d="M 178 312 L 172 442 L 228 442 L 226 346 Z"
              fill={partColors["frontLegL"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("frontLegL")}
              className="cursor-pointer"
            />
            <path
              d="M 322 312 L 328 442 L 272 442 L 274 346 Z"
              fill={partColors["frontLegR"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("frontLegR")}
              className="cursor-pointer"
            />

            {/* Pata Dianteira Esquerda */}
            <ellipse
              cx="198"
              cy="446"
              rx="36"
              ry="20"
              fill={partColors["frontPawL"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              onClick={() => handlePartClick("frontPawL")}
              className="cursor-pointer"
            />
            <line x1="184" y1="432" x2="184" y2="462" stroke="#1E293B" strokeWidth="4.5" pointerEvents="none" />
            <line x1="210" y1="432" x2="210" y2="462" stroke="#1E293B" strokeWidth="4.5" pointerEvents="none" />

            {/* Pata Dianteira Direita */}
            <ellipse
              cx="302"
              cy="446"
              rx="36"
              ry="20"
              fill={partColors["frontPawR"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              onClick={() => handlePartClick("frontPawR")}
              className="cursor-pointer"
            />
            <line x1="290" y1="432" x2="290" y2="462" stroke="#1E293B" strokeWidth="4.5" pointerEvents="none" />
            <line x1="316" y1="432" x2="316" y2="462" stroke="#1E293B" strokeWidth="4.5" pointerEvents="none" />

            {/* 5. JUBA MAJESTOSA ONDULADA EM FORMATO DE FLOR (12 Pétalas Esculpidas!) */}
            <path
              d="
                M 250 56
                Q 282 32 308 68
                Q 350 54 356 98
                Q 396 105 382 148
                Q 416 178 382 212
                Q 402 252 356 268
                Q 352 308 308 296
                Q 282 332 250 308
                Q 218 332 192 296
                Q 148 308 144 268
                Q 98 252 118 212
                Q 84 178 118 148
                Q 104 105 144 98
                Q 150 54 192 68
                Q 218 32 250 56
                Z
              "
              fill={partColors["mane"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              strokeLinejoin="round"
              onClick={() => handlePartClick("mane")}
              className="cursor-pointer"
            />

            {/* 6. ORELHINHAS REDONDAS DO LEÃO (Com interior pintável!) */}
            <circle
              cx="166"
              cy="104"
              r="28"
              fill={partColors["earL"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              onClick={() => handlePartClick("earL")}
              className="cursor-pointer"
            />
            <circle
              cx="166"
              cy="104"
              r="14"
              fill={partColors["innerEarL"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="4.5"
              onClick={() => handlePartClick("innerEarL")}
              className="cursor-pointer"
            />

            <circle
              cx="334"
              cy="104"
              r="28"
              fill={partColors["earR"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              onClick={() => handlePartClick("earR")}
              className="cursor-pointer"
            />
            <circle
              cx="334"
              cy="104"
              r="14"
              fill={partColors["innerEarR"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="4.5"
              onClick={() => handlePartClick("innerEarR")}
              className="cursor-pointer"
            />

            {/* 7. COROA REAL DO REI LEÃO NO TOPO DA JUBA */}
            <polygon
              points="204,76 194,28 226,48 250,16 274,48 306,28 296,76"
              fill={partColors["crown"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("crown")}
              className="cursor-pointer"
            />
            <circle
              cx="250"
              cy="54"
              r="8"
              fill={partColors["crownGem"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="4"
              onClick={() => handlePartClick("crownGem")}
              className="cursor-pointer"
            />

            {/* 8. CABEÇA E ROSTO ESCULPIDO DO LEÃO */}
            <path
              d="M 250 92 C 312 92 342 134 338 186 C 334 234 302 268 250 268 C 198 268 166 234 162 186 C 158 134 188 92 250 92 Z"
              fill={partColors["lionFace"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("lionFace")}
              className="cursor-pointer"
            />

            {/* Sobrancelhas Expressivas */}
            <path d="M 190 134 Q 208 122 224 132" stroke="#1E293B" strokeWidth="5.5" fill="none" strokeLinecap="round" pointerEvents="none" />
            <path d="M 276 132 Q 292 122 310 134" stroke="#1E293B" strokeWidth="5.5" fill="none" strokeLinecap="round" pointerEvents="none" />

            {/* Olhos Grandes Brilhantes de Desenho Animado */}
            <g pointerEvents="none">
              <ellipse cx="208" cy="158" rx="16" ry="19" fill="#FFFFFF" stroke="#1E293B" strokeWidth="5" />
              <ellipse cx="210" cy="158" rx="10" ry="12" fill="#1E293B" />
              <circle cx="214" cy="152" r="4" fill="#FFFFFF" />
              <circle cx="206" cy="163" r="2" fill="#FFFFFF" />

              <ellipse cx="292" cy="158" rx="16" ry="19" fill="#FFFFFF" stroke="#1E293B" strokeWidth="5" />
              <ellipse cx="290" cy="158" rx="10" ry="12" fill="#1E293B" />
              <circle cx="294" cy="152" r="4" fill="#FFFFFF" />
              <circle cx="286" cy="163" r="2" fill="#FFFFFF" />
            </g>

            {/* Bochechinhas Fofas Pintáveis */}
            <ellipse
              cx="182"
              cy="192"
              rx="14"
              ry="9"
              fill={partColors["cheeks"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="4"
              onClick={() => handlePartClick("cheeks")}
              className="cursor-pointer"
            />
            <ellipse
              cx="318"
              cy="192"
              rx="14"
              ry="9"
              fill={partColors["cheeks"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="4"
              onClick={() => handlePartClick("cheeks")}
              className="cursor-pointer"
            />

            {/* Sorriso Aberto e Linguinha Pintável */}
            <path
              d="M 224 222 Q 250 258 276 222 Z"
              fill={partColors["tongue"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5.5"
              strokeLinejoin="round"
              onClick={() => handlePartClick("tongue")}
              className="cursor-pointer"
            />

            {/* Focinho Gordinho em Formato de Coração Invertido (Whisker Pads) */}
            <path
              d="M 250 202 C 228 202 198 194 196 214 C 194 232 226 238 250 222 C 274 238 306 232 304 214 C 302 194 272 202 250 202 Z"
              fill={partColors["muzzle"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinejoin="round"
              onClick={() => handlePartClick("muzzle")}
              className="cursor-pointer"
            />

            {/* Nariz Triangular Arredondado Fofo do Leão */}
            <path
              d="M 228 180 Q 250 172 272 180 Q 276 194 250 208 Q 224 194 228 180 Z"
              fill={partColors["nose"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinejoin="round"
              onClick={() => handlePartClick("nose")}
              className="cursor-pointer"
            />

            {/* Bigodinhos Clássicos do Leão */}
            <g stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" pointerEvents="none">
              <line x1="196" y1="208" x2="152" y2="200" />
              <line x1="194" y1="216" x2="148" y2="218" />
              <line x1="198" y1="224" x2="156" y2="234" />

              <line x1="304" y1="208" x2="348" y2="200" />
              <line x1="306" y1="216" x2="352" y2="218" />
              <line x1="302" y1="224" x2="344" y2="234" />
            </g>
          </svg>
        )}

        {/* Camada Canvas de Pintura Livre */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`absolute inset-0 w-full h-full z-10 ${
            toolMode === "brush" || toolMode === "stamp" || toolMode === "eraser"
              ? "cursor-crosshair pointer-events-auto"
              : "pointer-events-none"
          }`}
        />

        {/* Carimbos Aplicados */}
        {stamps.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              if (toolMode === "eraser") {
                sounds.playEraser();
                setStamps((prev) => prev.filter((st) => st.id !== s.id));
              }
            }}
            className={`absolute z-20 text-5xl sm:text-6xl -translate-x-1/2 -translate-y-1/2 animate-wiggle ${
              toolMode === "eraser"
                ? "cursor-pointer pointer-events-auto hover:opacity-50 ring-2 ring-rose-400 rounded-full"
                : "pointer-events-none"
            }`}
            style={{ left: s.x, top: s.y }}
            title={toolMode === "eraser" ? "Clique para apagar carimbo" : undefined}
          >
            {s.emoji}
          </div>
        ))}
      </div>

      {/* DOCK INFERIOR DE ESTÚDIO: FERRAMENTAS + CORES (100% LARGURA COM SAFE AREA) */}
      <div className="w-full flex flex-col bg-slate-100/95 backdrop-blur-md border-t-4 border-kids-coral px-2 sm:px-4 pt-1.5 sm:pt-2 pb-[max(10px,env(safe-area-inset-bottom))] gap-1.5 z-20 flex-shrink-0">
        {/* Sub-barra Dinâmica: Carimbos Emojis */}
        {toolMode === "stamp" && (
          <div className="w-full flex items-center justify-around bg-pink-100 py-1 px-2 rounded-xl border-2 border-pink-300 shadow-sm">
            {stampsList.map((st) => (
              <button
                key={st}
                onClick={() => {
                  sounds.playPop();
                  setSelectedStamp(st);
                }}
                className={`kid-btn text-2xl sm:text-3xl p-1 rounded-xl border-2 transition-transform ${
                  selectedStamp === st
                    ? "bg-white border-pink-500 scale-115 shadow-md ring-2 ring-pink-300"
                    : "border-transparent"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}

        {/* Sub-barra Dinâmica: Espessura da Borracha */}
        {toolMode === "eraser" && (
          <div className="w-full flex items-center justify-center gap-4 sm:gap-8 bg-rose-100/90 py-1 px-3 rounded-xl border-2 border-rose-300 shadow-sm">
            <span className="font-black text-xs sm:text-sm text-rose-900 flex items-center gap-1">
              <Eraser size={16} /> Borracha:
            </span>
            {[
              { size: 20, label: "Fina", dot: "w-3 h-3 sm:w-4 sm:h-4" },
              { size: 38, label: "Média", dot: "w-5 h-5 sm:w-6 sm:h-6" },
              { size: 60, label: "Grossa", dot: "w-7 h-7 sm:w-8 sm:h-8" },
            ].map((er) => (
              <button
                key={er.size}
                onClick={() => {
                  sounds.playPop();
                  setEraserSize(er.size);
                }}
                className={`kid-btn px-2.5 py-1 rounded-xl border-2 flex items-center gap-1.5 transition-transform ${
                  eraserSize === er.size
                    ? "bg-rose-500 text-white border-rose-800 scale-110 shadow-md ring-2 ring-rose-300"
                    : "bg-white text-slate-700 border-rose-200 hover:bg-rose-50"
                }`}
              >
                <div className={`${er.dot} rounded-full bg-current`} />
                <span className="text-[11px] sm:text-xs font-black">{er.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Sub-barra Dinâmica: Espessura do Pincel */}
        {toolMode === "brush" && (
          <div className="w-full flex items-center justify-center gap-6 sm:gap-10 bg-purple-100 py-1 px-2 rounded-xl border-2 border-purple-300 shadow-sm">
            {[
              { size: 10, dot: "w-3 h-3 sm:w-4 sm:h-4" },
              { size: 22, dot: "w-5 h-5 sm:w-6 sm:h-6" },
              { size: 38, dot: "w-7 h-7 sm:w-9 sm:h-9" },
            ].map((b) => (
              <button
                key={b.size}
                onClick={() => {
                  sounds.playPop();
                  setBrushSize(b.size);
                }}
                className={`kid-btn p-1.5 rounded-xl border-2 flex items-center justify-center transition-transform ${
                  brushSize === b.size
                    ? "bg-purple-600 border-purple-900 scale-115 shadow-md ring-2 ring-purple-300"
                    : "bg-white border-purple-200"
                }`}
              >
                <div
                  className={`${b.dot} rounded-full`}
                  style={{ backgroundColor: brushSize === b.size ? "#FFFFFF" : selectedColor }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Linha de Ferramentas + Paleta de Cores Integrada */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
          {/* 4 Ferramentas Táteis: Balde, Pincel, Borracha, Carimbos */}
          <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => {
                sounds.playPop();
                setToolMode("bucket");
              }}
              className={`kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all ${
                toolMode === "bucket"
                  ? "bg-kids-teal text-white border-teal-700 shadow-kid scale-105"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              <PaintBucket size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="font-extrabold text-xs sm:text-sm">Balde</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setToolMode("brush");
              }}
              className={`kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all ${
                toolMode === "brush"
                  ? "bg-kids-purple text-white border-purple-700 shadow-kid scale-105"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              <Paintbrush size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="font-extrabold text-xs sm:text-sm">Pincel</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setToolMode("eraser");
              }}
              className={`kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all ${
                toolMode === "eraser"
                  ? "bg-rose-500 text-white border-rose-800 shadow-kid scale-105 ring-2 ring-rose-300"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-rose-50"
              }`}
            >
              <Eraser size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="font-extrabold text-xs sm:text-sm">Borracha</span>
            </button>

            <button
              onClick={() => {
                sounds.playPop();
                setToolMode("stamp");
              }}
              className={`kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all ${
                toolMode === "stamp"
                  ? "bg-kids-pink text-white border-pink-700 shadow-kid scale-105"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              <Sparkles size={18} className="sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="font-extrabold text-xs sm:text-sm">Carimbos</span>
            </button>
          </div>

          {/* 10 Cores Vibrantes */}
          <div className="w-full sm:flex-1 flex items-center justify-around gap-1 sm:gap-2 bg-white px-2 py-1.5 rounded-2xl border-2 border-slate-200 shadow-inner">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  sounds.playPop();
                  setSelectedColor(c.hex);
                }}
                className={`kid-btn w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 sm:border-3 transition-all duration-150 flex-shrink-0 ${
                  selectedColor === c.hex
                    ? "scale-120 border-slate-900 shadow-kid z-10 ring-2 sm:ring-3 ring-yellow-400"
                    : "border-white shadow-sm hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
