import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
function env(name: string) { const value = process.env[name]; if (!value) throw new Error(`${name} is not configured.`); return value; }
export const r2 = () => new S3Client({ region: "auto", endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`, credentials: { accessKeyId: env("R2_ACCESS_KEY_ID"), secretAccessKey: env("R2_SECRET_ACCESS_KEY") } });
export const bucket = () => env("R2_BUCKET");
export const publicUrl = (key: string) => `${env("R2_PUBLIC_BASE_URL").replace(/\/$/, "")}/${key}`;
export const keyFor = (name: string) => { const ext = name.toLowerCase().split(".").pop()?.replace(/[^a-z0-9]/g, "") || "bin"; return `portfolio/${randomUUID()}.${ext}`; };
