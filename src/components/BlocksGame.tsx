"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  x: number; // Offset horizontal em pixels a partir do centro
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
    widthPx: 145,
  },
  {
    id: "ark",
    name: "Arca",
    emoji: "🛳️",
    colorBg: "bg-gradient-to-r from-yellow-700 via-amber-800 to-amber-950",
    borderColor: "#291001",
    textColor: "text-amber-200",
    widthPx: 155,
  },
  {
    id: "lion",
    name: "Leão",
    emoji: "🦁",
    colorBg: "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600",
    borderColor: "#78350F",
    textColor: "text-amber-950",
    widthPx: 135,
  },
  {
    id: "dino",
    name: "Dino",
    emoji: "🦖",
    colorBg: "bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700",
    borderColor: "#064E3B",
    textColor: "text-white",
    widthPx: 140,
  },
  {
    id: "car",
    name: "Carro",
    emoji: "🚗",
    colorBg: "bg-gradient-to-r from-rose-500 via-red-600 to-rose-700",
    borderColor: "#881337",
    textColor: "text-white",
    widthPx: 140,
  },
  {
    id: "crown",
    name: "Coroa",
    emoji: "👑",
    colorBg: "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500",
    borderColor: "#B45309",
    textColor: "text-amber-950",
    widthPx: 130,
  },
  {
    id: "rainbow",
    name: "Arco-Íris",
    emoji: "🌈",
    colorBg: "bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600",
    borderColor: "#3730A3",
    textColor: "text-white",
    widthPx: 150,
  },
];

const BLOCK_HEIGHT = 60;
const TABLE_HEIGHT = 50;

export function BlocksGame() {
  const [stackedBlocks, setStackedBlocks] = useState<PlacedBlock[]>([]);
  const [selectedType, setSelectedType] = useState<BlockType>(BLOCK_TYPES[0]);
  const [isDemolishing, setIsDemolishing] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Posição X da mira do guindaste em pixels
  const [craneX, setCraneX] = useState<number>(200);
  const [isDraggingCrane, setIsDraggingCrane] = useState(false);

  // Bloco animado caindo no ar
  const [fallingBlock, setFallingBlock] = useState<{
    block: PlacedBlock;
    currentY: number; // Top em px
    targetY: number; // Top final em px
    rotation: number;
    isTumbling: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Inicializa o guindaste centralizado
  useEffect(() => {
    if (containerRef.current) {
      setCraneX(containerRef.current.clientWidth / 2);
    }
  }, []);

  // Câmera acompanha o topo da torre quando ela passa de 4 blocos
  const cameraOffsetY = Math.max(0, (stackedBlocks.length - 4) * BLOCK_HEIGHT);

  const getContainerRelativeX = useCallback((clientX: number) => {
    if (!containerRef.current) return 200;
    const rect = containerRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    return Math.max(75, Math.min(rect.width - 75, localX));
  }, []);

  // SOLTURA DO BLOCO COM GRAVIDADE
  const triggerDrop = useCallback(
    (dropClientX: number) => {
      if (isDemolishing || fallingBlock || !containerRef.current) return;

      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;
      const currentX = getContainerRelativeX(dropClientX);
      setCraneX(currentX);

      const centerX = containerWidth / 2;
      const dropXRelative = currentX - centerX;

      const startY = 64; // Sai da garra no topo
      // Altura onde o bloco vai pousar em relação ao topo do container
      const currentTowerTopPx = TABLE_HEIGHT + stackedBlocks.length * BLOCK_HEIGHT;
      const targetY = containerHeight - currentTowerTopPx - BLOCK_HEIGHT + cameraOffsetY;

      sounds.playBoing();

      const newBlock: PlacedBlock = {
        id: Date.now(),
        emoji: selectedType.emoji,
        colorBg: selectedType.colorBg,
        borderColor: selectedType.borderColor,
        textColor: selectedType.textColor,
        widthPx: selectedType.widthPx,
        x: dropXRelative,
        rotation: 0,
      };

      const startTime = performance.now();
      const durationMs = 280; // Queda rápida e crocante

      const animateFall = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        // Aceleração gravitacional com curva quadrática
        const easeInY = startY + (targetY - startY) * Math.pow(progress, 2);

        if (progress < 1) {
          setFallingBlock({
            block: newBlock,
            currentY: easeInY,
            targetY,
            rotation: 0,
            isTumbling: false,
          });
          requestAnimationFrame(animateFall);
        } else {
          // Atingiu o destino!
          setFallingBlock(null);

          // Checa equilíbrio
          if (stackedBlocks.length === 0) {
            // Primeiro bloco sobre a mesa: firmeza total
            finalizePlacement(newBlock, 0);
          } else {
            const topBlock = stackedBlocks[stackedBlocks.length - 1];
            const offsetDiff = dropXRelative - topBlock.x;
            const maxTolerance = selectedType.widthPx * 0.45; // 45% de tolerância para dedinho de 4 anos

            if (Math.abs(offsetDiff) <= maxTolerance) {
              // Equilibrou! Leve inclinação orgânica
              const tilt = (offsetDiff / maxTolerance) * 6;
              finalizePlacement(newBlock, tilt);
            } else {
              // Desequilibrou e tomba para fora da torre
              tumbleOff(newBlock, offsetDiff > 0 ? 1 : -1, targetY, containerHeight);
            }
          }
        }
      };

      requestAnimationFrame(animateFall);
    },
    [isDemolishing, fallingBlock, getContainerRelativeX, stackedBlocks, cameraOffsetY, selectedType]
  );

  const finalizePlacement = (block: PlacedBlock, tilt: number) => {
    sounds.playSnap();
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 180);

    setStackedBlocks((prev) => {
      const next = [...prev, { ...block, rotation: tilt }];
      if (next.length % 5 === 0) {
        sounds.playSuccess();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
      return next;
    });
  };

  const tumbleOff = (
    block: PlacedBlock,
    direction: number,
    fromY: number,
    containerHeight: number
  ) => {
    sounds.playTowerFall();

    setFallingBlock({
      block: { ...block, x: block.x + direction * 45 },
      currentY: fromY,
      targetY: containerHeight + 120,
      rotation: direction * 80,
      isTumbling: true,
    });

    setTimeout(() => {
      setFallingBlock(null);
    }, 550);
  };

  // Eventos de ponteiro robustos com listeners globais enquanto arrasta
  const handleArenaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDemolishing || fallingBlock) return;
    setIsDraggingCrane(true);
    setCraneX(getContainerRelativeX(e.clientX));
  };

  useEffect(() => {
    if (!isDraggingCrane) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      setCraneX(getContainerRelativeX(e.clientX));
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      setIsDraggingCrane(false);
      triggerDrop(e.clientX);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, [isDraggingCrane, getContainerRelativeX, triggerDrop]);

  // BUM! 💥 Demolição divertida
  const handleDemolish = () => {
    if (stackedBlocks.length === 0 || isDemolishing) return;
    setIsDemolishing(true);
    sounds.playTowerFall();

    setStackedBlocks((prev) =>
      prev.map((b) => ({
        ...b,
        x: b.x + (Math.random() - 0.5) * 160,
        rotation: (Math.random() - 0.5) * 160,
      }))
    );

    setTimeout(() => {
      setStackedBlocks([]);
      setIsDemolishing(false);
      sounds.playBoing();
    }, 850);
  };

  const handleClear = () => {
    sounds.playBoing();
    setStackedBlocks([]);
    setFallingBlock(null);
  };

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden">
      {/* ÁREA DE GRAVIDADE FULL-SCREEN COM CÂMERA DINÂMICA E HUD FLUTUANTE */}
      <div
        ref={containerRef}
        onPointerDown={handleArenaPointerDown}
        className={`relative flex-1 min-h-0 w-full h-full bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 overflow-hidden cursor-crosshair touch-none select-none ${
          isScreenShaking ? "animate-wiggle" : ""
        }`}
      >
        {/* HUD Flutuante no Topo */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-40 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md border-3 sm:border-4 border-kids-orange px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-2xl shadow-lg">
            <span className="text-2xl sm:text-3xl">🧱</span>
            <span className="text-sm sm:text-2xl font-black text-amber-950">
              Torre: {stackedBlocks.length}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={handleDemolish}
              disabled={stackedBlocks.length === 0 || isDemolishing}
              className={`kid-btn px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl border-3 sm:border-4 font-black text-sm sm:text-lg flex items-center gap-1.5 transition-all ${
                stackedBlocks.length > 0 && !isDemolishing
                  ? "bg-kids-coral text-white border-rose-700 shadow-lg active:scale-90 animate-pulse-gentle"
                  : "bg-white/80 text-gray-400 border-gray-300 opacity-60 cursor-not-allowed"
              }`}
            >
              <Bomb size={20} className="stroke-[2.5]" />
              <span>BUM! 💥</span>
            </button>

            <button
              onClick={handleClear}
              className="kid-btn bg-white/95 hover:bg-slate-100 text-slate-700 p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 border-slate-300 shadow-lg flex-shrink-0"
              title="Limpar Torre"
            >
              <Trash2 size={20} className="stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Nuvens e Sol */}
        <div className="absolute top-16 left-8 text-6xl opacity-40 animate-float pointer-events-none">
          ☁️
        </div>
        <div className="absolute top-20 right-12 text-6xl opacity-40 animate-float-delayed pointer-events-none">
          ☁️
        </div>
        <div className="absolute top-14 left-1/2 text-5xl opacity-80 pointer-events-none">
          ☀️
        </div>

        {/* 1. GUINDASTE / BLOCO NA MÃO PRONTO PARA SOLTAR */}
        {!isDemolishing && !fallingBlock && (
          <div
            className="absolute top-14 -translate-x-1/2 z-30 pointer-events-none transition-transform duration-75"
            style={{ left: `${craneX}px` }}
          >
            {/* Garra mecânica */}
            <div className="w-10 h-4 bg-slate-800 rounded-t-lg mx-auto border-2 border-slate-900" />

            {/* O Bloco selecionado */}
            <div
              className={`flex items-center justify-center font-black rounded-2xl border-4 shadow-2xl ${selectedType.colorBg}`}
              style={{
                width: `${selectedType.widthPx}px`,
                height: `${BLOCK_HEIGHT}px`,
                borderColor: selectedType.borderColor,
              }}
            >
              <span className="text-4xl drop-shadow">{selectedType.emoji}</span>
            </div>

            {/* Linha guia pontilhada até o chão */}
            <div className="w-0.5 h-96 border-dashed border-r-2 border-amber-600/50 mx-auto" />
          </div>
        )}

        {/* 2. BLOCO EM QUEDA FÍSICA COM GRAVIDADE REAL */}
        {fallingBlock && (
          <div
            className={`absolute z-40 -translate-x-1/2 pointer-events-none ${
              fallingBlock.isTumbling ? "transition-all duration-500 ease-in" : ""
            }`}
            style={{
              left: `${(containerRef.current?.clientWidth ?? 400) / 2 + fallingBlock.block.x}px`,
              top: `${fallingBlock.currentY}px`,
              transform: `rotate(${fallingBlock.rotation}deg)`,
            }}
          >
            <div
              className={`flex items-center justify-center font-black rounded-2xl border-4 shadow-2xl ${fallingBlock.block.colorBg}`}
              style={{
                width: `${fallingBlock.block.widthPx}px`,
                height: `${BLOCK_HEIGHT}px`,
                borderColor: fallingBlock.block.borderColor,
              }}
            >
              <span className="text-4xl drop-shadow">{fallingBlock.block.emoji}</span>
            </div>
          </div>
        )}

        {/* 3. A TORRE DE BLOCOS EMPILHADA COM BASE ABSOLUTA FIRME */}
        <div
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none transition-transform duration-300 ease-out"
          style={{
            transform: `translateY(${cameraOffsetY}px)`,
          }}
        >
          {/* Mesa de Madeira Firme na Base */}
          <div
            className="absolute inset-x-0 bottom-0 bg-kids-wood border-t-6 border-amber-950 flex justify-center items-center shadow-2xl z-10"
            style={{ height: `${TABLE_HEIGHT}px` }}
          >
            <span className="text-xs sm:text-base text-amber-950 font-black tracking-wide">
              🪵 MESA DE EQUILÍBRIO DO ISRAEL 🪵
            </span>
          </div>

          {/* Blocos empilhados da mesa para cima (100% Determinístico) */}
          {stackedBlocks.map((b, idx) => (
            <div
              key={b.id}
              className="absolute -translate-x-1/2 transition-all duration-200"
              style={{
                left: `calc(50% + ${b.x}px)`,
                bottom: `${TABLE_HEIGHT + idx * BLOCK_HEIGHT}px`,
                transform: `rotate(${b.rotation}deg)`,
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
                <span className="text-4xl drop-shadow">{b.emoji}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DOCK INFERIOR FULL-WIDTH: BANDEJA DE BLOCOS */}
      <div className="w-full bg-white/95 backdrop-blur-md px-2.5 sm:px-6 py-2 sm:py-3 border-t-4 border-kids-blue shadow-[0_-8px_25px_rgba(0,0,0,0.12)] z-20 flex-shrink-0">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-around gap-2 overflow-x-auto py-0.5">
          {BLOCK_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sounds.playPop();
                setSelectedType(t);
              }}
              className={`kid-btn px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-3 sm:border-4 transition-all flex items-center gap-1.5 flex-shrink-0 ${
                selectedType.id === t.id
                  ? "bg-kids-yellow border-amber-500 scale-105 shadow-kid-sm ring-2 sm:ring-4 ring-yellow-300"
                  : "bg-slate-50 border-slate-300 hover:bg-amber-50 shadow-sm"
              }`}
            >
              <span className="text-2xl sm:text-4xl">{t.emoji}</span>
              <span className="hidden md:inline text-sm font-black text-amber-950">
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
