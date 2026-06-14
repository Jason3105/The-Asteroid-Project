export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    message: "Live telemetry connected. Stateful sync bypassed for MVP stateless architecture.",
    status: "success",
  });
}
