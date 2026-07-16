import { z } from "zod";
const allowed = new Set([
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml", "image/bmp",
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip"
]);
export const loginInput = z.object({ password: z.string().min(1).max(256) });
export const contentInput = z.record(z.string(), z.unknown()).refine((value) => JSON.stringify(value).length <= 2 * 1024 * 1024, "Portfolio content is too large. Files must be uploaded to cloud storage, not embedded in data.");
export const uploadInput = z.object({ fileName: z.string().trim().min(1).max(180), contentType: z.string().refine((type) => allowed.has(type), "File type is not allowed."), size: z.number().int().positive().max(5 * 1024 * 1024 * 1024 * 1024) });
const key = z.string().regex(/^portfolio\/[a-z0-9-]+\.[a-z0-9]+$/);
export const partInput = z.object({ key, uploadId: z.string().min(10).max(500), partNumber: z.number().int().min(1).max(10000) });
export const completeInput = z.object({ key, uploadId: z.string().min(10).max(500), parts: z.array(z.object({ ETag: z.string().min(1), PartNumber: z.number().int().min(1).max(10000) })).min(1).max(10000) });
export const abortInput = z.object({ key, uploadId: z.string().min(10).max(500) });
export const contactInput = z.object({ name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(254), subject: z.string().trim().max(180), message: z.string().trim().min(1).max(5000), website: z.string().max(0).optional() });
