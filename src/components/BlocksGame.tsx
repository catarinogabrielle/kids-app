"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { GameHeader } from "@/components/TopBar";
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
    widthPx: 140,
  },
  {
    id: "ark",
    name: "Arca",
    emoji: "🛳️",
    colorBg: "bg-gradient-to-r from-yellow-700 via-amber-800 to-amber-950",
    borderColor: "#291001",
    textColor: "text-amber-200",
    widthPx: 150,
  },
  {
    id: "lion",
    name: "Leão",
    emoji: "🦁",
    colorBg: "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600",
    borderColor: "#78350F",
    textColor: "text-amber-950",
    widthPx: 130,
  },
  {
    id: "dino",
    name: "Dino",
    emoji: "🦖",
    colorBg: "bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700",
    borderColor: "#064E3B",
    textColor: "text-white",
    widthPx: 135,
  },
  {
    id: "car",
    name: "Carro",
    emoji: "🚗",
    colorBg: "bg-gradient-to-r from-rose-500 via-red-600 to-rose-700",
    borderColor: "#881337",
    textColor: "text-white",
    widthPx: 135,
  },
  {
    id: "crown",
    name: "Coroa",
    emoji: "👑",
    colorBg: "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500",
    borderColor: "#B45309",
    textColor: "text-amber-950",
    widthPx: 125,
  },
  {
    id: "rainbow",
    name: "Arco-Íris",
    emoji: "🌈",
    colorBg: "bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-600",
    borderColor: "#3730A3",
    textColor: "text-white",
    widthPx: 145,
  },
];

export function BlocksGame({ onHome }: { onHome?: () => void }) {
  const [stackedBlocks, setStackedBlocks] = useState<PlacedBlock[]>([]);
  const [selectedType, setSelectedType] = useState<BlockType>(BLOCK_TYPES[0]);
  const [isDemolishing, setIsDemolishing] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Dimensões dinâmicas e reativas do container do jogo (atualizadas via ResizeObserver)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 500,
  });

  // Posição X da mira do guindaste em pixels
  const [craneX, setCraneX] = useState<number>(300);
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

  // Observa resize e rotação da tela (retrato vs paisagem)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setDimensions({ width: w, height: h });
      setCraneX((prev) => (prev <= 0 || prev >= w ? w / 2 : prev));
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Proporções adaptativas: quando a altura é compacta (<420px, típico de mobile horizontal)
  const isCompactHeight = dimensions.height < 420;
  const blockHeight = isCompactHeight ? 42 : 54;
  const tableHeight = isCompactHeight ? 30 : 44;
  const craneTop = isCompactHeight ? 8 : 16;
  const blockWidthScale = isCompactHeight ? 0.8 : 1.0;
  const currentBlockWidth = Math.round(selectedType.widthPx * blockWidthScale);

  // Altura total da torre atual (mesa + blocos colocados)
  const towerTopHeight = tableHeight + stackedBlocks.length * blockHeight;

  // Câmera dinâmica centralizada no meio da tela:
  // Conforme solicitado: Quando atinge a altura, mantém o topo da torre NO MEIO DA TELA (~48% no celular/tablet, ~44% em paisagem)
  // com espaçamento generoso e amplo acima para o guindaste e queda triunfal!
  const targetCenterFactor = isCompactHeight ? 0.44 : 0.48;
  const targetCenterHeight = dimensions.height * targetCenterFactor;
  const cameraOffsetY = Math.max(0, towerTopHeight - targetCenterHeight);

  const getContainerRelativeX = useCallback((clientX: number) => {
    if (!containerRef.current) return 200;
    const rect = containerRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    return Math.max(60, Math.min(rect.width - 60, localX));
  }, []);

  const tumbleOff = useCallback(
    (
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
    },
    []
  );

  const finalizePlacement = useCallback((block: PlacedBlock, tilt: number) => {
    sounds.playScale(stackedBlocks.length + 1);
    sounds.playSnap();
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 180);

    setStackedBlocks((prev) => {
      const next = [...prev, { ...block, rotation: tilt }];
      if (next.length % 5 === 0) {
        sounds.playSparkle();
        sounds.playSuccess();
        confetti({
          particleCount: 80,
          spread: 85,
          origin: { y: 0.6 },
        });
      }
      return next;
    });
  }, [stackedBlocks.length]);

  // SOLTURA DO BLOCO COM GRAVIDADE
  const triggerDrop = useCallback(
    (dropClientX: number) => {
      if (isDemolishing || fallingBlock || !containerRef.current) return;

      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;
      const isCompact = containerHeight < 420;
      const curBlockHeight = isCompact ? 42 : 54;
      const curTableHeight = isCompact ? 30 : 44;
      const curCraneTop = isCompact ? 8 : 16;
      const curScale = isCompact ? 0.8 : 1.0;
      const curBlockWidth = Math.round(selectedType.widthPx * curScale);

      const currentX = getContainerRelativeX(dropClientX);
      setCraneX(currentX);

      const centerX = containerWidth / 2;
      const dropXRelative = currentX - centerX;

      const startY = curCraneTop + 4; // Sai da garra mecânica
      // Altura da torre atual
      const curTowerTop = curTableHeight + stackedBlocks.length * curBlockHeight;
      // Posição alvo do topo da torre: centro da tela (~48% no celular/tablet, ~44% em paisagem)
      const curCenterFactor = isCompact ? 0.44 : 0.48;
      const curTargetCenter = containerHeight * curCenterFactor;
      const curCameraOffset = Math.max(0, curTowerTop - curTargetCenter);

      // Posição final onde o bloco deve aterrissar em coordenadas do container
      const targetY = containerHeight - curTowerTop - curBlockHeight + curCameraOffset;

      const fallDistance = Math.max(40, targetY - startY);
      // Duração proporcional à distância de queda (aceleração natural com gravidade)
      const durationMs = Math.min(380, Math.max(220, Math.round(Math.sqrt(fallDistance) * 18)));

      sounds.playBoing();

      const newBlock: PlacedBlock = {
        id: Date.now(),
        emoji: selectedType.emoji,
        colorBg: selectedType.colorBg,
        borderColor: selectedType.borderColor,
        textColor: selectedType.textColor,
        widthPx: curBlockWidth,
        x: dropXRelative,
        rotation: 0,
      };

      const startTime = performance.now();

      const animateFall = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        // Aceleração gravitacional suave
        const currentY = startY + (targetY - startY) * (progress * progress);

        setFallingBlock({
          block: newBlock,
          currentY,
          targetY,
          rotation: 0,
          isTumbling: false,
        });

        if (progress < 1) {
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
            const maxTolerance = curBlockWidth * 0.45; // 45% de tolerância para dedinho de criança

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
    [isDemolishing, fallingBlock, getContainerRelativeX, stackedBlocks, selectedType, finalizePlacement, tumbleOff]
  );

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

  // Posição vertical da superfície do topo da torre em coordenadas de tela
  const currentTowerTopScreenY = dimensions.height - towerTopHeight + cameraOffsetY;
  const craneBlockBottomY = craneTop + 4 + blockHeight;
  // Linha guia conecta com precisão milimétrica a base da garra mecânica até a superfície da torre
  const guideLineHeight = Math.max(30, currentTowerTopScreenY - craneBlockBottomY);

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden">
      {/* 1. HEADER DO JOGO */}
      <GameHeader
        onHome={onHome}
        title="Torre da Fé"
        icon="🧱"
        leftControls={
          <div className="flex items-center gap-1 bg-white/95 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-kids-orange shadow-sm flex-shrink-0">
            <span className="text-base sm:text-lg">🧱</span>
            <span className="text-xs sm:text-sm font-black text-amber-950 whitespace-nowrap">
              Torre: {stackedBlocks.length}
            </span>
          </div>
        }
        rightControls={
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleDemolish}
              disabled={stackedBlocks.length === 0 || isDemolishing}
              className={`kid-btn px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl border font-black text-xs sm:text-sm flex items-center gap-1 ${
                stackedBlocks.length > 0 && !isDemolishing
                  ? "bg-kids-coral text-white border-rose-700 shadow-sm active:scale-90 animate-pulse-gentle"
                  : "bg-white/80 text-gray-400 border-gray-300 opacity-60 cursor-not-allowed"
              }`}
            >
              <Bomb size={14} className="sm:w-4 sm:h-4" />
              <span>BUM! 💥</span>
            </button>

            <button
              onClick={handleClear}
              className="kid-btn bg-white hover:bg-slate-100 text-slate-700 p-1 sm:p-1.5 rounded-xl border border-slate-300 shadow-sm"
              title="Limpar Torre"
            >
              <Trash2 size={16} />
            </button>
          </div>
        }
      />

      {/* 2. ÁREA DE GRAVIDADE COM CÂMERA DINÂMICA AUTO-ADAPTATIVA */}
      <div
        ref={containerRef}
        onPointerDown={handleArenaPointerDown}
        className={`relative flex-1 min-h-0 w-full h-full bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 overflow-hidden cursor-crosshair touch-none select-none ${
          isScreenShaking ? "animate-wiggle" : ""
        }`}
      >
        {/* Nuvens e Sol */}
        <div className="absolute top-10 sm:top-16 left-6 text-4xl sm:text-6xl opacity-40 animate-float pointer-events-none">
          ☁️
        </div>
        <div className="absolute top-12 sm:top-20 right-8 text-4xl sm:text-6xl opacity-40 animate-float-delayed pointer-events-none">
          ☁️
        </div>
        <div className="absolute top-8 sm:top-14 left-1/2 text-4xl sm:text-5xl opacity-80 pointer-events-none">
          ☀️
        </div>

        {/* 1. GUINDASTE / BLOCO NA MÃO PRONTO PARA SOLTAR */}
        {!isDemolishing && !fallingBlock && (
          <div
            className="absolute -translate-x-1/2 z-30 pointer-events-none transition-transform duration-75"
            style={{
              left: `${craneX}px`,
              top: `${craneTop}px`,
            }}
          >
            {/* Garra mecânica */}
            <div className="w-8 h-3 sm:w-10 sm:h-4 bg-slate-800 rounded-t-lg mx-auto border-2 border-slate-900" />

            {/* O Bloco selecionado */}
            <div
              className={`flex items-center justify-center font-black rounded-xl sm:rounded-2xl border-3 sm:border-4 shadow-2xl ${selectedType.colorBg}`}
              style={{
                width: `${currentBlockWidth}px`,
                height: `${blockHeight}px`,
                borderColor: selectedType.borderColor,
              }}
            >
              <span className="text-2xl sm:text-4xl drop-shadow select-none">{selectedType.emoji}</span>
            </div>

            {/* Linha guia pontilhada até o chão */}
            <div
              className="w-0.5 border-dashed border-r-2 border-amber-600/50 mx-auto"
              style={{ height: `${guideLineHeight}px` }}
            />
          </div>
        )}

        {/* 2. BLOCO EM QUEDA FÍSICA COM GRAVIDADE REAL */}
        {fallingBlock && (
          <div
            className={`absolute z-40 -translate-x-1/2 pointer-events-none ${
              fallingBlock.isTumbling ? "transition-all duration-500 ease-in" : ""
            }`}
            style={{
              left: `${dimensions.width / 2 + fallingBlock.block.x}px`,
              top: `${fallingBlock.currentY}px`,
              transform: `rotate(${fallingBlock.rotation}deg)`,
            }}
          >
            <div
              className={`flex items-center justify-center font-black rounded-xl sm:rounded-2xl border-3 sm:border-4 shadow-2xl ${fallingBlock.block.colorBg}`}
              style={{
                width: `${fallingBlock.block.widthPx}px`,
                height: `${blockHeight}px`,
                borderColor: fallingBlock.block.borderColor,
              }}
            >
              <span className="text-2xl sm:text-4xl drop-shadow select-none">{fallingBlock.block.emoji}</span>
            </div>
          </div>
        )}

        {/* 3. A TORRE DE BLOCOS EMPILHADA COM BASE ABSOLUTA FIRME */}
        <div
          className="absolute inset-x-0 bottom-0 h-full pointer-events-none transition-transform duration-500 ease-out"
          style={{
            transform: `translateY(${cameraOffsetY}px)`,
          }}
        >
          {/* Mesa de Madeira Firme na Base */}
          <div
            className="absolute inset-x-0 bottom-0 bg-kids-wood border-t-4 sm:border-t-6 border-amber-950 flex justify-center items-center shadow-2xl z-10"
            style={{ height: `${tableHeight}px` }}
          >
            <span className="text-[10px] sm:text-xs md:text-sm text-amber-950 font-black tracking-wide truncate px-2 select-none">
              🪵 MESA DE EQUILÍBRIO DO ISRAEL 🪵
            </span>
          </div>

          {/* Blocos empilhados da mesa para cima */}
          {stackedBlocks.map((b, idx) => (
            <div
              key={b.id}
              className="absolute -translate-x-1/2 transition-all duration-200"
              style={{
                left: `calc(50% + ${b.x}px)`,
                bottom: `${tableHeight + idx * blockHeight}px`,
                transform: `rotate(${b.rotation}deg)`,
              }}
            >
              <div
                className={`flex items-center justify-center font-black rounded-xl sm:rounded-2xl border-3 sm:border-4 shadow-kid-sm ${b.colorBg}`}
                style={{
                  width: `${b.widthPx}px`,
                  height: `${blockHeight}px`,
                  borderColor: b.borderColor,
                }}
              >
                <span className="text-2xl sm:text-4xl drop-shadow select-none">{b.emoji}</span>
              </div>
              {/* Pombinha da Paz no topo da torre */}
              {idx === stackedBlocks.length - 1 && (
                <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 text-xl sm:text-2xl animate-bounce pointer-events-none select-none">
                  🕊️
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. DOCK INFERIOR: BANDEJA DE BLOCOS COM LAYOUT COMPACTO EM LANDSCAPE */}
      <div className="w-full bg-white/95 backdrop-blur-md px-2 sm:px-4 landscape:py-1 py-2 sm:py-2.5 border-t-2 sm:border-t-3 border-kids-blue shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-20 flex-shrink-0">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-center gap-1.5 sm:gap-2.5 landscape:gap-1.5 flex-nowrap overflow-x-auto scrollbar-none py-0.5">
          {BLOCK_TYPES.map((t) => {
            const isSelected = selectedType.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sounds.playPop();
                  setSelectedType(t);
                }}
                className={`kid-btn px-2 py-1 landscape:px-2 landscape:py-0.5 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 transition-all flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ${
                  isSelected
                    ? "bg-kids-yellow border-amber-500 scale-105 shadow-sm ring-2 ring-yellow-300"
                    : "bg-slate-50 border-slate-300 hover:bg-amber-50 shadow-sm"
                }`}
                title={t.name}
              >
                <span className="text-xl sm:text-2xl landscape:text-xl">{t.emoji}</span>
                <span className="hidden md:inline landscape:hidden text-xs sm:text-sm font-black text-amber-950 whitespace-nowrap">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
