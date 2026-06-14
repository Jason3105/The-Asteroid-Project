const DV_MIN = 3.5;
const DV_MAX = 12.0;
const EVS_W1 = 0.30;
const EVS_W2 = 0.45;
const EVS_W3 = 0.25;
const MAX_KNOWN_VALUE_USD = 100_000_000_000_000; // 100 Trillion
const COST_PER_KG_TO_LEO = 2000.0;
const DAILY_OPS_RATE = 500_000.0;
const FIXED_OVERHEAD = 100_000_000.0;

export function computeAccessibilityScore(deltaV?: number): number {
  if (deltaV === undefined || deltaV === null) return 0.0;
  if (deltaV <= DV_MIN) return 100.0;
  if (deltaV >= DV_MAX) return 0.0;
  return 100.0 * (1.0 - (deltaV - DV_MIN) / (DV_MAX - DV_MIN));
}

export function computeResourceValueScore(estimatedValueUsd?: number): number {
  if (!estimatedValueUsd || estimatedValueUsd <= 0) return 0.0;
  try {
    const logValue = Math.log10(estimatedValueUsd);
    const logMax = Math.log10(MAX_KNOWN_VALUE_USD);
    const score = 100.0 * (logValue / logMax);
    return Math.max(0.0, Math.min(100.0, score));
  } catch (e) {
    return 0.0;
  }
}

export function computeFeasibilityScore({
  minDurationDays,
  occCode,
  rotationPeriodH,
  diameterKm,
}: {
  minDurationDays?: number;
  occCode?: number;
  rotationPeriodH?: number;
  diameterKm?: number;
}): number {
  let durationScore = 50.0;
  if (minDurationDays !== undefined && minDurationDays !== null) {
    if (minDurationDays <= 100) durationScore = 100.0;
    else if (minDurationDays >= 450) durationScore = 0.0;
    else durationScore = 100.0 * (1.0 - (minDurationDays - 100) / 350.0);
  }

  let occScore = 50.0;
  if (occCode !== undefined && occCode !== null) {
    occScore = Math.max(0.0, 100.0 - occCode * 11.0);
  }

  let spinScore = 50.0;
  if (rotationPeriodH !== undefined && rotationPeriodH !== null) {
    if (rotationPeriodH >= 2.0 && rotationPeriodH <= 24.0) spinScore = 100.0;
    else if (rotationPeriodH < 2.0) spinScore = Math.max(0.0, 50.0 * (rotationPeriodH / 2.0));
    else spinScore = Math.max(0.0, 100.0 - (rotationPeriodH - 24.0) * 2.0);
  }

  let sizeScore = 50.0;
  if (diameterKm !== undefined && diameterKm !== null) {
    if (diameterKm >= 0.1 && diameterKm <= 2.0) sizeScore = 100.0;
    else if (diameterKm < 0.1) sizeScore = Math.max(0.0, diameterKm * 1000.0);
    else sizeScore = Math.max(0.0, 100.0 - (diameterKm - 2.0) * 10.0);
  }

  const total = (25 * durationScore + 25 * occScore + 25 * spinScore + 25 * sizeScore) / 100.0;
  return Math.max(0.0, Math.min(100.0, total));
}

export function computeMissionCost(deltaV?: number, minDurationDays?: number, spacecraftMassKg = 5000.0): number {
  if (deltaV === undefined || deltaV === null) return FIXED_OVERHEAD;
  const deltaVFactor = Math.pow(deltaV / DV_MIN, 2);
  const launchCost = deltaVFactor * spacecraftMassKg * COST_PER_KG_TO_LEO;
  const opsCost = (minDurationDays || 200) * DAILY_OPS_RATE;
  return launchCost + opsCost + FIXED_OVERHEAD;
}

export function computeEvs({
  deltaV,
  estimatedValueUsd,
  minDurationDays,
  occCode,
  rotationPeriodH,
  diameterKm,
}: {
  deltaV?: number;
  estimatedValueUsd?: number;
  minDurationDays?: number;
  occCode?: number;
  rotationPeriodH?: number;
  diameterKm?: number;
}) {
  const accessibility = computeAccessibilityScore(deltaV);
  const resourceValue = computeResourceValueScore(estimatedValueUsd);
  const feasibility = computeFeasibilityScore({ minDurationDays, occCode, rotationPeriodH, diameterKm });

  const evs = (EVS_W1 * accessibility) + (EVS_W2 * resourceValue) + (EVS_W3 * feasibility);
  const missionCost = computeMissionCost(deltaV, minDurationDays);
  const roi = (estimatedValueUsd && missionCost > 0) ? (estimatedValueUsd / missionCost) : 0.0;

  return {
    score: Math.max(0.0, Math.min(100.0, evs)),
    accessibility_sub: accessibility,
    value_sub: resourceValue,
    feasibility_sub: feasibility,
    estimated_value_usd: estimatedValueUsd || 0.0,
    mission_cost_usd: missionCost,
    roi_ratio: roi,
  };
}
