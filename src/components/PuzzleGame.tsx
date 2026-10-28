"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight, Check, Sparkles } from "lucide-react";

interface PuzzleDefinition {
  id: string;
  title: string;
  icon: string;
  renderSvg: (className?: string) => React.ReactNode;
}

const PUZZLES: PuzzleDefinition[] = [
  {
    id: "lion",
    title: "O Rei Leão",
    icon: "🦁",
    renderSvg: (className = "w-full h-full") => (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Céu dourado da Savana e Sol */}
        <rect width="400" height="215" fill="#BAE6FD" />
        <circle cx="58" cy="48" r="28" fill="#FDE047" stroke="#F59E0B" strokeWidth="4" />
        <path
          d="M 305 45 Q 320 25 342 35 Q 365 25 378 42 Q 392 50 384 68 Q 370 78 338 75 Q 305 78 296 62 Q 290 50 305 45 Z"
          fill="#FFFFFF"
        />
        {/* Colinas e Gramado Verde */}
        <path d="M 0 215 Q 95 165 215 205 T 400 190 L 400 300 L 0 300 Z" fill="#86EFAC" />
        <path d="M 0 220 Q 200 205 400 220 L 400 300 L 0 300 Z" fill="#22C55E" stroke="#15803D" strokeWidth="4" />
        {/* Cauda do Leão */}
        <path
          d="M 255 252 C 305 255 335 225 328 180 C 325 165 312 168 315 185 C 318 215 292 238 250 238 Z"
          fill="#F59E0B"
          stroke="#78350F"
          strokeWidth="4"
        />
        <path
          d="M 318 178 C 302 162 310 135 334 132 C 348 145 346 170 328 182 Z"
          fill="#92400E"
          stroke="#451A03"
          strokeWidth="4"
        />
        {/* Patas Traseiras e Corpo */}
        <path d="M 142 205 C 105 210 95 248 118 272 L 158 272 Z" fill="#D97706" stroke="#78350F" strokeWidth="4" />
        <path d="M 258 205 C 295 210 305 248 282 272 L 242 272 Z" fill="#D97706" stroke="#78350F" strokeWidth="4" />
        <path
          d="M 145 170 C 134 208 136 252 150 275 L 250 275 C 264 252 266 208 255 170 Z"
          fill="#F59E0B"
          stroke="#78350F"
          strokeWidth="4.5"
        />
        {/* Peito Peludo Claro */}
        <path
          d="M 166 176 C 166 168 234 168 234 176 C 240 212 218 238 200 246 C 182 238 160 212 166 176 Z"
          fill="#FDE68A"
          stroke="#78350F"
          strokeWidth="3.5"
        />
        {/* Patas Dianteiras */}
        <ellipse cx="165" cy="276" rx="24" ry="13" fill="#FBBF24" stroke="#78350F" strokeWidth="4" />
        <ellipse cx="235" cy="276" rx="24" ry="13" fill="#FBBF24" stroke="#78350F" strokeWidth="4" />
        {/* Juba Ondulada em Flor */}
        <path
          d="M 200 32 Q 222 16 238 40 Q 266 30 270 60 Q 296 65 288 94 Q 310 114 288 136 Q 300 162 270 172 Q 266 198 238 190 Q 222 214 200 198 Q 178 214 162 190 Q 134 198 130 172 Q 100 162 112 136 Q 90 114 112 94 Q 104 65 130 60 Q 134 30 162 40 Q 178 16 200 32 Z"
          fill="#B45309"
          stroke="#451A03"
          strokeWidth="5"
        />
        {/* Orelhinhas e Coroa Real */}
        <circle cx="145" cy="64" r="18" fill="#F59E0B" stroke="#78350F" strokeWidth="4" />
        <circle cx="145" cy="64" r="9" fill="#FDE68A" />
        <circle cx="255" cy="64" r="18" fill="#F59E0B" stroke="#78350F" strokeWidth="4" />
        <circle cx="255" cy="64" r="9" fill="#FDE68A" />
        <polygon points="170,46 164,14 184,28 200,6 216,28 236,14 230,46" fill="#FDE047" stroke="#B45309" strokeWidth="4" />
        {/* Rosto do Leão */}
        <path
          d="M 200 56 C 242 56 262 84 258 118 C 255 150 234 172 200 172 C 166 172 145 150 142 118 C 138 84 158 56 200 56 Z"
          fill="#FBBF24"
          stroke="#78350F"
          strokeWidth="4.5"
        />
        {/* Olhos, Focinho e Nariz */}
        <ellipse cx="172" cy="100" rx="10" ry="12" fill="#FFFFFF" stroke="#451A03" strokeWidth="3" />
        <circle cx="174" cy="100" r="6" fill="#1E293B" />
        <circle cx="176" cy="97" r="2.5" fill="#FFFFFF" />
        <ellipse cx="228" cy="100" rx="10" ry="12" fill="#FFFFFF" stroke="#451A03" strokeWidth="3" />
        <circle cx="226" cy="100" r="6" fill="#1E293B" />
        <circle cx="228" cy="97" r="2.5" fill="#FFFFFF" />
        <path d="M 184 142 Q 200 165 216 142 Z" fill="#FB7185" stroke="#451A03" strokeWidth="3" />
        <path
          d="M 200 128 C 185 128 166 122 164 136 C 162 148 184 152 200 142 C 216 152 238 148 236 136 C 234 122 215 128 200 128 Z"
          fill="#FEF3C7"
          stroke="#78350F"
          strokeWidth="3.5"
        />
        <path d="M 185 114 Q 200 108 215 114 Q 218 124 200 132 Q 182 124 185 114 Z" fill="#E11D48" stroke="#451A03" strokeWidth="3.5" />
      </svg>
    ),
  },
  {
    id: "ark",
    title: "A Arca de Noé",
    icon: "🛳️",
    renderSvg: (className = "w-full h-full") => (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Céu azul suave com arco-íris */}
        <rect width="400" height="215" fill="#BAE6FD" />
        <path d="M 30 215 A 170 165 0 0 1 370 215" stroke="#EF4444" strokeWidth="16" fill="none" />
        <path d="M 45 215 A 155 150 0 0 1 355 215" stroke="#F59E0B" strokeWidth="15" fill="none" />
        <path d="M 60 215 A 140 135 0 0 1 340 215" stroke="#FDE047" strokeWidth="15" fill="none" />
        <path d="M 75 215 A 125 120 0 0 1 325 215" stroke="#10B981" strokeWidth="15" fill="none" />
        {/* Sol sorridente */}
        <circle cx="58" cy="52" r="30" fill="#FDE047" stroke="#F59E0B" strokeWidth="4" />
        {/* Cabine e Telhado da Arca */}
        <polygon points="85,120 200,52 315,120" fill="#DC2626" stroke="#451A03" strokeWidth="5" />
        <rect x="102" y="118" width="196" height="62" rx="8" fill="#D97706" stroke="#451A03" strokeWidth="5" />
        <rect x="122" y="130" width="42" height="38" rx="8" fill="#FEF3C7" stroke="#451A03" strokeWidth="3.5" />
        <rect x="179" y="130" width="42" height="38" rx="8" fill="#FEF3C7" stroke="#451A03" strokeWidth="3.5" />
        <rect x="236" y="130" width="42" height="38" rx="8" fill="#FEF3C7" stroke="#451A03" strokeWidth="3.5" />
        {/* Casco da Arca com Escotilhas */}
        <path d="M 38 175 Q 200 186 362 175 L 332 242 Q 200 258 68 242 Z" fill="#92400E" stroke="#451A03" strokeWidth="5.5" />
        <circle cx="115" cy="204" r="9" fill="#38BDF8" stroke="#451A03" strokeWidth="3" />
        <circle cx="172" cy="206" r="9" fill="#38BDF8" stroke="#451A03" strokeWidth="3" />
        <circle cx="228" cy="206" r="9" fill="#38BDF8" stroke="#451A03" strokeWidth="3" />
        <circle cx="285" cy="204" r="9" fill="#38BDF8" stroke="#451A03" strokeWidth="3" />
        {/* Mar azul com ondas */}
        <path d="M 0 228 Q 50 212 100 228 T 200 228 T 300 228 T 400 228 L 400 300 L 0 300 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="4" />
        <path d="M 0 255 Q 60 240 120 255 T 240 255 T 360 255 T 480 255 L 480 300 L 0 300 Z" fill="#0369A1" />
      </svg>
    ),
  },
  {
    id: "dino",
    title: "Super Dino Rex",
    icon: "🦖",
    renderSvg: (className = "w-full h-full") => (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Céu e Vulcão Pré-histórico */}
        <rect width="400" height="215" fill="#FEF9C3" />
        <circle cx="58" cy="48" r="28" fill="#F59E0B" />
        <polygon points="225,215 280,75 325,75 380,215" fill="#94A3B8" stroke="#334155" strokeWidth="4" />
        <path d="M 280 75 L 325 75 L 334 105 Q 315 118 302 102 Q 290 118 272 105 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3.5" />
        <rect y="215" width="400" height="85" fill="#22C55E" stroke="#15803D" strokeWidth="4" />
        {/* Cristas Dorsais */}
        <polygon points="130,52 146,24 164,48" fill="#F59E0B" stroke="#78350F" strokeWidth="3.5" />
        <polygon points="105,80 112,50 134,72" fill="#F59E0B" stroke="#78350F" strokeWidth="3.5" />
        <polygon points="92,120 84,92 110,106" fill="#F59E0B" stroke="#78350F" strokeWidth="3.5" />
        {/* Corpo e Cabeça do Dino */}
        <path
          d="M 122 115 C 105 75 138 38 190 42 C 242 45 272 65 272 95 C 272 120 245 132 208 132 C 230 156 242 198 230 242 C 218 272 172 282 128 275 C 82 275 35 252 24 218 C 20 202 38 198 50 208 C 70 222 92 222 102 195 C 108 165 112 138 122 115 Z"
          fill="#10B981"
          stroke="#064E3B"
          strokeWidth="5"
        />
        {/* Barriguinha Amarela */}
        <path
          d="M 186 136 C 224 152 234 202 220 245 C 208 268 186 272 168 265 C 182 225 182 178 186 136 Z"
          fill="#FDE047"
          stroke="#064E3B"
          strokeWidth="4"
        />
        {/* Olho e Sorriso */}
        <circle cx="188" cy="74" r="14" fill="#FFFFFF" stroke="#064E3B" strokeWidth="3.5" />
        <circle cx="192" cy="74" r="7" fill="#1E293B" />
        <path d="M 198 104 Q 232 118 262 100" stroke="#064E3B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "fire",
    title: "Caminhão de Bombeiros",
    icon: "🚒",
    renderSvg: (className = "w-full h-full") => (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Céu e Estrada */}
        <rect width="400" height="215" fill="#BAE6FD" />
        <rect y="215" width="400" height="85" fill="#475569" stroke="#1E293B" strokeWidth="4" />
        <circle cx="62" cy="48" r="26" fill="#FDE047" stroke="#F59E0B" strokeWidth="3.5" />
        {/* Escada Telescópica */}
        <rect x="148" y="55" width="215" height="26" rx="6" fill="#F8FAFC" stroke="#334155" strokeWidth="4" />
        {/* Sirene */}
        <path d="M 88 104 C 88 76 118 76 118 104 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" />
        {/* Cabine e Carroceria do Caminhão */}
        <path d="M 35 215 L 35 142 Q 35 104 75 104 L 155 104 L 155 215 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="5" />
        <rect x="155" y="104" width="210" height="111" rx="10" fill="#DC2626" stroke="#7F1D1D" strokeWidth="5" />
        <rect x="35" y="176" width="330" height="16" fill="#FDE047" stroke="#7F1D1D" strokeWidth="3.5" />
        {/* Janela e Carretel */}
        <path d="M 52 162 L 52 132 Q 52 118 70 118 L 136 118 L 136 162 Z" fill="#E0F2FE" stroke="#7F1D1D" strokeWidth="4" />
        <rect x="175" y="120" width="85" height="50" rx="6" fill="#CBD5E1" stroke="#334155" strokeWidth="3.5" />
        <circle cx="310" cy="145" r="26" fill="#F87171" stroke="#7F1D1D" strokeWidth="4" />
        <circle cx="310" cy="145" r="10" fill="#FFFFFF" stroke="#7F1D1D" strokeWidth="3" />
        {/* 3 Rodas Grandes */}
        <circle cx="95" cy="222" r="34" fill="#1E293B" stroke="#0F172A" strokeWidth="5" />
        <circle cx="95" cy="222" r="16" fill="#E2E8F0" />
        <circle cx="218" cy="222" r="34" fill="#1E293B" stroke="#0F172A" strokeWidth="5" />
        <circle cx="218" cy="222" r="16" fill="#E2E8F0" />
        <circle cx="315" cy="222" r="34" fill="#1E293B" stroke="#0F172A" strokeWidth="5" />
        <circle cx="315" cy="222" r="16" fill="#E2E8F0" />
      </svg>
    ),
  },
];

export function PuzzleGame() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [placedPieces, setPlacedPieces] = useState<number[]>([]);

  // Estado do arraste com o dedo
  const [draggingPieceId, setDraggingPieceId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<number | null>(null);

  // Referências dos 4 quadrantes para detecção precisa de proximidade
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);

  const currentPuzzle = PUZZLES[currentIdx];
  const isCompleted = placedPieces.length === 4;

  // Renderiza um pedaço real da imagem com recorte em quadrante
  const renderQuadrantContent = (quadrantId: number) => {
    const leftOffset = quadrantId % 2 === 0 ? "0%" : "-100%";
    const topOffset = quadrantId < 2 ? "0%" : "-100%";

    return (
      <div className="relative w-full h-full overflow-hidden pointer-events-none select-none">
        <div
          className="absolute w-[200%] h-[200%]"
          style={{
            left: leftOffset,
            top: topOffset,
          }}
        >
          {currentPuzzle.renderSvg()}
        </div>
      </div>
    );
  };

  // QUANDO A CRIANÇA TOCA NA PEÇA PARA ARRASTAR
  const handlePiecePointerDown = (pieceId: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (placedPieces.includes(pieceId)) return;
    e.stopPropagation();

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignora erro se browser não suportar captura de ponteiro
    }

    setDraggingPieceId(pieceId);
    setDragPos({ x: e.clientX, y: e.clientY });
    setHoveredSlotId(null);
    sounds.playPop();
  };

  // QUANDO A CRIANÇA SOLTA O DEDO: ENCAIXA OU VOLTA PARA A BANDEJA!
  const handlePointerUp = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (draggingPieceId === null) return;

      const pieceId = draggingPieceId;
      let targetMatched = false;

      // Checa se soltou no quadrante correspondente
      if (hoveredSlotId === pieceId) {
        targetMatched = true;
      } else {
        // Checa proximidade direta ao slot correto
        const correctSlotEl = slotRefs.current[pieceId];
        if (correctSlotEl) {
          const rect = correctSlotEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
          if (dist < Math.max(rect.width * 0.75, 75)) {
            targetMatched = true;
          }
        }
      }

      if (targetMatched) {
        // ENCAIXOU PERFEITAMENTE NO LUGAR CERTO!
        sounds.playSnap();
        const nextPlaced = [...placedPieces, pieceId];
        setPlacedPieces(nextPlaced);

        confetti({
          particleCount: 40,
          spread: 65,
          origin: {
            x: Math.max(0.1, Math.min(0.9, e.clientX / window.innerWidth)),
            y: Math.max(0.1, Math.min(0.9, e.clientY / window.innerHeight)),
          },
        });

        if (nextPlaced.length === 4) {
          sounds.playSuccess();
          confetti({
            particleCount: 110,
            spread: 90,
            origin: { y: 0.5 },
          });
        }
      } else {
        // Soltou no lugar errado ou fora: som de mola e volta suave para a bandeja
        sounds.playBoing();
      }

      setDraggingPieceId(null);
      setDragPos(null);
      setHoveredSlotId(null);
    },
    [draggingPieceId, hoveredSlotId, placedPieces]
  );

  // Listeners globais em window durante o arraste para garantir que o dedo nunca se perca
  useEffect(() => {
    if (draggingPieceId === null) return;

    const onGlobalMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });

      let foundSlot: number | null = null;
      slotRefs.current.forEach((slotEl, idx) => {
        if (!slotEl) return;
        const rect = slotEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        if (dist < Math.max(rect.width * 0.7, 70)) {
          foundSlot = idx;
        }
      });

      setHoveredSlotId(foundSlot);
    };

    const onGlobalUp = (e: PointerEvent) => {
      handlePointerUp(e);
    };

    window.addEventListener("pointermove", onGlobalMove);
    window.addEventListener("pointerup", onGlobalUp);
    window.addEventListener("pointercancel", onGlobalUp);

    return () => {
      window.removeEventListener("pointermove", onGlobalMove);
      window.removeEventListener("pointerup", onGlobalUp);
      window.removeEventListener("pointercancel", onGlobalUp);
    };
  }, [draggingPieceId, handlePointerUp]);

  // Suporte adicional a toque simples (caso uma criança de 4 anos apenas clique)
  const handleDirectClickPiece = (pieceId: number) => {
    if (placedPieces.includes(pieceId) || draggingPieceId !== null) return;
    sounds.playSnap();
    const nextPlaced = [...placedPieces, pieceId];
    setPlacedPieces(nextPlaced);

    confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });

    if (nextPlaced.length === 4) {
      sounds.playSuccess();
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    }
  };

  const handleReset = () => {
    sounds.playBoing();
    setPlacedPieces([]);
    setDraggingPieceId(null);
    setDragPos(null);
    setHoveredSlotId(null);
  };

  const handleNext = () => {
    sounds.playStar();
    setCurrentIdx((i) => (i + 1) % PUZZLES.length);
    setPlacedPieces([]);
    setDraggingPieceId(null);
    setDragPos(null);
    setHoveredSlotId(null);
  };

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden touch-none bg-gradient-to-b from-amber-100 via-sky-100 to-emerald-100">
      {/* BARRA SUPERIOR FULL-WIDTH: Seletor de Quebra-Cabeças e Reiniciar */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2.5 border-b-4 border-kids-purple shadow-md z-20 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {PUZZLES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                sounds.playPop();
                setCurrentIdx(idx);
                setPlacedPieces([]);
                setDraggingPieceId(null);
              }}
              className={`kid-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-3 sm:border-4 transition-all flex items-center gap-1.5 ${
                currentIdx === idx
                  ? "bg-kids-yellow border-amber-500 scale-105 shadow-kid-sm ring-2 sm:ring-4 ring-yellow-300"
                  : "bg-slate-50 border-slate-200 hover:bg-amber-50"
              }`}
            >
              <span className="text-2xl sm:text-4xl">{p.icon}</span>
              <span className="hidden md:inline text-sm font-black text-amber-950">
                {p.title}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-base font-black text-purple-900 bg-purple-100 px-3 py-1 rounded-full border-2 border-purple-300">
            Peças: {placedPieces.length} / 4
          </span>
          <button
            onClick={handleReset}
            className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 sm:p-2.5 rounded-2xl border-3 sm:border-4 border-slate-300 shadow-kid-sm"
            title="Recomeçar"
          >
            <RotateCcw size={22} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ÁREA CENTRAL GIGANTE: O TABULEIRO DO QUEBRA-CABEÇA OCUPANDO O PALCO */}
      <div className="relative flex-1 min-h-0 w-full p-2 sm:p-5 flex items-center justify-center overflow-hidden">
        {/* Moldura de Madeira Gigante com Aspecto de Quebra-Cabeça Real */}
        <div
          ref={boardRef}
          className="relative w-full max-w-3xl max-h-full aspect-[4/3] rounded-3xl sm:rounded-4xl overflow-hidden border-6 sm:border-8 border-amber-950 shadow-[0_16px_45px_rgba(0,0,0,0.28)] bg-amber-100/80"
        >
          {/* Fundo Guia Sutil Desbotado */}
          <div className="absolute inset-0 opacity-30 filter grayscale pointer-events-none">
            {currentPuzzle.renderSvg()}
          </div>

          {/* Grid dos 4 Quadrantes com Encaixe Interativo */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {[0, 1, 2, 3].map((slotId) => {
              const isPlaced = placedPieces.includes(slotId);
              const isTargetHovered = hoveredSlotId === slotId;
              const isDraggingMatch = draggingPieceId === slotId;

              return (
                <div
                  key={slotId}
                  ref={(el) => {
                    slotRefs.current[slotId] = el;
                  }}
                  className={`relative border-2 border-dashed border-amber-900/40 flex items-center justify-center transition-all ${
                    isPlaced
                      ? "bg-transparent scale-100"
                      : isDraggingMatch && isTargetHovered
                      ? "bg-yellow-300/70 ring-4 sm:ring-6 ring-yellow-400 scale-105 shadow-inner animate-pulse-gentle"
                      : isDraggingMatch
                      ? "bg-yellow-100/45 ring-2 ring-yellow-300 animate-pulse-gentle"
                      : "bg-white/10"
                  }`}
                >
                  {isPlaced ? (
                    <div className="absolute inset-0">
                      {renderQuadrantContent(slotId)}
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl sm:text-6xl opacity-30 select-none pointer-events-none">
                      🧩
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* VITÓRIA: O QUEBRA-CABEÇA ESTÁ COMPLETO! */}
        {isCompleted && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-7xl sm:text-9xl mb-2">{currentPuzzle.icon}</span>
            <div className="text-2xl sm:text-5xl font-black text-kids-orange mb-1">
              QUEBRA-CABEÇA COMPLETO!
            </div>
            <div className="text-sm sm:text-2xl font-bold text-slate-700 mb-5">
              Parabéns, Israel! Você montou a imagem inteirinha! ⭐
            </div>
            <button
              onClick={handleNext}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-lg sm:text-3xl px-8 sm:px-12 py-3.5 sm:py-5 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3"
            >
              <span>PRÓXIMO QUEBRA-CABEÇA!</span>
              <ArrowRight size={30} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* DOCK INFERIOR FULL-WIDTH: BANDEJA DE PEÇAS GRANDES */}
      {!isCompleted && (
        <div className="w-full bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-3 border-t-4 border-kids-teal shadow-[0_-8px_25px_rgba(0,0,0,0.12)] z-20 flex flex-col gap-1.5 flex-shrink-0">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-amber-500" size={18} />
              <span className="text-xs sm:text-base font-black text-teal-950">
                Arraste ou toque na peça para encaixar no quadro:
              </span>
            </div>
          </div>

          {/* Os 4 Blocos da Imagem na Bandeja */}
          <div className="max-w-5xl mx-auto w-full grid grid-cols-4 gap-2 sm:gap-4">
            {[0, 1, 2, 3].map((pieceId) => {
              const isPlaced = placedPieces.includes(pieceId);
              const isDraggingThis = draggingPieceId === pieceId;

              if (isPlaced) {
                return (
                  <div
                    key={pieceId}
                    className="h-20 sm:h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/60 opacity-30 flex items-center justify-center"
                  >
                    <span className="text-2xl font-black text-slate-400">✓</span>
                  </div>
                );
              }

              return (
                <div
                  key={pieceId}
                  onPointerDown={(e) => handlePiecePointerDown(pieceId, e)}
                  onClick={() => handleDirectClickPiece(pieceId)}
                  className={`kid-btn relative h-20 sm:h-28 rounded-2xl border-3 sm:border-4 overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none touch-none ${
                    isDraggingThis
                      ? "opacity-30 border-dashed border-amber-500 scale-95"
                      : "border-amber-600 bg-white shadow-kid-sm hover:scale-105 active:scale-95"
                  }`}
                >
                  {renderQuadrantContent(pieceId)}
                  {/* Puxador visual fofo */}
                  <div className="absolute bottom-1 right-1 bg-amber-400/90 text-amber-950 text-xs font-black px-1.5 py-0.5 rounded-lg shadow">
                    ✋
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PEÇA FLUTUANTE SOB O DEDO DA CRIANÇA ENQUANTO ARRASTA */}
      {draggingPieceId !== null && dragPos !== null && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 w-36 h-28 sm:w-48 sm:h-36 rounded-2xl border-4 border-amber-500 shadow-2xl overflow-hidden bg-white scale-110 rotate-3 transition-transform duration-75"
          style={{
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
          }}
        >
          {renderQuadrantContent(draggingPieceId)}
          <div className="absolute inset-0 ring-4 ring-yellow-400 rounded-2xl pointer-events-none" />
        </div>
      )}
    </div>
  );
}
