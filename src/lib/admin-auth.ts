import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

// ORDERS_ADMIN_KEY supports multiple comma-separated keys so each
// connected app (admin UI, Hermes, POS, ...) can have its own key.
export function isAdminRequest(request: NextRequest): boolean {
  const keys = (process.env.ORDERS_ADMIN_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (keys.length === 0) return false;

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;

  const a = Buffer.from(token);
  return keys.some((key) => {
    const b = Buffer.from(key);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}
