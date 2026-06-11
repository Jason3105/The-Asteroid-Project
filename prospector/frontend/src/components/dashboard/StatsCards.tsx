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
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-2" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6 text-asteroid-400 text-center">
        Failed to load stats. Start the backend and trigger a sync.
      </div>
    );
  }

  const stats = [
    {
      label: "Asteroids Scored",
      value: data.total_scored.toLocaleString(),
      icon: Target,
      color: "text-electric-400",
      glow: "shadow-glow-electric",
    },
    {
      label: "Avg EVS Score",
      value: data.avg_score.toFixed(1),
      icon: TrendingUp,
      color: "text-nebula-400",
      glow: "shadow-glow-nebula",
    },
    {
      label: "Top EVS Score",
      value: data.max_score.toFixed(1),
      icon: Award,
      color: "text-solar-400",
      glow: "shadow-glow-solar",
    },
    {
      label: "Total Est. Value",
      value: formatUSD(data.total_estimated_value_usd),
      icon: DollarSign,
      color: "text-green-400",
      glow: "shadow-glow-green",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, glow }) => (
        <div key={label} className="glass-card p-6">
          <div className={`${color} mb-3`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className={`text-2xl font-black ${color} mb-1`}>{value}</div>
          <div className="text-xs text-asteroid-400 uppercase tracking-wider">{label}</div>
        </div>
      ))}
    </div>
  );
}
