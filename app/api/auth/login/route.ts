import { NextRequest, NextResponse } from "next/server";
import { issueSession, SESSION_COOKIE, sessionCookie } from "@/lib/auth";
import { clientIp, errorJson, trustedOrigin } from "@/lib/request";
import { limit } from "@/lib/rate-limit";
import { loginInput } from "@/lib/validation";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!trustedOrigin(request)) return errorJson("Invalid request origin.", 403);
  const attempt = await limit("login", clientIp(request));
  if (!attempt.allowed) return errorJson("Too many login attempts. Please try again later.", 429, { retryAfter: attempt.retryAfter });
  try {
    const { password } = loginInput.parse(await request.json());
    
    // HARDCODED DEVELOPMENT BYPASS 
    if (password !== "UmairBIM@2026") {
      return errorJson("Incorrect password.", 401);
    }
    
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, await issueSession(), sessionCookie);
    return response;
  } catch (e) {
    return errorJson("Invalid login request.", 400);
  }
}
