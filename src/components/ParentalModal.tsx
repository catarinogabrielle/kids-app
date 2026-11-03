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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-kids-blue shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-3 sm:p-4 text-white flex justify-between items-center border-b-2 border-blue-600">
          <div className="flex items-center gap-2">
            <span className="text-2xl drop-shadow-sm">🔒</span>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide">Cantinho dos Pais & Galeria</h2>
          </div>
          <button
            onClick={() => {
              sounds.playPop();
              onClose();
            }}
            className="kid-btn kid-btn-coral rounded-2xl p-2 border-2"
          >
            <div className="toy-gloss" />
            <X size={22} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isUnlocked ? (
            <div className="text-center py-6 sm:py-8">
              <span className="text-5xl sm:text-6xl mb-3 block animate-float">🛡️</span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Área dos Pais</h3>
              <p className="text-sm sm:text-base font-bold text-slate-600 mb-6 max-w-md mx-auto">
                Para proteger as configurações e a galeria de toques acidentais, segure o botão abaixo por 2 segundos:
              </p>

              <div className="flex flex-col items-center">
                <button
                  onMouseDown={startHold}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  onTouchStart={startHold}
                  onTouchEnd={endHold}
                  className="kid-btn kid-btn-amber relative overflow-hidden text-slate-900 font-black text-lg sm:text-xl px-8 py-4 rounded-3xl border-3 sm:border-4"
                >
                  <div className="toy-gloss" />
                  <span className="relative z-10 flex items-center gap-2">
                    ⭐ Segure Aqui ⭐
                  </span>
                  <div
                    className="absolute inset-0 bg-amber-400/80 transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                </button>
                <div className="w-56 bg-slate-200 h-3.5 rounded-full mt-4 overflow-hidden border-2 border-slate-300">
                  <div
                    className="bg-amber-500 h-full transition-all duration-75 rounded-full"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <ImageIcon className="text-kids-blue" /> Galeria do Mundinho Mágico ({savedPaintings.length})
                </h3>
              </div>

              {savedPaintings.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <span className="text-5xl block mb-2">🎨</span>
                  <p className="text-base sm:text-lg font-black text-slate-700">Nenhum desenho salvo ainda!</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                    Quando seu pequeno apertar a câmera no Atelier de Pintura, o desenho aparecerá aqui.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {savedPaintings.map((img, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border-3 border-sky-200 rounded-2xl p-2 flex flex-col shadow-toy-sm"
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
                          className="kid-btn kid-btn-teal flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 border-2"
                          title="Baixar imagem"
                        >
                          <div className="toy-gloss" />
                          <Download size={15} /> Baixar
                        </button>
                        <button
                          onClick={() => deletePainting(idx)}
                          className="kid-btn kid-btn-coral p-1.5 rounded-xl text-xs border-2"
                          title="Excluir"
                        >
                          <div className="toy-gloss" />
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 pt-4 border-t text-center text-xs sm:text-sm text-slate-500 font-bold flex items-center justify-center gap-1">
                Feito com <Heart size={16} className="text-red-500 fill-red-500" /> para o Israel e todas as crianças no Mundinho Mágico!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
