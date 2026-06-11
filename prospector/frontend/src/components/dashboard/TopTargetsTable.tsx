"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getEvsLeaderboard, formatUSD, formatDeltaV, getEvsColor, getSpectralColor } from "@/services/api";

export function TopTargetsTable({ limit = 10 }: { limit?: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => getEvsLeaderboard({ limit }).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data?.entries?.length) {
    return (
      <div className="text-center py-8 text-asteroid-400">
        <div className="text-4xl mb-3">☄️</div>
        <p className="font-medium">No asteroid data yet.</p>
        <p className="text-sm mt-1">Trigger a sync from the API to load data.</p>
        <code className="text-xs mt-2 block text-nebula-400">POST /api/asteroids/sync</code>
      </div>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Designation</th>
          <th>Type</th>
          <th>EVS Score</th>
          <th>Δv</th>
          <th>Est. Value</th>
          <th>Orbit</th>
        </tr>
      </thead>
      <tbody>
        {data.entries.map((entry) => (
          <tr key={entry.designation} className="cursor-pointer hover:bg-white/3 transition-colors">
            <td>
              <span className="text-asteroid-400 font-mono text-xs">#{entry.rank}</span>
            </td>
            <td>
              <Link
                href={`/asteroids/${encodeURIComponent(entry.designation)}`}
                className="font-semibold text-white hover:text-nebula-400 transition-colors"
              >
                {entry.full_name || entry.designation}
              </Link>
              <div className="text-xs text-asteroid-400 font-mono">{entry.designation}</div>
            </td>
            <td>
              {entry.spectral_type ? (
                <span className={`font-mono font-bold text-sm ${getSpectralColor(entry.spectral_type)}`}>
                  {entry.spectral_type}
                </span>
              ) : (
                <span className="text-asteroid-400 text-xs">Unknown</span>
              )}
            </td>
            <td>
              <div className={`font-black text-lg ${getEvsColor(entry.score)}`}>
                {entry.score.toFixed(1)}
              </div>
              <div className="w-full bg-white/10 rounded-full h-1 mt-1">
                <div
                  className={`h-1 rounded-full ${
                    entry.score >= 70 ? "bg-green-500" : entry.score >= 40 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(100, entry.score)}%` }}
                />
              </div>
            </td>
            <td>
              <span className="font-mono text-electric-400 text-sm">
                {formatDeltaV(entry.min_delta_v)}
              </span>
            </td>
            <td>
              <span className="font-mono text-solar-400 text-sm">
                {formatUSD(entry.estimated_value_usd)}
              </span>
            </td>
            <td>
              {entry.orbit_class && (
                <span className="badge-nebula text-xs">{entry.orbit_class}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
