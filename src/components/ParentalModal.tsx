"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Trash2, Download, Image as ImageIcon, Heart } from "lucide-react";
import { sounds } from "@/utils/soundEngine";

interface ParentalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ParentalModal({ isOpen, onClose }: ParentalModalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [savedPaintings, setSavedPaintings] = useState<string[]>([]);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(false);
      setHoldProgress(0);
      loadPaintings();
    }
  }, [isOpen]);

  const loadPaintings = () => {
    try {
      const data = localStorage.getItem("israel_saved_paintings");
      if (data) {
        setSavedPaintings(JSON.parse(data));
      } else {
        setSavedPaintings([]);
      }
    } catch {
      setSavedPaintings([]);
    }
  };

  const startHold = () => {
    sounds.playPop();
    let current = 0;
    holdIntervalRef.current = setInterval(() => {
      current += 5;
      setHoldProgress(current);
      if (current >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        sounds.playSuccess();
        setIsUnlocked(true);
      }
    }, 100);
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  const deletePainting = (index: number) => {
    sounds.playBoing();
    const updated = savedPaintings.filter((_, i) => i !== index);
    setSavedPaintings(updated);
    localStorage.setItem("israel_saved_paintings", JSON.stringify(updated));
  };

  const downloadPainting = (dataUrl: string, index: number) => {
    sounds.playStar();
    const link = document.createElement("a");
    link.download = `desenho-israel-${index + 1}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-8 border-kids-blue shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-pulse-gentle">
        {/* Cabeçalho */}
        <div className="bg-kids-blue p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <h2 className="text-2xl font-bold">Cantinho dos Pais & Galeria</h2>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="kid-btn bg-kids-coral hover:bg-red-500 text-white rounded-full p-2 border-2 border-white shadow-kid-sm"
          >
            <X size={26} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isUnlocked ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🛡️</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Área dos Pais</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Para proteger as configurações e a galeria de toques acidentais, segure o botão abaixo por 2 segundos:
              </p>

              <div className="flex flex-col items-center">
                <button
                  onMouseDown={startHold}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  onTouchStart={startHold}
                  onTouchEnd={endHold}
                  className="kid-btn relative bg-kids-yellow text-slate-800 font-extrabold text-xl px-8 py-4 rounded-3xl border-4 border-amber-500 shadow-kid active:scale-95 transition-transform"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    ⭐ Segure Aqui ⭐
                  </span>
                  <div
                    className="absolute inset-0 bg-amber-400 rounded-2xl opacity-70 transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                </button>
                <div className="w-48 bg-gray-200 h-3 rounded-full mt-4 overflow-hidden border">
                  <div
                    className="bg-amber-500 h-full transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="text-kids-blue" /> Galeria do Mundinho Mágico ({savedPaintings.length})
                </h3>
              </div>

              {savedPaintings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-5xl block mb-2">🎨</span>
                  <p className="text-lg font-medium">Nenhum desenho salvo ainda!</p>
                  <p className="text-sm">Quando o Israel apertar o botão de foto no Atelier de Pintura, o desenho aparecerá aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {savedPaintings.map((img, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border-4 border-kids-sky/40 rounded-2xl p-2 flex flex-col shadow-sm"
                    >
                      <div className="bg-white rounded-xl overflow-hidden aspect-video border flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`Desenho ${idx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex justify-between mt-2 pt-1 gap-2">
                        <button
                          onClick={() => downloadPainting(img, idx)}
                          className="kid-btn flex-1 bg-kids-teal text-white py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-kid-sm"
                          title="Baixar imagem"
                        >
                          <Download size={16} /> Baixar
                        </button>
                        <button
                          onClick={() => deletePainting(idx)}
                          className="kid-btn bg-kids-coral text-white p-1.5 rounded-xl text-xs shadow-kid-sm"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                Feito com <Heart size={16} className="text-red-500 fill-red-500" /> para o Israel e todas as crianças no Mundinho Mágico!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
