import type {Config} from "tailwindcss";
import {heroui} from "@heroui/theme";

export default {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        slate: "#64748b",
        accent: "#0f766e",
        blush: "#fef2f2"
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)"
      }
    }
  },
    plugins: [heroui()]
} satisfies Config;
