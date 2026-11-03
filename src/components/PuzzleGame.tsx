"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { GameHeader } from "@/components/TopBar";
import { RotateCcw, ArrowRight, Eye, Check, Sparkles } from "lucide-react";

export type PuzzleDifficulty = 4 | 6 | 9;

interface DifficultyConfig {
  pieces: PuzzleDifficulty;
  rows: number;
  cols: number;
  label: string;
  emoji: string;
}

const DIFFICULTIES: Record<PuzzleDifficulty, DifficultyConfig> = {
  4: { pieces: 4, rows: 2, cols: 2, label: "4 Peças", emoji: "🌱" },
  6: { pieces: 6, rows: 2, cols: 3, label: "6 Peças", emoji: "⭐" },
  9: { pieces: 9, rows: 3, cols: 3, label: "9 Peças", emoji: "🏆" },
};

interface PieceData {
  id: number;
  row: number;
  col: number;
  path: string;
  viewBox: string;
  centerX: number;
  centerY: number;
  edges: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// ============================================================================
// GERADOR GEOMÉTRICO DE PEÇAS DE QUEBRA-CABEÇA COM ENCAIXES REAIS (TABS & BLANKS)
// ============================================================================

function edgePath(x1: number, y1: number, x2: number, y2: number, tab: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  if (!tab || L === 0) return `L ${x2.toFixed(1)} ${y2.toFixed(1)}`;

  const tx = dx / L;
  const ty = dy / L;
  const nx = dy / L;
  const ny = -dx / L;
  const h = L * 0.22 * tab;

  const p = (u: number, v: number) => {
    const rx = x1 + u * L * tx + v * h * nx;
    const ry = y1 + u * L * ty + v * h * ny;
    return `${rx.toFixed(1)} ${ry.toFixed(1)}`;
  };

  return [
    `L ${p(0.36, 0)}`,
    `C ${p(0.38, 0.05)}, ${p(0.32, 0.35)}, ${p(0.40, 0.70)}`,
    `C ${p(0.46, 1.0)}, ${p(0.54, 1.0)}, ${p(0.60, 0.70)}`,
    `C ${p(0.68, 0.35)}, ${p(0.62, 0.05)}, ${p(0.64, 0)}`,
    `L ${x2.toFixed(1)} ${y2.toFixed(1)}`,
  ].join(" ");
}

function buildPiecePath(
  r: number,
  c: number,
  cw: number,
  ch: number,
  edges: { top: number; right: number; bottom: number; left: number }
): string {
  const x0 = c * cw;
  const y0 = r * ch;
  const x1 = (c + 1) * cw;
  const y1 = (r + 1) * ch;

  return [
    `M ${x0.toFixed(1)} ${y0.toFixed(1)}`,
    edgePath(x0, y0, x1, y0, edges.top),
    edgePath(x1, y0, x1, y1, edges.right),
    edgePath(x1, y1, x0, y1, edges.bottom),
    edgePath(x0, y1, x0, y0, edges.left),
    "Z",
  ].join(" ");
}

function generatePuzzlePieces(rows: number, cols: number, W = 400, H = 300): PieceData[] {
  const cw = W / cols;
  const ch = H / rows;

  const hTabs: number[][] = [];
  for (let r = 0; r < rows - 1; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push((r + c) % 2 === 0 ? 1 : -1);
    }
    hTabs.push(row);
  }

  const vTabs: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols - 1; c++) {
      row.push((r + c) % 2 === 0 ? 1 : -1);
    }
    vTabs.push(row);
  }

  const pieces: PieceData[] = [];
  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const edges = {
        top: r === 0 ? 0 : -hTabs[r - 1][c],
        right: c === cols - 1 ? 0 : vTabs[r][c],
        bottom: r === rows - 1 ? 0 : hTabs[r][c],
        left: c === 0 ? 0 : -vTabs[r][c - 1],
      };
      const path = buildPiecePath(r, c, cw, ch, edges);
      const x0 = c * cw;
      const x1 = (c + 1) * cw;
      const y0 = r * ch;
      const y1 = (r + 1) * ch;

      const minX = x0 - (edges.left === 1 ? ch * 0.25 : 0) - 4;
      const maxX = x1 + (edges.right === 1 ? ch * 0.25 : 0) + 4;
      const minY = y0 - (edges.top === 1 ? cw * 0.25 : 0) - 4;
      const maxY = y1 + (edges.bottom === 1 ? cw * 0.25 : 0) + 4;
      const padW = maxX - minX + 8;
      const padH = maxY - minY + 8;

      pieces.push({
        id,
        row: r,
        col: c,
        path,
        viewBox: `${(minX - 4).toFixed(1)} ${(minY - 4).toFixed(1)} ${padW.toFixed(1)} ${padH.toFixed(1)}`,
        centerX: (c + 0.5) * cw,
        centerY: (r + 0.5) * ch,
        edges,
      });
      id++;
    }
  }
  return pieces;
}

// ============================================================================
// 6 ILUSTRAÇÕES BÍBLICAS E INFANTIS DE ALTA FIDELIDADE
// ============================================================================

interface PuzzleDefinition {
  id: string;
  title: string;
  icon: string;
  renderElements: () => React.ReactNode;
}

const PUZZLES: PuzzleDefinition[] = [
  {
    id: "lion",
    title: "O Rei Leão",
    icon: "🦁",
    renderElements: () => (
      <>
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
      </>
    ),
  },
  {
    id: "ark",
    title: "A Arca de Noé",
    icon: "🛳️",
    renderElements: () => (
      <>
        <rect width="400" height="215" fill="#BAE6FD" />
        <path d="M 30 215 A 170 165 0 0 1 370 215" stroke="#EF4444" strokeWidth="16" fill="none" />
        <path d="M 45 215 A 155 150 0 0 1 355 215" stroke="#F59E0B" strokeWidth="15" fill="none" />
        <path d="M 60 215 A 140 135 0 0 1 340 215" stroke="#FDE047" strokeWidth="15" fill="none" />
        <path d="M 75 215 A 125 120 0 0 1 325 215" stroke="#10B981" strokeWidth="15" fill="none" />
        <circle cx="58" cy="52" r="30" fill="#FDE047" stroke="#F59E0B" strokeWidth="4" />
        <polygon points="85,120 200,52 315,120" fill="#DC2626" stroke="#451A03" strokeWidth="5" />
        <rect x="102" y="118" width="196" height="62" rx="8" fill="#D97706" stroke="#451A03" strokeWidth="5" />
        <rect x="122" y="130" width="42" height="38" rx="8" fill="#FEF3C7" stroke="#451A03" strokeWidth="3.5" />
        <rect x="179" y="130" width="42" height="38" rx="8" fill="#FEF3C7" stroke="#451A03" strokeWidth="3.5" />
        <rect x="236" y="130" width="42" height="38" rx="8" fill="#FEF3C7" stroke="#451A03" strokeWidth="3.5" />
        <path d="M 38 175 Q 200 186 362 175 L 332 242 Q 200 258 68 242 Z" fill="#92400E" stroke="#451A03" strokeWidth="5.5" />
        <circle cx="115" cy="204" r="9" fill="#38BDF8" stroke="#451A03" strokeWidth="3" />
        <circle cx="172" cy="206" r="9" fill="#38BDF8" stroke="#451A03" strokeWidth="3" />
        <circle cx="228" cy="206" r="9" fill="#38BDF8" stroke="#451A03" strokeWidth="3" />
        <circle cx="285" cy="204" r="9" fill="#38BDF8" stroke="#451A03" strokeWidth="3" />
        <path d="M 0 228 Q 50 212 100 228 T 200 228 T 300 228 T 400 228 L 400 300 L 0 300 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="4" />
        <path d="M 0 255 Q 60 240 120 255 T 240 255 T 360 255 T 480 255 L 480 300 L 0 300 Z" fill="#0369A1" />
      </>
    ),
  },
  {
    id: "sheep",
    title: "Ovelha do Bom Pastor",
    icon: "🐑",
    renderElements: () => (
      <>
        {/* Céu suave e Sol da Criação */}
        <rect width="400" height="210" fill="#E0F2FE" />
        <circle cx="340" cy="50" r="28" fill="#FDE047" stroke="#F59E0B" strokeWidth="4" />
        {/* Colinas verdejantes */}
        <path d="M 0 210 Q 120 160 240 195 T 400 180 L 400 300 L 0 300 Z" fill="#86EFAC" />
        <path d="M 0 225 Q 180 195 400 225 L 400 300 L 0 300 Z" fill="#22C55E" stroke="#15803D" strokeWidth="4" />
        {/* Riacho de águas tranquilas */}
        <path d="M 0 270 Q 200 250 400 280 L 400 300 L 0 300 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="3" />
        {/* Patinhas da Ovelha */}
        <rect x="160" y="220" width="14" height="38" rx="6" fill="#475569" stroke="#1E293B" strokeWidth="3" />
        <rect x="190" y="222" width="14" height="36" rx="6" fill="#475569" stroke="#1E293B" strokeWidth="3" />
        <rect x="225" y="222" width="14" height="36" rx="6" fill="#475569" stroke="#1E293B" strokeWidth="3" />
        <rect x="255" y="220" width="14" height="38" rx="6" fill="#475569" stroke="#1E293B" strokeWidth="3" />
        {/* Rabinho de Algodão */}
        <circle cx="288" cy="180" r="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
        {/* Corpo de Lã Fofa (Nuvem de Algodão) */}
        <g fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3">
          <circle cx="160" cy="180" r="24" />
          <circle cx="190" cy="165" r="28" />
          <circle cx="230" cy="165" r="28" />
          <circle cx="260" cy="180" r="26" />
          <circle cx="245" cy="205" r="24" />
          <circle cx="210" cy="212" r="25" />
          <circle cx="175" cy="205" r="24" />
          <circle cx="210" cy="185" r="32" fill="#FFFFFF" stroke="none" />
        </g>
        {/* Cabeça da Ovelhinha */}
        <ellipse cx="140" cy="150" rx="26" ry="32" fill="#FED7AA" stroke="#78350F" strokeWidth="3.5" />
        {/* Topete de Lã */}
        <circle cx="140" cy="120" r="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
        <circle cx="128" cy="125" r="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
        <circle cx="152" cy="125" r="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
        {/* Orelhas caídas fofas */}
        <path d="M 116 138 C 95 145 92 165 110 162 Z" fill="#FED7AA" stroke="#78350F" strokeWidth="3" />
        <path d="M 164 138 C 185 145 188 165 170 162 Z" fill="#FED7AA" stroke="#78350F" strokeWidth="3" />
        {/* Olhinhos e Sorriso */}
        <circle cx="130" cy="148" r="5" fill="#1E293B" />
        <circle cx="132" cy="146" r="1.8" fill="#FFFFFF" />
        <circle cx="150" cy="148" r="5" fill="#1E293B" />
        <circle cx="152" cy="146" r="1.8" fill="#FFFFFF" />
        <ellipse cx="140" cy="160" rx="4" ry="3" fill="#FB7185" />
        <path d="M 134 166 Q 140 172 146 166" stroke="#78350F" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Flores no pasto */}
        <text x="50" y="275" fontSize="22">🌸</text>
        <text x="320" y="260" fontSize="24">🌼</text>
        <text x="90" y="250" fontSize="20">🌷</text>
      </>
    ),
  },
  {
    id: "dino",
    title: "Super Dino Rex",
    icon: "🦖",
    renderElements: () => (
      <>
        <rect width="400" height="215" fill="#FEF9C3" />
        <circle cx="58" cy="48" r="28" fill="#F59E0B" />
        <polygon points="225,215 280,75 325,75 380,215" fill="#94A3B8" stroke="#334155" strokeWidth="4" />
        <path d="M 280 75 L 325 75 L 334 105 Q 315 118 302 102 Q 290 118 272 105 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3.5" />
        <rect y="215" width="400" height="85" fill="#22C55E" stroke="#15803D" strokeWidth="4" />
        <polygon points="130,52 146,24 164,48" fill="#F59E0B" stroke="#78350F" strokeWidth="3.5" />
        <polygon points="105,80 112,50 134,72" fill="#F59E0B" stroke="#78350F" strokeWidth="3.5" />
        <polygon points="92,120 84,92 110,106" fill="#F59E0B" stroke="#78350F" strokeWidth="3.5" />
        <path
          d="M 122 115 C 105 75 138 38 190 42 C 242 45 272 65 272 95 C 272 120 245 132 208 132 C 230 156 242 198 230 242 C 218 272 172 282 128 275 C 82 275 35 252 24 218 C 20 202 38 198 50 208 C 70 222 92 222 102 195 C 108 165 112 138 122 115 Z"
          fill="#10B981"
          stroke="#064E3B"
          strokeWidth="5"
        />
        <path
          d="M 186 136 C 224 152 234 202 220 245 C 208 268 186 272 168 265 C 182 225 182 178 186 136 Z"
          fill="#FDE047"
          stroke="#064E3B"
          strokeWidth="4"
        />
        <circle cx="188" cy="74" r="14" fill="#FFFFFF" stroke="#064E3B" strokeWidth="3.5" />
        <circle cx="192" cy="74" r="7" fill="#1E293B" />
        <path d="M 198 104 Q 232 118 262 100" stroke="#064E3B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "fire",
    title: "Caminhão de Bombeiros",
    icon: "🚒",
    renderElements: () => (
      <>
        <rect width="400" height="215" fill="#BAE6FD" />
        <rect y="215" width="400" height="85" fill="#475569" stroke="#1E293B" strokeWidth="4" />
        <circle cx="62" cy="48" r="26" fill="#FDE047" stroke="#F59E0B" strokeWidth="3.5" />
        <rect x="148" y="55" width="215" height="26" rx="6" fill="#F8FAFC" stroke="#334155" strokeWidth="4" />
        <path d="M 88 104 C 88 76 118 76 118 104 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" />
        <path d="M 35 215 L 35 142 Q 35 104 75 104 L 155 104 L 155 215 Z" fill="#EF4444" stroke="#7F1D1D" strokeWidth="5" />
        <rect x="155" y="104" width="210" height="111" rx="10" fill="#DC2626" stroke="#7F1D1D" strokeWidth="5" />
        <rect x="35" y="176" width="330" height="16" fill="#FDE047" stroke="#7F1D1D" strokeWidth="3.5" />
        <path d="M 52 162 L 52 132 Q 52 118 70 118 L 136 118 L 136 162 Z" fill="#E0F2FE" stroke="#7F1D1D" strokeWidth="4" />
        <rect x="175" y="120" width="85" height="50" rx="6" fill="#CBD5E1" stroke="#334155" strokeWidth="3.5" />
        <circle cx="310" cy="145" r="26" fill="#F87171" stroke="#7F1D1D" strokeWidth="4" />
        <circle cx="310" cy="145" r="10" fill="#FFFFFF" stroke="#7F1D1D" strokeWidth="3" />
        <circle cx="95" cy="222" r="34" fill="#1E293B" stroke="#0F172A" strokeWidth="5" />
        <circle cx="95" cy="222" r="16" fill="#E2E8F0" />
        <circle cx="218" cy="222" r="34" fill="#1E293B" stroke="#0F172A" strokeWidth="5" />
        <circle cx="218" cy="222" r="16" fill="#E2E8F0" />
        <circle cx="315" cy="222" r="34" fill="#1E293B" stroke="#0F172A" strokeWidth="5" />
        <circle cx="315" cy="222" r="16" fill="#E2E8F0" />
      </>
    ),
  },
  {
    id: "stars",
    title: "Estrela de Belém & Céu",
    icon: "✨",
    renderElements: () => (
      <>
        {/* Céu noturno degradê azul royal e roxo */}
        <rect width="400" height="215" fill="#1E1B4B" />
        {/* Colinas noturnas */}
        <path d="M 0 215 Q 120 180 240 210 T 400 195 L 400 300 L 0 300 Z" fill="#312E81" />
        <path d="M 0 230 Q 200 210 400 235 L 400 300 L 0 300 Z" fill="#1E1B4B" stroke="#4338CA" strokeWidth="3" />
        {/* Lua Crescente Dourada */}
        <path d="M 330 40 A 24 24 0 1 0 354 84 A 20 20 0 1 1 330 40 Z" fill="#FDE047" stroke="#F59E0B" strokeWidth="2.5" />
        {/* Estrelinhas cintilantes espalhadas */}
        <circle cx="60" cy="50" r="3" fill="#FFFFFF" />
        <circle cx="110" cy="80" r="2.5" fill="#FEF08A" />
        <circle cx="160" cy="40" r="2" fill="#FFFFFF" />
        <circle cx="290" cy="65" r="3" fill="#FFFFFF" />
        <circle cx="370" cy="110" r="2.5" fill="#FEF08A" />
        <circle cx="50" cy="120" r="2" fill="#FFFFFF" />
        {/* Grande Estrela Guia de Belém */}
        <g transform="translate(200, 75)">
          {/* Brilho halo */}
          <circle cx="0" cy="0" r="38" fill="#FDE047" opacity="0.3" />
          <circle cx="0" cy="0" r="22" fill="#FEF08A" opacity="0.5" />
          {/* Raios pontudos de 8 pontas */}
          <polygon points="0,-42 5,-10 32,-32 10,-5 42,0 10,5 32,32 5,10 0,42 -5,10 -32,32 -10,5 -42,0 -10,-5 -32,-32 -5,-10" fill="#FDE047" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="10" fill="#FFFFFF" />
        </g>
        {/* Pombinha branca da Paz voando */}
        <g transform="translate(110, 140) scale(0.85)">
          <path d="M 0 10 Q 15 -15 35 -10 Q 25 15 15 20 L -10 25 Q -5 18 0 10 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="32" cy="-6" r="7" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
          <polygon points="38,-8 46,-6 38,-4" fill="#F59E0B" />
          <circle cx="34" cy="-7" r="1.5" fill="#0F172A" />
          {/* Asinha */}
          <path d="M 12 10 Q 22 -12 4 0 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
        </g>
        {/* Ovelhinha serena no pasto */}
        <g transform="translate(260, 215) scale(0.65)">
          <ellipse cx="40" cy="30" rx="30" ry="22" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
          <ellipse cx="12" cy="18" rx="16" ry="14" fill="#FED7AA" stroke="#78350F" strokeWidth="3" />
          <circle cx="8" cy="16" r="3" fill="#1E293B" />
          <path d="M 2 22 Q 8 26 14 22" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      </>
    ),
  },
];

export function PuzzleGame({ onHome }: { onHome?: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [difficulty, setDifficulty] = useState<PuzzleDifficulty>(4);
  const [placedPieces, setPlacedPieces] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(true);

  // Arraste com o dedo / mouse
  const [draggingPieceId, setDraggingPieceId] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<number | null>(null);

  const boardSvgRef = useRef<SVGSVGElement | null>(null);

  const currentPuzzle = PUZZLES[currentIdx];
  const diffConfig = DIFFICULTIES[difficulty];

  // Gera as peças com recortes reais de quebra-cabeça para a dificuldade atual
  const pieces = React.useMemo(() => {
    return generatePuzzlePieces(diffConfig.rows, diffConfig.cols, 400, 300);
  }, [diffConfig.rows, diffConfig.cols]);

  const isCompleted = placedPieces.length === pieces.length;

  // Quando muda o puzzle ou dificuldade, reinicia as peças colocadas
  const changeDifficulty = (newDiff: PuzzleDifficulty) => {
    sounds.playPop();
    setDifficulty(newDiff);
    setPlacedPieces([]);
    setDraggingPieceId(null);
    setDragPos(null);
    setHoveredSlotId(null);
  };

  const handlePiecePointerDown = (pieceId: number, e: React.PointerEvent) => {
    if (placedPieces.includes(pieceId)) return;
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignora silenciosamente se o navegador não permitir captura
    }
    setDraggingPieceId(pieceId);
    setDragPos({ x: e.clientX, y: e.clientY });
    setHoveredSlotId(null);
    sounds.playPop();
  };

  const handlePointerUp = useCallback(
    (e: React.PointerEvent | PointerEvent) => {
      if (draggingPieceId === null) return;

      const pieceId = draggingPieceId;
      let targetMatched = false;

      // Se soltou exatamente sobre o slot correto
      if (hoveredSlotId === pieceId) {
        targetMatched = true;
      } else if (boardSvgRef.current) {
        // Checa proximidade com o centro nominal do slot no SVG do tabuleiro
        const rect = boardSvgRef.current.getBoundingClientRect();
        const p = pieces[pieceId];
        const screenSlotX = rect.left + (p.centerX / 400) * rect.width;
        const screenSlotY = rect.top + (p.centerY / 300) * rect.height;
        const dist = Math.hypot(e.clientX - screenSlotX, e.clientY - screenSlotY);
        const threshold = Math.max((rect.width / diffConfig.cols) * 0.7, 55);

        if (dist < threshold) {
          targetMatched = true;
        }
      }

      if (targetMatched) {
        sounds.playSparkle();
        sounds.playSnap();
        const nextPlaced = [...placedPieces, pieceId];
        setPlacedPieces(nextPlaced);

        confetti({
          particleCount: 45,
          spread: 70,
          origin: {
            x: Math.max(0.1, Math.min(0.9, e.clientX / window.innerWidth)),
            y: Math.max(0.1, Math.min(0.9, e.clientY / window.innerHeight)),
          },
        });

        if (nextPlaced.length === pieces.length) {
          sounds.playSuccess();
          confetti({
            particleCount: 120,
            spread: 95,
            origin: { y: 0.5 },
          });
        }
      } else {
        sounds.playBoing();
      }

      setDraggingPieceId(null);
      setDragPos(null);
      setHoveredSlotId(null);
    },
    [draggingPieceId, hoveredSlotId, placedPieces, pieces, diffConfig.cols]
  );

  // Monitoramento do movimento do ponteiro durante o arraste
  useEffect(() => {
    if (draggingPieceId === null) return;

    const onGlobalMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });

      if (!boardSvgRef.current) return;
      const rect = boardSvgRef.current.getBoundingClientRect();

      let matched: number | null = null;
      pieces.forEach((p) => {
        const screenX = rect.left + (p.centerX / 400) * rect.width;
        const screenY = rect.top + (p.centerY / 300) * rect.height;
        const dist = Math.hypot(e.clientX - screenX, e.clientY - screenY);
        const threshold = Math.max((rect.width / diffConfig.cols) * 0.65, 50);

        if (dist < threshold) {
          matched = p.id;
        }
      });

      setHoveredSlotId(matched);
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
  }, [draggingPieceId, handlePointerUp, pieces, diffConfig.cols]);

  // Suporte a toque direto na bandeja (ótimo para crianças bem pequenas)
  const handleDirectClickPiece = (pieceId: number) => {
    if (placedPieces.includes(pieceId) || draggingPieceId !== null) return;
    sounds.playSnap();
    const nextPlaced = [...placedPieces, pieceId];
    setPlacedPieces(nextPlaced);

    confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });

    if (nextPlaced.length === pieces.length) {
      sounds.playSuccess();
      confetti({ particleCount: 110, spread: 90, origin: { y: 0.5 } });
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

  // Peças restantes na bandeja
  const unplacedPieces = pieces.filter((p) => !placedPieces.includes(p.id));

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden touch-none bg-gradient-to-b from-amber-100 via-sky-100 to-emerald-100">
      <GameHeader
        onHome={onHome}
        title="Quebra-Cabeça"
        icon="🧩"
        hideTitleOnMobile={true}
        leftControls={
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Seletor dos 6 Puzzles */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-amber-300 shadow-xs flex-shrink-0">
              {PUZZLES.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    sounds.playPop();
                    setCurrentIdx(idx);
                    setPlacedPieces([]);
                    setDraggingPieceId(null);
                  }}
                  className={`kid-btn p-1 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl transition-all ${
                    currentIdx === idx
                      ? "kid-btn-amber scale-105 shadow-toy-sm"
                      : "bg-transparent hover:bg-slate-100 text-slate-700"
                  }`}
                  title={p.title}
                >
                  <span className="text-xs sm:text-lg">{p.icon}</span>
                </button>
              ))}
            </div>

            {/* Seletor de Dificuldade / Quantidade de Peças */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white/90 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border border-sky-300 shadow-xs flex-shrink-0">
              {([4, 6, 9] as PuzzleDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => changeDifficulty(diff)}
                  className={`kid-btn px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs transition-all ${
                    difficulty === diff
                      ? "kid-btn-teal scale-105 shadow-toy-sm"
                      : "bg-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span className="mr-0.5 sm:mr-1">{DIFFICULTIES[diff].emoji}</span>
                  <span>{diff}P</span>
                </button>
              ))}
            </div>
          </div>
        }
        rightControls={
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <span className="text-[11px] sm:text-sm font-black text-purple-950 bg-purple-100 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-purple-300 shadow-xs">
              {placedPieces.length}/{pieces.length}
            </span>
            <button
              onClick={() => {
                sounds.playPop();
                setShowHint((prev) => !prev);
              }}
              className={`kid-btn p-1.5 sm:px-2.5 sm:py-1 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1 transition-all ${
                showHint ? "kid-btn-yellow" : "kid-btn-white"
              }`}
              title="Espiar Imagem Completa"
            >
              <div className="toy-gloss" />
              <Eye size={15} />
              <span className="hidden sm:inline">DICA</span>
            </button>
            <button
              onClick={handleReset}
              className="kid-btn kid-btn-white p-1.5 sm:p-2 rounded-xl border-2"
              title="Recomeçar"
            >
              <div className="toy-gloss" />
              <RotateCcw size={15} />
            </button>
          </div>
        }
      />

      {/* ÁREA CENTRAL: O TABULEIRO DO QUEBRA-CABEÇA COM MOLDURA DE MADEIRA E ENCAIXES REAIS */}
      <div className="relative flex-1 min-h-0 w-full p-2 sm:p-4 landscape:p-1 flex items-center justify-center overflow-hidden">
        {/* Moldura de Madeira do Quebra-Cabeça */}
        <div className="relative w-full max-w-2xl md:max-w-3xl max-h-full aspect-[4/3] rounded-3xl sm:rounded-4xl p-2 sm:p-3 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-4 sm:border-6 border-amber-950 shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
          <div className="w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-amber-100 relative shadow-inner border border-amber-900/40">
            {/* SVG Principal do Tabuleiro */}
            <svg
              ref={boardSvgRef}
              viewBox="0 0 400 300"
              className="w-full h-full select-none overflow-hidden"
            >
              <defs>
                {/* ClipPaths reais de cada peça com seus encaixes */}
                {pieces.map((p) => (
                  <clipPath key={`clip-${p.id}`} id={`board-clip-${p.id}`}>
                    <path d={p.path} />
                  </clipPath>
                ))}
              </defs>

              {/* 1. Fundo do Tabuleiro de Madeira Clara */}
              <rect width="400" height="300" fill="#FEF3C7" />

              {/* 2. Dica Sutil Translúcida da Imagem Inteira (se ativa) */}
              {showHint && (
                <g opacity={0.32} filter="grayscale(50%)">
                  {currentPuzzle.renderElements()}
                </g>
              )}

              {/* 3. Desenho dos Encaixes dos Slots Vazios no Tabuleiro */}
              {pieces.map((p) => {
                const isPlaced = placedPieces.includes(p.id);
                const isHovered = hoveredSlotId === p.id;
                const isMatchingHover = isHovered && draggingPieceId === p.id;

                if (isPlaced) return null;

                return (
                  <g key={`slot-${p.id}`}>
                    {/* Linha pontilhada no formato exato da peça de quebra-cabeça */}
                    <path
                      d={p.path}
                      fill={
                        isMatchingHover
                          ? "rgba(250, 204, 21, 0.45)"
                          : isHovered
                          ? "rgba(254, 240, 138, 0.25)"
                          : "rgba(255, 255, 255, 0.2)"
                      }
                      stroke={isMatchingHover ? "#F59E0B" : "#B45309"}
                      strokeWidth={isMatchingHover ? 3.5 : 1.8}
                      strokeDasharray={isMatchingHover ? "none" : "5 3"}
                      opacity={isMatchingHover ? 1 : 0.6}
                      className="transition-colors duration-150"
                    />
                    {/* Ícone de quebra-cabeça sutil no centro do slot */}
                    <text
                      x={p.centerX}
                      y={p.centerY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="20"
                      fill="#92400E"
                      opacity="0.35"
                      pointerEvents="none"
                    >
                      🧩
                    </text>
                  </g>
                );
              })}

              {/* 4. Peças já Encaixadas com Recortes Tridimensionais Reais */}
              {pieces.map((p) => {
                const isPlaced = placedPieces.includes(p.id);
                if (!isPlaced) return null;

                return (
                  <g key={`placed-${p.id}`}>
                    {/* Imagem recortada no formato exato da peça */}
                    <g clipPath={`url(#board-clip-${p.id})`}>
                      {currentPuzzle.renderElements()}
                    </g>
                    {/* Friso e sombra de encaixe real entre as peças */}
                    <path
                      d={p.path}
                      fill="none"
                      stroke="#78350F"
                      strokeWidth="2.5"
                      opacity="0.65"
                    />
                    <path
                      d={p.path}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      opacity="0.4"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* MODAL DE VITÓRIA QUANDO COMPLETA O QUEBRA-CABEÇA */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center"
            >
              <span className="text-7xl sm:text-9xl mb-2 animate-bounce">{currentPuzzle.icon}</span>
              <div className="text-2xl sm:text-5xl font-black text-kids-orange mb-1">
                QUEBRA-CABEÇA COMPLETO! ⭐
              </div>
              <div className="text-sm sm:text-xl font-bold text-slate-700 mb-6 max-w-md">
                Parabéns! Você encaixou todas as {pieces.length} peças perfeitamente!
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="kid-btn kid-btn-white font-black text-base sm:text-xl px-6 py-3 rounded-2xl border-2"
                >
                  <div className="toy-gloss" />
                  <span>MONTAR DE NOVO</span>
                </button>
                <button
                  onClick={handleNext}
                  className="kid-btn kid-btn-teal font-black text-base sm:text-2xl px-8 py-3.5 rounded-3xl border-3 flex items-center gap-2"
                >
                  <div className="toy-gloss" />
                  <span>PRÓXIMO QUEBRA-CABEÇA!</span>
                  <ArrowRight size={24} className="stroke-[3]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DOCK INFERIOR: BANDEJA DE PEÇAS COM FORMATO REAL DE QUEBRA-CABEÇA */}
      {!isCompleted && (
        <div className="w-full bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-3 border-t-3 sm:border-t-4 border-kids-teal shadow-[0_-8px_25px_rgba(0,0,0,0.12)] z-20 flex flex-col gap-1.5 flex-shrink-0">
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-amber-500" size={16} />
              <span className="text-xs sm:text-sm font-black text-teal-950">
                Arraste ou toque nas peças para encaixar ({unplacedPieces.length} restantes):
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-black text-slate-500">
              Modo {diffConfig.label}
            </span>
          </div>

          {/* Bandeja com as Peças de Quebra-Cabeça Reais */}
          <div className="max-w-4xl mx-auto w-full flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto p-1 scrollbar-none">
            {pieces.map((p) => {
              const isPlaced = placedPieces.includes(p.id);
              const isDraggingThis = draggingPieceId === p.id;

              if (isPlaced) {
                return (
                  <div
                    key={`unplaced-slot-${p.id}`}
                    className="flex-shrink-0 w-16 h-14 sm:w-24 sm:h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/50 opacity-25 flex items-center justify-center"
                  >
                    <Check size={20} className="text-emerald-600 stroke-[3]" />
                  </div>
                );
              }

              return (
                <motion.div
                  key={`tray-piece-${p.id}`}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 450, damping: 18 }}
                  onPointerDown={(e) => handlePiecePointerDown(p.id, e)}
                  onClick={() => handleDirectClickPiece(p.id)}
                  className={`flex-shrink-0 w-16 h-14 sm:w-24 sm:h-20 relative p-1 rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity touch-none ${
                    isDraggingThis
                      ? "opacity-25 scale-95"
                      : "bg-amber-50/80 border-2 sm:border-3 border-amber-300 shadow-toy-sm hover:border-amber-500 hover:shadow-toy"
                  }`}
                  title="Arraste para o tabuleiro ou toque para encaixar"
                >
                  <svg
                    viewBox={p.viewBox}
                    className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)] overflow-visible"
                  >
                    <defs>
                      <clipPath id={`tray-clip-${p.id}`}>
                        <path d={p.path} />
                      </clipPath>
                    </defs>
                    {/* Imagem recortada na forma da peça */}
                    <g clipPath={`url(#tray-clip-${p.id})`}>
                      {currentPuzzle.renderElements()}
                    </g>
                    {/* Contorno clássico de peça de quebra-cabeça */}
                    <path
                      d={p.path}
                      fill="none"
                      stroke="#78350F"
                      strokeWidth={difficulty === 9 ? 3.5 : 4.5}
                    />
                    <path
                      d={p.path}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      opacity="0.6"
                    />
                  </svg>
                  {/* Ícone de mãozinha indicando que pode pegar */}
                  <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-xs border border-white">
                    ✋
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* PEÇA FLUTUANTE REAL SOB O DEDO DA CRIANÇA ENQUANTO ARRASTA */}
      {draggingPieceId !== null && dragPos !== null && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 w-28 h-24 sm:w-40 sm:h-32 drop-shadow-[0_16px_30px_rgba(0,0,0,0.38)] scale-110 rotate-2 transition-transform duration-75"
          style={{
            left: `${dragPos.x}px`,
            top: `${dragPos.y}px`,
          }}
        >
          <svg
            viewBox={pieces[draggingPieceId].viewBox}
            className="w-full h-full overflow-visible"
          >
            <defs>
              <clipPath id={`drag-clip-${draggingPieceId}`}>
                <path d={pieces[draggingPieceId].path} />
              </clipPath>
            </defs>
            <g clipPath={`url(#drag-clip-${draggingPieceId})`}>
              {currentPuzzle.renderElements()}
            </g>
            <path
              d={pieces[draggingPieceId].path}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="5"
            />
            <path
              d={pieces[draggingPieceId].path}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
