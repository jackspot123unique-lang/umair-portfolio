import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import defaults from "@/lib/default-portfolio.json";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorJson, trustedOrigin } from "@/lib/request";
import { contentInput } from "@/lib/validation";
export const runtime = "nodejs";
export async function GET() {
  try {
    const record = await prisma.portfolio.findUnique({ where: { id: "main" } });
    return Response.json({ content: record?.content ?? defaults }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // Keep the original public portfolio visible even if a managed DB is temporarily unavailable.
    return Response.json({ content: defaults, fallback: true }, { headers: { "Cache-Control": "no-store" } });
  }
}
export async function PATCH(request: NextRequest) {
  if (!trustedOrigin(request)) return errorJson("Invalid request origin.", 403);
  try {
    await requireAdmin();
    const content = contentInput.parse(await request.json()) as Prisma.InputJsonValue;
    const saved = await prisma.portfolio.upsert({ where: { id: "main" }, update: { content }, create: { id: "main", content } });
    return Response.json({ content: saved.content, updatedAt: saved.updatedAt });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return errorJson("Admin sign-in is required.", 401);
    return errorJson("Portfolio could not be saved. Check the database and content fields.", 400);
  }
}
