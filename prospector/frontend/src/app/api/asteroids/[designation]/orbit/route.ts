export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAsteroid } from "@/services/nasa/sbdbClient";
import { orbitPoints } from "@/services/logic/orbitalMath";

export async function GET(request: Request, { params }: { params: Promise<{ designation: string }> }) {
  try {
    const resolvedParams = await params;
    const designation = decodeURIComponent(resolvedParams.designation);
    if (!designation) return NextResponse.json({ error: "Missing designation" }, { status: 400 });

    const data = await getAsteroid(designation);
    if (!data || !data.orbital_elements) {
      return NextResponse.json({ error: "Asteroid or orbital elements not found" }, { status: 404 });
    }

    const els = data.orbital_elements;
    if (
      els.semi_major_axis === undefined ||
      els.eccentricity === undefined ||
      els.inclination === undefined ||
      els.long_asc_node === undefined ||
      els.arg_perihelion === undefined
    ) {
      return NextResponse.json({ error: "Incomplete orbital elements" }, { status: 422 });
    }

    const points = orbitPoints(
      els.semi_major_axis,
      els.eccentricity,
      els.inclination,
      els.long_asc_node,
      els.arg_perihelion,
      360
    );

    return NextResponse.json({ data: points });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
