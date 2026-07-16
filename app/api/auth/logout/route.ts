import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookie } from "@/lib/auth";
import { errorJson, trustedOrigin } from "@/lib/request";
export async function POST(request: NextRequest) {
  if (!trustedOrigin(request)) return errorJson("Invalid request origin.", 403);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookie, maxAge: 0 });
  return response;
}
