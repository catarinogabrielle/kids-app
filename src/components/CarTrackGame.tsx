"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { Zap, ChevronLeft, ChevronRight } from "lucide-react";

type VehicleId = "safari" | "chariot" | "fire" | "dino";

interface TrackItem {
  id: number;
  type: "star" | "scroll" | "dove" | "heart" | "turbo" | "ramp" | "puddle";
  x: number; // 20 a 80
  y: number; // -10 a 110
}

interface RoadsideWatcher {
  id: number;
  emoji: string;
  side: "left" | "right";
  y: number;
  name: string;
}

export function CarTrackGame() {
  const [vehicle, setVehicle] = useState<VehicleId>("safari");
  const [carX, setCarX] = useState(50);
  const [carTilt, setCarTilt] = useState(0);
  const [score, setScore] = useState(0);
  const [isTurboActive, setIsTurboActive] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isSplashing, setIsSplashing] = useState(false);
  const [roadCurve, setRoadCurve] = useState(0); // Curvatura da pista (-30 a 30)
  const [steerDirection, setSteerDirection] = useState<"left" | "right" | null>(null);

  const [items, setItems] = useState<TrackItem[]>([]);
  const [watchers, setWatchers] = useState<RoadsideWatcher[]>([]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const itemCounterRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const carXRef = useRef<number>(50);
  carXRef.current = carX;

  const vehicles = [
    { id: "safari" as const, name: "Jipe da Arca", icon: "🚙", label: "Noé & Animais" },
    { id: "chariot" as const, name: "Carruagem de Fogo", icon: "🔥", label: "Profeta Elias" },
    { id: "fire" as const, name: "Bombeiro Salvador", icon: "🚒", label: "Herói Bombeiro" },
    { id: "dino" as const, name: "Dino da Criação", icon: "🦖", label: "T-Rex Amigo" },
  ];

  // Ativa Turbo Nitro
  const triggerTurbo = useCallback(() => {
    if (isTurboActive) return;
    sounds.playTurbo();
    setIsTurboActive(true);
    setTimeout(() => {
      setIsTurboActive(false);
    }, 2800);
  }, [isTurboActive]);

  // Movimento contínuo por botões (pressionar e segurar)
  useEffect(() => {
    let steerInterval: NodeJS.Timeout | null = null;
    if (steerDirection) {
      steerInterval = setInterval(() => {
        setCarX((prev) => {
          const step = steerDirection === "left" ? -2.2 : 2.2;
          const next = Math.max(18, Math.min(82, prev + step));
          setCarTilt(steerDirection === "left" ? -14 : 14);
          return next;
        });
      }, 25);
    } else {
      setCarTilt(0);
    }

    return () => {
      if (steerInterval) clearInterval(steerInterval);
    };
  }, [steerDirection]);

  // Loop de Animação e Física da Pista com Curvas
  useEffect(() => {
    let prevTime = performance.now();

    const updateGame = (time: number) => {
      const delta = Math.min((time - prevTime) / 1000, 0.1);
      prevTime = time;

      // Curvatura oscilante suave da estrada (dá sensação de curvas fechadas e emocionantes)
      const curvePhase = Math.sin(time / 1600) * 0.7 + Math.sin(time / 800) * 0.3;
      const targetCurve = curvePhase * 24;
      setRoadCurve(targetCurve);

      // Velocidade do jogo
      const currentSpeedMultiplier = isTurboActive ? 2.2 : 1.0;
      const gameSpeed = 44 * currentSpeedMultiplier;

      // Spawn de novos itens na pista
      const spawnInterval = isTurboActive ? 750 : 1250;
      if (time - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = time;
        itemCounterRef.current += 1;

        const possibleTypes: TrackItem["type"][] = [
          "star",
          "star",
          "scroll",
          "dove",
          "heart",
          "turbo",
          "ramp",
          "puddle",
        ];
        const chosenType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
        // Vias da pista acompanham ligeiramente a curva
        const lanes = [24, 38, 52, 66, 78];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];

        setItems((prev) => [
          ...prev,
          {
            id: itemCounterRef.current,
            type: chosenType,
            x: randomLane,
            y: -12,
          },
        ]);

        // Bichinhos espectadores na beira da estrada
        if (Math.random() > 0.4) {
          const watcherOptions = [
            { emoji: "🦁", name: "Leãozinho" },
            { emoji: "🐑", name: "Ovelhinha" },
            { emoji: "🦒", name: "Girafa" },
            { emoji: "🐫", name: "Camelo da Bíblia" },
            { emoji: "🦕", name: "Braquiossauro" },
            { emoji: "🕊️", name: "Pombinha" },
          ];
          const chosenWatcher = watcherOptions[Math.floor(Math.random() * watcherOptions.length)];
          setWatchers((prev) => [
            ...prev,
            {
              id: itemCounterRef.current + 5000,
              emoji: chosenWatcher.emoji,
              side: Math.random() > 0.5 ? "left" : "right",
              y: -12,
              name: chosenWatcher.name,
            },
          ]);
        }
      }

      // Atualiza posição dos itens e detecta colisão com o carrinho
      setItems((prev) => {
        const next: TrackItem[] = [];
        const currentX = carXRef.current;

        for (const item of prev) {
          const newY = item.y + delta * gameSpeed;

          // Detecção de colisão quando o item passa pela área do carrinho (Y entre 64% e 82%)
          if (newY >= 64 && newY <= 82 && Math.abs(item.x - currentX) < 16) {
            if (item.type === "star") {
              sounds.playStar();
              setScore((s) => {
                const nextScore = s + 1;
                if (nextScore % 10 === 0) {
                  confetti({ particleCount: 70, spread: 80, origin: { y: 0.8 } });
                  sounds.playSuccess();
                }
                return nextScore;
              });
            } else if (item.type === "scroll") {
              // Pergaminho Sagrado da Bíblia: 2 estrelas + som de bênção
              sounds.playChime(1046.5);
              sounds.playStar();
              setScore((s) => s + 2);
              confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
            } else if (item.type === "dove") {
              // Pombinha da Paz de Noé: 3 estrelas!
              sounds.playChime(1318.5);
              sounds.playStar();
              setScore((s) => s + 3);
            } else if (item.type === "heart") {
              sounds.playPop();
              setScore((s) => s + 1);
            } else if (item.type === "turbo") {
              triggerTurbo();
            } else if (item.type === "puddle") {
              sounds.playSplash();
              setIsSplashing(true);
              setTimeout(() => setIsSplashing(false), 550);
            } else if (item.type === "ramp") {
              sounds.playBoing();
              setIsJumping(true);
              setTimeout(() => setIsJumping(false), 700);
            }
            continue; // Item consumido
          }

          if (newY < 112) {
            next.push({ ...item, y: newY });
          }
        }
        return next;
      });

      // Atualiza espectadores
      setWatchers((prev) =>
        prev
          .map((w) => ({ ...w, y: w.y + delta * gameSpeed }))
          .filter((w) => w.y < 112)
      );

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isTurboActive, triggerTurbo]);

  // Controle por arrasto / toque direto na pista
  const updateCarFromPointer = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(18, Math.min(82, relX));
    const diff = clamped - carX;
    setCarTilt(Math.max(-16, Math.min(16, diff * 1.8)));
    setCarX(clamped);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateCarFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      updateCarFromPointer(e.clientX);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setCarTilt(0);
  };

  return (
    <div className="relative w-full h-full flex-1 select-none overflow-hidden bg-slate-900">
      {/* PALCO DA PISTA COM PERSPECTIVA E CURVAS DINÂMICAS */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-full overflow-hidden touch-none cursor-grab active:cursor-grabbing select-none"
      >
        {/* CÉU COM SOL BÍBLICO E MONTANHAS AO FUNDO */}
        <div className="absolute top-0 left-0 right-0 h-[28%] bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200 overflow-hidden pointer-events-none z-0">
          {/* Sol da Criação */}
          <div className="absolute top-3 left-10 text-5xl animate-pulse">☀️</div>
          {/* Nuvens Flutuantes */}
          <div className="absolute top-4 left-1/3 text-4xl opacity-75">☁️</div>
          <div className="absolute top-7 right-16 text-3xl opacity-80">☁️</div>
          {/* Pombinha voando no céu */}
          <div className="absolute top-6 right-1/3 text-3xl animate-bounce">🕊️</div>

          {/* Colinas ao fundo que se deslocam suavemente com a curva */}
          <div
            className="absolute bottom-0 left-[-20%] right-[-20%] h-14 bg-emerald-600 rounded-t-[100%] transition-transform duration-200 opacity-90"
            style={{ transform: `translateX(${roadCurve * 1.2}px)` }}
          />
          <div
            className="absolute bottom-0 left-[-15%] right-[-15%] h-10 bg-emerald-500 rounded-t-[100%] transition-transform duration-200"
            style={{ transform: `translateX(${roadCurve * 0.8}px)` }}
          />
        </div>

        {/* ESTRADA COM CURVA DINÂMICA */}
        <div
          className="absolute top-[26%] bottom-0 left-0 right-0 transition-transform duration-100 ease-out overflow-hidden"
          style={{
            transform: `perspective(600px) rotateX(15deg) translateX(${roadCurve * 1.5}px)`,
          }}
        >
          {/* Asfalto da Pista */}
          <div className="absolute inset-0 bg-slate-800">
            {/* Gramado Lateral Esquerdo com Textura */}
            <div className="absolute left-0 top-0 bottom-0 w-[14%] bg-gradient-to-r from-emerald-700 to-emerald-500 border-r-4 border-dashed border-white/60 flex flex-col justify-around items-center">
              <span className="text-3xl sm:text-5xl opacity-90 drop-shadow">🌳</span>
              <span className="text-3xl sm:text-4xl opacity-90 drop-shadow">🌸</span>
              <span className="text-3xl sm:text-5xl opacity-90 drop-shadow">🌴</span>
              <span className="text-3xl sm:text-4xl opacity-90 drop-shadow">🌺</span>
            </div>

            {/* Gramado Lateral Direito com Textura */}
            <div className="absolute right-0 top-0 bottom-0 w-[14%] bg-gradient-to-l from-emerald-700 to-emerald-500 border-l-4 border-dashed border-white/60 flex flex-col justify-around items-center">
              <span className="text-3xl sm:text-5xl opacity-90 drop-shadow">🌴</span>
              <span className="text-3xl sm:text-4xl opacity-90 drop-shadow">🌻</span>
              <span className="text-3xl sm:text-5xl opacity-90 drop-shadow">🌳</span>
              <span className="text-3xl sm:text-4xl opacity-90 drop-shadow">🌼</span>
            </div>

            {/* Zebras Coloridas nas Bordas da Pista (Guarda-corpos de Corrida) */}
            <div className="absolute left-[14%] top-0 bottom-0 w-3 bg-stripes-yellow-red" />
            <div className="absolute right-[14%] top-0 bottom-0 w-3 bg-stripes-yellow-red" />

            {/* Linhas Pontilhadas Centrais da Pista que Aceleram no Turbo */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-4 flex flex-col justify-around opacity-90 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-full h-14 bg-kids-yellow rounded-full my-2 shadow-[0_0_8px_rgba(251,191,36,0.6)] ${
                    isTurboActive ? "animate-pulse" : ""
                  }`}
                />
              ))}
            </div>

            {/* Linhas Laterais de Pista Dupla */}
            <div className="absolute left-[34%] top-0 bottom-0 w-1 border-r-2 border-dashed border-white/40 pointer-events-none" />
            <div className="absolute right-[34%] top-0 bottom-0 w-1 border-l-2 border-dashed border-white/40 pointer-events-none" />
          </div>
        </div>

        {/* EFEITO DE VELOCIDADE TURBO / NITRO: LINHAS DE VENTO */}
        {isTurboActive && (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 bg-gradient-to-b from-transparent via-cyan-300 to-white rounded-full animate-ping opacity-70"
                style={{
                  left: `${8 + i * 8}%`,
                  top: `${Math.random() * 80}%`,
                  height: `${60 + Math.random() * 100}px`,
                  animationDuration: "0.35s",
                }}
              />
            ))}
          </div>
        )}

        {/* BICHINHOS ESPECTADORES NAS MARGENS DA PISTA */}
        {watchers.map((w) => (
          <div
            key={w.id}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playPop();
            }}
            className="absolute z-20 text-4xl sm:text-6xl transition-transform hover:scale-130 active:scale-150 animate-wiggle drop-shadow-lg cursor-pointer"
            style={{
              left: w.side === "left" ? "2.5%" : "87.5%",
              top: `${w.y}%`,
            }}
            title={w.name}
          >
            {w.emoji}
          </div>
        ))}

        {/* ITENS COLETÁVEIS E OBSTÁCULOS NA PISTA */}
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-15 pointer-events-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
          >
            {/* 1. Estrela Dourada */}
            {item.type === "star" && (
              <div className="text-4xl sm:text-6xl drop-shadow-[0_4px_10px_rgba(251,191,36,0.8)] animate-spin" style={{ animationDuration: "2.5s" }}>
                ⭐
              </div>
            )}

            {/* 2. Pergaminho Bíblico Sagrado */}
            {item.type === "scroll" && (
              <div className="flex flex-col items-center bg-amber-100/90 border-2 border-amber-500 rounded-2xl px-2 py-1 shadow-lg animate-bounce">
                <span className="text-3xl sm:text-5xl">📜</span>
                <span className="text-[10px] sm:text-xs font-black text-amber-900 bg-amber-300 px-1.5 rounded-full">
                  BÍBLIA
                </span>
              </div>
            )}

            {/* 3. Pombinha da Paz da Arca */}
            {item.type === "dove" && (
              <div className="text-4xl sm:text-6xl drop-shadow-lg animate-wiggle">
                🕊️
              </div>
            )}

            {/* 4. Coraçãozinho de Amor */}
            {item.type === "heart" && (
              <div className="text-4xl sm:text-6xl drop-shadow-lg animate-pulse">
                ❤️
              </div>
            )}

            {/* 5. Pad de Turbo Nitro */}
            {item.type === "turbo" && (
              <div className="bg-gradient-to-r from-amber-400 to-cyan-400 border-3 border-white rounded-2xl px-3 py-1.5 flex items-center gap-1 shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-pulse">
                <span className="text-2xl sm:text-4xl">⚡</span>
                <span className="font-black text-xs sm:text-sm text-slate-900">TURBO!</span>
              </div>
            )}

            {/* 6. Poça d'água */}
            {item.type === "puddle" && (
              <div className="bg-sky-400/90 border-3 border-white/80 rounded-full w-20 h-12 sm:w-28 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                💦
              </div>
            )}

            {/* 7. Rampa de Salto */}
            {item.type === "ramp" && (
              <div className="bg-gradient-to-b from-amber-400 to-orange-500 border-3 border-yellow-200 rounded-xl px-4 py-2 text-center font-black text-white shadow-2xl flex items-center gap-1">
                <span className="text-xl sm:text-2xl">🔺</span>
                <span className="text-xs sm:text-base tracking-wider">PULA!</span>
              </div>
            )}
          </div>
        ))}

        {/* EFEITO VISUAL DE SPLASH */}
        {isSplashing && (
          <div
            className="absolute z-30 text-8xl animate-ping pointer-events-none -translate-x-1/2"
            style={{ left: `${carX}%`, top: "68%" }}
          >
            💦
          </div>
        )}

        {/* VEÍCULO DO JOGADOR COM TILT DINÂMICO E ANIMAÇÃO */}
        <div
          className={`absolute z-25 -translate-x-1/2 pointer-events-none transition-transform duration-100 ease-out ${
            isJumping ? "scale-145 -translate-y-16" : "scale-100"
          }`}
          style={{
            left: `${carX}%`,
            top: "65%",
            transform: `translateX(-50%) rotate(${carTilt}deg) ${isJumping ? "scale(1.4) translateY(-40px)" : ""}`,
          }}
        >
          {/* Efeito de Fogo / Chama no Turbo */}
          {isTurboActive && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
              <span className="text-3xl sm:text-4xl animate-bounce">🔥</span>
              <span className="text-4xl sm:text-5xl animate-pulse">🔥</span>
              <span className="text-3xl sm:text-4xl animate-bounce">🔥</span>
            </div>
          )}

          {/* 1. JIPE DA ARCA DE NOÉ (Safari Bíblico) */}
          {vehicle === "safari" && (
            <div className="w-26 h-38 sm:w-36 sm:h-52 drop-shadow-2xl">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                {/* Rodas Robustas */}
                <rect x="4" y="28" width="18" height="36" rx="6" fill="#0F172A" />
                <rect x="118" y="28" width="18" height="36" rx="6" fill="#0F172A" />
                <rect x="4" y="138" width="18" height="36" rx="6" fill="#0F172A" />
                <rect x="118" y="138" width="18" height="36" rx="6" fill="#0F172A" />
                {/* Chassi Jipe Laranja/Madeira */}
                <rect x="18" y="16" width="104" height="168" rx="20" fill="#D97706" stroke="#78350F" strokeWidth="5" />
                <rect x="30" y="22" width="80" height="40" rx="8" fill="#B45309" />
                {/* Para-brisa com Noé e Leãozinho */}
                <rect x="26" y="65" width="88" height="32" rx="8" fill="#E0F2FE" stroke="#78350F" strokeWidth="3" />
                <text x="36" y="90" fontSize="22">🧔</text>
                <text x="80" y="90" fontSize="22">🦁</text>
                {/* Roda Sobressalente na Traseira com Cruz Dourada */}
                <circle cx="70" cy="162" r="22" fill="#0F172A" stroke="#334155" strokeWidth="4" />
                <circle cx="70" cy="162" r="9" fill="#F59E0B" />
                {/* Bagageiro e Faróis */}
                <rect x="24" y="10" width="92" height="10" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
                <circle cx="36" cy="15" r="7" fill="#FEF08A" />
                <circle cx="104" cy="15" r="7" fill="#FEF08A" />
              </svg>
            </div>
          )}

          {/* 2. CARRUAGEM DE FOGO DO PROFETA ELIAS */}
          {vehicle === "chariot" && (
            <div className="w-26 h-38 sm:w-36 sm:h-52 drop-shadow-2xl">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                {/* Rodas Flamejantes de Fogo */}
                <rect x="4" y="28" width="18" height="36" rx="6" fill="#EA580C" />
                <rect x="118" y="28" width="18" height="36" rx="6" fill="#EA580C" />
                <rect x="4" y="138" width="18" height="36" rx="6" fill="#EA580C" />
                <rect x="118" y="138" width="18" height="36" rx="6" fill="#EA580C" />
                {/* Corpo Dourado Reluzente da Carruagem */}
                <rect x="18" y="16" width="104" height="168" rx="22" fill="#FBBF24" stroke="#B45309" strokeWidth="5" />
                <path d="M 28 35 L 70 12 L 112 35 L 102 165 L 38 165 Z" fill="#F59E0B" opacity="0.6" />
                {/* Para-brisa com Chama Celestial */}
                <rect x="28" y="65" width="84" height="32" rx="8" fill="#FEF08A" stroke="#B45309" strokeWidth="3" />
                <text x="46" y="90" fontSize="26">👑</text>
                <text x="76" y="90" fontSize="24">🔥</text>
                {/* Labaredas Laterais */}
                <polygon points="26,110 14,130 26,150" fill="#EF4444" />
                <polygon points="114,110 126,130 114,150" fill="#EF4444" />
                {/* Faróis Dourados */}
                <circle cx="36" cy="18" r="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
                <circle cx="104" cy="18" r="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
              </svg>
            </div>
          )}

          {/* 3. CAMINHÃO DE BOMBEIROS SALVADOR */}
          {vehicle === "fire" && (
            <div className="w-26 h-38 sm:w-36 sm:h-52 drop-shadow-2xl">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                <rect x="6" y="30" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="118" y="30" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="6" y="140" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="118" y="140" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="18" y="15" width="104" height="170" rx="18" fill="#DC2626" stroke="#7F1D1D" strokeWidth="5" />
                <rect x="18" y="90" width="104" height="18" fill="#FFFFFF" />
                <text x="48" y="104" fontSize="13" fontWeight="900" fill="#DC2626">SALVADOR</text>
                <path d="M 28 35 Q 70 26 112 35 L 112 70 Q 70 65 28 70 Z" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="3" />
                <circle cx="70" cy="50" r="14" fill="#FED7AA" />
                <rect x="58" y="34" width="24" height="10" rx="4" fill="#F59E0B" />
                {/* Giroflex Duplo */}
                <rect x="44" y="18" width="22" height="8" rx="3" fill="#38BDF8" className="animate-ping" />
                <rect x="74" y="18" width="22" height="8" rx="3" fill="#EF4444" className="animate-ping" />
                {/* Escada na Traseira */}
                <rect x="42" y="115" width="56" height="60" rx="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="130" x2="98" y2="130" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="145" x2="98" y2="145" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="160" x2="98" y2="160" stroke="#64748B" strokeWidth="3" />
              </svg>
            </div>
          )}

          {/* 4. DINO DA CRIAÇÃO */}
          {vehicle === "dino" && (
            <div className="w-26 h-38 sm:w-36 sm:h-52 drop-shadow-2xl">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                <rect x="2" y="25" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="116" y="25" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="2" y="135" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="116" y="135" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <path d="M 22 45 Q 70 10 118 45 L 118 170 Q 70 185 22 170 Z" fill="#15803D" stroke="#14532D" strokeWidth="5" />
                {/* Olhos Amigáveis */}
                <circle cx="44" cy="55" r="10" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
                <circle cx="44" cy="55" r="4" fill="#000000" />
                <circle cx="96" cy="55" r="10" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
                <circle cx="96" cy="55" r="4" fill="#000000" />
                {/* Espinhos de Dino */}
                <polygon points="62,90 70,72 78,90" fill="#EAB308" />
                <polygon points="62,120 70,102 78,120" fill="#EAB308" />
                <polygon points="62,150 70,132 78,150" fill="#EAB308" />
              </svg>
            </div>
          )}
        </div>

        {/* HUD SUPERIOR: SELEÇÃO DE VEÍCULO + VELOCÍMETRO + ESTRELAS */}
        <div className="absolute top-2 left-2 right-2 z-30 flex items-center justify-between pointer-events-none">
          {/* Seletor de Veículos */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white/90 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border-3 border-kids-yellow shadow-kid pointer-events-auto">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playPop();
                  setVehicle(v.id);
                }}
                className={`kid-btn px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border-2 transition-all ${
                  vehicle === v.id
                    ? "bg-kids-yellow border-amber-600 scale-105 shadow-md ring-2 ring-yellow-300"
                    : "bg-slate-50 border-slate-200"
                }`}
                title={v.name}
              >
                <span className="text-xl sm:text-3xl">{v.icon}</span>
              </button>
            ))}
          </div>

          {/* Contador de Estrelas Bíblicas */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-400 border-3 border-amber-600 px-3.5 py-1 sm:px-5 sm:py-2 rounded-2xl shadow-kid pointer-events-auto">
            <span className="text-xl sm:text-3xl">⭐</span>
            <span className="text-lg sm:text-3xl font-black text-amber-950">
              {score}
            </span>
          </div>
        </div>

        {/* CONTROLES TÁTEIS MOBILE INTELIGENTES (ELEVADOS ACIMA DO TOAST DO SISTEMA) */}
        <div className="absolute bottom-4 sm:bottom-6 left-3 right-3 z-30 flex items-center justify-between pointer-events-none pb-[max(6px,env(safe-area-inset-bottom))]">
          {/* Pedais de Direção Esquerda / Direita (Perfeitos para o Polegar no Celular) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                setSteerDirection("left");
                sounds.playPop();
              }}
              onPointerUp={() => setSteerDirection(null)}
              onPointerCancel={() => setSteerDirection(null)}
              className="kid-btn w-14 h-14 sm:w-20 sm:h-20 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-sky-800 shadow-kid-lg flex items-center justify-center active:scale-90"
              aria-label="Virar para a Esquerda"
            >
              <ChevronLeft size={36} className="sm:w-12 sm:h-12 stroke-[3.5]" />
            </button>

            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                setSteerDirection("right");
                sounds.playPop();
              }}
              onPointerUp={() => setSteerDirection(null)}
              onPointerCancel={() => setSteerDirection(null)}
              className="kid-btn w-14 h-14 sm:w-20 sm:h-20 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-sky-800 shadow-kid-lg flex items-center justify-center active:scale-90"
              aria-label="Virar para a Direita"
            >
              <ChevronRight size={36} className="sm:w-12 sm:h-12 stroke-[3.5]" />
            </button>
          </div>

          {/* Botão Central de Buzina BI-BI! */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              sounds.playHonk();
            }}
            className="kid-btn pointer-events-auto px-4 sm:px-8 py-2.5 sm:py-3.5 bg-kids-coral hover:bg-rose-500 text-white font-black text-sm sm:text-xl rounded-full border-3 sm:border-4 border-rose-800 shadow-kid active:scale-90 flex items-center gap-1.5"
          >
            <span className="text-xl sm:text-2xl">📢</span>
            <span className="tracking-wide">BI-BI!</span>
          </button>

          {/* Botão de Turbo Nitro 🚀 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerTurbo();
            }}
            className={`kid-btn pointer-events-auto px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-3xl border-3 sm:border-4 font-black text-sm sm:text-xl shadow-kid-lg active:scale-90 flex items-center gap-1.5 ${
              isTurboActive
                ? "bg-amber-400 border-amber-600 text-amber-950 animate-bounce ring-4 ring-yellow-300"
                : "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-800"
            }`}
          >
            <Zap size={22} className="sm:w-7 sm:h-7 stroke-[3] fill-current" />
            <span>TURBO!</span>
          </button>
        </div>
      </div>
    </div>
  );
}
