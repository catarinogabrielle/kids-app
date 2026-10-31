"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { Zap, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { GameHeader } from "@/components/TopBar";

type VehicleId = "safari" | "chariot" | "fire" | "dino";

interface TrackItem {
  id: number;
  type: "star" | "animal" | "scroll" | "turbo" | "ramp" | "puddle";
  lane: 0 | 1 | 2; // 0 = Esquerda, 1 = Centro, 2 = Direita
  progress: number; // 0.0 (horizonte) a 1.05 (passou do carro)
  emoji?: string;
  name?: string;
}

interface Spectator {
  id: number;
  emoji: string;
  side: "left" | "right";
  y: number; // 24% a 95%
  isBouncing?: boolean;
}

export function CarTrackGame({ onHome }: { onHome?: () => void }) {
  const [vehicle, setVehicle] = useState<VehicleId>("safari");
  const [carLane, setCarLane] = useState<0 | 1 | 2>(1); // Pista atual: Centro
  const [carX, setCarX] = useState<number>(50); // Posição suave X (25 a 75)
  const [carTilt, setCarTilt] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [rescuedAnimals, setRescuedAnimals] = useState<string[]>([]);
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  const [isTurboActive, setIsTurboActive] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isSplashing, setIsSplashing] = useState<boolean>(false);
  const [roadCurve, setRoadCurve] = useState<number>(0); // Curvatura da estrada (-20 a 20)
  const [dashOffset, setDashOffset] = useState<number>(0); // Para animação contínua das faixas

  const [items, setItems] = useState<TrackItem[]>([]);
  const [spectators, setSpectators] = useState<Spectator[]>([
    { id: 1, emoji: "🦁", side: "left", y: 35 },
    { id: 2, emoji: "🐑", side: "right", y: 48 },
    { id: 3, emoji: "🦒", side: "left", y: 62 },
    { id: 4, emoji: "🐪", side: "right", y: 75 },
    { id: 5, emoji: "🐰", side: "left", y: 88 },
  ]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const itemCounterRef = useRef<number>(0);
  const carXRef = useRef<number>(50);
  const targetXRef = useRef<number>(50);
  const isDraggingRef = useRef<boolean>(false);

  const vehicles = [
    { id: "safari" as const, name: "Jipe do Noé", icon: "🚙", label: "Noé & Leãozinho" },
    { id: "chariot" as const, name: "Carruagem de Fogo", icon: "🔥", label: "Profeta Elias" },
    { id: "fire" as const, name: "Bombeiro Herói", icon: "🚒", label: "Caminhão Salvador" },
    { id: "dino" as const, name: "Dino Veloz", icon: "🦖", label: "T-Rex Piloto" },
  ];

  // Coordenada X ideal de cada faixa (0, 1, 2) perfeitamente alinhada com as faixas do asfalto
  const getLaneXAtProgress = useCallback((lane: 0 | 1 | 2, p: number, curve: number) => {
    // Curvatura linear idêntica à do SVG da pista (nunca deixa itens saírem da estrada!)
    const center = 50 + (curve * 0.85) * (1 - p);
    // Largura da pista varia de 26% no horizonte a 76% no rodapé
    const roadWidth = 26 + p * 50;
    // Espaçamento de 32% garante alinhamento exato no centro de cada uma das 3 faixas
    const laneSpacing = roadWidth * 0.32;
    return center + (lane - 1) * laneSpacing;
  }, []);

  // Altera faixa pelo teclado ou botões
  const switchLane = useCallback(
    (newLane: 0 | 1 | 2) => {
      setCarLane(newLane);
      sounds.playPop();
      const target = getLaneXAtProgress(newLane, 0.74, roadCurve);
      targetXRef.current = target;
      setCarTilt(newLane < carLane ? -12 : newLane > carLane ? 12 : 0);
      setTimeout(() => setCarTilt(0), 220);
    },
    [carLane, getLaneXAtProgress, roadCurve]
  );

  const steerLeft = useCallback(() => {
    if (carLane > 0) switchLane((carLane - 1) as 0 | 1 | 2);
  }, [carLane, switchLane]);

  const steerRight = useCallback(() => {
    if (carLane < 2) switchLane((carLane + 1) as 0 | 1 | 2);
  }, [carLane, switchLane]);

  // Ativa Turbo Nitro
  const triggerTurbo = useCallback(() => {
    if (isTurboActive) return;
    sounds.playTurbo();
    setIsTurboActive(true);
    setTimeout(() => {
      setIsTurboActive(false);
    }, 3000);
  }, [isTurboActive]);

  // Buzina que faz a plateia de bichinhos pular alegremente
  const triggerHonk = useCallback(() => {
    sounds.playHonk();
    setSpectators((prev) =>
      prev.map((s) => ({ ...s, isBouncing: true }))
    );
    setTimeout(() => {
      setSpectators((prev) =>
        prev.map((s) => ({ ...s, isBouncing: false }))
      );
    }, 600);
  }, []);

  // Suporte a teclado (Setas, A/D, Espaço, H/B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        steerLeft();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        steerRight();
      } else if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        triggerTurbo();
      } else if (e.key === "h" || e.key === "H" || e.key === "b" || e.key === "B") {
        triggerHonk();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [steerLeft, steerRight, triggerTurbo, triggerHonk]);

  // Loop Principal de Física, Spawn e Animação
  useEffect(() => {
    let prevTime = performance.now();

    const updateGame = (time: number) => {
      const delta = Math.min((time - prevTime) / 1000, 0.08);
      prevTime = time;

      // 1. Curvatura dinâmica da estrada estilo OutRun
      const curvePhase = Math.sin(time / 2000) * 0.75 + Math.sin(time / 1100) * 0.25;
      const currentCurve = curvePhase * 16;
      setRoadCurve(currentCurve);

      // 2. Velocidade da pista
      const speedMultiplier = isTurboActive ? 2.4 : 1.0;
      const moveSpeed = 0.58 * speedMultiplier;

      // Animação contínua das linhas do asfalto
      setDashOffset((prev) => (prev + delta * 120 * speedMultiplier) % 100);

      // Suavização do movimento horizontal do carro (Lerp suave)
      if (!isDraggingRef.current) {
        const target = getLaneXAtProgress(carLane, 0.74, currentCurve);
        targetXRef.current = target;
      }
      const dx = targetXRef.current - carXRef.current;
      carXRef.current += dx * Math.min(delta * 14, 0.35);
      setCarX(carXRef.current);

      // 3. Spawn Inteligente de Itens Estritamente nas 3 Faixas
      const spawnInterval = isTurboActive ? 750 : 1200;
      if (time - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = time;
        itemCounterRef.current += 1;

        // Distribuição temática de itens bíblicos
        const itemPool: Array<{
          type: TrackItem["type"];
          emoji?: string;
          name?: string;
        }> = [
          { type: "star" },
          { type: "star" },
          { type: "animal", emoji: "🦁", name: "Leãozinho" },
          { type: "animal", emoji: "🐑", name: "Ovelhinha" },
          { type: "animal", emoji: "🕊️", name: "Pombinha" },
          { type: "animal", emoji: "🦒", name: "Girafinha" },
          { type: "animal", emoji: "🐰", name: "Coelhinho" },
          { type: "scroll", name: "Bíblia Sagrada" },
          { type: "ramp" },
          { type: "turbo" },
          { type: "puddle" },
        ];

        const chosen = itemPool[Math.floor(Math.random() * itemPool.length)];
        const randomLane = (Math.floor(Math.random() * 3)) as 0 | 1 | 2;

        setItems((prev) => [
          ...prev,
          {
            id: itemCounterRef.current,
            type: chosen.type,
            lane: randomLane,
            progress: 0.0, // Começa no horizonte
            emoji: chosen.emoji,
            name: chosen.name,
          },
        ]);
      }

      // 4. Atualização dos Itens e Detecção de Colisão Precisa
      setItems((prev) => {
        const next: TrackItem[] = [];
        const currentCarX = carXRef.current;

        for (const item of prev) {
          const newProgress = item.progress + delta * moveSpeed;

          // Área de colisão do carro: progress entre 0.65 e 0.85 (com carro centrado em 0.74)
          if (newProgress >= 0.65 && newProgress <= 0.85) {
            const itemX = getLaneXAtProgress(item.lane, newProgress, currentCurve);
            // Tolerância de coleta generosa e gostosa para crianças
            const hitDistance = isTurboActive ? 20 : 16;

            if (Math.abs(itemX - currentCarX) < hitDistance) {
              // Efeitos de coleta
              if (item.type === "star") {
                sounds.playStar();
                setScore((s) => {
                  const nextS = s + 1;
                  if (nextS % 10 === 0) {
                    confetti({ particleCount: 70, spread: 80, origin: { y: 0.8 } });
                    sounds.playSuccess();
                  }
                  return nextS;
                });
              } else if (item.type === "animal") {
                // Resgate de animalzinho para a Arca de Noé
                sounds.playChime(1174.66);
                sounds.playStar();
                setScore((s) => s + 3);
                if (item.emoji) {
                  setRescuedAnimals((arr) => [...arr.slice(-4), item.emoji!]);
                }
                setRecentNotification(`${item.emoji || "🐾"} ${item.name || "Bichinho"} a bordo!`);
                setTimeout(() => setRecentNotification(null), 1800);
                confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
              } else if (item.type === "scroll") {
                // Pergaminho da Palavra de Deus
                sounds.playChime(1046.5);
                sounds.playStar();
                setScore((s) => s + 5);
                setRecentNotification("📜 Palavra de Deus: +5 Estrelas!");
                setTimeout(() => setRecentNotification(null), 1800);
                confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
              } else if (item.type === "ramp") {
                // Rampa de salto
                sounds.playBoing();
                setIsJumping(true);
                setTimeout(() => setIsJumping(false), 750);
                setScore((s) => s + 2);
              } else if (item.type === "turbo") {
                triggerTurbo();
                setRecentNotification("⚡ SUPER TURBO NITRO!");
                setTimeout(() => setRecentNotification(null), 1500);
              } else if (item.type === "puddle") {
                sounds.playSplash();
                setIsSplashing(true);
                setTimeout(() => setIsSplashing(false), 650);
              }
              continue; // Item coletado
            }
          }

          if (newProgress < 1.08) {
            next.push({ ...item, progress: newProgress });
          }
        }
        return next;
      });

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [carLane, isTurboActive, getLaneXAtProgress, triggerTurbo]);

  // Toque / Arrastar direto na pista para crianças pequenas
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    const rect = trackRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;

    // Detecta qual das 3 faixas a criança tocou
    if (relX < 38) {
      switchLane(0);
    } else if (relX > 62) {
      switchLane(2);
    } else {
      switchLane(1);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    // Permite deslizar o carrinho livremente dentro da pista asfaltada
    const clamped = Math.max(26, Math.min(74, relX));
    targetXRef.current = clamped;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden bg-slate-900">
      {/* HEADER INTEGRADO COM TROCA DE VEÍCULO, ANIMAIS RESGATADOS E PONTOS */}
      <GameHeader
        onHome={onHome}
        title="Pista do Noé"
        icon="🚙"
        leftControls={
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-md p-0.5 sm:p-1 rounded-xl border border-kids-yellow shadow-sm">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playPop();
                  setVehicle(v.id);
                }}
                className={`kid-btn px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border transition-all ${
                  vehicle === v.id
                    ? "bg-kids-yellow border-amber-600 scale-105 shadow-sm ring-1 ring-yellow-400"
                    : "bg-slate-50 border-slate-200"
                }`}
                title={v.label}
              >
                <span className="text-base sm:text-2xl landscape:text-base">{v.icon}</span>
              </button>
            ))}
          </div>
        }
        rightControls={
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Bichinhos Salvos na Arca */}
            <div className="flex items-center gap-1 bg-white/95 border-2 border-emerald-500 px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl shadow-sm">
              <span className="text-base sm:text-lg">🐾</span>
              <span className="text-xs sm:text-base font-black text-emerald-900">
                {rescuedAnimals.length}
              </span>
            </div>

            {/* Estrelas */}
            <div className="flex items-center gap-1 bg-amber-400 border-2 border-amber-600 px-2 py-0.5 sm:px-3 sm:py-1 rounded-xl shadow-sm">
              <span className="text-base sm:text-xl">⭐</span>
              <span className="text-xs sm:text-base font-black text-amber-950">{score}</span>
            </div>
          </div>
        }
      />

      {/* PALCO PRINCIPAL DA PISTA CENTRALIZADO COM CENÁRIO LATERAL NO DESKTOP */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-800">
        {/* Elementos cenográficos nas laterais no desktop/tablet (árvores, colinas bíblicas) */}
        <div className="hidden lg:flex absolute left-4 xl:left-8 top-1/4 flex-col items-center gap-8 opacity-80 pointer-events-none select-none">
          <span className="text-6xl animate-wiggle">🌳</span>
          <span className="text-5xl">🦁</span>
          <span className="text-6xl">🌴</span>
          <span className="text-5xl">🦒</span>
        </div>
        <div className="hidden lg:flex absolute right-4 xl:right-8 top-1/4 flex-col items-center gap-8 opacity-80 pointer-events-none select-none">
          <span className="text-6xl animate-wiggle">🌴</span>
          <span className="text-5xl">🐑</span>
          <span className="text-6xl">🌳</span>
          <span className="text-5xl">🐘</span>
        </div>

        {/* Pista delimitada no centro: proporções perfeitas para mobile e desktop */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl h-full overflow-hidden touch-none select-none cursor-pointer shadow-2xl bg-emerald-600"
        >
          {/* 1. CÉU BÍBLICO ENSOLARADO COM NUVENS E COLINAS */}
          <div className="absolute top-0 left-0 right-0 h-[22%] bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-2 left-6 text-4xl animate-pulse">☀️</div>
            <div className="absolute top-3 left-1/4 text-3xl opacity-80 animate-wiggle">☁️</div>
            <div className="absolute top-4 right-1/4 text-3xl opacity-80 animate-wiggle">☁️</div>
            <div className="absolute top-3 right-8 text-2xl animate-bounce">🕊️</div>

            {/* Colinas ao horizonte que balançam com a curva */}
            <div
              className="absolute -bottom-2 left-[-15%] right-[-15%] h-12 bg-emerald-600 rounded-t-[100%] transition-transform duration-100"
              style={{ transform: `translateX(${roadCurve * 1.8}px)` }}
            />
            <div
              className="absolute -bottom-1 left-[-10%] right-[-10%] h-8 bg-emerald-500 rounded-t-[100%] transition-transform duration-100"
              style={{ transform: `translateX(${roadCurve * 1.1}px)` }}
            />
          </div>

          {/* 2. GRAMADO VERDE LATERAL */}
          <div className="absolute top-[22%] bottom-0 left-0 right-0 bg-emerald-600 overflow-hidden pointer-events-none z-0">
            {/* Textura de grama */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 to-emerald-700 opacity-90" />
          </div>

          {/* 3. PISTA DE ASFALTO COM PERSPECTIVA REAL (POLÍGONO PERFEITAMENTE SINCRONIZADO) */}
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="absolute top-[22%] bottom-0 left-0 w-full h-[78%] pointer-events-none z-1"
          >
            <defs>
              <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
              <linearGradient id="curbRedWhite" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Asfalto da Pista */}
            <polygon
              points={`
                ${(50 + roadCurve * 0.85 - 13) * 10},0
                ${(50 + roadCurve * 0.85 + 13) * 10},0
                ${(50 + 38) * 10},1000
                ${(50 - 38) * 10},1000
              `}
              fill="url(#asphaltGrad)"
              stroke="#020617"
              strokeWidth="4"
            />

            {/* Zebra Vermelha e Branca Esquerda */}
            <polygon
              points={`
                ${(50 + roadCurve * 0.85 - 15) * 10},0
                ${(50 + roadCurve * 0.85 - 13) * 10},0
                ${(50 - 38) * 10},1000
                ${(50 - 41.5) * 10},1000
              `}
              fill="url(#curbRedWhite)"
            />

            {/* Zebra Vermelha e Branca Direita */}
            <polygon
              points={`
                ${(50 + roadCurve * 0.85 + 13) * 10},0
                ${(50 + roadCurve * 0.85 + 15) * 10},0
                ${(50 + 41.5) * 10},1000
                ${(50 + 38) * 10},1000
              `}
              fill="url(#curbRedWhite)"
            />

            {/* Divisória de Faixa 1 (Entre Faixa 0 e 1: Exatamente no centro geométrico) */}
            <line
              x1={(50 + roadCurve * 0.85 - 4.16) * 10}
              y1={0}
              x2={(50 - 12.16) * 10}
              y2={1000}
              stroke="#ffffff"
              strokeWidth="5"
              strokeDasharray="25,25"
              strokeDashoffset={-dashOffset * 2}
              opacity="0.85"
            />

            {/* Divisória de Faixa 2 (Entre Faixa 1 e 2: Exatamente no centro geométrico) */}
            <line
              x1={(50 + roadCurve * 0.85 + 4.16) * 10}
              y1={0}
              x2={(50 + 12.16) * 10}
              y2={1000}
              stroke="#ffffff"
              strokeWidth="5"
              strokeDasharray="25,25"
              strokeDashoffset={-dashOffset * 2}
              opacity="0.85"
            />
          </svg>

        {/* 4. ESPECTADORES NA BEIRA DA PISTA (Bichinhos e Árvores) */}
        {spectators.map((s) => (
          <div
            key={s.id}
            onClick={(e) => {
              e.stopPropagation();
              triggerHonk();
            }}
            className={`absolute z-10 text-3xl sm:text-5xl pointer-events-auto cursor-pointer transition-transform duration-150 ${
              s.isBouncing ? "scale-140 -translate-y-4" : "hover:scale-115"
            }`}
            style={{
              left: s.side === "left" ? "3%" : "89%",
              top: `${s.y}%`,
            }}
            title="Clique para cumprimentar!"
          >
            {s.emoji}
          </div>
        ))}

        {/* 5. LINHAS DE VENTO DO TURBO NITRO */}
        {isTurboActive && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <div className="absolute inset-0 bg-cyan-400/10 animate-pulse" />
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 bg-gradient-to-b from-transparent via-cyan-200 to-white rounded-full animate-ping opacity-80"
                style={{
                  left: `${6 + i * 7}%`,
                  top: `${Math.random() * 80}%`,
                  height: `${70 + Math.random() * 120}px`,
                  animationDuration: "0.28s",
                }}
              />
            ))}
          </div>
        )}

        {/* 6. ITENS COLETÁVEIS NA PISTA (Escala e Posição 100% Dentro das Faixas) */}
        {items.map((item) => {
          // Calcula a posição física X e Y exata da faixa com perspectiva
          const itemX = getLaneXAtProgress(item.lane, item.progress, roadCurve);
          // Y mapeado de 22% (horizonte) até 94% (rodapé)
          const itemY = 22 + item.progress * 68;
          // Escala cresce suavemente de 0.35 (longe) para 1.05 (perto do carro)
          const itemScale = 0.35 + item.progress * 0.7;

          return (
            <div
              key={item.id}
              className="absolute pointer-events-none z-15 flex flex-col items-center justify-center transition-transform duration-75"
              style={{
                left: `${itemX}%`,
                top: `${itemY}%`,
                transform: `translate(-50%, -50%) scale(${itemScale})`,
              }}
            >
              {/* Estrela da Fé */}
              {item.type === "star" && (
                <div className="text-4xl sm:text-5xl drop-shadow-[0_4px_12px_rgba(251,191,36,0.9)] animate-spin" style={{ animationDuration: "2s" }}>
                  ⭐
                </div>
              )}

              {/* Bichinho Bíblico Perdido precisando de carona */}
              {item.type === "animal" && (
                <div className="flex flex-col items-center animate-bounce">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 border-2 border-emerald-500 shadow-lg flex items-center justify-center text-3xl sm:text-4xl">
                    {item.emoji}
                  </div>
                  <span className="text-[10px] font-black text-emerald-950 bg-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-600 shadow-sm mt-0.5 whitespace-nowrap">
                    SALVE!
                  </span>
                </div>
              )}

              {/* Pergaminho Sagrado da Bíblia */}
              {item.type === "scroll" && (
                <div className="flex flex-col items-center animate-wiggle">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 border-2 border-amber-600 shadow-lg flex items-center justify-center text-3xl sm:text-4xl">
                    📜
                  </div>
                  <span className="text-[10px] font-black text-amber-950 bg-kids-yellow px-1.5 py-0.5 rounded-full border border-amber-600 shadow-sm mt-0.5 whitespace-nowrap">
                    BÍBLIA
                  </span>
                </div>
              )}

              {/* Rampa Dourada de Salto */}
              {item.type === "ramp" && (
                <div className="bg-gradient-to-t from-amber-500 to-yellow-300 border-3 border-white rounded-xl px-3 py-1 text-center font-black text-amber-950 shadow-2xl flex items-center gap-1 animate-pulse">
                  <span className="text-xl">🔺</span>
                  <span className="text-xs tracking-wider">PULA!</span>
                </div>
              )}

              {/* Pad de Turbo Nitro */}
              {item.type === "turbo" && (
                <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 border-3 border-white rounded-xl px-2.5 py-1 flex items-center gap-1 shadow-[0_0_15px_rgba(56,189,248,0.9)] animate-pulse">
                  <span className="text-xl">⚡</span>
                  <span className="font-black text-xs text-slate-900">TURBO</span>
                </div>
              )}

              {/* Poça d'água */}
              {item.type === "puddle" && (
                <div className="bg-sky-400/80 border-2 border-white rounded-full w-14 h-8 flex items-center justify-center text-xl shadow-md">
                  💦
                </div>
              )}
            </div>
          );
        })}

        {/* 7. EFEITO DE RESPINGO NA TELA (SPLASH) */}
        {isSplashing && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-sky-400/20 backdrop-blur-[1px] animate-ping">
            <span className="text-8xl">💦</span>
          </div>
        )}

        {/* 8. NOTIFICAÇÃO FLUTUANTE DE RESGATE DE ANIMAIS / ITENS ESPECIAIS */}
        {recentNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 border-2 border-emerald-500 px-4 py-1.5 rounded-full shadow-kid flex items-center gap-1.5 pointer-events-none animate-bounce">
            <Sparkles size={16} className="text-amber-500" />
            <span className="font-black text-xs sm:text-sm text-slate-900">
              {recentNotification}
            </span>
          </div>
        )}

        {/* 9. VEÍCULO DO JOGADOR: POSICIONADO NO PONTO IDEAL DO RODAPÉ (NÃO FICA LA EM CIMA!) */}
        <div
          className="absolute z-25 pointer-events-none transition-transform duration-75"
          style={{
            left: `${carX}%`,
            top: "74%", // Posição confortável no terço inferior da pista, acima dos botões
            transform: `translate(-50%, -50%) rotate(${carTilt}deg) ${
              isJumping ? "scale(1.35) translateY(-50px)" : "scale(1)"
            }`,
          }}
        >
          {/* Sombra Dinâmica no Asfalto */}
          <div
            className={`w-18 sm:w-26 h-6 bg-black/45 rounded-full blur-[3px] mx-auto transition-transform ${
              isJumping ? "scale-75 translate-y-12 opacity-30" : "scale-100"
            }`}
          />

          {/* Chamas de Fogo no Escape quando Turbo Ativo */}
          {isTurboActive && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
              <span className="text-2xl sm:text-3xl animate-bounce">🔥</span>
              <span className="text-3xl sm:text-4xl animate-pulse">🔥</span>
              <span className="text-2xl sm:text-3xl animate-bounce">🔥</span>
            </div>
          )}

          {/* 1. JIPE DA ARCA DE NOÉ */}
          {vehicle === "safari" && (
            <div className="w-22 h-30 sm:w-28 sm:h-38 md:w-32 md:h-44 drop-shadow-2xl relative -mt-3">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                {/* Rodas Robustas de Aço */}
                <rect x="4" y="28" width="18" height="36" rx="6" fill="#0F172A" />
                <rect x="118" y="28" width="18" height="36" rx="6" fill="#0F172A" />
                <rect x="4" y="138" width="18" height="36" rx="6" fill="#0F172A" />
                <rect x="118" y="138" width="18" height="36" rx="6" fill="#0F172A" />

                {/* Chassi Jipe Laranja/Madeira da Arca */}
                <rect x="18" y="16" width="104" height="168" rx="20" fill="#D97706" stroke="#78350F" strokeWidth="5" />
                <rect x="28" y="24" width="84" height="38" rx="8" fill="#B45309" />

                {/* Para-brisa com Noé e Leãozinho */}
                <rect x="26" y="65" width="88" height="34" rx="8" fill="#E0F2FE" stroke="#78350F" strokeWidth="3" />
                <text x="34" y="91" fontSize="22">🧔</text>
                <text x="80" y="91" fontSize="22">🦁</text>

                {/* Bichinhos Salvos na Traseira */}
                {rescuedAnimals.length > 0 && (
                  <g>
                    <rect x="30" y="112" width="80" height="28" rx="6" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
                    <text x="34" y="132" fontSize="16">
                      {rescuedAnimals.slice(-3).join("")}
                    </text>
                  </g>
                )}

                {/* Estepe com Cruz Dourada */}
                <circle cx="70" cy="162" r="20" fill="#0F172A" stroke="#334155" strokeWidth="3" />
                <circle cx="70" cy="162" r="8" fill="#F59E0B" />

                {/* Faróis Dianteiros com Brilho Amarelo */}
                <circle cx="36" cy="18" r="7" fill="#FEF08A" stroke="#D97706" strokeWidth="2" />
                <circle cx="104" cy="18" r="7" fill="#FEF08A" stroke="#D97706" strokeWidth="2" />
              </svg>
            </div>
          )}

          {/* 2. CARRUAGEM DE FOGO DO PROFETA ELIAS */}
          {vehicle === "chariot" && (
            <div className="w-22 h-30 sm:w-28 sm:h-38 md:w-32 md:h-44 drop-shadow-2xl relative -mt-3">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                <rect x="4" y="28" width="18" height="36" rx="6" fill="#EA580C" />
                <rect x="118" y="28" width="18" height="36" rx="6" fill="#EA580C" />
                <rect x="4" y="138" width="18" height="36" rx="6" fill="#EA580C" />
                <rect x="118" y="138" width="18" height="36" rx="6" fill="#EA580C" />
                <rect x="18" y="16" width="104" height="168" rx="22" fill="#FBBF24" stroke="#B45309" strokeWidth="5" />
                <rect x="28" y="65" width="84" height="32" rx="8" fill="#FEF08A" stroke="#B45309" strokeWidth="3" />
                <text x="46" y="90" fontSize="24">👑</text>
                <text x="76" y="90" fontSize="22">🔥</text>
                <polygon points="26,110 14,130 26,150" fill="#EF4444" />
                <polygon points="114,110 126,130 114,150" fill="#EF4444" />
                <circle cx="36" cy="18" r="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
                <circle cx="104" cy="18" r="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
              </svg>
            </div>
          )}

          {/* 3. CAMINHÃO DE BOMBEIROS SALVADOR */}
          {vehicle === "fire" && (
            <div className="w-22 h-30 sm:w-28 sm:h-38 md:w-32 md:h-44 drop-shadow-2xl relative -mt-3">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                <rect x="6" y="30" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="118" y="30" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="6" y="140" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="118" y="140" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="18" y="15" width="104" height="170" rx="18" fill="#DC2626" stroke="#7F1D1D" strokeWidth="5" />
                <rect x="28" y="35" width="84" height="35" rx="8" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="3" />
                <circle cx="70" cy="52" r="13" fill="#FED7AA" />
                <rect x="58" y="36" width="24" height="10" rx="4" fill="#F59E0B" />
                <rect x="44" y="18" width="22" height="8" rx="3" fill="#38BDF8" className="animate-ping" />
                <rect x="74" y="18" width="22" height="8" rx="3" fill="#EF4444" className="animate-ping" />
                <rect x="42" y="115" width="56" height="60" rx="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="130" x2="98" y2="130" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="145" x2="98" y2="145" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="160" x2="98" y2="160" stroke="#64748B" strokeWidth="3" />
              </svg>
            </div>
          )}

          {/* 4. DINO DA CRIAÇÃO */}
          {vehicle === "dino" && (
            <div className="w-22 h-30 sm:w-28 sm:h-38 md:w-32 md:h-44 drop-shadow-2xl relative -mt-3">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                <rect x="2" y="25" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="116" y="25" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="2" y="135" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="116" y="135" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <path d="M 22 45 Q 70 10 118 45 L 118 170 Q 70 185 22 170 Z" fill="#15803D" stroke="#14532D" strokeWidth="5" />
                <circle cx="44" cy="55" r="10" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
                <circle cx="44" cy="55" r="4" fill="#000000" />
                <circle cx="96" cy="55" r="10" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
                <circle cx="96" cy="55" r="4" fill="#000000" />
                <polygon points="62,90 70,72 78,90" fill="#EAB308" />
                <polygon points="62,120 70,102 78,120" fill="#EAB308" />
                <polygon points="62,150 70,132 78,150" fill="#EAB308" />
              </svg>
            </div>
          )}
        </div>

        {/* 10. CONTROLES TÁTEIS: CANTOS INFERIORES (CENTRO DA PISTA 100% LIVRE) */}
        <div className="absolute bottom-2 sm:bottom-4 landscape:bottom-1.5 left-2 right-2 sm:left-4 sm:right-4 z-30 flex items-center justify-between pointer-events-none pb-[max(4px,env(safe-area-inset-bottom))]">
          {/* Canto Esquerdo: Setas de Direção (< e >) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                steerLeft();
              }}
              className="kid-btn w-12 h-12 sm:w-16 sm:h-16 landscape:w-11 landscape:h-11 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-sky-800 shadow-kid-lg flex items-center justify-center active:scale-90"
              aria-label="Faixa da Esquerda"
            >
              <ChevronLeft className="w-7 h-7 sm:w-10 sm:h-10 landscape:w-6 landscape:h-6 stroke-[3]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                steerRight();
              }}
              className="kid-btn w-12 h-12 sm:w-16 sm:h-16 landscape:w-11 landscape:h-11 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-sky-800 shadow-kid-lg flex items-center justify-center active:scale-90"
              aria-label="Faixa da Direita"
            >
              <ChevronRight className="w-7 h-7 sm:w-10 sm:h-10 landscape:w-6 landscape:h-6 stroke-[3]" />
            </button>
          </div>

          {/* Canto Direito: Buzina "BI-BI!" + Turbo Nitro */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerHonk();
              }}
              className="kid-btn px-3 sm:px-5 py-2 sm:py-2.5 landscape:px-2.5 landscape:py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs sm:text-base rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-rose-800 shadow-kid active:scale-90 flex items-center gap-1"
              title="Tocar Buzina"
            >
              <span className="text-base sm:text-xl">📢</span>
              <span className="tracking-wide">BI-BI!</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerTurbo();
              }}
              className={`kid-btn px-3 sm:px-5 py-2 sm:py-2.5 landscape:px-2.5 landscape:py-1.5 rounded-2xl sm:rounded-3xl border-2 sm:border-4 font-black text-xs sm:text-base shadow-kid-lg active:scale-90 flex items-center gap-1 ${
                isTurboActive
                  ? "bg-amber-400 border-amber-600 text-amber-950 animate-bounce ring-3 ring-yellow-300"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-800"
              }`}
              title="Turbo Nitro"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] fill-current" />
              <span>TURBO!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
