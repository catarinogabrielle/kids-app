"use client";

import React from "react";

export function LivingLandscape() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. SOL RADIANTE COM RAIOS GIRATÓRIOS SUAVES */}
      <div className="absolute -top-12 -left-12 sm:-top-8 sm:-left-8 w-44 h-44 sm:w-64 sm:h-64 opacity-90">
        {/* Raios solares em rotação constante */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full animate-sun-spin"
        >
          <g fill="#FDE047" opacity="0.45">
            <polygon points="100,10 106,45 94,45" />
            <polygon points="100,190 106,155 94,155" />
            <polygon points="10,100 45,106 45,94" />
            <polygon points="190,100 155,106 155,94" />
            <polygon points="36,36 62,60 52,68" />
            <polygon points="164,164 138,140 148,132" />
            <polygon points="36,164 60,138 68,148" />
            <polygon points="164,36 140,62 132,52" />
          </g>
        </svg>

        {/* Disco do Sol com Carinha Fofa */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 shadow-[0_0_35px_rgba(250,204,21,0.6)] border-3 border-amber-300/80 flex items-center justify-center animate-pulse-gentle">
            <span className="text-3xl sm:text-4xl drop-shadow select-none">😊</span>
          </div>
        </div>
      </div>

      {/* 2. NUVENS VETORIAIS FLUTUANTES (DESLIZAMENTO SUAVE) */}
      <div className="absolute top-4 left-[20%] w-36 sm:w-56 opacity-75 animate-cloud-drift">
        <svg viewBox="0 0 120 60" fill="#FFFFFF" className="w-full drop-shadow-md">
          <path d="M 20 45 A 18 18 0 0 1 35 22 A 22 22 0 0 1 70 18 A 20 20 0 0 1 100 30 A 16 16 0 0 1 105 45 Z" />
        </svg>
      </div>

      <div className="absolute top-8 right-[10%] w-28 sm:w-44 opacity-60 animate-float-delayed">
        <svg viewBox="0 0 120 60" fill="#FFFFFF" className="w-full drop-shadow-sm">
          <path d="M 20 45 A 18 18 0 0 1 35 22 A 22 22 0 0 1 70 18 A 20 20 0 0 1 100 30 A 16 16 0 0 1 105 45 Z" />
        </svg>
      </div>

      <div className="absolute top-16 left-[50%] w-24 sm:w-36 opacity-50 animate-float-reverse">
        <svg viewBox="0 0 120 60" fill="#FFFFFF" className="w-full drop-shadow-sm">
          <path d="M 20 45 A 18 18 0 0 1 35 22 A 22 22 0 0 1 70 18 A 20 20 0 0 1 100 30 A 16 16 0 0 1 105 45 Z" />
        </svg>
      </div>

      {/* 3. COLINAS ONDULADAS ORGÂNICAS NO RODAPÉ */}
      <div className="absolute bottom-0 inset-x-0 h-24 sm:h-36 md:h-44">
        {/* Colina Distante (Verde Menta Profundo) */}
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="absolute bottom-0 inset-x-0 w-full h-full opacity-60"
        >
          <path
            d="M 0 140 Q 300 60 600 120 T 1200 80 L 1200 200 L 0 200 Z"
            fill="#10B981"
          />
        </svg>

        {/* Colina Frontal (Verde Primavera Vivo com Friso) */}
        <svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="absolute bottom-0 inset-x-0 w-full h-full opacity-85"
        >
          <path
            d="M 0 170 Q 250 110 500 150 T 1000 130 Q 1100 140 1200 155 L 1200 200 L 0 200 Z"
            fill="#34D399"
          />
          <path
            d="M 0 170 Q 250 110 500 150 T 1000 130 Q 1100 140 1200 155"
            stroke="#059669"
            strokeWidth="3"
            fill="none"
            opacity="0.4"
          />
        </svg>

        {/* Flores e Borboletinhas Lúdicas Espalhadas */}
        <div className="absolute bottom-2 inset-x-0 flex justify-around items-end px-6 sm:px-16 pointer-events-none opacity-80">
          <span className="text-xl sm:text-2xl animate-float">🌸</span>
          <span className="text-sm sm:text-lg animate-wiggle">🌼</span>
          <span className="text-lg sm:text-2xl animate-float-delayed">🦋</span>
          <span className="text-sm sm:text-xl">🌷</span>
          <span className="text-xl sm:text-2xl animate-float">🌼</span>
          <span className="text-sm sm:text-lg animate-float-reverse">🌸</span>
        </div>
      </div>
    </div>
  );
}
