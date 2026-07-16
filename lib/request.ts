import { createHash } from "crypto";
import { NextRequest } from "next/server";

export const clientIp = (request: NextRequest) => request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
export const ipHash = (ip: string) => createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET || "local"}`).digest("hex");
export function trustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  return origin === configured || origin === request.nextUrl.origin;
}
export const errorJson = (error: string, status: number, additional: Record<string, unknown> = {}) => Response.json({ error, ...additional }, { status, headers: { "Cache-Control": "no-store" } });
