import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : undefined;
const distributed = {
  login: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15 m"), prefix: "umair-ui:login" }) : undefined,
  contact: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(4, "10 m"), prefix: "umair-ui:contact" }) : undefined,
  // Multipart upload may legitimately require up to 10,000 signed parts for R2's maximum object size.
  upload: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(12000, "10 m"), prefix: "umair-ui:upload" }) : undefined,
} as const;
const memory = new Map<string, { count: number; reset: number }>();
export async function limit(kind: keyof typeof distributed, key: string) {
  if (distributed[kind]) { const result = await distributed[kind]!.limit(key); return { allowed: result.success, retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) }; }
  const now = Date.now(), max = kind === "login" ? 5 : kind === "contact" ? 4 : 12000, windowMs = kind === "login" ? 900000 : 600000;
  const mapKey = `${kind}:${key}`; let item = memory.get(mapKey);
  if (!item || item.reset < now) item = { count: 0, reset: now + windowMs };
  item.count += 1; memory.set(mapKey, item);
  return { allowed: item.count <= max, retryAfter: Math.max(1, Math.ceil((item.reset - now) / 1000)) };
}
