import { NextRequest, NextResponse } from "next/server";
import { getExportDeliveryCost } from "@/lib/fez-delivery";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exportLocationId, weightId } = body;

    if (!exportLocationId || !weightId) {
      return NextResponse.json(
        { error: "exportLocationId and weightId are required" },
        { status: 400 }
      );
    }

    const result = await getExportDeliveryCost(exportLocationId, weightId);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Export cost error:", e);
    return NextResponse.json(
      { error: "Failed to fetch export delivery cost" },
      { status: 500 }
    );
  }
}
