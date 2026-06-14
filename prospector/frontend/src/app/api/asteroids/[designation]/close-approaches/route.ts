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

    const parsedData = (data.data || []).map((row: any) => {
      // mapping CAD fields assuming standard order
      return {
        des: row[0],
        orbit_id: row[1],
        jd: row[2],
        cd: row[3], // close approach date
        dist: parseFloat(row[4]), // nominal distance in AU
        dist_min: parseFloat(row[5]),
        dist_max: parseFloat(row[6]),
        v_rel: parseFloat(row[7]), // relative velocity km/s
        v_inf: parseFloat(row[8]),
        t_sigma_f: row[9],
        h: row[10], // absolute magnitude
      };
    });

    return NextResponse.json({ data: parsedData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
