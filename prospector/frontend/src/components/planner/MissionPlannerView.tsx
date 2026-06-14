"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Rocket, Activity, Settings, Calendar, Navigation } from "lucide-react";
import { getTrajectory, formatDeltaV, formatDays } from "@/services/api";

export function MissionPlannerView() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get("target") || "";
  
  const [target, setTarget] = useState(initialTarget);
  const [maxDeltaV, setMaxDeltaV] = useState(12);
  const [maxDuration, setMaxDuration] = useState(360);

  const { data: trajectory, isLoading } = useQuery({
    queryKey: ["trajectory", target],
    queryFn: () => getTrajectory(target).then((r) => r.data),
    enabled: !!target,
  });

  return (
    <div className="animate-fade-in pb-12 max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-secondary-500 hover:text-white font-mono text-[10px] uppercase tracking-widest mb-6 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        BACK TO DASHBOARD
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono border border-primary-500/30 text-primary-400 bg-space-950 px-2 py-0.5 uppercase tracking-widest">
              LOGISTICS SUBSYSTEM
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-1">
            Mission Planner
          </h1>
          <p className="text-secondary-500 font-mono text-sm tracking-widest">NHATS TRAJECTORY OPTIMIZATION</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left pane: Controls - 4 cols */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-space-900 border border-slate-700 p-0">
            <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">MISSION PARAMETERS</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] text-secondary-500 font-mono uppercase tracking-widest mb-2">
                  TARGET DESIGNATION (SPK-ID)
                </label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-space-950 border border-slate-700 text-white font-mono text-sm p-3 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="e.g., 433, 16, 2000 SG344"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] text-secondary-500 font-mono uppercase tracking-widest">
                    MAX DELTA-V (KM/S)
                  </label>
                  <span className="text-primary-400 font-mono text-xs">{maxDeltaV}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="20"
                  step="0.1"
                  value={maxDeltaV}
                  onChange={(e) => setMaxDeltaV(Number(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] text-secondary-500 font-mono uppercase tracking-widest">
                    MAX DURATION (DAYS)
                  </label>
                  <span className="text-primary-400 font-mono text-xs">{maxDuration}</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="1000"
                  step="10"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(Number(e.target.value))}
                  className="w-full accent-primary-500"
                />
              </div>

              <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-4">
                <Activity className="w-4 h-4" />
                COMPUTE TRAJECTORIES
              </button>
            </div>
          </div>
        </div>

        {/* Right pane: Results - 8 cols */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-space-900 border border-slate-700 p-0 flex-1">
            <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary-500" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">OPTIMAL LAUNCH WINDOWS</h3>
              </div>
              <span className="text-[10px] text-secondary-500 font-mono uppercase border border-slate-700 bg-space-950 px-2 py-0.5">NHATS API</span>
            </div>

            <div className="p-0">
              {!target ? (
                <div className="p-16 text-center text-secondary-500 font-mono text-sm border-b border-slate-700/50">
                  ENTER A TARGET DESIGNATION TO BEGIN ANALYSIS.
                </div>
              ) : isLoading ? (
                <div className="p-16 text-center text-primary-500 font-mono text-sm animate-pulse">
                  CALCULATING EPHEMERIDES...
                </div>
              ) : trajectory ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-space-950 border-b border-slate-700">
                      <th className="py-3 px-6 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Launch Date</th>
                      <th className="py-3 px-6 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Δv (km/s)</th>
                      <th className="py-3 px-6 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Total Duration</th>
                      <th className="py-3 px-6 text-[10px] font-mono text-secondary-500 uppercase tracking-widest font-normal">Outbound / Stay / Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-sm text-white">
                        {trajectory.launch_date || "N/A"}
                      </td>
                      <td className="py-4 px-6 font-mono text-sm text-primary-400">
                        {formatDeltaV(trajectory.min_delta_v)}
                      </td>
                      <td className="py-4 px-6 font-mono text-sm text-secondary-400">
                        {formatDays(trajectory.min_duration_days)}
                      </td>
                      <td className="py-4 px-6 font-mono text-sm text-secondary-500">
                        {trajectory.outbound_days}d / {trajectory.stay_days}d / {trajectory.return_days}d
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="p-16 text-center text-red-400 font-mono text-sm border-b border-slate-700/50">
                  NO VIABLE TRAJECTORIES FOUND WITHIN PARAMETERS.
                </div>
              )}
            </div>
            
            {/* Mission Timeline Visualization */}
            {trajectory && (
              <div className="p-6 bg-space-950 border-t border-slate-700">
                <div className="text-[10px] text-secondary-500 font-mono uppercase tracking-widest mb-4">MISSION PHASE TIMELINE</div>
                <div className="w-full flex h-8 bg-slate-800 border border-slate-700 rounded-sm overflow-hidden">
                   <div className="bg-primary-600 flex items-center justify-center text-[10px] font-mono text-white" style={{ width: `${(trajectory.outbound_days! / trajectory.min_duration_days!) * 100}%` }}>OUTBOUND</div>
                   <div className="bg-secondary-600 flex items-center justify-center text-[10px] font-mono text-white" style={{ width: `${(trajectory.stay_days! / trajectory.min_duration_days!) * 100}%` }}>STAY</div>
                   <div className="bg-slate-600 flex items-center justify-center text-[10px] font-mono text-white" style={{ width: `${(trajectory.return_days! / trajectory.min_duration_days!) * 100}%` }}>RETURN</div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-mono text-secondary-500">
                  <span>LAUNCH</span>
                  <span>EARTH RETURN</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
