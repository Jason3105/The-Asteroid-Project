const DEFAULT_COMMODITY_PRICES: Record<string, number> = {
  water: 1000.0,
  iron: 0.1,
  nickel: 15.0,
  cobalt: 30.0,
  platinum: 30000.0,
  gold: 60000.0,
  rare_earth: 1000.0,
  silicate: 0.01,
  carbon: 0.05,
};

const DENSITY_BY_SPECTRAL_TYPE: Record<string, number> = {
  C: 1.38,
  S: 2.71,
  M: 5.32,
  X: 2.0,
  DEFAULT: 2.0,
};

const ALBEDO_BY_SPECTRAL_TYPE: Record<string, number> = {
  C: 0.05,
  S: 0.20,
  M: 0.15,
  X: 0.10,
  DEFAULT: 0.10,
};

const COMPOSITION_BY_SPECTRAL_TYPE: Record<string, any> = {
  C: { water_pct: 10, carbon_pct: 10, silicate_pct: 70, iron_pct: 10 },
  S: { silicate_pct: 80, iron_pct: 15, nickel_pct: 5 },
  M: { iron_pct: 88, nickel_pct: 10, cobalt_pct: 1, platinum_pct: 0.01, gold_pct: 0.001 },
  X: { iron_pct: 50, silicate_pct: 40, nickel_pct: 10 },
  DEFAULT: { silicate_pct: 90, iron_pct: 10 },
};

function getSpectralClass(spectralType?: string): string {
  if (!spectralType) return "DEFAULT";
  const s = spectralType.trim().toUpperCase();
  for (const key of Object.keys(COMPOSITION_BY_SPECTRAL_TYPE)) {
    if (s.startsWith(key)) return key;
  }
  return "DEFAULT";
}

export function estimateDiameterKm(absMagnitude: number, albedo: number): number {
  if (albedo <= 0 || albedo > 1) albedo = 0.10;
  return (1329.0 / Math.sqrt(albedo)) * Math.pow(10.0, -absMagnitude / 5.0);
}

export function estimateMassKg(diameterKm: number, densityGCm3: number): number {
  const radiusM = (diameterKm * 1000.0) / 2.0;
  const volumeM3 = (4.0 / 3.0) * Math.PI * Math.pow(radiusM, 3);
  const densityKgM3 = densityGCm3 * 1000.0;
  return volumeM3 * densityKgM3;
}

export function fullCompositionAnalysis({
  spectralType,
  absMagnitude,
  diameterKm,
  albedo,
  density,
}: {
  spectralType?: string;
  absMagnitude?: number;
  diameterKm?: number;
  albedo?: number;
  density?: number;
}) {
  const spectralClass = getSpectralClass(spectralType);
  const resolvedAlbedo = albedo || ALBEDO_BY_SPECTRAL_TYPE[spectralClass] || 0.10;

  let resolvedDiameter = diameterKm;
  if (!resolvedDiameter && absMagnitude !== undefined && absMagnitude !== null) {
    resolvedDiameter = estimateDiameterKm(absMagnitude, resolvedAlbedo);
  }

  const resolvedDensity = density || DENSITY_BY_SPECTRAL_TYPE[spectralClass] || 2.0;

  let massKg = 0.0;
  if (resolvedDiameter) {
    massKg = estimateMassKg(resolvedDiameter, resolvedDensity);
  }

  const composition = { ...COMPOSITION_BY_SPECTRAL_TYPE[spectralClass] };

  let totalValue = 0.0;
  const breakdown: Record<string, number> = {};

  const mapping: Record<string, string> = {
    water_pct: "water",
    iron_pct: "iron",
    nickel_pct: "nickel",
    cobalt_pct: "cobalt",
    platinum_pct: "platinum",
    gold_pct: "gold",
    rare_earth_pct: "rare_earth",
    silicate_pct: "silicate",
    carbon_pct: "carbon",
  };

  for (const [compKey, priceKey] of Object.entries(mapping)) {
    const pct = composition[compKey] || 0.0;
    const pricePerKg = DEFAULT_COMMODITY_PRICES[priceKey] || 0.0;
    const yieldKg = massKg * (pct / 100.0);
    const valUsd = yieldKg * pricePerKg;
    if (valUsd > 0) breakdown[priceKey] = valUsd;
    totalValue += valUsd;
  }

  return {
    composition,
    mass_kg: massKg,
    diameter_km: resolvedDiameter,
    density_g_cm3: resolvedDensity,
    albedo: resolvedAlbedo,
    spectral_class: spectralClass,
    total_value_usd: totalValue,
    breakdown,
  };
}
