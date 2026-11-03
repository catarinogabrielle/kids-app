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

  // Coordenada X ideal de cada faixa (0, 1, 2) em pista 100% RETA (sem curvas!)
  const getLaneXAtProgress = useCallback((lane: 0 | 1 | 2, p: number) => {
    // Largura da pista: vai de 32% no horizonte até 90% no rodapé (perspectiva 3D limpa e ampla)
    const roadWidth = 32 + p * 58;
    // Divisão exata por 3: alinhamento 100% geométrico no centro de cada faixa da pista
    const laneSpacing = roadWidth / 3;
    return 50 + (lane - 1) * laneSpacing;
  }, []);

  // Altera faixa pelo teclado ou botões
  const switchLane = useCallback(
    (newLane: 0 | 1 | 2) => {
      setCarLane(newLane);
      sounds.playPop();
      const target = getLaneXAtProgress(newLane, 0.74);
      targetXRef.current = target;
      setCarTilt(newLane < carLane ? -8 : newLane > carLane ? 8 : 0);
      setTimeout(() => setCarTilt(0), 180);
    },
    [carLane, getLaneXAtProgress]
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

      // 1. Pista 100% Reta (sem curvas, foco em estabilidade e jogabilidade para crianças)
      // 2. Velocidade da pista
      const speedMultiplier = isTurboActive ? 2.4 : 1.0;
      const moveSpeed = 0.58 * speedMultiplier;

      // Animação contínua das faixas da pista
      setDashOffset((prev) => (prev + delta * 120 * speedMultiplier) % 100);

      // Suavização do movimento horizontal do carro (Lerp suave)
      if (!isDraggingRef.current) {
        const target = getLaneXAtProgress(carLane, 0.74);
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
            const itemX = getLaneXAtProgress(item.lane, newProgress);
            // Tolerância de coleta generosa e gostosa para crianças
            const hitDistance = isTurboActive ? 22 : 18;

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
    const clamped = Math.max(22, Math.min(78, relX));
    targetXRef.current = clamped;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden bg-slate-900">
      {/* HEADER INTEGRADO COMPACTO NO MOBILE COM TROCA DE VEÍCULO, ANIMAIS RESGATADOS E PONTOS */}
      <GameHeader
        onHome={onHome}
        title="Pista do Noé"
        icon="🚙"
        hideTitleOnMobile={true}
        leftControls={
          <div className="flex items-center gap-0.5 sm:gap-1.5 bg-white/95 backdrop-blur-md p-0.5 sm:p-1 rounded-xl border border-kids-yellow shadow-toy-sm flex-shrink-0 overflow-x-auto scrollbar-none">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playPop();
                  setVehicle(v.id);
                }}
                className={`kid-btn p-1 sm:px-2.5 sm:py-1 rounded-lg border transition-all ${
                  vehicle === v.id
                    ? "kid-btn-amber scale-105 shadow-toy-sm ring-1 ring-yellow-400"
                    : "bg-slate-50 border-slate-200"
                }`}
                title={v.label}
              >
                <span className="text-sm sm:text-2xl landscape:text-base">{v.icon}</span>
              </button>
            ))}
          </div>
        }
        rightControls={
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Bichinhos Salvos na Arca */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white/95 border sm:border-2 border-emerald-500 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-xl shadow-toy-sm flex-shrink-0">
              <span className="text-xs sm:text-lg">🐾</span>
              <span className="text-[11px] sm:text-base font-black text-emerald-950">
                {rescuedAnimals.length}
              </span>
            </div>

            {/* Estrelas */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-amber-400 border sm:border-2 border-amber-600 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-xl shadow-toy-sm flex-shrink-0">
              <span className="text-xs sm:text-xl">⭐</span>
              <span className="text-[11px] sm:text-base font-black text-amber-950">{score}</span>
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
          <div className="absolute top-0 left-0 right-0 h-[24%] bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-2 left-6 text-4xl animate-pulse">☀️</div>
            <div className="absolute top-3 left-1/4 text-3xl opacity-80 animate-wiggle">☁️</div>
            <div className="absolute top-4 right-1/4 text-3xl opacity-80 animate-wiggle">☁️</div>
            <div className="absolute top-3 right-8 text-2xl animate-bounce">🕊️</div>

            {/* Colinas ao horizonte serenas e estáveis */}
            <div className="absolute -bottom-2 left-[-10%] right-[-10%] h-12 bg-emerald-600 rounded-t-[100%]" />
            <div className="absolute -bottom-1 left-[-5%] right-[-5%] h-8 bg-emerald-500 rounded-t-[100%]" />
          </div>

          {/* 2. GRAMADO VERDE LATERAL */}
          <div className="absolute top-[24%] bottom-0 left-0 right-0 bg-emerald-600 overflow-hidden pointer-events-none z-0">
            {/* Textura de grama */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 to-emerald-700 opacity-90" />
          </div>

          {/* 3. PISTA DE ASFALTO 100% RETA COM PERSPECTIVA 3D LIMPA */}
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="absolute top-[24%] bottom-0 left-0 w-full h-[76%] pointer-events-none z-1"
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

            {/* Asfalto da Pista 100% Reta (34% no horizonte a 95% na base) */}
            <polygon
              points="340,0 660,0 950,1000 50,1000"
              fill="url(#asphaltGrad)"
              stroke="#020617"
              strokeWidth="4"
            />

            {/* Zebra Vermelha e Branca Esquerda */}
            <polygon
              points="305,0 340,0 50,1000 10,1000"
              fill="url(#curbRedWhite)"
            />

            {/* Zebra Vermelha e Branca Direita */}
            <polygon
              points="660,0 695,0 990,1000 950,1000"
              fill="url(#curbRedWhite)"
            />

            {/* Divisória de Faixa 1 (Entre Faixa 0 e 1) */}
            <line
              x1="447"
              y1="0"
              x2="350"
              y2="1000"
              stroke="#ffffff"
              strokeWidth="6"
              strokeDasharray="28,28"
              strokeDashoffset={-dashOffset * 2.2}
              opacity="0.9"
            />

            {/* Divisória de Faixa 2 (Entre Faixa 1 e 2) */}
            <line
              x1="553"
              y1="0"
              x2="650"
              y2="1000"
              stroke="#ffffff"
              strokeWidth="6"
              strokeDasharray="28,28"
              strokeDashoffset={-dashOffset * 2.2}
              opacity="0.9"
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
              left: s.side === "left" ? "2.5%" : "91.5%",
              top: `${s.y}%`,
            }}
            title="Clique para cumprimentar!"
          >
            {s.emoji}
            {s.isBouncing && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm sm:text-base animate-bounce">
                ❤️
              </span>
            )}
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

        {/* 6. ITENS COLETÁVEIS NA PISTA (Escala e Posição 100% Dentro das Faixas Retas) */}
        {items.map((item) => {
          // Calcula a posição física X e Y exata da faixa (sem curvas, foco absoluto em estabilidade)
          const itemX = getLaneXAtProgress(item.lane, item.progress);
          // Y mapeado de 24% (horizonte) até 92% (rodapé)
          const itemY = 24 + item.progress * 66;
          // Escala cresce suavemente de 0.4 (longe) para 1.05 (perto do carro)
          const itemScale = 0.4 + item.progress * 0.65;

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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 border-2 border-emerald-500 shadow-lg flex items-center justify-center text-3xl sm:text-4xl">
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

        {/* 9. VEÍCULO DO JOGADOR: PROPORCIONAL, TÁTIL E ELEGANTE (VISTA TRASEIRA 3D CHIBI) */}
        <div
          className="absolute z-25 pointer-events-none transition-transform duration-75"
          style={{
            left: `${carX}%`,
            top: "74%", // Posição ideal na vertical: bem visível, no terço inferior, acima dos botões
            transform: `translate(-50%, -50%) rotate(${carTilt}deg) ${
              isJumping ? "scale(1.25) translateY(-35px)" : "scale(1)"
            }`,
          }}
        >
          {/* Sombra Dinâmica no Asfalto */}
          <div
            className={`w-16 sm:w-22 h-4 bg-black/40 rounded-full blur-[2px] mx-auto transition-transform ${
              isJumping ? "scale-75 translate-y-8 opacity-30" : "scale-100"
            }`}
          />

          {/* Chamas de Fogo no Escape quando Turbo Ativo */}
          {isTurboActive && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none z-30">
              <span className="text-xl sm:text-2xl animate-bounce">🔥</span>
              <span className="text-2xl sm:text-3xl animate-pulse">🔥</span>
              <span className="text-xl sm:text-2xl animate-bounce">🔥</span>
            </div>
          )}

          {/* 1. JIPE DA ARCA DE NOÉ (VISTA TRASEIRA 3D CHIBI) */}
          {vehicle === "safari" && (
            <div className="w-20 h-16 sm:w-26 sm:h-20 md:w-32 md:h-24 drop-shadow-2xl relative -mt-2">
              <svg viewBox="0 0 120 90" className="w-full h-full select-none overflow-visible">
                {/* Pneus Off-road Traseiros */}
                <rect x="6" y="38" width="18" height="42" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="2" />
                <rect x="96" y="38" width="18" height="42" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="2" />
                <line x1="6" y1="52" x2="24" y2="52" stroke="#475569" strokeWidth="2" />
                <line x1="6" y1="66" x2="24" y2="66" stroke="#475569" strokeWidth="2" />
                <line x1="96" y1="52" x2="114" y2="52" stroke="#475569" strokeWidth="2" />
                <line x1="96" y1="66" x2="114" y2="66" stroke="#475569" strokeWidth="2" />

                {/* Chassi do Jipe Laranja/Madeira da Arca */}
                <rect x="18" y="22" width="84" height="58" rx="14" fill="#D97706" stroke="#78350F" strokeWidth="3.5" />
                {/* Teto e Bagageiro */}
                <path d="M 28 22 L 36 8 L 84 8 L 92 22 Z" fill="#B45309" stroke="#78350F" strokeWidth="3" />
                <rect x="38" y="4" width="44" height="5" rx="2" fill="#78350F" />
                <circle cx="46" cy="6" r="3.5" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />
                <circle cx="60" cy="6" r="3.5" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />
                <circle cx="74" cy="6" r="3.5" fill="#FEF08A" stroke="#78350F" strokeWidth="1" />

                {/* Vidro Traseiro com Noé e Leãozinho */}
                <rect x="26" y="14" width="68" height="30" rx="8" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
                <text x="34" y="36" fontSize="18">🧔</text>
                <text x="66" y="36" fontSize="18">🦁</text>

                {/* Estepe Traseiro da Arca */}
                <circle cx="60" cy="56" r="13" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
                <circle cx="60" cy="56" r="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                <text x="60" y="60" fontSize="8" textAnchor="middle" fill="#78350F" fontWeight="900">✝</text>

                {/* Lanternas Traseiras Redondas Vermelhas */}
                <circle cx="27" cy="60" r="5.5" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <circle cx="27" cy="60" r="2" fill="#FCA5A5" />
                <circle cx="93" cy="60" r="5.5" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <circle cx="93" cy="60" r="2" fill="#FCA5A5" />

                {/* Para-choque e Placa */}
                <rect x="22" y="70" width="76" height="9" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
                <rect x="48" y="72" width="24" height="5.5" rx="1.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
                <text x="60" y="76.5" fontSize="4.5" textAnchor="middle" fill="#78350F" fontWeight="900">NOÉ</text>
              </svg>
            </div>
          )}

          {/* 2. CARRUAGEM DE FOGO DO PROFETA ELIAS (VISTA TRASEIRA 3D CHIBI) */}
          {vehicle === "chariot" && (
            <div className="w-20 h-16 sm:w-26 sm:h-20 md:w-32 md:h-24 drop-shadow-2xl relative -mt-2">
              <svg viewBox="0 0 120 90" className="w-full h-full select-none overflow-visible">
                <rect x="6" y="38" width="18" height="42" rx="6" fill="#EA580C" stroke="#7C2D12" strokeWidth="2" />
                <rect x="96" y="38" width="18" height="42" rx="6" fill="#EA580C" stroke="#7C2D12" strokeWidth="2" />
                <rect x="18" y="24" width="84" height="56" rx="14" fill="#FBBF24" stroke="#B45309" strokeWidth="3.5" />
                <path d="M 28 24 L 38 10 L 82 10 L 92 24 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
                <text x="60" y="16" fontSize="16" textAnchor="middle">👑</text>
                <rect x="28" y="26" width="64" height="26" rx="8" fill="#FEF08A" stroke="#B45309" strokeWidth="2" />
                <text x="44" y="44" fontSize="16">🔥</text>
                <text x="64" y="44" fontSize="16">✨</text>
                <circle cx="28" cy="62" r="6" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
                <circle cx="92" cy="62" r="6" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
                <rect x="22" y="70" width="76" height="9" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
                <text x="60" y="77" fontSize="5" textAnchor="middle" fill="#FFFFFF" fontWeight="900">ELIAS</text>
              </svg>
            </div>
          )}

          {/* 3. CAMINHÃO DE BOMBEIROS SALVADOR (VISTA TRASEIRA 3D CHIBI) */}
          {vehicle === "fire" && (
            <div className="w-20 h-16 sm:w-26 sm:h-20 md:w-32 md:h-24 drop-shadow-2xl relative -mt-2">
              <svg viewBox="0 0 120 90" className="w-full h-full select-none overflow-visible">
                <rect x="6" y="38" width="18" height="42" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="2" />
                <rect x="96" y="38" width="18" height="42" rx="6" fill="#0F172A" stroke="#334155" strokeWidth="2" />
                <rect x="18" y="20" width="84" height="60" rx="12" fill="#DC2626" stroke="#7F1D1D" strokeWidth="3.5" />
                {/* Giroflex */}
                <rect x="36" y="10" width="18" height="8" rx="2" fill="#38BDF8" className="animate-pulse" />
                <rect x="66" y="10" width="18" height="8" rx="2" fill="#EF4444" className="animate-pulse" />
                {/* Porta de Persiana Traseira */}
                <rect x="28" y="24" width="64" height="42" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
                <line x1="28" y1="34" x2="92" y2="34" stroke="#64748B" strokeWidth="2" />
                <line x1="28" y1="44" x2="92" y2="44" stroke="#64748B" strokeWidth="2" />
                <line x1="28" y1="54" x2="92" y2="54" stroke="#64748B" strokeWidth="2" />
                {/* Faróis e Placa */}
                <circle cx="26" cy="72" r="5" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <circle cx="94" cy="72" r="5" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <rect x="22" y="73" width="76" height="8" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
                <text x="60" y="79" fontSize="5" textAnchor="middle" fill="#DC2626" fontWeight="900">RESGATE 193</text>
              </svg>
            </div>
          )}

          {/* 4. DINO DA CRIAÇÃO (VISTA TRASEIRA 3D CHIBI) */}
          {vehicle === "dino" && (
            <div className="w-20 h-16 sm:w-26 sm:h-20 md:w-32 md:h-24 drop-shadow-2xl relative -mt-2">
              <svg viewBox="0 0 120 90" className="w-full h-full select-none overflow-visible">
                <rect x="6" y="38" width="18" height="42" rx="6" fill="#14532D" stroke="#052E16" strokeWidth="2" />
                <rect x="96" y="38" width="18" height="42" rx="6" fill="#14532D" stroke="#052E16" strokeWidth="2" />
                <rect x="18" y="24" width="84" height="56" rx="16" fill="#16A34A" stroke="#14532D" strokeWidth="3.5" />
                {/* Espinhos Dorsais de T-Rex */}
                <polygon points="46,24 50,10 54,24" fill="#FACC15" stroke="#713F12" strokeWidth="1.5" />
                <polygon points="58,24 62,8 66,24" fill="#FACC15" stroke="#713F12" strokeWidth="1.5" />
                <polygon points="70,24 74,10 78,24" fill="#FACC15" stroke="#713F12" strokeWidth="1.5" />
                {/* Vidro com Olhos Amigáveis */}
                <rect x="28" y="28" width="64" height="26" rx="8" fill="#FEF08A" stroke="#14532D" strokeWidth="2" />
                <circle cx="44" cy="40" r="6" fill="#14532D" />
                <circle cx="42" cy="38" r="2" fill="#FFFFFF" />
                <circle cx="76" cy="40" r="6" fill="#14532D" />
                <circle cx="74" cy="38" r="2" fill="#FFFFFF" />
                {/* Lanternas e Placa */}
                <circle cx="28" cy="62" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <circle cx="92" cy="62" r="6" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
                <rect x="22" y="71" width="76" height="9" rx="3" fill="#15803D" stroke="#14532D" strokeWidth="1.5" />
                <text x="60" y="78" fontSize="5.5" textAnchor="middle" fill="#FEF08A" fontWeight="900">DINO T-REX</text>
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
