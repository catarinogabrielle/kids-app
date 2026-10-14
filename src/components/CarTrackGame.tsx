"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";

interface Item {
  id: number;
  type: "star" | "puddle" | "ramp";
  x: number;
  y: number;
}

interface AnimalWatcher {
  id: number;
  emoji: string;
  side: "left" | "right";
  y: number;
  sound: () => void;
}

export function CarTrackGame() {
  const [carType, setCarType] = useState<"fire" | "safari" | "dino">("fire");
  const [carX, setCarX] = useState(50);
  const [starsCollected, setStarsCollected] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isSplashing, setIsSplashing] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [animals, setAnimals] = useState<AnimalWatcher[]>([]);
  const isDraggingRef = useRef(false);

  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const itemCounterRef = useRef<number>(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const vehicles = [
    { id: "fire", icon: "🚒" },
    { id: "safari", icon: "🚙" },
    { id: "dino", icon: "🦖" },
  ];

  useEffect(() => {
    let prevTime = performance.now();

    const updateGame = (time: number) => {
      const delta = (time - prevTime) / 1000;
      prevTime = time;

      if (time - lastSpawnRef.current > 1200) {
        lastSpawnRef.current = time;
        itemCounterRef.current += 1;
        const types: ("star" | "puddle" | "ramp")[] = ["star", "star", "puddle", "ramp"];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const randomLane = [25, 42, 58, 75][Math.floor(Math.random() * 4)];

        setItems((prev) => [
          ...prev,
          {
            id: itemCounterRef.current,
            type: chosenType,
            x: randomLane,
            y: -10,
          },
        ]);

        if (Math.random() > 0.45) {
          const animalList = [
            { emoji: "🐑", sound: () => sounds.playPop() },
            { emoji: "🦁", sound: () => sounds.playBoing() },
            { emoji: "🦒", sound: () => sounds.playStar() },
            { emoji: "🦕", sound: () => sounds.playHonk() },
          ];
          const chosen = animalList[Math.floor(Math.random() * animalList.length)];
          setAnimals((prev) => [
            ...prev,
            {
              id: itemCounterRef.current + 1000,
              emoji: chosen.emoji,
              side: Math.random() > 0.5 ? "left" : "right",
              y: -10,
              sound: chosen.sound,
            },
          ]);
        }
      }

      setItems((prev) => {
        const next: Item[] = [];
        for (const item of prev) {
          const newY = item.y + delta * 38;

          if (newY >= 70 && newY <= 88 && Math.abs(item.x - carX) < 18) {
            if (item.type === "star") {
              sounds.playStar();
              setStarsCollected((s) => {
                const nextStars = s + 1;
                if (nextStars % 10 === 0) {
                  confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
                  sounds.playSuccess();
                }
                return nextStars;
              });
            } else if (item.type === "puddle") {
              sounds.playSplash();
              setIsSplashing(true);
              setTimeout(() => setIsSplashing(false), 500);
            } else if (item.type === "ramp") {
              sounds.playBoing();
              setIsJumping(true);
              setTimeout(() => setIsJumping(false), 600);
            }
            continue;
          }

          if (newY < 110) {
            next.push({ ...item, y: newY });
          }
        }
        return next;
      });

      setAnimals((prev) => {
        return prev
          .map((a) => ({ ...a, y: a.y + delta * 38 }))
          .filter((a) => a.y < 110);
      });

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [carX]);

  const updateCarFromPointer = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(20, Math.min(80, relX));
    setCarX(clamped);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateCarFromPointer(e.clientX);
    sounds.playPop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      updateCarFromPointer(e.clientX);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-4xl mx-auto p-1.5 sm:p-2 select-none overflow-hidden">
      {/* Topo com Veículos & Placar */}
      <div className="w-full flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-1.5 sm:p-3 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-kids-yellow shadow-kid z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-3">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                sounds.playPop();
                setCarType(v.id as typeof carType);
              }}
              className={`kid-btn p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border-3 sm:border-4 transition-all ${
                carType === v.id
                  ? "bg-kids-yellow border-amber-500 scale-105 sm:scale-110 shadow-kid ring-3 sm:ring-4 ring-yellow-300"
                  : "bg-white border-slate-200"
              }`}
            >
              <span className="text-2xl sm:text-4xl">{v.icon}</span>
            </button>
          ))}
        </div>

        {/* Placar de Estrelas */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-amber-100 border-2 border-amber-400 px-3 py-1 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-inner">
          <span className="text-2xl sm:text-3xl animate-bounce">⭐</span>
          <span className="text-xl sm:text-3xl font-black text-amber-900">
            {starsCollected}
          </span>
        </div>
      </div>

      {/* Pista de Corrida Vertical onde a criança DESLIZA COM O DEDO */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex-1 w-full my-2 bg-slate-700 rounded-4xl border-8 border-kids-green overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing touch-none select-none"
      >
        {/* Gramado lateral */}
        <div className="absolute left-0 top-0 bottom-0 w-[14%] bg-kids-green border-r-4 border-dashed border-white/60 flex flex-col items-center justify-around z-10 pointer-events-none">
          <span className="text-3xl opacity-90">🌳</span>
          <span className="text-3xl opacity-90">🌸</span>
          <span className="text-3xl opacity-90">🌳</span>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-[14%] bg-kids-green border-l-4 border-dashed border-white/60 flex flex-col items-center justify-around z-10 pointer-events-none">
          <span className="text-3xl opacity-90">🌳</span>
          <span className="text-3xl opacity-90">🌺</span>
          <span className="text-3xl opacity-90">🌳</span>
        </div>

        {/* Faixa central pontilhada */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-4 flex flex-col justify-around opacity-80 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-full h-10 bg-kids-yellow rounded-full my-3 animate-pulse" />
          ))}
        </div>

        {/* Bichinhos na beira da estrada */}
        {animals.map((a) => (
          <div
            key={a.id}
            onClick={(e) => {
              e.stopPropagation();
              a.sound();
            }}
            className="absolute z-20 text-4xl sm:text-5xl transition-transform hover:scale-125 active:scale-150 animate-wiggle pointer-events-none"
            style={{
              left: a.side === "left" ? "2%" : "88%",
              top: `${a.y}%`,
            }}
          >
            {a.emoji}
          </div>
        ))}

        {/* Itens na pista */}
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
          >
            {item.type === "star" && (
              <div className="text-4xl sm:text-5xl animate-spin" style={{ animationDuration: "2.5s" }}>
                ⭐
              </div>
            )}
            {item.type === "puddle" && (
              <div className="bg-sky-400 border-3 border-sky-100 rounded-full w-16 h-10 flex items-center justify-center text-sm shadow-inner">
                💦
              </div>
            )}
            {item.type === "ramp" && (
              <div className="bg-amber-500 border-3 border-amber-200 rounded-xl px-4 py-2 text-center font-black text-sm text-white shadow-lg">
                🔺🔺
              </div>
            )}
          </div>
        ))}

        {/* Efeito Splash */}
        {isSplashing && (
          <div
            className="absolute z-30 text-6xl animate-ping pointer-events-none"
            style={{ left: `${carX}%`, top: "75%" }}
          >
            💦
          </div>
        )}

        {/* VEÍCULOS ILUSTRADOS EM SVG DE ALTA QUALIDADE */}
        <div
          className={`absolute z-20 -translate-x-1/2 pointer-events-none transition-transform duration-75 ${
            isJumping ? "scale-150 -translate-y-12" : "scale-100"
          }`}
          style={{
            left: `${carX}%`,
            top: "73%",
          }}
        >
          {/* 1. CAMINHÃO DE BOMBEIROS REALISTA & LÚDICO */}
          {carType === "fire" && (
            <div className="w-16 h-24 sm:w-22 sm:h-32 drop-shadow-2xl">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                {/* Rodas pretas com calotas */}
                <rect x="6" y="30" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="118" y="30" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="6" y="140" width="16" height="34" rx="6" fill="#0F172A" />
                <rect x="118" y="140" width="16" height="34" rx="6" fill="#0F172A" />

                {/* Chassi do Caminhão */}
                <rect x="18" y="15" width="104" height="170" rx="18" fill="#DC2626" stroke="#7F1D1D" strokeWidth="5" />

                {/* Faixa branca de emergência */}
                <rect x="18" y="90" width="104" height="18" fill="#FFFFFF" />
                <text x="50" y="104" fontSize="13" fontWeight="900" fill="#DC2626">193</text>

                {/* Cabine e Para-brisa com limpadores */}
                <path d="M 28 35 Q 70 26 112 35 L 112 70 Q 70 65 28 70 Z" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="3" />
                {/* Bombeiro no volante */}
                <circle cx="70" cy="50" r="14" fill="#FED7AA" />
                <rect x="58" y="34" width="24" height="10" rx="4" fill="#F59E0B" />

                {/* Giroflex pulsando no teto */}
                <rect x="44" y="18" width="22" height="8" rx="3" fill="#38BDF8" className="animate-ping" />
                <rect x="74" y="18" width="22" height="8" rx="3" fill="#EF4444" className="animate-ping" />

                {/* Escada Telescópica Prateada na traseira */}
                <rect x="42" y="115" width="56" height="60" rx="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="130" x2="98" y2="130" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="145" x2="98" y2="145" stroke="#64748B" strokeWidth="3" />
                <line x1="42" y1="160" x2="98" y2="160" stroke="#64748B" strokeWidth="3" />

                {/* Faróis Dianteiros Iluminando */}
                <circle cx="34" cy="22" r="7" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
                <circle cx="106" cy="22" r="7" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
              </svg>
            </div>
          )}

          {/* 2. JIPE SAFÁRI DE NOÉ */}
          {carType === "safari" && (
            <div className="w-16 h-24 sm:w-22 sm:h-32 drop-shadow-2xl">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                {/* Pneus Off-road com cravos */}
                <rect x="4" y="30" width="18" height="34" rx="6" fill="#0F172A" />
                <rect x="118" y="30" width="18" height="34" rx="6" fill="#0F172A" />
                <rect x="4" y="140" width="18" height="34" rx="6" fill="#0F172A" />
                <rect x="118" y="140" width="18" height="34" rx="6" fill="#0F172A" />

                {/* Carroceria Camuflada / Safári */}
                <rect x="18" y="15" width="104" height="170" rx="18" fill="#D97706" stroke="#78350F" strokeWidth="5" />

                {/* Capô com detalhes */}
                <rect x="30" y="20" width="80" height="40" rx="8" fill="#B45309" />

                {/* Para-brisa */}
                <rect x="28" y="65" width="84" height="30" rx="6" fill="#E0F2FE" stroke="#78350F" strokeWidth="3" />

                {/* Noé e Leãozinho */}
                <text x="38" y="88" fontSize="20">🧔</text>
                <text x="80" y="88" fontSize="20">🦁</text>

                {/* Estepe / Pneu sobressalente na traseira */}
                <circle cx="70" cy="165" r="20" fill="#0F172A" stroke="#334155" strokeWidth="4" />
                <circle cx="70" cy="165" r="8" fill="#94A3B8" />

                {/* Quebra-mato cromado na frente */}
                <rect x="26" y="10" width="88" height="8" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
                <circle cx="36" cy="14" r="6" fill="#FEF08A" />
                <circle cx="104" cy="14" r="6" fill="#FEF08A" />
              </svg>
            </div>
          )}

          {/* 3. DINO-MÓVEL T-REX COM DENTES E ESCALAS */}
          {carType === "dino" && (
            <div className="w-16 h-24 sm:w-22 sm:h-32 drop-shadow-2xl">
              <svg viewBox="0 0 140 200" className="w-full h-full">
                {/* Pneus Monster gigantes com garras */}
                <rect x="2" y="25" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="116" y="25" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="2" y="135" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />
                <rect x="116" y="135" width="22" height="40" rx="8" fill="#14532D" stroke="#052E16" strokeWidth="3" />

                {/* Chassi Monstro Dino */}
                <path
                  d="M 22 45 Q 70 10 118 45 L 118 170 Q 70 185 22 170 Z"
                  fill="#15803D"
                  stroke="#14532D"
                  strokeWidth="5"
                />

                {/* Mandíbula do T-Rex na frente com Dentes afiados */}
                <rect x="36" y="16" width="68" height="24" rx="8" fill="#166534" />
                <polygon points="42,40 48,28 54,40" fill="#FFFFFF" />
                <polygon points="56,40 62,28 68,40" fill="#FFFFFF" />
                <polygon points="72,40 78,28 84,40" fill="#FFFFFF" />
                <polygon points="86,40 92,28 98,40" fill="#FFFFFF" />

                {/* Olhos do T-Rex brilhando */}
                <circle cx="44" cy="55" r="10" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
                <circle cx="44" cy="55" r="4" fill="#000000" />
                <circle cx="96" cy="55" r="10" fill="#FACC15" stroke="#713F12" strokeWidth="3" />
                <circle cx="96" cy="55" r="4" fill="#000000" />

                {/* Crista de Espinhos nas costas */}
                <polygon points="62,90 70,72 78,90" fill="#EAB308" />
                <polygon points="62,120 70,102 78,120" fill="#EAB308" />
                <polygon points="62,150 70,132 78,150" fill="#EAB308" />

                {/* Cauda de Dino atrás */}
                <path d="M 64 175 Q 70 195 76 175 Z" fill="#166534" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Botão Gigante de Buzina no rodapé */}
      <div className="w-full flex justify-center py-1 flex-shrink-0">
        <button
          onClick={() => sounds.playHonk()}
          className="kid-btn w-full max-w-[240px] sm:max-w-sm py-2 sm:py-3.5 bg-kids-coral hover:bg-rose-500 text-white font-black text-xl sm:text-3xl rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-rose-700 shadow-kid active:scale-90 flex items-center justify-center gap-2 sm:gap-3 animate-pulse-gentle"
        >
          <span className="text-3xl sm:text-4xl">📢</span>
          <span>BI-BI!</span>
        </button>
      </div>
    </div>
  );
}
