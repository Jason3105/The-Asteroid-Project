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
      <div className="space-y-[1px] bg-slate-700 p-[1px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-space-900 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data?.entries?.length) {
    return (
      <div className="text-center py-12 text-secondary-500 font-mono text-sm border-t border-slate-700">
        <p className="mb-2">AWAITING TELEMETRY SYNC...</p>
        <code className="text-[10px] text-primary-500 bg-space-950 border border-primary-500/30 px-2 py-1">POST /api/asteroids/sync</code>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-space-950 border-b border-slate-700">
            <th className="py-3 px-4 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Rank</th>
            <th className="py-3 px-4 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Designation</th>
            <th className="py-3 px-4 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Class</th>
            <th className="py-3 px-4 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">EVS</th>
            <th className="py-3 px-4 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Δv (km/s)</th>
            <th className="py-3 px-4 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Est. Value (USD)</th>
            <th className="py-3 px-4 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Orbit</th>
          </tr>
        </thead>
        <tbody className="bg-space-900 divide-y divide-slate-800">
          {data.entries.map((entry) => (
            <tr key={entry.designation} className="hover:bg-slate-800/50 transition-colors">
              <td className="py-3 px-4 text-xs font-mono text-secondary-500">
                {String(entry.rank).padStart(3, '0')}
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-col">
                  <Link
                    href={`/asteroids/${encodeURIComponent(entry.designation)}`}
                    className="text-white hover:text-primary-400 text-sm tracking-tight transition-colors"
                  >
                    {entry.full_name || entry.designation}
                  </Link>
                  <span className="text-[10px] text-secondary-500 font-mono mt-0.5">{entry.designation}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                {entry.spectral_type ? (
                  <span className={`text-xs font-mono font-bold ${getSpectralColor(entry.spectral_type)}`}>
                    {entry.spectral_type}
                  </span>
                ) : (
                  <span className="text-secondary-600 text-[10px] font-mono">UNK</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono font-bold ${getEvsColor(entry.score)}`}>
                    {entry.score.toFixed(1)}
                  </span>
                  <div className="w-16 h-[2px] bg-slate-800">
                    <div
                      className={`h-[2px] ${entry.score >= 70 ? "bg-primary-500" : entry.score >= 40 ? "bg-secondary-400" : "bg-slate-500"}`}
                      style={{ width: `${Math.min(100, entry.score)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-xs font-mono text-primary-400">
                {formatDeltaV(entry.min_delta_v)}
              </td>
              <td className="py-3 px-4 text-xs font-mono text-secondary-400">
                {formatUSD(entry.estimated_value_usd)}
              </td>
              <td className="py-3 px-4">
                {entry.orbit_class && (
                  <span className="text-[10px] border border-slate-700 bg-space-950 px-1.5 py-0.5 text-secondary-400 font-mono">
                    {entry.orbit_class}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
