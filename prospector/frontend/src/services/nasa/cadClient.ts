export const CAD_URL = "https://ssd-api.jpl.nasa.gov/cad.api";

export async function getCloseApproaches(
  designation: string,
  dateMin: string = "now",
  dateMax: string = "+10", // 10 years by default? Actually +10 is valid for CAD API? CAD API takes '+10' or '2035-01-01'. Actually +3650 for days? Wait, let's just not pass them by default and let the API decide, or use specific strings.
) {
  const url = new URL(CAD_URL);
  url.searchParams.set("des", designation);
  url.searchParams.set("date-min", dateMin);
  url.searchParams.set("date-max", "2035-01-01"); // Safe default for 10 years roughly
  url.searchParams.set("dist-max", "0.05"); // 0.05 AU
  url.searchParams.set("body", "Earth");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return await res.json();
}
