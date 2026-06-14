export const SBDB_URL = "https://ssd-api.jpl.nasa.gov/sbdb.api";
export const SBDB_QUERY_URL = "https://ssd-api.jpl.nasa.gov/sbdb_query.api";

export async function getAsteroid(designation: string) {
  const url = new URL(SBDB_URL);
  url.searchParams.set("sstr", designation);
  url.searchParams.set("cov", "0");
  url.searchParams.set("phys-par", "1");
  url.searchParams.set("full-prec", "0");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data.object) {
    return parseAsteroidData(data);
  }
  return null;
}

export async function queryAsteroids(isNeo = true, orbitClass?: string, limit = 100, offset = 0) {
  const fields = "spkid,full_name,pdes,name,prefix,neo,pha,class,e,a,q,i,om,w,ma,per,moid,H,diameter,albedo,spec_B,spec_T,rot_per";
  const url = new URL(SBDB_QUERY_URL);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("limit-from", offset.toString());

  if (isNeo) url.searchParams.set("sb-group", "neo");
  if (orbitClass) url.searchParams.set("sb-class", orbitClass);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return { count: 0, data: [], fields: [] };
  return await res.json();
}

function safeFloat(val: any): number | undefined {
  if (val === null || val === undefined) return undefined;
  const num = parseFloat(val);
  return isNaN(num) ? undefined : num;
}

export function parseAsteroidData(raw: any) {
  const result: any = {};
  const obj = raw.object || {};

  result.designation = obj.des || "";
  result.full_name = obj.fullname || "";
  result.spkid = String(obj.spkid || "");
  result.is_neo = obj.neo === "Y";
  result.is_pha = obj.pha === "Y";
  result.orbit_class = typeof obj.orbit_class === "object" ? obj.orbit_class?.code || "" : "";

  const orbit = raw.orbit || {};
  const elements = orbit.elements || [];
  const elemMap: Record<string, any> = {};
  elements.forEach((e: any) => { if (e.name) elemMap[e.name] = e.value; });

  result.orbital_elements = {
    epoch: safeFloat(orbit.epoch),
    eccentricity: safeFloat(elemMap.e),
    semi_major_axis: safeFloat(elemMap.a),
    perihelion: safeFloat(elemMap.q),
    inclination: safeFloat(elemMap.i),
    long_asc_node: safeFloat(elemMap.om),
    arg_perihelion: safeFloat(elemMap.w),
    mean_anomaly: safeFloat(elemMap.ma),
    period: safeFloat(elemMap.per),
    moid: safeFloat(orbit.moid),
  };

  const phys = raw.phys_par || [];
  const physMap: Record<string, any> = {};
  phys.forEach((p: any) => { if (p.name) physMap[p.name] = p.value; });

  result.physical_params = {
    abs_magnitude: safeFloat(physMap.H),
    diameter_km: safeFloat(physMap.diameter),
    albedo: safeFloat(physMap.albedo),
    density: safeFloat(physMap.density),
    rotation_period_h: safeFloat(physMap.rot_per),
    spectral_type_tholen: physMap.spec_T,
    spectral_type_smass: physMap.spec_B,
  };

  return result;
}
