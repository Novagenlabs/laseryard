import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/**
 * Serve the design brief form from an app route rather than relying on the
 * standalone build's public-directory copy. Reading the file here makes the
 * output tracer bundle it with the server (the same mechanism that keeps
 * public/emails/design-link.html available), so laseryard.com/design cannot
 * 404 even when the public copy step misbehaves — which it did in
 * production on 2026-08-14.
 */
export async function GET() {
  try {
    const html = await readFile(
      path.join(process.cwd(), "public", "design", "index.html"),
      "utf8"
    );
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    console.error("design form serve error:", e);
    return NextResponse.json({ error: "Form unavailable" }, { status: 500 });
  }
}
