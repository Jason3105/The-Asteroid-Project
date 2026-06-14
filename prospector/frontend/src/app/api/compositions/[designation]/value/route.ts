export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAsteroid } from "@/services/nasa/sbdbClient";
import { fullCompositionAnalysis } from "@/services/logic/compositionEstimator";

export async function GET(request: Request, { params }: { params: Promise<{ designation: string }> }) {
  try {
    const resolvedParams = await params;
    const designation = decodeURIComponent(resolvedParams.designation);
    if (!designation) return NextResponse.json({ error: "Missing designation" }, { status: 400 });

    const data = await getAsteroid(designation);
    if (!data) return NextResponse.json({ error: "Asteroid not found" }, { status: 404 });

    const phys = data.physical_params || {};

    const compData = fullCompositionAnalysis({
      spectralType: phys.spectral_type_tholen || phys.spectral_type_smass,
      absMagnitude: phys.abs_magnitude,
      diameterKm: phys.diameter_km,
      albedo: phys.albedo,
      density: phys.density,
    });

    return NextResponse.json({ data: compData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
