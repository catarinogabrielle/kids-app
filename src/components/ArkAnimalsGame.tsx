"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { GameHeader } from "@/components/TopBar";
import { RotateCcw, ArrowRight, Eye } from "lucide-react";

interface AnimalPair {
  speciesId: string;
  name: string;
  emoji: string;
  sound: () => void;
}

const PAIRS_CONFIG: AnimalPair[] = [
  { speciesId: "lion", name: "Leão", emoji: "🦁", sound: () => sounds.playAnimalSound("lion") },
  { speciesId: "elephant", name: "Elefante", emoji: "🐘", sound: () => sounds.playAnimalSound("elephant") },
  { speciesId: "giraffe", name: "Girafa", emoji: "🦒", sound: () => sounds.playAnimalSound("giraffe") },
  { speciesId: "sheep", name: "Ovelha", emoji: "🐑", sound: () => sounds.playAnimalSound("sheep") },
];

interface MemoryCard {
  id: number;
  speciesId: string;
  emoji: string;
  name: string;
}

export function ArkAnimalsGame({ onHome }: { onHome?: () => void }) {
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
    <div className="flex flex-col w-full h-full select-none overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-400">
      <GameHeader
        onHome={onHome}
        title="Arca de Noé"
        icon="🛳️"
        hideTitleOnMobile={true}
        leftControls={
          <div className="flex items-center gap-1 bg-white/95 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-xl border border-amber-400 shadow-sm flex-shrink-0">
            <span className="text-sm sm:text-xl">🛳️</span>
            <span className="text-[11px] sm:text-sm font-black text-amber-950">
              <span className="hidden sm:inline">Pares: </span>{matchedSpecies.length}/{PAIRS_CONFIG.length}
            </span>
          </div>
        }
        rightControls={
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <button
              onClick={handlePeek}
              disabled={isPeekingAll || isAllBoarded}
              className="kid-btn kid-btn-yellow p-1.5 sm:px-4 sm:py-2 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1.5"
              title="Espiar cartas"
            >
              <div className="toy-gloss" />
              <Eye size={15} className="stroke-[2.5]" />
              <span className="hidden sm:inline">ESPIAR</span>
            </button>
            <button
              onClick={() => {
                sounds.playBoing();
                startNewGame();
              }}
              className="kid-btn kid-btn-white p-1.5 sm:p-2 rounded-xl border-2"
              title="Recomeçar"
            >
              <div className="toy-gloss" />
              <RotateCcw size={15} className="stroke-[2.5]" />
            </button>
          </div>
        }
      />
      {/* PALCO SUPERIOR FULL-SCREEN: A GRANDE ARCA DE NOÉ COM HUD FLUTUANTE */}
      <div className="relative flex-1 min-h-0 w-full p-2 sm:p-4 landscape:p-1 flex flex-col items-center justify-end overflow-hidden">
        {/* Arco-íris de Deus e Pombinha */}
        <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 text-4xl sm:text-7xl opacity-85 pointer-events-none landscape:hidden">
          🌈
        </div>
        <div className="absolute top-12 sm:top-16 right-6 sm:right-8 text-2xl sm:text-5xl pointer-events-none landscape:hidden">
          🕊️
        </div>

        {/* ESTRUTURA VISUAL GIGANTE DA ARCA DE NOÉ */}
        <div className="relative w-full max-w-2xl md:max-w-4xl lg:max-w-5xl h-full max-h-[52vh] sm:max-h-[62vh] flex items-center justify-center">
          {/* Ilustração SVG de alta fidelidade da Arca */}
          <svg
            viewBox="0 0 500 360"
            preserveAspectRatio="xMidYMax meet"
            className="w-full h-full drop-shadow-2xl overflow-visible"
          >
            {/* Ondas do mar azul estendidas até as bordas da tela */}
            <path
              d="M -600 270 Q -400 250 -200 270 T 200 270 T 600 270 T 1000 270 L 1200 400 L -600 400 Z"
              fill="#0284C7"
              opacity="0.85"
            />
            <path
              d="M -600 290 Q -400 272 -200 290 T 200 290 T 600 290 T 1000 290 L 1200 420 L -600 420 Z"
              fill="#0369A1"
            />

            {/* Casco Gigante da Arca de Madeira */}
            <path
              d="M 45 165 L 100 285 Q 250 308 400 285 L 455 165 Z"
              fill="#92400E"
              stroke="#451A03"
              strokeWidth="8"
            />
            {/* Tábuas e Frisos da Arca */}
            <path d="M 68 202 Q 250 225 432 202" stroke="#78350F" strokeWidth="5" fill="none" />
            <path d="M 85 240 Q 250 262 415 240" stroke="#78350F" strokeWidth="5" fill="none" />
            <path d="M 105 272 Q 250 288 395 272" stroke="#78350F" strokeWidth="4" fill="none" />

            {/* Cabine da Arca (Andar Superior) */}
            <rect
              x="145"
              y="92"
              width="210"
              height="78"
              rx="14"
              fill="#D97706"
              stroke="#451A03"
              strokeWidth="7"
            />

            {/* Telhado Vermelho Triangular */}
            <polygon
              points="125,98 250,35 375,98"
              fill="#DC2626"
              stroke="#451A03"
              strokeWidth="7"
            />

            {/* Noé comemorando no telhado */}
            <text x="250" y="34" fontSize="38" textAnchor="middle">
              🧔
            </text>

            {/* Janelas onde os animais que embarcaram aparecem */}
            <rect x="168" y="108" width="46" height="46" rx="10" fill="#FEF3C7" stroke="#451A03" strokeWidth="4" />
            <rect x="286" y="108" width="46" height="46" rx="10" fill="#FEF3C7" stroke="#451A03" strokeWidth="4" />

            {/* A Porta de Entrada da Arca */}
            <path
              d="M 218 165 A 32 32 0 0 1 282 165 L 282 235 L 218 235 Z"
              fill="#451A03"
              stroke="#291001"
              strokeWidth="4"
            />

            {/* A Rampa de Madeira de Entrada */}
            <polygon
              points="212,235 288,235 348,340 152,340"
              fill="#DEB887"
              stroke="#78350F"
              strokeWidth="5"
            />
            {/* Degraus da rampa */}
            <line x1="202" y1="258" x2="298" y2="258" stroke="#78350F" strokeWidth="3" />
            <line x1="185" y1="285" x2="315" y2="285" stroke="#78350F" strokeWidth="3" />
            <line x1="168" y1="312" x2="332" y2="312" stroke="#78350F" strokeWidth="3" />
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
              <div className="flex gap-2 p-2 bg-yellow-300/95 rounded-full border-4 border-amber-500 shadow-2xl animate-wiggle">
                <span className="text-4xl sm:text-6xl">{walkingSpecies.emoji}</span>
                <span className="text-4xl sm:text-6xl">{walkingSpecies.emoji}</span>
              </div>
            </div>
          )}

          {/* OS ANIMAIS QUE JÁ EMBARCARAM ESPIANDO PELAS JANELAS DA ARCA */}
          <div className="absolute top-[32%] left-1/2 -translate-x-1/2 flex items-center justify-center gap-10 pointer-events-none">
            {boardedSpecies.slice(0, 2).map((em, idx) => (
              <span key={idx} className="text-3xl sm:text-5xl animate-wiggle">
                {em}
              </span>
            ))}
          </div>
          {boardedSpecies.length > 2 && (
            <div className="absolute top-[48%] left-1/2 -translate-x-1/2 flex items-center justify-center gap-16 pointer-events-none">
              {boardedSpecies.slice(2, 4).map((em, idx) => (
                <span key={idx} className="text-2xl sm:text-4xl">
                  {em}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* TELA DE VITÓRIA: TODOS OS PARES NA ARCA */}
        {isAllBoarded && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-7xl sm:text-9xl mb-2">🛳️🌈✨</span>
            <div className="text-3xl sm:text-5xl font-black text-kids-teal mb-2">
              TODOS OS PARES NA ARCA!
            </div>
            <div className="text-base sm:text-2xl font-bold text-slate-700 mb-6">
              Parabéns, Israel! Você encontrou todos os pares de bichinhos! ⭐
            </div>
            <button
              onClick={() => {
                sounds.playStar();
                startNewGame();
              }}
              className="kid-btn bg-kids-green hover:bg-emerald-500 text-white font-black text-xl sm:text-3xl px-8 sm:px-12 py-4 sm:py-5 rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-emerald-700 shadow-kid-lg flex items-center gap-3"
            >
              <span>JOGAR DE NOVO!</span>
              <ArrowRight size={30} className="stroke-[3]" />
            </button>
          </div>
        )}
      </div>

      {/* DOCK INFERIOR: JOGO DA MEMÓRIA COM CARTAS EM PROPORÇÃO DE BARALHO (ASPECT RATIO 4:5) */}
      <div className="w-full bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-3.5 landscape:py-1.5 border-t-3 sm:border-t-4 border-kids-yellow shadow-[0_-8px_25px_rgba(0,0,0,0.12)] z-20 flex-shrink-0">
        <div className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto w-full flex flex-col gap-1 sm:gap-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm sm:text-base">🧠</span>
            <span className="font-black text-xs sm:text-sm text-amber-950">
              Toque nas cartas para encontrar os pares de bichinhos:
            </span>
          </div>

          {/* Grade 4x2 com cartas verticais perfeitas (aspect-[4/5]), com efeito Flip 3D */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3.5 md:gap-5 justify-items-center perspective-1000">
            {cards.map((card) => {
              const isMatched = matchedSpecies.includes(card.speciesId);
              const isFlipped = flippedIds.includes(card.id) || isPeekingAll || isMatched;

              return (
                <motion.button
                  key={card.id}
                  whileHover={{ scale: isMatched ? 0.95 : 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  onClick={() => handleCardClick(card)}
                  disabled={isMatched || isLocked}
                  className="relative w-full max-w-[125px] sm:max-w-[150px] aspect-[4/5] max-h-[140px] sm:max-h-[175px] landscape:max-h-[85px] cursor-pointer"
                >
                  <div
                    className={`w-full h-full relative transition-transform duration-300 preserve-3d ${
                      isFlipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* VERSO DA CARTA (VIRADA PARA BAIXO) */}
                    <div className="absolute inset-0 backface-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-2 sm:border-4 border-amber-950 shadow-toy-sm flex flex-col items-center justify-center p-1 text-amber-200/90 overflow-hidden">
                      <div className="toy-gloss" />
                      <span className="text-xl sm:text-3xl md:text-4xl drop-shadow">🛳️</span>
                      <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wider mt-0.5">
                        ?
                      </span>
                    </div>

                    {/* FRENTE DA CARTA (REVELADA) */}
                    <div
                      className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl sm:rounded-2xl border-2 sm:border-4 flex flex-col items-center justify-center p-1 overflow-hidden transition-all duration-200 ${
                        isMatched
                          ? "bg-gradient-to-b from-emerald-100 to-emerald-200 border-emerald-600 shadow-inner scale-95 opacity-85"
                          : "bg-gradient-to-b from-amber-50 to-amber-100 border-amber-500 shadow-toy ring-2 sm:ring-4 ring-yellow-400"
                      }`}
                    >
                      <div className="toy-gloss" />
                      <span className="text-2xl sm:text-4xl md:text-5xl drop-shadow animate-wiggle select-none">
                        {card.emoji}
                      </span>
                      <span className="text-[10px] sm:text-xs font-black text-amber-950 mt-0.5 tracking-tight uppercase">
                        {card.name}
                      </span>
                      {isMatched && (
                        <span className="text-[8px] sm:text-[10px] font-black text-emerald-950 bg-emerald-400 px-1.5 py-0.5 rounded-full mt-0.5 border border-emerald-600 shadow-xs">
                          PAR! ✓
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
