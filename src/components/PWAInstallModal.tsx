"use client";

import React from "react";
import { X, Smartphone, Share2, PlusSquare, MoreVertical, Download, Sparkles, CheckCircle2 } from "lucide-react";
import { sounds } from "@/utils/soundEngine";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export function PWAInstallModal({ isOpen, onClose, isIOS }: PWAInstallModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-kids-teal shadow-2xl p-4 sm:p-6 flex flex-col items-center text-center max-h-[92vh] overflow-y-auto"
      >
        {/* Botão Fechar */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 shadow-sm"
          title="Fechar"
        >
          <X size={20} className="stroke-[2.5]" />
        </button>

        {/* Ícone do App & Título */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 rounded-3xl border-3 border-amber-600 shadow-kid flex items-center justify-center mb-2 sm:mb-3">
          <span className="text-3xl sm:text-4xl">🌟</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
          Instalar Mundinho Mágico
        </h2>

        <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1 mb-4">
          Jogue em <span className="text-kids-teal font-black">tela cheia</span> sem barras de navegador, mais rápido e direto da tela do seu celular!
        </p>

        {/* Instruções Específicas por Sistema */}
        {isIOS ? (
          <div className="w-full bg-sky-50 border-2 border-sky-300 rounded-2xl p-3 sm:p-4 text-left flex flex-col gap-2.5 mb-4">
            <div className="flex items-center gap-2 text-sky-950 font-black text-xs sm:text-sm">
              <Smartphone size={18} className="text-sky-600 flex-shrink-0" />
              <span>Como instalar no iPhone / iPad:</span>
            </div>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                1
              </span>
              <p>
                Toque no botão <strong>Compartilhar</strong>{" "}
                <Share2 size={16} className="inline text-sky-600 stroke-[2.5]" /> na barra inferior do Safari.
              </p>
            </div>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                2
              </span>
              <p>
                Role as opções para baixo e toque em{" "}
                <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-300 inline-flex items-center gap-1">
                  <PlusSquare size={14} /> Adicionar à Tela de Início
                </strong>
                .
              </p>
            </div>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                3
              </span>
              <p>
                Toque em <strong>Adicionar</strong> no canto superior direito. Pronto! ⭐
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 sm:p-4 text-left flex flex-col gap-2.5 mb-4">
            <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
              <Smartphone size={18} className="text-amber-600 flex-shrink-0" />
              <span>Como instalar no Android / Navegador:</span>
            </div>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                1
              </span>
              <p>
                Toque no menu de <strong>3 pontinhos</strong>{" "}
                <MoreVertical size={16} className="inline text-amber-700 stroke-[2.5]" /> no canto do navegador.
              </p>
            </div>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                2
              </span>
              <p>
                Selecione{" "}
                <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-300 inline-flex items-center gap-1">
                  <Download size={14} /> Instalar aplicativo
                </strong>{" "}
                ou <strong>Adicionar à tela inicial</strong>.
              </p>
            </div>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                3
              </span>
              <p>
                Confirme em <strong>Instalar</strong>. O ícone aparecerá na tela do seu celular! ⭐
              </p>
            </div>
          </div>
        )}

        {/* Vantagens */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 mb-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={16} className="text-emerald-500" /> 100% Grátis
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={16} className="text-emerald-500" /> Sem Anúncios
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={16} className="text-emerald-500" /> Jogue Offline
          </span>
        </div>

        {/* Botão Entendi */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="kid-btn w-full bg-kids-green hover:bg-emerald-500 text-white font-black text-base sm:text-lg py-2.5 sm:py-3 rounded-2xl border-3 border-emerald-700 shadow-kid active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles size={20} />
          <span>ENTENDI, VAMOS LÁ!</span>
        </button>
      </div>
    </div>
  );
}
