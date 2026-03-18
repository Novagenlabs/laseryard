import { NextResponse } from "next/server";
import { getExportLocations } from "@/lib/fez-delivery";

export async function GET() {
  try {
    const data = await getExportLocations();
    // Strip heavy int_price arrays -- client only needs id + name
    const locations = data.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
    }));
    return NextResponse.json({ locations });
  } catch (e) {
    console.error("Export locations error:", e);
    return NextResponse.json(
      { error: "Failed to fetch export locations" },
      { status: 500 }
    );
  }
}
