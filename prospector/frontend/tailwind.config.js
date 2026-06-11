/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep space color palette
        space: {
          950: "#03040a",
          900: "#060812",
          800: "#0a0d1e",
          700: "#0f1428",
          600: "#141b35",
        },
        nebula: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        electric: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        solar: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        asteroid: {
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
        },
        // EVS score color scale
        evs: {
          high: "#22c55e",
          mid: "#f59e0b",
          low: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "space-gradient": "radial-gradient(ellipse at center, #0a0d1e 0%, #03040a 100%)",
        "nebula-gradient": "linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)",
        "solar-gradient": "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        "glow-nebula": "0 0 20px rgba(139, 92, 246, 0.4)",
        "glow-electric": "0 0 20px rgba(14, 165, 233, 0.4)",
        "glow-solar": "0 0 20px rgba(245, 158, 11, 0.4)",
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.4)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "orbit-spin": "orbit-spin 20s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "orbit-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
