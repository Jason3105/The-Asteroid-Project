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
          950: "#0b0e14",
          900: "#10131a",
          800: "#191c22",
          700: "#1d2026",
          600: "#272a31",
          500: "#32353c",
          400: "#363940",
        },
        primary: {
          400: "#7bd0ff",
          500: "#38bdf8",
          600: "#0ea5e9",
        },
        secondary: {
          400: "#cbd5e1",
          500: "#94a3b8",
          600: "#64748b",
        },
        slate: {
          800: "#1E293B",
          900: "#0F172A",
        },
        electric: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        asteroid: {
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
        },
        // EVS score color scale
        evs: {
          high: "#38bdf8",
          mid: "#94a3b8",
          low: "#475569",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "space-gradient": "linear-gradient(to bottom, #0b0e14, #10131a)",
        "nebula-gradient": "linear-gradient(to right, #1E293B, #0F172A)",
        "solar-gradient": "linear-gradient(to right, #1E293B, #38bdf8)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
      },
      boxShadow: {
        "glow-nebula": "0 0 1px rgba(148, 163, 184, 0.5)",
        "glow-electric": "0 0 10px rgba(56, 189, 248, 0.2)",
        "glow-solar": "0 0 1px rgba(148, 163, 184, 0.5)",
        "glow-green": "0 0 1px rgba(148, 163, 184, 0.5)",
        glass: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
