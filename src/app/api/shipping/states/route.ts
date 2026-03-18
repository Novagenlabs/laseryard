import { NextResponse } from "next/server";
import { getStates } from "@/lib/fez-delivery";

export async function GET() {
  try {
    const states = await getStates();
    return NextResponse.json({ states });
  } catch (e) {
    console.error("Shipping states error:", e);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 }
    );
  }
}
