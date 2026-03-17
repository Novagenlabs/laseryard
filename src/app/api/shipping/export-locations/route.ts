import { NextResponse } from "next/server";
import { getExportLocations } from "@/lib/fez-delivery";

export async function GET() {
  try {
    const data = await getExportLocations();
    return NextResponse.json(data);
  } catch (e) {
    console.error("Export locations error:", e);
    return NextResponse.json(
      { error: "Failed to fetch export locations" },
      { status: 500 }
    );
  }
}
