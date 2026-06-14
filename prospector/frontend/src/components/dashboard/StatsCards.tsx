"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvsStats } from "@/services/api";
import { formatUSD } from "@/services/api";
import { TrendingUp, Target, Award, DollarSign } from "lucide-react";

export function StatsCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["evs-stats"],
    queryFn: () => getEvsStats().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-space-900 border border-slate-700 p-6 animate-pulse">
            <div className="h-6 bg-slate-800 rounded mb-2 w-8" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-space-900 border border-slate-700 p-6 text-secondary-500 font-mono text-xs text-center uppercase">
        Failed to load telemetry. Establish backend uplink.
      </div>
    );
  }

  const stats = [
    {
      label: "Targets Analyzed",
      value: data.total_scored.toLocaleString(),
      icon: Target,
      color: "text-primary-400",
    },
    {
      label: "Mean EVS",
      value: data.avg_score.toFixed(1),
      icon: TrendingUp,
      color: "text-secondary-400",
    },
    {
      label: "Peak EVS",
      value: data.max_score.toFixed(1),
      icon: Award,
      color: "text-secondary-400",
    },
    {
      label: "Total Est. Value",
      value: formatUSD(data.total_estimated_value_usd),
      icon: DollarSign,
      color: "text-primary-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-space-900 border border-slate-700 p-6 flex flex-col justify-between hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className={`${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-[10px] text-secondary-500 font-mono uppercase tracking-widest border border-slate-700 px-1.5 py-0.5 bg-space-950">
              Active
            </div>
          </div>
          <div>
            <div className={`text-2xl font-mono ${color} mb-1 tracking-tight`}>{value}</div>
            <div className="text-[11px] text-secondary-500 uppercase tracking-widest font-mono">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
