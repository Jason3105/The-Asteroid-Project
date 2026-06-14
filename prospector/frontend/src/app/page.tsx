import Link from "next/link";
import { ArrowRight, Rocket, Star, Zap, Database, Globe, Calculator, BarChart3, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-space-950 relative overflow-hidden font-sans text-secondary-400">
      {/* Structural Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20" style={{
        backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        {/* Badge */}
        <div className="badge-electric mb-6 animate-fade-in border-primary-500">
          <Activity className="w-3 h-3 mr-2" />
          SYSTEM ONLINE: NASA JPL DATA SYNC ACTIVE
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter text-white animate-slide-up">
          PROSPECTOR
        </h1>

        <p className="text-xl md:text-2xl text-secondary-400 font-mono mb-4 animate-fade-in uppercase tracking-widest">
          Asteroid Mining Feasibility Engine
        </p>

        <p className="text-sm md:text-base text-secondary-500 max-w-2xl mb-12 leading-relaxed animate-fade-in font-mono">
          AGGREGATING ORBITAL MECHANICS, SPECTROSCOPY, AND ECONOMIC MODELING TO RANK NEAR-EARTH ASTEROIDS BY MINING VIABILITY.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 animate-slide-up">
          <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-sm">
            <Rocket className="w-4 h-4" />
            INITIALIZE DASHBOARD
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link href="/leaderboard" className="btn-secondary flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            VIEW EVS RANKINGS
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1 mt-20 max-w-3xl w-full animate-fade-in border border-slate-700 bg-slate-800 p-[1px]">
          {[
            { label: "TARGETS ANALYZED", value: "780K+", icon: <Database className="w-5 h-5" /> },
            { label: "API ENDPOINTS", value: "3", icon: <Globe className="w-5 h-5" /> },
            { label: "EVS ALGORITHM", value: "v1.0", icon: <Calculator className="w-5 h-5" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-space-950 p-6 flex flex-col items-center text-center">
              <div className="text-secondary-500 mb-3">{stat.icon}</div>
              <div className="text-2xl font-mono text-primary-400 mb-2">{stat.value}</div>
              <div className="text-[10px] text-secondary-500 font-mono uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 border-t border-slate-800 bg-space-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex flex-col items-start border-l-4 border-primary-500 pl-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase mb-2">
              Intelligence Engine Architecture
            </h2>
            <p className="text-secondary-400 text-sm font-mono uppercase">
              Six layers of analysis to identify optimal asteroid mining targets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-slate-700 border border-slate-700">
            {features.map((f) => (
              <div key={f.title} className="bg-space-950 p-8 hover:bg-slate-800/50 transition-colors">
                <div className="text-primary-500 mb-6">{f.icon}</div>
                <h3 className="text-sm font-bold mb-3 text-white uppercase tracking-wider">{f.title}</h3>
                <p className="text-secondary-500 text-xs font-mono leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVS Formula Section */}
      <section className="relative z-10 px-6 py-24 bg-space-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-1 border border-slate-700">
            <div className="bg-space-900 p-8 flex flex-col items-center text-center">
              <div className="badge-solar mb-6">
                <Zap className="w-3 h-3 mr-2" />
                PROPRIETARY ALGORITHM
              </div>
              <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-wider">Economic Viability Score (EVS)</h2>
              <div className="w-full bg-space-950 border border-slate-700 p-6 mb-8 font-mono text-sm">
                <span className="text-white">EVS</span> = 
                <span className="text-primary-400"> (0.30 × Accessibility)</span> + 
                <span className="text-secondary-400"> (0.45 × ResourceValue)</span> + 
                <span className="text-slate-400"> (0.25 × Feasibility)</span>
              </div>
              <p className="text-secondary-500 text-xs font-mono max-w-2xl mx-auto leading-relaxed uppercase mb-8">
                Resource value is weighted highest as economic profitability is the primary objective.
                Delta-v determines accessibility, mineral composition determines value, and mission parameters determine feasibility.
              </p>
              <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2 text-sm uppercase tracking-wider">
                EXECUTE EVS CALCULATION
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <Database className="w-6 h-6" />,
    title: "Live NASA Data Sync",
    desc: "Ingests real-time telemetry from JPL SBDB, NHATS, and Close Approach APIs via secure data pipelines.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Orbital Mechanics",
    desc: "Rigorous Keplerian orbit computations utilizing Newton-Raphson solvers and Hohmann transfer delta-v estimations.",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Spectral Analysis",
    desc: "Translates taxonomic classifications (S, C, M, X, V, B, D) into probable mineral compositions and mass fractions.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Economic Modeling",
    desc: "Calculates gross estimated value utilizing current commodity pricing for Iron, Nickel, Cobalt, Platinum, and Water.",
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Mission Logistics",
    desc: "Evaluates mission feasibility by identifying accessible launch windows, required fuel mass, and total mission durations.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "3D Telemetry Viewer",
    desc: "Interactive spatial visualization of orbital trajectories mapped against Earth's orbit for proximity assessment.",
  },
];
