"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { Trash2, Bomb } from "lucide-react";

interface BlockType {
  id: string;
  name: string;
  emoji: string;
  colorBg: string;
  borderColor: string;
  textColor: string;
  widthPx: number;
}

interface PlacedBlock {
  id: number;
  emoji: string;
  colorBg: string;
  borderColor: string;
  textColor: string;
  widthPx: number;
  x: number; // Pixels a partir do centro
  y: number; // Pixels da base subindo
  rotation: number;
}

const BLOCK_TYPES: BlockType[] = [
  {
    id: "wood",
    name: "Madeira",
    emoji: "🪵",
    colorBg: "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800",
    borderColor: "#451A03",
    textColor: "text-amber-100",
    widthPx: 130,
  },
  {
    id: "ark",
    name: "Arca",
    emoji: "🛳️",
    colorBg: "bg-gradient-to-r from-yellow-700 via-amber-800 to-amber-950",
    borderColor: "#291001",
    textColor: "text-amber-200",
    widthPx: 140,
  },
  {
    id: "lion",
    name: "Leão",
    emoji: "🦁",
    colorBg: "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600",
    borderColor: "#78350F",
    textColor: "text-amber-950",
    widthPx: 120,
  },
  {
    id: "dino",
    name: "Dino",
    emoji: "🦖",
    colorBg: "bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700",
    borderColor: "#064E3B",
    textColor: "text-white",
    widthPx: 120,
  },
  {
    id: "car",
    name: "Carro",
    emoji: "🚗",
    colorBg: "bg-gradient-to-r from-rose-500 via-red-600 to-rose-700",
    borderColor: "#881337",
    textColor: "text-white",
    widthPx: 125,
  },
  {
    id: "crown",
    name: "Coroa",
    emoji: "👑",
    colorBg: "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500",
    borderColor: "#B45309",
    textColor: "text-amber-950",
    widthPx: 110,
  },
  {
    id: "rainbow",
    name: "Arco-Íris",
    emoji: "🌈",
    colorBg: "bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600",
    borderColor: "#3730A3",
    textColor: "text-white",
    widthPx: 135,
  },
];

const BLOCK_HEIGHT = 56;
const BASE_Y = 40; // Altura da mesa de madeira

export function BlocksGame() {
  const [stackedBlocks, setStackedBlocks] = useState<PlacedBlock[]>([]);
  const [selectedType, setSelectedType] = useState<BlockType>(BLOCK_TYPES[0]);
  const [isDemolishing, setIsDemolishing] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Posição X da mão/guindaste em pixels a partir da esquerda do container
  const [craneX, setCraneX] = useState<number>(200);
  const [isDragging, setIsDragging] = useState(false);

  // Bloco em queda livre animada
  const [fallingAnimation, setFallingAnimation] = useState<{
    block: PlacedBlock;
    currentY: number; // px a partir do topo
    targetY: number; // px a partir do topo
    rotation: number;
    isTumbling: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Inicializa o guindaste no centro
  useEffect(() => {
    if (containerRef.current) {
      setCraneX(containerRef.current.clientWidth / 2);
    }
  }, []);

  // Câmera dinâmica: quando a torre tem mais de 3 blocos, move suavemente para baixo
  const cameraOffsetY = Math.max(0, (stackedBlocks.length - 3) * BLOCK_HEIGHT);

  const updateCranePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const clampedX = Math.max(70, Math.min(rect.width - 70, localX));
    setCraneX(clampedX);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDemolishing || fallingAnimation) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateCranePosition(e.clientX);
    sounds.playPop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      updateCranePosition(e.clientX);
    }
  };

  // QUANDO O DEDO É SOLTO: GRAVIDADE REAL E QUEDA FÍSICA!
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isDemolishing || fallingAnimation || !containerRef.current) {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);
    updateCranePosition(e.clientX);

    const container = containerRef.current;
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;
    const centerX = containerWidth / 2;

    // Posição X solta em relação ao centro da torre
    const dropXRelative = craneX - centerX;

    const startY = 60; // Começa na garra do topo
    const targetBottomY = containerHeight - BASE_Y - (stackedBlocks.length + 1) * BLOCK_HEIGHT + cameraOffsetY;

    sounds.playBoing();

    // Cria o bloco em queda
    const newBlockData: PlacedBlock = {
      id: Date.now(),
      emoji: selectedType.emoji,
      colorBg: selectedType.colorBg,
      borderColor: selectedType.borderColor,
      textColor: selectedType.textColor,
      widthPx: selectedType.widthPx,
      x: dropXRelative,
      y: (stackedBlocks.length + 1) * BLOCK_HEIGHT,
      rotation: 0,
    };

    // Animação contínua de gravidade
    const startTime = performance.now();
    const durationMs = 320; // 320ms de queda acelerada

    const animateFall = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Equação de aceleração gravitacional: y = progress^2
      const easeInY = startY + (targetBottomY - startY) * Math.pow(progress, 2);

      if (progress < 1) {
        setFallingAnimation({
          block: newBlockData,
          currentY: easeInY,
          targetY: targetBottomY,
          rotation: 0,
          isTumbling: false,
        });
        requestAnimationFrame(animateFall);
      } else {
        // Bloco atingiu o solo ou a torre!
        setFallingAnimation(null);

        // Checa colisão com o bloco de baixo
        if (stackedBlocks.length === 0) {
          // Primeiro bloco na base: fixa com sucesso!
          finalizeLand(newBlockData, 0);
        } else {
          const topBlock = stackedBlocks[stackedBlocks.length - 1];
          const diff = dropXRelative - topBlock.x;
          const maxBalanceTolerance = selectedType.widthPx * 0.42; // Máximo 42% de desvio

          if (Math.abs(diff) <= maxBalanceTolerance) {
            // Equilibrou com sucesso! Pequena inclinação orgânica
            const organicTilt = (diff / maxBalanceTolerance) * 7;
            finalizeLand(newBlockData, organicTilt);
          } else {
            // DESEQUILIBROU! O bloco tomba e cai no chão!
            handleTumble(newBlockData, diff > 0 ? 1 : -1, targetBottomY, containerHeight);
          }
        }
      }
    };

    requestAnimationFrame(animateFall);
  };

  const finalizeLand = (block: PlacedBlock, tilt: number) => {
    sounds.playSnap();
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 200);

    setStackedBlocks((prev) => {
      const next = [...prev, { ...block, rotation: tilt }];
      if (next.length % 5 === 0) {
        sounds.playSuccess();
        confetti({
          particleCount: 60,
          spread: 75,
          origin: { y: 0.6 },
        });
      }
      return next;
    });
  };

  const handleTumble = (block: PlacedBlock, direction: number, fromY: number, containerHeight: number) => {
    sounds.playTowerFall();

    // Anima o bloco tombando e despencando para fora
    setFallingAnimation({
      block: { ...block, x: block.x + direction * 40 },
      currentY: fromY,
      targetY: containerHeight + 100,
      rotation: direction * 85,
      isTumbling: true,
    });

    setTimeout(() => {
      setFallingAnimation(null);
    }, 600);
  };

  const handleDemolish = () => {
    if (stackedBlocks.length === 0 || isDemolishing) return;
    setIsDemolishing(true);
    sounds.playTowerFall();

    setStackedBlocks((prev) =>
      prev.map((b) => ({
        ...b,
        x: b.x + (Math.random() - 0.5) * 120,
        rotation: (Math.random() - 0.5) * 140,
      }))
    );

    setTimeout(() => {
      setStackedBlocks([]);
      setIsDemolishing(false);
      sounds.playBoing();
    }, 900);
  };

  const handleClear = () => {
    sounds.playBoing();
    setStackedBlocks([]);
    setFallingAnimation(null);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Placar e Botões */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-orange shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-100 border-2 border-amber-400 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-inner">
          <span className="text-2xl sm:text-3xl animate-bounce">🧱</span>
          <span className="text-xl sm:text-3xl font-black text-amber-900">
            {stackedBlocks.length} Blocos
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleDemolish}
            disabled={stackedBlocks.length === 0 || isDemolishing}
            className={`kid-btn px-4 sm:px-8 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 font-black text-base sm:text-xl flex items-center gap-1.5 sm:gap-2 transition-all ${
              stackedBlocks.length > 0 && !isDemolishing
                ? "bg-kids-coral text-white border-rose-700 shadow-kid active:scale-90 animate-pulse-gentle"
                : "bg-gray-200 text-gray-400 border-gray-300 opacity-60 cursor-not-allowed"
            }`}
          >
            <Bomb size={22} className="stroke-[2.5]" />
            <span>BUM! 💥</span>
          </button>

          <button
            onClick={handleClear}
            className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 border-slate-300 shadow-kid"
            title="Limpar Torre"
          >
            <Trash2 size={20} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ÁREA DE GRAVIDADE COM CÂMERA ACOMPANHANDO */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 rounded-3xl sm:rounded-4xl border-6 sm:border-8 border-kids-wood shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none ${
          isScreenShaking ? "animate-wiggle" : ""
        }`}
      >
        {/* Nuvens e Sol no Céu */}
        <div className="absolute top-4 left-8 text-6xl opacity-40 animate-float pointer-events-none">☁️</div>
        <div className="absolute top-8 right-12 text-6xl opacity-40 animate-float-delayed pointer-events-none">☁️</div>
        <div className="absolute top-4 right-1/3 text-4xl text-amber-400 animate-pulse pointer-events-none">⭐</div>

        {/* 1. GUINDASTE / BLOCO NA MÃO PRONTO PARA SOLTAR */}
        {!isDemolishing && !fallingAnimation && (
          <div
            className="absolute top-3 -translate-x-1/2 z-30 pointer-events-none transition-transform duration-75"
            style={{ left: `${craneX}px` }}
          >
            {/* Garra mecânica */}
            <div className="w-8 h-4 bg-slate-800 rounded-t-lg mx-auto border-2 border-slate-900" />

            {/* O Bloco selecionado */}
            <div
              className={`flex items-center justify-center font-black rounded-2xl border-4 shadow-2xl ${selectedType.colorBg}`}
              style={{
                width: `${selectedType.widthPx}px`,
                height: `${BLOCK_HEIGHT}px`,
                borderColor: selectedType.borderColor,
              }}
            >
              <span className="text-3xl drop-shadow">{selectedType.emoji}</span>
            </div>

            {/* Linha guia de mira para onde vai cair */}
            <div className="w-0.5 h-64 border-dashed border-r-2 border-amber-600/60 mx-auto" />
          </div>
        )}

        {/* 2. BLOCO EM QUEDA FÍSICA ANIMADA */}
        {fallingAnimation && (
          <div
            className={`absolute z-40 -translate-x-1/2 pointer-events-none ${
              fallingAnimation.isTumbling ? "transition-all duration-500 ease-in" : ""
            }`}
            style={{
              left: `${(containerRef.current?.clientWidth ?? 400) / 2 + fallingAnimation.block.x}px`,
              top: `${fallingAnimation.currentY}px`,
              transform: `rotate(${fallingAnimation.rotation}deg)`,
            }}
          >
            <div
              className={`flex items-center justify-center font-black rounded-2xl border-4 shadow-2xl ${fallingAnimation.block.colorBg}`}
              style={{
                width: `${fallingAnimation.block.widthPx}px`,
                height: `${BLOCK_HEIGHT}px`,
                borderColor: fallingAnimation.block.borderColor,
              }}
            >
              <span className="text-3xl drop-shadow">{fallingAnimation.block.emoji}</span>
            </div>
          </div>
        )}

        {/* 3. A TORRE DE BLOCOS (Deslocada pela Câmera Conforme Fica Alta) */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${cameraOffsetY}px)`,
          }}
        >
          {/* Blocos empilhados */}
          {stackedBlocks.map((b) => (
            <div
              key={b.id}
              className="relative transition-all duration-200"
              style={{
                transform: `translateX(${b.x}px) rotate(${b.rotation}deg)`,
                marginBottom: "-2px",
              }}
            >
              <div
                className={`flex items-center justify-center font-black rounded-2xl border-4 shadow-kid-sm ${b.colorBg}`}
                style={{
                  width: `${b.widthPx}px`,
                  height: `${BLOCK_HEIGHT}px`,
                  borderColor: b.borderColor,
                }}
              >
                <span className="text-3xl sm:text-4xl drop-shadow">{b.emoji}</span>
              </div>
            </div>
          ))}

          {/* Mesa de Madeira Firme na Base */}
          <div className="w-full h-12 bg-kids-wood border-t-6 border-amber-950 flex justify-center items-center shadow-2xl">
            <span className="text-sm sm:text-base text-amber-950 font-black tracking-wide">
              🪵 MESA DE EQUILÍBRIO DO ISRAEL 🪵
            </span>
          </div>
        </div>
      </div>

      {/* BANDEJA DE SELEÇÃO DE BLOCOS */}
      <div className="w-full bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-blue shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center justify-around gap-2 overflow-x-auto py-1">
          {BLOCK_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playPop();
                setSelectedType(t);
              }}
              className={`kid-btn p-2.5 sm:p-3 rounded-2xl border-4 transition-all flex-shrink-0 ${
                selectedType.id === t.id
                  ? "bg-kids-yellow border-amber-500 scale-110 shadow-kid ring-4 ring-yellow-300"
                  : "bg-slate-50 border-slate-300 hover:bg-amber-50 shadow-sm"
              }`}
            >
              <span className="text-3xl sm:text-4xl">{t.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
