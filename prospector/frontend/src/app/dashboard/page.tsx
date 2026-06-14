import { Suspense } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TopTargetsTable } from "@/components/dashboard/TopTargetsTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Search, Activity, Radar } from "lucide-react";

export const metadata = {
  title: "Dashboard — PROSPECTOR",
  description: "Real-time asteroid mining analytics dashboard with EVS rankings and mission stats.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen px-4 md:px-8 py-8 max-w-[1600px] mx-auto bg-space-950 text-secondary-400 font-sans">
      {/* Header with Search */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6">
        <div>
          <div className="badge-electric mb-3 border-primary-500">
            <Activity className="w-3 h-3 mr-2" />
            LIVE TELEMETRY
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase mb-1">
            Mining Intelligence Dashboard
          </h1>
          <p className="text-secondary-500 font-mono text-sm uppercase tracking-widest">
            EVS Rankings & Recent Close Approaches
          </p>
        </div>
        <div className="mt-4 md:mt-0 w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500" />
            <input 
              type="text" 
              placeholder="SEARCH DESIGNATION (e.g., 16 Psyche)..." 
              className="w-full bg-space-900 border border-slate-700 text-white font-mono text-xs p-3 pl-10 focus:outline-none focus:border-primary-500 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<LoadingSpinner />}>
        <StatsCards />
      </Suspense>

      {/* Main Content Grid */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Top Targets Table - takes 8 cols */}
        <div className="xl:col-span-8">
          <div className="glass-card p-0 overflow-hidden border border-slate-700">
            <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">EVS Leaderboard</h2>
              <span className="text-[10px] text-secondary-500 font-mono uppercase border border-slate-700 px-2 py-1 bg-space-900">Ranked by Score</span>
            </div>
            <Suspense fallback={<div className="p-8"><LoadingSpinner /></div>}>
              <TopTargetsTable />
            </Suspense>
          </div>
        </div>

        {/* Sidebar - takes 4 cols */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Close Approaches Panel */}
          <div className="glass-card p-0 border border-slate-700">
            <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center gap-2">
              <Radar className="w-4 h-4 text-primary-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Close Approaches</h3>
            </div>
            <div className="p-6 text-center text-secondary-500 text-xs font-mono border-b border-slate-700/50 hover:bg-slate-800/20 cursor-pointer">
               CAD API Sync Active. Close approach alerts will populate here.
            </div>
          </div>

          <div className="glass-card p-0 border border-slate-700">
            <div className="bg-slate-800/50 p-4 border-b border-slate-700">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Status</h3>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-secondary-400">SBDB Query API</span>
                <span className="text-primary-400 flex items-center"><div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-secondary-400">CAD API</span>
                <span className="text-primary-400 flex items-center"><div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-secondary-400">NHATS API</span>
                <span className="text-primary-400 flex items-center"><div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
