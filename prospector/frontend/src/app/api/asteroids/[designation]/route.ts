export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getAsteroid } from "@/services/nasa/sbdbClient";

export async function GET(request: Request, { params }: { params: Promise<{ designation: string }> }) {
  try {
    const resolvedParams = await params;
    const designation = decodeURIComponent(resolvedParams.designation);
    if (!designation) {
      return NextResponse.json({ error: "Missing designation" }, { status: 400 });
    }

    const data = await getAsteroid(designation);
    if (!data) {
      return NextResponse.json({ error: "Asteroid not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
