export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getTrajectory } from "@/services/nasa/nhatsClient";

export async function GET(request: Request, { params }: { params: Promise<{ designation: string }> }) {
  try {
    const resolvedParams = await params;
    const designation = decodeURIComponent(resolvedParams.designation);
    if (!designation) return NextResponse.json({ error: "Missing designation" }, { status: 400 });

    const data = await getTrajectory(designation);
    if (!data) return NextResponse.json({ error: "Trajectory not found in NHATS" }, { status: 404 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
