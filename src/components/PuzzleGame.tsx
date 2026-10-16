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
    id: "ark",
    title: "A Arca de Noé",
    icon: "🛳️",
    renderSvg: (className = "w-full h-full") => (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Céu azul suave com arco-íris */}
        <rect width="400" height="200" fill="#BAE6FD" />
        <path d="M 40 200 A 160 160 0 0 1 360 200" stroke="#F87171" strokeWidth="16" fill="none" />
        <path d="M 54 200 A 146 146 0 0 1 346 200" stroke="#FBBF24" strokeWidth="14" fill="none" />
        <path d="M 68 200 A 132 132 0 0 1 332 200" stroke="#34D399" strokeWidth="14" fill="none" />
        {/* Sol sorridente */}
        <circle cx="65" cy="55" r="32" fill="#F59E0B" />
        <circle cx="58" cy="50" r="4" fill="#78350F" />
        <circle cx="72" cy="50" r="4" fill="#78350F" />
        <path d="M 60 62 Q 65 68 70 62" stroke="#78350F" strokeWidth="3" fill="none" />
        {/* Casco da Arca */}
        <path d="M 60 170 L 100 240 Q 200 255 300 240 L 340 170 Z" fill="#92400E" stroke="#451A03" strokeWidth="6" />
        <path d="M 75 195 Q 200 215 325 195" stroke="#78350F" strokeWidth="4" fill="none" />
        {/* Cabine com telhado */}
        <rect x="135" y="115" width="130" height="60" rx="8" fill="#D97706" stroke="#451A03" strokeWidth="5" />
        <polygon points="115,120 200,75 285,120" fill="#DC2626" stroke="#451A03" strokeWidth="5" />
        {/* Animais na Arca */}
        <text x="145" y="152" fontSize="28">🦒</text>
        <text x="215" y="152" fontSize="28">🐘</text>
        <text x="90" y="178" fontSize="30">🧔</text>
        <text x="275" y="178" fontSize="30">🦁</text>
        {/* Mar azul com ondas */}
        <path d="M 0 220 Q 50 205 100 220 T 200 220 T 300 220 T 400 220 L 400 300 L 0 300 Z" fill="#0284C7" />
        <path d="M 0 245 Q 60 230 120 245 T 240 245 T 360 245 T 480 245 L 480 300 L 0 300 Z" fill="#0369A1" />
      </svg>
    ),
  },
  {
    id: "dino",
    title: "Dino Rex no Parque",
    icon: "🦖",
    renderSvg: (className = "w-full h-full") => (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Céu ensolarado e colinas verdes */}
        <rect width="400" height="200" fill="#FEF08A" />
        <circle cx="340" cy="50" r="34" fill="#F59E0B" />
        <rect y="200" width="400" height="100" fill="#4ADE80" />
        <path d="M 0 200 Q 100 170 200 200 T 400 200 L 400 300 L 0 300 Z" fill="#22C55E" />
        {/* Corpo do Dino T-Rex */}
        <path
          d="M 140 140 C 120 85 190 45 250 65 C 285 80 295 115 275 135 C 310 150 330 205 295 245 C 245 285 170 265 145 225 C 105 230 65 210 70 175 C 85 170 120 160 140 140 Z"
          fill="#10B981"
          stroke="#065F46"
          strokeWidth="6"
        />
        {/* Olhinho feliz do Dino */}
        <circle cx="255" cy="95" r="10" fill="#FFFFFF" stroke="#065F46" strokeWidth="3" />
        <circle cx="257" cy="95" r="5" fill="#1E293B" />
        {/* Sorriso do Dino */}
        <path d="M 260 115 Q 275 125 272 105" stroke="#065F46" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Espinhos amigáveis nas costas */}
        <polygon points="205,65 215,45 225,67" fill="#F59E0B" />
        <polygon points="175,75 185,55 195,77" fill="#F59E0B" />
        <polygon points="150,95 160,75 170,97" fill="#F59E0B" />
        {/* Maçã e Flores no chão */}
        <circle cx="295" cy="170" r="16" fill="#EF4444" stroke="#7F1D1D" strokeWidth="3" />
        <text x="75" y="270" fontSize="32">🌸</text>
        <text x="315" y="270" fontSize="32">🌺</text>
      </svg>
    ),
  },
  {
    id: "fire",
    title: "Caminhão de Bombeiros",
    icon: "🚒",
    renderSvg: (className = "w-full h-full") => (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Cidade e Estrada */}
        <rect width="400" height="190" fill="#BAE6FD" />
        <rect y="190" width="400" height="110" fill="#64748B" />
        {/* Prédio no fundo */}
        <rect x="40" y="45" width="70" height="145" fill="#CBD5E1" stroke="#475569" strokeWidth="4" />
        <rect x="52" y="60" width="16" height="18" fill="#FEF08A" />
        <rect x="78" y="60" width="16" height="18" fill="#FEF08A" />
        <rect x="52" y="90" width="16" height="18" fill="#FEF08A" />
        <rect x="78" y="90" width="16" height="18" fill="#FEF08A" />
        {/* Corpo do Caminhão de Bombeiros */}
        <path d="M 70 190 L 70 110 Q 70 95 90 95 L 170 95 L 170 190 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="6" />
        <rect x="170" y="95" width="175" height="95" rx="10" fill="#DC2626" stroke="#7F1D1D" strokeWidth="6" />
        {/* Para-brisa e Bombeirinho */}
        <rect x="88" y="110" width="62" height="42" rx="6" fill="#E0F2FE" stroke="#7F1D1D" strokeWidth="4" />
        <text x="100" y="142" fontSize="28">👨‍🚒</text>
        {/* Escada Telescópica */}
        <rect x="180" y="70" width="145" height="18" rx="4" fill="#E2E8F0" stroke="#475569" strokeWidth="3" />
        {/* Giroflex piscando */}
        <polygon points="105,95 115,80 125,95" fill="#38BDF8" />
        {/* Rodas pretas gigantes com calotas */}
        <circle cx="118" cy="195" r="28" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
        <circle cx="118" cy="195" r="12" fill="#94A3B8" />
        <circle cx="235" cy="195" r="28" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
        <circle cx="235" cy="195" r="12" fill="#94A3B8" />
        <circle cx="295" cy="195" r="28" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
        <circle cx="295" cy="195" r="12" fill="#94A3B8" />
      </svg>
    ),
  },
  {
    id: "safari",
    title: "Jipe do Safári",
    icon: "🚙",
    renderSvg: (className = "w-full h-full") => (
      <svg viewBox="0 0 400 300" className={className}>
        {/* Savana e Céu */}
        <rect width="400" height="190" fill="#FDE68A" />
        <rect y="190" width="400" height="110" fill="#A16207" />
        <circle cx="330" cy="55" r="30" fill="#F59E0B" />
        {/* Árvore Acácia */}
        <path d="M 50 190 Q 60 120 75 100 Q 110 80 130 95 Q 110 110 85 130 Q 75 160 70 190 Z" fill="#78350F" />
        <ellipse cx="100" cy="85" rx="45" ry="18" fill="#15803D" />
        {/* Jipe */}
        <rect x="110" y="100" width="180" height="90" rx="14" fill="#D97706" stroke="#78350F" strokeWidth="6" />
        <rect x="130" y="110" width="60" height="40" rx="6" fill="#BAE6FD" stroke="#78350F" strokeWidth="3" />
        <text x="142" y="140" fontSize="26">🦁</text>
        <text x="210" y="140" fontSize="28">🧔</text>
        {/* Rodas grandes */}
        <circle cx="160" cy="195" r="26" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
        <circle cx="250" cy="195" r="26" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
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
