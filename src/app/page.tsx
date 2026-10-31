"use client";

import React, { useState } from "react";
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

  const handleHome = () => setCurrentScreen("hub");

  return (
    <main
      suppressHydrationWarning
      className="h-screen h-[100dvh] max-h-[100dvh] w-screen max-w-full flex flex-col justify-between bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 overflow-hidden select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <PWARegistration />

      {/* Palco Principal do App: Tela Cheia com Header Único Integrado em cada Tela */}
      <div className="flex-1 min-h-0 w-full h-full flex flex-col overflow-hidden">
        {currentScreen === "hub" && (
          <HomeHub
            onSelectGame={(game) => setCurrentScreen(game)}
            onOpenParents={() => setIsParentalOpen(true)}
          />
        )}

        {currentScreen === "car" && <CarTrackGame onHome={handleHome} />}
        {currentScreen === "paint" && <PaintingGame onHome={handleHome} />}
        {currentScreen === "puzzle" && <PuzzleGame onHome={handleHome} />}
        {currentScreen === "blocks" && <BlocksGame onHome={handleHome} />}
        {currentScreen === "balloons" && <BalloonPopGame onHome={handleHome} />}
        {currentScreen === "ark" && <ArkAnimalsGame onHome={handleHome} />}
        {currentScreen === "counting" && <CountingGame onHome={handleHome} />}
        {currentScreen === "train" && <NumberTrainGame onHome={handleHome} />}
        {currentScreen === "tracing" && <LetterTracingGame onHome={handleHome} />}
        {currentScreen === "missingLetter" && <MissingLetterGame onHome={handleHome} />}
      </div>

      {/* Modal Parental / Galeria do Israel */}
      <ParentalModal
        isOpen={isParentalOpen}
        onClose={() => setIsParentalOpen(false)}
      />
    </main>
  );
}
