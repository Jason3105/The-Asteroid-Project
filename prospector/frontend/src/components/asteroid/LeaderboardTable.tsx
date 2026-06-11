"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getEvsLeaderboard, formatUSD, formatDeltaV, getEvsColor, getSpectralColor } from "@/services/api";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function LeaderboardTable() {
  const [page, setPage] = useState(0);
  const limit = 25;

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard-full", page],
    queryFn: () => getEvsLeaderboard({ limit, skip: page * limit }).then((r) => r.data),
  });

  if (isLoading) return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (error || !data) return (
    <div className="text-center py-16 text-asteroid-400">
      <div className="text-5xl mb-4">🔭</div>
      <p className="text-lg font-medium">No data available.</p>
      <p className="text-sm">Start the FastAPI backend and trigger a sync.</p>
    </div>
  );

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-asteroid-400 text-sm">{data.total} asteroids scored</span>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="px-3 py-1 rounded-lg bg-white/5 text-sm disabled:opacity-40 hover:bg-white/10 transition-colors"
          >
            ← Prev
          </button>
          <span className="px-3 py-1 text-sm text-asteroid-400">
            {page + 1} / {totalPages || 1}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded-lg bg-white/5 text-sm disabled:opacity-40 hover:bg-white/10 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Asteroid</th>
            <th>Spectral</th>
            <th>EVS Score</th>
            <th>Access.</th>
            <th>Value</th>
            <th>Feasibility</th>
            <th>Δv (km/s)</th>
            <th>Est. Value</th>
            <th>Orbit</th>
          </tr>
        </thead>
        <tbody>
          {data.entries.map((entry) => (
            <tr key={entry.designation} className="transition-colors">
              <td>
                <span className="text-asteroid-400 font-mono text-xs">#{entry.rank}</span>
              </td>
              <td>
                <Link
                  href={`/asteroids/${encodeURIComponent(entry.designation)}`}
                  className="font-semibold hover:text-nebula-400 transition-colors"
                >
                  {entry.full_name || entry.designation}
                </Link>
                <div className="text-xs text-asteroid-400 font-mono mt-0.5">{entry.designation}</div>
              </td>
              <td>
                <span className={`font-mono font-bold ${getSpectralColor(entry.spectral_type)}`}>
                  {entry.spectral_type || "—"}
                </span>
              </td>
              <td>
                <div className={`font-black text-xl ${getEvsColor(entry.score)}`}>
                  {entry.score.toFixed(1)}
                </div>
              </td>
              <td>
                <span className="text-electric-400 font-mono text-sm">
                  {entry.accessibility_sub?.toFixed(1) ?? "—"}
                </span>
              </td>
              <td>
                <span className="text-nebula-400 font-mono text-sm">
                  {entry.value_sub?.toFixed(1) ?? "—"}
                </span>
              </td>
              <td>
                <span className="text-solar-400 font-mono text-sm">
                  {entry.feasibility_sub?.toFixed(1) ?? "—"}
                </span>
              </td>
              <td>
                <span className="text-white/80 font-mono text-sm">
                  {formatDeltaV(entry.min_delta_v)}
                </span>
              </td>
              <td>
                <span className="text-green-400 font-mono text-sm">
                  {formatUSD(entry.estimated_value_usd)}
                </span>
              </td>
              <td>
                {entry.orbit_class && (
                  <span className="badge-electric text-xs">{entry.orbit_class}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
