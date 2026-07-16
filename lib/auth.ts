import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "umair_portfolio_admin";
const maxAge = 60 * 60 * 12;
const secret = () => {
  const key = process.env.AUTH_SECRET;
  if (!key || key.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(key);
};
export async function passwordMatches(value: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new Error("ADMIN_PASSWORD_HASH is not configured.");
  return bcrypt.compare(value, hash);
}
export async function issueSession() {
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${maxAge}s`).sign(secret());
}
export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try { return (await jwtVerify(token, secret())).payload.role === "admin"; } catch { return false; }
}
export async function requireAdmin() { if (!(await isAdmin())) throw new Error("UNAUTHORIZED"); }
export const sessionCookie = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge };
