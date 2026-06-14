export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getCloseApproaches } from "@/services/nasa/cadClient";

export async function GET(request: Request, { params }: { params: Promise<{ designation: string }> }) {
  try {
    const resolvedParams = await params;
    const designation = decodeURIComponent(resolvedParams.designation);
    if (!designation) return NextResponse.json({ error: "Missing designation" }, { status: 400 });

    const data = await getCloseApproaches(designation);
    if (!data) return NextResponse.json({ error: "Failed to fetch CAD data" }, { status: 502 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
