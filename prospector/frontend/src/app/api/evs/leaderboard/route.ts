export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { queryAsteroids } from "@/services/nasa/sbdbClient";
import { fullCompositionAnalysis } from "@/services/logic/compositionEstimator";
import { computeEvs } from "@/services/logic/evsCalculator";
import { hohmannDeltaV } from "@/services/logic/orbitalMath";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Fetch a larger pool of NEOs from JPL to score
    const response = await queryAsteroids(true, undefined, 200, 0);
    const rawData = response.data || [];
    const fields = response.fields || [];

    const fieldIdx = (name: string) => fields.indexOf(name);
    const idxA = fieldIdx("a");
    const idxE = fieldIdx("e");
    const idxH = fieldIdx("H");
    const idxDiameter = fieldIdx("diameter");
    const idxAlbedo = fieldIdx("albedo");
    const idxClass = fieldIdx("class");
    const idxSpecB = fieldIdx("spec_B");
    const idxSpecT = fieldIdx("spec_T");
    const idxRot = fieldIdx("rot_per");
    const idxDes = fieldIdx("pdes");
    const idxFullName = fieldIdx("full_name");

    const entries = [];

    for (const row of rawData) {
      const a = parseFloat(row[idxA]);
      const e = parseFloat(row[idxE]);
      const H = parseFloat(row[idxH]);
      const diameter = parseFloat(row[idxDiameter]);
      const albedo = parseFloat(row[idxAlbedo]);
      const specType = row[idxSpecB] || row[idxSpecT] || null;
      const rot = parseFloat(row[idxRot]);

      // basic orbital delta V approximation (Earth a=1.0)
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
        minDurationDays: 200, // naive default
        occCode: 0, // naive default
        rotationPeriodH: isNaN(rot) ? undefined : rot,
        diameterKm: comp.diameter_km,
      });

      entries.push({
        designation: row[idxDes],
        full_name: row[idxFullName]?.trim(),
        orbit_class: row[idxClass],
        spectral_type: comp.spectral_class,
        min_delta_v: deltaV,
        ...evsData,
      });
    }

    // Sort by EVS Score descending
    entries.sort((a, b) => b.score - a.score);

    const topEntries = entries.slice(0, limit).map((e, idx) => ({ ...e, rank: idx + 1 }));

    return NextResponse.json({
      data: {
        entries: topEntries,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
