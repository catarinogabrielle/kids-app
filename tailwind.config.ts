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
      },
      fontFamily: {
        kids: ["var(--font-fredoka)", "sans-serif"],
      },
      boxShadow: {
        "kid-sm": "0 4px 0 rgba(0,0,0,0.15)",
        "kid": "0 6px 0 rgba(0,0,0,0.18)",
        "kid-lg": "0 10px 0 rgba(0,0,0,0.22)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      borderWidth: {
        "6": "6px",
      },
    },
  },
  plugins: [],
};
export default config;
