import { Suspense } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TopTargetsTable } from "@/components/dashboard/TopTargetsTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const metadata = {
  title: "Dashboard — PROSPECTOR",
  description: "Real-time asteroid mining analytics dashboard with EVS rankings and mission stats.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen px-4 md:px-8 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black gradient-text mb-2">
          Mining Intelligence Dashboard
        </h1>
        <p className="text-asteroid-400">
          Real-time EVS rankings and analytics for Near-Earth Asteroid mining targets
        </p>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<LoadingSpinner />}>
        <StatsCards />
      </Suspense>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Targets Table - takes 2 cols */}
        <div className="xl:col-span-2">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-1">Top Mining Targets</h2>
            <p className="text-asteroid-400 text-sm mb-6">
              Ranked by Economic Viability Score (EVS)
            </p>
            <Suspense fallback={<LoadingSpinner />}>
              <TopTargetsTable />
            </Suspense>
          </div>
        </div>

        {/* Quick Info Panel */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4 text-asteroid-400 uppercase tracking-wider">
              About EVS
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-asteroid-400">Accessibility</span>
                <span className="font-mono text-electric-400">30%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-electric-500 h-1.5 rounded-full" style={{ width: "30%" }} />
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-asteroid-400">Resource Value</span>
                <span className="font-mono text-nebula-400">45%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-nebula-500 h-1.5 rounded-full" style={{ width: "45%" }} />
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-asteroid-400">Feasibility</span>
                <span className="font-mono text-solar-400">25%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-solar-500 h-1.5 rounded-full" style={{ width: "25%" }} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-base font-semibold mb-4 text-asteroid-400 uppercase tracking-wider">
              Data Sources
            </h3>
            <div className="space-y-2 text-sm">
              {["SBDB Lookup", "SBDB Query", "NHATS", "Close Approach"].map((src) => (
                <div key={src} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-asteroid-400">{src}</span>
                  <span className="ml-auto text-green-400 text-xs">LIVE</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
