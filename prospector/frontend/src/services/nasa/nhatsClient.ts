export const NHATS_URL = "https://ssd-api.jpl.nasa.gov/nhats.api";

export async function getTrajectory(designation: string) {
  const url = new URL(NHATS_URL);
  url.searchParams.set("des", designation);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data.data || data.data.length === 0) return null;

  return parseTrajectoryData(data);
}

function safeFloat(val: any): number | undefined {
  if (val === null || val === undefined) return undefined;
  const num = parseFloat(val);
  return isNaN(num) ? undefined : num;
}

function parseTrajectoryData(raw: any) {
  // Simple mapping based on expected NHATS output
  return {
    asteroid_designation: raw.signature?.source || "Unknown",
    min_delta_v: safeFloat(raw.min_dv),
    min_duration_days: safeFloat(raw.min_dur),
    launch_date: raw.data?.[0]?.[0] || "Unknown", // taking first available
    outbound_days: safeFloat(raw.data?.[0]?.[1]),
    stay_days: safeFloat(raw.data?.[0]?.[2]),
    return_days: safeFloat(raw.data?.[0]?.[3]),
    c3: safeFloat(raw.data?.[0]?.[4]),
    n_viable_trajectories: raw.data?.length || 0,
    occ_code: raw.occ || 0,
  };
}
