import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

export function isAdminRequest(request: NextRequest): boolean {
  const key = process.env.ORDERS_ADMIN_KEY;
  if (!key) return false;

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;

  const a = Buffer.from(token);
  const b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b);
}
