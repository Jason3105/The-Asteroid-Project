"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Zap, Weight, Ruler, Globe, RefreshCw } from "lucide-react";
import {
  getAsteroid,
  getAsteroidEvs,
  getCompositionValue,
  getTrajectory,
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

  if (aLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (!asteroid) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🔭</div>
        <h2 className="text-xl font-bold mb-2">Asteroid Not Found</h2>
        <p className="text-asteroid-400">"{designation}" is not in our database yet.</p>
        <Link href="/leaderboard" className="btn-secondary inline-flex mt-4">
          Back to Leaderboard
        </Link>
      </div>
    );
  }

  const phys = asteroid.physical_params;
  const orb = asteroid.orbital_elements;
  const spectralType = phys?.spectral_type_tholen || phys?.spectral_type_smass;

  return (
    <div className="animate-fade-in">
      {/* Back link */}
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-2 text-asteroid-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leaderboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {spectralType && (
              <span className={`badge font-mono font-bold text-sm ${getSpectralColor(spectralType)}`}>
                {spectralType}-type
              </span>
            )}
            {asteroid.is_neo && <span className="badge-electric">NEO</span>}
            {asteroid.is_pha && <span className="badge bg-red-500/20 text-red-300 border border-red-500/30">PHA</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
            {asteroid.full_name || asteroid.designation}
          </h1>
          <p className="text-asteroid-400 font-mono text-sm">{asteroid.designation}</p>
        </div>

        {evs && (
          <div className="glass-card p-6 text-center min-w-[160px]">
            <div className="text-xs text-asteroid-400 uppercase tracking-wider mb-1">EVS Score</div>
            <div className={`text-5xl font-black ${getEvsColor(evs.score || 0)}`}>
              {(evs.score || 0).toFixed(1)}
            </div>
            <div className="text-xs text-asteroid-400 mt-1">/ 100</div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EVS Breakdown */}
        {evs && (
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-solar-400" />
              EVS Breakdown
            </h2>
            <div className="space-y-4">
              {[
                { label: "Accessibility (30%)", value: evs.accessibility_sub, color: "bg-electric-500" },
                { label: "Resource Value (45%)", value: evs.value_sub, color: "bg-nebula-500" },
                { label: "Feasibility (25%)", value: evs.feasibility_sub, color: "bg-solar-500" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-asteroid-400">{label}</span>
                    <span className="font-mono font-bold">{(value || 0).toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${Math.min(100, value || 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-asteroid-400">Est. Value</span>
                <span className="text-green-400 font-mono">{formatUSD(evs.estimated_value_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asteroid-400">Mission Cost</span>
                <span className="text-red-400 font-mono">{formatUSD(evs.mission_cost_usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-asteroid-400">ROI</span>
                <span className="text-solar-400 font-mono">
                  {evs.roi_ratio ? `${evs.roi_ratio.toFixed(0)}×` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Physical Parameters */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-electric-400" />
            Physical Parameters
          </h2>
          {phys ? (
            <div className="space-y-3 text-sm">
              {[
                { label: "Diameter", value: phys.diameter_km ? `${phys.diameter_km.toFixed(2)} km` : "Est." },
                { label: "H Magnitude", value: phys.abs_magnitude?.toFixed(2) },
                { label: "Albedo", value: phys.albedo?.toFixed(3) },
                { label: "Density", value: phys.density ? `${phys.density.toFixed(2)} g/cm³` : null },
                { label: "Rotation", value: phys.rotation_period_h ? `${phys.rotation_period_h.toFixed(2)} h` : null },
                { label: "Spectral (Tholen)", value: phys.spectral_type_tholen },
                { label: "Spectral (SMASS)", value: phys.spectral_type_smass },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-asteroid-400">{label}</span>
                  <span className="font-mono text-white">{value ?? "N/A"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-asteroid-400 text-sm">Physical data not available.</p>
          )}
        </div>

        {/* Trajectory */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-nebula-400" />
            Trajectory & Access
          </h2>
          {trajectory ? (
            <div className="space-y-3 text-sm">
              {[
                { label: "Min Δv", value: formatDeltaV(trajectory.min_delta_v) },
                { label: "Min Duration", value: formatDays(trajectory.min_duration_days) },
                { label: "Launch Window", value: trajectory.launch_date || "N/A" },
                { label: "Outbound", value: trajectory.outbound_days ? `${trajectory.outbound_days} days` : null },
                { label: "Stay", value: trajectory.stay_days ? `${trajectory.stay_days} days` : null },
                { label: "Return", value: trajectory.return_days ? `${trajectory.return_days} days` : null },
                { label: "C3 Energy", value: trajectory.c3 ? `${trajectory.c3.toFixed(2)} km²/s²` : null },
                { label: "Viable Trajectories", value: trajectory.n_viable_trajectories?.toString() },
                { label: "OCC Code", value: trajectory.occ_code?.toString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-asteroid-400">{label}</span>
                  <span className="font-mono text-white">{value ?? "N/A"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-asteroid-400 text-sm">
              No NHATS trajectory data. This asteroid may not be accessible.
            </p>
          )}
        </div>
      </div>

      {/* Composition Value */}
      {compValue && (
        <div className="mt-6 glass-card p-6">
          <h2 className="text-base font-semibold mb-4">
            Mineral Composition & Value Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {Object.entries(compValue.breakdown || {})
              .sort(([, a]: any, [, b]: any) => b - a)
              .slice(0, 8)
              .map(([mineral, value]: any) => (
                <div key={mineral} className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-asteroid-400 uppercase mb-1 capitalize">{mineral}</div>
                  <div className="text-sm font-mono text-solar-400">{formatUSD(value)}</div>
                </div>
              ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="text-asteroid-400">Total Estimated Value</span>
            <span className="text-2xl font-black text-green-400">
              {formatUSD(compValue.total_value_usd)}
            </span>
          </div>
          {compValue.mass_kg && (
            <div className="text-xs text-asteroid-400 mt-1 text-right">
              Mass: {compValue.mass_kg.toExponential(2)} kg
            </div>
          )}
        </div>
      )}

      {/* Orbital Elements */}
      {orb && (
        <div className="mt-6 glass-card p-6">
          <h2 className="text-base font-semibold mb-4">Orbital Elements</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {[
              { label: "Semi-Major Axis (AU)", value: orb.semi_major_axis?.toFixed(4) },
              { label: "Eccentricity", value: orb.eccentricity?.toFixed(6) },
              { label: "Inclination (°)", value: orb.inclination?.toFixed(4) },
              { label: "MOID (AU)", value: orb.moid?.toFixed(6) },
              { label: "Period (days)", value: orb.period?.toFixed(2) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-asteroid-400 mb-1">{label}</div>
                <div className="font-mono text-white">{value ?? "N/A"}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href={`/asteroids/${encodeURIComponent(designation)}/orbit`}
              className="btn-secondary text-sm inline-flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              View 3D Orbit
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
