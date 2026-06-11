import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LeaderboardTable } from "@/components/asteroid/LeaderboardTable";

export const metadata = {
  title: "Leaderboard — PROSPECTOR",
  description: "Top asteroid mining targets ranked by Economic Viability Score (EVS)",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen px-4 md:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black gradient-text mb-2">
          EVS Leaderboard
        </h1>
        <p className="text-asteroid-400">
          Top asteroid mining candidates ranked by Economic Viability Score
        </p>
      </div>

      <div className="glass-card p-6">
        <Suspense fallback={<LoadingSpinner />}>
          <LeaderboardTable />
        </Suspense>
      </div>
    </div>
  );
}
