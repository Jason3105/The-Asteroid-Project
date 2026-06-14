"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Zap, Ruler, Globe, Activity, Database, Radar } from "lucide-react";
import {
  getAsteroid,
  getAsteroidEvs,
  getCompositionValue,
  getTrajectory,
  getCloseApproaches,
  formatUSD,
  formatDeltaV,
  formatDays,
  getEvsColor,
  getSpectralColor,
} from "@/services/api";

interface Props {
  designation: string;
}

export function AsteroidDetailView({ designation }: Props) {
  const { data: asteroid, isLoading: aLoading } = useQuery({
    queryKey: ["asteroid", designation],
    queryFn: () => getAsteroid(designation).then((r) => r.data),
  });

  const { data: evs } = useQuery({
    queryKey: ["evs", designation],
    queryFn: () => getAsteroidEvs(designation).then((r) => r.data),
    enabled: !!asteroid,
  });

  const { data: compValue } = useQuery({
    queryKey: ["composition-value", designation],
    queryFn: () => getCompositionValue(designation).then((r) => r.data),
    enabled: !!asteroid,
  });

  const { data: trajectory } = useQuery({
    queryKey: ["trajectory", designation],
    queryFn: () => getTrajectory(designation).then((r) => r.data),
    enabled: !!asteroid,
  });

  const { data: approaches } = useQuery({
    queryKey: ["approaches", designation],
    queryFn: () => getCloseApproaches(designation).then((r) => r.data),
    enabled: !!asteroid,
  });

  if (aLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-secondary-500 font-mono text-sm animate-pulse">ESTABLISHING UPLINK...</div>
      </div>
    );
  }

  if (!asteroid) {
    return (
      <div className="text-center py-16 font-mono">
        <h2 className="text-xl font-bold mb-2 text-white">404: TARGET NOT FOUND</h2>
        <p className="text-secondary-500 text-sm">"{designation}" DOES NOT EXIST IN SBDB.</p>
        <Link href="/dashboard" className="btn-secondary inline-flex mt-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO DASHBOARD
        </Link>
      </div>
    );
  }

  const phys = asteroid.physical_params;
  const orb = asteroid.orbital_elements;
  const spectralType = phys?.spectral_type_tholen || phys?.spectral_type_smass;

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
            {spectralType && (
              <span className={`text-[10px] font-mono border border-slate-700 bg-space-950 px-2 py-0.5 uppercase tracking-widest ${getSpectralColor(spectralType)}`}>
                {spectralType}-CLASS
              </span>
            )}
            {asteroid.is_neo && <span className="text-[10px] font-mono border border-primary-500/30 text-primary-400 bg-space-950 px-2 py-0.5 uppercase tracking-widest">NEO</span>}
            {asteroid.is_pha && <span className="text-[10px] font-mono border border-red-500/30 text-red-400 bg-space-950 px-2 py-0.5 uppercase tracking-widest">PHA</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-1">
            {asteroid.full_name || asteroid.designation}
          </h1>
          <p className="text-secondary-500 font-mono text-sm tracking-widest">SPK-ID: {asteroid.designation}</p>
        </div>

        <div className="flex gap-4">
          <Link
            href={`/planner?target=${encodeURIComponent(asteroid.designation)}`}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Activity className="w-4 h-4" />
            OPEN MISSION PLANNER
          </Link>
          <button 
            className="btn-secondary inline-flex items-center gap-2 text-sm"
            onClick={() => {
              fetch(`/api/asteroids/sync`, { method: "POST" })
                .then(r => r.json())
                .then(d => alert("Sync triggered: " + d.message))
                .catch(e => alert("Sync failed."));
            }}
          >
            <Database className="w-4 h-4" />
            SYNC SBDB
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* EVS Score Box */}
          {evs && (
            <div className="bg-space-900 border border-slate-700 p-0">
               <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Zap className="w-3 h-3 text-primary-500"/> EVS SCORE</h3>
               </div>
               <div className="p-6 flex flex-col items-center">
                  <div className={`text-6xl font-black tracking-tighter mb-2 ${getEvsColor(evs.score || 0)}`}>
                    {(evs.score || 0).toFixed(1)}
                  </div>
                  <div className="text-[10px] text-secondary-500 font-mono uppercase tracking-widest border border-slate-700 bg-space-950 px-2 py-1">ECONOMIC VIABILITY</div>
               </div>
               
               <div className="px-6 pb-6 space-y-3">
                {[
                  { label: "ACCESS", value: evs.accessibility_sub, color: "bg-primary-500" },
                  { label: "VALUE", value: evs.value_sub, color: "bg-secondary-400" },
                  { label: "FEASIBILITY", value: evs.feasibility_sub, color: "bg-white" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] mb-1 font-mono uppercase text-secondary-500">
                      <span>{label}</span>
                      <span className="text-white">{(value || 0).toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-[2px]">
                      <div
                        className={`${color} h-[2px] transition-all duration-700`}
                        style={{ width: `${Math.min(100, value || 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
               </div>
            </div>
          )}

          {/* Value Summary */}
          {compValue && (
            <div className="bg-space-900 border border-slate-700 p-0">
              <div className="bg-slate-800/50 p-3 border-b border-slate-700">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">VALUE ESTIMATION</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-[10px] text-secondary-500 font-mono uppercase mb-1">TOTAL EST. VALUE</div>
                  <div className="text-xl font-mono text-primary-400">{formatUSD(compValue.total_value_usd)}</div>
                </div>
                {evs && (
                  <>
                  <div>
                    <div className="text-[10px] text-secondary-500 font-mono uppercase mb-1">EST. MISSION COST</div>
                    <div className="text-sm font-mono text-secondary-400">{formatUSD(evs.mission_cost_usd)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-secondary-500 font-mono uppercase mb-1">ROI RATIO</div>
                    <div className="text-sm font-mono text-white">
                      {evs.roi_ratio ? `${evs.roi_ratio.toFixed(2)}×` : "N/A"}
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Center Column - 6 cols */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Trajectory / 3D Orbit Placeholder */}
          <div className="bg-space-900 border border-slate-700 p-0 flex flex-col h-full min-h-[400px]">
            <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Radar className="w-3 h-3 text-secondary-400"/> ORBITAL TRAJECTORY</h3>
              <span className="text-[10px] text-secondary-500 font-mono uppercase border border-slate-700 bg-space-950 px-2 py-0.5">3D VIEWER</span>
            </div>
            <div className="flex-1 relative bg-space-950 flex flex-col items-center justify-center p-6 text-center border-b border-slate-700">
               <Globe className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
               <div className="text-secondary-500 font-mono text-sm uppercase">TELEMETRY VISUALIZATION OFFLINE</div>
               <div className="text-slate-600 font-mono text-[10px] mt-2 max-w-xs">Connecting to JPL Horizons for ephemeris rendering...</div>
            </div>
            {/* Orbital Elements Row */}
            {orb && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-slate-700">
                {[
                  { label: "SEMI-MAJOR (AU)", value: orb.semi_major_axis?.toFixed(4) },
                  { label: "ECCENTRICITY", value: orb.eccentricity?.toFixed(6) },
                  { label: "INCLINATION (°)", value: orb.inclination?.toFixed(4) },
                  { label: "MOID (AU)", value: orb.moid?.toFixed(6) },
                  { label: "PERIOD (d)", value: orb.period?.toFixed(2) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-space-900 p-3">
                    <div className="text-[9px] text-secondary-500 font-mono mb-1">{label}</div>
                    <div className="font-mono text-xs text-white">{value ?? "N/A"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mineral Composition Bars */}
          {compValue && (
            <div className="bg-space-900 border border-slate-700 p-0">
               <div className="bg-slate-800/50 p-3 border-b border-slate-700">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">COMPOSITION BREAKDOWN</h3>
               </div>
               <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(compValue.breakdown || {})
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .map(([mineral, value]: any) => (
                    <div key={mineral}>
                      <div className="flex justify-between text-[10px] font-mono uppercase mb-1">
                        <span className="text-secondary-400">{mineral}</span>
                        <span className="text-primary-400">{formatUSD(value)}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-[2px]">
                        <div
                          className="bg-primary-500 h-[2px]"
                          style={{ width: `${Math.max(5, (value / compValue.total_value_usd) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Right Column - 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Physical Parameters */}
          <div className="bg-space-900 border border-slate-700 p-0">
            <div className="bg-slate-800/50 p-3 border-b border-slate-700">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Ruler className="w-3 h-3 text-secondary-400"/> PHYSICAL PARAMS</h3>
            </div>
            <div className="p-4 space-y-4">
              {phys ? (
                <>
                {[
                  { label: "DIAMETER", value: phys.diameter_km ? `${phys.diameter_km.toFixed(3)} km` : "Est." },
                  { label: "H-MAGNITUDE", value: phys.abs_magnitude?.toFixed(2) },
                  { label: "ALBEDO", value: phys.albedo?.toFixed(3) },
                  { label: "DENSITY", value: phys.density ? `${phys.density.toFixed(2)} g/cm³` : "N/A" },
                  { label: "ROTATION", value: phys.rotation_period_h ? `${phys.rotation_period_h.toFixed(2)} h` : "N/A" },
                ].map(({ label, value }) => (
                  <div key={label} className="border-b border-slate-800/50 pb-2">
                    <div className="text-[10px] text-secondary-500 font-mono mb-0.5">{label}</div>
                    <div className="font-mono text-sm text-white">{value ?? "N/A"}</div>
                  </div>
                ))}
                </>
              ) : (
                <p className="text-secondary-500 font-mono text-xs">NO PHYSICAL TELEMETRY.</p>
              )}
            </div>
          </div>

          {/* Close Approaches */}
          <div className="bg-space-900 border border-slate-700 p-0">
            <div className="bg-slate-800/50 p-3 border-b border-slate-700">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">CLOSE APPROACHES</h3>
            </div>
            <div className="p-4 space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar">
              {approaches && approaches.data && approaches.data.length > 0 ? (
                approaches.data.map((ca: any, idx: number) => (
                  <div key={idx} className="border-b border-slate-800/50 pb-2">
                    <div className="flex justify-between items-center text-[10px] text-secondary-500 font-mono mb-0.5">
                      <span>{ca[3]}</span>
                      <span className="text-primary-400">{ca[4]} AU</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span>V_rel: {ca[7]} km/s</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 font-mono text-xs">NO APPROACHES FOUND.</p>
              )}
            </div>
          </div>

          {/* NHATS Accessibility */}
          <div className="bg-space-900 border border-slate-700 p-0">
            <div className="bg-slate-800/50 p-3 border-b border-slate-700">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">NHATS DATA</h3>
            </div>
            <div className="p-4 space-y-4">
              {trajectory ? (
                 <>
                 {[
                  { label: "MIN DELTA-V", value: formatDeltaV(trajectory.min_delta_v), color: "text-primary-400" },
                  { label: "MIN DURATION", value: formatDays(trajectory.min_duration_days), color: "text-white" },
                  { label: "NEXT WINDOW", value: trajectory.launch_date || "N/A", color: "text-secondary-400" },
                  { label: "OUTBOUND", value: trajectory.outbound_days ? `${trajectory.outbound_days} d` : "N/A", color: "text-white" },
                  { label: "STAY", value: trajectory.stay_days ? `${trajectory.stay_days} d` : "N/A", color: "text-white" },
                  { label: "RETURN", value: trajectory.return_days ? `${trajectory.return_days} d` : "N/A", color: "text-white" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                    <span className="text-[10px] text-secondary-500 font-mono">{label}</span>
                    <span className={`font-mono text-xs ${color}`}>{value ?? "N/A"}</span>
                  </div>
                ))}
                 </>
              ) : (
                 <p className="text-secondary-500 font-mono text-xs">NO ACCESSIBLE WINDOWS.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
