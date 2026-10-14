"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { Paintbrush, PaintBucket, Camera, RotateCcw, Sparkles } from "lucide-react";

type ColorTemplate = "ark" | "dino" | "fire" | "daniel" | "blank";

interface Stamp {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export function PaintingGame() {
  const [template, setTemplate] = useState<ColorTemplate>("ark");
  const [selectedColor, setSelectedColor] = useState("#EF4444");
  const [toolMode, setToolMode] = useState<"bucket" | "brush" | "stamp">("bucket");
  const [selectedStamp, setSelectedStamp] = useState("⭐");
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [brushSize, setBrushSize] = useState(16);
  const [isDrawing, setIsDrawing] = useState(false);
  const [partColors, setPartColors] = useState<Record<string, string>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Paleta de cores vibrantes infantis (10 cores bem espaçadas que cabem sem scroll)
  const colors = [
    { name: "Vermelho", hex: "#EF4444" },
    { name: "Laranja", hex: "#FF9F1C" },
    { name: "Amarelo", hex: "#FFD166" },
    { name: "Verde Limão", hex: "#10B981" },
    { name: "Azul Céu", hex: "#38BDF8" },
    { name: "Azul Escuro", hex: "#2563EB" },
    { name: "Roxo", hex: "#9B5DE5" },
    { name: "Rosa", hex: "#FF70A6" },
    { name: "Marrom", hex: "#854D0E" },
    { name: "Preto", hex: "#1E293B" },
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
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (toolMode === "stamp") {
      sounds.playPop();
      setStamps((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), emoji: selectedStamp, x, y },
      ]);
      return;
    }

    if (toolMode === "brush") {
      sounds.playPop();
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || toolMode !== "brush") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

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
    <div className="flex flex-col items-center justify-between w-full max-w-5xl mx-auto h-[calc(100vh-80px)] p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Barra Superior Compacta (SEM SCROLL) */}
      <div className="w-full flex items-center justify-between gap-1 sm:gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-3xl border-4 border-kids-blue shadow-kid overflow-hidden">
        {/* 5 Miniaturas de Desenho */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {[
            { id: "ark", emoji: "🛳️" },
            { id: "dino", emoji: "🦖" },
            { id: "fire", emoji: "🚒" },
            { id: "daniel", emoji: "🦁" },
            { id: "blank", emoji: "📄" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playPop();
                setTemplate(t.id as ColorTemplate);
              }}
              className={`kid-btn p-1.5 sm:p-2 rounded-2xl border-3 sm:border-4 transition-all ${
                template === t.id
                  ? "bg-kids-yellow border-amber-500 scale-110 shadow-kid ring-3 ring-yellow-300"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <span className="text-2xl sm:text-3xl">{t.emoji}</span>
            </button>
          ))}
        </div>

        {/* Ferramentas */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Balde */}
          <button
            onClick={() => {
              sounds.playPop();
              setToolMode("bucket");
            }}
            className={`kid-btn p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 transition-all ${
              toolMode === "bucket"
                ? "bg-kids-teal text-white border-teal-700 scale-110 shadow-kid ring-3 ring-teal-200"
                : "bg-white text-slate-700 border-slate-300"
            }`}
            title="Balde"
          >
            <PaintBucket size={24} className="stroke-[2.5]" />
          </button>

          {/* Pincel */}
          <button
            onClick={() => {
              sounds.playPop();
              setToolMode("brush");
            }}
            className={`kid-btn p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 transition-all ${
              toolMode === "brush"
                ? "bg-kids-purple text-white border-purple-700 scale-110 shadow-kid ring-3 ring-purple-200"
                : "bg-white text-slate-700 border-slate-300"
            }`}
            title="Pincel"
          >
            <Paintbrush size={24} className="stroke-[2.5]" />
          </button>

          {/* Carimbos */}
          <button
            onClick={() => {
              sounds.playPop();
              setToolMode("stamp");
            }}
            className={`kid-btn p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 transition-all ${
              toolMode === "stamp"
                ? "bg-kids-pink text-white border-pink-700 scale-110 shadow-kid ring-3 ring-pink-200"
                : "bg-white text-slate-700 border-slate-300"
            }`}
            title="Carimbos"
          >
            <Sparkles size={24} className="stroke-[2.5]" />
          </button>

          {/* Câmera */}
          <button
            onClick={handleSaveArtwork}
            className="kid-btn bg-kids-coral hover:bg-rose-500 text-white p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 border-rose-700 shadow-kid animate-pulse-gentle"
            title="Foto!"
          >
            <Camera size={24} className="stroke-[2.5]" />
          </button>

          {/* Limpar */}
          <button
            onClick={handleClearAll}
            className="kid-btn bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 border-slate-400 shadow-kid"
            title="Limpar"
          >
            <RotateCcw size={20} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Sub-barra: Carimbos Visuais ou Tamanho de Traço */}
      {toolMode === "stamp" && (
        <div className="w-full flex items-center justify-around bg-pink-100/90 py-1 px-2 rounded-2xl border-2 border-pink-300 my-1 overflow-hidden">
          {stampsList.map((st) => (
            <button
              key={st}
              onClick={() => {
                sounds.playPop();
                setSelectedStamp(st);
              }}
              className={`kid-btn text-2xl sm:text-3xl p-1 rounded-xl border-2 transition-transform ${
                selectedStamp === st
                  ? "bg-white border-pink-500 scale-120 shadow-md ring-2 ring-pink-300"
                  : "border-transparent"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {toolMode === "brush" && (
        <div className="w-full flex items-center justify-center gap-6 bg-purple-100/90 py-1 px-2 rounded-2xl border-2 border-purple-300 my-1 overflow-hidden">
          {[
            { size: 10, dot: "w-3 h-3" },
            { size: 20, dot: "w-6 h-6" },
            { size: 36, dot: "w-9 h-9" },
          ].map((b) => (
            <button
              key={b.size}
              onClick={() => {
                sounds.playPop();
                setBrushSize(b.size);
              }}
              className={`kid-btn p-1.5 rounded-xl border-2 flex items-center justify-center transition-transform ${
                brushSize === b.size
                  ? "bg-purple-600 border-purple-900 scale-120 shadow-md ring-2 ring-purple-300"
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

      {/* Prancha de Pintura (100% Branco com Traços Fortes) */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full max-w-3xl my-1 bg-white rounded-3xl sm:rounded-4xl border-6 sm:border-8 border-kids-yellow shadow-2xl overflow-hidden touch-none flex items-center justify-center"
      >
        {/* TEMPLATE 1: A ARCA DE NOÉ */}
        {template === "ark" && (
          <svg viewBox="0 0 600 450" className="w-full h-full max-h-[58vh] select-none">
            <rect
              x="0"
              y="0"
              width="600"
              height="300"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />
            {/* Arco-íris */}
            <path d="M 50 300 A 250 250 0 0 1 550 300" stroke="#1E293B" strokeWidth="24" fill="none" />
            <path
              d="M 50 300 A 250 250 0 0 1 550 300"
              stroke={partColors["rainbow1"] || "#FFFFFF"}
              strokeWidth="18"
              fill="none"
              onClick={() => handlePartClick("rainbow1")}
              className="cursor-pointer"
            />

            <path d="M 74 300 A 226 226 0 0 1 526 300" stroke="#1E293B" strokeWidth="24" fill="none" />
            <path
              d="M 74 300 A 226 226 0 0 1 526 300"
              stroke={partColors["rainbow2"] || "#FFFFFF"}
              strokeWidth="18"
              fill="none"
              onClick={() => handlePartClick("rainbow2")}
              className="cursor-pointer"
            />

            <path d="M 98 300 A 202 202 0 0 1 502 300" stroke="#1E293B" strokeWidth="24" fill="none" />
            <path
              d="M 98 300 A 202 202 0 0 1 502 300"
              stroke={partColors["rainbow3"] || "#FFFFFF"}
              strokeWidth="18"
              fill="none"
              onClick={() => handlePartClick("rainbow3")}
              className="cursor-pointer"
            />

            {/* Sol */}
            <circle
              cx="100"
              cy="90"
              r="45"
              fill={partColors["sun"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sun")}
              className="cursor-pointer"
            />

            {/* Nuvem */}
            <path
              d="M 430 110 Q 450 80 480 90 Q 515 80 530 105 Q 560 115 550 145 Q 530 165 480 160 Q 430 165 420 135 Q 410 115 430 110 Z"
              fill={partColors["cloud"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("cloud")}
              className="cursor-pointer"
            />

            {/* Casco da Arca */}
            <path
              d="M 110 270 L 160 360 Q 300 375 440 360 L 490 270 Z"
              fill={partColors["hull"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("hull")}
              className="cursor-pointer"
            />

            {/* Cabine da Arca */}
            <rect
              x="215"
              y="190"
              width="170"
              height="80"
              rx="10"
              fill={partColors["cabin"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("cabin")}
              className="cursor-pointer"
            />

            {/* Telhado */}
            <polygon
              points="185,195 300,135 415,195"
              fill={partColors["roof"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("roof")}
              className="cursor-pointer"
            />

            {/* Janelas */}
            <rect
              x="240"
              y="215"
              width="45"
              height="45"
              rx="10"
              fill={partColors["win1"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("win1")}
              className="cursor-pointer"
            />
            <text x="246" y="249" fontSize="28" pointerEvents="none">🦒</text>

            <rect
              x="315"
              y="215"
              width="45"
              height="45"
              rx="10"
              fill={partColors["win2"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("win2")}
              className="cursor-pointer"
            />
            <text x="321" y="249" fontSize="28" pointerEvents="none">🐘</text>

            <text x="155" y="260" fontSize="34" pointerEvents="none">🧔</text>
            <text x="415" y="260" fontSize="34" pointerEvents="none">🦁</text>

            {/* Mar */}
            <path
              d="M 0 340 Q 75 315 150 340 T 300 340 T 450 340 T 600 340 L 600 450 L 0 450 Z"
              fill={partColors["sea"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("sea")}
              className="cursor-pointer"
            />
          </svg>
        )}

        {/* TEMPLATE 2: DINO */}
        {template === "dino" && (
          <svg viewBox="0 0 600 450" className="w-full h-full max-h-[58vh] select-none">
            <rect
              x="0"
              y="0"
              width="600"
              height="310"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="5"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />
            <rect
              x="0"
              y="310"
              width="600"
              height="140"
              fill={partColors["grass"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("grass")}
              className="cursor-pointer"
            />
            <circle
              cx="95"
              cy="90"
              r="45"
              fill={partColors["sun"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sun")}
              className="cursor-pointer"
            />

            <path
              d="M 230 210 C 210 130 310 70 380 100 C 420 120 430 160 400 190 C 440 210 470 290 420 340 C 360 400 260 370 230 320 C 170 330 110 300 120 250 C 140 240 200 230 230 210 Z"
              fill={partColors["dinoBody"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("dinoBody")}
              className="cursor-pointer"
            />
            <path
              d="M 270 250 Q 310 320 370 290 Q 340 230 270 250"
              fill={partColors["belly"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("belly")}
              className="cursor-pointer"
            />
            <circle cx="355" cy="135" r="14" fill="#FFFFFF" stroke="#1E293B" strokeWidth="4" />
            <circle cx="358" cy="135" r="7" fill="#1E293B" />
            <path d="M 365 165 Q 395 180 385 155" stroke="#1E293B" strokeWidth="6" fill="none" strokeLinecap="round" />

            <polygon points="300,95 315,65 330,98" fill={partColors["spikes"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="5" onClick={() => handlePartClick("spikes")} className="cursor-pointer" />
            <polygon points="265,110 280,80 295,115" fill={partColors["spikes"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="5" onClick={() => handlePartClick("spikes")} className="cursor-pointer" />
            <polygon points="235,140 250,110 265,145" fill={partColors["spikes"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="5" onClick={() => handlePartClick("spikes")} className="cursor-pointer" />

            <circle cx="420" cy="235" r="24" fill={partColors["apple"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="6" onClick={() => handlePartClick("apple")} className="cursor-pointer" />
            <path d="M 420 211 Q 425 200 432 205" stroke="#1E293B" strokeWidth="4" fill="none" />
          </svg>
        )}

        {/* TEMPLATE 3: BOMBEIRO */}
        {template === "fire" && (
          <svg viewBox="0 0 600 450" className="w-full h-full max-h-[58vh] select-none">
            <rect x="0" y="0" width="600" height="280" fill={partColors["sky"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="5" onClick={() => handlePartClick("sky")} className="cursor-pointer" />
            <rect x="0" y="280" width="600" height="170" fill={partColors["road"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="7" onClick={() => handlePartClick("road")} className="cursor-pointer" />
            <rect x="70" y="90" width="90" height="190" fill={partColors["bldg"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="6" onClick={() => handlePartClick("bldg")} className="cursor-pointer" />

            <path d="M 110 280 L 110 170 Q 110 150 135 150 L 250 150 L 250 280 Z" fill={partColors["truckCabin"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="8" onClick={() => handlePartClick("truckCabin")} className="cursor-pointer" />
            <rect x="250" y="150" width="250" height="130" rx="12" fill={partColors["truckBody"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="8" onClick={() => handlePartClick("truckBody")} className="cursor-pointer" />
            <rect x="135" y="170" width="85" height="55" rx="8" fill={partColors["window"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="5" onClick={() => handlePartClick("window")} className="cursor-pointer" />
            <text x="155" y="215" fontSize="36" pointerEvents="none">👨‍🚒</text>
            <rect x="260" y="120" width="220" height="24" rx="6" fill={partColors["ladder"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="6" onClick={() => handlePartClick("ladder")} className="cursor-pointer" />
            <polygon points="165,150 180,125 195,150" fill={partColors["siren"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="6" onClick={() => handlePartClick("siren")} className="cursor-pointer" />

            <circle cx="170" cy="285" r="40" fill={partColors["wheel1"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="8" onClick={() => handlePartClick("wheel1")} className="cursor-pointer" />
            <circle cx="170" cy="285" r="18" fill="#FFFFFF" stroke="#1E293B" strokeWidth="5" />
            <circle cx="340" cy="285" r="40" fill={partColors["wheel2"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="8" onClick={() => handlePartClick("wheel2")} className="cursor-pointer" />
            <circle cx="340" cy="285" r="18" fill="#FFFFFF" stroke="#1E293B" strokeWidth="5" />
            <circle cx="440" cy="285" r="40" fill={partColors["wheel3"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="8" onClick={() => handlePartClick("wheel3")} className="cursor-pointer" />
            <circle cx="440" cy="285" r="18" fill="#FFFFFF" stroke="#1E293B" strokeWidth="5" />
          </svg>
        )}

        {/* TEMPLATE 4: DANIEL */}
        {template === "daniel" && (
          <svg viewBox="0 0 600 450" className="w-full h-full max-h-[58vh] select-none">
            <rect x="0" y="0" width="600" height="450" fill={partColors["room"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="5" onClick={() => handlePartClick("room")} className="cursor-pointer" />
            <path d="M 240 30 Q 300 5 360 30 L 360 135 L 240 135 Z" fill={partColors["window"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="7" onClick={() => handlePartClick("window")} className="cursor-pointer" />

            <circle cx="190" cy="270" r="70" fill={partColors["mane"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="8" onClick={() => handlePartClick("mane")} className="cursor-pointer" />
            <circle cx="190" cy="270" r="48" fill={partColors["lionFace"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="6" onClick={() => handlePartClick("lionFace")} className="cursor-pointer" />
            <path d="M 170 265 Q 180 255 190 265" stroke="#1E293B" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 195 265 Q 205 255 215 265" stroke="#1E293B" strokeWidth="5" fill="none" strokeLinecap="round" />
            <polygon points="186,275 196,275 191,283" fill="#1E293B" />

            <circle cx="380" cy="215" r="45" fill={partColors["skin"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="7" onClick={() => handlePartClick("skin")} className="cursor-pointer" />
            <path d="M 315 380 L 335 255 L 425 255 L 445 380 Z" fill={partColors["robe"] || "#FFFFFF"} stroke="#1E293B" strokeWidth="8" onClick={() => handlePartClick("robe")} className="cursor-pointer" />
            <text x="360" y="230" fontSize="30" pointerEvents="none">😊</text>
            <text x="270" y="325" fontSize="42" pointerEvents="none">❤️</text>
          </svg>
        )}

        {/* Camada Canvas */}
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
            toolMode === "brush" || toolMode === "stamp"
              ? "cursor-crosshair pointer-events-auto"
              : "pointer-events-none"
          }`}
        />

        {/* Carimbos */}
        {stamps.map((s) => (
          <div
            key={s.id}
            className="absolute z-20 text-4xl sm:text-5xl pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-wiggle"
            style={{ left: s.x, top: s.y }}
          >
            {s.emoji}
          </div>
        ))}
      </div>

      {/* Paleta de Cores em 1 Linha Perfeita (SEM SCROLLBARS) */}
      <div className="w-full flex items-center justify-around gap-1 sm:gap-2 bg-white/95 backdrop-blur-md p-2 rounded-3xl border-4 border-kids-coral shadow-kid overflow-hidden">
        {colors.map((c) => (
          <button
            key={c.hex}
            onClick={() => {
              sounds.playPop();
              setSelectedColor(c.hex);
            }}
            className={`kid-btn w-8 h-8 sm:w-12 sm:h-12 rounded-full border-3 sm:border-4 transition-all duration-150 flex-shrink-0 ${
              selectedColor === c.hex
                ? "scale-120 border-slate-900 shadow-kid-lg z-10 ring-3 ring-yellow-400 animate-wiggle"
                : "border-white shadow-sm hover:scale-105"
            }`}
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        ))}
      </div>
    </div>
  );
}
