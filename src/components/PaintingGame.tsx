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

    if (toolMode === "brush") {
      sounds.playPop();
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize * scaleX;
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
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

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
            { id: "ark", emoji: "🛳️", label: "Arca" },
            { id: "dino", emoji: "🦖", label: "Dino" },
            { id: "fire", emoji: "🚒", label: "Bombeiro" },
            { id: "daniel", emoji: "🦁", label: "Leão" },
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

      {/* PRANCHA DE PINTURA TELA CHEIA (Ocupa 100% da largura e altura central sem bordas desperdiçadas) */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full h-full bg-white overflow-hidden touch-none flex items-center justify-center"
      >
        {/* TEMPLATE 1: A GRANDE ARCA DE NOÉ (OCUPA A TELA TODA) */}
        {template === "ark" && (
          <svg
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full select-none overflow-visible"
          >
            {/* Céu Estendido (Preenche até as bordas de qualquer tela) */}
            <rect
              x="-1000"
              y="-1000"
              width="3000"
              height="1365"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />

            {/* Arco-Íris Gigante de Ponta a Ponta */}
            <path
              d="M -20 340 A 270 250 0 0 1 520 340"
              stroke={partColors["rainbow1"] || "#FFFFFF"}
              strokeWidth="34"
              fill="none"
              onClick={() => handlePartClick("rainbow1")}
              className="cursor-pointer"
            />
            <path d="M -20 340 A 270 250 0 0 1 520 340" stroke="#1E293B" strokeWidth="6" fill="none" pointerEvents="none" />

            <path
              d="M 14 340 A 236 218 0 0 1 486 340"
              stroke={partColors["rainbow2"] || "#FFFFFF"}
              strokeWidth="34"
              fill="none"
              onClick={() => handlePartClick("rainbow2")}
              className="cursor-pointer"
            />
            <path d="M 14 340 A 236 218 0 0 1 486 340" stroke="#1E293B" strokeWidth="6" fill="none" pointerEvents="none" />

            <path
              d="M 48 340 A 202 186 0 0 1 452 340"
              stroke={partColors["rainbow3"] || "#FFFFFF"}
              strokeWidth="34"
              fill="none"
              onClick={() => handlePartClick("rainbow3")}
              className="cursor-pointer"
            />
            <path d="M 48 340 A 202 186 0 0 1 452 340" stroke="#1E293B" strokeWidth="6" fill="none" pointerEvents="none" />
            <path d="M 65 340 A 185 170 0 0 1 435 340" stroke="#1E293B" strokeWidth="6" fill="none" pointerEvents="none" />

            {/* Sol Sorridente Gigante */}
            <circle
              cx="70"
              cy="75"
              r="52"
              fill={partColors["sun"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("sun")}
              className="cursor-pointer"
            />
            <circle cx="55" cy="65" r="5" fill="#1E293B" pointerEvents="none" />
            <circle cx="85" cy="65" r="5" fill="#1E293B" pointerEvents="none" />
            <path d="M 55 85 Q 70 100 85 85" stroke="#1E293B" strokeWidth="5" fill="none" strokeLinecap="round" pointerEvents="none" />

            {/* Nuvem Fofinha Gigante */}
            <path
              d="M 355 75 Q 375 35 415 50 Q 455 35 475 70 Q 505 80 490 115 Q 470 135 410 130 Q 350 135 340 105 Q 330 80 355 75 Z"
              fill={partColors["cloud"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("cloud")}
              className="cursor-pointer"
            />

            {/* Telhado Grande da Arca */}
            <polygon
              points="75,185 250,85 425,185"
              fill={partColors["roof"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              strokeLinejoin="round"
              onClick={() => handlePartClick("roof")}
              className="cursor-pointer"
            />

            {/* Cabine Principal da Arca */}
            <rect
              x="105"
              y="185"
              width="290"
              height="105"
              rx="12"
              fill={partColors["cabin"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("cabin")}
              className="cursor-pointer"
            />

            {/* Janelões da Arca com Bichinhos */}
            <rect
              x="130"
              y="202"
              width="70"
              height="68"
              rx="14"
              fill={partColors["win1"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("win1")}
              className="cursor-pointer"
            />
            <text x="165" y="250" fontSize="42" textAnchor="middle" pointerEvents="none">🦒</text>

            <rect
              x="215"
              y="202"
              width="70"
              height="68"
              rx="14"
              fill={partColors["door"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("door")}
              className="cursor-pointer"
            />
            <text x="250" y="250" fontSize="42" textAnchor="middle" pointerEvents="none">🦁</text>

            <rect
              x="300"
              y="202"
              width="70"
              height="68"
              rx="14"
              fill={partColors["win2"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("win2")}
              className="cursor-pointer"
            />
            <text x="335" y="250" fontSize="42" textAnchor="middle" pointerEvents="none">🐘</text>

            {/* Casco Superior da Arca */}
            <path
              d="M 20 285 L 480 285 L 450 355 L 50 355 Z"
              fill={partColors["hullUpper"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              strokeLinejoin="round"
              onClick={() => handlePartClick("hullUpper")}
              className="cursor-pointer"
            />

            {/* Casco Inferior da Arca */}
            <path
              d="M 50 355 L 450 355 L 410 425 Q 250 445 90 425 Z"
              fill={partColors["hull"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              strokeLinejoin="round"
              onClick={() => handlePartClick("hull")}
              className="cursor-pointer"
            />

            {/* Ondas do Mar (Preenche toda a base) */}
            <path
              d="M -1000 405 Q -75 375 0 405 T 150 405 T 300 405 T 450 405 T 600 405 L 2000 405 L 2000 1500 L -1000 1500 Z"
              fill={partColors["sea"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("sea")}
              className="cursor-pointer"
            />
            <text x="120" y="470" fontSize="38" pointerEvents="none">🐟</text>
            <text x="370" y="475" fontSize="38" pointerEvents="none">🐳</text>
          </svg>
        )}

        {/* TEMPLATE 2: SUPER DINO T-REX GIGANTE */}
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
              height="1370"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />

            {/* Montanha / Vulcão Pré-histórico ao Fundo */}
            <polygon
              points="-30,370 110,160 250,370"
              fill={partColors["mountain"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("mountain")}
              className="cursor-pointer"
            />

            {/* Gramado Estendido */}
            <rect
              x="-1000"
              y="370"
              width="3000"
              height="1500"
              fill={partColors["grass"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("grass")}
              className="cursor-pointer"
            />

            {/* Sol Gigante */}
            <circle
              cx="80"
              cy="75"
              r="50"
              fill={partColors["sun"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("sun")}
              className="cursor-pointer"
            />

            {/* Cristas / Espinhos das Costas do Dino */}
            <polygon
              points="210,75 235,25 265,78"
              fill={partColors["spikes"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("spikes")}
              className="cursor-pointer"
            />
            <polygon
              points="160,115 180,60 212,115"
              fill={partColors["spikes"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("spikes")}
              className="cursor-pointer"
            />
            <polygon
              points="120,175 135,120 172,175"
              fill={partColors["spikes"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("spikes")}
              className="cursor-pointer"
            />
            <polygon
              points="85,245 100,195 140,245"
              fill={partColors["spikes"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              strokeLinejoin="round"
              onClick={() => handlePartClick("spikes")}
              className="cursor-pointer"
            />

            {/* Corpo Gigante do Dino (Ocupa 90% da tela!) */}
            <path
              d="M 155 185 C 145 85 265 35 365 75 C 425 100 440 160 390 195 C 445 220 465 335 400 405 C 320 465 190 445 145 375 C 65 390 10 345 25 275 C 55 265 120 235 155 185 Z"
              fill={partColors["dinoBody"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="9"
              strokeLinejoin="round"
              onClick={() => handlePartClick("dinoBody")}
              className="cursor-pointer"
            />

            {/* Barriguinha do Dino */}
            <path
              d="M 225 235 Q 275 355 375 320 Q 345 215 225 235 Z"
              fill={partColors["belly"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("belly")}
              className="cursor-pointer"
            />

            {/* Olho e Sorriso do Dino */}
            <circle cx="330" cy="115" r="20" fill="#FFFFFF" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />
            <circle cx="335" cy="115" r="10" fill="#1E293B" pointerEvents="none" />
            <path d="M 335 155 Q 380 175 375 140" stroke="#1E293B" strokeWidth="7" fill="none" strokeLinecap="round" pointerEvents="none" />

            {/* Super Maçã e Folha para o Dino Comer */}
            <circle
              cx="435"
              cy="265"
              r="38"
              fill={partColors["apple"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("apple")}
              className="cursor-pointer"
            />
            <path d="M 435 227 Q 445 205 460 215" stroke="#1E293B" strokeWidth="6" fill="none" strokeLinecap="round" pointerEvents="none" />

            {/* Ovinho de Dino no Ninho */}
            <ellipse
              cx="95"
              cy="425"
              rx="35"
              ry="45"
              fill={partColors["egg"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("egg")}
              className="cursor-pointer"
            />
          </svg>
        )}

        {/* TEMPLATE 3: SUPER CAMINHÃO DE BOMBEIROS GIGANTE */}
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
              height="1360"
              fill={partColors["sky"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("sky")}
              className="cursor-pointer"
            />

            {/* Asfalto da Estrada Estendido */}
            <rect
              x="-1000"
              y="360"
              width="3000"
              height="1500"
              fill={partColors["road"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("road")}
              className="cursor-pointer"
            />

            {/* Prédio na Cidade */}
            <rect
              x="35"
              y="55"
              width="115"
              height="305"
              fill={partColors["bldg"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("bldg")}
              className="cursor-pointer"
            />

            {/* Sol */}
            <circle
              cx="420"
              cy="70"
              r="45"
              fill={partColors["sun"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("sun")}
              className="cursor-pointer"
            />

            {/* Escada Telescópica Gigante no Topo */}
            <rect
              x="195"
              y="105"
              width="270"
              height="42"
              rx="10"
              fill={partColors["ladder"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("ladder")}
              className="cursor-pointer"
            />
            <line x1="235" y1="105" x2="235" y2="147" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />
            <line x1="285" y1="105" x2="285" y2="147" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />
            <line x1="335" y1="105" x2="335" y2="147" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />
            <line x1="385" y1="105" x2="385" y2="147" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />
            <line x1="435" y1="105" x2="435" y2="147" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />

            {/* Giroflex / Sirene */}
            <path
              d="M 105 155 C 105 110 155 110 155 155 Z"
              fill={partColors["siren"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("siren")}
              className="cursor-pointer"
            />

            {/* Cabine Frontal do Caminhão */}
            <path
              d="M 25 360 L 25 205 Q 25 155 75 155 L 200 155 L 200 360 Z"
              fill={partColors["truckCabin"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="9"
              strokeLinejoin="round"
              onClick={() => handlePartClick("truckCabin")}
              className="cursor-pointer"
            />

            {/* Carroceria Traseira Gigante */}
            <rect
              x="200"
              y="155"
              width="280"
              height="205"
              rx="16"
              fill={partColors["truckBody"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="9"
              onClick={() => handlePartClick("truckBody")}
              className="cursor-pointer"
            />

            {/* Tanque / Compartimento Central */}
            <rect
              x="235"
              y="195"
              width="210"
              height="95"
              rx="12"
              fill={partColors["tank"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("tank")}
              className="cursor-pointer"
            />

            {/* Janela do Motorista Bombeiro */}
            <rect
              x="55"
              y="185"
              width="115"
              height="85"
              rx="12"
              fill={partColors["window"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("window")}
              className="cursor-pointer"
            />
            <text x="112" y="245" fontSize="52" textAnchor="middle" pointerEvents="none">👨‍🚒</text>

            {/* 3 Rodas Gigantes do Caminhão */}
            <circle
              cx="110"
              cy="370"
              r="55"
              fill={partColors["wheel1"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="9"
              onClick={() => handlePartClick("wheel1")}
              className="cursor-pointer"
            />
            <circle cx="110" cy="370" r="24" fill="#FFFFFF" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />

            <circle
              cx="285"
              cy="370"
              r="55"
              fill={partColors["wheel2"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="9"
              onClick={() => handlePartClick("wheel2")}
              className="cursor-pointer"
            />
            <circle cx="285" cy="370" r="24" fill="#FFFFFF" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />

            <circle
              cx="415"
              cy="370"
              r="55"
              fill={partColors["wheel3"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="9"
              onClick={() => handlePartClick("wheel3")}
              className="cursor-pointer"
            />
            <circle cx="415" cy="370" r="24" fill="#FFFFFF" stroke="#1E293B" strokeWidth="6" pointerEvents="none" />
          </svg>
        )}

        {/* TEMPLATE 4: DANIEL E O LEÃO AMIGO (GIGANTE) */}
        {template === "daniel" && (
          <svg
            viewBox="0 0 500 500"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full select-none overflow-visible"
          >
            {/* Parede do Palácio Estendida */}
            <rect
              x="-1000"
              y="-1000"
              width="3000"
              height="1390"
              fill={partColors["room"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="6"
              onClick={() => handlePartClick("room")}
              className="cursor-pointer"
            />

            {/* Piso de Pedra Estendido */}
            <rect
              x="-1000"
              y="390"
              width="3000"
              height="1500"
              fill={partColors["floor"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("floor")}
              className="cursor-pointer"
            />

            {/* Grande Janela Arqueada com Estrelas */}
            <path
              d="M 175 35 Q 250 -10 325 35 L 325 155 L 175 155 Z"
              fill={partColors["window"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("window")}
              className="cursor-pointer"
            />
            <text x="250" y="110" fontSize="42" textAnchor="middle" pointerEvents="none">🌙✨</text>

            {/* Corpo Sentado do Leão */}
            <path
              d="M 65 310 L 65 435 L 245 435 L 245 310 Z"
              rx="30"
              fill={partColors["lionBody"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              strokeLinejoin="round"
              onClick={() => handlePartClick("lionBody")}
              className="cursor-pointer"
            />

            {/* Juba Gigante do Leão */}
            <circle
              cx="155"
              cy="255"
              r="110"
              fill={partColors["mane"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="9"
              onClick={() => handlePartClick("mane")}
              className="cursor-pointer"
            />

            {/* Rosto Fofo do Leão */}
            <circle
              cx="155"
              cy="255"
              r="74"
              fill={partColors["lionFace"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("lionFace")}
              className="cursor-pointer"
            />
            <circle cx="130" cy="240" r="7" fill="#1E293B" pointerEvents="none" />
            <circle cx="180" cy="240" r="7" fill="#1E293B" pointerEvents="none" />
            <polygon points="145,258 165,258 155,272" fill="#1E293B" pointerEvents="none" />
            <path d="M 130 280 Q 155 300 180 280" stroke="#1E293B" strokeWidth="6" fill="none" strokeLinecap="round" pointerEvents="none" />

            {/* Túnica Real de Daniel */}
            <path
              d="M 275 435 L 305 245 L 435 245 L 465 435 Z"
              fill={partColors["robe"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="9"
              strokeLinejoin="round"
              onClick={() => handlePartClick("robe")}
              className="cursor-pointer"
            />

            {/* Cinto Dourado de Daniel */}
            <rect
              x="295"
              y="325"
              width="150"
              height="28"
              rx="8"
              fill={partColors["belt"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="7"
              onClick={() => handlePartClick("belt")}
              className="cursor-pointer"
            />

            {/* Rosto Sorridente de Daniel */}
            <circle
              cx="370"
              cy="180"
              r="68"
              fill={partColors["skin"] || "#FFFFFF"}
              stroke="#1E293B"
              strokeWidth="8"
              onClick={() => handlePartClick("skin")}
              className="cursor-pointer"
            />
            <text x="370" y="200" fontSize="56" textAnchor="middle" pointerEvents="none">😊</text>
            <text x="260" y="395" fontSize="50" textAnchor="middle" pointerEvents="none">❤️</text>
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
            toolMode === "brush" || toolMode === "stamp"
              ? "cursor-crosshair pointer-events-auto"
              : "pointer-events-none"
          }`}
        />

        {/* Carimbos Aplicados */}
        {stamps.map((s) => (
          <div
            key={s.id}
            className="absolute z-20 text-5xl sm:text-6xl pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-wiggle"
            style={{ left: s.x, top: s.y }}
          >
            {s.emoji}
          </div>
        ))}
      </div>

      {/* DOCK INFERIOR DE ESTÚDIO: FERRAMENTAS + CORES (100% LARGURA) */}
      <div className="w-full flex flex-col bg-slate-100/95 backdrop-blur-md border-t-4 border-kids-coral px-2 sm:px-4 py-1.5 sm:py-2 gap-1.5 z-20 flex-shrink-0">
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
          {/* 3 Ferramentas Táteis */}
          <div className="w-full sm:w-auto flex items-center justify-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                sounds.playPop();
                setToolMode("bucket");
              }}
              className={`kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all ${
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
              className={`kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all ${
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
                setToolMode("stamp");
              }}
              className={`kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all ${
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
