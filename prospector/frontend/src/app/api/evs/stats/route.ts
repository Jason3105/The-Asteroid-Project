export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { queryAsteroids } from "@/services/nasa/sbdbClient";
import { fullCompositionAnalysis } from "@/services/logic/compositionEstimator";
import { computeEvs } from "@/services/logic/evsCalculator";
import { hohmannDeltaV } from "@/services/logic/orbitalMath";

export async function GET() {
  try {
    // Fetch a sample pool of NEOs to calculate aggregate stats
    const response = await queryAsteroids(true, undefined, 200, 0);
    const rawData = response.data || [];
    const fields = response.fields || [];

    const fieldIdx = (name: string) => fields.indexOf(name);
    const idxA = fieldIdx("a");
    const idxH = fieldIdx("H");
    const idxDiameter = fieldIdx("diameter");
    const idxAlbedo = fieldIdx("albedo");
    const idxSpecB = fieldIdx("spec_B");
    const idxSpecT = fieldIdx("spec_T");
    const idxRot = fieldIdx("rot_per");

    let totalScore = 0;
    let maxScore = 0;
    let totalValue = 0;
    let scoredCount = 0;

    for (const row of rawData) {
      const a = parseFloat(row[idxA]);
      const H = parseFloat(row[idxH]);
      const diameter = parseFloat(row[idxDiameter]);
      const albedo = parseFloat(row[idxAlbedo]);
      const specType = row[idxSpecB] || row[idxSpecT] || null;
      const rot = parseFloat(row[idxRot]);

      let deltaV = null;
      if (!isNaN(a) && a > 0) {
        deltaV = hohmannDeltaV(1.0, a);
      }

      const comp = fullCompositionAnalysis({
        spectralType: specType,
        absMagnitude: isNaN(H) ? undefined : H,
        diameterKm: isNaN(diameter) ? undefined : diameter,
        albedo: isNaN(albedo) ? undefined : albedo,
      });

      const evsData = computeEvs({
        deltaV: deltaV || undefined,
        estimatedValueUsd: comp.total_value_usd,
        minDurationDays: 200,
        occCode: 0,
        rotationPeriodH: isNaN(rot) ? undefined : rot,
        diameterKm: comp.diameter_km,
      });

      scoredCount++;
      totalScore += evsData.score;
      if (evsData.score > maxScore) maxScore = evsData.score;
      totalValue += comp.total_value_usd || 0;
    }

    const avgScore = scoredCount > 0 ? totalScore / scoredCount : 0;

    return NextResponse.json({
      data: {
        total_scored: scoredCount,
        avg_score: avgScore,
        max_score: maxScore,
        total_estimated_value_usd: totalValue,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
