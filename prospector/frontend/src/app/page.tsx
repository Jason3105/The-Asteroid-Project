import Link from "next/link";
import { ArrowRight, Rocket, Star, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-space-gradient relative overflow-hidden">
      {/* Star field background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
              width: Math.random() > 0.8 ? "3px" : "2px",
              height: Math.random() > 0.8 ? "3px" : "2px",
            }}
          />
        ))}
      </div>

      {/* Nebula glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nebula-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        {/* Badge */}
        <div className="badge-nebula mb-6 animate-fade-in">
          <Star className="w-3 h-3 mr-1.5" />
          Powered by live NASA JPL data
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-slide-up">
          <span className="gradient-text">PROSPECTOR</span>
        </h1>

        <p className="text-xl md:text-2xl text-asteroid-400 font-medium mb-4 animate-fade-in">
          Which asteroid should humanity mine first?
        </p>

        <p className="text-base md:text-lg text-asteroid-400/70 max-w-2xl mb-12 leading-relaxed animate-fade-in">
          A real-time asteroid mining feasibility engine that combines orbital mechanics,
          spectroscopy, and economic modeling to rank every Near-Earth Asteroid by mining viability.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-base">
            <Rocket className="w-5 h-5" />
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/leaderboard" className="btn-secondary flex items-center gap-2 text-base">
            <Star className="w-5 h-5" />
            View Leaderboard
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-20 max-w-2xl w-full animate-fade-in">
          {[
            { label: "Asteroids Tracked", value: "119+", icon: "☄️" },
            { label: "Live NASA APIs", value: "4", icon: "🛰️" },
            { label: "EVS Algorithm", value: "v1.0", icon: "🧮" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold gradient-text-nebula">{stat.value}</div>
              <div className="text-xs text-asteroid-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <h2 className="section-header text-center gradient-text mb-4">
          Intelligence Engine
        </h2>
        <p className="section-subtext text-center mb-16">
          Six layers of analysis to find humanity's best asteroid mining target
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card-hover p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-asteroid-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EVS Formula Section */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="badge-solar mb-4 mx-auto w-fit">
            <Zap className="w-3 h-3 mr-1.5" />
            Proprietary Algorithm
          </div>
          <h2 className="text-2xl font-bold mb-4">Economic Viability Score (EVS)</h2>
          <div className="font-mono text-electric-400 text-lg mb-6 p-4 bg-space-800 rounded-xl">
            EVS = (0.30 × Accessibility) + (0.45 × ResourceValue) + (0.25 × Feasibility)
          </div>
          <p className="text-asteroid-400 text-sm max-w-xl mx-auto">
            Resource value is weighted highest because economic profitability is the primary objective.
            Delta-v determines accessibility, mineral composition determines value, and mission parameters determine feasibility.
          </p>
          <Link href="/leaderboard" className="btn-primary inline-flex items-center gap-2 mt-6">
            See Top Ranked Asteroids
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: "🛸",
    title: "Live NASA Data",
    desc: "Ingests real-time data from JPL SBDB, NHATS, and Close Approach APIs. No API keys needed.",
  },
  {
    icon: "📐",
    title: "Orbital Mechanics",
    desc: "Full Keplerian orbit calculations with Newton-Raphson Kepler solving and Hohmann transfer estimates.",
  },
  {
    icon: "🔬",
    title: "Spectral Analysis",
    desc: "Maps spectral types (S, C, M, X, V, B, D) to mineral composition with confidence scoring.",
  },
  {
    icon: "💰",
    title: "Economic Modeling",
    desc: "Estimates total mineral value using commodity prices. Simulates market impact of asteroid mining.",
  },
  {
    icon: "🚀",
    title: "Mission Planning",
    desc: "Generates complete mission plans with launch windows, fuel requirements, and cost breakdowns.",
  },
  {
    icon: "🌐",
    title: "3D Visualization",
    desc: "Interactive solar system visualization with real orbital data, rendered with Three.js.",
  },
];
