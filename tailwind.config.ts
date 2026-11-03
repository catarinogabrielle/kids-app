import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        kids: {
          yellow: "#FFD166",
          orange: "#FF9F1C",
          coral: "#FF6B6B",
          pink: "#FF70A6",
          purple: "#9B5DE5",
          blue: "#4D96FF",
          sky: "#38BDF8",
          teal: "#06D6A0",
          green: "#6BCB77",
          lime: "#99E265",
          cream: "#FEF9E7",
          wood: "#DEB887",
        },
        toy: {
          yellow: { face: "#FFD166", border: "#D97706", dark: "#B45309", light: "#FEF3C7" },
          amber: { face: "#F59E0B", border: "#B45309", dark: "#78350F", light: "#FDE68A" },
          blue: { face: "#38BDF8", border: "#0284C7", dark: "#0369A1", light: "#BAE6FD" },
          indigo: { face: "#6366F1", border: "#4338CA", dark: "#312E81", light: "#E0E7FF" },
          teal: { face: "#06D6A0", border: "#059669", dark: "#047857", light: "#A7F3D0" },
          emerald: { face: "#10B981", border: "#047857", dark: "#064E3B", light: "#D1FAE5" },
          green: { face: "#22C55E", border: "#15803D", dark: "#166534", light: "#DCFCE7" },
          coral: { face: "#FF6B6B", border: "#DC2626", dark: "#991B1B", light: "#FEE2E2" },
          pink: { face: "#EC4899", border: "#BE185D", dark: "#831843", light: "#FCE7F3" },
          purple: { face: "#A855F7", border: "#7E22CE", dark: "#581C87", light: "#F3E8FF" },
          orange: { face: "#F97316", border: "#C2410C", dark: "#7C2D12", light: "#FFEDD5" },
        },
      },
      fontFamily: {
        kids: ["var(--font-fredoka)", "sans-serif"],
      },
      boxShadow: {
        "kid-sm": "0 4px 0 rgba(0,0,0,0.15)",
        "kid": "0 6px 0 rgba(0,0,0,0.18)",
        "kid-lg": "0 10px 0 rgba(0,0,0,0.22)",
        "toy-sm": "0 3px 0 var(--toy-border, rgba(0,0,0,0.2)), inset 0 2px 0 rgba(255,255,255,0.45)",
        "toy": "0 6px 0 var(--toy-border, rgba(0,0,0,0.25)), inset 0 2px 0 rgba(255,255,255,0.5)",
        "toy-lg": "0 10px 0 var(--toy-border, rgba(0,0,0,0.3)), inset 0 3px 0 rgba(255,255,255,0.55)",
        "toy-pressed": "0 2px 0 var(--toy-border, rgba(0,0,0,0.2)), inset 0 1px 0 rgba(255,255,255,0.3)",
        "toy-card": "0 8px 0 var(--toy-border, rgba(0,0,0,0.18)), 0 16px 28px -6px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.5)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      borderWidth: {
        "3": "3px",
        "5": "5px",
        "6": "6px",
      },
    },
  },
  plugins: [],
};
export default config;
