"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { RotateCcw, ArrowRight, Eye } from "lucide-react";

interface AnimalPair {
  speciesId: string;
  name: string;
  emoji: string;
  sound: () => void;
}

const PAIRS_CONFIG: AnimalPair[] = [
  { speciesId: "lion", name: "Leão", emoji: "🦁", sound: () => sounds.playBoing() },
  { speciesId: "elephant", name: "Elefante", emoji: "🐘", sound: () => sounds.playHonk() },
  { speciesId: "giraffe", name: "Girafa", emoji: "🦒", sound: () => sounds.playStar() },
  { speciesId: "sheep", name: "Ovelha", emoji: "🐑", sound: () => sounds.playPop() },
];

interface MemoryCard {
  id: number;
  speciesId: string;
  emoji: string;
  name: string;
}

export function ArkAnimalsGame() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedSpecies, setMatchedSpecies] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isPeekingAll, setIsPeekingAll] = useState(false);

  // Animação dos bichinhos marchando pela rampa até a porta
  const [walkingSpecies, setWalkingSpecies] = useState<{
    speciesId: string;
    emoji: string;
    step: "start" | "walking" | "entering";
  } | null>(null);

  // Animais que já estão dentro da arca (espiando pelas janelas)
  const [boardedSpecies, setBoardedSpecies] = useState<string[]>([]);

  function generateDeck(): MemoryCard[] {
    const list: MemoryCard[] = [];
    let counter = 1;
    PAIRS_CONFIG.forEach((pair) => {
      // 2 cartas de cada espécie para formar o par
      for (let i = 0; i < 2; i++) {
        list.push({
          id: counter++,
          speciesId: pair.speciesId,
          emoji: pair.emoji,
          name: pair.name,
        });
      }
    });
    // Embaralha aleatoriamente
    return list.sort(() => 0.5 - Math.random());
  }

  const startNewGame = React.useCallback(() => {
    const newCards = generateDeck();
    setCards(newCards);
    setFlippedIds([]);
    setMatchedSpecies([]);
    setBoardedSpecies([]);
    setWalkingSpecies(null);
    setIsLocked(false);

    // Breve "espiada" mágica no início para o Israel ver onde estão (1.5 segundos)
    setIsPeekingAll(true);
    setTimeout(() => {
      setIsPeekingAll(false);
    }, 1600);
  }, []);

  // Inicia o jogo com as cartas embaralhadas
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleCardClick = (card: MemoryCard) => {
    if (isLocked || isPeekingAll || walkingSpecies) return;

    // Se já está combinada ou já está virada, ignora
    if (matchedSpecies.includes(card.speciesId) || flippedIds.includes(card.id)) {
      return;
    }

    const pairCfg = PAIRS_CONFIG.find((p) => p.speciesId === card.speciesId);
    pairCfg?.sound();

    // Vira a primeira carta
    if (flippedIds.length === 0) {
      setFlippedIds([card.id]);
      sounds.playPop();
      return;
    }

    // Vira a segunda carta
    if (flippedIds.length === 1) {
      const firstCardId = flippedIds[0];
      if (firstCardId === card.id) return;

      const firstCard = cards.find((c) => c.id === firstCardId);
      if (!firstCard) return;

      setFlippedIds([firstCardId, card.id]);

      // CHECA SE FORMOU O PAR DE MEMÓRIA!
      if (firstCard.speciesId === card.speciesId) {
        // PAR ENCONTRADO!
        sounds.playSuccess();
        setMatchedSpecies((prev) => [...prev, card.speciesId]);
        setFlippedIds([]);

        // Animação da caminhada 2 a 2 subindo a rampa da Arca!
        setWalkingSpecies({
          speciesId: card.speciesId,
          emoji: card.emoji,
          step: "start",
        });

        // Passo 1: Sobem a rampa
        setTimeout(() => {
          setWalkingSpecies((prev) => (prev ? { ...prev, step: "walking" } : null));
          sounds.playBoing();
        }, 150);

        // Passo 2: Entram pela porta da Arca
        setTimeout(() => {
          setWalkingSpecies((prev) => (prev ? { ...prev, step: "entering" } : null));
          sounds.playSnap();
          confetti({ particleCount: 50, spread: 65, origin: { y: 0.5 } });
        }, 900);

        // Passo 3: Aparecem felizes nas janelas da Arca
        setTimeout(() => {
          setWalkingSpecies(null);
          setBoardedSpecies((prev) => [...prev, card.emoji]);
        }, 1400);
      } else {
        // NÃO COMBINOU: Dá tempo para a criança memorizar e desvira suavemente
        sounds.playBoing();
        setIsLocked(true);
        setTimeout(() => {
          setFlippedIds([]);
          setIsLocked(false);
        }, 1100);
      }
    }
  };

  const handlePeek = () => {
    if (isPeekingAll || isLocked) return;
    sounds.playStar();
    setIsPeekingAll(true);
    setTimeout(() => {
      setIsPeekingAll(false);
    }, 1500);
  };

  const isAllBoarded = matchedSpecies.length === PAIRS_CONFIG.length;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Placar e Botões */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-teal shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-2 bg-teal-100 border-2 border-teal-400 px-4 py-1.5 rounded-2xl shadow-inner">
          <span className="text-3xl animate-bounce">🛳️</span>
          <span className="text-xl sm:text-2xl font-black text-teal-900">
            Pares na Arca: {matchedSpecies.length} / {PAIRS_CONFIG.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Espiar as cartas */}
          <button
            onClick={handlePeek}
            disabled={isPeekingAll || isAllBoarded}
            className="kid-btn bg-yellow-300 hover:bg-yellow-400 text-amber-950 px-3 py-2 rounded-2xl border-4 border-amber-500 shadow-kid font-black text-sm flex items-center gap-1.5"
            title="Espiar cartas"
          >
            <Eye size={20} className="stroke-[2.5]" />
            <span className="hidden sm:inline">ESPIAR</span>
          </button>

          <button
            onClick={() => {
              sounds.playBoing();
              startNewGame();
            }}
            className="kid-btn bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 sm:p-3 rounded-2xl border-4 border-slate-300 shadow-kid"
            title="Recomeçar"
          >
            <RotateCcw size={24} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* CENÁRIO: A GRANDE ARCA DE NOÉ COM RAMPA DE EMBARQUE */}
      <div className="relative flex-1 min-h-0 w-full my-1 sm:my-2 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-300 rounded-3xl sm:rounded-4xl border-6 sm:border-8 border-kids-green shadow-2xl p-1.5 sm:p-4 flex flex-col items-center justify-center overflow-hidden">
        {/* Arco-íris de Deus e Pombinha */}
        <div className="absolute top-2 text-5xl sm:text-7xl opacity-85 animate-float pointer-events-none">
          🌈
        </div>
        <div className="absolute top-6 right-6 text-3xl sm:text-4xl animate-bounce pointer-events-none">
          🕊️
        </div>

        {/* ESTRUTURA VISUAL DA ARCA DE NOÉ */}
        <div className="relative w-full max-w-sm sm:max-w-lg aspect-[16/11] flex items-center justify-center">
          {/* Ilustração SVG de alta fidelidade da Arca */}
          <svg viewBox="0 0 500 360" className="w-full h-full drop-shadow-2xl">
            {/* Ondas do mar azul sob a arca */}
            <path
              d="M 10 270 Q 70 250 130 270 T 250 270 T 370 270 T 490 270 L 490 350 L 10 350 Z"
              fill="#0284C7"
              opacity="0.85"
            />
            <path
              d="M 0 285 Q 60 270 120 285 T 240 285 T 360 285 T 480 285 L 500 360 L 0 360 Z"
              fill="#0369A1"
            />

            {/* Casco Gigante da Arca de Madeira */}
            <path
              d="M 60 170 L 110 280 Q 250 300 390 280 L 440 170 Z"
              fill="#92400E"
              stroke="#451A03"
              strokeWidth="8"
            />
            {/* Tábuas e Frisos da Arca */}
            <path d="M 80 205 Q 250 225 420 205" stroke="#78350F" strokeWidth="5" fill="none" />
            <path d="M 95 240 Q 250 260 405 240" stroke="#78350F" strokeWidth="5" fill="none" />
            <path d="M 115 270 Q 250 285 385 270" stroke="#78350F" strokeWidth="4" fill="none" />

            {/* Cabine da Arca (Andar Superior) */}
            <rect
              x="160"
              y="100"
              width="180"
              height="75"
              rx="12"
              fill="#D97706"
              stroke="#451A03"
              strokeWidth="7"
            />

            {/* Telhado Vermelho Triangular */}
            <polygon
              points="140,105 250,45 360,105"
              fill="#DC2626"
              stroke="#451A03"
              strokeWidth="7"
            />

            {/* Noé comemorando no telhado */}
            <text x="235" y="42" fontSize="36" textAnchor="middle">
              🧔
            </text>

            {/* Janelas onde os animais que embarcaram aparecem */}
            <rect x="180" y="115" width="40" height="40" rx="10" fill="#FEF3C7" stroke="#451A03" strokeWidth="4" />
            <rect x="280" y="115" width="40" height="40" rx="10" fill="#FEF3C7" stroke="#451A03" strokeWidth="4" />

            {/* A Porta de Entrada da Arca */}
            <path
              d="M 220 170 A 30 30 0 0 1 280 170 L 280 235 L 220 235 Z"
              fill="#451A03"
              stroke="#291001"
              strokeWidth="4"
            />

            {/* A Rampa de Madeira de Entrada */}
            <polygon
              points="215,235 285,235 340,330 160,330"
              fill="#DEB887"
              stroke="#78350F"
              strokeWidth="5"
            />
            {/* Degraus da rampa */}
            <line x1="205" y1="255" x2="295" y2="255" stroke="#78350F" strokeWidth="3" />
            <line x1="190" y1="280" x2="310" y2="280" stroke="#78350F" strokeWidth="3" />
            <line x1="175" y1="305" x2="325" y2="305" stroke="#78350F" strokeWidth="3" />
          </svg>

          {/* ANIMAÇÃO: OS 2 BICHINHOS MARCHANDO PELA RAMPA E ENTRANDO NA ARCA */}
          {walkingSpecies && (
            <div
              className={`absolute z-30 flex items-center justify-center gap-2 transition-all duration-700 ease-in-out ${
                walkingSpecies.step === "start"
                  ? "bottom-4 left-1/2 -translate-x-1/2 scale-110 opacity-100"
                  : walkingSpecies.step === "walking"
                  ? "bottom-24 left-1/2 -translate-x-1/2 scale-100 opacity-100 animate-bounce"
                  : "bottom-36 left-1/2 -translate-x-1/2 scale-50 opacity-0"
              }`}
            >
              <div className="flex gap-2 p-2 bg-yellow-300/90 rounded-full border-4 border-amber-500 shadow-2xl animate-wiggle">
                <span className="text-4xl sm:text-5xl">{walkingSpecies.emoji}</span>
                <span className="text-4xl sm:text-5xl">{walkingSpecies.emoji}</span>
              </div>
            </div>
          )}

          {/* OS ANIMAIS QUE JÁ EMBARCARAM ESPIANDO PELAS JANELAS DA ARCA */}
          <div className="absolute top-[34%] left-1/2 -translate-x-1/2 flex items-center justify-center gap-8 pointer-events-none">
            {boardedSpecies.slice(0, 2).map((em, idx) => (
              <span key={idx} className="text-3xl sm:text-4xl animate-wiggle">
                {em}
              </span>
            ))}
          </div>
          {boardedSpecies.length > 2 && (
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 flex items-center justify-center gap-14 pointer-events-none">
              {boardedSpecies.slice(2, 4).map((em, idx) => (
                <span key={idx} className="text-2xl sm:text-3xl animate-bounce">
                  {em}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* TELA DE VITÓRIA: TODOS OS PARES NA ARCA */}
        {isAllBoarded && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-40 flex flex-col items-center justify-center animate-bounce p-4 text-center">
            <span className="text-8xl mb-2">🛳️🌈✨</span>
            <div className="text-3xl sm:text-5xl font-black text-kids-teal mb-2">
              TODOS OS PARES NA ARCA!
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-700 mb-6">
              Parabéns, Israel! Você encontrou todos os pares de bichinhos! ⭐
            </div>
            <button
              onClick={() => {
                sounds.playStar();
                startNewGame();
              }}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-2xl sm:text-3xl px-8 sm:px-12 py-4 sm:py-5 rounded-4xl border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3 animate-pulse-gentle"
            >
              <span>JOGAR DE NOVO!</span>
              <ArrowRight size={36} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* JOGO DA MEMÓRIA: CARTAS ESPALHADAS NO GRAMADO */}
      <div className="w-full bg-white/95 backdrop-blur-md p-1.5 sm:p-3 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-yellow shadow-kid z-20 flex-shrink-0">
        <p className="text-center font-black text-[11px] sm:text-sm text-amber-900 mb-1 flex items-center justify-center gap-1">
          <span>🧠</span>
          <span>Jogo da Memória: Encontre o par de cada bichinho!</span>
        </p>

        {/* Grade 4x2 com as cartas viradas para baixo */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {cards.map((card) => {
            const isMatched = matchedSpecies.includes(card.speciesId);
            const isFlipped = flippedIds.includes(card.id) || isPeekingAll || isMatched;

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card)}
                disabled={isMatched || isLocked}
                className={`kid-btn relative p-1 sm:p-2 rounded-2xl border-4 flex flex-col items-center justify-center aspect-square transition-all duration-300 ${
                  isMatched
                    ? "bg-emerald-100 border-emerald-500 shadow-inner scale-95"
                    : isFlipped
                    ? "bg-kids-yellow border-amber-500 scale-105 shadow-kid-lg ring-4 ring-yellow-400"
                    : "bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-amber-950 shadow-kid active:scale-95"
                }`}
              >
                {isFlipped ? (
                  // FRENTE DA CARTA (REVELADA)
                  <div className="flex flex-col items-center justify-center animate-wiggle">
                    <span className="text-4xl sm:text-5xl drop-shadow">{card.emoji}</span>
                    {isMatched && (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-200 px-2 py-0.2 rounded-full mt-0.5 border border-emerald-400">
                        PAR! ✓
                      </span>
                    )}
                  </div>
                ) : (
                  // VERSO DA CARTA (VIRADA PARA BAIXO)
                  <div className="flex flex-col items-center justify-center text-amber-200/90">
                    <span className="text-2xl sm:text-3xl drop-shadow">🛳️</span>
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 tracking-wider">
                      ?
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
