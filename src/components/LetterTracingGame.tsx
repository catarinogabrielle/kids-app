"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { sounds } from "@/utils/soundEngine";
import { GameHeader } from "@/components/TopBar";
import {
  RotateCcw,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Paintbrush,
  Smile,
  Eraser,
  Check,
  X,
} from "lucide-react";

export interface AlphabetLetter {
  letter: string;
  word: string;
  subtitle: string;
  emoji: string;
  themeColor: string;
  bgGradient: string;
  soundType: "ark" | "bible" | "creation" | "harp" | "star" | "lion" | "sheep" | "dove" | "crown" | "fish" | "sun" | "tree" | "heart";
  paths: string[];
  startPoints: { x: number; y: number }[];
}

export const BIBLICAL_ALPHABET: AlphabetLetter[] = [
  {
    letter: "A",
    word: "Arca de Noé",
    subtitle: "Noé e os bichinhos salvos do dilúvio",
    emoji: "🛳️",
    themeColor: "#0284C7",
    soundType: "ark",
    bgGradient: "from-sky-400 to-blue-600",
    paths: [
      "M 100 330 L 200 70 L 300 330",
      "M 145 230 L 255 230",
    ],
    startPoints: [
      { x: 100, y: 330 },
      { x: 145, y: 230 },
    ],
  },
  {
    letter: "B",
    word: "Bíblia Sagrada",
    subtitle: "A Palavra de Deus que ilumina nosso caminho",
    emoji: "📖",
    themeColor: "#9333EA",
    soundType: "bible",
    bgGradient: "from-purple-500 to-indigo-600",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 200 70 A 65 65 0 0 1 200 200 L 130 200",
      "M 130 200 L 210 200 A 65 65 0 0 1 210 330 L 130 330",
    ],
    startPoints: [
      { x: 130, y: 70 },
      { x: 170, y: 70 },
      { x: 170, y: 200 },
    ],
  },
  {
    letter: "C",
    word: "Criação de Deus",
    subtitle: "O lindo mundo que o Papai do Céu criou",
    emoji: "🌍",
    themeColor: "#10B981",
    soundType: "creation",
    bgGradient: "from-emerald-400 to-teal-600",
    paths: [
      "M 300 120 A 130 130 0 0 0 80 200 A 130 130 0 0 0 300 280",
    ],
    startPoints: [
      { x: 300, y: 120 },
    ],
  },
  {
    letter: "D",
    word: "Davi e a Harpa",
    subtitle: "O pequeno pastorzinho que louvava a Deus",
    emoji: "👑",
    themeColor: "#F59E0B",
    soundType: "harp",
    bgGradient: "from-amber-400 to-yellow-600",
    paths: [
      "M 125 70 L 125 330",
      "M 125 70 L 195 70 A 130 130 0 0 1 195 330 L 125 330",
    ],
    startPoints: [
      { x: 125, y: 70 },
      { x: 170, y: 70 },
    ],
  },
  {
    letter: "E",
    word: "Estrela de Belém",
    subtitle: "A estrela brilhante que guiou até Jesus",
    emoji: "⭐",
    themeColor: "#EAB308",
    soundType: "star",
    bgGradient: "from-yellow-400 to-amber-500",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 275 70",
      "M 130 200 L 245 200",
      "M 130 330 L 275 330",
    ],
    startPoints: [
      { x: 130, y: 70 },
      { x: 180, y: 70 },
      { x: 180, y: 200 },
      { x: 180, y: 330 },
    ],
  },
  {
    letter: "F",
    word: "Fé em Deus",
    subtitle: "A sementinha de mostarda que move montanhas",
    emoji: "🌱",
    themeColor: "#16A34A",
    soundType: "tree",
    bgGradient: "from-green-400 to-emerald-600",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 275 70",
      "M 130 200 L 245 200",
    ],
    startPoints: [
      { x: 130, y: 70 },
      { x: 180, y: 70 },
      { x: 180, y: 200 },
    ],
  },
  {
    letter: "G",
    word: "Golias e a Pedrinha",
    subtitle: "Com Deus, o pequeno Davi venceu o gigante",
    emoji: "🪨",
    themeColor: "#D97706",
    soundType: "crown",
    bgGradient: "from-amber-500 to-orange-600",
    paths: [
      "M 300 120 A 130 130 0 0 0 80 200 A 130 130 0 0 0 300 280 L 300 210 L 220 210",
    ],
    startPoints: [
      { x: 300, y: 120 },
    ],
  },
  {
    letter: "H",
    word: "Harpa de Louvor",
    subtitle: "Músicas alegres para o Criador",
    emoji: "🎵",
    themeColor: "#8B5CF6",
    soundType: "harp",
    bgGradient: "from-violet-400 to-purple-600",
    paths: [
      "M 120 70 L 120 330",
      "M 280 70 L 280 330",
      "M 120 200 L 280 200",
    ],
    startPoints: [
      { x: 120, y: 70 },
      { x: 280, y: 70 },
      { x: 160, y: 200 },
    ],
  },
  {
    letter: "I",
    word: "Israel Campeão",
    subtitle: "O povo escolhido e muito abençoado",
    emoji: "🦁",
    themeColor: "#F59E0B",
    soundType: "lion",
    bgGradient: "from-yellow-400 to-amber-600",
    paths: [
      "M 130 70 L 270 70",
      "M 200 70 L 200 330",
      "M 130 330 L 270 330",
    ],
    startPoints: [
      { x: 130, y: 70 },
      { x: 200, y: 110 },
      { x: 130, y: 330 },
    ],
  },
  {
    letter: "J",
    word: "Jesus Bom Pastor",
    subtitle: "O Salvador que ama todas as crianças",
    emoji: "❤️",
    themeColor: "#EF4444",
    soundType: "heart",
    bgGradient: "from-rose-400 to-red-600",
    paths: [
      "M 140 70 L 280 70",
      "M 230 70 L 230 260 A 70 70 0 0 1 110 260",
    ],
    startPoints: [
      { x: 140, y: 70 },
      { x: 230, y: 110 },
    ],
  },
  {
    letter: "K",
    word: "Kadosh (Santo)",
    subtitle: "Deus é Santo, puro e cheio de glória",
    emoji: "✨",
    themeColor: "#6366F1",
    soundType: "star",
    bgGradient: "from-indigo-400 to-blue-600",
    paths: [
      "M 130 70 L 130 330",
      "M 270 70 L 130 205",
      "M 155 180 L 275 330",
    ],
    startPoints: [
      { x: 130, y: 70 },
      { x: 270, y: 70 },
      { x: 180, y: 210 },
    ],
  },
  {
    letter: "L",
    word: "Leão de Judá",
    subtitle: "Forte, valente e cheio de bondade",
    emoji: "🦁",
    themeColor: "#D97706",
    soundType: "lion",
    bgGradient: "from-amber-500 to-orange-600",
    paths: [
      "M 130 70 L 130 330 L 280 330",
    ],
    startPoints: [
      { x: 130, y: 70 },
    ],
  },
  {
    letter: "M",
    word: "Moisés e o Mar",
    subtitle: "O Mar Vermelho se abriu em dois caminhos",
    emoji: "🌊",
    themeColor: "#0284C7",
    soundType: "ark",
    bgGradient: "from-sky-400 to-cyan-600",
    paths: [
      "M 90 330 L 90 70 L 200 240 L 310 70 L 310 330",
    ],
    startPoints: [
      { x: 90, y: 330 },
    ],
  },
  {
    letter: "N",
    word: "Noé e a Pombinha",
    subtitle: "A pombinha branca com o raminho de oliveira",
    emoji: "🕊️",
    themeColor: "#14B8A6",
    soundType: "dove",
    bgGradient: "from-teal-400 to-emerald-600",
    paths: [
      "M 110 330 L 110 70 L 290 330 L 290 70",
    ],
    startPoints: [
      { x: 110, y: 330 },
    ],
  },
  {
    letter: "O",
    word: "Ovelhinha do Pastor",
    subtitle: "Jesus cuida de cada uma com muito carinho",
    emoji: "🐑",
    themeColor: "#10B981",
    soundType: "sheep",
    bgGradient: "from-emerald-400 to-green-600",
    paths: [
      "M 200 70 A 130 130 0 1 0 200 330 A 130 130 0 1 0 200 70",
    ],
    startPoints: [
      { x: 200, y: 70 },
    ],
  },
  {
    letter: "P",
    word: "Peixinho de Jonas",
    subtitle: "O grande peixe amigo no fundo do mar",
    emoji: "🐟",
    themeColor: "#0284C7",
    soundType: "fish",
    bgGradient: "from-cyan-400 to-blue-500",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 205 70 A 65 65 0 0 1 205 200 L 130 200",
    ],
    startPoints: [
      { x: 130, y: 70 },
      { x: 170, y: 70 },
    ],
  },
  {
    letter: "Q",
    word: "Querubins da Glória",
    subtitle: "Anjos celestiais que cantam aleluia",
    emoji: "👼",
    themeColor: "#9333EA",
    soundType: "star",
    bgGradient: "from-purple-400 to-violet-600",
    paths: [
      "M 200 70 A 130 130 0 1 0 200 330 A 130 130 0 1 0 200 70",
      "M 240 270 L 320 340",
    ],
    startPoints: [
      { x: 200, y: 70 },
      { x: 240, y: 270 },
    ],
  },
  {
    letter: "R",
    word: "Rei dos Reis",
    subtitle: "Jesus Reina para sempre em glória e amor",
    emoji: "👑",
    themeColor: "#A855F7",
    soundType: "crown",
    bgGradient: "from-purple-400 to-fuchsia-600",
    paths: [
      "M 130 70 L 130 330",
      "M 130 70 L 205 70 A 65 65 0 0 1 205 200 L 130 200",
      "M 195 200 L 285 330",
    ],
    startPoints: [
      { x: 130, y: 70 },
      { x: 170, y: 70 },
      { x: 205, y: 210 },
    ],
  },
  {
    letter: "S",
    word: "Sol da Justiça",
    subtitle: "A luz de Deus que brilha em nossos corações",
    emoji: "☀️",
    themeColor: "#F59E0B",
    soundType: "sun",
    bgGradient: "from-amber-400 to-yellow-500",
    paths: [
      "M 280 120 A 55 55 0 0 0 150 145 C 150 200 265 190 265 255 A 55 55 0 0 1 120 280",
    ],
    startPoints: [
      { x: 280, y: 120 },
    ],
  },
  {
    letter: "T",
    word: "Torre da Fé",
    subtitle: "Construída sobre a rocha que nunca cai",
    emoji: "🧱",
    themeColor: "#059669",
    soundType: "tree",
    bgGradient: "from-emerald-500 to-teal-700",
    paths: [
      "M 90 70 L 310 70",
      "M 200 70 L 200 330",
    ],
    startPoints: [
      { x: 90, y: 70 },
      { x: 200, y: 110 },
    ],
  },
  {
    letter: "U",
    word: "Uvas da Promessa",
    subtitle: "Cachos doces e gigantes da Terra Prometida",
    emoji: "🍇",
    themeColor: "#7C3AED",
    soundType: "crown",
    bgGradient: "from-purple-500 to-violet-700",
    paths: [
      "M 120 70 L 120 240 A 80 80 0 0 0 280 240 L 280 70",
    ],
    startPoints: [
      { x: 120, y: 70 },
    ],
  },
  {
    letter: "V",
    word: "Videira Verdadeira",
    subtitle: "Nós somos os raminhos que dão bons frutos",
    emoji: "🌿",
    themeColor: "#16A34A",
    soundType: "tree",
    bgGradient: "from-green-500 to-emerald-600",
    paths: [
      "M 100 70 L 200 330 L 300 70",
    ],
    startPoints: [
      { x: 100, y: 70 },
    ],
  },
  {
    letter: "W",
    word: "Worship (Louvor)",
    subtitle: "Louvores alegres que sobem ao Pai",
    emoji: "🙌",
    themeColor: "#2563EB",
    soundType: "star",
    bgGradient: "from-blue-500 to-indigo-600",
    paths: [
      "M 80 70 L 125 330 L 200 160 L 275 330 L 320 70",
    ],
    startPoints: [
      { x: 80, y: 70 },
    ],
  },
  {
    letter: "X",
    word: "Xodó de Deus",
    subtitle: "Você é a preciosidade amada do Senhor",
    emoji: "👶",
    themeColor: "#E11D48",
    soundType: "heart",
    bgGradient: "from-rose-400 to-pink-600",
    paths: [
      "M 110 70 L 290 330",
      "M 290 70 L 110 330",
    ],
    startPoints: [
      { x: 110, y: 70 },
      { x: 290, y: 70 },
    ],
  },
  {
    letter: "Y",
    word: "Yeshua (Jesus)",
    subtitle: "O Caminho, a Verdade e a Vida eterna",
    emoji: "✝️",
    themeColor: "#DC2626",
    soundType: "heart",
    bgGradient: "from-red-500 to-rose-700",
    paths: [
      "M 100 70 L 200 200 L 300 70",
      "M 200 200 L 200 330",
    ],
    startPoints: [
      { x: 100, y: 70 },
      { x: 200, y: 215 },
    ],
  },
  {
    letter: "Z",
    word: "Zaqueu no Sicômoro",
    subtitle: "O homenzinho que subiu para ver Jesus passar",
    emoji: "🌳",
    themeColor: "#0D9488",
    soundType: "tree",
    bgGradient: "from-teal-500 to-emerald-700",
    paths: [
      "M 110 70 L 290 70 L 110 330 L 290 330",
    ],
    startPoints: [
      { x: 110, y: 70 },
    ],
  },
];

const PALETTE_COLORS = [
  { id: "red", hex: "#EF4444", label: "Vermelho" },
  { id: "orange", hex: "#F97316", label: "Laranja" },
  { id: "yellow", hex: "#FBBF24", label: "Amarelo" },
  { id: "green", hex: "#10B981", label: "Verde" },
  { id: "cyan", hex: "#06B6D4", label: "Ciano" },
  { id: "blue", hex: "#3B82F6", label: "Azul" },
  { id: "purple", hex: "#8B5CF6", label: "Roxo" },
  { id: "pink", hex: "#EC4899", label: "Rosa" },
  { id: "rainbow", hex: "rainbow", label: "Arco-Íris Mágico" },
];

const STICKER_LIST = [
  "⭐",
  "🦁",
  "🕊️",
  "🛳️",
  "👑",
  "🌈",
  "🐑",
  "❤️",
  "🌸",
  "🍎",
  "✨",
  "🐟",
];

interface PlacedSticker {
  id: number;
  emoji: string;
  xPercent: number;
  yPercent: number;
  scale: number;
  rotation: number;
}

export function LetterTracingGame({ onHome }: { onHome?: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const current = BIBLICAL_ALPHABET[currentIdx];

  // Ferramentas ativas
  const [activeTab, setActiveTab] = useState<"brush" | "stickers">("brush");
  const [selectedColor, setSelectedColor] = useState<string>("#EF4444");
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(24);
  const [selectedSticker, setSelectedSticker] = useState<string>("⭐");

  // Adesivos colados na letra
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);

  // Estado de desenho no canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const lastCoordRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef<number>(0);

  // Pop-up da Animaçãozinha Mágica da Letra
  const [showAnimationModal, setShowAnimationModal] = useState(false);

  // Síntese de voz em português
  const speakLetterWord = useCallback((letter: string, word: string) => {
    if (sounds.getMuted()) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`${letter}! ${word}!`);
        utterance.lang = "pt-BR";
        utterance.rate = 0.95;
        utterance.pitch = 1.25; // Voz suave, alegre e infantil
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignora silenciosamente se o browser restringir
      }
    }
  }, []);

  // Toca o som temático da letra
  const playLetterSound = useCallback(
    (type: AlphabetLetter["soundType"]) => {
      switch (type) {
        case "lion":
          sounds.playAnimalSound("lion");
          break;
        case "sheep":
          sounds.playAnimalSound("sheep");
          break;
        case "ark":
          sounds.playHonk();
          break;
        case "star":
        case "bible":
        case "harp":
        case "crown":
        case "heart":
          sounds.playSparkle();
          break;
        case "fish":
          sounds.playSplash();
          break;
        case "tree":
        case "sun":
        case "dove":
        case "creation":
        default:
          sounds.playChime(660);
          break;
      }
    },
    []
  );

  // Dispara a super animaçãozinha da letra
  const triggerAnimate = useCallback(() => {
    sounds.playSparkle();
    playLetterSound(current.soundType);
    speakLetterWord(current.letter, current.word);

    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.5 },
    });

    setShowAnimationModal(true);
  }, [current, playLetterSound, speakLetterWord]);

  // Sincroniza o tamanho do Canvas 1:1 com alta densidade de pixels
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Preserva o conteúdo ao redimensionar se já havia pintura
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
      }
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }, []);

  // Troca de letra: limpa canvas e adesivos e atualiza
  const goToLetter = useCallback(
    (index: number) => {
      sounds.playStar();
      setCurrentIdx(index);
      setStickers([]);
      clearCanvas();
      setShowAnimationModal(false);
      lastCoordRef.current = null;
    },
    [clearCanvas]
  );

  const nextLetter = useCallback(() => {
    goToLetter((currentIdx + 1) % BIBLICAL_ALPHABET.length);
  }, [currentIdx, goToLetter]);

  const prevLetter = useCallback(() => {
    goToLetter((currentIdx - 1 + BIBLICAL_ALPHABET.length) % BIBLICAL_ALPHABET.length);
  }, [currentIdx, goToLetter]);

  useEffect(() => {
    syncCanvasSize();
    clearCanvas();
    setStickers([]);
    setShowAnimationModal(false);
    lastCoordRef.current = null;

    const handleResize = () => {
      syncCanvasSize();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIdx, syncCanvasSize, clearCanvas]);

  // DESENHO NO CANVAS (PINCEL & BORRACHA)
  const drawStroke = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = stage.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    ctx.save();

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      if (lastCoordRef.current) {
        ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
        ctx.lineTo(localX, localY);
        ctx.lineWidth = brushSize * 1.5;
        ctx.stroke();
      } else {
        ctx.arc(localX, localY, brushSize * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.globalCompositeOperation = "source-over";

      let strokeColor = selectedColor;
      if (selectedColor === "rainbow") {
        rainbowHueRef.current = (rainbowHueRef.current + 8) % 360;
        strokeColor = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
      }

      ctx.beginPath();
      if (lastCoordRef.current) {
        ctx.moveTo(lastCoordRef.current.x, lastCoordRef.current.y);
        ctx.lineTo(localX, localY);
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
      } else {
        ctx.arc(localX, localY, brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
      }

      // Efeito de purpurina mágica no pincel arco-íris
      if (selectedColor === "rainbow" && Math.random() > 0.6) {
        ctx.font = "18px sans-serif";
        ctx.fillText("✨", localX + (Math.random() * 20 - 10), localY + (Math.random() * 20 - 10));
      }
    }

    ctx.restore();
    lastCoordRef.current = { x: localX, y: localY };
  };

  // COLOCAR ADESIVOS NO PALCO
  const placeSticker = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const xPercent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    const yPercent = Math.max(5, Math.min(95, (y / rect.height) * 100));

    sounds.playPop();

    const newSticker: PlacedSticker = {
      id: Date.now() + Math.random(),
      emoji: selectedSticker,
      xPercent,
      yPercent,
      scale: 1,
      rotation: (Math.random() - 0.5) * 24, // Leve rotação orgânica
    };

    setStickers((prev) => [...prev, newSticker]);

    // Mini confete fofo no ponto colado
    confetti({
      particleCount: 15,
      spread: 45,
      origin: {
        x: clientX / window.innerWidth,
        y: clientY / window.innerHeight,
      },
    });
  };

  // EVENTOS DE PONTEIRO GLOBAIS NO PALCO
  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeTab === "stickers") {
      placeSticker(e.clientX, e.clientY);
      return;
    }

    setIsDrawing(true);
    lastCoordRef.current = null;
    drawStroke(e.clientX, e.clientY);
    if (!isEraser) {
      sounds.playScale(Math.floor(Math.random() * 7) + 1);
    } else {
      sounds.playEraser();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || activeTab !== "brush") return;
    drawStroke(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    lastCoordRef.current = null;
  };

  const handleReset = () => {
    sounds.playBoing();
    clearCanvas();
    setStickers([]);
    lastCoordRef.current = null;
  };

  return (
    <div className="flex flex-col w-full h-full select-none overflow-hidden bg-gradient-to-b from-amber-50 via-sky-50 to-pink-50">
      {/* 1. HEADER DO JOGO ULTRA COMPACTO NO MOBILE */}
      <GameHeader
        onHome={onHome}
        title="Traçar & Colorir"
        icon="✍️"
        hideTitleOnMobile={true}
        leftControls={
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={prevLetter}
              className="kid-btn kid-btn-white p-1 sm:p-1.5 rounded-xl border-2 flex items-center justify-center active:scale-90"
              title="Letra Anterior"
            >
              <ChevronLeft size={15} className="sm:w-5 sm:h-5 stroke-[3]" />
            </button>

            {/* Letra Atual em Destaque Compacta no Mobile */}
            <div className="bg-white/95 px-1.5 py-0.5 sm:px-3.5 sm:py-1 rounded-xl border-2 border-amber-400 shadow-toy-sm flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span
                className="text-sm sm:text-2xl font-black"
                style={{ color: current.themeColor }}
              >
                {current.letter}
              </span>
              <span className="text-xs sm:text-xl">{current.emoji}</span>
              <span className="hidden sm:inline text-xs sm:text-sm font-extrabold text-slate-800 whitespace-nowrap">
                {current.word}
              </span>
            </div>

            <button
              onClick={nextLetter}
              className="kid-btn kid-btn-white p-1 sm:p-1.5 rounded-xl border-2 flex items-center justify-center active:scale-90"
              title="Próxima Letra"
            >
              <ChevronRight size={15} className="sm:w-5 sm:h-5 stroke-[3]" />
            </button>
          </div>
        }
        rightControls={
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* BOTÃO ANIMAR NO HEADER (COMPACTO NO MOBILE COM ÍCONE) */}
            <button
              onClick={triggerAnimate}
              className="kid-btn kid-btn-yellow p-1 sm:px-3.5 sm:py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1 active:scale-95 animate-pulse-gentle"
              title="Animar a Letra e Ver a História!"
            >
              <div className="toy-gloss" />
              <Sparkles size={15} className="text-amber-800 animate-spin" />
              <span className="hidden sm:inline">ANIMAR! ✨</span>
            </button>

            {/* Botão de Limpar Desenho */}
            <button
              onClick={handleReset}
              className="kid-btn kid-btn-white p-1 sm:p-2 rounded-xl border-2"
              title="Limpar e Recomeçar"
            >
              <div className="toy-gloss" />
              <RotateCcw size={15} />
            </button>
          </div>
        }
      />

      {/* 2. CARROSSEL HORIZONTAL RÁPIDO DO ALFABETO (SUPER FINO NO MOBILE) */}
      <div className="w-full bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-1.5 sm:px-4 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none z-10 flex-shrink-0 min-h-[30px] sm:min-h-[38px]">
        {BIBLICAL_ALPHABET.map((item, idx) => {
          const isSelected = currentIdx === idx;
          return (
            <button
              key={item.letter}
              onClick={() => goToLetter(idx)}
              className={`kid-btn px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm flex items-center gap-0.5 sm:gap-1 transition-all flex-shrink-0 ${
                isSelected
                  ? "kid-btn-yellow scale-105 shadow-toy-sm text-amber-950 ring-2 ring-yellow-400"
                  : "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span style={{ color: item.themeColor }}>{item.letter}</span>
              <span className="hidden sm:inline text-xs sm:text-sm">{item.emoji}</span>
            </button>
          );
        })}
      </div>

      {/* 3. PALCO CENTRAL: 100% LIMPO E LIVRE PARA O DEDO DA CRIANÇA PINTAR E CARIMBAR */}
      <div className="relative flex-1 min-h-0 w-full p-1.5 sm:p-4 landscape:p-1 flex items-center justify-center overflow-hidden">
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative aspect-square h-full max-h-[70vh] sm:max-h-[74vh] landscape:max-h-[76vh] max-w-[94vw] rounded-3xl sm:rounded-4xl bg-white border-4 sm:border-8 border-amber-400 shadow-[0_16px_45px_rgba(0,0,0,0.14)] overflow-hidden cursor-crosshair touch-none select-none flex items-center justify-center"
        >
          {/* Fundo de papel de desenho com textura suave */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

          {/* 1. CAMADA DE FUNDO (SOB O CANVAS): PISTA DA LETRA E TRAÇO EM PONTILHADO */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
              {/* Pista externa (borda de contorno suave) */}
              {current.paths.map((p, idx) => (
                <path
                  key={`bg-track-outer-${idx}`}
                  d={p}
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="56"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Pista interna suave (onde a criança pinta) */}
              {current.paths.map((p, idx) => (
                <path
                  key={`bg-track-inner-${idx}`}
                  d={p}
                  fill="none"
                  stroke="#F8FAFC"
                  strokeWidth="46"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* O TRAÇO EM PONTILHADO NO FORMATO DA LETRA */}
              {current.paths.map((p, idx) => (
                <path
                  key={`bg-dashed-${idx}`}
                  d={p}
                  fill="none"
                  stroke={current.themeColor}
                  strokeWidth="11"
                  strokeDasharray="16 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* PONTOS DE INÍCIO NUMERADOS (1, 2, 3...) COM HALO PULSANTE */}
              {current.startPoints.map((pt, idx) => (
                <g key={`bg-start-pt-${idx}`}>
                  {/* Halo de pulso */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="24"
                    fill={current.themeColor}
                    opacity="0.3"
                    className="animate-pulse"
                  />
                  {/* Ponto verde de partida */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="16"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    className="drop-shadow-sm"
                  />
                  {/* Número da ordem do traço */}
                  <text
                    x={pt.x}
                    y={pt.y + 5}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="900"
                    fill="#FFFFFF"
                    className="select-none font-bold"
                  >
                    {idx + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Dica amigável no topo da lousa */}
          <div className="absolute top-2 left-3 z-30 pointer-events-none flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/90 px-2.5 py-1 rounded-full shadow-sm text-[11px] sm:text-xs font-black text-slate-700">
            <span>🟢 Siga os números para traçar!</span>
          </div>

          {/* Mascote no canto inferior */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white/95 backdrop-blur-sm border border-amber-300 rounded-xl px-2 py-0.5 sm:px-3 sm:py-1 flex items-center gap-1.5 pointer-events-none shadow-sm z-30">
            <span className="text-xl sm:text-2xl">{current.emoji}</span>
            <span className="text-[11px] sm:text-xs font-black text-slate-800">
              {current.word}
            </span>
          </div>

          {/* 2. CANVAS INTERATIVO DE PINTURA (ONDE A CRIANÇA PINTA COM PINCEL OU BORRACHA) */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-10 touch-none pointer-events-none"
          />

          {/* 3. CAMADA FRONTAL DE CONTORNO (SOBRE O CANVAS): MANTÉM O PONTILHADO E NÚMEROS NÍTIDOS */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
              {/* Traço pontilhado nítido sobre a tinta */}
              {current.paths.map((p, idx) => (
                <path
                  key={`fg-dashed-${idx}`}
                  d={p}
                  fill="none"
                  stroke={current.themeColor}
                  strokeWidth="6"
                  strokeDasharray="16 14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
              ))}

              {/* Pontos de partida preservados no topo */}
              {current.startPoints.map((pt, idx) => (
                <g key={`fg-start-pt-${idx}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="15"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    className="drop-shadow-sm"
                  />
                  <text
                    x={pt.x}
                    y={pt.y + 4.5}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="900"
                    fill="#FFFFFF"
                    className="select-none font-bold"
                  >
                    {idx + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* 4. ADESIVOS COLADOS PELA CRIANÇA (NO TOPO DE TUDO) */}
          {stickers.map((s) => (
            <div
              key={s.id}
              className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform animate-wiggle"
              style={{
                left: `${s.xPercent}%`,
                top: `${s.yPercent}%`,
                transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
              }}
            >
              <span className="text-4xl sm:text-6xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] select-none">
                {s.emoji}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. BANDEJA INFERIOR DE FERRAMENTAS: PINCEL, CORES, BORRACHA, ADESIVOS E ANIMAR */}
      <div className="w-full bg-white/95 backdrop-blur-md px-2 sm:px-4 py-1.5 sm:py-2.5 landscape:py-1 border-t-2 sm:border-t-3 border-amber-400 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-20 flex-shrink-0">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-1.5">
          {/* Seletor de Modo: PINTAR vs ADESIVOS vs ANIMAR */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTab("brush");
                  setIsEraser(false);
                }}
                className={`kid-btn px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                  activeTab === "brush" && !isEraser
                    ? "bg-kids-yellow border-amber-600 text-amber-950 shadow-sm scale-105"
                    : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Paintbrush size={16} />
                <span>PINTAR</span>
              </button>

              <button
                onClick={() => {
                  sounds.playPop();
                  setActiveTab("stickers");
                  setIsEraser(false);
                }}
                className={`kid-btn px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                  activeTab === "stickers"
                    ? "bg-kids-purple text-white border-purple-800 shadow-sm scale-105"
                    : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Smile size={16} />
                <span>ADESIVOS</span>
              </button>

              {/* Botão de Animação também na bandeja */}
              <button
                onClick={triggerAnimate}
                className="kid-btn px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 border-amber-600 shadow-sm hover:scale-105 active:scale-95 animate-pulse-gentle"
                title="Ver a história animada da letra"
              >
                <Sparkles size={16} className="text-amber-700" />
                <span>ANIMAR</span>
              </button>

              {/* Borracha */}
              <button
                onClick={() => {
                  sounds.playEraser();
                  setIsEraser(true);
                  setActiveTab("brush");
                }}
                className={`kid-btn px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm flex items-center gap-1 transition-all ${
                  isEraser
                    ? "bg-rose-500 text-white border-rose-700 shadow-sm scale-105"
                    : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
                title="Borracha para apagar traços"
              >
                <Eraser size={16} />
                <span className="hidden sm:inline">BORRACHA</span>
              </button>
            </div>

            {/* Atalho Próxima Letra */}
            <button
              onClick={nextLetter}
              className="kid-btn bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border-2 border-emerald-700 shadow-sm flex items-center gap-1 active:scale-95"
            >
              <span>PRÓXIMA</span>
              <ArrowRight size={14} className="stroke-[3]" />
            </button>
          </div>

          {/* SELEÇÃO DO MODO PINCEL: CORES & TAMANHO */}
          {activeTab === "brush" && !isEraser && (
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-0.5">
              {/* Paleta de Cores */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {PALETTE_COLORS.map((c) => {
                  const isSelected = selectedColor === c.hex;
                  const isRainbow = c.hex === "rainbow";

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        sounds.playPop();
                        setSelectedColor(c.hex);
                        setIsEraser(false);
                      }}
                      className={`kid-btn w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 transition-all flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "scale-120 border-slate-900 shadow-md ring-2 ring-yellow-400"
                          : "border-white hover:scale-110 shadow-sm"
                      } ${
                        isRainbow
                          ? "bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500 animate-spin"
                          : ""
                      }`}
                      style={{
                        backgroundColor: isRainbow ? undefined : c.hex,
                      }}
                      title={c.label}
                    >
                      {isSelected && (
                        <Check
                          size={14}
                          className={c.id === "yellow" ? "text-slate-900 stroke-[3]" : "text-white stroke-[3]"}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Espessura do Traço (Fino, Médio, Grosso) */}
              <div className="flex items-center gap-1 border-l-2 border-slate-200 pl-2">
                {[
                  { size: 12, label: "P", dotSize: "w-2 h-2" },
                  { size: 24, label: "M", dotSize: "w-3.5 h-3.5" },
                  { size: 40, label: "G", dotSize: "w-5 h-5" },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      sounds.playPop();
                      setBrushSize(s.size);
                    }}
                    className={`kid-btn w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center ${
                      brushSize === s.size
                        ? "bg-amber-200 border-amber-500 scale-105"
                        : "bg-slate-100 border-slate-300"
                    }`}
                    title={`Pincel ${s.label}`}
                  >
                    <div className={`rounded-full bg-slate-800 ${s.dotSize}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SELEÇÃO DO MODO ADESIVOS: BANDEJA COM OS EMOJIS */}
          {activeTab === "stickers" && (
            <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] sm:text-xs font-black text-purple-950 whitespace-nowrap hidden sm:inline">
                Toque no adesivo e carimbe na tela:
              </span>
              {STICKER_LIST.map((em) => {
                const isSelected = selectedSticker === em;
                return (
                  <button
                    key={em}
                    onClick={() => {
                      sounds.playPop();
                      setSelectedSticker(em);
                    }}
                    className={`kid-btn text-2xl sm:text-3xl p-1 rounded-xl border-2 transition-all flex-shrink-0 ${
                      isSelected
                        ? "bg-purple-100 border-purple-600 scale-120 shadow-md ring-2 ring-purple-400"
                        : "bg-slate-50 border-slate-200 hover:bg-purple-50"
                    }`}
                  >
                    {em}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. POP-UP DA ANIMAÇÃOZINHA MÁGICA DA LETRA ("MOSTRAR LETRA DE QUE ELA É") */}
      {showAnimationModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in select-none">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-white via-amber-50 to-yellow-100 rounded-3xl sm:rounded-4xl border-4 sm:border-8 border-amber-400 shadow-2xl p-4 sm:p-6 flex flex-col items-center text-center overflow-hidden animate-bounce-gentle">
            {/* Botão Fechar no Canto */}
            <button
              onClick={() => setShowAnimationModal(false)}
              className="absolute top-3 right-3 bg-white/90 text-slate-700 hover:bg-slate-100 p-1.5 rounded-full border border-slate-300 shadow-sm"
              title="Fechar"
            >
              <X size={20} />
            </button>

            {/* Letra Gigante Dançante */}
            <div className="relative flex items-center justify-center my-2">
              <span
                className="text-7xl sm:text-9xl font-black drop-shadow-xl animate-wiggle inline-block"
                style={{ color: current.themeColor }}
              >
                {current.letter}
              </span>
              <span className="absolute -top-2 -right-4 text-3xl sm:text-5xl animate-bounce">
                ✨
              </span>
            </div>

            {/* Título da Animação: "A de Arca de Noé!" */}
            <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-1">
              <span style={{ color: current.themeColor }}>{current.letter}</span> de{" "}
              <span className="text-amber-600">{current.word}</span>!
            </div>

            {/* Subtítulo Bíblico Educativo */}
            <p className="text-xs sm:text-base font-bold text-slate-600 max-w-xs sm:max-w-md mb-4">
              {current.subtitle}
            </p>

            {/* CENÁRIO ANIMADO ESPECIAL DA LETRA */}
            <div className="w-full h-32 sm:h-44 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-100 rounded-2xl border-2 sm:border-4 border-amber-300 shadow-inner relative flex items-center justify-center overflow-hidden mb-4">
              {/* Nuvens e Sol */}
              <div className="absolute top-2 left-4 text-2xl opacity-60">☁️</div>
              <div className="absolute top-3 right-6 text-2xl opacity-60">☁️</div>
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-2xl animate-spin" style={{ animationDuration: "12s" }}>
                ☀️
              </div>

              {/* Elementos Animados Específicos por Letra */}
              <div className="flex flex-col items-center justify-center z-10">
                <span className="text-6xl sm:text-8xl animate-bounce drop-shadow-lg">
                  {current.emoji}
                </span>
                <span className="mt-1 px-3 py-0.5 rounded-full bg-white/90 border border-amber-400 text-xs sm:text-sm font-black text-amber-950 shadow-sm animate-pulse">
                  {current.word} ⭐
                </span>
              </div>

              {/* Ondas / Chão */}
              <div className="absolute -bottom-2 inset-x-0 h-6 bg-gradient-to-t from-emerald-500/30 to-transparent pointer-events-none" />
            </div>

            {/* BOTÕES DE AÇÃO: OUVIR DE NOVO E PRÓXIMA LETRA */}
            <div className="w-full flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => {
                  sounds.playSparkle();
                  playLetterSound(current.soundType);
                  speakLetterWord(current.letter, current.word);
                  confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                }}
                className="kid-btn bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-black text-xs sm:text-base px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-2 border-amber-600 shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <Volume2 size={18} />
                <span>OUVIR DE NOVO</span>
              </button>

              <button
                onClick={() => {
                  setShowAnimationModal(false);
                }}
                className="kid-btn bg-white hover:bg-slate-100 text-slate-700 font-black text-xs sm:text-base px-3 py-2 sm:px-5 sm:py-2.5 rounded-2xl border-2 border-slate-300 shadow-sm active:scale-95"
              >
                <span>CONTINUAR PINTANDO 🎨</span>
              </button>

              <button
                onClick={nextLetter}
                className="kid-btn bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-base px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl border-2 border-emerald-700 shadow-kid flex items-center gap-1.5 active:scale-95"
              >
                <span>PRÓXIMA LETRA</span>
                <ArrowRight size={18} className="stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
