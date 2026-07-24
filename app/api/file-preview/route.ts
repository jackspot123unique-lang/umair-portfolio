import { NextRequest } from "next/server";

export const runtime = "nodejs";

function allowedFileUrl(raw: string) {
  const url = new URL(raw);
  const configured = process.env.R2_PUBLIC_BASE_URL;
  if (configured && url.origin === new URL(configured).origin) return url;
  // Supports the existing R2 public/custom domains when an explicit public base was not set.
  if (url.protocol === "https:" && (url.hostname.endsWith(".r2.dev") || url.hostname.includes("r2.cloudflarestorage.com"))) return url;
  throw new Error("Preview URL is not an allowed storage URL.");
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) return Response.json({ error: "Missing preview URL." }, { status: 400 });
  try {
    const url = allowedFileUrl(raw);
    const range = request.headers.get("range");
    const upstream = await fetch(url, range ? { headers: { Range: range } } : undefined);
    if (!upstream.ok && upstream.status !== 206) return Response.json({ error: "File could not be loaded for preview." }, { status: upstream.status });
    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "application/pdf");
    headers.set("Cache-Control", "private, max-age=300");
    const length = upstream.headers.get("content-length");
    const contentRange = upstream.headers.get("content-range");
    if (length) headers.set("Content-Length", length);
    if (contentRange) headers.set("Content-Range", contentRange);
    headers.set("Accept-Ranges", "bytes");
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Preview unavailable." }, { status: 400 });
  }
}
