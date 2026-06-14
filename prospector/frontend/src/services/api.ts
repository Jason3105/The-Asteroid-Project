/**
 * PROSPECTOR API client
 * Connects to FastAPI backend at NEXT_PUBLIC_API_URL
 */
import axios from "axios";

const API_BASE = "/api";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Types ──────────────────────────────────────────────────────────
export interface OrbitalElements {
  epoch?: number;
  eccentricity?: number;
  semi_major_axis?: number;
  perihelion?: number;
  inclination?: number;
  long_asc_node?: number;
  arg_perihelion?: number;
  mean_anomaly?: number;
  period?: number;
  moid?: number;
}

export interface PhysicalParams {
  abs_magnitude?: number;
  diameter_km?: number;
  diameter_min_m?: number;
  diameter_max_m?: number;
  albedo?: number;
  density?: number;
  rotation_period_h?: number;
  spectral_type_tholen?: string;
  spectral_type_smass?: string;
}

export interface Asteroid {
  id: number;
  designation: string;
  full_name?: string;
  spkid?: string;
  is_neo: boolean;
  is_pha: boolean;
  orbit_class?: string;
  last_synced?: string;
  orbital_elements?: OrbitalElements;
  physical_params?: PhysicalParams;
}

export interface EvsScore {
  score?: number;
  accessibility_sub?: number;
  value_sub?: number;
  feasibility_sub?: number;
  estimated_value_usd?: number;
  mission_cost_usd?: number;
  roi_ratio?: number;
  computed_at?: string;
}

export interface EvsLeaderboardEntry {
  rank: number;
  designation: string;
  full_name?: string;
  orbit_class?: string;
  score: number;
  accessibility_sub?: number;
  value_sub?: number;
  feasibility_sub?: number;
  estimated_value_usd?: number;
  min_delta_v?: number;
  spectral_type?: string;
}

export interface EvsLeaderboard {
  total: number;
  entries: EvsLeaderboardEntry[];
}

export interface EvsStats {
  total_scored: number;
  avg_score: number;
  max_score: number;
  min_score: number;
  avg_estimated_value_usd?: number;
  total_estimated_value_usd?: number;
}

export interface Composition {
  water_pct: number;
  iron_pct: number;
  nickel_pct: number;
  cobalt_pct: number;
  platinum_pct: number;
  gold_pct: number;
  rare_earth_pct: number;
  silicate_pct: number;
  carbon_pct: number;
  confidence: number;
  method?: string;
}

export interface Trajectory {
  asteroid_designation: string;
  asteroid_full_name?: string;
  min_delta_v?: number;
  min_duration_days?: number;
  launch_date?: string;
  outbound_days?: number;
  stay_days?: number;
  return_days?: number;
  c3?: number;
  departure_v_inf?: number;
  n_viable_trajectories?: number;
  occ_code?: number;
}

export interface OrbitPoint {
  x: number;
  y: number;
  z: number;
}

// ── API Functions ──────────────────────────────────────────────────

// Asteroids
export const getAsteroids = (params?: { skip?: number; limit?: number; is_neo?: boolean }) =>
  api.get<{ total: number; asteroids: Asteroid[] }>("/asteroids", { params });

export const queryAsteroids = (params?: Record<string, any>) =>
  api.get("/asteroids/query", { params });

export const getCloseApproaches = (designation: string, params?: Record<string, any>) =>
  api.get(`/asteroids/${encodeURIComponent(designation)}/close-approaches`, { params });

export const getAsteroid = (designation: string) =>
  api.get<Asteroid>(`/asteroids/${encodeURIComponent(designation)}`);

export const searchAsteroids = (q: string) =>
  api.get<Array<{ designation: string; full_name: string; source: string }>>("/asteroids/search", {
    params: { q },
  });

export const getAsteroidOrbit = (designation: string, n_points = 360) =>
  api.get<{ designation: string; n_points: number; points: OrbitPoint[] }>(
    `/asteroids/${encodeURIComponent(designation)}/orbit`,
    { params: { n_points } }
  );

export const syncAsteroids = () => api.post("/asteroids/sync");

// EVS
export const getEvsLeaderboard = (params?: { limit?: number; skip?: number }) =>
  api.get<EvsLeaderboard>("/evs/leaderboard", { params });

export const getEvsStats = () => api.get<EvsStats>("/evs/stats");

export const getAsteroidEvs = (designation: string) =>
  api.get<EvsScore>(`/evs/${encodeURIComponent(designation)}`);

// Compositions
export const getComposition = (designation: string) =>
  api.get<Composition>(`/compositions/${encodeURIComponent(designation)}`);

export const getCompositionValue = (designation: string) =>
  api.get(`/compositions/${encodeURIComponent(designation)}/value`);

// Trajectories
export const getAccessibleAsteroids = () => api.get<Trajectory[]>("/trajectories/accessible");

export const getTrajectory = (designation: string) =>
  api.get<Trajectory>(`/trajectories/${encodeURIComponent(designation)}`);

// Market
export const getMarketPrices = () =>
  api.get<{ prices: Record<string, number> }>("/market/prices");

export const getMarketImpact = (designation: string) =>
  api.get(`/market/impact/${encodeURIComponent(designation)}`);

// Mission
export const createMissionPlan = (data: {
  designation: string;
  spacecraft_mass_kg?: number;
  payload_mass_kg?: number;
  launch_date?: string;
}) => api.post("/mission/plan", data);

// ── Formatters ─────────────────────────────────────────────────────
export const formatUSD = (value?: number): string => {
  if (value === undefined || value === null) return "N/A";
  if (value >= 1e21) return `$${(value / 1e21).toFixed(2)} sextillion`;
  if (value >= 1e18) return `$${(value / 1e18).toFixed(2)} quintillion`;
  if (value >= 1e15) return `$${(value / 1e15).toFixed(2)} quadrillion`;
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
};

export const formatDeltaV = (dv?: number): string =>
  dv !== undefined ? `${dv.toFixed(2)} km/s` : "N/A";

export const formatDays = (days?: number): string =>
  days !== undefined ? `${Math.round(days)} days` : "N/A";

export const getEvsColor = (score: number): string => {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
};

export const getSpectralColor = (type?: string): string => {
  if (!type) return "text-asteroid-400";
  const t = type.toUpperCase();
  if (t.startsWith("M")) return "text-blue-400";
  if (t.startsWith("C") || t.startsWith("B")) return "text-amber-400";
  if (t.startsWith("S")) return "text-green-400";
  if (t.startsWith("X")) return "text-purple-400";
  return "text-asteroid-400";
};
