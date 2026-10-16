"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { HomeHub, GameKey } from "@/components/HomeHub";
import { CarTrackGame } from "@/components/CarTrackGame";
import { PaintingGame } from "@/components/PaintingGame";
import { PuzzleGame } from "@/components/PuzzleGame";
import { BlocksGame } from "@/components/BlocksGame";
import { BalloonPopGame } from "@/components/BalloonPopGame";
import { ArkAnimalsGame } from "@/components/ArkAnimalsGame";
import { CountingGame } from "@/components/CountingGame";
import { NumberTrainGame } from "@/components/NumberTrainGame";
import { LetterTracingGame } from "@/components/LetterTracingGame";
import { MissingLetterGame } from "@/components/MissingLetterGame";
import { ParentalModal } from "@/components/ParentalModal";
import { PWARegistration } from "@/components/PWARegistration";

type ScreenMode = "hub" | GameKey;

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenMode>("hub");
  const [isParentalOpen, setIsParentalOpen] = useState(false);

  const getScreenDetails = () => {
    switch (currentScreen) {
      case "car":
        return { title: "Pista dos Carrinhos", icon: "🚗" };
      case "paint":
        return { title: "Atelier de Pintura", icon: "🎨" };
      case "puzzle":
        return { title: "Quebra-Cabeça Mágico", icon: "🧩" };
      case "blocks":
        return { title: "Torre de Equilíbrio", icon: "🧱" };
      case "balloons":
        return { title: "Estoura-Balões", icon: "🎈" };
      case "ark":
        return { title: "Bichinhos da Arca", icon: "🛳️" };
      case "counting":
        return { title: "Contar Quantos Tem", icon: "🔢" };
      case "train":
        return { title: "Trem dos Números", icon: "🚂" };
      case "tracing":
        return { title: "Traçar o Alfabeto", icon: "✍️" };
      case "missingLetter":
        return { title: "Letra Mágica", icon: "🔤" };
      default:
        return { title: "", icon: "" };
    }
  };

  const { title, icon } = getScreenDetails();

  return (
    <main
      suppressHydrationWarning
      className="h-screen h-[100dvh] max-h-[100dvh] w-screen max-w-full flex flex-col justify-between bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 overflow-hidden select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <PWARegistration />

      {/* HUD Superior Global estilo App Infantil de Mercado */}
      <TopBar
        title={title}
        icon={icon}
        showHome={currentScreen !== "hub"}
        onHome={() => setCurrentScreen("hub")}
        onOpenParents={() => setIsParentalOpen(true)}
      />

      {/* Palco Tela Cheia (100% da largura e altura disponíveis, sem margens que encolham o jogo) */}
      <div className="flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden">
        {currentScreen === "hub" && (
          <HomeHub onSelectGame={(game) => setCurrentScreen(game)} />
        )}

        {currentScreen === "car" && <CarTrackGame />}
        {currentScreen === "paint" && <PaintingGame />}
        {currentScreen === "puzzle" && <PuzzleGame />}
        {currentScreen === "blocks" && <BlocksGame />}
        {currentScreen === "balloons" && <BalloonPopGame />}
        {currentScreen === "ark" && <ArkAnimalsGame />}
        {currentScreen === "counting" && <CountingGame />}
        {currentScreen === "train" && <NumberTrainGame />}
        {currentScreen === "tracing" && <LetterTracingGame />}
        {currentScreen === "missingLetter" && <MissingLetterGame />}
      </div>

      {/* Modal Parental / Galeria do Israel */}
      <ParentalModal
        isOpen={isParentalOpen}
        onClose={() => setIsParentalOpen(false)}
      />
    </main>
  );
}
